module.exports=function(a){return function(b,c,d){b.query.apiKey?a.findBy({key:b.query.apiKey},function(a){0==a.length?c.send(401):d()}):c.send(401)}};