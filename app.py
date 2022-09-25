from flask import Flask, send_from_directory, abort, render_template
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
    password = os.getenv("sql_user_pwd")

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


def get_address(number, address, city, zip):
    try:
        return number + " " + address + ", " + city + ", New York " + zip
    except Exception as e:
        print("error parsing address: " + str(e))
        return ""


@app.route("/api/permit/<id>")
def get_permit_info(id):

    permit_info_query = (
        "SELECT * FROM permit_with_sla_lookup LEFT JOIN approval_approvals ON "
        "permit_with_sla_lookup.permit_application_id = approval_approvals.record_id "
        "WHERE permit_with_sla_lookup.application_number = ?"
    )

    with db_connection.cursor() as cursor:
        cursor.execute(permit_info_query, id)
        result = cursor.fetchall()
        if len(result) == 0:
            abort(404)

        data = {}
        first_row = result[0]

        data["number"] = first_row.application_number
        data["submitted_by"] = first_row.first_name + " " + first_row.last_name
        data["permit_type"] = first_row.permit_type_name
        data["permit_status"] = first_row.status_type_name
        data["address"] = get_address(
            first_row.number, first_row.address, first_row.city, first_row.zip
        )
        data["description"] = first_row.description_of_work
        data["application_date"] = first_row.application_date
        data["sla_time_days"] = first_row.SLA_Time_Days
        data["sla_projected_completion_date"] = first_row.sla_projected_completion_date
        data["assigned_to"] = first_row.assigned_to
        data["permit_type_ips"] = first_row.Permit_Type_IPS

        department_statuses = []
        for row in result:
            if row.approval_approvals_id is None:
                continue

            department = {}
            department["id"] = row.approval_approvals_id
            department["department"] = row.groupusers_name
            department["status"] = row.approval_status_types_name
            department["last_updated"] = row.date_last_changed
            department["is_active"] = row.is_active
            department["comments"] = row.comments
            department_statuses.append(department)

        data["department_statuses"] = department_statuses

        return data


@app.route("/api/permit/<id>/department-status/<department_id>")
def get_department_status(id, department_id):
    department_status_query = (
        "SELECT * FROM approval_approvals WHERE approval_approvals_id = ?"
    )

    with db_connection.cursor() as cursor:
        cursor.execute(department_status_query, department_id)
        result = cursor.fetchone()
        if result is None:
            abort(404)

        data = {}
        data["id"] = result.approval_approvals_id
        data["department"] = result.groupusers_name
        data["status"] = result.approval_status_types_name
        data["last_updated"] = result.date_last_changed
        data["is_active"] = result.is_active
        data["comments"] = result.comments

        return data


@app.route("/list")
def index():
    permit_number_query = "SELECT application_number FROM permit_with_sla_lookup ORDER BY application_number"

    with db_connection.cursor() as cursor:
        cursor.execute(permit_number_query)
        result = cursor.fetchall()

        return render_template("list.html", nums=[id[0] for id in result])


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run()
