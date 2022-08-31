import pyodbc
import pandas as pd

q = "SELECT * FROM permit_with_sla_lookup"

_conn = pyodbc.connect("Driver={ODBC Driver 17 for SQL Server};Server=tcp:syn-syr-dev-001.sql.azuresynapse.net,1433;Database=synsyrpooldev;Uid=xxx-xxx;Pwd=xxx-xxx;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;Authentication=ActiveDirectoryIntegrated;")

df = pd.read_sql(q, _conn)
print(df)