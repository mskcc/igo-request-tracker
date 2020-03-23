const winston = require("winston");
const {constants} = require("./constants");

/**
 * Configures winston logger for application
 */
const container = new winston.Container();
const {format} = winston;
const {combine, label, json} = format;
container.add(constants.logger, {
	format: combine(
		label({label: "Project-Tracker"}),
		json()
	),
	transports: [new winston.transports.Console({level: "info"})]
});

exports.logger = container.get(constants.logger);
