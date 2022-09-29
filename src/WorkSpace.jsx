import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
import FileExplorer from './FileExplorer';
// import git_icon from './git-icon.svg';
// import git_folder from './git-dir.svg';

const DropDown = ({ id, list }) => {
    return (
        <div id={id} className='dropdown'>
            {
                list.map((item) => (
                    <a href={'#'+id} className='dropdown-item' title={item.info}>{item.name}</a>
                    
                ))
            }
        </div>
    )
}

const hideDropdown = (id, overlaynode) => {
        document.getElementById(id).style.display = "none"
        document.body.removeChild(overlaynode)
}

function showDropdown(id) {
    document.getElementById(id).style.display = "block";
    let overlay = document.createElement("div");
    overlay.id = "overlay";
    document.body.appendChild(overlay)
    overlay.addEventListener("click", () => (
        hideDropdown(id, overlay)
        ))
}

function WorkSpace() {
    const [toolbarData, setToolbarData] = useState({file: [], git: [], help: []});
    
    const getToolbarData = async () => {
        const response = await fetch("http://127.0.0.1:5000/toolbar_opt");
        const data = await response.json();
        console.log(data.data);
        setToolbarData(data.data);
    }
    useEffect(() => {
        getToolbarData();
    }, [])
    
  return (
    <div className="work-space">
        <FileExplorer directory={[{fname: ".git", type: "dir"}]}/>
        <div id='main'>
            <div className="header"> <i>main.py</i> ~ GitCode IDE </div>
            <div className="control-panel">
                <DropDown id="file" list={toolbarData.file} />
                <DropDown id="git" list={toolbarData.git} />
                <DropDown id="help" list={toolbarData.help} />
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
