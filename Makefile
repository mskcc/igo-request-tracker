build:
	make ENV=$(ENV) build-fe && make move-fe && \
	make build-be

build-fe:
	cd project-tracker-frontend && npm install && REACT_APP_ENV=$(ENV) npm run build && cd -

build-be:
	cd project-tracker-backend && npm install && npm run test && npm run clean && cd -

move-fe:
	rm -rf project-tracker-backend/public && cp -rf project-tracker-frontend/build/ project-tracker-backend/public/

deploy:
	make ENV=$(ENV) build && \
	scp -r project-tracker-backend $(HOST):deployments/request-tracker

