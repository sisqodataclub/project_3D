import pandas as pd
from sqlalchemy import create_engine, text

# Connection Settings
DB_USER = "dbuser"
DB_PASSWORD = "strongpassword" 
DB_HOST = "46.225.16.57"
DB_PORT = "5432"
DB_NAME = "mydb"

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

def build_tabular_bronze():
    print("🏗️ Creating Tabular Bronze table from Raw JSON...")
    
    with engine.connect() as conn:
        # 1. Get that massive JSON blob
        result = conn.execute(text("SELECT observation_json FROM bronze.ons_cpi_observations LIMIT 1;"))
        row = result.fetchone()
        
        if row:
            # 2. Flatten into a DataFrame
            # Since the JSON is a list of dicts, Pandas handles this instantly
            raw_data = row[0]
            df_bronze_raw = pd.DataFrame(raw_data)
            
            # 3. Save as a "Raw Table" in Bronze
            # We don't clean anything here. We keep the weird column names (v4_0, etc.)
            df_bronze_raw.to_sql(
                name='ons_cpi_tabular',
                con=engine,
                schema='bronze',
                if_exists='replace',
                index=False
            )
            print(f"✅ Success! Created 'bronze.ons_cpi_tabular' with {len(df_bronze_raw)} rows.")
        else:
            print("❌ No JSON blob found to flatten.")

if __name__ == "__main__":
    build_tabular_bronze()
