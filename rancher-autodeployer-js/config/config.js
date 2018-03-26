'use strict'

var config = {
    "access_key": process.env.RANCHER_ACCESS_KEY,
    "secret_key": process.env.RANCHER_SECRET_KEY,
    "rancher": process.env.RANCHER_HOST,
    "rancher_port": process.env.RANCHER_PORT,
    "rancher_stack_name": process.env.RANCHER_STACK_NAME ,
    "environment_id": process.env.ENVIRONMENTID ,
    "app_name":"Rancher Autoeployer",
    "app_version":"1.0.0",
    "app_url":process.env.APP_URL,
    "app_base": "/",
    "init_port":process.env.INIT_PORT,
    "api":{
        "_url":"api",
        "_version":"/1.0",
        "_port":process.env.API_PORT
    }
}

module.exports = config;