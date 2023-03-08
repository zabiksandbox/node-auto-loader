const Path = require('path');

const Demo2 = (function () {

    const NAME = 'CJS Demo 2';

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

module.exports = Demo2;
