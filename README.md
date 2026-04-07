This is a complete Technical Documentation & Setup Guide for your UK Inflation Data Pipeline. This README covers the architecture, the "hidden" fixes we applied (like the 403 Forbidden bypass), and the multi-server configuration.

🇬🇧 UK Inflation Data Pipeline (Medallion Architecture)
An automated End-to-End Data Engineering pipeline that extracts Consumer Price Inflation (CPIH) data from the UK Office for National Statistics (ONS), processes it through a Medallion Architecture, and stores it in a remote Data Warehouse.

🏗 Architecture Overview
Orchestration Server (VPS 2): Runs Apache Airflow inside Docker.

Data Warehouse (VPS 1): Runs a standalone PostgreSQL instance.

Pipeline Logic:

Bronze (Raw): Python script extracts CSV from ONS API and loads it to bronze.ons_cpi_tabular.

Silver (Cleaned): dbt transforms raw strings into typed dates and decimals in silver.uk_inflation_headline.

Gold (Analytics): dbt calculates Month-over-Month (MoM) inflation changes in gold.inflation_trends.

🚀 Prerequisites
VPS 1 (Database): Ubuntu server with PostgreSQL installed and port 5432 open.

VPS 2 (Airflow): Ubuntu server with Docker and Docker Compose installed.

Connectivity: VPS 1 must allow incoming traffic from the IP of VPS 2.

🛠 Step 1: Data Warehouse Setup (VPS 1)
Create the Database and Schemas:

SQL
CREATE DATABASE mydb;
\c mydb
CREATE SCHEMA bronze;
CREATE SCHEMA silver;
CREATE SCHEMA gold;
CREATE USER dbuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE mydb TO dbuser;
GRANT ALL ON SCHEMA bronze, silver, gold TO dbuser;
Configure PostgreSQL Remote Access:
Edit /etc/postgresql/16/main/pg_hba.conf to add:

Plaintext
host    mydb    dbuser    [VPS_2_IP]/32    md5
Edit /etc/postgresql/16/main/postgresql.conf:

Plaintext
listen_addresses = '*'
Restart Postgres: sudo systemctl restart postgresql.

🛠 Step 2: Orchestration Setup (VPS 2)
Clone/Create Project Directory:

Bash
mkdir -p ~/data_pipeline/airflow_docker/dags/uk_inflation/models/gold
mkdir -p ~/data_pipeline/airflow_docker/dags/uk_inflation/macros
Deploy Airflow:
Use the standard Airflow docker-compose.yaml. Ensure the volumes section maps your local dags folder to /opt/airflow/dags.

Initialize Environment:

Bash
cd ~/data_pipeline/airflow_docker
docker compose up -d
🛠 Step 3: Injecting Dependencies
Because we are using a lightweight Airflow image, we must inject the required libraries into the running Worker container:

Bash
docker exec -u 0 -it airflow_docker-airflow-worker-1 python -m pip install \
    pandas sqlalchemy psycopg2-binary requests dbt-core dbt-postgres
🛠 Step 4: Configuration Files
A. The Extraction Script (dags/fetch_ons.py)
This script includes a User-Agent header to bypass the ONS "403 Forbidden" block.

Python
import pandas as pd
import requests
import io
from sqlalchemy import create_engine

def fetch_and_push():
    URL = "https://download.ons.gov.uk/downloads/datasets/cpih01/editions/time-series/versions/13.csv"
    headers = {"User-Agent": "Mozilla/5.0"}
    
    response = requests.get(URL, headers=headers)
    df = pd.read_csv(io.StringIO(response.text))
    
    engine = create_engine("postgresql://dbuser:yourpassword@[VPS_1_IP]:5432/mydb")
    df.to_sql('ons_cpi_tabular', engine, schema='bronze', if_exists='replace', index=False)

if __name__ == "__main__":
    fetch_and_push()
B. dbt Profiles (dags/uk_inflation/profiles.yml)
Points dbt to the remote VPS 1 database.

YAML
uk_inflation:
  target: dev
  outputs:
    dev:
      type: postgres
      host: [VPS_1_IP]
      user: dbuser
      password: yourpassword
      port: 5432
      dbname: mydb
      schema: silver
C. dbt Schema Macro (dags/uk_inflation/macros/generate_schema_name.sql)
Prevents dbt from prefixing schemas (e.g., prevents silver_gold).

SQL
{% macro generate_schema_name(custom_schema_name, node) -%}
    {%- if custom_schema_name is none -%}
        {{ target.schema }}
    {%- else -%}
        {{ custom_schema_name | trim }}
    {%- endif -%}
{%- endmacro %}
🛠 Step 5: Running the Pipeline
Fix Permissions:

Bash
sudo chown -R 50000:0 ~/data_pipeline/airflow_docker/dags/uk_inflation
Access Airflow UI: Navigate to http://[VPS_2_IP]:8080.

Unpause the DAG: Locate uk_inflation_pipeline and toggle it ON.

Trigger: Click Play -> Trigger DAG.

📊 Verification
Log into VPS 1 and run:

