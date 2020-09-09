import React from "react";
import RNFS from "react-native-fs";
import AsyncStorage from '@react-native-community/async-storage';

const url = "http://cdnapp.ydtg.com.cn/dataForMobile/CodeMapping";
const path = RNFS.DocumentDirectoryPath + "/mapping";
const urlSector = "http://cdnapp.ydtg.com.cn/dataForMobile/IndexSectorMapping";
const pathSector = RNFS.DocumentDirectoryPath + "/IndexSectorMapping";

const optionSector = {
  fromUrl: urlSector,
  toFile: pathSector,
  background: true,
  progressDivider: 5,
  begin: res => { },
  progress: res => { }
};

const options = {
  fromUrl: url,
  toFile: path,
  background: true,
  progressDivider: 5,
  begin: res => { },
  progress: res => { }
};

export let getStockCodeType = (code, callback) => {
  isFileExists(value => {
    if (value) {
      readFile(code, callback);
    } else {
      downLoadFile(code, callback);
    }
  });
};

function isFileExists(successCallback) {
  RNFS.exists(path)
    .then(result => {
      successCallback(result);
    })
    .catch(err => {
      // successCallback(false)
    });
}

function downLoadFile(code, callback) {
  RNFS.downloadFile(options)
    .promise.then(result => {
      readFile(code, callback);
      let date = new Date();
      AsyncStorage.setItem("SaveCodeTypeTime", date.getTime().toString(), errs => {

      });
    })
    .catch(err => {
      // callback(0);
    });
}

function readFile(code, callback) {
  let res = RNFS.readFile(path, "utf8")
    .then(result => {
      let tempMap = objToStrMap(JSON.parse(result.toString()));
      let temType = tempMap.get(code);
      callback(temType);
    })
    .catch(err => {
      // callback(0);
    });
}

function objToStrMap(obj) {
  let strMap = new Map();
  for (let k of Object.keys(obj)) {
    strMap.set(k, obj[k]);
  }
  return strMap;
}

function strMapToObj(strMap) {
  let obj = Object.create(null);
  for (let [k, v] of strMap) {
    obj[k] = v;
  }
  return obj;
}

export function loadeStockCodeFile() {
  isFileExists(value => {
    if (value) {
      AsyncStorage.getItem("SaveCodeTypeTime").then(x => {
        if (!isToday(parseInt(x))) {
          RNFS.downloadFile(options)
            .promise.then(result => {
              let date = new Date();
              AsyncStorage.setItem("SaveCodeTypeTime", date.getTime().toString(), errs => { });
            }).catch(err => { });
        }
      });
    } else {
      RNFS.downloadFile(options)
        .promise.then(result => {
          let date = new Date();
          AsyncStorage.setItem("SaveCodeTypeTime", date.getTime().toString(), errs => { });
        }).catch(err => { });
    }
  });
}

function isToday(tim) {
  let newDate = new Date();
  newDate.setTime(tim);
  let today = new Date();
  if (newDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0)) {
    return true;
  }
  return false;
}

export function loadeIndexSectorFile() {
  isFileExists(value => {
    if (value) {
      AsyncStorage.getItem("SaveIndexSectorTime").then(x => {
        if (!isToday(parseInt(x))) {
          RNFS.downloadFile(optionSector)
            .promise.then(result => {
              let date = new Date();
              AsyncStorage.setItem("SaveIndexSectorTime", date.getTime().toString(), errs => { });
            })
            .catch(err => { });
        }
      });
    } else {
      RNFS.downloadFile(options)
        .promise.then(result => {
          let date = new Date();
          AsyncStorage.setItem("SaveIndexSectorTime", date.getTime().toString(), errs => { });
        }).catch(err => { });
    }
  });
}

export let getSectorType = (code, callback) => {
  isSectorExists(value => {
    if (value) {
      readSectorFile(code, callback);
    } else {
      downLoadSectorFile(code, callback);
    }
  });
};

function isSectorExists(successCallback) {
  RNFS.exists(pathSector)
    .then(result => {
      successCallback(result);
    })
    .catch(err => { });
}

function downLoadSectorFile(code, callback) {
  RNFS.downloadFile(optionSector)
    .promise.then(result => {
      readSectorFile(code, callback);
      let date = new Date();
      AsyncStorage.setItem("SaveIndexSectorTime", date.getTime().toString(), errs => {

      });
    })
    .catch(err => { });
}

function readSectorFile(code, callback) {
  RNFS.readFile(pathSector, "utf8")
    .then(result => {
      let tempMap = objToStrMap(JSON.parse(result.toString()));
      let sectorCode = tempMap.get(code).sectorCode;
      let totalStockNum = tempMap.get(code).totalStockNum;
      callback(sectorCode, totalStockNum);
    })
    .catch(err => { });
}
