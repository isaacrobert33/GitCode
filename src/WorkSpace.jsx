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

// var host = "http://172.20.10.5:5000"
// "http://127.0.0.1:5000"
// var process.env.REACT_APP_HOST;
var host = "";

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

var originalContent;
var editorStack = [];
var editorRedostack = [];


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
            toast.style.bottom = "50%"
        ), 500
    )
    setTimeout(
        () => {
            hideToast();
        }, 8000
    )
    
}

function WorkSpace() {
    const [toolbarData, setToolbarData] = useState({file: [], git: [], help: [], edit_tab: []});
    // const [currentDir, setCurrentDir] = useState("./repositories");
    // const [explorerData, setExplorerData] = useState([]);
    const [dropdown, setDropdown] = useState("");
    const [gitOperation, setGitOperation] = useState("");
    const [currentRepo, setCurrentRepo] = useState("Repo");
    const [branchName, setBranchName] = useState("<branch>");
    // const [repoDir, setRepoDir] = useState("");
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
        originalContent = content;
        if (fromFileExp === true) {
            document.getElementById("file-explorer").style.display = "none";
            document.getElementById("new-file-explorer").style.display = "none";
        }
        setCurrentRepo(repo_name);
        setBranchName(branch_name);
        // setRepoDir(repo_dir);
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
        } else if (id === "branch") {
            return (e) => {
                hideDropdown(dropdown);
                setGitOperation(id);
                document.getElementById("git-board").style.display = "block";
                if (document.getElementById("git-branch")) {
                    document.getElementById("git-branch").style.display = "block";
                }
                
            }
        } else if (id === "undo") {
            return (e) => {
                let prevContent = editorStack.pop();
                const editorNode = document.getElementById("editor");
                console.log(prevContent);
                if (prevContent){
                    editorNode.value = prevContent;
                    if (editorNode.value === prevContent && editorStack.slice(-1)[0]) {
                        prevContent = editorStack.pop();
                        editorNode.value = prevContent;
                    }
                    editorRedostack.push(prevContent);
                } else {
                    editorNode.value = originalContent;
                }
                hideDropdown(dropdown);
            }
        } else if (id === "redo") {
            return (e) => {
                const editorNode = document.getElementById("editor");
                let redoContent = editorRedostack.pop();
                if (redoContent){
                    editorNode.value = redoContent;
                    editorStack.push(redoContent);
                }
                hideDropdown(dropdown);
            }
        } else if (id === "find") {
            return (e) => {
                hideDropdown(dropdown);
                document.getElementById("find-wdg").style.display = "block";
            }
        }

    }
    var timeoutId;
    const startCacheTimer = () => {
        const editorNode = document.getElementById("editor");
        timeoutId = setTimeout((e) => {
            let cont = editorNode.value;
            editorStack.push(cont);
            console.log("Drafted");
        }, 5000)
    }
    const editorNodeObs = () => {
        let observer = new MutationObserver(function(mutations, obs) {
            const editorNode = document.getElementById("editor");
            mutations.forEach(function(mutationRecord) {
                if (editorNode) {
                    editorNode.addEventListener('input', (e) => {
                        clearTimeout(timeoutId);
                        startCacheTimer()
                    });
                    obs.disconnect();
                    return ;
                }
                    
            })
        })
        
        observer.observe(document, {childList: true, subtree: true});
    }
    var callback;
    const findInputObs = () => {
        let observer = new MutationObserver(function(mutations, obs) {
            const findInput = document.getElementById("find-input");
            mutations.forEach(function(mutationRecord) {
                if (findInput) {
                    findInput.addEventListener("keypress", (event) => {
                        if (event.key === "Enter" && !callBack) {
                            event.preventDefault();
                            console.log("Press")
                            callBack = true;
                            // searchKeyword(event);
                        }
                    })
                    obs.disconnect();
                    return ;
                }
                    
            })
        })
        
        observer.observe(document, {childList: true, subtree: true});
    }


    var prevIndex, matchPos=0;
    const searchKeyword = (inputNode)  => {
        const editorNode = document.getElementById("editor");
        const findInput = document.getElementById("find-input");
        editorNode.textContent = editorNode.value;
        let index, searched, newIndex;
        let keyword = findInput.value;
        
        if (prevIndex) {
            searched = editorNode.value.slice(0, prevIndex);
            newIndex = editorNode.value.slice(prevIndex).indexOf(keyword);
            index = newIndex+searched.length;
        } else {
            index = editorNode.value.indexOf(keyword);
        }
        console.log("Index:", index, "prevIndex", prevIndex);
        if (index !== -1) {
            // const range = document.createRange();
            // range.setStart(editorNode.firstChild, index);
            // range.setEnd(editorNode.firstChild, keyword.length);
            // const selection = window.getSelection();
            // selection.removeAllRanges();
            // selection.addRange(range);
            editorNode.setSelectionRange(index, index + keyword.length);
            // document.execCommand("backColor", false, "yellow");
            prevIndex = index+keyword.length;
            matchPos += 1;
            let match = editorNode.value.split(keyword).length - 1;
            let eng;
            if (match < 2) {
                eng = "match";
            } else {
                eng = "matches"
            }
            document.getElementById("matches").innerHTML = `${matchPos}/${match} ${eng}`
    
        } else {
            prevIndex = 0;
            matchPos = 0;
            document.getElementById("matches").innerHTML = "No match!";
        }
        
    }

    useEffect(() => {
        getToolbarData();
        editorNodeObs();
        findInputObs();
    }, [])
    
    return (
        <div className="work-space">
            <FileExplorer setEditorContent={setEditorContent}/>
            <NewFileExplorer setEditorContent={setEditorContent}/>
            <GitBoard operation={gitOperation} currentRepo={currentRepo} branch={setBranchName}/>
            <Toast msg={"Cloned successfully"}/>
            <div id='main'>
                <div className="header"> <i>{fileName}</i> - {currentRepo} - GitCode IDE </div>
                <div className="control-panel">
                    <DropDown id="file" list={toolbarData.file} callback={callBack} />
                    <DropDown id="git" list={toolbarData.git} callback={callBack} />
                    <DropDown id="edit" list={toolbarData.edit_tab} callback={callBack} />
                    <DropDown id="help" list={toolbarData.help} callback={callBack} />
                    <div className="tool-bar">
                        <ul>
                            <li onClick={(e) => {showDropdown("file")}}>File</li>
                            <li onClick={(e) => {showDropdown("git")}}>Git</li>
                            <li onClick={(e) => {showDropdown("edit")}}>Edit</li>
                            <li onClick={(e) => {showDropdown("help")}}>Help</li>
                            {/* <li onClick={(e) => {popToast()}}>Toast</li> */}
                        </ul>
                    </div>
                    <div className='language-opt'>
                        Select Language:
                        &nbsp; &nbsp;
                        <select id="languages" className="languages">
                            {/* <option value="c"> C </option>
                            <option value="cpp"> C++ </option>
                            <option value="php"> PHP </option> */}
                            <option value="python"> Python </option>
                            {/* <option value="node"> Node JS </option> */}
                        </select>
                    </div>
                    
                </div>
                <p id='editor-container'>
                    <textarea id="lineCounter" wrap='off' readOnly>1.</textarea>
                    <textarea className='editor' id="editor" wrap='off'></textarea>
                    <div id={"find-wdg"} className='find'>
                        <input style={{borderRadius: "5px"}} id='find-input' type={"text"} placeholder={"Find"}/>
                        <span style={{cursor: "pointer", color:  "cyan", fontSize: "20px", fontWeight: "bold", }} onClick={(e) => {document.getElementById("find-wdg").style.display = "none"}}>&times;</span>
                        <h5 style={{color: "cyan"}} id='matches'></h5>
                    </div>
                   
                </p>
                
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
