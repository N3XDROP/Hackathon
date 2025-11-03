# routes/web.py
import os
from flask import Blueprint, render_template, session, request, redirect, url_for, current_app

from auth import consume_sso_token, login_required, role_required  # asumiendo que ya existen

web_bp = Blueprint("web", __name__)

# --- Paths consistentes (no dependen del cwd) ---
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))  # carpeta del proyecto "chat"
UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")
META_DIR = os.path.join(UPLOAD_ROOT, "meta")
os.makedirs(META_DIR, exist_ok=True)

def _save_user_meta(user: dict):
    """Guarda email del usuario en uploads/meta/<id>.txt para que Admin/Comité lo vean."""
    uid = str(user.get("id"))
    email = user.get("email") or ""
    os.makedirs(META_DIR, exist_ok=True)
    with open(os.path.join(META_DIR, f"{uid}.txt"), "w", encoding="utf-8") as f:
        f.write(email)

@web_bp.get("/auth/consume")
def auth_consume():
    """Recibe el token JWT del backend y abre sesión en Flask."""
    token = request.args.get("token")
    if not token:
        session["mensaje_estado"] = "Falta token."
        return redirect(url_for("web.index"))
    try:
        user = consume_sso_token(token)  # -> dict con id, email, role (string o int)
        session["user"] = user
        # Guarda el rol como número si viene como número, y como string mapeado
        role_map_num_to_str = {0: "admin", 1: "user", 2: "comite"}
        role_raw = user.get("role")
        if isinstance(role_raw, int):
            session["role_num"] = role_raw
            session["role"] = role_map_num_to_str.get(role_raw, None)
        elif isinstance(role_raw, str):
            session["role"] = role_raw
            # Si el string es válido, guarda también el número
            str_to_num = {"admin": 0, "user": 1, "comite": 2}
            session["role_num"] = str_to_num.get(role_raw, None)
        else:
            session["role"] = None
            session["role_num"] = None
        _save_user_meta(user)
        return redirect(url_for("web.index"))
    except Exception as e:
        session["mensaje_estado"] = f"Error de autenticación: {e}"
        return redirect(url_for("web.index"))

@web_bp.get("/auth/logout")
def auth_logout():
    """Cierra sesión en Flask y redirige al frontend."""
    session.clear()
    cookie_name = current_app.config.get("SESSION_COOKIE_NAME", "session")
    resp = redirect(os.environ.get("FRONTEND_URL", "http://localhost:5173"))
    resp.delete_cookie(cookie_name, path="/")
    return resp

@web_bp.get("/")
def index():
    """Home del módulo (renderiza index.html con user y role)."""
    backend_url = os.environ.get("BACKEND_URL", "http://localhost:4000")
    return render_template(
        "index.html",
        ultimo=session.get("ultimo_analisis"),
        mensaje=session.pop("mensaje_estado", None),
        user=session.get("user"),
        role=session.get("role"),
        role_num=session.get("role_num"),
        backend_url=backend_url,
    )

# ---------- Procesa el FORM del usuario (subidas) ----------
from werkzeug.utils import secure_filename

def _ensure_dir(p): os.makedirs(p, exist_ok=True)

@web_bp.post("/analizar")
@login_required
@role_required("user", "admin")
def analizar_form():
    """Guarda los archivos subidos por el usuario en uploads/pendientes/<id>/campo__archivo.ext"""
    user = session.get("user") or {}
    user_id = str(user.get("id"))
    email = user.get("email") or ""

    pendientes_dir = os.path.join(UPLOAD_ROOT, "pendientes", user_id)
    _ensure_dir(pendientes_dir)
    _ensure_dir(META_DIR)
    _save_user_meta(user)  # asegura meta con email

    campos = [
        "rut", "camara_comercio", "cedula",
        "carta_intencion", "carta_aceptacion",
        "antecedentes_contraloria", "antecedentes_procuraduria",
        "antecedentes_policia", "antecedentes_rnmc",
    ]
    guardados = []
    for campo in campos:
        f = request.files.get(campo)
        if f and f.filename:
            fname = f"{campo}__{secure_filename(f.filename)}"
            f.save(os.path.join(pendientes_dir, fname))
            guardados.append(fname)

    # (mock) resultado mínimo para que se renderice el bloque "ultimo"
    session["ultimo_analisis"] = {
        "usuario_id": user_id,
        "estado": "pendiente de análisis",
        "completo": False,
        "faltan_documentos": [],
        "resultados": {
            "rut": {"nombre": next((g for g in guardados if g.startswith("rut__")), None)},
            "contraloria": {"nombre": next((g for g in guardados if g.startswith("antecedentes_contraloria__")), None)},
            "procuraduria": {"nombre": next((g for g in guardados if g.startswith("antecedentes_procuraduria__")), None)},
            "policia": {"nombre": next((g for g in guardados if g.startswith("antecedentes_policia__")), None)},
            "rnmc": {"nombre": next((g for g in guardados if g.startswith("antecedentes_rnmc__")), None)},
            "cedula": None
        }
    }

    session["mensaje_estado"] = f"Se cargaron {len(guardados)} archivo(s) a pendientes."
    return redirect(url_for("web.index"))
