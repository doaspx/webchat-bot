/**
 * Created by zhanghongtao on 2016/1/14.
 */
var request = require('request');
//var encode= require('encoding');
//var c = encode.convert('你好','utf-8');
//console.log(c);
//var url = `http://apis.baidu.com/turing/turing/turing`;
//var url = `http://www.tuling123.com/openapi/api?key=8b690fe5d5f721c6c62a1cdb59b62992&info=%E4%BD%A0%E5%A5%BD`;
//var url = `http://www.xiaodoubi.com/simsimiapi.php?msg=1+1等于几`;
//request.get(url,
//    {
//        headers: {'apikey': 'a51d2eaaaf2601e07deea6f9bca864c9'},
//        qs: {
//            key: '879a6cb3afb84dbf4fc84a1df2ab7319',
//            info: '查天气“北京今天天气',
//            userid: 'eb2edb736'
//        },
//        json: true
//    },
//     (error, response, body)=> {
//         console.log(body.code);
//        console.log(body.text);
//    });
//request.get(url, (error, res, body) => {
//    console.log(body.text);
//})

//var url = 'http://www.tuling123.com/openapi/api';
var key = '8b690fe5d5f721c6c62a1cdb59b62992';
var info1='%E4%BD%A0%E5%A5%BD';//'你好！';//%E4%BD%A0%E5%A5%BD
var opt = {
    baseUrl: 'http://www.tuling123.com',
    uri: `/openapi/api?key=8b690fe5d5f721c6c62a1cdb59b62992&info=%E4%BD%A0%E5%A5%BD?`,
    headers: {'Host': 'www.tuling123.com','Content-Type': 'text/json;charset=utf-8' },
    method: 'GET',
    json: true,
    jar: true
};
request.get(opt, (err, res, body) => {
    console.log(JSON.stringify(res));
    console.log(body.text);
})

