const properties = {
    'base': {
    },
    'dev': {
        home: '',
        home_page_path: '',
        login_page_url: 'http://localhost:4200/',
        projects_endpoint: 'http://localhost:4000/api/requests',
        swagger: 'http://localhost:4000/request-tracker-swagger',
        host: 'http://localhost:3000/'
    },
    'qa': {
        home: '/request-tracker',
        home_page_path: 'request-tracker',
        projects_endpoint: 'https://igodev.mskcc.org/request-tracker/api/requests',
        login_page_url: '/login',
        swagger: 'https://igodev.mskcc.org/request-tracker-swagger',
        host: 'https://igodev.mskcc.org'
    },
    'prod': {
        home: '/request-tracker',
        home_page_path: 'request-tracker',
        projects_endpoint: 'https://igo.mskcc.org/request-tracker/api/requests',
        login_page_url: '/login',
        swagger: 'https://igo.mskcc.org/request-tracker-swagger',
        host: 'https://igo.mskcc.org'
    }
}

const env = process.env.REACT_APP_ENV.toLowerCase();
const config = Object.assign( properties.base, properties[ env ] )
if(env !== 'prod'){
    console.log(`${env} ENVIRONMENT: ${JSON.stringify(config)}`);
}

export const HOME_PAGE_PATH = config.home_page_path;
export const LOGIN_PAGE_URL = config.login_page_url;
export const PROJECTS_ENDPOINT = config.projects_endpoint;
export const HOME = config.home;
export const HOST = config.host;
export const SWAGGER = config.swagger;
