const { rejects } = require('assert');
const FS = require('fs');
const Path = require('path');


let INTERNAL_TYPE = 'CJS';
try {
    let CommonJSCheck = require.main;
    CommonJSCheck = module;
} catch(e) {
    INTERNAL_TYPE = 'MJS';
}

/**
 * Will attempt to auto load every JavaScript file in a requested directory.
 * 
 * @param {String} path The path to the directory to attempt to auto load.
 */
const AutoLoader = (function(path) {

    let TYPE;
    let DIR;
    const ALLOW = ['.js', '.cjs', '.mjs'];

    /**
     * Converts an absolute file path into a file:// path which is all OS safe.
     *
     * @param {String} absPath
     * @return {String} The path converted to a file:// path.
     */
    const convertToFileURL = function(absPath) {
        let pathName = Path.resolve(absPath).replace(/\\/g, '/');
        // Windows drive letter must be prefixed with a slash.
        if (pathName[0] !== '/') { pathName = '/' + pathName; }
        if (process.platform.includes('win')){
            return encodeURI('file://' + pathName).replace(':///', '://');
        }
        return pathName;
    };

    const getCallerType = function() {
        let s;
        const error = new Error();
        const stack = (s = error.stack) === null || s === void 0 ? void 0 : s.split('\n');
        const stackAsString = stack.toString();
        const mjsCheck = new RegExp( 'modules\\/esm|Object\\.loadESM', 'g' );
        const cjsCheck = new RegExp( 'modules\\/cjs|Object\\.Module\\.', 'g' );
        if ( mjsCheck.test(stackAsString) ) {
            return 'MJS';
        }
        if ( cjsCheck.test(stackAsString) ) {
            return 'CJS';
        }
        return null;
    };
    
    /**
     * Getter to retrieve the currently configured directory to auto load.
     *
     * @return {*} 
     */
    const getDirectory = function() {
        return DIR;
    };

    /**
     * Auto load every JavaScript file located in the configured DIR and pass it back to a callback.
     *
     * @param {Function} callback A callback function to pass the loaded module to.
     * @param {Function} checkFirst If provided we will check if you want to load the module by
     *                                 passing the modules filename to this callback function first.
     *                                 Your function must return true or false.
     * @return {null} Returns nothing, used to short circuit the function. 
     */
    const loadModules = async function(callback, checkFirst) {

        if(!TYPE) {
            setDefaultType();
        }

        if(!FS.existsSync(DIR)) {
            throw new ReferenceError(`Directory does not exists: ${DIR}`);
        }
        
        if (typeof callback !== 'function') {
            throw new ReferenceError('A callback function is required for `loadModules`.');
        }

        if (typeof checkFirst !== 'function') {
            // Use an always passing checkFirst function.
            checkFirst = (ignored) => { return true; };
        }

        const results = {
            failed: [],
            failedCount: 0,
            loaded: [],
            loadedCount: 0
        };
        const modules = [];

        FS.readdirSync(DIR).forEach((file) => {
            if ( ALLOW.includes(Path.extname(file)) ) {
                modules.push(Path.normalize(Path.join(DIR, file)));
            }
        });

        for (let i = 0; i < modules.length; i++) {
            const load = modules[i];
            const filePath = convertToFileURL(load);
            try {
                // Only load the file if the user wants it; allows skipping files.
                if ( checkFirst( filePath ) ) {
                    const ext = Path.extname(filePath);
                    let newModule;
                    if ( ext === '.mjs' || TYPE === 'MJS' ) {
                        newModule = await import(filePath);
                    } else if ( ext === '.cjs' || TYPE === 'CJS' ) {
                        newModule = require(filePath);
                    }
                    if (newModule) {
                        callback(newModule);
                    }
                    results.loaded.push(filePath);
                    results.loadedCount++;
                }
            } catch (error) {
                results.failed.push({
                    error,
                    file: filePath
                });
                results.failedCount++;
            }
        }

        return results;
    };

    const setDefaultType = function() {
        TYPE = getCallerType();
        if(!TYPE) {
            TYPE = INTERNAL_TYPE;
        }
    };

    /**
     * Setter to change the configured DIR to auto load.
     *
     * @param {String} path The path to the directory to attempt to auto load.
     */
    const setDirectory = function(path) {
        DIR = path || __dirname;
        if ( DIR[0] == '.' ) {
            if (module && module.parent) {
                DIR = Path.join( module.parent.path, path );
            } else if (process.argv) {
                for( let i = 0; i < process.argv.length; i++ ) {
                    if (process.argv[i].indexOf(__dirname)> -1) {
                        DIR = Path.join( Path.dirname(process.argv[i]), path );
                        break;
                    }
                }
            }
            DIR = Path.resolve(DIR);
        } else {
            DIR = Path.normalize(DIR);
        }
    };

    // Initialize the class when instantiated.
    setDirectory(path);

    return  {
        getDirectory,
        loadModules,
        setDefaultType,
        setDirectory,
    };

});

module.exports = AutoLoader;