// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var FCM = require('fcm-node');
var cron = require('node-cron');
const stripHtml = require("string-strip-html");
var Request = require("request");
var postmark = require("postmark");
var client = new postmark.ServerClient("b773bde9-d116-4d2e-af51-4ba8a3ccd3ff")
exports.sendscheduledNotification= function(){
    exports.sendscheduledquestionNotification();
    exports.sendscheduledarticleNotification();
}


exports.sendscheduledquestionNotification= function(){
    cron.schedule('* * * * *', () => {
    console.log("sendscheduledquestionNotification");
    const appdevicetokens= db.get('appdevicetokens');
    const notifications= db.get('notifications');
    const users= db.get('users');

    var serverKey = 'AAAADOzF0GU:APA91bGmMpp7y25oAciJu6_3UTLayeyIjsmhI0uYKBXSFyuweq4vsw6dDXKKd9aBAlDGQxJaAbuGLpn6Lc-YRHXTvc-SXBa9Amka9_yahYS4wtI0nsSrEa6eIGT3kxc1uZGumChf2MLV'; //put your server key here
    appdevicetokens.find({}).then(function(finaldevicedatas){
        if(finaldevicedatas.length>0)
        {
            finaldevicedatas.forEach(function(reqfinaldevicedata){
               // //console.log('userid '+reqfinaldevicedata.userid);
        notifications.findOne({"userid":reqfinaldevicedata.userid,'questionid':{'$ne':null},'publish_at':{'$gte':Date.now(),'$lte':Date.now()+60000}}).then(function(reqdata){
            if(reqdata!==null){
                users.findOne({"unique_id":reqdata.createdby}).then(function(submitterdata){
        var fcm = new FCM(serverKey);
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
           // to: 'e_AqMNAsFP8:APA91bF2jAv-dbVENYdH2uoXMQBIVvifo7puwfD1yNRb6VpGDlZ5CGgIk3-qkmSpe-fP0wiSf0ADIKcufgczyvGuYQ7rgB8Qe7UkspuO4GnM7DGjV2vtxG5xr92oKdQ94WQha12FOkGb',
            to: reqfinaldevicedata.devicetoken,
            collapse_key: 'your_collapse_key',

            notification: {
                title: 'New Question Published',
                body: stripHtml(submitterdata.firstname+' '+reqdata.content)
            },

            data: {  //you can send only notification or only data(or include both)
                questionid: reqdata.questionid,
                targetid: reqdata.targetid,
                weburl: reqdata.weburl,
                appurl: reqdata.appurl,
            }
        };
        fcm.send(message, function(err, response){
            if (err) {
                //console.log("Something has gone wrong!",err);
            } else {
                //console.log("Successfully sent with response: ", response);
            }
        });
    }).catch(function(error){

    });
    }

      }).catch(function(error){

      });
    })
}
    }).catch(function(error){

    });
    //return true;
});
}
exports.sendscheduledarticleNotification= function(){
    cron.schedule('* * * * *', () => {
    console.log("sendscheduledarticleNotification");
    const appdevicetokens= db.get('appdevicetokens');
    const notifications= db.get('notifications');
    const users= db.get('users');

    var serverKey = 'AAAADOzF0GU:APA91bGmMpp7y25oAciJu6_3UTLayeyIjsmhI0uYKBXSFyuweq4vsw6dDXKKd9aBAlDGQxJaAbuGLpn6Lc-YRHXTvc-SXBa9Amka9_yahYS4wtI0nsSrEa6eIGT3kxc1uZGumChf2MLV'; //put your server key here
    appdevicetokens.find({}).then(function(finaldevicedatas){
        if(finaldevicedatas.length>0)
        {
            finaldevicedatas.forEach(function(reqfinaldevicedata){
                //console.log('userid '+reqfinaldevicedata.userid);
        notifications.findOne({"userid":reqfinaldevicedata.userid,'atricleid':{'$ne':null},'publish_at':{'$gte':Date.now(),'$lte':Date.now()+60000}}).then(function(reqdata){
            if(reqdata!==null){
                users.findOne({"unique_id":reqdata.createdby}).then(function(submitterdata){
        var fcm = new FCM(serverKey);
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
           // to: 'e_AqMNAsFP8:APA91bF2jAv-dbVENYdH2uoXMQBIVvifo7puwfD1yNRb6VpGDlZ5CGgIk3-qkmSpe-fP0wiSf0ADIKcufgczyvGuYQ7rgB8Qe7UkspuO4GnM7DGjV2vtxG5xr92oKdQ94WQha12FOkGb',
            to: reqfinaldevicedata.devicetoken,
            collapse_key: 'your_collapse_key',

            notification: {
                title: 'New Article Published',
                body: stripHtml(submitterdata.firstname+' '+reqdata.content)
            },

            data: {  //you can send only notification or only data(or include both)
                questionid: reqdata.questionid,
                targetid: reqdata.targetid,
                weburl: reqdata.weburl,
                appurl: reqdata.appurl,
            }
        };
        fcm.send(message, function(err, response){
            if (err) {
                //console.log("Something has gone wrong!",err);
            } else {
                //console.log("Successfully sent with response: ", response);
            }
        });
    }).catch(function(error){

    });
    }

      }).catch(function(error){

      });
    })
}
    }).catch(function(error){

    });
    //return true;
});
}

///////////////////////////////////////////////////////////////////////////////

exports.checkOneServer= function()
{
    cron.schedule("* * * * *", function()
    {
        console.log("checkOneServer");
        var data=JSON.stringify('hello');
        Request.post({ "headers": { "content-type": "application/json" },
                        "url":"https://onedev1.gpex.com.au/api/checkServerRun",
                        "body": JSON.stringify({data:[data]})
                    }, (error, response, result) => {
                        console.log('Result from one serverone');
                        if(error) {
                            console.log('Result from one server');
                            const msg = {
                                to: 'sushil@lds-international.in',
                                from: "support@gpex.com.au",
                                subject: 'GPEx one website is down',
                                HtmlBody: '<p>Hello admin</p><p>GPEx onedev1 website is down. Please restart the server.</p><p>Regards</p><p>GPEx Support</p>',
                            };
                            client.sendEmail(msg);
                            const msg2 = {
                                to: 'akangcha@lds-international.in',
                                from: "support@gpex.com.au",
                                subject: 'GPEx one website is down',
                                HtmlBody: '<p>Hello admin</p><p>GPEx onedev1 website is down. Please restart the server.</p><p>Regards</p><p>GPEx Support</p>',
                            };
                            client.sendEmail(msg2);
                        } else {
                            console.log("GPEx ONE server check");
                        }
                    });
    });
}