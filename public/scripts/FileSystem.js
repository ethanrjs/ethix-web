class FileSystem {
    /**
     * Read a file from the ETHIX client-sided fs/ directory
     * @date 2022-09-11
     * @param {string} path
     * @returns {string}
     */
    static async readFile(path) {
        return fetch(`/file/${path}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                return res.json();
            })
            .then(json => {
                if (json.success) {
                    console.log(json.fileContents.replaceAll(/\r|\n/g, ''));
                    return json.fileContents.replaceAll(/\r|\n/g, '');
                } else {
                    return false;
                }
            });
    }

    static async writeFile(path, contents) {
        return fetch(`/file/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileContents: contents
            })
        })
            .then(res => {
                return res.json();
            })
            .then(json => {
                if (json.success) {
                    return true;
                } else {
                    return false;
                }
            });
    }

    static async appendFile(path, contents) {
        return fetch(`/file/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                fileContents: (await this.readFile(path)) + contents
            })
        })
            .then(res => {
                return res.json();
            })
            .then(json => {
                if (json.success) {
                    return true;
                } else {
                    return false;
                }
            });
    }

    static async deleteFile(path) {
        return fetch(`/file/${path}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                return res.json();
            })
            .then(json => {
                if (json.success) {
                    return true;
                } else {
                    return false;
                }
            });
    }
}
