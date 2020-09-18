//During the automated test the env variable, We will set it to "test"
process.env.ENV = "TEST";

// Setup server to use chai
let chai = require("chai");
let chaiHttp = require("chai-http");
let server = require("../app");
chai.use(chaiHttp);

//Export this to use in multiple files
module.exports = {
    server: server,
};
