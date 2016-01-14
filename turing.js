/**
 * Created by zhanghongtao on 2016/1/14.
 */
var request = require('request');

var url = `http://apis.baidu.com/turing/turing/turing`;
//var url = `http://www.tuling123.com/openapi/wechatapi?key=8b690fe5d5f721c6c62a1cdb59b62992`;
//var url = `http://www.xiaodoubi.com/simsimiapi.php?msg=1+1等于几`;
request.get(url,
    {
        headers: {'apikey': 'a51d2eaaaf2601e07deea6f9bca864c9'},
        qs: {
            key: '879a6cb3afb84dbf4fc84a1df2ab7319',
            info: '查天气“北京今天天气',
            userid: 'eb2edb736'
        },
        json: true
    },
     (error, response, body)=> {
         console.log(body.code);
        console.log(body.text);
    });

