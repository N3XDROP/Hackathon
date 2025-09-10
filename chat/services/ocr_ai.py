import re
import fitz  # PyMuPDF
import numpy as np
import cv2
import easyocr
import pytesseract

# === Ruta de Tesseract (si tu venv no hereda PATH) ===
# Si ya está en PATH, comenta esta línea.
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# === Inicializa OCR general (ES + EN) una sola vez ===
# Cambia a gpu=True si ya instalaste PyTorch con CUDA.
_READER = easyocr.Reader(['es', 'en'], gpu=False)

# -----------------------------------------------------
# Preprocesado y OCR general (EasyOCR)
# -----------------------------------------------------
def _preprocess_bgr(bgr):
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 9, 75, 75)
    _, th = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return th

def _ocr_easy_ndarray(img_bgr) -> str:
    img = _preprocess_bgr(img_bgr)
    lines = _READER.readtext(img, detail=0, paragraph=True)
    return "\n".join(lines).strip()

# -----------------------------------------------------
# Conversión PDF -> imágenes (numpy)
# -----------------------------------------------------
def _pdf_to_png_ndarrays(pdf_path: str, dpi: int = 320, max_pages: int = 3):
    arrs = []
    with fitz.open(pdf_path) as doc:
        n = min(max_pages, doc.page_count)
        for i in range(n):
            pix = doc[i].get_pixmap(dpi=dpi)
            png_bytes = pix.tobytes("png")
            arr = cv2.imdecode(np.frombuffer(png_bytes, np.uint8), cv2.IMREAD_COLOR)
            if arr is not None:
                arrs.append(arr)
    return arrs

# -----------------------------------------------------
# OCR general (imagen o PDF)
# -----------------------------------------------------
def ocr_imagen_path(path: str) -> str:
    bgr = cv2.imread(path)
    if bgr is None:
        return ""
    return _ocr_easy_ndarray(bgr)

def ocr_pdf_path(pdf_path: str) -> str:
    arrs = _pdf_to_png_ndarrays(pdf_path, dpi=320, max_pages=3)
    texts = [_ocr_easy_ndarray(arr) for arr in arrs]
    return "\n".join(texts).strip()

def extraer_texto_documento(path: str) -> str:
    ext = path.rsplit(".", 1)[-1].lower()
    return ocr_pdf_path(path) if ext == "pdf" else ocr_imagen_path(path)

# =====================================================
#               OCR especializado MRZ (Tesseract)
# =====================================================
def _tesseract_mrz(img_gray) -> str:
    """
    OCR para MRZ probando dos modos (línea/bloque) con whitelist.
    Importante: NO transformar O->0 aquí para no romper 'COL'.
    """
    base = '-c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ<0123456789'
    txt = pytesseract.image_to_string(img_gray, lang="eng", config=f'--oem 3 --psm 7 {base}')
    if len(txt.strip()) < 10:
        txt = pytesseract.image_to_string(img_gray, lang="eng", config=f'--oem 3 --psm 6 {base}')
    return txt.replace('|', 'I').upper()

