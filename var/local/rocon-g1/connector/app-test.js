var Mocha=require("mocha"),path=require("path"),fs=require("fs"),mocha=new Mocha({reporter:"dot",ui:"tdd",bail:!0,timeout:2e3}),testDir="./spec-unit/";fs.readdir(testDir,function(a,b){if(a)return void console.log(a);b.forEach(function(a){".js"===path.extname(a)&&(console.log("adding test file: %s",a),mocha.addFile(testDir+a))});var c=mocha.run(function(){console.log("finished")});c.on("pass",function(a){console.log("... %s... passed",a.fullTitle())}),c.on("fail",function(a){console.log("... %s... failed",a.fullTitle())})});