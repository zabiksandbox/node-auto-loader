const AutoLoader = require('./auto-loader');
const Path = require('path');

const autoLoader = new AutoLoader( Path.join(__dirname, 'modules' ) );

function callback(mod) {
    if (mod.default) {
        mod = mod.default;
    }
    mod();
}

function check(filename) {
    //console.log('File:', filename);
    return true;
}

console.log(`Auto load: ${autoLoader.getDirectory()}`);

autoLoader.loadModules(callback, check)
          .then( (results) => {
            if( results.failedCount === 0 ) {
                console.log('All loaded successfully!');
            } else {
                console.log('Some modules not loaded.');
            }
          } )
          .catch( (error) => {
            console.log(error);
          } );