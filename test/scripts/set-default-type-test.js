/* eslint-disable */
const AutoLoader = require('../../auto-loader');
const Chai = require('chai');

const autoLoader = new AutoLoader();
const expect = Chai.expect;

describe('The `setDefaultType` method should:', () => {

    it('default to CommonJS module (CJS).', (done) => {
        const type = autoLoader.getType();
        expect(type).to.be.a('string');
        expect(type).to.equal('CJS');
        // Prep for next test and continue:
        autoLoader.setType('MJS');
        done();
    });

    it('allow switching to ES6 module (MJS).', (done) => {
        const type = autoLoader.getType();
        expect(type).to.be.a('string');
        expect(type).to.equal('MJS');
        // Prep for next test and continue:
        autoLoader.setType('CJS');
        done();
    });

    it('allow switching to CommonJS module (CJS).', (done) => {
        const type = autoLoader.getType();
        expect(type).to.be.a('string');
        expect(type).to.equal('CJS');
        done();
    });

});
