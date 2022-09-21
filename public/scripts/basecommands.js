CommandManager.add(
    'epm',
    'Ethix Package Manager command',
    'epm (install|reinstall|uninstall|create|search|list) (package name)',
    async args => {
        if (
            !args[1] &&
            (args[0].toLowerCase() !== 'search' ||
                args[0].toLowerCase() !== 'list')
        ) {
            Terminal.err('Invalid arguments');
            return;
        } else if (args[0].toLowerCase() === 'search') {
            Terminal.log('Searching for packages...');
            let res = await fetch('/repo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    query: args[1]
                })
            })
                .then(res => {
                    return res.json();
                })
                .then(res => {
                    if (!res.success) {
                        return Terminal.err(res.error);
                    }

                    let longestPackageName = 0;
                    res.results.forEach(result => {
                        if (result.name.length > longestPackageName) {
                            longestPackageName = result.name.length;
                        }
                    });
                    let longestPackageVersion = 0;
                    res.results.forEach(result => {
                        if (result.version.length > longestPackageVersion) {
                            longestPackageVersion = result.version.length;
                        }
                    });

                    Terminal.log(
                        'Found '.lightgreen() +
                            res.results.length.toString().green() +
                            ' results:'.lightgreen()
                    );
                    Terminal.log(
                        `\t${'Package'.padEnd(
                            longestPackageName + 1,
                            '\u00a0'
                        )} ${'Version'.padEnd(
                            longestPackageVersion + 1,
                            '\u00a0'
                        )} Description`
                    );

                    res.results.forEach(result => {
                        Terminal.log(
                            `\t${result.name
                                .padEnd(longestPackageName + 1, '\u00a0')
                                .lightgreen()} ${result.version
                                .padEnd(longestPackageVersion + 2, '\u00a0')
                                .lightgray()} ${result.description.lightblue()}`
                        );
                    });
                });
            return;
        }
        switch (args[0]) {
            case 'install':
                Terminal.log('Installing package...'.yellow());
                fetch('/packages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        package: args[1],
                        operation: args[0],
                        user: 'default'
                    })
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(res => {
                        if (!res.success) {
                            return Terminal.err(res.error);
                        }
                        // iterate through res.scripts and append them to the DOM
                        res.scripts.forEach((script, index) => {
                            let script2 = document.createElement('script');
                            script2.id = `package-${args[1]}-${index}`;
                            script2.src = `/termpackages/${args[1]}/${script}`;
                            document.body.appendChild(script2);
                        });
                        Terminal.log(
                            'Package downloaded successfully!'.green()
                        );
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
            case 'reinstall':
                Terminal.log('Reinstalling package...'.yellow());
                fetch('/packages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        package: args[1],
                        operation: 'uninstall',
                        user: 'default'
                    })
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(res => {
                        if (!res.success) {
                            Terminal.log(
                                'Skipping uninstall (package is not installed)'.gray()
                            );
                        }
                        // iterate through all scripts in res.scripts and remove them from the DOM
                        if (res.success) {
                            res.scripts.forEach((script, index) => {
                                let script2 = document.getElementById(
                                    `package-${args[1]}-${index}`
                                );
                                script2?.parentNode?.removeChild(script2);
                            });
                            Terminal.log(
                                'Deleted package successfully...'.yellow()
                            );
                        }

                        // send a request to the server to install the package
                        fetch('/packages', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                package: args[1],
                                operation: 'install',
                                user: 'default'
                            })
                        })
                            .then(res => {
                                return res.json();
                            })
                            .then(res => {
                                if (!res.success) {
                                    return Terminal.err(
                                        'An error prevented your package from reinstalling.'
                                    );
                                }
                                // iterate through res.scripts and append them to the DOM
                                res.scripts.forEach((script, index) => {
                                    let script2 =
                                        document.createElement('script');
                                    script2.id = `package-${args[1]}-${index}`;
                                    script2.src = `/termpackages/${args[1]}/${script}`;
                                    document.body.appendChild(script2);
                                });
                                Terminal.log(
                                    'Package reinstalled successfully!'.green()
                                );
                                location.reload(true);
                            })
                            .catch(err => {
                                console.log(err);
                            });
                    })
                    .catch(err => {
                        console.log(err);
                    });
                break;
            case 'uninstall':
                Terminal.log('Uninstalling package...'.yellow());
                fetch('/packages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        package: args[1],
                        operation: args[0],
                        user: 'default'
                    })
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(res => {
                        if (!res.success) {
                            return Terminal.err(res.message);
                        }
                        // iterate through res.scripts and remove them from the DOM
                        res.scripts.forEach((script, index) => {
                            let script2 = document.getElementById(
                                `package-${script.split('.')[0]}-${index}`
                            );
                            script2?.parentNode?.removeChild(script2);
                        });
                        Terminal.log(
                            'Package uninstalled successfully!'.green()
                        );
                        location.reload(true);
                    })
                    .catch(err => {
                        Terminal.err(err);
                    });
                break;
            case 'create':
                Terminal.log('Creating package...'.yellow());
                fetch('/packages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        package: args[1],
                        operation: args[0],
                        user: 'default'
                    })
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(res => {
                        if (!res.success) {
                            return Terminal.err(res.message);
                        }
                        Terminal.log('Package created successfully!'.green());
                        Terminal.log(
                            'Navigate to ' +
                                '/packages/'.green() +
                                ' in the server view the package.'
                        );
                    })
                    .catch(err => {
                        Terminal.err(err);
                    });
                break;
            case 'search':
                Terminal.log(
                    'Searching package repository for "'.yellow() +
                        args[1].green() +
                        '"...'.yellow()
                );
                fetch('/repo', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        query: args[1]
                    })
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(res => {
                        if (!res.success) {
                            return Terminal.err(res.error);
                        }
                        Terminal.log(
                            'Found ' + res.results.length + ' results:'
                        );
                        Terminal.log(
                            '\tPackage\t\t\t\tVersion\t\t\t\tDescription'.gray()
                        );
                        res.results.forEach(result => {
                            Terminal.log(
                                `\t${result.name}\t\t\t\t${result.version}\t\t\t\t${result.description}`
                            );
                        });
                    });
                break;
            case 'list':
                Terminal.log('Listing installed packages...'.yellow());
                fetch('/packages', {
                    method: 'GET'
                })
                    .then(res => {
                        return res.json();
                    })
                    .then(res => {
                        if (!res.success) {
                            return Terminal.err(res.error);
                        }
                        Terminal.log(
                            'Found ' + res.packages.length + ' packages:'
                        );
                        Terminal.log(
                            '\tPackage\t\t\t\tVersion\t\t\t\tDescription'.gray()
                        );
                        res.packages.forEach(result => {
                            Terminal.log(
                                `\t${result.name}\t\t\t\t${result.version}\t\t\t\t${result.description}`
                            );
                        });
                    });
                break;
            default:
                Terminal.err('Invalid operation');
                break;
        }
    }
);

