/**
 * Created by zhanghongtao on 2016/1/14.
 */
var request = require('request');

var debug = (text)=>console.error("[DEBUG]", text);
// ����׼��������
function thesis(content) {
    return Promise.resolve("�Һ�æ������");
}

function echo(content) {
    return Promise.resolve(content);
}

function turingRobot(content) {
    content = content.replace(/^[^:]+:<br\/>/m, "");
    return new Promise((resolve, reject)=> {
        var url = `http://apis.baidu.com/turing/turing/turing`;
        request.get(url,
            {
                headers: {'apikey': 'a51d2eaaaf2601e07deea6f9bca864c9'},
                qs: {
                    key: '879a6cb3afb84dbf4fc84a1df2ab7319',
                    info: content,
                    userid: 'eb2edb736'
                },
                json: true
            }, (error, response, body)=> {
                if (error)  return reject(error);
                debug('in turingRobot body:' + body);
                resolve('����ղ֣�����');
            });
    });
}

function baiduDirect(content) {
    // TODO:
}

module.exports.turingRobot = turingRobot;