import React from 'react';
import './App.css';


function hideToast() {
    let toast = document.getElementById("toast");
    toast.style.bottom = "-90px";
    setTimeout(
        () => (
            toast.style.display = "none"
        ), 1000
    )
    
}

const Toast = ({ msg }) => {
    return (
        <div className='toast' id='toast'>
            <span id='close-toast-btn' onClick={(e) => {hideToast()}}>&times;</span>
            {msg}
        </div>
    )
}

export default Toast;