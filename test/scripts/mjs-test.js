/* eslint-disable */
const AutoLoader = require('../../auto-loader');
const Chai = require('chai');

const autoLoader = new AutoLoader('../modules/mjs');
const expect = Chai.expect;

autoLoader.setType('MJS');

describe('ES6 (MJS) modules should:', () => {

    it('auto load successfully.', async () => {
        let pass = true;
        function loadCallback(module) {
            if(module.default){
                module = module.default;
            }
            if(!module.getLocation || !module.getName){
                pass = false;
            }
        }
        await autoLoader.loadModules(loadCallback);
        expect(pass).to.eql(true);
    });

    it('be usable, triggering no errors when their methods are invoked.', async () => {
        let pass = true;
        function loadCallback(module) {
            if(module.default){
                module = module.default;
            }
            if(!module.getLocation || !module.getName){
                pass = false;
            } else {
                try {
                    module.getLocation();
                    module.getName();
                } catch(e) {
                    pass = false;
                }
            }
        }
        await autoLoader.loadModules(loadCallback);
        expect(pass).to.eql(true);
    });

});
