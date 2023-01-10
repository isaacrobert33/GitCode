import React from 'react';
import './App.css';
import { useState, useEffect } from 'react';
// import { useImmer } from "use-immer";
import FileExplorer from './FileExplorer';
import NewFileExplorer from './NewFileExplorer';
import GitBoard from './GitBoard';
import Toast from './Toast';
import gitfork from './gitfork.svg'
import { TabList, TabPanels, TabPanel, Tabs, Tab } from '@chakra-ui/react';

// var host = "http://172.20.10.5:5000"
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

// const Tab = ({ id, title, onPress, onClose }) => {
//     return (
//         <li id={id} onClick={onPress} className='tab-box'>
//             {title}
//             <span id='tab-annul' title='close tab' onClick={onClose}>&times;</span>
//         </li>
//     )
// }

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

function setupEditor(editor_id) {
    console.log(editor_id);
    let lineNumbering = document.getElementById(`lineCounter-${editor_id}`);
    let editorNode = document.getElementById(editor_id);
    
    // Synchronize scrollling
    editorNode.addEventListener('scroll', () => {
        try {
            lineNumbering.scrollTop = editorNode.scrollTop;
            lineNumbering.scrollLeft = editorNode.scrollLeft;
        } catch (error) {
            console.log(error);
        }
        
    });

    // Counting function
    let lineCountCache = 0;
    function line_counter() {
        let lineCount = editorNode.value.split('\n').length;
        let outarr = new Array();
        if (lineCountCache !== lineCount) {
            for (let x = 0; x < lineCount; x++) {
                outarr[x] = (x + 1);
            }
            lineNumbering.value = outarr.join('\n');
        }
        lineCountCache = lineCount;
    }
    editorNode.addEventListener('input', () => {
        line_counter();
    });
    line_counter()
}

var openTabsData = [];