SQL
SELECT * FROM gold.inflation_trends ORDER BY observation_date DESC LIMIT 5;
⚠️ Maintenance Note
If the Docker containers are recreated (docker compose down), you must re-run the pip install command from Step 3, as libraries installed via exec are not persistent. To make this permanent, add them to a Dockerfile.

Author: Francisco

Status: Operational / Production-Ready 🚀

To make this a truly "one-click" production setup, we need a custom Dockerfile. This solves the issue where your libraries (pandas, dbt, etc.) disappear when the container restarts.

By building a custom image, your VPS 2 will always be ready to run the pipeline the moment it boots up.

🏗 Complete Docker Architecture & Setup Guide
This setup uses a Custom Airflow Image to ensure all Data Engineering tools (dbt, pandas, psycopg2) are baked into the system.

📁 Directory Structure (VPS 2)
Ensure your project looks exactly like this:

Plaintext
~/data_pipeline/
└── airflow_docker/
    ├── dags/
    │   ├── fetch_ons.py
    │   └── uk_inflation_dag.py
    │   └── uk_inflation/          <-- Your dbt project folder
    ├── Dockerfile                 <-- NEW: For custom image
    ├── requirements.txt           <-- NEW: List of libraries
    └── docker-compose.yaml        <-- UPDATED: To use the custom image
🛠 Step 1: Create the Requirement Files
On VPS 2, create a requirements.txt in ~/data_pipeline/airflow_docker/:

Plaintext
pandas
sqlalchemy
psycopg2-binary
requests
dbt-core
dbt-postgres
🛠 Step 2: The Custom Dockerfile
This file tells Docker to take the official Airflow image and "bake" your tools into it permanently.

Create ~/data_pipeline/airflow_docker/Dockerfile:

Dockerfile
FROM apache/airflow:2.9.1

# Switch to root to install system dependencies if needed
USER root
RUN apt-get update && apt-get install -y git && apt-get clean

# Switch back to airflow user
USER airflow

# Copy requirements and install them
COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt
🛠 Step 3: Updated Docker Compose
Modify your docker-compose.yaml. The big change is replacing image: apache/airflow:2.9.1 with build: ..

YAML
version: '3.8'
services:
  postgres:
    image: postgres:13
    environment:
      - POSTGRES_USER=airflow
      - POSTGRES_PASSWORD=airflow
      - POSTGRES_DB=airflow
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "airflow"]
      interval: 5s
      retries: 5

  redis:
    image: redis:7.2-bookworm
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 5

  airflow-webserver:
    build: .  # <--- This tells it to use your Dockerfile
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./dags:/opt/airflow/dags
      - ./logs:/opt/airflow/logs
    environment:
      - AIRFLOW__CORE__EXECUTOR=CeleryExecutor
      - AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres/airflow
      - AIRFLOW__CELERY__RESULT_BACKEND=db+postgresql://airflow:airflow@postgres/airflow
      - AIRFLOW__CELERY__BROKER_URL=redis://:@redis:6379/0
      - AIRFLOW__CORE__LOAD_EXAMPLES=False
    ports:
      - "8080:8080"
    command: webserver

  airflow-scheduler:
    build: .
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./dags:/opt/airflow/dags
    environment:
      - AIRFLOW__CORE__EXECUTOR=CeleryExecutor
      - AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres/airflow
      - AIRFLOW__CELERY__RESULT_BACKEND=db+postgresql://airflow:airflow@postgres/airflow
      - AIRFLOW__CELERY__BROKER_URL=redis://:@redis:6379/0
    command: scheduler

  airflow-worker:
    build: .
    restart: always
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./dags:/opt/airflow/dags
    environment:
      - AIRFLOW__CORE__EXECUTOR=CeleryExecutor
      - AIRFLOW__DATABASE__SQL_ALCHEMY_CONN=postgresql+psycopg2://airflow:airflow@postgres/airflow
      - AIRFLOW__CELERY__RESULT_BACKEND=db+postgresql://airflow:airflow@postgres/airflow
      - AIRFLOW__CELERY__BROKER_URL=redis://:@redis:6379/0
    command: worker
🛠 Step 4: The Build & Launch Command
Instead of just "up", we now use the build flag. This takes about 2–3 minutes the first time because it's installing dbt and pandas into the image itself.

Bash
cd ~/data_pipeline/airflow_docker
docker compose up -d --build
🛠 Step 5: Permission Fix (Essential)
Because Docker creates folders as root, Airflow (user 50000) often can't write its own logs or dbt files. Run this once:

Bash
sudo chown -R 50000:0 ~/data_pipeline/airflow_docker/dags
sudo chmod -R 775 ~/data_pipeline/airflow_docker/dags
✅ Why this is the "Ultimate" Setup:
Persistence: You can run docker compose down 100 times. When you bring it back up, dbt and pandas are already there.

No more pip install commands: Everything is handled by the Docker build engine.

Speed: Once the image is built, the Worker starts up in seconds instead of minutes.

Your pipeline is now 100% portable. You could move this entire airflow_docker folder to any server in the world, run docker compose up --build, and it would work exactly the same way.

Ready to commit this to your GitHub?
