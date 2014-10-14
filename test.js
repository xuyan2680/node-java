/**
 * Created by lenovo on 2014/9/18.
 */
var ZK = require('./zktool');
var Hessiantool = require('./hessiantool');
var server1 = require('./saveinterface');
var zkclient = new ZK.ZKClient({hosts:'192.168.86.16:2181',
                          interfaces:['com.unj.dubbotest.provider.DemoService']});
zkclient.zkinit();
zkclient.on('ready',function(){
    var h = new Hessiantool(zkclient);
    var s = new server1(h);
    var i = 0;
    for(i=0;i<10;i++){
        s.sayHello(['xuyan'+i],function(err,reply){
            console.log(err);
            console.log(reply);
        });
    }

});