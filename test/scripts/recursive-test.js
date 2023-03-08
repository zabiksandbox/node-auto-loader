/* eslint-disable */
const AutoLoader = require('../../auto-loader');
const Chai = require('chai');

const autoLoader = new AutoLoader('../modules/recursive');
const expect = Chai.expect;

describe('When the recursive option is enabled all modules should:', () => {

    it('auto load successfully.', async () => {
        let pass = true;
        const options = { allowJSON: true, recursive: true };

        function loadCallback(module) {
            if(module.default) {
                module = module.default;
            }
            // Demo modules have 2 public functions, JSON objects only have 1 property.
            if(Object.keys(module).length === 2) {
                if(!module.getLocation || !module.getName){
                    pass = false;
                }
            } else {
                if(!module.name) {
                    pass = false;
                }
            }
        }
        await autoLoader.loadModules(loadCallback, options);
        expect(pass).to.eql(true);
    });

    it('be usable, triggering no errors when their methods are invoked.', async () => {
        let pass = true;
        const options = { allowJSON: true, recursive: true };

        function loadCallback(module) {
            if(module.default) {
                module = module.default;
            }
            // Demo modules have 2 public functions, JSON objects only have 1 property.
            if(Object.keys(module).length === 2) {
                try {
                    module.getLocation();
                    module.getName();
                } catch(e) {
                    pass = false;
                }
            } else {
                try {
                    module.name;
                } catch(e) {
                    pass = false;
                }
            }
        }
        await autoLoader.loadModules(loadCallback, options);
        expect(pass).to.eql(true);
    });

});
