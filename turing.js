/**
 * Created by zhanghongtao on 2016/1/14.
 */
var request = require('request');

var url = `http://apis.baidu.com/turing/turing/turing`;
//var url = `http://www.xiaodoubi.com/simsimiapi.php?msg=1+1���ڼ�`;
request.get(url,
    {
        headers: {'apikey': 'a51d2eaaaf2601e07deea6f9bca864c9'},
        qs: {
            key: '879a6cb3afb84dbf4fc84a1df2ab7319',
            info: '��������������������',
            userid: 'eb2edb736'
        },
        json: true
    },
     (error, response, body)=> {
        console.log(body.text);
    });
