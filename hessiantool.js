/**
 * Created by lenovo on 2014/9/17.
 */
var Proxy = require('hessian-proxy').Proxy;
var domain = require('domain');
function Hessiantool(zkinstance){
    this.zkinstance = zkinstance;
}
Hessiantool.prototype.invoker = function(interfacename,methodname,args,callbackfun){
    var outthis = this;
    var url = '';
    try{
        url  = this.zkinstance.selecturl(interfacename)
    }catch(e){
        callbackfun(e,null);
        return ;
    }
    console.log('url='+url);

    var d = domain.create();
    function icall (){
        var proxy = new Proxy(url, '', '', proxy);
        proxy.invoke(methodname, args, function(err, reply) {
            callbackfun(err,reply)
        });
    }
    var retry = 1;
    var times = 0;
    d.on('error',function(err){
        //console.log(err.code.toString());
        try{
            url = outthis.zkinstance.reselecturl(interfacename,url);
            console.log('reurl='+url);
        }catch(e){
            callbackfun(e,null);
            return ;
        }

        if(err.code.toString()=='ECONNREFUSED'){
            if(times<retry){
                times++;
                setTimeout(function(){
                    d.run(icall);
                },300);
            }else{
                callbackfun(err.code,null);
            }

        }

    });
    d.run(icall);
}

module.exports = Hessiantool;
