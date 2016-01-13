/**
 * Created by zhanghongtao on 2016/1/1.
 */
var child_process = require('child_process');
var fs = require('fs');
var debug = (text)=>console.error("[DEBUG]", text);
var inspect = require('util').inspect;
var request = require('request');
var https = require('https');
var baseUrl = 'https://wx.qq.com';
var getUUID = new Promise((resolve, reject)=> {
    var param = {
        appid: 'wx782c26e4c19acffb',
        fun: 'new',
        lang: 'en_US',
        _: Date.now()
    }
    var uri = '/jslogin';
    var options = {
        uri: uri,
        baseUrl: 'https://login.weixin.qq.com',
        method: 'GET',
        qs: param
    };

    var req = request(options, (error, response, body)=> {
        if (error) {
            //debug(error);
            reject(error);
        }
        resolve(body);
    });
});

function checkAndParseUUID(text) {
    var result = /window.QRLogin.code = (\d+); window.QRLogin.uuid = "([^"]+)";/.exec(text);
    if (result[1] != '200') {
        return false;
    }
    return result[2];
}

function handleError(e) {
    console.log(e);
}

function showQRImage(uuid) {
    console.log("请扫描二维码并确认登录，关闭二维码窗口继续...");
    var QRUrl = 'https://login.weixin.qq.com/qrcode/' + uuid + '?';
    params = {
        t: 'webwx',
        '_': Date.now()
    }
    //debug(QRUrl + querystring.stringify(params))

    var checkLoginPromise = new Promise((resolve, reject)=> {
        https.get(QRUrl, function(res){
            var imgData = "";
            res.setEncoding("binary");
            res.on("data", function(chunk){ imgData+=chunk; });
            res.on("end", function(){
                fs.writeFile("./a1.jpg", imgData, "binary", function(err){
                    if(err) return reject("down fail");
                    child_process.execFile(__dirname + '\\a.bat', [__dirname + '\\a1.jpg'], {cwd: 'D:/'}, function (error, stdout, stderr) {
                        if (error !== null) return reject(error);
                        resolve(uuid);
                    });
                });
            });
        });
    });
    return checkLoginPromise;
// 登录
}

function checkScan(uuid) {

    // 检查登录和跳转
    var p = new Promise((resolve, reject)=> {
        var timestamp = Date.now();
        var checkUrl = `https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&tip=1&uuid=${uuid}&_=${timestamp}&r=-964945900`;
        request(checkUrl, (error, response, body)=> {
            if (error) return reject(error);
            if (/window\.code=201/.test(body)) {
                console.log("扫描成功...");
                resolve(uuid);
            } else {
                console.log("扫描错误，退出程序...")
                reject('扫描错误，退出程序');
            }
        });
    });
    return p;
}

function checkLogin(uuid) {
    // 检查登录和跳转
    var p = new Promise((resolve, reject)=> {
        var timestamp = Date.now();
        var checkUrl = `https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?loginicon=true&tip=0&uuid=${uuid}&_=${timestamp}&r=-964945900`;
        request(checkUrl, (error, response, body)=> {
            if (error) return reject(error);
            if (/window\.code=200/.test(body)) {
                console.log("登录微信...");
                resolve(body);
            } else {
                console.log(body)
                reject('登录错误，退出程序');
            }
        });
    });
    return p;
}

function parseRedirectUrl(text) {
    var result = /window\.redirect_uri="([^"]+)";/.exec(text);
    if (!result) {
        console.log("登录失败，退出程序");
        process.exit(1);
    }
    var p = new Promise((resolve, reject)=> {
        request.get({
            url: result[1],
            jar: true,
            followRedirect: false
        }, (error, response, body)=> {
            if (error) return reject(error);
            resolve(body);
        })
    });
    return p;
}

function login(redirectUrl) {
    var p = new Promise((resolve, reject)=> {
        request.get({
            url: redirectUrl,
            jar: true,
            followRedirect: false
        }, (error, response, body)=> {
            if (error) {
                reject(error);
            }
            resolve(body);
        })
    });

    return p;
}

function webwxinit(text) {
    var skey = new RegExp('<skey>([^<]+)</skey>');
    var wxsid = new RegExp('<wxsid>([^<]+)</wxsid>');
    var wxuin = new RegExp('<wxuin>([^<]+)</wxuin>');
    var pass_ticket = new RegExp('<pass_ticket>([^<]+)</pass_ticket>');

    var skey = skey.exec(text);
    var wxsid = wxsid.exec(text);
    var wxuin = wxuin.exec(text);
    var pass_ticket = pass_ticket.exec(text);

    console.log('初始化...');
    var returnVal = {
        BaseRequest: {
            Skey: skey[1],
            Sid: wxsid[1],
            Uin: wxuin[1],
            DeviceID: 'e162372016115114'
        },
        pass_ticket: pass_ticket[1],
        MsgToUserAndSend: []
    }

    var p = new Promise((resolve, reject)=> {
        var postData = {BaseRequest: returnVal.BaseRequest};
        var timestamp = Date.now();
        var options = {
            baseUrl: 'https://wx.qq.com',
            uri: `/cgi-bin/mmwebwx-bin/webwxinit?lang=en_US&pass_ticket=${returnVal.pass_ticket}`,
            method: 'POST',
            body: postData,
            json: true,
            headers: { 'Content-Type': 'application/json;charset=utf-8' },
            jar: true
        }
        var req = request(options, (error, response, body) => {
            if (error) return reject(error);

            returnVal.username = body['User']['UserName'];
            returnVal.SyncKey = body['SyncKey'];
            resolve(returnVal);
        })
    });
    return p;
}

function getContact(obj) {
    console.log("初始化成功，获取联系人...")
    var p = new Promise((resolve, reject)=> {
        var skey = obj.BaseRequest.Skey;
        var pass_ticket = obj.pass_ticket;
        // var jsonFile = fs.createWriteStream('contact.json');
        var timestamp = Date.now();
        var options = {
            baseUrl: 'https://wx.qq.com',
            uri: `/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=en_US&pass_ticket=${pass_ticket}&skey=${skey}&seq=0&r=${timestamp}`,
            // uri: `/cgi-bin/mmwebwx-bin/webwxgetcontact?skey=${skey}&seq=0&r=${timestamp}`,
            method: 'GET',
            json: true,
            jar: true
        }
        debug("getContact contactUrl: \n" + inspect(options));
        request(options, (error, response, body)=> {
            fs.writeFile('contact.json', JSON.stringify(body));
            var ml = body.MemberList;
            obj.ml = ml;
            obj.toUser = ml.filter(m=>(m.NickName == "篇篇头条"))[0]['UserName'];
            resolve(obj);
        });
    })
    return p;
}

function init(){
   return getUUID.
        then(checkAndParseUUID).
        then(showQRImage).
        then(checkScan).
        then(checkLogin).
        then(parseRedirectUrl).
        then(webwxinit).
        then(getContact).
        catch(console.error);
}

//var ttt = init()
export  {init};