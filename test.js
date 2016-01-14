var child_process = require('child_process');
var fs = require('fs');
var debug = (text)=>console.error("[DEBUG]", text);
var inspect = require('util').inspect;
var request = require('request');

var https = require('https');
var baseUrl = 'https://wx.qq.com';
var replyRobot = require('./replyRobot').turingRobot;

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
var _ = require('lodash');

const botTitle = '[老猫机器人]：';

function handleError(e) {
    console.log(e);
}

function botSpeak(obj) {
    passWebwxsync(obj);
    var p = new Promise((resolve, reject)=>{
        //debug('obj in botSpeak:\n' + inspect(obj));
        var BaseRequest = obj.BaseRequest;
        var pass_ticket = obj.pass_ticket;
        var timestamp = Date.now();

        var random = Math.floor(Math.random() * 1000);
        while (obj.MsgToUserAndSend.length > 0) {
            random += 3;  // Strange hack，这个数应该是时间戳相同的消息先后编号
            // FIXME: 先pop的应该是后收到的？不一定，可能需要在上一步检查返回消息CreateTime，但短暂时间间隔保证顺序也许是不必要的。
            var msgBundle = obj.MsgToUserAndSend.pop();
            var postData = {
                BaseRequest: obj.BaseRequest,
                Msg: {
                    "Type": 1,
                    "Content": botTitle + msgBundle.Msg,
                    "FromUserName": obj.username,
                    "ToUserName": msgBundle.User,
                    "LocalID": `${timestamp}0${random}`,
                    "ClientMsgId": `${timestamp}0${random}`}
            };

            var options = {
                baseUrl: 'https://wx.qq.com',
                uri: `/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=en_US&pass_ticket=${pass_ticket}`,
                method: 'POST',
                jar: true,
                json: true,
                body: postData
            };
            request(options, (error, response, body)=>{
                console.log(botTitle, msgBundle.Msg);
                 debug("in botSpeak ret: " + inspect(body));
            })
        }
        resolve(obj);
    });
    return p;
}

function synccheck(obj) {
    var p = new Promise((resolve, reject)=>{
        // 重置obj.webwxsync, 默认不需要webwxsync
        obj.webwxsync = false;
        var timestamp = Date.now();
        var skey = obj.BaseRequest.Skey;
        var sid = obj.BaseRequest.Sid;
        var uin = obj.BaseRequest.Uin;
        var deviceid = obj.BaseRequest.DeviceID;
        var synckey = obj.SyncKey.List.map(o=>o.Key + '_' + o.Val).join('|');
        var options = {
            baseUrl: 'https://webpush.weixin.qq.com',
            uri: '/cgi-bin/mmwebwx-bin/synccheck',
            method: 'GET',
            qs: {
                r: timestamp,
                skey: skey,
                sid: sid,
                uin: uin,
                deviceid: deviceid,
                synckey: synckey
            },
            jar: true,
            timeout: 60000
        }

        console.log('检测是否有新的消息...');
        request(options, (error, response, body)=>{
            if (error)  return reject(error);
            debug("in synccheck body : " + body);
            if (body == 'window.synccheck={retcode:"1101",selector:"0"}') {
                console.log("自动登出");
                process.exit(1)
            }
            // TODO: 整理各种情况
            if (body !== 'window.synccheck={retcode:"0",selector:"0"}')  obj.webwxsync = true;  // 标识有没有新消息，要不要websync
            resolve(obj);
        })
    });

    return p;
}

function webwxsync(obj) {
    passWebwxsync(obj);
    var p = new Promise((resolve, reject) => {
        //debug('obj in webwxsync:\n' + inspect(obj));
        var BaseRequest = obj.BaseRequest;
        var pass_ticket = obj.pass_ticket;
        var timestamp = Date.now();
        var postData = {
            BaseRequest: obj.BaseRequest,
            SyncKey: obj.SyncKey
        };
        var options = {
            baseUrl: 'https://wx.qq.com',
            uri: `/cgi-bin/mmwebwx-bin/webwxsync?sid=${obj.BaseRequest.Sid}&skey=${obj.BaseRequest.Skey}&lang=en_US&pass_ticket=${pass_ticket}`,
            method: 'POST',
            body: postData,
            json: true,
            jar: true
        }

        request(options, (error, response, body)=>{
            obj.SyncKey = body.SyncKey;
            if (body.AddMsgCount = 0)  return;
            debug('组装消息。。。');
            // FIXME:
            var ps = [];
            _.each(body.AddMsgList, function(o){//Monster
                var toUserName = o.ToUserName;
                //debug('in webwxsync body:' + inspect(o));
                if ((o.MsgType == 1) && (toUserName == obj.username)) { //给我

                    var fil = _.filter(obj.ml, {'UserName' : o.FromUserName});
                    if(fil.length > 0) console.log('[' + fil[0]['NickName'] + ' 说]', o.Content);
                    var group = _.startsWith('o.FromUserName', '@@');
                    if(!group) {
                        debug('获取机器人回复消息...');
                        // 有意思的东西哈哈
                        o.Content = o.Content.replace(/@老猫/g, '喂, ');
                        // 闭包,防止串号，血泪教训
                        //var replyPromise = replyRobot(o.Content);
                        //replyPromise.then(body => {
                        //    debug('组装机器人回复消息...');
                        //    obj.MsgToUserAndSend.push({
                        //        User: '@0493fa65a3630d7d05fc7352da1a536a',//o.FromUserName,
                        //        Msg: botTitle + body
                        //    });
                        //});

                        obj.MsgToUserAndSend.push({
                            User: '@0493fa65a3630d7d05fc7352da1a536a',//o.FromUserName,
                            Msg: body
                        });
                        //ps.push(replyPromise);
                    }
                }
            });
            Promise.all(ps).then(()=>{
                resolve(obj);
            });
        });
    });
    return p;
}

function robot(obj) {
    synccheck(obj).
        then(webwxsync).
        then(botSpeak).
        then(robot).
        catch(console.log);
}

function passWebwxsync(obj) {
    if (!obj.webwxsync) {
        return Promise.resolve(obj);
    }
}


var init = require('./init');
getUUID.
    then(init.checkAndParseUUID).
    then(init.showQRImage).
    then(init.checkScan).
    then(init.checkLogin).
    then(init.parseRedirectUrl).
    then(init.webwxinit).
    then(init.getContact).
  //then(webwxstatusnotify).
    then(robot).
  //then(botSpeak).
    catch(console.error);