function WorkSpace() {
    const [toolbarData, setToolbarData] = useState({file: [], git: [], help: [], edit_tab: []});
    // const [currentDir, setCurrentDir] = useState("./repositories");
    // const [explorerData, setExplorerData] = useState([]);
    const [dropdown, setDropdown] = useState("");
    const [gitOperation, setGitOperation] = useState("");
    const [currentRepo, setCurrentRepo] = useState("Repo");
    const [branchName, setBranchName] = useState("<branch>");
    const [fileName, setFileName] = useState("");
    const [filePath, setFilePath] = useState("");
    const [openTabs, setTabs] = useState([]);
    const [activeTab, setCurrentTab] = useState(0);
    
    const getToolbarData = async () => {
        const response = await fetch(`${host}/toolbar_opt`);
        const data = await response.json();
        setToolbarData(data.data);
    }
    // const getExplorerData = async () => {
    //     let response = await fetch(`${host}/file_explorer?dir=${currentDir}`);
    //     let data = await response.json();
    //     setExplorerData(data.data);
    // }

    const hideDropdown = (id, overlaynode=null) => {
        document.getElementById(id).style.display = "none";
       
        if (overlaynode != null) {
            document.body.removeChild(overlaynode);
        } else {
            document.getElementById("overlay").style.display = "none";
        }  
    }

    function showDropdown(id) {
        document.getElementById(id).style.display = "block";
        // document.getElementsByClassName("CodeMirror")[0].CodeMirror.setValue("# Author: Isaac Robert \n# GitCode v0.1\nimport numpy as np\nimport pandas as pd\n");
        
        let overlay = document.createElement("div");
        overlay.id = "overlay";
        document.body.appendChild(overlay)
        overlay.addEventListener("click", () => (
            hideDropdown(id, overlay)
            ))
        setDropdown(id);
    }

    const openNewTab = (content, fromFileExp=false, file_name, file_path, repo_name, branch_name="", repo_dir="") => {
        const newTabId = openTabs.length;
        console.log("newID", newTabId, openTabs.length);
        const newTabData = {id: newTabId, content: content, fromFileExp: fromFileExp, file_name: file_name, file_path: file_path, repo_name: repo_name, branch_name: branch_name, repo_dir: repo_dir};
        const updatedTabs = [...openTabs, {id: newTabId, filename: file_name}];
        const updatedTabsData = [...openTabsData, newTabData];
        console.log(updatedTabs, updatedTabsData);
        setTabs(updatedTabs);
        openTabsData = updatedTabsData;
        setEditorContent(newTabData);
    }

    const closeTab = (tab_id) => {
        tab_id = Number(tab_id);
        const open_tabs = openTabs;
        const updatedTabsData = openTabsData;
        updatedTabsData.splice(tab_id, tab_id+1);
        open_tabs.splice(tab_id, tab_id+1);
        
        if (open_tabs.length>0) {
            document.getElementById(`tabs-:r0:--tab-${openTabs.length-1}`).click();
        }
        
        setTabs(open_tabs);
        openTabsData =  updatedTabsData;
    }

    function updateInfo(tab_id) {
        setCurrentTab(tab_id);
        let data = openTabsData[tab_id];
        console.log(openTabsData, tab_id);
        setCurrentRepo(data.repo_name);
        setBranchName(data.branch_name);
        setFileName(data.file_name);
        setFilePath(data.file_path);
        setupEditor(`editor-${tab_id}`);
    }

    const startCacheTimer = () => {
        const editorNode = document.getElementById("editor");
        timeoutId = setTimeout((e) => {
            let cont = editorNode.value;
            editorStack.push(cont);
           
        }, 5000)
    }

    function setEditorContent(params) {
        const editor_id = `editor-${params.id}`;
        const content = params.content; 
        const fromFileExp = params.fromFileExp; 
        const file_name = params.file_name; 
        const file_path = params.file_path; 
        const repo_name = params.repo_dir; 
        const branch_name = params.branch_name; 
        const repo_dir = params.repo_dir;
        
        const editorNodeObserver = () => {
            let observer = new MutationObserver(function(mutations, obs) {
                const editorNode = document.getElementById(editor_id);
                mutations.forEach(function(mutationRecord) {
                    console.log(editor_id);
                    if (editorNode) {
                        console.log("added editor");
                        try {
                            document.getElementsByClassName("CodeMirror")[0].CodeMirror.setValue(content);
                        } catch (error) {
                            editorNode.value = content;
                        }
                        originalContent = content;
                        if (fromFileExp === true) {
                            document.getElementById("file-explorer").style.display = "none";
                            document.getElementById("new-file-explorer").style.display = "none";
                        }
                        editorNode.addEventListener('input', (e) => {
                            clearTimeout(timeoutId);
                            startCacheTimer()
                        });
                        setCurrentRepo(repo_name);
                        setBranchName(branch_name);
                        setFileName(file_name);
                        setFilePath(file_path);
                        setupEditor(editor_id);
                        obs.disconnect();
                        return ;
                    }
                        
                })
            })
            
            observer.observe(document, {childList: true, subtree: true});
        }
        editorNodeObserver();
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
                editor_content = document.getElementById(`editor-${activeTab}`).value;
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
                document.getElementById("overlay").style.display = "none";
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
                document.getElementById("overlay").style.display = "none";
            }
        } else if (id === "find") {
            return (e) => {
                hideDropdown(dropdown);
                document.getElementById("overlay").style.display = "none";
                document.getElementById("find-wdg").style.display = "block";
            }
        }

    }
    var timeoutId;
    
    var callback = false;
    const findInputObs = () => {
        let observer = new MutationObserver(function(mutations, obs) {
            const findInput = document.getElementById("find-input");
            mutations.forEach(function(mutationRecord) {
                if (findInput) {
                    findInput.addEventListener("keypress", (event) => {
                        if (event.key === "Enter" && !callback) {
                            event.preventDefault();
                            callback = true;
                            searchKeyword(event);
                            setTimeout(() => {callback=false;}, 500)
                        }
                    })
                    obs.disconnect();
                    return ;
                }
                    
            })
        })
        
        observer.observe(document.getElementById("main"), {childList: true, subtree: true});
    }

    var prevIndex, matchPos=0;
    const searchKeyword = (inputNode)  => {
        console.log(activeTab);
        const editorNode = document.getElementById(`editor-${activeTab}`);
        const findInput = document.getElementById("find-input");
        editorNode.textContent = editorNode.value;
        let index, searched, newIndex;
        let keyword = findInput.value;
        
        if (prevIndex) {
            searched = editorNode.value.slice(0, prevIndex);
            newIndex = editorNode.value.slice(prevIndex).indexOf(keyword);
            if (newIndex !== -1) {
                index = newIndex+searched.length;
            } else {
                index = newIndex;
            }
            
        } else {
            index = editorNode.value.indexOf(keyword);
        }
        console.log(index);
        let match = editorNode.value.split(keyword).length - 1;
        let eng;
        if (match < 2) {
            eng = "match";
        } else {
            eng = "matches"
        }

        if (index !== -1) {
            if (editorNode.createTextRange) {
                let range = editorNode.createTextRange();
                range.collapse(true);
                range.moveEnd('character', index);
                range.moveStart('character', index + keyword.length);
                range.select();
            } else if (editorNode.setSelectionRange) {
                editorNode.setSelectionRange(index, index + keyword.length);
            }
            
            prevIndex = index+keyword.length;
            matchPos += 1;
            document.getElementById("matches").innerHTML = `${matchPos} of ${match} ${eng}`
    
        } else {
            prevIndex = 1;
            matchPos = 1;
            document.getElementById("matches").innerHTML = `${matchPos} of ${match} ${eng}`;
        }
        
    }

    useEffect(() => {
        getToolbarData();
        findInputObs();
    }, [])
    
    return (
        <div className="work-space">
            <FileExplorer setEditorContent={openNewTab}/>
            <NewFileExplorer setEditorContent={openNewTab}/>
            <GitBoard operation={gitOperation} currentRepo={currentRepo} branch={setBranchName}/>
            <Toast msg={"Cloned successfully"}/>
            <div id='main'>
                <div className="header">{currentRepo} - GitCode IDE </div>
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
                    {/* <div className='language-opt'>
                        Select Language:
                        &nbsp;
                        <select id="languages" className="languages">
                            {/* <option value="c"> C </option>
                            <option value="cpp"> C++ </option>
                            <option value="php"> PHP </option> 
                            <option value="python"> Python </option>
                            <option value="node"> Node JS </option> 
                        </select>
                    </div> */}
                    
                    <Tabs variant='enclosed' onChange={(index) => ( updateInfo(index) )}>
                        <TabList css={{overflowX: "auto"}}>
                            {
                                openTabs?.length>0 ? (
                                    openTabs.map(
                                        (tab) => (
                                            <Tab _selected={{ color: 'azure', bg: 'cyan.500' }} id={tab.id}>{tab.filename} <span onClick={(e) => (closeTab(tab.id))} className='tab-annul'>&times;</span></Tab>
                                        )
                                    )
                                ) : (
                                    <></>
                                )
                                
                            }
                        </TabList>
                        <TabPanels>
                            {
                                openTabs?.length>0 ? (
                                    openTabs.map(
                                        (tab_data) => (
                                            <TabPanel>
                                                <textarea className='lineCounter' id={`lineCounter-editor-${tab_data.id}`} wrap='off' readOnly>1</textarea>
                                                <textarea className='editor' id={`editor-${tab_data.id}`} wrap='off'></textarea>
                                            </TabPanel>
                                        )
                                    )
                                ) : (
                                    <></>
                                )
                            }
                        </TabPanels>
                    </Tabs>
                    
                </div>
                
                <div id={"find-wdg"} className='find'>
                    <input style={{borderRadius: "5px", marginLeft: "6px"}} id='find-input' type={"text"} placeholder={"Find"}/>
                    <span style={{color: "cyan", fontSize: "12px", marginLeft: "6px"}} id='matches'>0 of 0</span>
                    <span style={{cursor: "pointer", color:  "cyan", fontSize: "20px", fontWeight: "bold", marginLeft: "6px"}} onClick={(e) => {document.getElementById("find-wdg").style.display = "none"}}>&times;</span>
                </div>
                <div className='footer'>
                    <span id='branch' title='active branch'>
                        <img src={gitfork} alt={"git"} 
                            style={{width:"15px", height:"15px", display:"inline-block", paddingRight:"5px"}}
                        />
                        {branchName}
                    </span>
                </div>
                
                {/* <div className="button-container">
                    <div className="run" onClick={window.executeCode}></div>
                </div> */}

                {/* <div className="terminal">~robert$</div> */}
            </div>
            
        </div>
  );
}

export default WorkSpace;
