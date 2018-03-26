/**
 * Created by aakinpelu on 04/02/18.
 */

'use strict';

const Wreck  = require("wreck");
const Joi = require("joi");
const logger = require("logger").createLogger();


const internals = {}
internals.schema = Joi.object({
    rancher_host: Joi.required(),
    rancher_port: Joi.required(),
    access_key: Joi.required(),
    secret_key: Joi.required(),
    environment: Joi.required()
});

class RancherAutoDeployer {
    constructor(_check) {

        Joi.assert(_check, internals.schema);
        this._wreck = Wreck.defaults({
            baseUrl: `http://${_check.rancher_host}:${_check.rancher_port}`,
            headers: {
                Authorization: 'Basic ' + new Buffer(_check.access_key + ':' + _check.secret_key).toString('base64')
            }
        });

        this._request = (method, url, options) => {

            return new Promise((resolve, reject) => {

                this._wreck.request(method, url, options, (err, res) => {

                    if (err) {
                        return reject(err);
                    }

                    if (res.statusCode < 200 ||
                        res.statusCode >= 300) {

                        const e = new Error('Invalid response code: ' + res.statusCode);
                        e.statusCode = res.statusCode;
                        e.headers = res.headers;
                        return reject(e);
                    }

                    this._wreck.read(res, { json: true }, (err, payload) => {
 
                        if (err) {
                            return reject(err);
                        }

                        return resolve(payload);
                    });
                });
            });
        };

        this.environmentId =  _check.environment;
        
    };

    createContainer(container) {
        return this._request('post', `/v2-beta/projects/${this.environmentId}/container`, { payload: JSON.stringify(container) });
    };

    getContainer(containerId) {

        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('get', `/v2-beta/projects/${this.environmentId}/container/${containerId}`);
    }

    updateContainer(container) {
        return this._request('post', `/v2-beta/projects/${this.environmentId}/container/${container.id}`, { payload: JSON.stringify(container) });
    }

