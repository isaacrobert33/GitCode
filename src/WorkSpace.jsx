import React from 'react';
import './App.css';
// import git_icon from './git-icon.svg';
// import git_folder from './git-dir.svg';

function WorkSpace() {
  return (
    <div className="work-space">
        <div id='main'>
            <div className="header"> GitCode IDE </div>
            <div className="control-panel">
                <div className="tool-bar">
                    <ul>
                        <li>File</li>
                        <li>Git</li>
                    </ul>
                </div>
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
