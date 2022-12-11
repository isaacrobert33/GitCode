from genericpath import isfile
import json
from urllib import response
from git import repo, Git
from flask import make_response, jsonify
from flask import send_file
from werkzeug.utils import secure_filename
from git.exc import GitCommandError
# from dotenv import load_dotenv
import codecs
import shutil
import os
# import requests

HOMEPATH = "./repositories"

def response_service(data=dict(), msg="No data", code=200):
    status = "success" if code < 400 else "error"
    response = jsonify({"msg": msg, "data": data, "code": code, "status": status})
    response.status_code = code
    response.headers["access-control-allow-origin"] = "*"
    return response

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

    elif pwd:
        s = repo_url.split("//")
        if "@" in s[1]: s[1] = s[1].split("@")[-1]
        s[1] = f"{username}:{pwd}@{s[1]}"
        repo_url = "//".join(s)

    try:
        repo.Repo.clone_from(repo_url, repo_dir)
    except Exception as e:
        return response_service(data={}, msg=str(e), code=500)
    
    return response_service(data={"repo_path": repo_dir}, msg=f"{repo_name.capitalize()} cloned succesfully", code=200)

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
        return response_service(data={}, msg=f"{e}", code=500)

    if remote_url:
        remote = repo_instance.create_remote("origin", remote_url)
        if remote.exists():
            response = response_service(data={"repo_dir": repo_dir}, msg="Repo initialized and remote added succesfully", code=200)
        else:
            response = response_service(msg="Repo initialized succesfully", data={"repo_dir": repo_dir}, code=200)

    else:
        response = response_service(msg="Repo initialized successfully", data={"repo_dir": repo_dir, "branch_name": repo_instance.active_branch.name}, code=200)
    
    response.status_code = 201
    response.headers["access-control-allow-origin"] = "*"
    return response

def commit_changes(json_data: dict):
    """
    Commit Changes on a repository
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    author = json_data.get("author", "")
    repo_instance = repo.Repo(repo_dir)
    repo_instance.git.add(update=True)
    os.chdir(repo_dir)
    repo_instance.git.add(".")
    os.chdir("../")
    os.chdir("../")
    response = jsonify()
    try:
        msg = repo_instance.git.commit("-m", json_data["commit_msg"], author=author)
        response = response_service(msg="Changes commited succesfully", data={"repo_dir": repo_dir, "msg": msg}, code=200)
    except Exception as e:
        msg = str(e).split("stdout: ")[1]
        response = response_service(msg="Failed to commit changes", data={"repo_dir": repo_dir, "msg": msg, "branch_name": repo_instance.active_branch.name}, code=200)

    return response

def switch_branch(json_data: dict):
    """
    Checkout to branch
    switch_branch(json_data={}, request) -> Response
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    branch_name = json_data["branch_name"]

    if not repo_dir:
        return response_service(data={}, msg="Not currently in a repo", code=403)

    repo_instance = repo.Repo(repo_dir)

    try:
        params = json_data.get("params", None)

        if params:
            checkout = repo_instance.git.checkout(params, branch_name)
        else:
            checkout = repo_instance.git.checkout(branch_name)
    except GitCommandError as e:
        branch_name = repo_instance.active_branch.name
        branch_name = branch_name if len(branch_name) < 18 else f"{branch_name[:18]}..."
        response = response_service(
            data={"msg": str(e).split("stderr: ")[1], "repo_dir": repo_dir, "branch_name": branch_name},
            msg=f"Branch '{branch_name}' does not exists", code=404
            )
        return response

    branch_name = repo_instance.active_branch.name
    branch_name = branch_name if len(branch_name) < 18 else f"{branch_name[:18]}..."
    response = response_service(
        msg="Checked out to {branch_name} successfullly",
        data={"repo_dir": repo_dir, "branch_name": branch_name, "msg": checkout}, 
        code=200
        )
    
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
        branch_name = repo_instance.active_branch.name
        branch_name = branch_name if len(branch_name) < 18 else f"{branch_name[:18]}..."
        response = response(
            msg="Error pulling remote changes",
            data={"msg": str(e).split("stderr: ")[1], "repo_dir": repo_dir, "branch_name": branch_name},
            code=500
            )
        return response

    branch_name = repo_instance.active_branch.name
    branch_name = branch_name if len(branch_name) < 18 else f"{branch_name[:18]}..."
    response = response_service(
        msg="Successfullly pulled changes",
        data={"repo_dir": repo_dir, "branch_name": branch_name, "msg": pull},
        code=200
    )
    return response

