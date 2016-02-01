/**
 * Created by zhanghongtao on 2016/2/1.
 */

var request = require('request');
var _ = lodash('lodash');
var ASY = require('sy')
var Total = 4;

var getUUID = new Promise((resolve, reject)=> {
    var postData = {
        openId: 'BfSK2BVLQsXk7MWi6i0MP9MEYXuevfECoWmuq+m89Kc=',
        coupletId: '11087'
    };
    var uri = '/couplet/getVote.do';
    var options = {
        uri: uri,
        baseUrl: 'http://mktm.10101111.com',
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
        qs: postData
    };

    var req = request(options, (error, response, body)=> {
        if (error) {
            //debug(error);
            reject(error);
        }
        resolve(body);
    });
});

function over(obj) {
    console.log(JSON.stringify(obj));
}

function foreach(obj){

}

getUUID. then(over)
.catch(console.error);