import pandas as pd
from sqlalchemy import create_engine, text

# Connection Details
DB_USER = "dbuser"
DB_PASSWORD = "strongpassword" 
DB_HOST = "46.225.16.57"
DB_PORT = "5432"
DB_NAME = "mydb"

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

def transform_to_silver():
    print("🧹 Extracting 'Overall Index' from Bronze to Silver...")
    
    # 1. Fetch only the rows we need from the Tabular Bronze table
    # Using SQL filtering here is faster than pulling all 49k rows into Python
    query = text("""
        SELECT "Time", "v4_0" as cpi_value 
        FROM bronze.ons_cpi_tabular 
        WHERE "Aggregate" = 'Overall Index'
    """)
    
    df = pd.read_sql(query, con=engine)
    
    if df.empty:
        print("❌ Error: No rows found for 'Overall Index'. Check the name.")
        return

    # 2. Convert 'Sep-94' to proper Date objects
    # This turns the text into actual sortable, queryable dates
    df['observation_date'] = pd.to_datetime(df['Time'], format='%b-%y', errors='coerce')
    
    # 3. Cleanup and Sort
    # We remove the old 'Time' text column and keep the proper date
    silver_df = df[['observation_date', 'cpi_value']].dropna()
    silver_df = silver_df.sort_values('observation_date')

    print(f"✅ Cleaned {len(silver_df)} months of headline inflation data.")

    # 4. Save to Silver Schema
    silver_df.to_sql(
        name='uk_inflation_headline',
        con=engine,
        schema='silver',
        if_exists='replace',
        index=False
    )
    print("🎉 Table 'silver.uk_inflation_headline' is now live on your VPS!")

if __name__ == "__main__":
    transform_to_silver()
