import json
from urllib import response
from git import repo, Git
from flask import make_response, jsonify
from git.exc import GitCommandError
# from dotenv import load_dotenv
import codecs
import shutil
import os
# import requests

HOMEPATH = "./repositories"

def clone_repository(repo_url: dict):
    """
    Clone a repository
    >>> clone_clone(json_data: dict) -> Dict[str, Any]
    """
    repo_name = repo_url.split("/")[-1].replace(".git", "")
    repo_dir = os.path.join(HOMEPATH, repo_name)

    try:
        res = repo.Repo.clone_from(repo_url, repo_dir)
    except Exception as e:
        return {"msg": e, "data": "", "code": 500}
    
    response = jsonify({"data": {"repo_path": repo_dir}, "msg": f"{repo_name.capitalize()} cloned succesfully"})
    response.status_code = 201
    return response

def initialize_repo(json_data: dict):
    """
    Initialize a local git repository
    """
    repo_name = json_data.get("repo_name", "New Repository")
    remote_url = json_data.get("remote_url")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    try:
        init_repo = repo.Repo.init(os.path.join(HOMEPATH, repo_name))
    except Exception as e:
        return {"msg": "Error initializing repo", "error": e}, 500

    if remote_url:
        remote = init_repo.create_remote("origin", remote_url)
        if remote.exists():
            response = jsonify({"msg": "Repo initialized and remote added succesfully", "error": "", "data": {"repo_dir": repo_dir}})
            response.status_code = 201
        else:
            response = jsonify({"msg": "Repo initialized succesfully", "error": "Remote not added successfully", "data": {"repo_dir": repo_dir}})
            response.status_code = 201
    else:
        respone = jsonify({"msg": "Repo initialized successfully", "data": {"repo_dir": repo_dir}})
        response.status_code = 201

    return response

def commit_changes(json_data):
    """
    Commit Changes on a repository
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    
    repo_instance = repo.Repo(repo_dir)
    msg = repo_instance.commit("-m", json_data["commit_msg"])
    
    response = jsonify({"msg": "Changes commited succesfully", "error": "", "data": {"repo_dir": repo_dir, "msg": msg}})
    response.status_code = 201
    return response

def switch_branch(json_data: dict):
    """
    Checkout to branch
    switch_branch(json_data={}, request) -> Response
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    branch_name = json_data["branch_name"]
    repo_instance = repo.Repo(repo_dir)

    try:
        params = json_data.get("params", None)
        if  params:
            checkout = repo_instance.git.checkout(params, branch_name)
        else:
            checkout = repo_instance.git.checkout(branch_name)
    except GitCommandError:
        response = jsonify({"msg": f"Branch '{branch_name}' does not exists"})
        response.status_code = 404
        return response

    branch_name = repo_instance.active_branch.name
    response.json = jsonify({"msg": "Checked out to {branch_name} successfullly", "data": {"repo_dir": repo_dir, "branch_name": branch_name, "msg": checkout}})
    response.status_code = 201
    return response

def pull_remote(json_data: dict, request):
    """
    Pull remote refs
    >>> pull_remote(json_data, request) -> Response
    """
    repo_name = request.args.get("repo")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    repo_instance = repo.Repo(repo_dir)
    branch_name = repo_instance.active_branch.name
    # origin = repo_instance.remote(json_data["origin"])
    g = Git(repo_dir)
    response = make_response()
    
    try:
        branch_name = json_data.get("branch_name", None)
        if branch_name:
            pull = g.pull(json_data.get("origin", "origin"), branch_name)
        else:
            pull = g.pull(json_data.get("origin", "origin"))
    except GitCommandError:
        response.json = {"msg": "Error pulling remote changes"}
        return response

    compressed = compress_dir(repo_dir)
    data = "No data"
    if compressed:
        data = codecs.open(compressed, "rb").read()

    # merge = repo_instance.git.merge(repo_instance.active_branch)
    response.json = {"msg": pull}
    response.data = data
    return response

def push_to_remote(json_data: dict, request):
    """
    Push to remote refs
    """
    repo_name = request.args.get("repo")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    repo_instance = repo.Repo(repo_dir)
    branch_name = repo_instance.active_branch.name
    origin = repo_instance.remote(json_data["origin"])
    msg = origin.push()
    response = make_response()
    response.json = {"msg": msg}
    response.status_code = 201
    return response

def compress_dir(path: str):
    """
    Compress repository folder to zip
    >>> compress_dir("repo-dir") -> "repo-dir"
    """
    shutil.make_archive(path, "zip", path)

    if os.path.exists(f"{path}.zip"):
        return f"{path}.zip"
    else:
        return False

def get_file_content(file_path: str):
    repo_dir, repo_name, branch_name = "", "", ""

    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
    else:
        content = "File path does not exist"
    if "repositories" in file_path:
        repo_name = file_path.split("/")[file_path.split("/").index("repositories")+1]
        repo_dir = os.path.join(HOMEPATH, repo_name)
        repo_instance = repo.Repo(repo_dir)
        branch_name = repo_instance.active_branch.name

    response = jsonify({
        "msg": "Content fetched successfully", 
        "data": {"content": content, "branch_name": branch_name, "repo_name": repo_name, "repo_dir": repo_dir}
        })
    response.status_code = 201
    return response

def save_file_content(file_path, data):
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            f.write(data)
        msg = ""
    else:
        msg = "File path does not exist"
    
    response = jsonify({"msg": "File saved successfully", "data": {"repo_name": msg}})
    response.status_code = 201
    return response

def explore_directory(dir_path):
    if os.path.exists(dir_path):
        dir_list = os.listdir(dir_path)

        data = [{"fname": file, "type": "file" if os.path.isfile(os.path.join(dir_path, file)) else "dir"} for file in dir_list]
        msg = ""
    else:
        data = []
        msg = "Directory path does not exists"

    response = jsonify({"msg": "Directory retrieved successfully", "data": {"msg": msg, "data": data}})
    response.status_code = 201
    return response

def toolbar_options():
    name, info = "name", "info"
    data = {
        "file": [
            {name: "Open File", info: "Open a file"},
            {name: "New File", info: "Create a new file"},
            {name: "Save as", info: "Save file"},
            {name: "Directory explorer", info: "Files explorer"}
            ],
        "git": [
            {name: "Add", info: "git add"},
            {name: "Commit", info: "git commmit -m"}, 
            {name: "Push", info: "git push "}, 
            {name: "Pull", info: "git pull"}, 
            {name: "All repositories", info: "All git repositories"}
            ],
        "help": [
            {name: "About", info: "About GitCode"}
            ],
    }
    response = jsonify({"msg": "Fetched successfully!", "data": data})
    response.status_code = 201
    return response