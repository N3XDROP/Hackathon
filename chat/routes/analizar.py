# routes/analizar.py
from flask import Blueprint, request, Response, session, redirect, url_for

from services.utils import (
    EXTENSIONES_PERMITIDAS, extension_permitida, guardar_archivo,
    validar_archivo_basico, hash_sha256
)
from services.ocr_ai import (
    extraer_texto_documento,
    extraer_mrz_texto,
    parse_nuip_from_mrz,
    parse_names_from_mrz,
    parse_birth_from_mrz,
    canonicalizar_nuip,
    mrz_desde_texto_ocr,
    _is_valid_mrz,  # validador de MRZ (útil/no basura)
)
from services.llm_struct import (
    estructurar_cedula_desde_texto,
    estructurar_certificado_desde_texto
)

@analizar_bp.post("/analizar")
def analizar():
    # 1) Archivos requeridos (agregado los nuevos documentos)
    documentos_requeridos = [
        "cedula", "certificado", "rut", "camara_comercio", "carta_intencion", 
        "carta_aceptacion", "antecedentes_contraloria", "antecedentes_procuraduria", 
        "antecedentes_policia", "antecedentes_rnmc", "direccion_fisica", "residencia_boyaca"
    ]
    
    faltan_documentos = [doc for doc in documentos_requeridos if doc not in request.files]

    if faltan_documentos:
        return Response(f"Faltan los siguientes documentos: {', '.join(faltan_documentos)}", 400)

    # 2) Validaciones iniciales de los documentos (extensiones y archivo sin nombre)
    documentos_invalidos = []
    for doc, nombre in [
        ("rut", "RUT"), ("camara_comercio", "Certificado de Cámara de Comercio"), 
        ("cedula", "Cédula del representante"), ("carta_intencion", "Carta de Intención"), 
        ("carta_aceptacion", "Carta de Aceptación")
    ]:
        archivo = request.files.get(doc)
        if archivo and (archivo.filename == "" or not extension_permitida(archivo.filename)):
            documentos_invalidos.append(f"{nombre} inválido o ilegible.")

    if documentos_invalidos:
        return Response(" ; ".join(documentos_invalidos), 400)

    # 3) Guardar los archivos en el sistema
    usuario_id = (request.form.get("usuario_id") or "").strip() or "anon"
    ruta_ced = guardar_archivo(request.files["cedula"], usuario_id)
    ruta_cert = guardar_archivo(request.files["certificado"], usuario_id)

    # Guardar los otros documentos requeridos
    ruta_rut = guardar_archivo(request.files["rut"], usuario_id)
    ruta_camara_comercio = guardar_archivo(request.files["camara_comercio"], usuario_id)
    ruta_carta_intencion = guardar_archivo(request.files["carta_intencion"], usuario_id)
    ruta_carta_aceptacion = guardar_archivo(request.files["carta_aceptacion"], usuario_id)
    ruta_antecedentes_contraloria = guardar_archivo(request.files["antecedentes_contraloria"], usuario_id)
    ruta_antecedentes_procuraduria = guardar_archivo(request.files["antecedentes_procuraduria"], usuario_id)
    ruta_antecedentes_policia = guardar_archivo(request.files["antecedentes_policia"], usuario_id)
    ruta_antecedentes_rnmc = guardar_archivo(request.files["antecedentes_rnmc"], usuario_id)

    # 4) Sanity checks básicos
    observ = []
    if not validar_archivo_basico(ruta_ced):
        observ.append("Cédula vacía o ilegible.")
    if not validar_archivo_basico(ruta_cert):
        observ.append("Certificado vacío o ilegible.")
    if not validar_archivo_basico(ruta_rut):
        observ.append("RUT vacío o ilegible.")
    if not validar_archivo_basico(ruta_camara_comercio):
        observ.append("Certificado de Cámara de Comercio vacío o ilegible.")
    if not validar_archivo_basico(ruta_carta_intencion):
        observ.append("Carta de Intención vacía o ilegible.")
    if not validar_archivo_basico(ruta_carta_aceptacion):
        observ.append("Carta de Aceptación vacía o ilegible.")
    if not validar_archivo_basico(ruta_antecedentes_contraloria):
        observ.append("Carta de Aceptación vacía o ilegible.")
    if not validar_archivo_basico(ruta_antecedentes_procuraduria):
        observ.append("Carta de Aceptación vacía o ilegible.")
    if not validar_archivo_basico(ruta_antecedentes_policia):
        observ.append("Carta de Aceptación vacía o ilegible.")
    if not validar_archivo_basico(ruta_antecedentes_rnmc):
        observ.append("Carta de Aceptación vacía o ilegible.")
    if observ:
        return Response(" ; ".join(observ), 400)

    # 5) OCR IA (texto plano desde imagen/PDF)
    texto_ced = extraer_texto_documento(ruta_ced)
    texto_cert = extraer_texto_documento(ruta_cert)

    # Procesar MRZ de la cédula
    mrz_txt = extraer_mrz_texto(ruta_ced)
    if not _is_valid_mrz(mrz_txt):
        mrz_txt = mrz_desde_texto_ocr(texto_ced)

    if _is_valid_mrz(mrz_txt):
        texto_ced += "\n\n[MRZ]\n" + mrz_txt

    # 6) Procesamiento del documento con LLM
    resultado_ced = estructurar_cedula_desde_texto(texto_ced)
    resultado_cert = estructurar_certificado_desde_texto(texto_cert)

    # 7) Consolidación de datos con MRZ
    if _is_valid_mrz(mrz_txt):
        nuip_mrz = parse_nuip_from_mrz(mrz_txt)
        apellidos_mrz, nombres_mrz = parse_names_from_mrz(mrz_txt)
        fecha_nac_mrz = parse_birth_from_mrz(mrz_txt)
    else:
        nuip_mrz = None
        apellidos_mrz, nombres_mrz = (None, None)
        fecha_nac_mrz = None

    # Consolidar información
    if nuip_mrz:
        resultado_ced["nuip"] = nuip_mrz
    else:
        resultado_ced["nuip"] = canonicalizar_nuip(resultado_ced.get("nuip"))

    if apellidos_mrz:
        resultado_ced["apellidos"] = apellidos_mrz
    if nombres_mrz:
        resultado_ced["nombres"] = nombres_mrz

    if (not (resultado_ced.get("fecha_nacimiento") or "").strip()) and fecha_nac_mrz:
        resultado_ced["fecha_nacimiento"] = fecha_nac_mrz

    resultado_ced["mrz_detectada"] = bool(_is_valid_mrz(mrz_txt))

    # 8) Estado general
    cedula_ok = bool(resultado_ced.get("ok"))
    cert_ok = bool(resultado_cert.get("ok"))
    completo = cedula_ok and cert_ok
    estado = "pendiente_revision_admin"

    # 9) Resúmenes legibles para UI
    resumen_cedula = {
        "NUIP": (resultado_ced.get("nuip") or "").strip(),
        "Nombres": (resultado_ced.get("nombres") or "").strip(),
        "Apellidos": (resultado_ced.get("apellidos") or "").strip(),
        "Fecha de nacimiento": (resultado_ced.get("fecha_nacimiento") or "").strip(),
        "Encabezados válidos": resultado_ced.get("encabezados_validos"),
        "República detectada": resultado_ced.get("republica_detectada"),
        "MRZ detectada": resultado_ced.get("mrz_detectada"),
    }

    tipo_doc = (resultado_cert.get("tipo_documento_detectado") or "").lower()
    resumen_certificado = {
        "Tipo detectado": tipo_doc or "desconocido",
        "Nombre paciente": (resultado_cert.get("nombre_paciente") or "").strip(),
        "Fecha": (resultado_cert.get("fecha") or "").strip(),
        "Resultado": (resultado_cert.get("resultado") or "").strip(),
        "Médico": (resultado_cert.get("nombre_medico") or "").strip(),
        "Registro profesional": (resultado_cert.get("registro_profesional") or "").strip(),
        "Firma detectada": resultado_cert.get("firma_detectada"),
    }

    # 10) Guardar en sesión
    session["ultimo_analisis"] = {
    "usuario_id": usuario_id,
    "cedula_ok": cedula_ok,
    "resultado_cedula": resultado_ced,
    "resumen_cedula": resumen_cedula,
    "cert_ok": cert_ok,
    "resultado_certificado": resultado_cert,
    "resumen_certificado": resumen_certificado,
    "completo": completo,
    "estado": estado,
    "ruta_cedula": ruta_ced,
    "ruta_certificado": ruta_cert,
    "texto_cedula": texto_ced[:1000],       # opcional para debug
    "texto_certificado": texto_cert[:1000], # opcional para debug
    "mrz_texto": (mrz_txt or "")[:500],
    }

    # Agregar resultados de los demás documentos
    session["ultimo_analisis"]["resultado_rut"] = {"status": "Válido"}
    session["ultimo_analisis"]["resultado_camara_comercio"] = {"status": "Válido"}
    session["ultimo_analisis"]["resultado_carta_intencion"] = {"status": "Válido"}
    session["ultimo_analisis"]["resultado_carta_aceptacion"] = {"status": "Válido"}
    session["ultimo_analisis"]["resultado_antecedentes_contraloria"] = {"status": "Válido"}
    session["ultimo_analisis"]["resultado_antecedentes_procuraduria"] = {"status": "Válido"}
    session["ultimo_analisis"]["resultado_antecedentes_policia"] = {"status": "Válido"}
    session["ultimo_analisis"]["resultado_antecedentes_rnmc"] = {"status": "Válido"}
    session["ultimo_analisis"]["direccion_fisica"] = request.form.get("direccion_fisica") or "No proporcionado"
    session["ultimo_analisis"]["residencia_boyaca"] = request.form.get("residencia_boyaca") or "No proporcionado"

    # # 11) Registrar en DB (si está disponible)
    # if registrar_envio_documentos:
    #     try:
    #         from json import dumps
    #         registrar_envio_documentos(
    #             usuario_id=usuario_id,
    #             ruta_cedula=ruta_ced,
    #             ruta_certificado=ruta_cert,
    #             completo=completo,
    #             estado=estado,
    #             observaciones=None,
    #             json_cedula=dumps(resultado_ced, ensure_ascii=False),
    #             json_certificado=dumps(resultado_cert, ensure_ascii=False),
    #         )
    #     except Exception as e:
    #         print("DB error:", e)

    # 12) Mensaje al cliente
    mensajes = []
    if not cedula_ok:
        miss = resultado_ced.get("missing_fields") or []
        mensajes.append(f"Cédula con observaciones: {', '.join(miss) if miss else 'revise datos legibles.'}")
    if not cert_ok:
        miss = resultado_cert.get("missing_fields") or []
        if tipo_doc == "afiliacion":
            mensajes.append("Subiste 'certificado de afiliación', se requiere 'certificado MÉDICO de aptitud'.")
        else:
            mensajes.append(f"Certificado con observaciones: {', '.join(miss) if miss else 'faltan campos.'}")

    msg = ("Documentos completos. " if completo else "Documentos INCOMPLETOS. ")
    if mensajes:
        msg += " ".join(mensajes) + " "
    msg += f"Estado: {estado}."
    session["mensaje_estado"] = msg

    # 13) Volver al index
    return redirect(url_for("web.index"))