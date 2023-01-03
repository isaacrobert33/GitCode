import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import './App.css';
// import Toast from './Toast';
// import { useState } from 'react';
import git_icon from './git-icon.svg';

var host = "http://172.20.10.5:5000"
// var host = process.env.REACT_APP_HOST;
// var host = "";

const PostInit = (json) => {
    return {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(json)
    }
};

var GetInit = {
    method: "GET",
    headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
    }
};

function hideToast() {
    let toast = document.getElementById("toast");
    toast.style.bottom = "-90px";
    setTimeout(
        () => (
            toast.style.display = "none"
        ), 1000
    )
    
}

function popToast(msg) {
    let toast = document.getElementById("toast");
    toast.innerText = msg;
    toast.style.display = "block";
    setTimeout(
        () => (
            toast.style.bottom = "50%"
        ), 500
    )
    setTimeout(
        () => {
            hideToast();
        }, 8000
    )
    
}

const Commit = ({currentRepo}) => {
    const commit = async () => {
        document.getElementById("commit-btn").text = "Commiting...";
        let commit_msg = document.getElementById("commit_msg");
        let repo_name = document.getElementById("repo_name");
        let branch_name = document.getElementById("branch_name");
        let author = document.getElementById("author");
        let payload = {"repo_name": repo_name.value, "branch_name": branch_name.value, "author": author.value, "commit_msg": commit_msg.value}
        let response = await fetch(`${host}/commit`, PostInit(payload));
        let json_data = await response.json();
        popToast(json_data.data.msg);
        document.getElementById("git-board").style.display = "none";
        branch_name.value = "";
        author.value = "";
        commit_msg.value = "";

    }
    return (
        <div className='git-ui'>
            <input className='text-input' id="repo_name" placeholder='Repository name' value={currentRepo}/>
            <input className='text-input' id='commit_msg' placeholder='Commit message'/>
            <input className='text-input' id='branch_name' placeholder='Branch name (optional)'/>
            <input className='text-input' id='author' placeholder='Author (optional)' />
            <button className='git-btn' id='commit-btn' onClick={(e) => {
                commit()
            } }>Commit</button>
        </div>
    )
}

const Push = ({currentRepo}) => {
    const push = async () => {
        document.getElementById("push-btn").text = "Pushing...";
        let repo_name = document.getElementById("repo_name");
        let branch_name = document.getElementById("branch_name");
        let payload;
        if (branch_name) {
            payload = {"repo_name": repo_name.value, "branch_name": branch_name.value}
        } else {
            payload = {"repo_name": repo_name.value}
        }
        
        let response = await fetch(`${host}/push`, PostInit(payload));
        let json_data = await response.json();
        branch_name.value = "";
        popToast(json_data.data.msg);
        document.getElementById("git-board").style.display = "none";
    }
    return (
        <div className='git-ui'>
            <input className='text-input' id="repo_name" placeholder='Repository name' value={currentRepo}/>
            <input className='text-input' id='branch_name' placeholder='Branch name (Optional)'/>
            <button className='git-btn' id='push-btn' onClick={() => {
                push()
            }}>Push</button>
        </div>
    )
}

const Pull = ({currentRepo}) => {
    const pull = async () => {
        document.getElementById("pull-btn").text = "Pulling..."
        let repo_name = document.getElementById("repo_name");
        let branch_name = document.getElementById("branch_name");
        let payload = {"repo_name": repo_name.value, "branch_name": branch_name.value}
        let response = await fetch(`${host}/pull`, PostInit(payload));
        let json_data = await response.json();
        branch_name.value = "";
        popToast(json_data.data.msg);
        document.getElementById("git-board").style.display = "none";
    }
    return (
        <div className='git-ui'>
            <input className='text-input' id="repo_name" placeholder='Repository name' value={currentRepo}/>
            <input className='text-input' id='branch_name' placeholder='Branch name (Optional)'/>
            <button className='git-btn' id='pull-btn' onClick={(e) => {
                pull()
            }} >Pull</button>
        </div>
    )
}

const Clone = () => {
    const clone_repo = async () => {
        document.getElementById("clone-btn").text = "Cloning..";
        let url = document.getElementById("repo_url");
        let pwd = document.getElementById("pwd");
        let uname = document.getElementById("uname");
        let response = await fetch(`${host}/clone?url=${url.value}&pwd=${pwd.value}&u=${uname.value}`, GetInit);
        let json_data = await response.json();
        pwd.value = "";
        uname.value = "";
        popToast(json_data.msg);
        document.getElementById("git-board").style.display = "none";
    }

    return (
        <div className='git-ui'>
            <input className='text-input' id='repo_url' placeholder='Repository URL'/>
            <input className='text-input' id='uname' placeholder='Username (optional)' />
            <input className='text-input' id='pwd' placeholder='Password (optional)'/>
            <button className='git-btn' id='clone-btn' onClick={
                (e) => (
                    clone_repo()
                )
            }>Clone</button>
        </div>
    )
}

