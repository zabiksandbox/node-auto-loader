# Node Auto Loader (NAL)
Node Auto Loader (NAL) is a dependency free single file module auto loader. NAL is capable of automatically auto loading CommonJS (CJS) modules, ES6 (MJS) modules, and JSON files. You should consider using NAL if:

:heavy_check_mark:&nbsp; You have a lot of modules to require/import at once.

:heavy_check_mark:&nbsp; You want to modularize your application.

:heavy_check_mark:&nbsp; You want to automate a process; auto loading many Express routes or MongoDB schemas for example.

## Installation

### Automatic
NAL can be installed with `npm` and will run in either CommonJS (CJS) or ES6 (MJS) projects. Add NAL as a dependency for your project with:

```javascript
npm install node-auto-loader
```

### Manual
NAL can be manually incorporated into your CommonJS projects by adding the `auto-loader.js` file into your project, and then requiring it where needed:

```javascript
const AutoLoader = require('./auto-loader');
```

If you manually alter the `auto-loader.js` file and convert it into an ES6 (MJS) module, you can import it in ES6 projects:

```javascript
import AutoLoader from './auto-loader.js';
```

**NOTE:** Manual installs are not recommended, use the automatic install instead to automatically receive updates.

## Usage
NAL can be instantiated and run with various options. Here is a simple example of NAL being used to auto load modules from a fictional `modules` directory:

```javascript
// CommonJS require:
const AutoLoader = require('node-auto-loader');
// OR ES6 import:
import AutoLoader from ('node-auto-loader');

// Get a new instance of AutoLoader and set it to load the modules directory.
const autoLoader = new AutoLoader('./modules');

/*
 * Modules are automatically loaded then passed to a callback function. You can
 * do whatever you need to in the callback function, like invoking a module, or
 * nothing if you just needed the module to be loaded; this is always required!
 */
function callback(module) { ... }

/*
 * Optional callback function that must return a true or false. This allows you
 * to decide if a module should be auto loaded (true) or skipped (false).
 */
function checkModuleFirst(pathToModule) { ... }

// What options to use when loading modules. If missing defaults will be used.
const options = {
    allowJSON: false,
    checkFirst: checkModuleFirst,
    recursive: true
}

/**
 * Load the modules automatically. You do not need to capture the results
 * unless you want to. The results object will let you know what was
 * successfully auto loaded and what errors may have occurred.
 */
let results = await autoLoader.loadModules(callback, options);
```

### :bookmark: NAL Methods

#### **getAllowed**

- Returns an array of the autoLoader's allowed file types; usually ['.js', '.cjs', '.mjs'] if JSON was not allowed.

#### **getDirectory**

- Returns the absolute path to the directory autoLoader is currently configured to load; defaults to __dirname.

#### **getType**

- Returns the type of module autoLoader will attempt to load modules as; CommonJS (CJS) or ES6 (MJS) module.

#### **loadModules(callback[, options])**

- Returns a new Promise that will attempt to auto load all modules set by `setDirectory` or the directory autoLoader was instantiated with.
- `callback` is required. If you only need modules to auto load and do not need to invoke anything else, `callback` can be an empty function.
- `options` is an object that allows you to alter the way `loadModules` works; see next section for more information.

#### **setType(type)**

- `type` can be either `CJS` for CommonJS modules or `MJS` for ES6 modules.
- AutoLoader will detect the correct type for your project automatically, but you can use this to forcefully set the type.

#### **setDirectory(pathToDir)**

- `pathToDir` is a relative or absolute path to the directory to auto load.
- Allows changing the directory autoLoader uses after instantiation.

### :bookmark: NAL `loadModules` Options
The `loadModules` method accepts an optional `options` object. You can uses this object to alter the way `loadModules` works:

#### **allowJSON** &nbsp;&nbsp;&nbsp;default: false

- Set to `true` if you would like autoLoader to also auto load JSON files for you.
- JSON files are loaded with the node `fs` package, not `required` or `import`; this means they will not be cached.

#### **checkFirst** &nbsp;&nbsp;&nbsp;default: null

- Set to a `function` that will be called before autoLoader attempts to load a module.
- Will receive a single argument `filePath` allowing you to determine if the module should be loaded (`true`) or not (`false`); must return a `true` or `false` value!

#### **recursive** &nbsp;&nbsp;&nbsp;default: true

- Set to `false` if you do not want the autoLoader to recursively load modules.
- When `false` this will stop `loadModules` from recursively searching all directories under the configured directory for modules.

## Changelog

The [current changelog is here](./changelogs/v1.md). All [other changelogs are here](./changelogs).

## Contributions

NAL is an open source community supported project, if you would like to help please consider <a href="https://github.com/caboodle-tech/node-auto-loader/issues" target="_blank">tackling an issue</a> or <a href="https://ko-fi.com/caboodletech" target="_blank">making a donation</a> to keep the project alive.

**Reminder:** Before submitting new pull requests make sure to run `npm test`. If you add a new feature make sure it is covered by a new or existing test.