// input handler
let backnavCursorLocation = 0;
document.getElementById('in').addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;

    e.preventDefault();
    if (document.getElementById('in').value.trim() == '') return;
    backnavCursorLocation = 0;
    let command = document.getElementById('in').value;
    document.getElementById('in').value = '';
    Terminal.log('$ > ' + command);
    // test if the command exists
    if (CommandManager.get(command.split(' ')[0])) {
        CommandManager.run(command);
    } else {
        Terminal.err('Command not found');
    }
    // send post to /command
    fetch('/command', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ command: command })
    });
});
// when the tab key is pressed, autocomplete the command
document.getElementById('in').addEventListener('keydown', function (e) {
    if (e.key !== 'Tab') return;
    e.preventDefault();
    let cmd = document.getElementById('in').value;
    let possibleCommands = [];
    for (let command in CommandManager.getAll()) {
        if (command.startsWith(cmd)) {
            possibleCommands.push(command);
        }
    }
    if (possibleCommands.length === 0) {
        Terminal.err('No possible commands to autocomplete.');
    } else if (possibleCommands.length === 1) {
        document.getElementById('in').value = possibleCommands[0];
    } else {
        Terminal.log(possibleCommands.join('\t'));
    }
});
// when the page is loaded, add all packages to the Terminal
window.onload = function () {
    Terminal.log('Loading packages...'.yellow());
    // get all packages in ../termpackages/
    fetch('/installedpackages', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => {
            return response.json();
        })
        .then(dat => {
            // for each package, add it to the Terminal
            let { packages: data } = dat;
            for (let i = 0; i < data.length; i++) {
                Terminal.log(
                    'Located package '.gray() + `${data[i]}`.green().bold()
                );
                Terminal.log(`\tInstalling package ${data[i]}...`.yellow());
                let script = document.createElement('script');
                script.id = `package-${data[i]}`;
                script.src = `/termpackages/${data[i]}/index.js`;
                document.body.appendChild(script);
                Terminal.log(`\tPackage ${data[i]} installed!`.green());
            }
        });
};
// when the page loads fetch /log and write the log to the Terminal
// the response is the entire log file
// when up or down arrow key is pressed change backnav cursor location

document.getElementById('in').addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
    e.preventDefault();
    if (e.key === 'ArrowUp') {
        backnavCursorLocation++;
    } else if (e.key === 'ArrowDown') {
        if (backnavCursorLocation > 0) backnavCursorLocation--;
    }
    console.log(backnavCursorLocation);
    Terminal.backnav(backnavCursorLocation);
});

fetch('/log', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json'
    }
})
    .then(response => {
        return response.text();
    })
    .then(dat => {
        document.getElementById('output').innerHTML = dat;
    });
