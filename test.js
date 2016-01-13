var child_process = require('child_process');
var fs = require('fs');
var debug = (text)=>console.error("[DEBUG]", text);
var inspect = require('util').inspect;
var request = require('request');

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
    //debug("checkAndParseUUID");
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
        var display = child_process.spawn('start');
        display.on('close', (code)=> {
           console.log('########');
            resolve(uuid);
        });
        console.log(JSON.stringify(params));;
        var req = request(QRUrl, {qs: params}).pipe(display.stdin);
       // var req  = request(QRUrl, {qs: params}).pipe(function(err, re){
       //     console.log('####@@@@@@@@@');
       //     console.log(err);
       //     console.log(re);
       // })
    });

    return checkLoginPromise;
// 登录
}

function checkLogin(uuid) {
    console.log('check....');
    // 检查登录和跳转
    var p = new Promise((resolve, reject)=> {
        var timestamp = Date.now();
        var checkUrl = `https://login.weixin.qq.com/cgi-bin/mmwebwx-bin/login?tip=1&uuid=${uuid}&_=${timestamp}`;
        request(checkUrl, (error, response, body)=> {
            if (error) {
                reject(error);
            }
            if (/window\.code=200/.test(body)) {
                console.log("登录微信...");
                //debug("in checkLogin: " + body);
                resolve(body);
            } else {
                console.log("登录错误，退出程序...")
                process.exit(1)
            }
        });
    });

    return p;
}

function parseRedirectUrl(text) {
    var result = /window\.redirect_uri="([^"]+)";/.exec(text);
    //debug("parse redirect_uri: " + result[1]);
    if (!result) {
        console.log("登录失败，退出程序")
        process.exit(1)
    }
    return result[1]
}

function login(redirectUrl) {
    //debug("redirectUrl in login:" + redirectUrl);
    var p = new Promise((resolve, reject)=> {
        request.get({
            url: redirectUrl,
            jar: true,
            followRedirect: false,
        }, (error, response, body)=> {
            // server set cookie here，之后的操作需要cookie
            ////debug("set-cookie in login:\n" + inspect(res.headers));
            if (error) {
                reject(error);
            }
            resolve(body);
        })
    });

    return p;
}

function getbaseRequest(text) {
    ////debug("getbaseRequest： " + text)
    var skey = new RegExp('<skey>([^<]+)</skey>');
    var wxsid = new RegExp('<wxsid>([^<]+)</wxsid>');
    var wxuin = new RegExp('<wxuin>([^<]+)</wxuin>');
    var pass_ticket = new RegExp('<pass_ticket>([^<]+)</pass_ticket>');
    // dirty hack
    var skey = skey.exec(text);
    var wxsid = wxsid.exec(text);
    var wxuin = wxuin.exec(text);
    var pass_ticket = pass_ticket.exec(text);
    // if (!(skey && wxsid && wxuin && pass_ticket)) {
    //   return false;
    // }

    var returnVal = {
        BaseRequest: {
            Skey: skey[1],
            Sid: wxsid[1],
            Uin: wxuin[1],
            DeviceID: 'e987710405869831'
        },
        pass_ticket: pass_ticket[1]
    }
    //debug("returnVal: \n" + inspect(returnVal))

    return returnVal;
}

function webwxinit(obj) {
    console.log("登录成功，初始化");
    // FIXME: 初始化的时候初始化用户名和发送？作为全局好像也行
    obj.MsgToUserAndSend = [];
    var p = new Promise((resolve, reject)=> {
        //debug("in webwxinit obj:\n" + inspect(obj));
        var postData = {BaseRequest: obj.BaseRequest};
        //debug("in webwxinit postData: " + postData);
        var timestamp = Date.now();
        var options = {
            baseUrl: 'https://wx.qq.com',
            uri: `/cgi-bin/mmwebwx-bin/webwxinit?lang=en_US&pass_ticket=${obj.pass_ticket}`,
            method: 'POST',
            body: postData,
            json: true,
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            },
            jar: true
        }
        var req = request(options, (error, response, body) => {
            if (error) {
                reject(error);
            }
            //debug("In webwxinit body: " + inspect(body));
            // fs.writeFile('init.json', JSON.stringify(body));
            obj.username = body['User']['UserName'];
            obj.SyncKey = body['SyncKey'];
            //debug("My username: " + obj.username)
            resolve(obj);
        })
    });
    return p;
}


