const express = require("express");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const path = require("path");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const indexRouter = require("./routes/index");
const apiRouter = require("./routes/api");
const apiResponse = require("./helpers/apiResponse");
const cors = require("cors");
const { logger } = require("./helpers/winston");

const { db } = require("./db/data-access");

const jwtInCookie = require("jwt-in-cookie");
// TODO - take from a shared location on server
jwtInCookie.configure({secret: process.env.JWT_SECRET});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//To allow cross-origin requests
app.use(cors());

// Swagger
// Configure swagger endpoint based on NODE-env (this should be defined in the /srv/www/pm2/ecosystem.config.js
const swagger_base = (process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "qa") ? '/request-tracker' : '';
const options = {
	definition: {
		openapi: "3.0.0",
		info: {
			title: `IGO Request Tracker API (${process.env.NODE_ENV})`,
			version: "1.0.0",
			description:
				"Documentation of endpoints for IGO's request tracker",
			license: {
				name: "MIT",
				url: "https://spdx.org/licenses/MIT.html",
			},
			contact: {
				name: "IGO-Request-Tracker",
				url: "https://igodev.mskcc.org/request-tracker",
				email: "streidd@mskcc.org",
			},
		},
		servers: [
			{
				url: `${swagger_base}/api/requests`,	// Note - /request-tracker/ is for deployment
			},
		],
	},
	apis: ["./routes/projects.js"],
};
const specs = swaggerJsdoc(options);
app.use(
	"/request-tracker-swagger",
	swaggerUi.serve,
	swaggerUi.setup(specs)
);

//Route Prefixes
app.use("/", indexRouter);
app.use("/api/", apiRouter);

// throw 404 if URL not found
app.all("*", function(req, res) {
	return apiResponse.notFoundResponse(res, "Page not found");
});

app.use((err, req, res) => {
	if(err.name == "UnauthorizedError"){
		return apiResponse.unauthorizedResponse(res, err.message);
	}
});

module.exports = app;
