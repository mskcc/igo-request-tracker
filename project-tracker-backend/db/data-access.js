const mongoose = require("mongoose");
var Schema = mongoose.Schema;

const {logger} = require("../helpers/winston");

const MONGODB_URL = process.env.MONGODB_URL;
mongoose.connect(MONGODB_URL, {useNewUrlParser: true, useUnifiedTopology: true})
	.then(() => {
		logger.log("info", `Connected to ${MONGODB_URL}`);
	})
	.catch(err => {
		logger.log("error", `Failed to connect to Mongo: "${err.message}"`);
		process.exit(1);
	});

/**
 * @username & @groups are the only two fields we need from @users, which has a full schema defined here -
 *        https://github.com/mskcc/igo-marketplace-login/blob/master/igo-marketplace-login-backend/models/UserModel.js
 */
const userCollection = mongoose.model("users", new Schema({username: String, groups: String}));
exports.userCollection = userCollection;
