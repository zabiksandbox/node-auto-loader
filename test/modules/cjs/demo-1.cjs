const Path = require('path');

const Demo1 = (function () {

    const NAME = 'CJS Demo 1';

    const getLocation = function () {
        const unused = Path.extname(__filename);
        return __dirname;
    };

    const getName = function () {
        return NAME;
    };

    return {
        getLocation,
        getName
    };

}());

module.exports = Demo1;
