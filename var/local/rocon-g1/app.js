var config=require("./config/config.js"),async=require("async"),Beagle=require("./core/Beagle"),bonescript=require("bonescript"),can=require("can"),crypto=require("crypto"),express=require("express"),exphbs=require("express3-handlebars"),EventEmitter=require("events").EventEmitter,flash=require("connect-flash"),fs=require("fs"),https=require("https"),io=require("socket.io-client"),i18n=require("i18n"),path=require("path"),ApiKeyController=require("./web/controller/ApiKeyController.js"),ApiKeyRepository=require("./web/repository/ApiKeyRepository.js"),ApiKeyMiddleware=require("./web/middleware/ApiKeyMiddleware.js"),LoggerMiddleware=require("./web/middleware/LoggerMiddleware.js"),MetaInformationMiddleware=require("./web/middleware/MetaInformationMiddleware.js"),AuthenticationMiddleware=require("./web/model/AuthenticationMiddleware.js"),CanFacade=require("./connector/src/CanFacade.js"),data=require("rotex-control-module").data,DataHandler=require("./web/util/DataHandler.js"),DefaultController=require("./web/controller/DefaultController.js"),DeviceController=require("./web/controller/DeviceController.js"),ExportController=require("./web/controller/ExportController.js"),MessageTransformer=require("rotex-control-module").MessageTransformer,LanguageController=require("./web/controller/LanguageController.js"),LanguageMiddleware=require("./web/model/LanguageMiddleware.js"),LoginController=require("./web/controller/LoginController.js"),logger=require("./config/logger"),LoggerInformation=require("./logging/LoggerInformation.js"),ParameterExporter=require("rotex-control-module").ParameterExporter,ParameterFilter=require("./connector/src/ParameterFilter.js"),ParameterRepository=require("rotex-control-module").ParameterRepository,ParameterTesterController=require("./web/controller/ParameterTesterController.js"),ParameterValidator=require("rotex-control-module").ParameterValidator,PasswordGenerator=require("./web/util/PasswordGenerator.js"),RccsClient=require("./connector/src/RccsClient.js"),Refresher=require("./connector/src/Refresher.js"),RenderMiddleware=require("./web/model/RenderMiddleware.js"),SettingController=require("./web/controller/SettingController.js"),StatusController=require("./web/controller/StatusController.js"),StatusReporter=require("./connector/src/StatusReporter.js"),StatusVisualizer=require("./connector/src/StatusVisualizer.js"),UserController=require("./web/controller/UserController.js"),UserRepository=require("./web/repository/UserRepository.js"),ValueCache=require("./web/util/ValueCache.js"),DiagnosisController=require("./web/controller/DiagnosisController.js");"dev"===process.env.NODE_ENV&&(https.globalAgent.options.rejectUnauthorized=!1);var socket=io.connect("https://"+config.rccs.host+":"+config.rccs.port,{path:config.rccs.path+"/socket.io","max reconnection attempts":1/0,"reconnection limit":config.reconnectionLimit}),parsedData=JSON.parse(data),eepromPath,colorPins;fs.existsSync(config.eepromPath.bb)?(eepromPath=config.eepromPath.bb,colorPins=config.colorPins.bb):fs.existsSync(config.eepromPath.bbb)?(eepromPath=config.eepromPath.bbb,colorPins=config.colorPins.bbb):(eepromPath=config.eepromPath.bbbDebian,colorPins=config.colorPins.bbb);var eventEmitter=new EventEmitter,dataHandler=new DataHandler(config.web_dataPath),apiKeyRepository=new ApiKeyRepository(dataHandler),canChannel=can.createRawChannel(config.can.canInterface),parameterRepository=new ParameterRepository(parsedData),messageTransformer=new MessageTransformer(parameterRepository),canFacade=new CanFacade(canChannel,messageTransformer,eventEmitter,parameterRepository),beagle=new Beagle(eepromPath,path.join(__dirname,"/version")),statusVisualizer=new StatusVisualizer(socket,canChannel,beagle,bonescript,colorPins),parameterValidator=new ParameterValidator,rccsClient=new RccsClient(beagle,socket,canFacade,parameterRepository,parameterValidator),parameterFilter=new ParameterFilter(parameterRepository),refresher=new Refresher(canFacade,eventEmitter,parameterRepository),userRepository=new UserRepository(dataHandler),valueCache=new ValueCache(eventEmitter),parameterExporter=new ParameterExporter(canFacade,parameterRepository,valueCache),authenticationMiddleware=new AuthenticationMiddleware(["/login","/logout","/language"]),renderMiddleware=new RenderMiddleware,languageMiddleware=new LanguageMiddleware(i18n),apiKeyController=new ApiKeyController(apiKeyRepository),defaultController=new DefaultController,deviceController=new DeviceController(eventEmitter),languageController=new LanguageController,passwordGenerator=new PasswordGenerator,loginController=new LoginController(userRepository,passwordGenerator),statusController=new StatusController(valueCache,parameterRepository),settingController=new SettingController(valueCache,parameterRepository,canFacade,parameterValidator),userController=new UserController(passwordGenerator,userRepository),exportController=new ExportController(eventEmitter,parameterExporter),parameterTesterController=new ParameterTesterController(canChannel,parsedData),diagnosisController=new DiagnosisController(eventEmitter),loggerInformation=new LoggerInformation;statusVisualizer.start(),new StatusReporter(canChannel,beagle,rccsClient,config.reportTimeout),i18n.configure({locales:["en","de"],defaultLocale:"en",directory:path.join(__dirname,"/web/translations")}),loggerInformation.isLoggingActivated()===!0&&(logger.transports.file.level="info"),async.waterfall([canFacade.work,parameterFilter.work,rccsClient.work]);var app=express();app.engine("handlebars",exphbs({defaultLayout:"layout",layoutsDir:path.join(__dirname,"/web/views/layouts"),partialsDir:path.join(__dirname,"/web/views/partials"),helpers:{Trans:function(a){return void 0!=i18n?i18n.__(a):a},Selected:function(a,b){return a===b?" selected":""},Iterate:function(a,b,c){for(var d="",e=a;a+b>e;e++)this.index=e,d+=c.fn(this);return d}}})),app.set("view engine","handlebars"),app.set("views",path.join(__dirname,"/web/views")),app.use(express.bodyParser()),app.use(express.compress()),app.use(express["static"](__dirname,"/web/public")),app.use("/api",new ApiKeyMiddleware(apiKeyRepository)),app.use("/web",express.cookieParser()),app.use("/web",express.session({secret:crypto.randomBytes(10).toString("base64")})),app.use("/web",flash()),app.use("/web",express.methodOverride()),app.use("/web",i18n.init),app.use("/web",authenticationMiddleware.isAuthenticated),app.use("/web",languageMiddleware.language),app.use("/web",renderMiddleware.middleware),app.use("/web",new LoggerMiddleware(config)),app.use("/web",new MetaInformationMiddleware(beagle)),app.get("/",defaultController.redirectHome),app.get("/api",deviceController.list),app.get("/api/setting/:device",settingController.list),app.put("/api/setting/:device",settingController.put),app.get("/api/status/:device",statusController.list),app.get("/web",defaultController.index),app.get("/web/login",loginController.index),app.get("/web/user",userController.get),app.put("/web/user/:username",userController.put),app.post("/web/login",loginController.login),app.get("/web/logout",loginController.logout),app.put("/web/language",languageController.put),app.get("/web/apikey",apiKeyController.get),app.post("/web/apikey",apiKeyController.create),app["delete"]("/web/apikey/:apikey",apiKeyController["delete"]),app.get("/web/export",exportController.get),app.post("/web/export.json",exportController.exportToJson),app.post("/web/import",exportController.importFromJson),app.get("/web/diagnosis",diagnosisController.get),app.get("/web/diagnosis/logging",diagnosisController["export"]),app.post("/web/diagnosis/logging",diagnosisController.setLogging),app.get("/web/OEM2015",parameterTesterController.get),app.post("/web/OEM2015",parameterTesterController.secure,parameterTesterController.post),app.listen(config.web_port,function(a){a&&logger.error("Could not start Server for WebClient: "+a),logger.info("starting server on port "+config.web_port)}),rccsClient.connect(),refresher.start(),canChannel.start(),logger.info("started listening to can channel");