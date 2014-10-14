/**
 * Created by lenovo on 2014/9/17.
 */
//var interfaces = ['com.unj.dubbotest.provider.DemoService'];
//var zkoptins = {hosts:'192.168.86.16:2181'};// 192.168.86.16:2181,192.168.86.17:2181
var loaderbalanceconfig = {
    'radrom':function(serverlist){
        var N = serverlist.length;
        if(N==0){
            throw new Error("zk service empty");
        }
        var index = Math.floor(Math.random()*(N));
        return serverlist[index];
    },
    'reradrom':function(serverlist,url){
        var N = serverlist.length;
        if(N==0){
            throw new Error("zk service empty");
        }
        var index = Math.floor(Math.random()*(N));
        var newurl = serverlist[index];
        if(newurl==url){
            if(index>0){
                return serverlist[index-1];
            }else{
                if(index+1<N){
                    return serverlist[index+1];
                }else{
                    throw new Error("zk service unusable");
                }
            }
        }else{
            return newurl;
        }

    }

};
exports.loaderbalanceconfig = loaderbalanceconfig;
//exports.interfaces = interfaces;
//exports.zkoptins = zkoptins;