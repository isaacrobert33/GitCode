import React from 'react';
import './App.css';
import git_icon from './git-icon.svg';

const Commit = () => {
    return (
        <div className='git-ui'>
            <input className='text-input' id="repo_name" placeholder='Repository name'/>
            <input className='text-input' id='commit_msg' placeholder='Commit message'/>
            <input className='text-input' id='branch_name' placeholder='Branch name (Optional)'/>
            <button className='git-btn' id='commit-btn'>Commit</button>
        </div>
    )
}

const Push = () => {
    return (
        <div className='git-ui'>
            <input className='text-input' id="repo_name" placeholder='Repository name'/>
            <input className='text-input' id='branch_name' placeholder='Branch name (Optional)'/>
            <button className='git-btn' id='push-btn'>Push</button>
        </div>
    )
}

const Clone = () => {
    return (
        <div className='git-ui'>
            <input className='text-input' id='repo_url' placeholder='Repository URL'/>
            <input className='text-input' id='user_name' placeholder='Username (optional)' />
            <input className='text-input' id='pwd' placeholder='Password (optional)'/>
            <button className='git-btn' id='commit-btn'>Clone</button>
        </div>
    )
}

function getComponent(operation) {
    if (operation === "clone") {
        return (
            <Clone />
        )
    } else if (operation === "commit") {
        return (
            <Commit />
        )
    } else if (operation === "push") {
        return (
            <Push />
        )
    }
}
const GitBoard = ({operation}) => {
    return (
        <div className='overlay' id='git-board'>
            <div className='main-window'>
                <img className='window-icon' src={git_icon} alt={"git"} />
                <span id='close-btn' onClick={(e) => {document.getElementById("git-board").style.display = "none"}}>&times;</span>
                <h2>Git</h2>
                {
                    getComponent(operation)
                }
                
            </div>
        </div>
    )
}

export default GitBoard;