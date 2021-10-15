const FS = require('fs');
const Path = require('path');

// Fallback: Should always be CJS unless the user altered this file.
let INTERNAL_TYPE = 'CJS';
try {
    let CommonJSCheck = require.main;
    CommonJSCheck = module;
} catch (e) {
    INTERNAL_TYPE = 'MJS';
}

/**
 * Will attempt to auto load every JavaScript file in a requested directory.
 *
 * @param {String} path The path to the directory to attempt to auto load.
 */
const AutoLoader = (function (path) {

    let TYPE;
    let DIR;
    const ALLOW = ['.js', '.cjs', '.mjs'];

    /**
     * Converts an absolute file path into an OS safe file:// path.
     *
     * @param {String} absPath
     * @return {String} The path converted to a file:// path for Windows.
     */
    const convertToFileURL = function (absPath) {
        let pathName = Path.resolve(absPath).replace(/\\/g, '/');
        // Windows drive letter must be prefixed with a slash.
        if (pathName[0] !== '/') { pathName = `/${pathName}`; }
        if (process.platform.includes('win')) {
            return encodeURI(`file://${pathName}`).replace(':///', '://');
        }
        return pathName;
    };

    /**
     * Get the array of allowed file types. Only files that end with these
     * extensions will be auto loaded.
     *
     * @return {Array} An array of allowed file extensions.
     */
    const getAllowed = function () {
        return JSON.parse(JSON.stringify(ALLOW));
    };

    /**
     * Quick and dirty way to detect if this package is being used in a
     * CommonJS (CJS) or ES6 (MJS) environment.
     *
     *  @return {String|null} The environment abbreviation or null if not found.
     */
    const getCallerType = function () {
        let s;
        const error = new Error();
        // eslint-disable-next-line no-cond-assign, no-void
        const stack = (s = error.stack) === null || s === void 0 ? void 0 : s.split('\n');
        const stackAsString = stack.toString();
        const mjsCheck = new RegExp('modules\\/esm|Object\\.loadESM', 'g');
        const cjsCheck = new RegExp('modules\\/cjs|Object\\.Module\\.', 'g');
        if (mjsCheck.test(stackAsString)) {
            return 'MJS';
        }
        if (cjsCheck.test(stackAsString)) {
            return 'CJS';
        }
        return null;
    };

    /**
     * The options argument for loadModules is optional. This function insures
     * that all options are present or set to their defaults.
     *
     * @param {Object|undefined} options The user supplied options object or undefined.
     * @return {Object} A complete options object for loadModules.
     */
    const getCorrectOptions = function (options) {
        if (!options || typeof options !== 'object') {
            options = {
                allowJSON: false,
                checkFirst: null,
                recursive: false
            };
        }

        if (!options.allowJSON) {
            options.allowJSON = false;
        }

        if (options.allowJSON) {
            if (!ALLOW.includes('.json')) {
                ALLOW.push('.json');
            }
        } else if (ALLOW.includes('.json')) {
            ALLOW.splice(ALLOW.indexOf('.json'), 1);
        }

        if (!options.checkFirst || typeof options.checkFirst !== 'function') {
            // Use an always passing checkFirst function.
            options.checkFirst = (ignored) => true;
        }

        if (!options.recursive) {
            options.recursive = false;
        }

        return options;
    };

    /**
     * Getter to retrieve the currently configured directory to auto load.
     *
     * @return {String} The currently configured directory to auto load.
     */
    const getDirectory = function () {
        return DIR;
    };

    /**
     * Build an array of all modules requested to be auto loaded.
     *
     * @param {String} dir The directory to auto load.
     * @param {Array} modules An array of absolute paths to the modules to load.
     * @param {Object} options The options being used by loadModules.
     * @return {Array} An array of absolute paths to the modules to auto loaded.
     */
    const getModulePaths = function (dir, modules, options) {
        if (!Array.isArray(modules)) {
            options = modules;
            modules = [];
        }

        const items = FS.readdirSync(dir);

        for (let i = 0; i < items.length; i++) {
            const pathToItem = Path.normalize(Path.join(dir, items[i]));
            if (ALLOW.includes(Path.extname(pathToItem))) {
                modules.push(pathToItem);
            } else if (FS.lstatSync(pathToItem).isDirectory() && options.recursive) {
                getModulePaths(pathToItem, modules, options);
            }
        }

        return modules;
    };

    /**
     * Get the type mode being used: CommonJS (CJS) or ES6 (MJS).
     *
     * @return {*}
     */
    const getType = function () {
        if (!TYPE) {
            setType();
        }
        return TYPE;
    };

    /**
     * Auto load every JavaScript file located in the configured DIR and pass it back to a callback.
     *
     * @param {Function} callback A callback function to pass the loaded module to.
     * @param {Object} options An optional object used to alter the way loadModules works:
     *  allowJSON: true if JSON files should be loaded too
     *  checkFirst: a function to path the modules abs path to, return true to load or false to skip
     *  recursive: true if all directories under DIR should be loaded too
     * @return {Promise} Returns a promise that will resolve with a results object.
     */
    const loadModules = async function (callback, options) {

        options = getCorrectOptions(options);

        if (!TYPE) {
            setType();
        }

        if (!FS.existsSync(DIR)) {
            throw new ReferenceError(`Directory does not exists: ${DIR}`);
        }

        if (typeof callback !== 'function') {
            throw new ReferenceError('A callback function is required for `loadModules`.');
        }

        const results = {
            failed: [],
            failedCount: 0,
            loaded: [],
            loadedCount: 0
        };

        const modules = getModulePaths(DIR, options);

        for (let i = 0; i < modules.length; i++) {
            const load = modules[i];
            const filePath = convertToFileURL(load);
            try {
                // Only load the file if the user wants it; allows skipping files.
                if (options.checkFirst(filePath)) {
                    const ext = Path.extname(filePath);
                    let newModule;
                    if (ext === '.json') {
                        // eslint-disable-next-line global-require, import/no-dynamic-require
                        newModule = JSON.parse(FS.readFileSync(filePath, 'utf8'));
                    } else if (ext === '.mjs' || TYPE === 'MJS') {
                        // eslint-disable-next-line no-await-in-loop
                        newModule = await import(filePath);
                    } else if (ext === '.cjs' || TYPE === 'CJS') {
                        // eslint-disable-next-line global-require, import/no-dynamic-require
                        newModule = require(filePath);
                    }
                    if (newModule) {
                        callback(newModule);
                    }
                    results.loaded.push(filePath);
                    results.loadedCount += 1;
                }
            } catch (error) {
                results.failed.push({
                    error: error.message,
                    file: filePath
                });
                results.failedCount += 1;
            }
        }

        return results;
    };

    /**
     * Set the type of module mode being used: CommonJS (CJS) or ES6 (MJS).
     *
     * @param {String} type CommonJS (CJS) or ES6 (MJS).
     * @return {null} Returns nothing, used as a short circuit.
     */
    const setType = function (type) {
        // If a type was passed in attempt to use it.
        if (type) {
            type = type.toUpperCase().trim();
            if (type === 'MJS' || type === 'CJS') {
                TYPE = type;
                return;
            }
        }
        // If no type was passed in attempt to determine it.
        TYPE = getCallerType();
        if (!TYPE) {
            TYPE = INTERNAL_TYPE;
        }
    };

    /**
     * Setter to change the configured DIR to auto load.
     *
     * @param {String} path The path to the directory to attempt to auto load.
     */
    const setDirectory = function (pathToDir) {
        pathToDir = pathToDir || __dirname;
        if (pathToDir[0] === '.') {
            if (module && module.parent) {
                pathToDir = Path.join(module.parent.path, pathToDir);
            } else {
                pathToDir = Path.join(__dirname, pathToDir);
            }
        }
        DIR = Path.resolve(pathToDir);
    };

    // Initialize the class when instantiated.
    setDirectory(path);

    // Public methods.
    return {
        getAllowed,
        getDirectory,
        getType,
        loadModules,
        setType,
        setDirectory,
    };

});

module.exports = AutoLoader;
