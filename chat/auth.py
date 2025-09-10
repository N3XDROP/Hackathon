import os, time
from functools import wraps
from flask import request, session, redirect, url_for, abort, make_response
import jwt

SSO_JWT_SECRET = os.environ.get("SSO_JWT_SECRET", "una_super_secreta_larga")
JWT_ISSUER = "hackaton-backend"
JWT_AUDIENCE = "flask-chat"

# Mapea tus roles numéricos del backend a nombres
ROLE_MAP = {
    0: "user",
    1: "admin",
    2: "comite",
    "0": "user",
    "1": "admin",
    "2": "comite"
}

# (Opcional) anti-replay simple en memoria; en prod usa Redis
_JTI_SEEN = set()

def consume_sso_token(token: str):
    payload = jwt.decode(
        token,
        SSO_JWT_SECRET,
        algorithms=["HS256"],
        audience=JWT_AUDIENCE,
        issuer=JWT_ISSUER,
        options={"require": ["exp", "iss", "aud", "jti"]}
    )
    jti = payload.get("jti")
    if jti in _JTI_SEEN:
        raise jwt.InvalidTokenError("Token ya usado")
    _JTI_SEEN.add(jti)

    role = ROLE_MAP.get(payload.get("role"), "user")
    user = {
        "id": payload.get("sub"),
        "email": payload.get("email"),
        "role": role
    }
    return user

def login_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        if not session.get("user"):
            return redirect(url_for("web.index"))
        return f(*args, **kwargs)
    return wrapper

def role_required(*roles):
    roles = set(roles)
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = session.get("user")
            if not user:
                return redirect(url_for("web.index"))
            if user.get("role") not in roles:
                abort(403)
            return f(*args, **kwargs)
        return wrapper
    return decorator
