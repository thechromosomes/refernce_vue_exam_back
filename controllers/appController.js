// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var FCM = require('fcm-node');
const stripHtml = require("string-strip-html");


exports.saveAppdevicetoken = function(req,res)
{
    const appdevicetokens= db.get('appdevicetokens');
//res.json(firebaseservertoken);
const options = {upsert: true,returnNewDocument: true};
if(req.body.devicetoken!==null && req.body.devicetoken!==''){
appdevicetokens.findOneAndUpdate({ 'devicetoken': req.body.devicetoken},{$set:{'userid': req.body.userid,'devicetoken':req.body.devicetoken,'created_at':Date.now()}},options).then(function(finaldata){
    res.json([finaldata]);
  }).catch(function(error){
    res.json([]);
  });
}else{
    res.json([]); 
}
}
exports.removeAppdevicetoken = function(req,res)
{
    const appdevicetokens= db.get('appdevicetokens');
//res.json(firebaseservertoken);
//const options = {upsert: true,returnNewDocument: true};
if(req.body.devicetoken!==null && req.body.devicetoken!==''){
    appdevicetokens.remove({'devicetoken': req.body.devicetoken,'userid': req.body.userid});
//appdevicetokens.findOneAndUpdate({ 'devicetoken': req.body.devicetoken},{$set:{'userid': req.body.userid,'devicetoken':req.body.devicetoken,'created_at':Date.now()}},options).then(function(finaldata){
    res.json([]);

}else{
    res.json([]); 
}
}
exports.sendNotification= function(reqdata,title){
    const appdevicetokens= db.get('appdevicetokens');
    const users= db.get('users');
    //var submittername=exports.getQuestioSubmitername(reqdata.createdby);
    //console.log('hello push',submittername);
    appdevicetokens.find({ 'userid': reqdata.userid}).then(function(finaldatas){
        finaldatas.forEach(function(finaldata){
        users.findOne({"unique_id":reqdata.createdby}).then(function(submitterdata){
            if(reqdata.asynccheck){
                var tempmessage='Anonymous';
            }else{
                var tempmessage=submitterdata.firstname;
            }
        var serverKey = 'AAAADOzF0GU:APA91bGmMpp7y25oAciJu6_3UTLayeyIjsmhI0uYKBXSFyuweq4vsw6dDXKKd9aBAlDGQxJaAbuGLpn6Lc-YRHXTvc-SXBa9Amka9_yahYS4wtI0nsSrEa6eIGT3kxc1uZGumChf2MLV'; //put your server key here
        var fcm = new FCM(serverKey);
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
           // to: 'e_AqMNAsFP8:APA91bF2jAv-dbVENYdH2uoXMQBIVvifo7puwfD1yNRb6VpGDlZ5CGgIk3-qkmSpe-fP0wiSf0ADIKcufgczyvGuYQ7rgB8Qe7UkspuO4GnM7DGjV2vtxG5xr92oKdQ94WQha12FOkGb', 
            to: finaldata.devicetoken, 
            collapse_key: 'your_collapse_key',
            
            notification: {
                title: title,
                body:stripHtml(tempmessage+' '+reqdata.content), 
                //body: {'content':stripHtml(submitterdata.firstname+' '+reqdata.content),'questionid': reqdata.questionid,'targetid': reqdata.targetid,'weburl': reqdata.weburl,'appurl': reqdata.appurl}
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
               // console.log("Successfully sent with response: ", response);
            }
        });
      }).catch(function(error){

      });
    })
    }).catch(function(error){

    });
    return true;
}
exports.getQuestioSubmitername = function(userid) {
    const users= db.get('users');
     users.findOne({'unique_id': userid}).then(function(userdata){
        return userdata.firstname;
      }).catch(function(error){
        return '';
      });
  }

  // fetch app user logged 
module.exports.appUserLog = async (req, res) => {
    const appdevicetokens = db.get('appdevicetokens');
    const users = db.get('users'); 

    try {
        let appReport = await appdevicetokens.aggregate([
            {$lookup: {
                "from": "users",
                "localField": "userid",
                "foreignField": "unique_id",
                "as": "users"
            }},
            {"$unwind": "$users"},
            {$project: {
                "users.firstname": 1,
                "users.lastname": 1,
                "created_at": 1
            }}
        ])
        
        res.send({
            "message": "data fetched successfully",
            "status": true,
            "data": appReport
           
        })
    } catch (error) {
       // console.log("error", error)
        res.send({
            "message": 'there is some problem while fetching data',
            "status": false,
            "data": []
        })
    }
}