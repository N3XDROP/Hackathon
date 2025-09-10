import os
import re
import shutil
from typing import Dict, List, Optional

from flask import Blueprint, jsonify, request, session, send_file
from werkzeug.utils import secure_filename

from auth import login_required, role_required

# ------------------------ Blueprint -------------------------
analizar_bp = Blueprint("analizar", __name__, url_prefix="/api")

# -------------------- Constantes y paths --------------------
UPLOAD_ROOT = os.path.join(os.getcwd(), "uploads")
STATES = ("pendientes", "revisados", "validados")
META_DIR = os.path.join(UPLOAD_ROOT, "meta")

# -------------------- Utilidades básicas --------------------
def ensure_dirs() -> None:
    """Crea la estructura base de carpetas si no existe."""
    os.makedirs(UPLOAD_ROOT, exist_ok=True)
    os.makedirs(META_DIR, exist_ok=True)
    for s in STATES:
        os.makedirs(os.path.join(UPLOAD_ROOT, s), exist_ok=True)

def user_dir(user_id: str, state: str) -> str:
    """Devuelve (y crea si hace falta) la carpeta de un usuario en un estado."""
    d = os.path.join(UPLOAD_ROOT, state, str(user_id))
    os.makedirs(d, exist_ok=True)
    return d

def set_user_email_meta(user_id: str, email: str) -> None:
    """Guarda el email del usuario para mostrarlo en listados de Admin/Comité."""
    ensure_dirs()
    with open(os.path.join(META_DIR, f"{user_id}.txt"), "w", encoding="utf-8") as f:
        f.write(email or "")

def get_user_email_meta(user_id: str) -> str:
    """Lee el email del usuario; si no existe, devuelve un alias neutro."""
    p = os.path.join(META_DIR, f"{user_id}.txt")
    if os.path.exists(p):
        try:
            return open(p, "r", encoding="utf-8").read().strip() or f"user_{user_id}"
        except Exception:
            return f"user_{user_id}"
    return f"user_{user_id}"

# -------------------- Nombres y tipos de doc ----------------
HEX_RE = re.compile(r"^[0-9a-f]{16,}$", re.IGNORECASE)

def clean_original_name(fname: str) -> str:
    """
    Si el archivo viene como '<hash>_NombreOriginal.pdf', devuelve 'NombreOriginal.pdf'.
    Si ya viene como 'campo__Nombre.pdf' lo deja igual.
    """
    # Mantén primero el formato 'campo__archivo'
    if "__" in fname:
        return fname.split("__", 1)[1] if fname.count("__") >= 1 else fname

    parts = fname.split("_", 1)
    if len(parts) == 2 and HEX_RE.match(parts[0]):
        return parts[1]
    return fname

def infer_doc_type(name: str) -> str:
    n = name.lower()
    if "rut" in n: return "RUT"
    if "cámara" in n or "camara" in n: return "Cámara de Comercio"
    if "cédula" in n or "cedula" in n or "nuip" in n: return "Cédula"
    if "contralor" in n: return "Contraloría"
    if "procuradur" in n: return "Procuraduría"
    if "polic" in n: return "Policía"
    if "rnmc" in n: return "RNMC"
    if "intenci" in n: return "Carta de Intención"
    if "estatuto" in n or "aceptaci" in n: return "Carta de Aceptación"
    return "Documento"

def parse_field_from_name(fname: str) -> Optional[str]:
    """Extrae el 'campo' si el nombre es 'campo__archivo'. Si no, intenta inferir."""
    if "__" in fname:
        return fname.split("__", 1)[0]
    t = infer_doc_type(fname).lower()
    mapa = {
        "rut": "rut",
        "cámara de comercio": "camara_comercio",
        "cédula": "cedula",
        "contraloría": "antecedentes_contraloria",
        "procuraduría": "antecedentes_procuraduria",
        "policía": "antecedentes_policia",
        "rnmc": "antecedentes_rnmc",
        "carta de intención": "carta_intencion",
        "carta de aceptación": "carta_aceptacion",
    }
    return mapa.get(t)

# -------------------- Listados / Movimientos ----------------
def list_items_by_state(state: str) -> List[Dict]:
    """Lista todos los archivos en un estado, de todos los usuarios."""
    ensure_dirs()
    out: List[Dict] = []
    base = os.path.join(UPLOAD_ROOT, state)
    if not os.path.isdir(base):
        return out

    for user_id in os.listdir(base):
        udir = os.path.join(base, user_id)
        if not os.path.isdir(udir):
            continue
        email = get_user_email_meta(user_id)
        for fname in os.listdir(udir):
            fpath = os.path.join(udir, fname)
            if os.path.isfile(fpath):
                original = clean_original_name(fname)
                doc_type = infer_doc_type(original)
                display = f"{doc_type} — {original}"
                out.append({
                    "id": f"{state}/{user_id}/{fname}",
                    "userId": user_id,
                    "userEmail": email,
                    "name": fname,
                    "originalName": original,
                    "docType": doc_type,
                    "displayName": display,
                    "state": state,
                    "field": parse_field_from_name(fname),
                })
    return out

