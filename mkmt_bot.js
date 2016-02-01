/**
 * Created by zhanghongtao on 2016/1/21.
 */

//神州专车对联。。。。
var request = require('request');
var _ = require('lodash');
var utl = require('./util');
var _loopCount = 4;

function getPromise(appid){
   var c = new Promise((resolve, reject)=> {
        var postData = {
            openId: appid,//'agSK2BVLQsXk7MWi6i0MP9MEYXuevfECoWmuq+m89Kc=1', //'agSK2BVLQsXk7MWi6i0MP9MEYXuevfECoWmuq+m89Kc=',
            coupletId: '11087'
        };

        var _referer = 'http://mktm.10101111.com/html5/2016/couplet/vote.html?' +
            'WT.mc_mk=201401352' +
            '&openId=' + get_ref_url(postData.openId);
        '&param=A11091';
        var uri = '/couplet/getVote.do';
        var options = {
            uri: uri,
            baseUrl: 'http://mktm.10101111.com',
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': 'ucar-intranet-sid=579d15f9-2ad8-4a76-b04d-24667be1fb64.114',
                'Origin': 'http://mktm.10101111.com',
                'Referer': _referer
            },
            qs: postData
        };

        var req = request(options, (error, response, body)=> {
            if (error) { reject(error); }
            setTimeout(function () { resolve(body); }, 4000);
        });
    });
   // console.log('controcter..');
    return c;
};

function get_ref_url (appid){
    var _refurl = encodeURIComponent(appid);
    return _refurl;
}

function over(obj) {
    var p = new Promise((resolve, reject) => {
        console.log(JSON.stringify(obj));
        resolve();
    })
}

function create_appid(){
    var src = 'B'+ randKey(3) +'K2BVLQsXk7MWi6i0MP9MEYXuevfECoWmuq+m89Kc=';
    console.log('apiKEy:' + src);
    return src;
}
function randKey(num){
   return randomString(random(1, num));
}

function random(min,max){
    return Math.floor(min+Math.random()*(max-min));
}
function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}

function start(obj){
    getPromise(create_appid()).then(over).then(start).catch(console.error);
}

start();
