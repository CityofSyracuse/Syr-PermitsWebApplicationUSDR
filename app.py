from flask import (
    Flask,
    send_from_directory,
    abort,
)
import os
import pyodbc

app = Flask(__name__, static_url_path="", static_folder="build")

DEV_ENV = os.getenv("REACT_APP_SYR_DEV_ENV")
if DEV_ENV == "dev":
    from flask_cors import CORS

    CORS(app)
    app.config["CORS_HEADERS"] = "Content-Type"


def create_db_connection():
    username = os.getenv("sql_user")
    password = os.getenv("sql_user_password")

    connection_string = (
        "DRIVER={ODBC Driver 17 for SQL Server};"
        "SERVER=tcp:syn-syr-dev-001.sql.azuresynapse.net,1433;"
        "DATABASE=synsyrpooldev;"
        f"UID={username};"
        f"PWD={password};"
        "Encrypt=yes;"
        "TrustServerCertificate=no;"
        "Connection Timeout=30;"
    )

    return pyodbc.connect(connection_string)


try:
    db_connection = create_db_connection()
except Exception as e:
    print("failed to connect to database: " + str(e))
    db_connection = None


@app.route("/api/permit/<id>")
def get_permit_info(id):

    permit_info_query = (
        "SELECT permit_application_id, application_number, application_date, description_of_work, permit_type_name, "
        "status_type_name, user_note, Permit_Type_IPS, SLA_Time_Days, sla_days_td, sla_projected_completion_date "
        "FROM permit_with_sla_lookup WHERE application_number = ?"
    )

    with db_connection.cursor() as cursor:
        cursor.execute(permit_info_query, id)
        result = cursor.fetchone()
        if result is None:
            abort(404)

        columns = [column[0] for column in cursor.description]
        return dict(zip(columns, result))


@app.route("/api/permit/<id>/department-status/<department_id>")
def get_department_status(id, department_id):
    print(id, department_id)
    if not (id == "43215" and department_id == "1"):
        abort(404)

    return {
        "title": "Plan is on hold by the Fire Prevention Bureau",
        "reviewer": "Mirza Malkoc",
        "last_updated": "MMM/DD/YYYY",
        "notes": [
            "Completed review of FA floor plans, complete corrections reort - see attached - emailed to Mike Ripa at Davis Ulmer.  BFogarty",
            "Above application cannot be approved. To learn more please contact the plan reviewer(s) above. Contact information can be found on the City's website: http://www.syracuse.ny.us/Pre-Development_Contacts.aspx.",
            "If revised plans are required, they must be submitted back to the Central Permit Office for redistribution. Do not submit revised plans directly to reviewing departments.",
        ],
    }


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run()
