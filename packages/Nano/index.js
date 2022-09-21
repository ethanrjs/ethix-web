let content;
let openedFile;
CommandManager.add(
    'nano',
    'Open a fullscreen editor for a file.',
    'nano (file name)',
    async args => {
        // cache the Terminal content
        content = document.getElementById('output').innerHTML;
        // clear the Terminal
        document.getElementById('output').innerHTML = '';

        // make the Terminal editable
        document.getElementById('output').contentEditable = true;
        document.getElementById('output').focus();

        // fetch the file contents of /file/name
        openedFile = args[0];
        await fetch(`/file/${openedFile}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (!res.success) {
                    Terminal.err(res.message);
                    return;
                }
                // set the contents of the Terminal
                document.getElementById('input').style.display = 'none';
                document.getElementById('output').style.height = '100vh';
                document.getElementById('output').innerHTML = res.fileContents;
            })
            .catch(err => {
                Terminal.err(err);
            });
    }
);

document.getElementById('output').addEventListener('keydown', async event => {
    // if ctrl+x is pressed and the Terminal is editable write the file to console and clear the Terminal
    if (
        event.ctrlKey &&
        event.key === 'x' &&
        document.getElementById('output').isContentEditable
    ) {
        event.preventDefault();
        document.getElementById('output').contentEditable = false;
        fetch(`/file/${openedFile}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileContents: document.getElementById('output').innerHTML
            })
        })
            .then(res => {
                return res.json();
            })
            .then(res => {
                if (!res.success) {
                    Terminal.err(res.message);
                    return;
                }
                document.getElementById('output').innerHTML = content;
                document.getElementById('input').style.display = 'flex';
                document.getElementById('output').style.height = '95vh';
                Terminal.log('File saved successfully.'.green());

                document.getElementById('in').focus();
            });
    }
});