def push_to_remote(json_data: dict):
    """
    Push to remote refs
    """
    repo_name = json_data.get("repo_name")
    repo_dir = os.path.join(HOMEPATH, repo_name)
    repo_instance = repo.Repo(repo_dir)
    branch_name = json_data.get("branch_name", repo_instance.active_branch.name)

    if not branch_name:
        branch_name = repo_instance.active_branch.name
  
    try:
        msg = repo_instance.git.push("origin", branch_name)
    except Exception as e:
        print(e)
        if "set-upstream" in str(e):
            msg = repo_instance.git.push("--set-upstream", "origin", branch_name)
        else:
            response = response_service(
                msg="Failed to push to remote", 
                data={"repo_dir": repo_dir, "branch_name": branch_name, "msg": str(e).split("stderr: ")[1]}, 
                code=500
            )
            return response

    branch_name = repo_instance.active_branch.name
    branch_name = branch_name if len(branch_name) < 18 else f"{branch_name[:18]}..."
    response = response_service(
        msg="Pushed changes successfullly", 
        data={"msg": str(msg), "repo_dir": repo_dir, "branch_name": branch_name},
        code=200
        )
    return response

def get_status(repo_name: str):
    """
    Get Git status
    """
    repo_dir = os.path.join(HOMEPATH, repo_name)

    if not os.path.exists(repo_dir):
        return response_service(data={"msg": "Repo doesn't exist"}, msg="Repo doesn't exist", code=404)

    g = Git(repo_dir)
    status = None
    try:
        status = g.status()
    except Exception as e:
        response = response_service(
            data={"msg": str(e)},
            msg="Error fetching git status for current repo",
            code=500
            )
        
        return response

    response = response_service(data={"msg": status}, msg="Fetched status succesfully", code=200)
    return response

def get_branches(repo_name: str):
    """
    Get Repo's branches
    >>> get_branches()
    """
    repo_dir = os.path.join(HOMEPATH, repo_name)

    if not os.path.exists(repo_dir):
        return response_service(data={"msg": "Repo doesn't exist"}, msg="Repo doesn't exist", code=404)

    g = Git(repo_dir)
    try:
        branch = g.branch()
    except Exception as e:
        response = response_service(
            data={"msg": str(e)},
            msg="Error fetching git branch for current repo",
            code=500
            )
        
        return response

    response = response_service(data={"msg": branch}, msg="Fetched branches succesfully", code=200)
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
    repo_dir, repo_name, branch_name, file_path = "", "", "", os.path.join(HOMEPATH, file_path.lstrip("/"))
    filename = os.path.basename(file_path)
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
    else:
        content = "File path does not exist"
        
    repos = os.listdir(HOMEPATH)
    for i in repos:
        if os.path.isfile(os.path.join(HOMEPATH, i)):
            repos.pop(repos.index(i))
  
    for repos in repos:
        if repos in file_path:
            repo_name = file_path.split("/")[file_path.split("/").index("repositories")+1]
            repo_dir = os.path.join(HOMEPATH, repo_name)
            try:
                repo_instance = repo.Repo(repo_dir)
                branch_name = repo_instance.active_branch.name
            except Exception as e:
                branch_name = ""
                repo_name = ""
                repo_dir = ""
    
    branch_name = branch_name if len(branch_name) < 18 else f"{branch_name[:18]}..."
    response = response_service(
        msg="Content fetched successfully", 
        data={"filename": filename, "content": content, "branch_name": branch_name, "repo_name": repo_name, "repo_dir": repo_dir},
        code=200
        )
    return response