function getContact(obj) {
    console.log("初始化成功，获取联系人...")
    var p = new Promise((resolve, reject)=> {
        //debug('in getContact: \n' + inspect(obj));
        var skey = obj.BaseRequest.Skey;
        var pass_ticket = obj.pass_ticket;
        // var jsonFile = fs.createWriteStream('contact.json');
        var timestamp = Date.now();
        var options = {
            baseUrl: 'https://wx.qq.com',
            uri: `/cgi-bin/mmwebwx-bin/webwxgetcontact?lang=en_US&pass_ticket=${pass_ticket}&skey=${skey}&seq=0&r=${timestamp}`,
            method: 'GET',
            json: true,
            jar: true,
        }
        //debug("getContact contactUrl: \n" + inspect(options));
        request(options, (error, response, body)=> {
            // fs.writeFile('contact.json', JSON.stringify(body));
            var ml = body.MemberList;
            obj.ml = ml;
        //obj.toUser = ml.filter(m=>(m.NickName == "核心活动都是玩玩玩吃吃吃的北邮GC"))[0]['UserName'];
            resolve(obj);
        });
    })
    return p;
}

function botSpeak(obj) {
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
                "Content": msgBundle.Msg,
                "FromUserName": obj.username,
                "ToUserName": msgBundle.User,
                "LocalID": `${timestamp}0${random}`,
                "ClientMsgId": `${timestamp}0${random}`
            }
        };
// 14519079059370342
// 14519073058800623
        var options = {
            baseUrl: 'https://wx.qq.com',
            uri: `/cgi-bin/mmwebwx-bin/webwxsendmsg?lang=en_US&pass_ticket=${pass_ticket}`,
            method: 'POST',
            jar: true,
            json: true,
            body: postData,
        }

//debug("options in botSpeak: \n" + inspect(options));
//debug("postData in botSpeak: \n" + inspect(postData));

        request(options, (error, response, body)=> {
            // debug("in botSpeak ret: " + inspect(body));
            console.log("[机器人回复]", msgBundle.Msg);
        })
    }
}

function synccheck(obj) {
    //https://webpush.weixin.qq.com/cgi-bin/mmwebwx-bin/synccheck?r=1452482036596&skey=%40crypt_3bb2969_2e63a3568c783f0d4a9afbab8ba9f0d2&sid=be%2FeK3jB4eicuZct&uin=2684027137&deviceid=e203172097127147&synckey=1_638107724%7C2_638108703%7C3_638108650%7C1000_1452474264&_=1452482035266
    var p = new Promise((resolve, reject)=> {
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
                synckey: synckey,
                //_: 一个看上去像timestamp但每次递增1的不知道啥
            },
            jar: true,
        }

        request(options, (error, response, body)=> {
            if (error) {
                reject(error);
            }
            //debug("in synccheck body : " + body);
            if (body !== 'window.synccheck={retcode:"0",selector:"0"}')
                resolve(obj);
        })
    });

    return p;
}

