CommandManager.add(
    'alias',
    'Create a quick-alias for a long command',
    'alias (create|remove) (alias) "[command]"',
    async args => {
        if (args[0] == 'create') {
            if (args[1] == undefined) {
                return 'Please specify an alias name.';
            } else if (args[2] == undefined) {
                return 'Please specify a command.';
            } else {
                let alias = args[1];
                // join the rest of the args into a string
                let command = args.slice(2).join(' ');
                await FileSystem.writeFile(
                    'aliases.json',
                    JSON.stringify({
                        [alias]: command
                    })
                );

                window.location.reload();
            }
        } else if (args[0] == 'remove') {
            if (args[1] == undefined) {
                return 'Please specify an alias name.';
            } else {
                let alias = args[1];
                fetch('/file/aliases.json', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        // fetch aliases.json and append the new alias
                        fileContents: JSON.stringify(
                            fetch('/file/aliases.json', {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json'
                                }
                            })
                                .then(res => {
                                    return res.json();
                                })
                                .then(json => {
                                    json[alias] = undefined;
                                    return json;
                                })
                        )
                    })
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(json => {
                        if (json.success) {
                            return window.location.reload();
                        } else {
                            return Terminal.err('Alias removal failure.');
                        }
                    });
            }
        }
    }
);

async function init() {
    let content = await FileSystem.readFile('aliases.json');
    console.log(content);
    content = JSON.parse(content);
    console.log(content);
    let aliases = Object.keys(content);
    aliases.forEach(alias => {
        CommandManager.add(
            alias,
            `Alias for ${content[alias].green()}`,
            alias,
            async args => {
                return await CommandManager.run(content[alias]);
            }
        );
        Terminal.log(`Loaded alias: ${alias} -> ${content[alias]}`);
    });
}
init();
