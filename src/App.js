import './App.css';
import React from "react";
import WorkSpace from './WorkSpace';
import { ChakraProvider } from '@chakra-ui/react';

// import { tabsAnatomy } from '@chakra-ui/anatomy'
// import { createMultiStyleConfigHelpers } from '@chakra-ui/react'

// const { definePartsStyle, defineMultiStyleConfig } = createMultiStyleConfigHelpers(tabsAnatomy.keys)
// const baseStyle = definePartsStyle({
//   // define the part you're going to style
//   tab: {
//     fontWeight: 'semibold',
//     padding: '3px'
//   },
//   tabpanel: {
//     fontFamily: 'mono', // change the font family
//   },
// })


function App() {
  console.log(process.env)
  return (
    <ChakraProvider resetCSS={false}>
      <div className='App'>
        <WorkSpace />
      </div>
    </ChakraProvider>
    
  );
}

export default App;
// export the component theme
// export const tabsTheme = defineMultiStyleConfig({ baseStyle })