def list_items_by_state_for_user(state: str, user_id: str) -> List[Dict]:
    """Lista archivos de un usuario en un estado."""
    ensure_dirs()
    out: List[Dict] = []
    base = os.path.join(UPLOAD_ROOT, state, str(user_id))
    if not os.path.isdir(base):
        return out
    email = get_user_email_meta(user_id)
    for fname in os.listdir(base):
        fpath = os.path.join(base, fname)
        if os.path.isfile(fpath):
            original = clean_original_name(fname)
            doc_type = infer_doc_type(original)
            display = f"{doc_type} — {original}"
            out.append({
                "id": f"{state}/{user_id}/{fname}",
                "userId": user_id,
                "userEmail": email,
                "name": fname,
                "originalName": original,
                "docType": doc_type,
                "displayName": display,
                "state": state,
                "field": parse_field_from_name(fname),
            })
    return out

def move_item(rel_id: str, dst_state: str) -> bool:
    """
    Mueve 'pendientes/<user>/<file>' -> 'revisados/<user>/<file>' (etc).
    rel_id: 'estado/userId/fichero...'
    """
    try:
        parts = rel_id.split("/")
        if len(parts) < 3:
            return False
        src_state, user_id = parts[0], parts[1]
        fname = "/".join(parts[2:])
        src = os.path.join(UPLOAD_ROOT, src_state, user_id, fname)
        dst = os.path.join(UPLOAD_ROOT, dst_state, user_id, fname)
        os.makedirs(os.path.dirname(dst), exist_ok=True)
        if not os.path.exists(src):
            return False
        shutil.move(src, dst)
        return True
    except Exception as e:
        print("move_item error:", e)
        return False

# ======================= RUTAS API ==========================
# -------- Subida por AJAX (opcional, la del usuario) --------
@analizar_bp.post("/files")
@login_required
@role_required("user", "admin")
def api_upload_files():
    """
    Recibe múltiples inputs file desde fetch/form-data.
    Guarda en 'pendientes/<userId>' con prefijo 'campo__archivo'.
    """
    ensure_dirs()
    user = session.get("user") or {}
    user_id = str(user.get("id"))
    email = user.get("email") or ""
    set_user_email_meta(user_id, email)

    saved = []
    for field, storage in request.files.items():
        if not storage:
            continue
        fname = secure_filename(storage.filename)
        if not fname:
            continue
        final_name = f"{field}__{fname}"  # clave: conserva el campo
        dst = os.path.join(user_dir(user_id, "pendientes"), final_name)
        storage.save(dst)
        saved.append(final_name)

    return jsonify({"ok": True, "saved": saved})

# ---------------------- ADMIN: usuarios ---------------------
@analizar_bp.get("/admin/users")
@login_required
@role_required("admin")
def admin_users():
    """Lista IDs y emails de usuarios que tienen meta o archivos."""
    ensure_dirs()
    users = set()

    # meta
    for fn in os.listdir(META_DIR):
        if fn.endswith(".txt"):
            users.add(fn[:-4])  # str

    # carpetas por estado
    for st in STATES:
        base = os.path.join(UPLOAD_ROOT, st)
        for uid in os.listdir(base):
            if os.path.isdir(os.path.join(base, uid)):
                users.add(uid)  # ya es str por os.listdir

    items = []

    def _key(x: str):
        s = str(x)
        return (0, int(s)) if s.isdigit() else (1, s.lower())

    # Fuerza a str y usa key uniforme
    for uid in sorted((str(u) for u in users), key=_key):
        items.append({"id": uid, "email": get_user_email_meta(uid)})

    return jsonify({"items": items})

# -------------- ADMIN: listar por usuario/estado ------------
@analizar_bp.get("/admin/user/<user_id>/files")
@login_required
@role_required("admin")
def admin_user_files(user_id):
    """
    Lista archivos de un usuario.
    ?state=pendientes|revisados|validados|all (default: all)
    """
    state = (request.args.get("state") or "all").lower()
    states = STATES if state == "all" else (state,)
    out: List[Dict] = []
    for st in states:
        if st not in STATES:
            continue
        out.extend(list_items_by_state_for_user(st, user_id))
    return jsonify({"items": out})

