# IGO Request Tracker
Request Tracker Application for IGO

## Dev
* Add LIMS username/password to project-tracker-backend/services/config.js
* To update the environment from which requests are received, modify the `dev` field of `project-tracker-backend/services/config.js`
```
    'dev': {
        lims_api: {ADD DEV/QA/PROD ENDPOINT}
    },
```

### Frontend
```
cd project-tracker-frontend && npm install && npm run start
```
### Backend
* NOTE: Make sure the `.env` file has been created, e.g. `$ cp .env.example .env`
```
cd project-tracker-backend && npm install && npm run dev
```

## Deployment
1) Add LIMS username/password to project-tracker-backend/services/config.js
2) Setup nginx.conf file with the following
    ```
    location /request-tracker/ {
            proxy_pass    http://127.0.0.1:4000/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
    }
    ```
3) The node process requires the `NODE_ENV` be set to `qa` or `prod`, e.g.
    **pm2**
    ```
    module.exports = {
      apps: [
        {
          name: 'request-tracker',
          cwd: '/srv/www/request-tracker',
          script: 'npm',
          args: 'start',
          env: {
            NODE_ENV: "prod",       // TODO: switch to "qa" when prod version is released
            ...commonEnv.prod,
          }
        }
      ]
    }
    ```
    **Command Line**
    ```
    $ NODE_ENV=qa npm run start
    ```
4) Run deploy script to create a directory that can be deployed and served w/ `npm run start`

    **QA**
    ``` 
    make ENV=qa HOST=dlviigoweb1 deploy
    ```
    **PROD**
    ``` 
    make ENV=prod HOST=plviigoweb1 deploy
    ```
