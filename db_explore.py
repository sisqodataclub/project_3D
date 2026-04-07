from sqlalchemy import create_engine, text, inspect

# 1. Your VPS Connection Details
DB_USER = "dbuser"
DB_PASSWORD = "strongpassword" # Replace this!
DB_HOST = "46.225.16.57"
DB_PORT = "5432"
DB_NAME = "mydb"

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
engine = create_engine(DATABASE_URL)

def explore_database():
    print(f"🔄 Connecting to {DB_HOST}...")
    try:
        with engine.connect() as conn:
            print("✅ Connected successfully!\n")
            
            # The Inspector lets us look at the structure of the database
            inspector = inspect(engine)
            schemas = inspector.get_schema_names()
            
            # Filter out the default Postgres system schemas so we only see your data
            ignore_schemas = ['information_schema', 'pg_catalog', 'pg_toast']
            user_schemas = [s for s in schemas if s not in ignore_schemas]
            
            print(f"📁 Found schemas: {user_schemas}\n")
            
            for schema in user_schemas:
                tables = inspector.get_table_names(schema=schema)
                if not tables:
                    print(f"--- Schema: '{schema}' is empty ---")
                    continue
                    
                print(f"=== Schema: '{schema}' ===")
                for table in tables:
                    # 1. Count the rows in the table
                    count_query = text(f'SELECT COUNT(*) FROM "{schema}"."{table}"')
                    count = conn.execute(count_query).scalar()
                    
                    print(f"\n🗄️ Table: {table} (Total Rows: {count})")
                    
                    # 2. If there is data, show a preview of the first 3 rows
                    if count > 0:
                        preview_query = text(f'SELECT * FROM "{schema}"."{table}" LIMIT 3')
                        result = conn.execute(preview_query)
                        columns = list(result.keys())
                        
                        print(f"   Columns: {columns}")
                        print("   Preview:")
                        for row in result.fetchall():
                            print(f"   - {row}")
                    print("-" * 40)
                    
    except Exception as e:
        print("❌ Connection failed.")
        print(f"Error details: {e}")
        print("\n💡 Tip: If this times out, your VPS firewall is blocking port 5432.")

if __name__ == "__main__":
    explore_database()
