var editor;

window.onload = function() {
    let editorNode = document.createElement("textarea");
    editorNode.id = "editor";
    editorNode.className = "editor";
    editorNode.wrap = "off";
    
    if (screen.width > 600) {
        document.getElementById("editor-container").appendChild(editorNode);
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
        editorNode.value = "# Author: Isaac Robert \n# GitCode v0.1";
        let lineNumbering = document.getElementById("lineCounter");
        document.getElementById("editor-container").insertBefore(editorNode, lineNumbering.nextSibling)
        

        // Synchronize scrollling
        editorNode.addEventListener('scroll', () => {
            lineNumbering.scrollTop = editorNode.scrollTop;
            lineNumbering.scrollLeft = editorNode.scrollLeft;
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
    }
    
}



function changeLanguage () {
    let language = document.getElementById("languages").value;
    console.log(language);
    if(language == 'c' || language == 'cpp')editor.setOption("mode", "c_cpp");
    else if(language == 'javascript')editor.setOption("mode", "php");
    else if(language == 'python')editor.setOption("mode", "python");
    else if(language == 'node')editor.setOption("mode", "javascript");
}


function executeCode() {
    console.log("Executing!");
}