import pyodbc

print(pyodbc.drivers())

_conn = pyodbc.connect("Driver={ODBC Driver 17 for SQL Server};Server=tcp:syn-syr-dev-001.sql.azuresynapse.net,1433;Database=synsyrpooldev;Uid=268fe733-439e-49e3-99f3-ad71ef5dbe44;Encrypt=yes;TrustServerCertificate=no;Connection Timeout=30;Authentication=ActiveDirectoryIntegrated;")