# ------------------ ADMIN: agregar archivo ------------------
@analizar_bp.post("/admin/user/<user_id>/files")
@login_required
@role_required("admin")
def admin_user_upload(user_id):
    """
    Subir archivo para un usuario:
      form-data: file=<bin>, field=<rut|cedula|...>, state=<pendientes|revisados|validados>
    """
    ensure_dirs()
    f = request.files.get("file")
    field = (request.form.get("field") or "").strip()
    state = (request.form.get("state") or "pendientes").lower()

    if not f or not f.filename:
        return jsonify({"ok": False, "error": "Archivo faltante"}), 400
    if state not in STATES:
        return jsonify({"ok": False, "error": "Estado inválido"}), 400
    if not field:
        field = parse_field_from_name(f.filename) or "documento"

    safe = secure_filename(f.filename)
    final_name = f"{field}__{safe}" if field else safe
    dst = os.path.join(user_dir(user_id, state), final_name)
    f.save(dst)

    return jsonify({"ok": True, "saved": {
        "id": f"{state}/{user_id}/{final_name}",
        "name": final_name,
        "state": state
    }})

# ------------------ ADMIN: eliminar archivo -----------------
@analizar_bp.delete("/admin/user/<user_id>/files/<path:fname>")
@login_required
@role_required("admin")
def admin_user_delete(user_id, fname):
    """
    Elimina archivo concreto del usuario.
    Requiere ?state=pendientes|revisados|validados
    """
    state = (request.args.get("state") or "").lower()
    if state not in STATES:
        return jsonify({"ok": False, "error": "Estado inválido"}), 400
    path = os.path.join(UPLOAD_ROOT, state, str(user_id), fname)
    if not os.path.exists(path):
        return jsonify({"ok": False, "error": "No existe"}), 404
    os.remove(path)
    return jsonify({"ok": True})

# ---------------- (Opcional) descargar archivo --------------
@analizar_bp.get("/admin/user/<user_id>/files/<path:fname>/download")
@login_required
@role_required("admin")
def admin_user_download(user_id, fname):
    state = (request.args.get("state") or "pendientes").lower()
    fpath = os.path.join(UPLOAD_ROOT, state, str(user_id), fname)
    if not os.path.exists(fpath):
        return "Not found", 404
    return send_file(fpath, as_attachment=True)

# -------- ADMIN: listado general (compatibilidad vieja) -----
@analizar_bp.get("/admin/files")
@login_required
@role_required("admin")
def admin_list_files():
    """Lista global de pendientes + revisados (para compatibilidad con código antiguo)."""
    items = list_items_by_state("pendientes") + list_items_by_state("revisados")
    return jsonify({"items": items})

# ------- ADMIN: enviar seleccionados a Comité (revisados) ---
@analizar_bp.post("/admin/submit-to-committee")
@login_required
@role_required("admin")
def admin_submit_to_committee():
    """
    Body JSON: { ids: ["pendientes/<uid>/<fname>", ...] }
    Mueve cada id desde 'pendientes' a 'revisados'.
    """
    data = request.get_json(silent=True) or {}
    ids = data.get("ids") or []
    if not isinstance(ids, list) or not ids:
        return jsonify({"ok": False, "error": "ids vacíos"}), 400

    moved = 0
    for rel_id in ids:
        if not isinstance(rel_id, str):
            continue
        if not rel_id.startswith("pendientes/"):
            # solo permitimos mover desde pendientes
            continue
        if move_item(rel_id, "revisados"):
            moved += 1

    return jsonify({"ok": True, "moved": moved})

# ------------------- COMITÉ: listar bandeja -----------------
@analizar_bp.get("/committee/reviews")
@login_required
@role_required("comite")
def committee_queue():
    """Lista elementos en 'revisados' para decisión del Comité."""
    items = list_items_by_state("revisados")
    for it in items:
        it["expediente"] = it["id"].split("/")[1]  # userId como identificador de expediente
    return jsonify({"items": items})

# ------------------- COMITÉ: tomar decisión -----------------
@analizar_bp.post("/committee/reviews/<path:rid>/decision")
@login_required
@role_required("comite")
def committee_decide(rid):
    """
    Body JSON: { decision: "aprobado" | "rechazado" }
    - aprobado  -> mover a 'validados'
    - rechazado -> devolver a 'pendientes'
    """
    data = request.get_json(silent=True) or {}
    decision = (data.get("decision") or "").lower()
    if decision not in ("aprobado", "rechazado"):
        return jsonify({"ok": False, "error": "decision inválida"}), 400

    dst = "validados" if decision == "aprobado" else "pendientes"
    ok = move_item(rid, dst)
    return jsonify({"ok": bool(ok)})
