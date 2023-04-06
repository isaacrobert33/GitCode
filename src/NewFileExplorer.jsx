
import React from 'react';
import './App.css';
import folder_icon from './git-dir.svg';
import file_icon from './file-icon.png';
import { useState } from 'react';
import { useEffect } from 'react';
// import { upload } from '@testing-library/user-event/dist/upload';

// var = process.env.REACT_APP_HOST;
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
            if (name.includes(images[ext])) {
                icon = `${host}/download_file?file_path=${file_path}`;
            }
        }
    }
    return (
        <div key={id} className='file' title={name} onClick={
            on_click
        }>
            <img id='file-icon' alt={name} src={icon} width='40px' height={'40px'}/>
            <br></br>
            <span style={{fontSize: "10px"}}>{name}</span>
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

const FileDropDown = ({open_file, delete_file, download, close_dd}) => {
    return (
        <div className={"file-drop-down"} id={"new-file-drop-down"}>
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


const NewFileExplorer = ({setEditorContent}) => {

    const [currentDirData, setCurrentDirData] = useState([]);
    const [currentDir, setCurrentDir] = useState("");
    const [currentDirTitle, setCurrentDirTitle] = useState("");
    const [currentPath, setCurrentPath] = useState("");
    const [activeFile, setActiveFile] = useState("");

    const openFile = async () => {
        try {
            hide_file_drop_down()
            let images = ["png", "jpg", "jpeg", "svg", "ico"];
            let path = currentPath;
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
        document.getElementById("new-file-drop-down").style.display = "block";
        // let overlay = document.createElement("div");
        // overlay.id = "overlay";
        // overlay.style = "z-index: 6";
        // document.body.appendChild(overlay);
        // overlay.addEventListener("click", () => {
        //     hide_file_drop_down();
        //     document.body.removeChild(overlay);
        //     })
    }

    function hide_file_drop_down() {
        document.getElementById("new-file-drop-down").style.display = "none";
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
        console.log(back_path);
        back_path = back_path.join("/");
        console.log(back_path);
        getDirData(back_path, "dir");
    }
    const closeExplorer = () => {
        document.getElementById("new-file-explorer").style.display = "none";
        document.getElementById("overlay").style.display = "none";
        getDirData("", "dir");
    }
    const saveFile = async() => {
        let filename = document.getElementById("filename").value;
        if (filename === "") {
            document.getElementById("filename").style.borderColor = "tomato";
            return ;
        }
        
        let filePath = currentDir+"/"+filename;
        let response = await fetch(`${host}/save?file_path=${filePath}`, PostInit({}));
        let json_data = await response.json();
        popToast(json_data.msg);
        getDirData(currentDir, "dir");
        document.getElementById("filename").value = "";
    }
    const saveFolder = async() => {
        let filename = document.getElementById("filename").value;
        if (filename === "") {
            document.getElementById("filename").style.borderColor = "tomato";
            return ;
        }
        
        let filePath = currentDir+"/"+filename;
        let response = await fetch(`${host}/save?file_path=${filePath}&is_dir=yes`, PostInit({}));
        let json_data = await response.json();
        popToast(json_data.msg);
        getDirData(currentDir, "dir");
        document.getElementById("filename").value = "";
    }
    const start_upload = async (input) => {
        let file = document.getElementById("actual-file").files[0];
        console.log(file)
        
        var data = new FormData();
        data.append('file', file);
        let response = await fetch(`${host}/upload_file?file_dir=${currentDir}`, {method: "POST", body: data});
        let json_data = await response.json();
        getDirData(currentDir, "dir");
        popToast(json_data.msg);
    }

    const startObserver = () => {
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutationRecord) {
                getDirData(currentDir, "dir");
            })
        })
        var target = document.getElementById("new-file-explorer");
        observer.observe(target, {attribute: true, attributeFilter: ['style']});
    }

    useEffect(
        () => {
            getDirData(currentDir, "dir");
            startObserver()
        }, []
    )

    return (
        <div className='overlay' id='new-file-explorer'>
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
                                        <File key={`file-${currentDirData.indexOf(file)}`} id={`file-${currentDirData.indexOf(file)}`} name={file.name} file_path={currentDir+"/"+file.name} type={file.type} on_click={
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
                <div id='text-field'>
                    <input type={"text"} id={"filename"} placeholder={"Enter file name..."}/>
                    <button id='savefile' onClick={(e) => (saveFile())}>Save <span onClick={(e)=> (saveFolder())} id='savefolder'>&darr;</span></button>
                    <div id='upload'>
                        <input type="file" id="actual-file" onChange={(e) => (start_upload(e))} hidden/>
                        <label onChange={(e) => (start_upload(e))} id='upload-btn' title='Upload a file to this directory' for="actual-file">Upload</label>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default NewFileExplorer;