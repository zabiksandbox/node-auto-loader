/* eslint-disable no-underscore-dangle */

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const Demo1 = (function () {

    const NAME = 'MJS Demo 1';

    const getLocation = function () {
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

export default Demo1;
