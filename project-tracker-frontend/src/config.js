const properties = {
    'base': {
    },
    'dev': {
        home: '',
        home_page_path: '',
        login_page_url: 'http://localhost:4200/',
        projects_endpoint: 'http://localhost:4000/api/requests',
        swagger: 'http://localhost:4000/swagger',
        host: 'http://localhost:3000/'
    },
    'qa': {
        home: '/request-tracker',
        home_page_path: 'request-tracker',
        projects_endpoint: 'https://igodev.mskcc.org/request-tracker/api/requests',
        login_page_url: '/login',
        swagger: 'https://igodev.mskcc.org/request-tracker/swagger/',
        host: 'https://igodev.mskcc.org'
    },
    'prod': {
        home: '/request-tracker',
        home_page_path: 'request-tracker',
        projects_endpoint: 'https://igo.mskcc.org/request-tracker/api/requests',
        login_page_url: '/login',
        swagger: 'https://igo.mskcc.org/request-tracker/swagger/',
        host: 'https://igo.mskcc.org'
    }
}

const env = 'prod';

export const HOME_PAGE_PATH = 'request-tracker';
export const LOGIN_PAGE_URL = '/login';
export const PROJECTS_ENDPOINT = 'https://igo.mskcc.org/request-tracker/api/requests';
export const HOME = '/request-tracker';
export const HOST = 'https://igo.mskcc.org';
export const SWAGGER = 'https://igo.mskcc.org/request-tracker/swagger/';
