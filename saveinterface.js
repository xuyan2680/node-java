/**
 * Created by lenovo on 2014/9/18.
 */
var interfacename = 'com.unj.dubbotest.provider.DemoService';
function Service1(hessianinstance){
    this.interfaces = interfacename;
    this.hessianinstance = hessianinstance;
}
Service1.prototype.sayHello = function(str,callbackfun){
    this.hessianinstance.invoker(this.interfaces,'sayHello',str,callbackfun);
}
module.exports = Service1;