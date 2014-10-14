var zookeeper = require('node-zookeeper-client');
var config = require('./zkconfig');
var util = require("util");
var events = require("events");
var url = require('url');
var  zkinstance = null;
var EventEmitter = require('events').EventEmitter;
var event = new EventEmitter();
// obj define
function Zk(zkoptions){
    events.EventEmitter.call(this);
    this.client = zookeeper.createClient(zkoptions.hosts,
        {   connectTimeout:1000,
            retries : 3 // Defaults to 0, no retry.
        });;
    this.interfaces = zkoptions.interfaces;
    this.interfacespaths=[];
    this.config = config;
    this.gbservicelist = {};
    this.initflag = false;
}
util.inherits(Zk, events.EventEmitter);
Zk.prototype.selecturl = function(interfacename){
    var serverlist = this.gbservicelist[interfacename];
    return this.config.loaderbalanceconfig.radrom(serverlist);
}
Zk.prototype.reselecturl = function(interfacename,url){
    var serverlist = this.gbservicelist[interfacename];
    return this.config.loaderbalanceconfig.reradrom(serverlist,url);
}
Zk.prototype.initPath = function(){
    var interfacespathstemp = [];
    var i = 0;
    for(i=0;i<this.interfaces.length;i++){
        interfacespathstemp.push({key:this.interfaces[i],path:'/dubbo/'+this.interfaces[i]+'/providers'});
    }
    return interfacespathstemp;
}
Zk.prototype.initServiceList = function(){
    var gbservicelisttemp = {};
    var i = 0;
    for(i=0;i<this.interfaces.length;i++){
        gbservicelisttemp[this.interfaces[i]] = [];
    }
    return gbservicelisttemp;
}
Zk.prototype.watchChildren = function(key,path){
    var outthis = this;
    this.client.getChildren(
        path,
        function (event) {
            console.log('Got watcher event: %s', event);
            outthis.watchChildren(key, path);
        },
        function (error, childrens, stat) {
            if (error) {
                console.log(
                    'Failed to list children of %s due to: %s.',
                    path,
                    error
                );
                return;
            }
            var i=0;
            var tempServicelist = [];
            for(i=0;i<childrens.length;i++){
                var data = unescape(childrens[i]);
                var parseobj = url.parse(data);
                var host = parseobj.host;
                var pathname = parseobj.pathname;
                pathname = pathname.replace("//",'/');
                var protocol = parseobj.protocol;
                var invokerurl = 'http://'+host+pathname;
                tempServicelist.push(invokerurl);
                console.log('zk data=',data);
                console.log('host=',host);
                console.log('pathname=',pathname);
                console.log('protocol=',protocol);
            }
            outthis.gbservicelist[key] = tempServicelist;
            console.log('zk service init');
            if(!outthis.initflag){
                outthis.initflag = true;
                outthis.emit('ready');
            }

        }
    );
}
Zk.prototype.zkinit = function(){
    this.interfacespaths=this.initPath();
    this.gbservicelist = this.initServiceList();
    var outthis = this;
    this.client.once('connected', function () {
        console.log('Connected to ZooKeeper.');
        var i = 0;
        for(i=0;i<outthis.interfacespaths.length;i++){
            var obj = outthis.interfacespaths[i];
            outthis.watchChildren(obj.key,obj.path);
        }

        // client.close();
    });
    this.client.connect();
    console.log('zk connetting');
}
function sleep(milliSeconds) {
    var startTime = new Date().getTime();
    while (new Date().getTime() < startTime + milliSeconds);
};
//if (zkinstance==null){
//    zkinstance = new Zk(config);
//    zkinstance.zkinit();
//}
exports.ZKClient = Zk;




