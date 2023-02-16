var editor, editorNode, editorSet;

const startObserver = () => {
    console.log("Started Observer...");
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
    document.getElementById("lineCounter").style.display = "none";
    if (window.screen.width > 600) {
        console.log("Codemirror...")
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
            
        } catch (error) {
            console.log(error);
        }
        
    }
}

window.onload = function() {
    startObserver()
}
