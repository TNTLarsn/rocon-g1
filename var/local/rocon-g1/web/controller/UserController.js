var _=require("underscore"),assert=require("assert"),UserController=function(a,b){assert(a),assert(b),this.passwordGenerator=a,this.userRepository=b,_.bindAll(this)};UserController.prototype.get=function(a,b){a.session.user?b.render("editPassword"):b.redirect("/")},UserController.prototype.put=function(a,b){var c=this;return a.body["password-new"]!=a.body["password-repeat"]?(a.flash("error","web.password.validation.notEqual"),b.redirect("/web/user")):void this.userRepository.findOneByUsername(a.params.username,function(d,e){return d?(a.flash("error",d),b.redirect("/web/user")):(e.password=c.passwordGenerator.createHash(a.body["password-new"],e.salt),void c.userRepository.updateUser(e,function(c){return c?(a.flash("error","web.user.notSaved"),b.redirect("/web/user")):(a.flash("success","web.save.success"),b.redirect("/"))}))})},module.exports=UserController;