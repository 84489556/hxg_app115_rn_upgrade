'use strict';

export function parseStock (data) {
    let stock={};
    stock.ZhongWenJianCheng=data.b;
    stock.ZhangFu=data.y;
    stock.ZuiXinJia=Number(data.k);
    stock.Obj=data.c;
    return stock;
}
export function parseStockForWilddog(data) {
    let stock={};
    stock.ZhongWenJianCheng=data.n;
    stock.ZhangFu=data.r;
    stock.ZuiXinJia=data.p;
    stock.Obj=data.c;
    return stock;
}
