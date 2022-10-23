var editor;

window.onload = function() {
    if (screen.width > 600) {
        let editorNode = document.getElementById("editor");
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