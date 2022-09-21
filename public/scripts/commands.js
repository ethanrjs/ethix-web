// create modular command system for the Terminal
// users can script their own commands and import them

class Command {
    constructor(name, description, usage, func) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.func = func;
    }
}

class CommandManager {
    static commands = {};
    /**
     * Register a command with the CommandManager. This will overwrite any existing commands with the same name. 
     * @param {string} name
     * @param {string} description
     * @param {string} usage
     * @param {function} func
     * @date 2022-09-11
     * @returns void
     
     */
    static add(name, description, usage, func) {
        this.commands[name] = new Command(name, description, usage, func);
    }

    /**
     * Remove a command from the CommandManager.
     * @param {string} name
     * @date 2022-09-11
     * @returns void
     **/

    static remove(name) {
        delete this.commands[name];
    }

    /**
     * Get a command from the CommandManager.
     * @param {string} name
     * @date 2022-09-11
     * @returns {Command}
     **/
    static get(name) {
        return this.commands[name];
    }
    /**
     * Get all commands registered with the CommandManager.
     * @param {string} name
     * @date 2022-09-11
     * @returns {Command[]}
     **/
    static getAll() {
        return this.commands;
    }
    /**
     * Run a command with given arguments (similar to user input).
     * @param {string} command
     * @date 2022-09-11
     * @returns void
     **/
    static run(command) {
        let commandName = command.split(' ')[0];
        let commandArgs = command.split(' ').slice(1);
        console.log(command);
        this.commands[commandName].func(commandArgs);
    }
    /**
     * Tab complete a command
     * @param {string} text
     * @date 2022-09-11
     **/
    static tabComplete(text) {
        for (let command in this.commands) {
            if (command.toLowerCase().startsWith(text.toLowerCase())) {
                return command;
            }
        }
    }
}
