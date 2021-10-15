/* eslint-disable */
const Path = require('path');
const FS = require('fs');

// Auto load and run every test in the scripts directory.
const files = FS.readdirSync( Path.join( __dirname, './scripts' ) );
files.forEach( (file) => {
    file = Path.join( __dirname, './scripts', file );
    const baseName = Path.basename(file);
    if ( baseName.includes('test.js') ) {
        require(file);
    }
});

