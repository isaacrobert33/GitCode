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

def clone_repository(repo_url: dict, username=None, pwd=None):
    """
    Clone a repository
    >>> clone_clone(json_data: dict) -> Dict[str, Any]
    """
    repo_name = repo_url.split("/")[-1].replace(".git", "")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    if username and pwd:
        s = repo_url.split("//")
        if "@" in s[1]: s[1] = s[1].split("@")[-1]
        s[1] = f"{username}:{pwd}@{s[1]}"
        
        repo_url = "//".join(s)

    try:
        res = repo.Repo.clone_from(repo_url, repo_dir)
    except Exception as e:
        return {"msg": e, "data": "", "code": 500}
    
    response = jsonify({"data": {"repo_path": repo_dir}, "msg": f"{repo_name.capitalize()} cloned succesfully"})
    response.status_code = 201
    response.headers["access-control-allow-origin"] = "*"
    return response

def initialize_repo(json_data: dict):
    """
    Initialize a local git repository
    """
    repo_name = json_data.get("repo_name", "New Repository")
    remote_url = json_data.get("remote_url")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    try:
        repo_instance = repo.Repo.init(os.path.join(HOMEPATH, repo_name))
    except Exception as e:
        return {"msg": "Error initializing repo", "error": e}, 500

    if remote_url:
        remote = repo_instance.create_remote("origin", remote_url)
        if remote.exists():
            response = jsonify({"msg": "Repo initialized and remote added succesfully", "error": "", "data": {"repo_dir": repo_dir}})
        else:
            response = jsonify({"msg": "Repo initialized succesfully", "error": "Remote not added successfully", "data": {"repo_dir": repo_dir}})

    else:
        response = jsonify({"msg": "Repo initialized successfully", "data": {"repo_dir": repo_dir, "branch_name": repo_instance.active_branch.name}})
    
    response.status_code = 201
    response.headers["access-control-allow-origin"] = "*"
    return response

def commit_changes(json_data: dict):
    """
    Commit Changes on a repository
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    author = json_data.get("author")
    repo_instance = repo.Repo(repo_dir)
    repo_instance.git.add(update=True)
    response = jsonify()
    try:
        if author:
            msg = repo_instance.git.commit("-m", json_data["commit_msg"], author=author)
        else:
            msg = repo_instance.git.commit("-m", json_data["commit_msg"])
        
        response = jsonify({"msg": "Changes commited succesfully", "error": "", "data": {"repo_dir": repo_dir, "msg": msg}})
    except Exception as e:
        msg = str(e).split("stdout:")[1]
        response = jsonify({"msg": "Failed to commit changes", "error": msg, "data": {"repo_dir": repo_dir, "msg": msg, "branch_name": repo_instance.active_branch.name}})

    response.status_code = 201
    response.headers["access-control-allow-origin"] = "*"
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

def pull_remote(json_data: dict):
    """
    Pull remote refs
    >>> pull_remote(json_data, request) -> Response
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    repo_instance = repo.Repo(repo_dir)
    current_branch_name = repo_instance.active_branch.name
    # origin = repo_instance.remote(json_data["origin"])
    g = Git(repo_dir)

    try:
        branch_name = json_data.get("branch_name", current_branch_name)
        pull = g.pull(json_data.get("origin", "origin"), branch_name)
        
    except GitCommandError as e:
        response = jsonify({"msg": "Error pulling remote changes", "error": str(e)})
        return response

    response = jsonify({"msg": "Successfullly pulled changes", "data": {"repo_dir": repo_dir, "branch_name": branch_name, "msg": pull}})
    response.headers["access-control-allow-origin"] = "*"
    return response

def push_to_remote(json_data: dict):
    """
    Push to remote refs
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    repo_instance = repo.Repo(repo_dir)
    branch_name = json_data.get("branch_name", repo_instance.active_branch.name)
  
    try:
        msg = repo_instance.git.push("origin", branch_name)
        response = jsonify({"msg": "Pushed changes successfullly", "error": "", "data": {"msg": str(msg), "repo_dir": repo_dir, "branch_name": branch_name}})
        response.status_code = 201
    except Exception as e:
        print(e)
        response = jsonify({"msg": "Failed to push to remote", "error": str(e), "data": {"repo_dir": repo_dir, "branch_name": branch_name}})
        response.status_code = 500

    response.headers["access-control-allow-origin"] = "*"
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
    response.headers["access-control-allow-origin"] = "*"
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
    response.headers["access-control-allow-origin"] = "*"
    return response

def explore_directory(dir_path):
    if os.path.exists(dir_path):
        dir_list = os.listdir(dir_path)

        data = [{"name": file, "type": "file" if os.path.isfile(os.path.join(dir_path, file)) else "dir"} for file in dir_list]
    else:
        data = []

    data = sorted(data, key=lambda x: x['name'])
    response = jsonify({"msg": "Directory retrieved successfully", "data":  data})
    response.status_code = 201
    response.headers["access-control-allow-origin"] = "*"
    return response

def toolbar_options():
    name, info, _id = "name", "info", "id"
    data = {
        "file": [
            {_id: "open_file", name: "Open File", info: "Open a file"},
            {_id: "new_file", name: "New File", info: "Create a new file"},
            {_id: "save", name: "Save as", info: "Save file"},
            {_id: "explorer", name: "Directory explorer", info: "Files explorer"}
            ],
        "git": [
            {_id: "clone", name: "Clone", info: "git clone"},
            {_id: "stage", name: "Stage", info: "git add"},
            {_id: "commit", name: "Commit", info: "git commmit -m"}, 
            {_id: "push", name: "Push", info: "git push "}, 
            {_id: "pull", name: "Pull", info: "git pull"}, 
            {_id: "all_repo", name: "All repositories", info: "All git repositories"}
            ],
        "help": [
            {_id: "about", name: "About", info: "About GitCode"}
            ],
    }
    response = jsonify({"msg": "Fetched successfully!", "data": data})
    response.status_code = 201
    response.headers["access-control-allow-origin"] = "*"
    return response