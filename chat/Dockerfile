# Imagen base con Python
FROM python:3.12-slim

# Carpeta de trabajo dentro del contenedor
WORKDIR /app

# Copiamos las dependencias
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código
COPY . .

# Puerto que va a usar el contenedor
EXPOSE 8000

# Comando que ejecuta el bot
CMD ["python", "app.py"]
