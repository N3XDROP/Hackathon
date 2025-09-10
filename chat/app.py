import os
from flask import Flask
from flask_session import Session

from routes.web import web_bp
from routes.analizar import analizar_bp

app = Flask(__name__)

# Clave de la app Flask (lee de env si existe)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "1234abcd")

# ---- Config de sesión/cookies (recomendado) ----
app.config.update(
    SESSION_TYPE="filesystem",                          # dev; en prod usa Redis
    SESSION_FILE_DIR=os.path.join(os.getcwd(), ".flask_session"),
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE="Lax",                      # "None" si vas cross-site con HTTPS
    SESSION_COOKIE_SECURE=False,                        # True en producción con HTTPS
    PERMANENT_SESSION_LIFETIME=60*60*8,                 # 8 horas
)

Session(app)

# Blueprints
app.register_blueprint(web_bp)
app.register_blueprint(analizar_bp)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)