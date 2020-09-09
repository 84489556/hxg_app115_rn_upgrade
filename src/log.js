/*
 * @Author: 
 * @Date: 2020-07-22 11:24:05
 * @Description: 控制每个人的log输出 
 * 每个人创建一个属于自己的log方法，在上传svn/git的时候将打印函数替换为空的函数 ()=>{} 
 * 比如：自定义的 alog 上传到远端的格式函数为 
 * global.alog = ()=>{}
 * 本地为
 * global.alog = console.log 
 */ 
// 仅在debug模式下展示log
console.log = __DEV__ ? console.log : ()=>{}
console.warn = __DEV__ ? console.warn : ()=>{}
console.error = __DEV__ ? console.error : ()=>{}
console.info = __DEV__ ? console.info : ()=>{}
console.debug = __DEV__ ? console.debug : ()=>{}
// 个人打印 log 
// 通用log 所有人可见 这个为了打印所有人可见的log  上传svn/git时不需要替换为空
global.log = console.log
// yangyin
global.ylog = ()=>{} //(...data)=>(console.log('%c ylog','color:red;font-weight:bolder;font-size:16px',...data))
// 开发者A
global.alog = console.log 
// 开发者B
global.blog = ()=>{}
// 开发者C
global.clog = ()=>{}
