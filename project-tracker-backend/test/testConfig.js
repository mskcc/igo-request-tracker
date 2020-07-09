//During the automated test the env variable, We will set it to "test"

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app');
let should = chai.should();
chai.use(chaiHttp);

//Export this to use in multiple files
module.exports = {
    chai: chai,
    server: server,
    should: should,
};
