import './App.css';
// import React, { useEffect } from "react";
import WorkSpace from './WorkSpace';

function App() {

  // const addScript = (src) => {
  //   let script = document.createElement("script");
  //   // script.async = true;
  //   script.src = src;
  //   script.type = "text/javascript";
  //   document.body.appendChild(script);
  // }

  // useEffect(() => {
  //   // addScript("https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js");
    
  // })
  return (
    <div className='App'>
      <WorkSpace />
      {/* {
        addScript("./lib/ace.js")}
      {
        addScript("./lib/theme-monokai.js")
      }
      {
        addScript("./ide.js")
      } */}
    </div>
    
  );
}

export default App;
