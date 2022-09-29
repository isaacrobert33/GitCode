import React from 'react';
import './App.css';
import folder_icon from './git-dir.svg';
import file_icon from './file-icon.png';
// import { useState } from 'react';

const File = ({name, type}) => {
    let icon;
    if (type === "dir") {
        icon = folder_icon;
    } else {
        icon = file_icon;
    }
    return (
        <div className='file' title={name}>
            <img alt={name} src={icon}/>
            <br></br>
            <span style={{fontSize: "10px"}}>{name}</span>
        </div>
    )
}

const FileExplorer = ({ directory, current_dir }) => {
    return (
        <div className='overlay' id='file-explorer'>
            <div className='main-window'>
                <span id='close-btn' onClick={(e) => {document.getElementById("file-explorer").style.display = "none"}}>&times;</span>
                <h2>File Explorer</h2>
                <h4>Current Directory: {current_dir}</h4>
                
                {
                    directory?.length > 0 ? (
                        <div className='directory-content'>
                            {
                                directory.map(
                                    (file) => (
                                        <File name={file.name} type={file.type}/>
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