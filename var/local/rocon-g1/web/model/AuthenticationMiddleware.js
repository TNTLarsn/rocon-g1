var _=require("underscore"),assert=require("assert"),AuthenticationMiddleware=function(a){assert(a),this.ignoreRoutes=a,_.bindAll(this)};AuthenticationMiddleware.prototype.isAuthenticated=function(a,b,c){var d=this.ignoreRoutes||[];return _.some(d,function(b){return a.url.match(b)})||a.session.user?c():b.redirect("/web/login")},module.exports=AuthenticationMiddleware;