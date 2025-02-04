#!/usr/bin/env node

const fs = require('fs');
const util = require('util');
const meow = require('meow');
const properties = require('properties');
const writeFile = util.promisify(fs.writeFile);

const root = process.cwd();

const package = require(root + '/package.json');

const cli = meow(`
    Usage
      $ sonar-prop

    Description
        This tool will create the 'sonar-project.properties' file for a SonarQube scan. It can extend if exist file '.sonar-project.properties'

    Options
         --id  App unique ID.  Can be set throught the SONAR_ID environment variable
         --name, n App name. By Default gets the package.json name. Can be set through the SONAR_NAME environment variable
         --url, u Required SonarQube server url. Can be set throught the SONAR_URL environment variable
         --version, v App version number. By default gets the package.json version number. Can be set through the SONAR_VERSION environment variable
         --token, t Required SonarQube token . Can be set through the SONAR_TOKEN environment variable.

    Examples
      $ sonar-prop --id=MyUID --name=AppName --url=SonarQubeURL --version=1.0.1 --token=SonarToken
      ð unicorns ð
		 `, {
    flags: {
        id: {
            type: 'string'
        },
        paths: {
            type: 'string',
            alias: 'p'
        },
        name: {
            type: 'string',
            alias: 'n'
        },
        url: {
            type: 'string',
            alias: 'u'
        },
        version: {
            type: 'string',
            alias: 'v'
        },
        token: {
            type: 'string',
            alias: 't'
        }
    },
    autoVersion: false,
    autoHelp: true
});

properties.parse ('.sonar-project.properties', { path: true }, (error, props = {}) => {
    // variables for the sonarqube configuration
    const id = cli.flags.id || process.env.SONAR_ID || props['sonar.projecKey'] || package.name;
    const paths = cli.flags.paths || process.env.SONAR_PATHS || props['sonar.sources'] || 'src/js/app,src/js/modules';
    const name = cli.flags.name || process.env.SONAR_NAME || props['sonar.projectName'] || package.name;
    const token = cli.flags.token || process.env.SONAR_TOKEN || props['sonar.login'] || 'TOKEN_HERE';
    const url = cli.flags.url || process.env.SONAR_URL || props['sonar.host.url'];
    const version = cli.flags.version || process.env.SONAR_VERSION || props['sonar.projecVersion'] || package.version;

    if(!id || !paths || !name || !token || !url || !version){
        console.log(`You should use the arguments, environment variables or base file '.sonar-project,properties' to fulfill the required information`);
        process.exit(1);
    }

    props['sonar.projectKey'] = name;
    props['sonar.sources'] = paths;
    props['sonar.projectName'] = name;
    props['sonar.login'] = token;
    props['sonar.host.url'] = url;
    props['sonar.projectVersion'] = version;

    // write file and exit with a 0 code (default, success) or a 1 (error)
    writeFile('sonar-project.properties', properties.stringify(props))
    .then(() => {
        console.log('sonar-project.properties file created!');
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
});
