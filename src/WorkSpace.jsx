import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import FileExplorer from './FileExplorer';
import NewFileExplorer from './NewFileExplorer';
import GitBoard from './GitBoard';
import Toast from './Toast';
import gitfork from './gitfork.svg'
// import git_icon from './git-icon.svg';
// import git_folder from './git-dir.svg';

var host = "http://127.0.0.1:5000";
// var host = "";

const DropDown = ({ id, list, callback }) => {
    return (
        <div id={id} className='dropdown'>
            {
                list.map((item) => (
                    <a href={"#"+item.id} onClick={callback(item.id)} className='dropdown-item' title={item.info}>{item.name}</a>
                    
                ))
            }
        </div>
    )
}

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

// var GetInit = {
//     method: "GET",
//     headers: {
//         "Accept": "application/json",
//         "Content-Type": "application/json"
//     }
// };

function hideToast() {
    let toast = document.getElementById("toast");
    toast.style.bottom = "-90px";
    setTimeout(
        () => (
            toast.style.display = "none"
        ), 1000
    )
    
}

function popToast() {
    let toast = document.getElementById("toast");
    toast.style.display = "block";
    setTimeout(
        () => (
            toast.style.bottom = "5%"
        ), 500
    )
    setTimeout(
        () => {
            hideToast();
        }, 5000
    )
    
}

