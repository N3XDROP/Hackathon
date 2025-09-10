from flask import Flask
from flask_session import Session

from routes.web import web_bp
from routes.analizar import analizar_bp

app = Flask(__name__)
app.secret_key = "1234abcd"
app.config["SESSION_TYPE"] = "filesystem"
Session(app)

# Blueprints
app.register_blueprint(web_bp)
app.register_blueprint(analizar_bp)

if __name__ == "__main__":
    app.run(port=5000, debug=True)
