from flask import (
    Flask,
    send_from_directory,
    abort,
)
import os

app = Flask(__name__, static_url_path="", static_folder="build")

DEV_ENV = os.getenv('SYR_DEV_ENV')
if DEV_ENV == 'dev':
    from flask_cors import CORS

    CORS(app)
    app.config["CORS_HEADERS"] = "Content-Type"


@app.route("/api/permit/<id>")
def get_permit_info(id):
    if id != "43215":
        abort(404)

    return {
        "number": "43215",
        "submitted_by": "John Doe LLC",
        "permit_type": "Comm. New Building",
        "address": "123 Mulberry Terracem, Syracuse, New York 13202",
        "description": "Lally Athletic Complex. At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti.",
        "department_statuses": [
            {
                "id": 1,
                "department": "Fire prevention",
                "status": "On hold",
                "last_updated": "July 20th, 2022",
            },
            {
                "id": 2,
                "department": "Engineering - D",
                "status": "On hold",
                "last_updated": "July 14th, 2022",
            },
            {
                "id": 3,
                "department": "Water engineer",
                "status": "Pending",
                "last_updated": "March 1st, 2022",
            },
            {
                "id": 4,
                "department": "Engineering - S",
                "status": "Pending",
                "last_updated": "Feb 10th, 2022",
            },
            {
                "id": 5,
                "department": "Zoning planner",
                "status": "Conditionally approved",
                "last_updated": "Jan 5th, 2022",
            },
            {
                "id": 6,
                "department": "Zoning planner",
                "status": "Conditionally approved",
                "last_updated": "Aug 8th, 2021",
            },
        ],
    }


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