function WorkSpace() {
    const [toolbarData, setToolbarData] = useState({file: [], git: [], help: []});
    // const [currentDir, setCurrentDir] = useState("./repositories");
    // const [explorerData, setExplorerData] = useState([]);
    const [dropdown, setDropdown] = useState("");
    const [gitOperation, setGitOperation] = useState("");
    const [currentRepo, setCurrentRepo] = useState("Repo");
    const [branchName, setBranchName] = useState("<branch>");
    const [repoDir, setRepoDir] = useState("");
    const [fileName, setFileName] = useState("Unknown");
    const [filePath, setFilePath] = useState("");
    
    const getToolbarData = async () => {
        const response = await fetch(`${host}/toolbar_opt`);
        const data = await response.json();
        console.log(data.data);
        setToolbarData(data.data);
    }
    // const getExplorerData = async () => {
    //     let response = await fetch(`${host}/file_explorer?dir=${currentDir}`);
    //     let data = await response.json();
    //     setExplorerData(data.data);
    // }

    const hideDropdown = (id, overlaynode=null) => {
        document.getElementById(id).style.display = "none";
        console.log(overlaynode);
        if (overlaynode != null) {
            document.body.removeChild(overlaynode);
        } else {
            document.getElementById("overlay").style.display = "none";
        }  
    }

    function showDropdown(id) {
        document.getElementById(id).style.display = "block";
        // document.getElementsByClassName("CodeMirror")[0].CodeMirror.setValue("# Author: Isaac Robert \n# GitCode v0.1\nimport numpy as np\nimport pandas as pd\n");
        console.log(document.getElementById("editor"));
        let overlay = document.createElement("div");
        overlay.id = "overlay";
        document.body.appendChild(overlay)
        overlay.addEventListener("click", () => (
            hideDropdown(id, overlay)
            ))
        setDropdown(id);
    }

    function setEditorContent(content, fromFileExp=false, file_name, file_path, repo_name, branch_name="", repo_dir="") {
        try {
            document.getElementsByClassName("CodeMirror")[0].CodeMirror.setValue(content);
            console.log(content);
        } catch (error) {
            document.getElementById("editor").value = content;
        }
        
        if (fromFileExp === true) {
            document.getElementById("file-explorer").style.display = "none";
            document.getElementById("new-file-explorer").style.display = "none";
        }
        setCurrentRepo(repo_name);
        setBranchName(branch_name);
        setRepoDir(repo_dir);
        setFileName(file_name);
        setFilePath(file_path);
    }

    async function saveFile() {
        if (fileName === "Unknown") {
            document.getElementById("toast").innerText = "No data to save!";
            popToast();
        } else {
            let editor_content;
            try {
                editor_content = document.getElementsByClassName("CodeMirror")[0].CodeMirror.getValue();
            } catch (error) {
                editor_content = document.getElementById("editor").value;
            }
            
            let payload = {content: editor_content};
            let response = await fetch(`${host}/save?file_path=${filePath}`, PostInit(payload));
            let json_data = await response.json();
            document.getElementById("toast").innerText = json_data.msg;
            popToast();
        }
    }

    async function getGitStatus() {
        let response = await fetch(`${host}/status?repo_name=${currentRepo}`);
        let json_data = await response.json();
        document.getElementById("toast").innerText = json_data.data.msg;
        popToast();
    }

    function callBack(id) {
        if (id === "new_file") {
            return (e) => {
                document.getElementById("new-file-explorer").style.display = "block";
                hideDropdown(dropdown);
            }
        } else if (id === "open_file") {
            return (e) => {
                document.getElementById("file-explorer").style.display = "block";
                hideDropdown(dropdown);
            }
        } else if (id === "save") {
            return (e) => {
                saveFile();
                hideDropdown(dropdown);
            }
        } else if (id === "all_repo") {
            return (e) => {
                document.getElementById("file-explorer").style.display = "block";
                hideDropdown(dropdown);
            }
        } else if (id === "clone") {
            return (e) => {
                hideDropdown(dropdown);
                document.getElementById("git-board").style.display = "block";
                setGitOperation(id);
            }
        } else if (id === "explorer") {
            return (e) => {
                document.getElementById("file-explorer").style.display = "block";
                hideDropdown(dropdown);
            }
        } else if (id === "commit") {
            return (e) => {
                hideDropdown(dropdown);
                document.getElementById("git-board").style.display = "block";
                setGitOperation(id);
            }
        } else if (id === "push") {
            return (e) => {
                hideDropdown(dropdown);
                document.getElementById("git-board").style.display = "block";
                setGitOperation(id);
            }
        } else if (id === "pull") {
            return (e) => {
                hideDropdown(dropdown);
                document.getElementById("git-board").style.display = "block";
                setGitOperation(id);
            }
             
        } else if (id === "checkout") {
            return (e) => {
                hideDropdown(dropdown);
                document.getElementById("git-board").style.display = "block";
                setGitOperation(id);
            }
        } else if (id === "status") {
            return (e) => {
                hideDropdown(dropdown);
                getGitStatus();
            }
        }

    }

    useEffect(() => {
        getToolbarData();
        
    }, [])
    
    return (
        <div className="work-space">
            <FileExplorer setEditorContent={setEditorContent}/>
            <NewFileExplorer setEditorContent={setEditorContent}/>
            <GitBoard operation={gitOperation} currentRepo={currentRepo} branch={setBranchName} repo={currentRepo}/>
            <Toast msg={"Cloned successfully"}/>
            <div id='main'>
                <div className="header"> <i>{fileName}</i> - {currentRepo} - GitCode IDE </div>
                <div className="control-panel">
                    <DropDown id="file" list={toolbarData.file} callback={callBack} />
                    <DropDown id="git" list={toolbarData.git} callback={callBack} />
                    <DropDown id="help" list={toolbarData.help} callback={callBack} />
                    <div className="tool-bar">
                        <ul>
                            <li onClick={(e) => {showDropdown("file")}}>File</li>
                            <li onClick={(e) => {showDropdown("git")}}>Git</li>
                            <li onClick={(e) => {showDropdown("help")}}>Help</li>
                            {/* <li onClick={(e) => {popToast()}}>Toast</li> */}
                        </ul>
                    </div>
                    <div className='language-opt'>
                        Select Language:
                        &nbsp; &nbsp;
                        <select id="languages" className="languages" onChange={window.changeLanguage}>
                            <option value="c"> C </option>
                            <option value="cpp"> C++ </option>
                            <option value="php"> PHP </option>
                            <option value="python"> Python </option>
                            <option value="node"> Node JS </option>
                        </select>
                    </div>
                    
                </div>
                <textarea className="editor" id="editor"></textarea>

                <span id='branch' title='active branch'>
                    <img src={gitfork} alt={"git"} 
                        style={{width:"15px", height:"15px", display:"inline-block", paddingRight:"5px"}}
                    />
                    {branchName}
                </span>
                <div className="button-container">
                    <div className="run" onClick={window.executeCode}></div>
                </div>

                <div className="terminal">~robert$</div>
            </div>
        </div>
  );
}

export default WorkSpace;