def delete_file(file_path):
    error = None
    file_path = os.path.join(HOMEPATH, file_path.lstrip("/"))
  
    if os.path.exists(file_path):
        os.remove(file_path)
    else:
        error = True
    
    response = response_service(data={"msg": "File deleted successfully!"}, msg="File deleted successfully!" if not error else "Error deleting file!", code=200 if not error else 500)
    return response

def save_file_content(request):
    error = None
    file_path = request.args.get("file_path")
    data = request.get_json().get("content")
    file_path = os.path.join(HOMEPATH, file_path.lstrip("/"))
    
    if not request.args.get("is_dir"):
        if os.path.exists(file_path) and data:
            with open(file_path, "w") as f:
                f.write(data)
            f.close()
        else:
            with open(file_path, "w") as f:
                f.write("")
            f.close()
    else:
        os.mkdir(file_path)
    
    response = response_service(data={}, msg="File saved successfully!" if not error else "Error saving file!", code=200 if not error else 500)
    return response

def upload_file(request, file_dir):
    error = None
    file_data = request.files['file']
    file_path = os.path.join(HOMEPATH, file_dir.lstrip("/"))
    full_file_path = os.path.join(file_path, file_data.filename)
    file_data.save(full_file_path)
    response = response_service(data={}, msg="File uploaded successfully!" if not error else "Error uploading file!", code=200 if not error else 500)
    return response

def download_file(file_path):
    file_path = os.path.join(HOMEPATH, file_path.lstrip("/"))
    print(file_path)
    if os.path.exists(file_path):
        data = send_file(path_or_file=file_path, as_attachment=True, download_name=os.path.basename(file_path))
        data.status_code = 200
        data.headers["access-control-allow-origin"] = "*"
        return data
    else:
        return response_service(data={"msg":"Couldn't fetch the file"}, msg="Couldn't fetch the file", code=500)

def explore_directory(dir_path):
    dir_path = os.path.join(HOMEPATH, dir_path.lstrip("/"))
    if os.path.exists(dir_path) and os.path.isdir(dir_path):
        dir_list = os.listdir(dir_path)
        data = [{"name": file, "type": "file" if os.path.isfile(os.path.join(dir_path, file)) else "dir"} for file in dir_list]
    elif os.path.exists(dir_path) and os.path.isfile(dir_path):
        response = get_file_content(dir_path)    
        return response
    else:
        data = []
    
    data = sorted(data, key=lambda x: x['name'])
    data = [e for e in data if e["type"] == "dir"]+[e for e in data if e["type"] == "file"]
    response = response_service(msg="Directory retrieved successfully", data=data)
    return response

def toolbar_options():
    name, info, _id = "name", "info", "id"
    data = {
        "file": [
            {_id: "open_file", name: "Open File", info: "Open a file"},
            {_id: "new_file", name: "New File", info: "Create a new file"},
            {_id: "save", name: "Save", info: "Save file"}
            ],
        "git": [
            {_id: "clone", name: "Clone", info: "git clone"},
            {_id: "stage", name: "Stage", info: "git add"},
            {_id: "commit", name: "Commit", info: "git commit -m"}, 
            {_id: "push", name: "Push", info: "git push "}, 
            {_id: "pull", name: "Pull", info: "git pull"},
            {_id: "checkout", name: "Checkout", info: "git checkout"},
            {_id: "status", name: "Status", info: "git status"},
            {_id: "branch", name: "Branch", info: "git branch"},
            {_id: "init", name: "Initialize a repository", info: "git init"},
            {_id: "all_repo", name: "All repositories", info: "All git repositories"}
            ],
        "help": [
            {_id: "about", name: "About", info: "About GitCode"}
            ],
    }
    response = response_service(msg="Fetched successfully!", data=data, code=200)
    return response