CommandManager.add(
    'help',
    'Lists a(ll) command(s) and their proper usage.',
    'help [command]',
    args => {
        Terminal.log('\t() = required'.gray());
        Terminal.log('\t[] = optional'.gray());
        Terminal.log('\t{} = optional with default value'.gray());
        Terminal.log('\tkey=value = accepts an option and a value'.gray());
        Terminal.log('\t[one|two] = accepts a specific value'.gray());
        Terminal.log('\t[one,two] = accepts a list of values'.gray());
        Terminal.log('\t" " = accepts a string with spaces'.gray());
        Terminal.log('Available commands:'.green());
        let commands = CommandManager.getAll();
        // sort commands by name
        // commands is an object, so we need to convert it to an array
        commands = Object.keys(commands).map(key => {
            return commands[key];
        });
        commands.sort((a, b) => {
            if (a.name < b.name) {
                return -1;
            }
            if (a.name > b.name) {
                return 1;
            }
            return 0;
        });

        // get the maxLength of the command names
        // get the maxUsageLength of the command usages

        let maxLength = 0;
        let maxUsageLength = 0;

        commands.forEach(command => {
            if (command.name.length > maxLength) {
                maxLength = command.name.length;
            }
            if (command.usage.length > maxUsageLength) {
                maxUsageLength = command.usage.length;
            }
        });
        Terminal.log(
            `\tName${'\u00a0'.repeat(maxLength + 5)}Usage`.gray().italic() +
                `${'\u00a0'.repeat(maxUsageLength + 3)}Description`
                    .gray()
                    .italic()
        );

        commands.forEach(command => {
            Terminal.log(
                `\t${command.name

                    .padEnd(maxLength + 8, '\u00a0')
                    .lightgreen()} ${command.usage
                    .padEnd(maxUsageLength + 8, '\u00a0')
                    .lightgray()}${command.description.lightblue()}`
            );
        });
    }
);

CommandManager.add('clear', 'Clears the terminal.', 'clear', args => {
    Terminal.cls();
});
CommandManager.add(
    'echo',
    'Prints a message to the Terminal.',
    'echo (message)',
    args => {
        Terminal.log(args.join(' '));
    }
);

CommandManager.add(
    'ls',
    'Lists all files in the current directory.',
    'ls [directory]',
    args => {
        let dir = args[0] || '';
        fetch(`/files/${dir}`, {
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
                Terminal.log(res.files.join('\n'));
            })
            .catch(err => {
                Terminal.err(err.message);
            });
    }
);
