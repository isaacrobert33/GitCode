import './App.css';
import React from "react";
import WorkSpace from './WorkSpace';

function App() {
  console.log(process.env)
  return (
    <div className='App'>
      <WorkSpace />
    </div>
    
  );
}

export default App;
