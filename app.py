from datetime import datetime
from flask import (
    Flask,
    render_template,
    request,
    redirect,
    url_for,
    send_from_directory,
)
import os
import pyodbc

app = Flask(__name__, static_url_path="", static_folder="build")


# @app.route("/")
# def index():
#     print("Request for index page received")
#     return render_template("index.html")


# @app.route("/favicon.ico")
# def favicon():
#     return send_from_directory(
#         os.path.join(app.root_path, "static"),
#         "favicon.ico",
#         mimetype="image/vnd.microsoft.icon",
#     )


# @app.route("/hello", methods=["POST"])
# def hello():
#     name = request.form.get("name")

#     if name:
#         print("Request for hello page received with name=%s" % name)
#         return render_template("hello.html", name=name)
#     else:
#         print(
#             "Request for hello page received with no name or blank name -- redirecting"
#         )
#         return redirect(url_for("index"))

@app.route("/hello/")
@app.route("/hello/<name>")
def hello(name=None):
    return {"msg": "hello " + name}


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    return send_from_directory(app.static_folder, "index.html")


@app.errorhandler(404)
def not_found(e):
    return app.send_static_file("index.html")


if __name__ == "__main__":
    app.run()