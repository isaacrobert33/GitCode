import React from 'react';
import './App.css';
// import { useState } from 'react';

const FileExplorer = ({ directory }) => {
    return (
        <div className='file-explorer'>
            <div className='main-window'>
                {
                    directory?.length ? (
                        <a href={directory.type}>{directory.fname}</a>
                    ) : (
                        <p>Empty Directory!</p>
                    )
                }
            </div>
        </div>
    )
}

export default FileExplorer;