def _enhance_for_mrz(g):
    g = cv2.equalizeHist(g)
    _, th = cv2.threshold(g, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    k = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    return cv2.morphologyEx(th, cv2.MORPH_CLOSE, k, iterations=1)

def ocr_mrz_from_bgr(bgr) -> str:
    """
    Busca la MRZ en imágenes de anverso+reverso (dos caras apiladas).
    Explora la MITAD INFERIOR y varias bandas; prueba rotaciones y reescalado.
    """
    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    def _score(t: str) -> int:
        s = t.count('<')
        if 'COL' in t or 'C0L' in t:
            s += 5
        return s

    candidates = []

    # Trabaja sobre la MITAD INFERIOR (donde suele estar el reverso y la MRZ)
    half = gray[int(h * 0.50):h, 0:w]
    hh, ww = half.shape[:2]

    # Toma bandas del fondo de esa mitad
    for frac_top in (0.55, 0.65, 0.72, 0.78):  # relativo a la mitad-inferior
        y0 = int(hh * frac_top)
        roi = half[y0:hh, 0:ww]

        roi_enh = _enhance_for_mrz(roi)
        candidates.append(_tesseract_mrz(roi_enh))

        # Rotaciones 90/180/270 sobre esa ROI mejorada
        for k in (1, 2, 3):
            rot = np.rot90(roi_enh, k)
            candidates.append(_tesseract_mrz(rot))

        # Reescalado por si está pequeña la MRZ
        roi_big = cv2.resize(roi_enh, None, fx=1.6, fy=1.6, interpolation=cv2.INTER_CUBIC)
        candidates.append(_tesseract_mrz(roi_big))

    return max(candidates, key=_score) if candidates else ""

def extraer_mrz_texto(path: str) -> str:
    """
    Recorre hasta 3 páginas del PDF y devuelve el mejor candidato (más '<').
    Para imágenes, hace una sola pasada.
    """
    ext = path.rsplit(".", 1)[-1].lower()
    if ext == "pdf":
        texts = []
        arrs = _pdf_to_png_ndarrays(path, dpi=340, max_pages=3)
        for arr in arrs:
            if arr is not None:
                texts.append(ocr_mrz_from_bgr(arr) or "")
        return max(texts, key=lambda t: t.count('<')) if texts else ""
    else:
        bgr = cv2.imread(path)
        if bgr is None:
            return ""
        return ocr_mrz_from_bgr(bgr) or ""

# -----------------------------------------------------
# Helpers MRZ: validación, fallback y parsing
# -----------------------------------------------------
def _is_valid_mrz(txt: str) -> bool:
    """MRZ útil: suficientes '<' y algún patrón numérico (COL+dígitos o muchos dígitos)."""
    if not txt:
        return False
    t = txt.upper()
    if t.count('<') < 4:
        return False
    if re.search(r'C[O0]L\d{6,12}', t):
        return True
    if re.search(r'\d{6,}', t):
        return True
    return False

def mrz_desde_texto_ocr(ocr_text: str) -> str:
    """
    Reconstruye MRZ a partir del texto OCR plano (EasyOCR).
    Busca líneas con muchos '<' y arma 1–2 renglones consecutivos.
    """
    if not ocr_text:
        return ""
    t = ocr_text.replace('\u003c', '<').upper()
    lines = [ln.strip() for ln in t.splitlines() if ln.strip()]

    cand = [ln for ln in lines if ln.count('<') >= 4]
    if not cand:
        return ""

    def score(ln: str):
        s = ln.count('<')
        if 'COL' in ln or 'C0L' in ln:
            s += 5
        return s

    cand.sort(key=score, reverse=True)
    best = cand[0]
    idx = lines.index(best)
    mrz_lines = [best]

    # Intenta juntar línea adyacente con '<'
    if idx + 1 < len(lines) and lines[idx + 1].count('<') >= 4:
        mrz_lines.append(lines[idx + 1])
    elif idx - 1 >= 0 and lines[idx - 1].count('<') >= 4:
        mrz_lines.insert(0, lines[idx - 1])

    return "\n".join(mrz_lines)

# ---- Parsing de campos desde MRZ ----
_DIGITS = re.compile(r'\d{6,12}')
_COL_ID = re.compile(r'C[O0]L(\d{6,12})')  # acepta COL y C0L

def parse_nuip_from_mrz(mrz_text: str) -> str | None:
    """NUIP desde MRZ: prioriza COL/C0L+digits; si no, el número más largo (6–12 dígitos)."""
    if not mrz_text:
        return None
    t = mrz_text.upper().replace('|', 'I')
    m = _COL_ID.search(t)
    if m:
        return m.group(1)
    nums = _DIGITS.findall(t)
    if not nums:
        return None
    nums.sort(key=len, reverse=True)
    return nums[0]

def canonicalizar_nuip(nuip: str | None) -> str:
    """Normaliza NUIP dejando solo dígitos (quita puntos/ruidos)."""
    return re.sub(r'\D', '', nuip or '')

# --- Pretty print español para nombres ---
_SP_LOWER = {"de", "del", "la", "las", "los", "y", "e", "da", "do", "dos"}
def _title_case_es(s: str) -> str:
    parts = [p for p in (s or "").strip().lower().split() if p]
    out = []
    for w in parts:
        out.append(w if w in _SP_LOWER else (w[:1].upper() + w[1:]))
    return " ".join(out)

def parse_names_from_mrz(mrz_text: str):
    """
    Devuelve (apellidos, nombres) a partir de la línea con '<<'.
    Reemplaza '<' por espacio, limpia números y 'COL/C0L', y aplica title-case.
    """
    if not mrz_text:
        return None, None
    lines = [l.strip().upper() for l in mrz_text.splitlines() if l.strip()]
    if not lines:
        return None, None

    with_sep = [l for l in lines if '<<' in l]
    name_line = with_sep[-1] if with_sep else lines[-1]
    parts = name_line.split('<<')
    if len(parts) < 2:
        return None, None

    raw_apellidos = parts[0].replace('<', ' ').strip()
    raw_nombres = parts[1].replace('<', ' ').strip()

    def _clean(s):
        s = s.replace(' C0L ', ' ').replace(' COL ', ' ')
        s = ''.join(ch for ch in s if (ch.isalpha() or ch.isspace()))
        return ' '.join(s.split())

    apellidos = _title_case_es(_clean(raw_apellidos))
    nombres = _title_case_es(_clean(raw_nombres))
    return (apellidos or None), (nombres or None)

def parse_birth_from_mrz(mrz_text: str) -> str | None:
    """
    Busca patrones YYMMDD en MRZ. Valida mes/día y mapea año a 19xx/20xx:
    >=30 -> 1900s; <30 -> 2000s. Devuelve 'YYYY-MM-DD'.
    """
    if not mrz_text:
        return None
    t = mrz_text.upper().replace('|', 'I')
    cand = re.findall(r'\b(\d{6})\b', t)

    def _valid_iso(yyMMdd: str) -> str | None:
        yy = int(yyMMdd[0:2])
        mm = int(yyMMdd[2:4])
        dd = int(yyMMdd[4:6])
        if not (1 <= mm <= 12 and 1 <= dd <= 31):
            return None
        year = 1900 + yy if yy >= 30 else 2000 + yy
        return f"{year:04d}-{mm:02d}-{dd:02d}"

    for c in cand:
        iso = _valid_iso(c)
        if iso:
            return iso
    return None
