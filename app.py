from urllib import response
from flask import Flask, request, jsonify, render_template, send_file, url_for
from flask_restful import Api, Resource
from flask_cors import CORS
from utils import (
    HOMEPATH,
    clone_repository,
    explore_directory,
    initialize_repo,
    pull_remote,
    push_to_remote,
    switch_branch,
    commit_changes,
    get_file_content,
    save_file_content,
    toolbar_options
)
import os

app = Flask(__name__)
api = Api(app=app)
cors = CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/static/<path:static_path>")
def static_path(static_path):
    path = url_for("static", filename=static_path)
    print(path)
    return path

@app.route("/<path:file_path>")
def get_file_path(file_path):
    file_path = os.path.join("templates", file_path)
    print(file_path)
    return send_file(file_path)

class CloneRepository(Resource):
    def get(self):
        """
        Clone a repository

        GET /clone?url=https://repo.git&u=isaacrobert33&pwd=...
        """
        repo_url = request.args.get("url")
        pwd = request.args.get("pwd")
        username = request.args.get("u")
        if not repo_url:
            response = jsonify({"msg": "Bad request!", "data": "", "code": 401})
            response.headers["access-control-allow-origin"] = "*"
            return response

        response = clone_repository(repo_url, username, pwd)
        return response

class InitRepository(Resource):
    def post(self):
        """
        Initialize a repo
        PAYLOAD:
            {
                "repo_name": "New Repository",
                "remote_url": ""
            }
        """
        json_data = request.get_json()
        if not json_data:
            return jsonify({"msg": "Bad request!", "data": "", "code": 401})

        response = initialize_repo(json_data=json_data)
        return response

class CommitChanges(Resource):
    def post(self):
        """
        Commit Changes

        PAYLOAD:
            {
                "repo_name": "Repository",
                "commit_msg": "Initial commit"
            }
        """
        json_data = request.get_json()
        if not json_data:
            return jsonify({"msg": "Bad request!", "data": "", "code": 401})

        response = commit_changes(json_data)
        return response

class PushRemote(Resource):
    def post(self):
        """
        {
            "repo_name": "Repository",
            "branch_name": "master"
        }
        """
        json_data = request.get_json()
        if not json_data:
            reponse = jsonify({"msg": "Bad request!", "data": "", "code": 401})
            response.headers["access-control-allow-origin"] = "*"
            return response, 401

        response = push_to_remote(json_data)
        return response

class PullRemote(Resource):
    def post(self):
        """
        {
            "repo_name": "Repository",
            "branch_name": "master"
        }
        """
        json_data = request.get_json()
        if not json_data:
            return jsonify({"msg": "Bad request!", "data": "", "code": 401}), 401

        response = pull_remote(json_data)
        return response

class SwitchBranch(Resource):
    def post(self):
        """
        Checkout to a branch
        
        PAYLOAD:
            {
                "branch_name": "dev",
                "repo_name": "",
                "params": ""
            }
        """
        json_data = request.get_json()
        if not json_data:
            return jsonify({"msg": "Bad request!", "data": "", "code": 401})

        response = switch_branch(json_data)
        return response

class FileContent(Resource):
    def get(self):
        """
        Get a file content

        ARGS:
            >>> file_path
        """
        file_path = request.args.get("file_path")

        response = get_file_content(file_path)
        return response

class SaveFile(Resource):
    def post(self):
        """
        Save a file

        ARGS:
            >>> file_path
        """
        file_path = request.args.get("file_path")
        data = request.get_json().get("content")

        response  = save_file_content(file_path=file_path, data=data)
        return response

class FileExplorer(Resource):
    def get(self):
        directory = request.args.get("dir")

        response = explore_directory(directory)
        return response

class ToolbarOpt(Resource):
    def get(self):
        response = toolbar_options()
        return response

api.add_resource(CloneRepository, "/clone")
api.add_resource(InitRepository, "/init_repo")
api.add_resource(CommitChanges, "/commit")
api.add_resource(FileExplorer, "/file_explorer")
api.add_resource(SwitchBranch, "/checkout")
api.add_resource(FileContent, "/file_data")
api.add_resource(PushRemote, "/push")
api.add_resource(PullRemote, "/pull")
api.add_resource(ToolbarOpt, "/toolbar_opt")
api.add_resource(SaveFile, "/save")

if __name__=="__main__":
    app.run(debug=True)
