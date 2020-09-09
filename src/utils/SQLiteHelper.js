import React,{Component} from 'react';
import SQLiteStorage from 'react-native-sqlite-storage';
SQLiteStorage.DEBUG(false);
var database_name = "buriedpoint.db";//数据库文件
var database_version = "2.0";//版本号
var database_displayname = "HXGBURIEDPOINTSQLite";
var database_size = -1;//-1应该是表示无限制
var db;

export default class SQLite extends Component{

    componentWillUnmount(){
        if(db){
            this._successCB('close');
            db.close();
        }else {
           // console.log("SQLiteStorage not open");
        }
    }
    /**
     * 打开数据库
     * */
  open(){
    db = SQLiteStorage.openDatabase(
      database_name,
      database_version,
      database_displayname,
      database_size,
      ()=>{
          this._successCB('open');
      },
      (err)=>{
          this._errorCB('open',err);
      });
    return db;
  }
  /**
   * 创建数据库表格
   * 1. 访问类型 accessType
   2. 访问者设备唯一编码，确保设备的唯一性 deviceId
   3. 访问者设备名称（用来识别设备属于哪种类型，一般存设备名称）deviceName
   4. 进入时间戳 startTemp
   5. 访问来源的功能模块ID  ：moduleId
   6. 退出时间戳 endTemp
   7. 用户ID：userId
   8. 用户名称：userName
   9. 用户类型： userType
   10. IP地址： ipAdress

   11.(拓客需求新增)是否是拓客需要统计的需求，在拓客之前埋点是由CEM统计，现在拓客的一部分新的需求又改为新的后台统计，所以拓客的一些数据需要做出区分，新增字段
     isTuoke, 如果为0表示不是拓客需求字段，1为拓客字段
   * */
  createTable(){
    if (!db) {
        this.open();
    }
    //创建用户表
        db.transaction((tx)=> {
          tx.executeSql('CREATE TABLE IF NOT EXISTS BURIEDPOINT(' +
              'id INTEGER PRIMARY KEY  AUTOINCREMENT,' +
              'accessType VARCHAR,'+
              'deviceId VARCHAR,'+
              'deviceName VARCHAR,' +
              'startTemp VARCHAR,' +
              'moduleId VARCHAR,' +
              'endTemp VARCHAR,' +
              'userId VARCHAR,' +
              'userName VARCHAR,' +
              'userType VARCHAR,' +
              'ipAdress VARCHAR,'+
              'isTuoke VARCHAR)'
              , [], ()=> {
                  this._successCB('executeSql');
              }, (err)=> {
                  this._errorCB('executeSql', err);
            });
        }, (err)=> {//所有的 transaction都应该有错误的回调方法，在方法里面打印异常信息，不然你可能不会知道哪里出错了。
            this._errorCB('transaction', err);
        }, ()=> {
            this._successCB('transaction');
        })
    }
    /**
     * 删除数据库的数据
     * */
    deleteData(){
        if (!db) {
            this.open();
        }
        db.transaction((tx)=>{
            tx.executeSql('delete from BURIEDPOINT',[],()=>{

            });
        });
    }
    /**
     * 删除整个数据库
     * */
    dropTable(){
      db.transaction((tx)=>{
        tx.executeSql('drop table BURIEDPOINT',[],()=>{

        });
      },(err)=>{
        this._errorCB('transaction', err);
      },()=>{
        this._successCB('transaction');
      });
    }
    /**
     * 像数据库中插入数据
     *  * 1. 访问类型 accessType
     2. 访问者设备唯一编码，确保设备的唯一性 deviceId
     3. 访问者设备名称（用来识别设备属于哪种类型，一般存设备名称）deviceName
     4. 进入时间戳 startTemp
     5. 访问来源的功能模块ID  ：moduleId
     6. 退出时间戳 endTemp
     7. 用户ID：userId
     8. 用户名称：userName
     9. 用户类型： userType
     10. IP地址： ipAdress
     11.isTuoke: 是否是拓客的活动
     * */

    insertItemsData(insertDatas){
        if (!db) {
            this.open();
        }
        this.createTable();
        db.transaction((tx)=>{
            for(let i=0; i < insertDatas.length; i++){
                let items = insertDatas[i];
                let accessType = items.accessType;
                let deviceId = items.deviceId;
                let deviceName = items.deviceName;
                let startTemp = items.startTemp;
                let moduleId = items.moduleId;
                let endTemp = items.endTemp;
                let userId = items.userId;
                let userName = items.userName;
                let userType = items.userType;
                let ipAdress = items.ipAdress;
                let isTuoke = items.isTuoke;
                let sql = "INSERT INTO BURIEDPOINT(accessType,deviceId,deviceName,startTemp,moduleId,endTemp,userId,userName,userType,ipAdress,isTuoke)"+
                "values(?,?,?,?,?,?,?,?,?,?,?)";
                tx.executeSql(sql,[accessType,deviceId,deviceName,startTemp,moduleId,endTemp,userId,userName,userType,ipAdress,isTuoke],()=>{
                  },(err)=>{
                   // console.log(err);
                  }
                );
            }
        },(error)=>{
          this._errorCB('transaction', error);
        //   ToastAndroid.show("数据插入失败",ToastAndroid.SHORT);
        },()=>{
          this._successCB('transaction insert data');
        //   ToastAndroid.show("成功插入 "+1+" 条用户数据",ToastAndroid.SHORT);
        });
  }

  /**
   * 关闭数据库
   * */
  close(){
      if(db){
          this._successCB('close');
          db.close();
      }else {
         // console.log("SQLiteStorage not open");
      }
      db = null;
  }

  _successCB(name){
    //console.log("SQLiteStorage "+name+" success");
  }
  _errorCB(name, err){
   // console.log("SQLiteStorage "+name);
   // console.log(err);
  }
    render(){
        return null;
    }
};
