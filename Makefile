build:
	make build-fe && make move-fe && \
	make build-be

build-fe:
	cd project-tracker-frontend && npm install && npm run build-qa && cd -

build-be:
	cd project-tracker-backend && npm run config-qa && rm -rf node_modules && cd -

move-fe:
	rm -rf project-tracker-backend/public && cp -rf project-tracker-frontend/build/ project-tracker-backend/public/

deploy:
	make build && \
	scp -r project-tracker-backend dlviigoweb1:deployments/project-tracker

