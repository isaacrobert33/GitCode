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
    toolbar_options,
    get_status,
    get_branches,
    delete_file,
    download_file,
    upload_file,
    response_service
)
import os

app = Flask(__name__, static_url_path="/repositories")
api = Api(app=app)
cors = CORS(app)

@app.route("/")
def index():
    return render_template("index.html")

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
        
        if not username and "@" in repo_url:
            s = repo_url.split("//")
            username = s[1].split("@")[0]
            print(username)

        if not repo_url or pwd and not username:
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

class Status(Resource):
    def get(self):
        """
        """
        repo_name = request.args.get("repo_name")
        response = get_status(repo_name=repo_name)
        return response

class Branches(Resource):
    def get(self):
        repo_name = request.args.get("repo_name")
        response = get_branches(repo_name=repo_name)
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
        
        response  = save_file_content(request)
        return response

class DeleteFile(Resource):
    def delete(self):
        file_path = request.args.get("file_path")
        response  = delete_file(file_path=file_path)
        return response

class DownloadFile(Resource):
    def get(self):
        file_path = request.args.get("file_path")
        response = download_file(file_path)
        return response

class UploadFile(Resource):
    def post(self):
        file_dir = request.args.get("file_dir")
        response = upload_file(request, file_dir)
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
api.add_resource(DeleteFile, '/delete_file')
api.add_resource(Branches, '/branch')
api.add_resource(DownloadFile, '/download_file')
api.add_resource(UploadFile, '/upload_file')
api.add_resource(Status, "/status")

if __name__=="__main__":
    app.run(debug=True)
    
