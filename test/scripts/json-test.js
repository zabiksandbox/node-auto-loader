/* eslint-disable */
const AutoLoader = require('../../auto-loader');
const Chai = require('chai');

const autoLoader = new AutoLoader('../modules/json');
const expect = Chai.expect;

describe('JSON files should:', () => {

    it('be allowed to auto load when the `allowJSON` option is `true`.', async () => {
        let options = { allowJSON: true };
        function ignoreCallback(json) {}
        await autoLoader.loadModules(ignoreCallback, options);
        const allowed = autoLoader.getAllowed();
        expect(allowed).to.be.a('array');
        expect(allowed.includes('.json')).to.eql(true);
    });

    it('auto load successfully.', async () => {
        let pass = true;
        let options = { allowJSON: true };
        function loadCallback(json) {
            if(!json || !json.name) {
                pass = false;
            }
        }
        await autoLoader.loadModules(loadCallback, options);
        expect(pass).to.eql(true);
    });

    it('not auto load when the `allowJSON` option is `false`.', async () => {
        let options = { allowJSON: false };
        function ignoreCallback(json) {}
        await autoLoader.loadModules(ignoreCallback, options);
        const allowed = autoLoader.getAllowed();
        expect(allowed).to.be.a('array');
        expect(allowed.includes('.json')).to.eql(false);
    });

});