    stopContainer(containerId, stopParams) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/container/${containerId}/?action=stop`, { payload: JSON.stringify(stopParams) });
    }

    startContainers(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/container/${containerId}/?action=start`);
    }

    startContainer(serviceId){
        Joi.assert(serviceId, Joi.string().required(), 'Must specify container id');
        this.startService(serviceId)
    }

    restartContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/container/${containerId}/?action=restart`);
    }

    removeContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('delete', `/v2-beta/projects/${this.environmentId}/container/${containerId}`);
    }

    purgeContainer(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/container/${containerId}/?action=purge`);
    }

    getContainerLogs(containerId) {
        Joi.assert(containerId, Joi.string().required(), 'Must specify container id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/container/${containerId}/?action=logs`);
    }

    createStack(stack) {
        return this._request('post', `/v2-beta/projects/${this.environmentId}/stack`, { payload: JSON.stringify(stack) });
    }

    getStack(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('get', `/v2-beta/projects/${this.environmentId}/stack/${stackId}`);
    }

    getStackServices(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('get', `/v2-beta/projects/${this.environmentId}/stack/${stackId}/services`);
    }

    removeStack(stackId) {

        Joi.assert(stackId, Joi.string().required(), 'Must specify stack id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/stack/${stackId}/?action=remove`);
    }

    getPorts() {
        return this._request('get', `/v2-beta/projects/${this.environmentId}/ports`);
    }

    getHosts() {
        return this._request('get', `/v2-beta/projects/${this.environmentId}/hosts`);
    }

    getHost(hostId) {
        return this._request('get', `/v2-beta/projects/${this.environmentId}/hosts/${hostId}`);
    }


    getServices() {
        return this._request('get', `/v2-beta/projects/${this.environmentId}/services`);
    }


    getService(serviceId) {

        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('get', `/v2-beta/projects/${this.environmentId}/services/${serviceId}`);
    }

    stopService(serviceId) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/services/${serviceId}/?action=deactivate`);
    }


    restartService(serviceId, restartParams) {
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/services/${serviceId}/?action=restart`, { payload: JSON.stringify(restartParams) });
    }

    loadLaunchConfig (serviceId, serviceName){
            Joi.assert(serviceId,)

    }

    startService(serviceId){
        var _containers = this._request("get", `v2-beta/projects/${this.environmentId}/services/${serviceId}/innstances`);
        var containers = _containers.data;
        console.log(_containers)
        process.exit()
        containers.forEach(function(container){
            start_url = container.actions.start
            logger.info("Starting container " + container.name + " with url " + start_url)
            this._request("post", start_url, "")
        })
    }

    requestGet(serviceId, params){
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        Joi.assert(params, Joi.string().required(), 'Must specify resource parameter');
        return this._request("get", `v2-beta/projects/${this.environmentId}/services/${serviceId}/${params}`)
    }

    requestPost(params, _payload){
        Joi.assert(params, Joi.string().required(), 'Must specify resource parameter');
        return this._request("post", params, { payload: JSON.stringify(_payload) })
    }


    activateService(serviceId){
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/services/${serviceId}/?action=activate`, { payload: JSON.stringify(restartParams) });
    }

    cancelUpgrade(serviceId){
        Joi.assert(serviceId, Joi.string().required(), 'Must specify service id');
        return this._request('post', `/v2-beta/projects/${this.environmentId}/services/${serviceId}/?action=cancelupgrade`, { payload: JSON.stringify(restartParams) });
    }


    

   getServiceId(serviceName){
        Joi.assert(serviceName, Joi.string().required(), 'Must specify service name');
        return this._request('get', `/v2-beta/projects/${this.environmentId}/services?name=${serviceName}`)
   }

   upgradeService(serviceId, startFirst = True, complete_previous = False, imageUuid = '', auto_complete = False, batch_size = 1, interval_millis = 10000, replace_env_name = '', replace_env_value = '', timeout = 60){

        /**Upgrades a servicee
         * Performs a service upgrade, keeping the same configuration, but otherwise 
         * pulling a new image as needed and starting new containers, droping the old ones
         */

         var upgrade_strategy = JSON.parse('{"inServiceStrategy": {"batchSize": 1, "intervalMillis": 10000, "startFirst": true, "launchConfig": {}, "secondaryLaunchConfigs": []}}')
         upgrade_startegy['inServiceStrategy']['batchSize'] = batch_size
         upgrade_strategy['inServiceStrategy']['intervalMillis'] = interval_millis;

         if (startFirst == True) 
            upgrade_strategy['inServiceStrategy']['startFirst'] = "true"
         else
            upgrade_startegy['inServiceStrategy']['startFirst'] = "false"
        var current_service_config =  this._request('get', `/v2-beta/projects/${PROJECT_ID}/services/${ID}`) 

        // complete previous upgrade flag on
        if (complete_previous && current_service_config['state'] == "upgraded"){
            logger.info("Previous service upgrade wasn't completed, completing it now...")
            var current_service_config = this._request('post', `/v2-beta/projects/${PROJECT_ID}/services/${ID}?action=finishupgrade`,  { payload: JSON.stringify(restartParams) })
            var sleep_count = 0;

            while (current_service_config['state'] != "active" && sleep_count < timeout / 2) {
                logger.info("Waiting for upgrade to finish...")
                // @todo implement time dlay for 2sec here
                var current_service_config = this._request('get', '/v2-beta/projects/${PROJECT_ID}/services/${ID}')
                sleep_count += 1

            }

        }

        // Can't upgrade service if it is not in active state
        if (current_service_config['state'] != 'active'){
            logger.info("Service cannot be updated due to its current state: " + current_service_config['state'])
            exit(1)
        }

        // Add the cuurent service launch config into the request for upgrade
        upgrade_strategy['inServiceStrategy']['launchConfig'] = current_service_config['launchConfig']

        //replace the environment vaiables specified, if one was
        if (replace_env_name != "" && replace_env_value != ""){
            logger.info("Replacing environment variable " + replace_env_name + " from " + upgrade_strategy['inServiceStrategy']['launchConfig']['environment'][replace_env_name] + 'to' + replace_env_value)
            upgrade_strategy['inServiceStrategy']['launchConfig']['environment'][replace_env_name] = replace_env_value

        }

        if (imageUuid != ''){
            //place new image into config
            upgrade_strategy['inServiceStrategy']['launchConfig']['imageUuid'] = imageUuid;
            logger.info("New Image: " + upgrade_startegy['inServiceStrategy']['launchConfig']['imageUuid'])


        }
        // post the upgrade request
        this._request('post', current_service_config['action']['upgrade'], {payload: upgrade_strategy})
        logger.info("Upgrade of service started! " + current_service_config['name'])

        current_service_config =  this._request('get', '/v2-beta/projects/${PROJECT_ID}/services/${ID}')
        logger.info("Service State  " + current_service_config['state'])
        logger.info("Waiting for upgrade to finish...")
        sleep_count = 0;

        while (current_service_config['state'] != "upgraded" && sleep_count < timeout /2){
            logeer.info(".")
            //@todo time delay for 2seconds
            current_service_config = this._request("get", '/v2-beta/projects/${PROJECT_ID}/services/${ID}')
            sleep_count += 1

            
            
        }

        if (sleep_count >= timeout / 2){
            logger.info("Upgradint takes too much time! Check Rancher UI for more details")
            exit(1);    
        }else
            logger.info("Upgraded!")

        if (auto_complete && current_service_config['state'] == 'upgraded') {
            this._request("post", '/v2-beta/projects/${PROJECT_ID}/services/${ID}?action=finishupgrade', {payload: ""} )
            current_service_config = this._request("get", '/v2-beta/projects/${PROJECT_ID}/services/${ID}')
            this.logger("Auto Finishing Upgrade")

            upgraded_sleep_count = 0;
            while (current_service_config['state'] != "active" && upgraded_sleep_count < timeout /2){
                logger.info(".")
                //delay for 2secs
                current_service_config = this._request('get', '/v2-beta/projects/${PROJECT_ID}/services/${ID}')
                upgraded_sleep_count += 1

                if (current_service_config['state'] == "active")
                    logger.info("Done.")
                else{
                    logger.info("Something has gone wrong! Check Rancher UI for more details")
                    exit(1)
                }
            }
        
        }



        
   }

   executeContainer(){
       //get arrays of containers
        containers = this._request("get", '/v2-beta/projects/${PROJECT_ID}/services/${ID}/instances').data

        //check to be sure we have atleast one container
        if (containers.length <= 0){
            logger.info("No Container available")
            exit(1)

        }

        //take the first container to execute command on
        execution_url = container[0]['actions']['execute']
        logger.info("Executing " + command + " on container " +  containers[0]['name'])

        //prepare post payload
        payloadData = JSON.parse('{"attachStdin": true, "attachStdout": true, "command": ["/bin/sh", "-c"], "tty": true  }')
        payloadData['command'].append(command)
        
        //call execution action -> returns toekn and url for websocket access
        intermediate = this._request("post", execution_url, payloadData)

        ws_token = intermediate['token']
        ws_url = intermediate['url'] + "?token=" + ws_token

        //call websocket and print answer
        logger.info(ws_url)
        logger.info("Done")
   }


   rollback(serviceId, timeout = 10) {
        current_service_config = this._request("get", "/v2-beta/projects/${PROJECT_ID}/services/${ID}")
        // cant rollback  a service if its not in upgraded state
        if (current_service_config['state'] != "upgraded"){
            logger.info("Service cannot be updated due to its current state " + current_service_config['state'])
            exit();

        }

        //post the rollback request
        this._request("post", current_service_config['action']['rollback'], "");
        logger.info("Rolback of "+ current_service_config['name'] + "started")
        current_service_config = this._request("get", "/v2-beta/projects/${PROJECT_ID}/services/${ID}")
        logger.info("Service State " + current_service_config['state'])
        logger.info("Waiting for rollback to finish")
        sleep_count = 0;
        while(current_service_config['state'] != "active" && sleep_count < timeout / 2){
            logger.info(".")
            //time delay
            current_service_config = this._request('get', '/v2-beta/projects/${PROJECT_ID}/services/${ID}')
            sleep_count += 1
        }

        if (sleep_count >= timeout /2){
            logger.info("Rolling back take too much time, check rancher ui for more details")
            exit(1)
        }else
            logger.info("Rolled back")
   }

   activate(serviceId, timeout=60){
        current_service_config = this._request("get", "/v2-beta/projects/${PROJECT_ID}/services/${ID}")
        if (current_service_config['state'] != "inactive"){
            logger.info("Service cannot be deactibated due to its current state: "+ current_service_config['state'])
            exit(1)
    
        }

        this._request("post", current_service_config['actions']['activate'], "")

        //wait for actrivation to finish
        sleep_count = 0;
        while (current_service_config['state'] != "active" && sleep_count < timeout /2){
            logger.info("Waiting for activation to finish...")
            //delay for 2seconds
            current_service_config = this._request('get', '/v2-beta/projects/${PROJECT_ID}/services/${ID}')
            sleep_count = 0;
        }
   }

   deactivate(serviceId, timeout){
        current_service_config = this._request("get", "/v2-beta/projects/${PROJECT_ID}/services/${ID}")
        //cant deacivate a service if its not in active state
        if (current_service_config['state'] != "active"){
            logger.info("Service cannot be deactivated due to its current state "+ current_service_config['state'])
            exit(1)
        }
        this._request("post", current_service_config['actions']['deactivate'], "")
        //wait for deactivation to finish
        sleep_count = 0;
        while (current_service_config['state'] != "inactive" && sleep_count < timeout / 2){
            logger.info("Waiting for deactivation to finish")
            //delay
            current_service_config = this._request("get", "/v2-beta/projects/${PROJECT_ID}/services/${ID}")
            sleep_count += 1;
        }
   }

   state(serviceId){
        logger.info(this._request("get", "/v2-beta/projects/${PROJECT_ID}/services/${ID}").state)

   }
   
};

module.exports = RancherAutoDeployer;