function webwxsync(obj) {
    // https://wx.qq.com/cgi-bin/mmwebwx-bin/webwxsync?sid=xWam498tVKzNaHLt&skey=@crypt_3bb2969_a8ec83465d303fb83bf7ddcf512c081d&lang=en_US&pass_ticket=YIBmwsusvnbs8l7Z4wtRdBXtslA8JjyHxsy0Fsf3PN8NTiP3fzhjB9rOE%252Fzu6Nur
    // 参数里
    // rr这参数是什么鬼。。。
    // -732077262 先
    // -732579226 后
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
            jar: true,
        }

        //debug("options in webwxsync: \n" + inspect(options));
        //debug("postData in webwxsync: \n" + inspect(postData));

        //
        // synccheck检查是否需要webwxsync
        // webwxsync检查是否有更新
        // 继续synccheck啥的。。。我猜
        // 当promise遇上循环
        // 请在评论区教教我该怎么在循环中优雅地使用Promise。。。
        request(options, (error, response, body)=> {
            // fs.writeFile('webwxsync.json', JSON.stringify(body));
            // 如果Ret: 0，有新消息
            //
            // update synckey
            obj.SyncKey = body.SyncKey;
            // 或者AddMsgCount 为 1
            if (body.AddMsgCount > 0) {
                // FIXME:
                // 这个设计可能有问题，Promise数组
                // 这段异步逻辑非常绕，我尝试这里说明
                // obj.MsgToUserAndSend 来搜集这次websync得到的所有待回复的消息(打包用户名和回复内容)
                // replyPromise代表未来某个时刻的回复
                // ps代表这次websync得到的需要回复的消息(可能多条)对应的replyPromise的数组
                // 只有ps钟所有reply都获得了，这时obj.MsgToUserAndSend就包含所有待回复打包消息，就可以把obj送给下一个then注册的函数处理。在robot中，websync下一个是botSpeak,就是回复函数。
                var ps = [];
                for (var o of body.AddMsgList) {
                    if ((o.MsgType == 1) && (o.ToUserName == obj.username)) { //给我
                        //debug("in webwxsync someone call me:" + inspect(o));
                        // 查询用户名昵称
                        for (var i = 0; i < obj.ml.length; i++) {
                            if (obj.ml[i]['UserName'] == o.FromUserName)
                                console.log('[' + obj.ml[i]['NickName'] + ' 说]', o.Content);
                        }
                        if (o.FromUserName.startsWith("@@") && !o.Content.includes("@小寒粉丝团")) {
                            // 群消息且at我的群昵称
                            continue;
                        }

                        // 有意思的东西哈哈
                        o.Content = o.Content.replace('@小寒粉丝团团员丙', '喂, ');

                        var username = o.FromUserName;  // 闭包,防止串号，血泪教训
                        var replyPromise = reply(o.Content);
                        replyPromise.then(rep=> {
                            // debug("in ps reps promise:" + inspect(username))
                            // debug("in ps reps promise:" + inspect(rep))
                            obj.MsgToUserAndSend.push({
                                User: username,
                                Msg: "[WeChatBot]: " + rep,
                            });
                        });
                        ps.push(replyPromise);
                    }
                }
                Promise.all(ps).then(()=> {
                    resolve(obj);
                });
            }
        });
    });
    return p;
}

function robot(obj) {
    setInterval(()=> {
        synccheck(obj).
            then(webwxsync).
            then(botSpeak).
            catch(console.error);
    }, 4000)
}

// FIXME:回复逻辑分离到其他文件
function reply(content) {
    // 修正群消息
    content = content.replace(/^[^:]+:<br\/>/m, "");
    //return Promise.resolve(content);
    // 网络版的
    return new Promise((resolve, reject)=> {
        var url = `http://apis.baidu.com/turing/turing/turing`
        request.get(
            url,
            {
                headers: {
                    'apikey': '6053e172b7994b684aadfd4ae0841510',
                },
                qs: {
                    key: '879a6cb3afb84dbf4fc84a1df2ab7319',
                    info: content,
                    userid: 'eb2edb736',
                },
                json: true,
            },
            (error, response, body)=> {
                if (error) {
                    reject(error);
                }
                //debug("in turing machine: " + inspect(body))
                resolve(body.text);
            });
    });
}

getUUID.
    then(checkAndParseUUID).
    then(showQRImage).
    then(checkLogin).
    then(parseRedirectUrl).
    then(login).
    then(getbaseRequest).
    then(webwxinit).
    then(getContact).
  //then(webwxstatusnotify).
    then(robot).
  //then(botSpeak).
    catch(console.error);
