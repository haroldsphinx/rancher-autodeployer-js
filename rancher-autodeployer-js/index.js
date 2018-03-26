/**
 * Created by aakinpelu on 04/02/18.
 */
 const dotenv = require("dotenv").config();
 const _config = require('./config/config.js');
 const util = require("./libraries/utilities");
 const AutoDeployer = require("./libraries/AutoDeployer");
 const restify = require("restify")
 const logger = require("logger").createLogger()
 const deployer = new AutoDeployer({ rancher_host: _config.rancher, rancher_port: _config.rancher_port, access_key: _config.access_key, secret_key: _config.secret_key, environment: _config.environment_id });
 


 const api_url = _config.app_base+_config.api._url+_config.api._version;

 const server = restify.createServer({
    name: _config.app_name,
    version: _config.app_version
}); 

server.pre(restify.pre.sanitizePath());

const resp = function(res,data){
    res.header("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {'Content-Type': 'application/json; charset=utf-8'});
    res.end(JSON.stringify(data))
};

server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.listen(_config.api._port, function () {
    console.log('%s listening at %s', server.name, server.url+api_url);
});


server.get(api_url+"/", function (req, res) {
    return resp(res.send({msg:"Rancher AUtodeployer Service @ " + server.url+api_url}));
    
})

server.get(api_url+"/get_service_id", function(req, res){
    var service_id = req.params["service_id"];
    var error =[];
    if (!service_id) error.push("Service id is needed") 
    if (error.length == 0){
        deployer.getService("1s57").then((services => {
            return resp(res.send({msg:"Ok", resp: services.launchConfig.environment}))
        }))
    }else{
        return resp(res.send({msg: "Error occured!", resp: error}))
    } 
})


server.get(api_url+"/get_services", function(req, res){
    deployer.getServices().then((services => {
        console.log(services.data)
        return resp(res.send({msg:"Ok", resp: services.data[0]}))
    }))
})

server.get(api_url+"/test", function(req, res){
    

})




function _get_id (serviceName){
    deployer.getServiceId(serviceName).then((services => {
        _service_id = services.data[0].id;
        return _service_id;
    }))
}

function getService(){
    deployer.getServices().then((container) => {
        var _data = container.data; 
      
        _data.forEach(function(get_data){
            _inServiceStrategy = get_data.upgrade;
            if (_inServiceStrategy != null){
                image = get_data.upgrade.inServiceStrategy.previousLaunchConfig.imageUuid 
                return image;        
                // if (image == 'phedoreanu/rancher-auto-redeploy:latest'){
                //     console.log(get_data.id)
                // }
                
            }
        })
        }).catch(function(err){
            console.log(util.error({msg:"Error occured!", resp:err}))
    })
}


function getServiceId(){
    deployer.getServices(function(err, response){

        console.log(response);
        console.log(err)
    })
}


function start(){
    var _containers = deployer.requestGet("1s211", "instances").then((_response => {
        responses = _response.data
        responses.forEach(function(response){
            start_url = response.actions.start;
            console.log(start_url)
            logger.info("Starting container " + response.name + " with the url "+ start_url)
            var test = deployer.requestPost(start_url, "").then((_result =>{
                console.log(_result)
            }))
        })

    }));
}

function stop(){
    var _containers = deployer.requestGet("1s211", "instances").then((_response => {
        responses = _response.data
        responses.forEach(function(response){
            stop_url = response.actions.stop;
            console.log(stop_url)
            logger.info("Starting container " + response.name + " with the url "+ stop_url)
            var test = deployer.requestPost(stop_url, "").then((_result =>{
                console.log(_result)
            }))
        })

    }));
}

function restart(){
    var _containers = deployer.requestGet("1s211", "instances").then((_response => {
        responses = _response.data
        responses.forEach(function(response){
            restart_url = response.actions.stop;
            console.log(restart_url)
            logger.info("Starting container " + response.name + " with the url "+ restart_url)
            var test = deployer.requestPost(restart_url, "").then((_result =>{
                console.log(_result)
            }))
        })

    }));
}







