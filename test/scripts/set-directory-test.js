/* eslint-disable */
const AutoLoader = require('../../auto-loader');
const Chai = require('chai');
const Path = require('path');

const autoLoader = new AutoLoader('./');
const expect = Chai.expect;

describe('The `setDirectory` method should:', () => {

    it('allow initializing with the current (./) directory path.', (done) => {
        const cwd = autoLoader.getDirectory();
        expect(cwd).to.be.a('string');
        expect(cwd).to.equal(__dirname);
        // Prep for next test and continue:
        autoLoader.setDirectory('../');
        done();
    });

    it('allow initializing with the previous (../) directory path.', (done) => {
        const cwd = autoLoader.getDirectory() + '/';
        expect(cwd).to.be.a('string');
        expect(cwd).to.equal( Path.join(__dirname, '../' ) );
        // Prep for next test and continue:
        autoLoader.setDirectory(__dirname);
        done();
    });

    it('allow initializing with an absolute directory path.', (done) => {
        const cwd = autoLoader.getDirectory();
        expect(cwd).to.be.a('string');
        expect(cwd).to.equal( __dirname );
        done();
    });

});
