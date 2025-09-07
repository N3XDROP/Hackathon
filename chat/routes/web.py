from flask import Blueprint, render_template, session

web_bp = Blueprint("web", __name__)

@web_bp.get("/")
def index():
    # Pasa el último análisis y un mensaje opcional
    return render_template("index.html",
                           ultimo=session.get("ultimo_analisis"),
                           mensaje=session.pop("mensaje_estado", None))
