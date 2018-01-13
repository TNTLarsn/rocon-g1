var _=require("underscore"),async=require("async"),config=require("../../config/config.js"),Refresher=function(a,b,c){_.bindAll(this),this.canFacade=a,this._eventEmitter=b,this.parameterRepository=c,this._state="sleeping",this._tickCounter=0};Refresher.prototype.start=function(){this._state="running",this._run()},Refresher.prototype.stop=function(){this._state="sleeping"},Refresher.prototype._run=function(){var a=this;"running"==a._state&&this._tick(function(){setTimeout(a._run,config.refresher.timeout,a)})},Refresher.prototype._tick=function(a){var b=this,c=this.parameterRepository.findBy({name:config.refresher.deviceIdentifier});async.mapSeries(c,this.canFacade.request,function(d,e){var f=_.filter(c,function(a,b){return null!==e[b]}),g=_.pluck(f,"device"),h=[];_.each(g,function(a){h=h.concat(b.parameterRepository.findBy({device:a}))}),h=_.reject(h,function(a){return a.name===config.refresher.deviceIdentifier}),async.eachSeries(h,b.canFacade.request,function(){b._eventEmitter.emit("Refresher.Ticked",++b._tickCounter),a()})})},module.exports=Refresher;