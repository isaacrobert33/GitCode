var editor, editorNode, editorSet;

const startObserver = () => {
    var observer = new MutationObserver(function(mutations, obs) {
        const editorNode = document.getElementById("editor");
        mutations.forEach(function(mutationRecord) {
            if (editorNode && !editorSet) {
                console.log("editornode added...");
                initialize_editor();
                obs.disconnect();
                return ;
            }
        })
    })
    observer.observe(document, {childList: true, subtree: true});
}

const initialize_editor = () => {
    console.log("initialized...")
    editorSet = true;
    const editorNode = document.getElementById("editor");
    if (window.screen.width > 600) {
        document.getElementById("lineCounter").style.display = "none";
        editor = CodeMirror.fromTextArea(
            editorNode,
            {
                mode: "python",
                theme: "dracula",
                lineNumbers: true,
                autoCloseBrackets: true
            }
        );
        editor.getDoc().setValue("# Author: Isaac Robert \n# GitCode v0.1");

    } else {
        try {
            editorNode.value = "# Author: Isaac Robert \n# GitCode v0.1";
            let lineNumbering = document.getElementById("lineCounter");
            
            // Synchronize scrollling
            editorNode.addEventListener('scroll', () => {
                try {
                    lineNumbering.scrollTop = editorNode.scrollTop;
                    lineNumbering.scrollLeft = editorNode.scrollLeft;
                } catch (error) {
                    console.log("Scrolling...");
                    console.log(error);
                }
                
            });

            // Counting function
            let lineCountCache = 0;
            function line_counter() {
                let lineCount = editorNode.value.split('\n').length;
                let outarr = new Array();
                if (lineCountCache != lineCount) {
                    for (let x = 0; x < lineCount; x++) {
                        outarr[x] = (x + 1) + '.';
                    }
                    lineNumbering.value = outarr.join('\n');
                }
                lineCountCache = lineCount;
            }
            editorNode.addEventListener('input', () => {
                line_counter();
            });
            line_counter()
        } catch (error) {
            let logger = document.getElementById("error-logger");
            console.log(error);
            logger.style.display = "block";
            logger.innerHTML = error;
            
        }
        
    }
}

window.onload = function() {
    startObserver()
}



// function changeLanguage () {
//     let language = document.getElementById("languages").value;
//     console.log(language);
//     if(language == 'c' || language == 'cpp')editor.setOption("mode", "c_cpp");
//     else if(language == 'javascript')editor.setOption("mode", "php");
//     else if(language == 'python')editor.setOption("mode", "python");
//     else if(language == 'node')editor.setOption("mode", "javascript");
// }


// function executeCode() {
//     console.log("Executing!");
// }