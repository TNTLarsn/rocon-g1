var config=require("../../../config/config"),apiConfig=require("../../../config/apiConfig"),_=require("underscore"),async=require("async"),fs=require("fs"),Hmmac=require("hmmac"),https=require("https"),md5=require("MD5"),path=require("path"),moment=require("moment"),LoggerInformation=require("../../../logging/LoggerInformation.js"),logger=require("../../../config/logger"),Beagle=require("../../../core/Beagle");"dev"===process.env.NODE_ENV&&(https.globalAgent.options.rejectUnauthorized=!1);var LoggerConfigRequester=function(){_.bindAll(this);var a;a=fs.existsSync(config.eepromPath.bb)?config.eepromPath.bb:fs.existsSync(config.eepromPath.bbb)?config.eepromPath.bbb:config.eepromPath.bbbDebian,this._beagle=new Beagle(a,path.join(__dirname,"/../../version")),this._hmmac=new Hmmac({headerPrefix:"ROC",hash:"sha1",serviceLabel:"ROC",debug:!1})};LoggerConfigRequester.prototype.run=function(){var a=new LoggerInformation;a.isLoggingActivated()===!0&&(logger.transports.file.level="info"),async.waterfall([this._beagle.getId,this._fetchLoggerConfig],function(a){a&&logger.error("LoggerConfigRequester: Error on running:"+a)})},LoggerConfigRequester.prototype._fetchLoggerConfig=function(a,b){var c=apiConfig.loggerconfigRequester+a,d={method:"GET",host:config.rccs.host,path:c,port:config.rccs.port};this._signRequest(d,"",function(a,c){a&&logger.error("LoggerConfigRequester: Error on signRequest"+a),c.path=config.rccs.path+c.path;var d=https.request(c,function(a){if(404===a.statusCode);else if(200!==a.statusCode)logger.error("LoggerConfigRequester: Could not fetch loggerConfig: status code"+a.statusCode);else{var b=config.logger.loggingPath,c="",d="";fs.existsSync(b)?(c=fs.readFileSync(b,"UTF8"),d=JSON.parse(c)):logger.error("LoggerConfigRequester: Could not read loggerConfig: "),d.logging!==a.body.logging&&(d.logging=a.body.logging,fs.writeFileSync(b,JSON.stringify(d),"UTF8",function(a){a&&logger.error("LoggerConfigRequester: Could not fetch loggerConfig: "+a)}))}});d.on("error",function(a){return logger.error("LoggerConfigRequester: Could not fetch loggerConfig: "+a),b()}),d.end()})},LoggerConfigRequester.prototype._signRequest=function(a,b,c){var d=this;a.headers||(a.headers={}),a.headers["content-type"]||(a.headers["content-type"]="application/text"),a.headers["content-md5"]||(a.headers["content-md5"]=md5(b)),a.headers.date||(a.headers.date=moment().utc().format("ddd, DD MMM YYYY HH:mm:ss ZZ")),async.parallel({key:this._beagle.getId,secret:this._beagle.getSecret},function(b,e){if(b)return logger.error("LoggerConfigRequester: "+b),c();if(!e.secret)return logger.error("LoggerConfigRequester: secret not found"),"LoggerConfigRequester: secret not found";var f=d._hmmac.signHttpRequest({accessKeyId:e.key,accessKeySecret:e.secret},a);c(null,f)})},module.exports=LoggerConfigRequester;