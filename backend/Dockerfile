FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies
# Install wkhtmltopdf dependencies
# Install wkhtmltopdf (static binary)
RUN apt-get update && apt-get install -y wget \
    && wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6-1/wkhtmltox_0.12.6-1_linux-generic-amd64.tar.xz \
    && tar -xf wkhtmltox_0.12.6-1_linux-generic-amd64.tar.xz \
    && mv wkhtmltox/bin/wkhtmltopdf /usr/local/bin/wkhtmltopdf \
    && mv wkhtmltox/bin/wkhtmltoimage /usr/local/bin/wkhtmltoimage \
    && chmod +x /usr/local/bin/wkhtmltopdf /usr/local/bin/wkhtmltoimage \
    && rm -rf wkhtmltox* \
    && apt-get clean

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

CMD ["sh", "-c", "python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8080"]
