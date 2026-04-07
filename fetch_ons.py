import requests
import json
import pandas as pd
from io import StringIO
from sqlalchemy import create_engine, text

# 1. Connection Details
DB_USER = "dbuser"
DB_PASSWORD = "strongpassword" 
DB_HOST = "46.225.16.57"
DB_PORT = "5432"
DB_NAME = "mydb"

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

MANIFEST_URL = "https://api.beta.ons.gov.uk/v1/datasets/cpih01/editions/time-series/versions/13"

def fetch_actual_data():
    try:
        print("📡 Step 1: Fetching Manifest...")
        resp = requests.get(MANIFEST_URL)
        resp.raise_for_status()
        manifest = resp.json()

        # Get the actual CSV download link
        csv_url = manifest['downloads']['csv']['href']
        print(f"🔗 Step 2: Found CSV Data Link: {csv_url}")

        print("📡 Step 3: Downloading full dataset...")
        data_resp = requests.get(csv_url)
        data_resp.raise_for_status()
        
        # Convert CSV text to a list of dicts (JSON structure) so it fits our JSONB column
        # This gives you the "Actual Data" in a structured way
        csv_data = StringIO(data_resp.text)
        df = pd.read_csv(csv_data)
        
        # Convert the first 1000 rows to JSON to keep the Bronze entry manageable but "real"
        # Or store the whole thing if you prefer!
        actual_json_data = df.to_dict(orient='records')

        print(f"✅ Received {len(actual_json_data)} observation rows. Writing to Bronze...")

        with engine.begin() as conn:
            # First, let's make sure the table exists
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS bronze.ons_cpi_observations (
                    id SERIAL PRIMARY KEY,
                    observation_json JSONB NOT NULL,
                    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            """))

            insert_query = text("""
                INSERT INTO bronze.ons_cpi_observations (observation_json)
                VALUES (:payload);
            """)
            
            conn.execute(insert_query, {"payload": json.dumps(actual_json_data)})

        print(f"🎉 SUCCESS! {len(actual_json_data)} rows of actual ONS data are now in bronze.ons_cpi_observations")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    fetch_actual_data()
