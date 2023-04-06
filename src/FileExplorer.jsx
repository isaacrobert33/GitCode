import React from 'react';
import './App.css';
import folder_icon from './git-dir.svg';
import file_icon from './file-icon.png';
import { useState } from 'react';
import { useEffect } from 'react';

// var host = process.env.REACT_APP_HOST;
var host = "http://robertix.pythonanywhere.com";
if (!window.location.href.includes("local")) {
    host = "";
}

const File = ({id, name, file_path, type, on_click}) => {
    let icon;
    if (type === "dir") {
        icon = folder_icon;
    } else {
        icon = file_icon;
        let images = ["png", "jpg", "jpeg", "svg", "ico"];
        for (let ext=0; ext<images.length; ext++) {
            if (name.toLowerCase().includes(images[ext])) {
                icon = `${host}/download_file?file_path=${file_path}`;
            }
        }
    }
    return (
        <div id={id} className='file' title={name} onClick={
            on_click
        }>
            <img id='file-icon' alt={name} src={icon} width='40px' height={'40px'}/>
            <br></br>
            <span style={{fontSize: "10px"}}>{name}</span>
        </div>
    )
}

const Listfile = ({name, file_path, type, on_click}) => {
    let icon;
    if (type === "dir") {
        icon = folder_icon;
    } else {
        icon = file_icon;
        let images = ["png", "jpg", "jpeg", "svg", "ico"];
        for (let ext=0; ext<images.length; ext++) {
            if (name.toLowerCase().includes(images[ext])) {
                icon = `${host}/download_file?file_path=${file_path}`;
            }
        }
    }
    return (
        <div className='list-file' title={name} onClick={
            on_click
        }>
            <img id='file-icon' alt={name} src={icon} width='40px' height={'40px'}/>
            <span style={{fontSize: "10px"}}>{name}</span>
        </div>
    )
}


const FileDropDown = ({open_file, delete_file, download, close_dd}) => {
    return (
        <div className={"file-drop-down"} id={"file-drop-down"}>
            <ul>
                <li onClick={(e) => {open_file()}}>Open</li>
                <li onClick={(e) => {delete_file()}}>Delete</li>
                <li onClick={(e) => {download()}}>Download</li>
                <li onClick={(e) => {close_dd()}}>Close</li>

            </ul>
        </div>
    )
}

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

const FileExplorer = ({setEditorContent}) => {

    const [currentDirData, setCurrentDirData] = useState([]);
    const [currentDir, setCurrentDir] = useState("");
    const [currentDirTitle, setCurrentDirTitle] = useState("");
    const [currentPath, setCurrentPath] = useState("");
    const [activeFile, setActiveFile] = useState("");

    const openFile = async () => {
        try {
            hide_file_drop_down()
            let path = currentPath;
            let images = ["png", "jpg", "jpeg", "svg", "ico"];
            for (let ext=0; ext<images.length; ext++) {
                if (path.toLowerCase().includes(images[ext])) {
                    downloadFile(true);
                    return;
                }
            }
                
            let response = await fetch(`${host}/file_data?file_path=${path}`);
            let json_data = await response.json();
            setEditorContent(json_data.data.content, true, json_data.data.filename, path, json_data.data.repo_name, json_data.data.branch_name, json_data.data.repo_dir);
            
        } catch (error) {
            console.log(error);
        }
        
    }

    const deleteFile = async () => {
        hide_file_drop_down()
        let response = await fetch(`${host}/delete_file?file_path=${activeFile}`, {method: "DELETE"});
        let json_data = await response.json();
        popToast(json_data.data.msg);
        getDirData(currentDir, "dir");
    }

    const downloadFile = async (is_img=false) => {
        hide_file_drop_down()
        let download_link = `${host}/download_file?file_path=${activeFile}`;
        let dl = document.createElement("a");
        dl.href = download_link;
        if (is_img === true) {
            dl.target = "_blank";
        }
        
        document.body.appendChild(dl);
        dl.click();
        document.body.removeChild(dl)
        popToast("Downloading...");
    }

    function show_file_drop_down(path) {
        setActiveFile(path);
        document.getElementById("file-drop-down").style.display = "block";
    }

    function hide_file_drop_down() {
        document.getElementById("file-drop-down").style.display = "none";
    }

    const getDirData = async (path, type) => {
        if (path.includes("All Repos")) {
            path = path.replace("All Repos", "");
        }
        if (type === "file") {
            setCurrentPath(path);
            show_file_drop_down(path);
        } else {
            let response = await fetch(`${host}/file_explorer?dir=${path}`);
            let json_data = await response.json();
            setCurrentDirData(json_data.data);
            setCurrentDir(path);
            if (path === "") {
                path = "All Repos";
            }
            setCurrentDirTitle(path);
        }
        
    }
    const navigateBack = () => {
        let back_path = currentDir.split("/")
        back_path.pop();
        back_path = back_path.join("/");
        getDirData(back_path, "dir");
    }
    const closeExplorer = () => {
        document.getElementById("file-explorer").style.display = "none";
        document.getElementById("overlay").style.display = "none";
        getDirData("", "dir");
    }

    const startObserver = () => {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                getDirData(currentDir, "dir");
            })
        })
        var target = document.getElementById("file-explorer");
        observer.observe(target, {attribute: true, attributeFilter: ['style']});
    }

    useEffect(
        () => {
            getDirData(currentDir, "dir");
            startObserver()
        }, []
    )
    return (
        <div className='overlay' id='file-explorer'>
            <div className='main-window'>
                <FileDropDown open_file={openFile} close_dd={hide_file_drop_down} delete_file={deleteFile} download={downloadFile}/>
                <span id='close-btn' onClick={(e) => {closeExplorer()}}>&times;</span>
                <h2>File Explorer</h2>
                <h4>Current Directory: {currentDirTitle}</h4>
                <div className='nav-container'>
                <span className='navigator' onClick={navigateBack}>&larr;</span><span className='navigator'>&rarr;</span>
                </div>
                
                {
                    currentDirData?.length > 0 ? (
                        <div className='directory-content'>
                            {
                                currentDirData.map(
                                    (file) => (
                                        <File key={`file-${currentDirData.indexOf(file)}`} id={`file-${currentDirData.indexOf(file)}`} file_path={currentDir+"/"+file.name} name={file.name} type={file.type} on_click={
                                            (e) => (
                                                getDirData(currentDir+"/"+file.name, file.type)
                                            )
                                        } />
                                    )
                                )
                            }
                            
                        </div>
                    ) : (
                        <h3>Empty Directory!</h3>
                    )
                }
                
                
            </div>
        </div>
    )
}

export default FileExplorer;
