"use strict";var _=require("underscore"),_str=require("underscore.string"),assert=require("assert"),moment=require("moment"),CanFacade=require("../../connector/src/CanFacade.js"),EventEmitter=require("events").EventEmitter,MessageTransformer=require("rotex-control-module").MessageTransformer,ParameterRepository=require("rotex-control-module").ParameterRepository,ParameterTesterController=function(a,b){assert(a),assert(b),_.bindAll(this),this._canChannel=a,this._data=b,this._devices=this._getDevices(),this._types=this._getParameterTypes()};ParameterTesterController.prototype.get=function(a,b){b.render("parameterTester",{devices:this._devices,types:this._types})},ParameterTesterController.prototype.post=function(a,b){var c=this,d={device:a.body.device,infoNumber:{byteHigh:parseInt("0x"+a.body.infoNumberHighByte,16),byteLow:parseInt("0x"+a.body.infoNumberLowByte,16)},type:a.body.type};a.body.bigEndian&&(d.bigEndian="true"),a.body.factor&&(d.factor=a.body.factor);var e=this._buildCustomParameterDefinition(d),f=new ParameterRepository(e),g=new MessageTransformer(f),h=new EventEmitter,i=new CanFacade(this._canChannel,g,h,f),j=f.findOneBy({device:e.parameters[0].device,name:e.parameters[0].name});if(j)i.request(j,function(d,e){var f=_.extend(a.body,{devices:c._devices,types:c._types});d?f.errorMessage=d:null===e?f.resultOutput="Parameter not responding. Name: "+j.device+":"+j.name:f.resultOutput="Parameter responding with: "+j.device+":"+j.name+" and value: "+e,b.render("parameterTester",f)});else{var k=_.extend(a.body,{devices:this._devices,types:this._types,errorMessage:"web.parameterTester.error.unknownParameter"});b.render("parameterTester",k)}},ParameterTesterController.prototype.secure=function(a,b,c){var d=a.body.securityCode,e=null;if(!d)return e=_.extend(a.body,{devices:this._devices,types:this._types,errorMessage:"web.parameterTester.error.missingSecurityCode"}),void b.render("parameterTester",_.omit(e,"securityCode"));var f=moment().format("DDMMYY"),g=_str.chop(f,2),h="";return _.each(g,function(a){var b=parseInt(a,10),c=0;10>b?c=10-b:100>b&&(c=100-b),h+=_str.sprintf("%02d",c)}),d!=h?(e=_.extend(a.body,{devices:this._devices,types:this._types,errorMessage:"web.parameterTester.error.invalidSecurityCode"}),void b.render("parameterTester",_.omit(e,"securityCode"))):void c()},ParameterTesterController.prototype._buildCustomParameterDefinition=function(a){var b={},c=_.filter(this._data.parameters,function(b){return b.infoNumber.byteHigh==a.infoNumber.byteHigh&&b.infoNumber.byteLow==a.infoNumber.byteLow}),d={heatingCircuits:this._data.heatingCircuits,heatGenerators:this._data.heatGenerators,heatingCircuitModules:this._data.heatingCircuitModules};if(c.length>0){var e=_.first(c);b=_.extend(_.extend({},e),a)}else a.name="NEW.PARAMETER",b=a;return d.parameters=[b],d},ParameterTesterController.prototype._getParameterTypes=function(){var a=_.pluck(this._data.parameters,"type");return _.uniq(a).sort()},ParameterTesterController.prototype._getDevices=function(){var a=_.pluck(this._data.heatingCircuits,"name"),b=_.pluck(this._data.heatingCircuitModules,"name"),c=_.pluck(this._data.heatGenerators,"name");return _.union(a,b,c)},module.exports=ParameterTesterController;