const Checkout = ({currentRepo, setBranchName}) => {

    const checkout = async () => {
        let repo_name = document.getElementById("repo_name");
        let branch_name = document.getElementById("branch_name");
        let new_branch = document.getElementById("new_branch");
        let p = "";
        if (new_branch.checked) {
            p = "-b";
        }
        let payload = {
            branch_name: branch_name.value,
            repo_name: repo_name.value,
            params: p
        }
        let response = await fetch(`${host}/checkout`, PostInit(payload));
        let json_data = await response.json();
        branch_name.value = "";
        popToast(json_data.data.msg);
        document.getElementById("git-board").style.display = "none";
        setBranchName(json_data.data.branch_name);
    }
    return (
        <div className='git-ui'>
            <input className='text-input' id="repo_name" placeholder='Repository name' value={currentRepo}/>
            <input className='text-input' id='branch_name' placeholder='Branch to checkout to'/>
            <div className='git-check'>
                <input type="checkbox" id="new_branch" name="new_branch" />
                <label for="new_branch" style={{paddingLeft: "5px"}}>new branch</label>
            </div>
            
            <button className='git-btn' id='clone-btn' onClick={
                (e) => (
                    checkout()
                )
            }>Checkout</button>
        </div>
    )
}

const Branch = ({currentRepo, setBranchName}) => {
    const [branches, setBranches] = useState([]);

    const getBranches = async () => {
        let response = await fetch(`${host}/branch?repo_name=${currentRepo}`);
        let json_data = await response.json();
        setBranches(json_data.data.msg.split("\n"));
    }

    const checkout = async (branch_name) => {
        if (branch_name.includes("*")) {
            popToast("Currently checked out to"+branch_name.replace("*", ""));
            document.getElementById("git-board").style.display = "none";
            return;
        }
        let payload = {
            branch_name: branch_name,
            repo_name: currentRepo
        }
        let response = await fetch(`${host}/checkout`, PostInit(payload));
        let json_data = await response.json();
        
        popToast(json_data.data.msg);
        document.getElementById("git-board").style.display = "none";
        setBranchName(json_data.data.branch_name);
    }

    const startObserver = () => {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                getBranches();
            })
        })
        var target = document.getElementById("git-branch");
        observer.observe(target, {attribute: true, attributeFilter: ['style']});
    }

    useEffect(
        () => {
            getBranches();
            startObserver();
            document.getElementById("git-branch").style.display = "block";
        }, []
    )
    
    return (
        <div className='git-ui' id='git-branch'>
            <h4>Click to checkout</h4>
            <br></br>
                {
                    branches?.length > 0 ? (
                        <ul className='branches'>
                            {
                                branches.map(
                                    (branchName) => (
                                        <li className='branch-li' title={'checkout to '+branchName} onClick={(e) => (checkout(branchName))}>{branchName}</li>
                                    )
                            )
                            }
                        </ul>
                        
                    ) : (
                        <></>
                    )
                }
            
        </div>
    )
}

function getComponent(operation, branch, currentRepo) {
    if (operation === "clone") {
        return (
            <Clone />
        )
    } else if (operation === "commit") {
        return (
            <Commit currentRepo={currentRepo} />
        )
    } else if (operation === "push") {
        return (
            <Push currentRepo={currentRepo} />
        )
    } else if (operation === "pull") {
        return (
            <Pull currentRepo={currentRepo} />
        )
    } else if (operation === "checkout") {
        return (
            <Checkout currentRepo={currentRepo} setBranchName={branch}/>
        )
    } else if (operation === "branch") {
        return (
            <Branch currentRepo={currentRepo} setBranchName={branch}/>
        )
    }
}
const GitBoard = ({operation, branch, currentRepo}) => {
    return (
        <div className='overlay' id='git-board'>
            <div className='main-window'>
                <img className='window-icon' src={git_icon} alt={"git"} />
                <span id='close-btn' onClick={(e) => {
                    document.getElementById("git-board").style.display = "none";
                    if (operation === "branch") {
                        document.getElementById("git-branch").style.display = "none";
                    }
                    }}>&times;</span>
                <h2>Git - {operation.charAt(0).toUpperCase()+operation.slice(1)}</h2>
                {
                    getComponent(operation, branch, currentRepo)
                }
                
            </div>
        </div>
    )
}

export default GitBoard;