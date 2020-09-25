const { logger } = require("../helpers/winston");

const properties = {
    'base': {
        lims_api: '',
        credentials: {
            username: "<ADD USERNAME>",
            password: "<ADD PASSWORD>"
        }
    },
    'dev': {
        lims_api: 'https://tango.mskcc.org:8443/LimsRest'
    },
    'qa': {
        lims_api: 'https://tango.mskcc.org:8443/LimsRest'
    },
    'prod': {
        lims_api: 'https://igolims.mskcc.org:8443/LimsRest'
    }
}

const env = process.env.NODE_ENV.toLowerCase();
const config = Object.assign( properties.base, properties[ env ] )
logger.info(`${env} ENVIRONMENT: ${JSON.stringify(config)}`);

exports.LIMS_API = config.lims_api;
exports.LIMS = config.credentials;

