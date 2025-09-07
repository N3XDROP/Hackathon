import os, json, re, requests

OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/chat")
TEXT_MODEL = os.getenv("OLLAMA_TEXT_MODEL", "mistral:instruct")

_JSON_HINT = (
  "Responde EXCLUSIVAMENTE con JSON válido, sin explicaciones ni markdown, "
  "sin ```json, sin backticks. JSON minificado en UNA SOLA línea."
)

# =========================================================
# Helpers
# =========================================================
def _extract_json(text: str) -> dict:
    """Intenta extraer JSON válido de la respuesta del modelo."""
    t = text.strip()
    t = re.sub(r"^```(?:json)?\s*|\s*```$", "", t, flags=re.IGNORECASE | re.MULTILINE).strip()
    try:
        return json.loads(t)
    except Exception:
        m = re.search(r"\{.*\}", t, flags=re.DOTALL)
        if m:
            try:
                return json.loads(m.group(0))
            except Exception:
                pass
    return {"ok": False, "missing_fields": ["json_parse"], "raw": text}

def _chat_json(prompt: str) -> dict:
    """Envía prompt a Ollama y devuelve JSON parseado."""
    payload = {
        "model": TEXT_MODEL,
        "messages": [{"role": "user", "content": f"{prompt}\n\n{_JSON_HINT}"}],
        "stream": False,
        "options": {"temperature": 0.1},
    }
    r = requests.post(OLLAMA_URL, json=payload, timeout=120)
    r.raise_for_status()
    content = r.json()["message"]["content"]
    return _extract_json(content)

# =========================================================
# PROMPTS
# =========================================================

PROMPT_RUT = """
Eres verificador de un documento RUT (Registro Único Tributario, DIAN Colombia).
Del texto OCR extrae únicamente:
{
  "ok": boolean,
  "missing_fields": [string],
  "nombre": string,           // Nombre completo del titular
  "cedula": string            // Número de cédula asociado
}
Criterio ok=true: nombre y cédula están presentes y legibles.
TEXTO_OCR:
"""

PROMPT_CONTRALORIA = """
Eres verificador de un Certificado de la Contraloría General de Colombia.
Del texto OCR extrae únicamente:
{
  "ok": boolean,
  "missing_fields": [string],
  "nombre": string,           // Nombre completo del ciudadano
  "cedula": string,           // Número de cédula
  "responsabilidad_fiscal": boolean  // true si aparece reportado, false si NO está reportado
}
Criterio ok=true: nombre y cédula están presentes.
TEXTO_OCR:
"""

PROMPT_PROCURADURIA = """
Eres verificador de un Certificado de Antecedentes de la Procuraduría General de Colombia.
Del texto OCR extrae únicamente:
{
  "ok": boolean,
  "missing_fields": [string],
  "nombre": string,
  "cedula": string,
  "antecedentes_disciplinarios": boolean  // true si tiene reportes, false si no
}
Criterio ok=true: nombre y cédula presentes.
TEXTO_OCR:
"""

PROMPT_POLICIA = """
Eres verificador de un Certificado de Antecedentes de la Policía Nacional de Colombia.
Del texto OCR extrae únicamente:
{
  "ok": boolean,
  "missing_fields": [string],
  "nombre": string,
  "cedula": string,
  "antecedentes_judiciales": boolean   // true si aparecen, false si no
}
Criterio ok=true: nombre y cédula presentes.
TEXTO_OCR:
"""

PROMPT_RNMC = """
Eres verificador de un Certificado RNMC (Registro Nacional de Medidas Correctivas).
Del texto OCR extrae únicamente:
{
  "ok": boolean,
  "missing_fields": [string],
  "nombre": string,
  "cedula": string,
  "medidas_correctivas": boolean   // true si aparecen medidas, false si no
}
Criterio ok=true: nombre y cédula presentes.
TEXTO_OCR:
"""

PROMPT_CEDULA = """
Eres verificador de CÉDULAS COLOMBIANAS. Recibirás el TEXTO OCR plano (sin imágenes).
Copia literalmente los campos si aparecen; si no aparecen o son dudosos, deja "" (vacío) y añádelos a missing_fields.
Nunca inventes números ni fechas.
Devuelve SOLO JSON con claves:
{
  "ok": boolean,
  "missing_fields": [string],
  "nuip": string,
  "nombres": string,
  "apellidos": string,
  "fecha_nacimiento": string,
  "lugar_expedicion": string,
  "fecha_expedicion": string,
  "encabezados_validos": boolean,
  "republica_detectada": boolean,
  "mrz_detectada": boolean
}
Criterio ok=true: encabezados_validos=true AND republica_detectada=true AND mrz_detectada=true AND nuip != "".
TEXTO_OCR:
"""

PROMPT_CERT = """
Eres verificador de CERTIFICADOS MÉDICOS LABORALES de aptitud. Recibirás TEXTO OCR plano.
No inventes datos. Copia exactamente lo que veas.
Devuelve SOLO JSON con claves:
{
  "ok": boolean,
  "missing_fields": [string],
  "tipo_documento_detectado": "medico"|"afiliacion"|"otro",
  "nombre_paciente": string,
  "fecha": string,
  "resultado": "APTO"|"NO APTO"|"OTRO",
  "nombre_medico": string,
  "registro_profesional": string,
  "firma_detectada": boolean
}
Criterio ok=true: tipo_documento_detectado="medico" AND resultado presente AND (nombre_medico o registro_profesional) presente AND fecha presente.
TEXTO_OCR:
"""

# =========================================================
# FUNCIONES DE ESTRUCTURACIÓN
# =========================================================

def estructurar_cedula_desde_texto(texto_ocr: str) -> dict:
    return _chat_json(PROMPT_CEDULA + "\n\"\"\"\n" + (texto_ocr[:12000]) + "\n\"\"\"\n")

def estructurar_certificado_desde_texto(texto_ocr: str) -> dict:
    return _chat_json(PROMPT_CERT + "\n\"\"\"\n" + (texto_ocr[:12000]) + "\n\"\"\"\n")

def estructurar_rut_desde_texto(texto_ocr: str) -> dict:
    return _chat_json(PROMPT_RUT + "\n\"\"\"\n" + (texto_ocr[:12000]) + "\n\"\"\"\n")

def estructurar_contraloria_desde_texto(texto_ocr: str) -> dict:
    return _chat_json(PROMPT_CONTRALORIA + "\n\"\"\"\n" + (texto_ocr[:12000]) + "\n\"\"\"\n")

def estructurar_procuraduria_desde_texto(texto_ocr: str) -> dict:
    return _chat_json(PROMPT_PROCURADURIA + "\n\"\"\"\n" + (texto_ocr[:12000]) + "\n\"\"\"\n")

def estructurar_policia_desde_texto(texto_ocr: str) -> dict:
    return _chat_json(PROMPT_POLICIA + "\n\"\"\"\n" + (texto_ocr[:12000]) + "\n\"\"\"\n")

def estructurar_rnmc_desde_texto(texto_ocr: str) -> dict:
    return _chat_json(PROMPT_RNMC + "\n\"\"\"\n" + (texto_ocr[:12000]) + "\n\"\"\"\n")