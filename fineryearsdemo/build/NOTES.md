# Build/Deployment Notes

See Jenkinsfile for build environment variables:
- These variables determine artifactory package name, endpoint, etc.
    - ARTIFACTORY_REPO - example: 'https://artifactory.gannettdigital.com/artifactory/'
    - TEAM_NAME - example: 'indystar-development'
    - PROJECT_NAME - example: 'fineryears'
    - PROJECT_VERSION - example: '0.0.2' (should correspond to APP_VERSION)

- for hacking local hosts file on test server, to test 3rd party api integration (where URL domain is an auth factor)
    - PROJECT_DOMAIN - example: 'digital.indystar.com'


These consul key/value config keys need to be defined for your config templates to produce actualy config files during deployment (env.php and env.js):
- Client-Side Secrets 
	- source: build/app_config_templates/{env}/env.js.ctmpl
	- destination: public/env.js
		- SECRET_A - Dummy Client-Side Secret A
		- SECRET_B - Dummy Client-Side Secret B
		- SECRET_C - Dummy Client-Side Secret C
- Server-Side Secrets (build/app_config_templates/{env}/env.php.ctmpl)
	- source: build/app_config_templates/{env}/env.php.ctmpl
	- destination: backend/env.php
		- SECRET_1 - Dummy Server-Side Secret A
		- SECRET_2 - Dummy Server-Side Secret 2
		- SECRET_3 - Dummy Server-Side Secret 3

During development, you should maintain hard-coded values in the appropriate un-tempalted files (see destinations above)

You will later need to transplant those values from your hard-coded configs, to consul values that will be templated in to your config templates (.ctmpl files) when the app is deployed.
