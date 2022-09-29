import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import FileExplorer from './FileExplorer';
import GitBoard from './GitBoard';
// import git_icon from './git-icon.svg';
// import git_folder from './git-dir.svg';

var host = "http://127.0.0.1:5000";

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

function WorkSpace() {
    const [toolbarData, setToolbarData] = useState({file: [], git: [], help: []});
    const [currentDir, setCurrentDir] = useState("./repositories");
    const [explorerData, setExplorerData] = useState([]);
    const [dropdown, setDropdown] = useState("");
    const [gitOperation, setGitOperation] = useState("");
    
    const getToolbarData = async () => {
        const response = await fetch(`${host}/toolbar_opt`);
        const data = await response.json();
        console.log(data.data);
        setToolbarData(data.data);
    }
    const getExplorerData = async () => {
        let response = await fetch(`${host}/file_explorer?dir=${currentDir}`);
        let data = await response.json();
        setExplorerData(data.data);
    }

    const hideDropdown = (id, overlaynode=null) => {
        document.getElementById(id).style.display = "none";
        console.log(overlaynode);
        if (overlaynode != null) {
            document.body.removeChild(overlaynode);
        } else {
            document.getElementById("overlay").style.display = "none";
            console.log("Removed overlay")
        }  
    }

    function showDropdown(id) {
        document.getElementById(id).style.display = "block";
        let overlay = document.createElement("div");
        overlay.id = "overlay";
        document.body.appendChild(overlay)
        overlay.addEventListener("click", () => (
            hideDropdown(id, overlay)
            ))
        setDropdown(id);
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
        } else if (id === "all_repo") {
            return (e) => {
                setCurrentDir("./repositories");
                getExplorerData();
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
                getExplorerData();
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
        }

    }

    useEffect(() => {
        getToolbarData();
    }, [])
    
    return (
        <div className="work-space">
            <FileExplorer directory={explorerData} current_dir={currentDir}/>
            <GitBoard operation={gitOperation}/>
            <div id='main'>
                <div className="header"> <i>main.py</i> ~ GitCode IDE </div>
                <div className="control-panel">
                    <DropDown id="file" list={toolbarData.file} callback={callBack} />
                    <DropDown id="git" list={toolbarData.git} callback={callBack} />
                    <DropDown id="help" list={toolbarData.help} callback={callBack} />
                    <div className="tool-bar">
                        <ul>
                            <li onClick={(e) => {showDropdown("file")}}>File</li>
                            <li onClick={(e) => {showDropdown("git")}}>Git</li>
                            <li onClick={(e) => {showDropdown("help")}}>Help</li>
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
                <div className="editor" id="editor"></div>

                <div className="button-container">
                    <div className="run" onClick={window.executeCode}></div>
                </div>

                <div className="terminal">~robert$</div>
            </div>
        </div>
  );
}

export default WorkSpace;
