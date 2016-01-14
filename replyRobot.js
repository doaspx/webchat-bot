/**
 * Created by zhanghongtao on 2016/1/14.
 */
var request = require('request');

var debug = (text)=>console.error("[DEBUG]", text);
// 我正准备申请答辩
function thesis(content) {
    return Promise.resolve("我很忙。。。");
}

function echo(content) {
    return Promise.resolve(content);
}

function turingRobot(content) {
    content = content.replace(/^[^:]+:<br\/>/m, "");
    return new Promise((resolve, reject)=> {
        var url = 'http://www.tuling123.com/openapi/api?key=8b690fe5d5f721c6c62a1cdb59b62992&info='+content;
        request.get(encodeURI(url), (err, res, body) => {
                if (err)  return reject(err);
                if(body.code == 40004) return resolve(content);
                resolve(JSON.parse(body).text);
        })
    });
}

function baiduDirect(content) {
    //var url = `http://apis.baidu.com/turing/turing/turing`;
    //request.get(url,
    //    {
    //        headers: {'apikey': 'a51d2eaaaf2601e07deea6f9bca864c9'},
    //        qs: {
    //            key: '879a6cb3afb84dbf4fc84a1df2ab7319',
    //            info: content,
    //            userid: 'eb2edb736'
    //        },
    //        json: true
    //    }, (error, response, body)=> {
    //        if (error)  return reject(error);
    //        if(body.code == 40004) return resolve(content);
    //        resolve(body.text);
    //    });
}

module.exports.turingRobot = turingRobot;