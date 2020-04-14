# Description
Project Tracker application

## Dev
* Add LIMS username/password to project-tracker-backend/services/config.js

## Deploy
* Run build scripts. This will copy the artifact to your home directory and it needs to be moved to the `/srv/www/` directory
```
$ make deploy
```
* Setup nginx.conf file with the following
```
location /project-tracker/ {
        proxy_pass    http://127.0.0.1:4000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
}
```


