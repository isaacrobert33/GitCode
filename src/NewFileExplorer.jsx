
import React from 'react';
import './App.css';
import folder_icon from './git-dir.svg';
import file_icon from './file-icon.png';
import { useState } from 'react';
import { useEffect } from 'react';
// import { useState } from 'react';
// var host = "http://127.0.0.1:5000";
var host = "";


const File = ({name, type, on_click}) => {
    let icon;
    if (type === "dir") {
        icon = folder_icon;
    } else {
        icon = file_icon;
    }
    return (
        <div className='file' title={name} onClick={
            on_click
        }>
            <img alt={name} src={icon}/>
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


const NewFileExplorer = ({setEditorContent}) => {

    const [currentDirData, setCurrentDirData] = useState([]);
    const [currentDir, setCurrentDir] = useState("");
    const [filePath, setFilePath] = useState("");

    const getDirData = async (path, type) => {
        if (path.includes("All Repos")) {
            path = path.replace("All Repos", "");
        }
        if (type === "file") {
            console.log("is_file");
        } else {
            let response = await fetch(`${host}/file_explorer?dir=${path}`);
            let json_data = await response.json();
            setCurrentDirData(json_data.data);
            if (path === "") {
                path = "All Repos";
            }
            setCurrentDir(path);
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
        document.getElementById("file-explorer").style.display = "none";
        getDirData("", "dir");
    }
    const saveFile = async() => {
        let filePath = currentDir+"/"+document.getElementById("filename").value;
        let response = await fetch(`${host}/save?file_path=${filePath}`, PostInit({}));
        let json_data = await response.json();
        console.log(json_data);
    }
    useEffect(
        () => {
            getDirData(currentDir);
        }, []
    )

    return (
        <div className='overlay' id='new-file-explorer'>
            <div className='main-window'>
                <span id='close-btn' onClick={(e) => {closeExplorer()}}>&times;</span>
                <h2>File Explorer</h2>
                <h4>Current Directory: {currentDir}</h4>
                <div className='nav-container'>
                <span className='navigator' onClick={navigateBack}>&larr;</span><span className='navigator'>&rarr;</span>
                </div>
                
                {
                    currentDirData?.length > 0 ? (
                        <div className='directory-content'>
                            {
                                currentDirData.map(
                                    (file) => (
                                        <File name={file.name} type={file.type} on_click={
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
                    <input type={"text"} id={"filename"}/>
                    <button id='savefile' onClick={(e) => (saveFile)}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default NewFileExplorer;