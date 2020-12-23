// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');
//const sgMail = require('@sendgrid/mail');
var pushNotification = require('./appController');
var cron = require('node-cron');

//sgMail.setApiKey("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");
//**********************************************************************************************************************************************************************
 
exports.sendReminderMail = function(req,res)
{
	const msg = {
                    to: 'akangcha@ldsengineers.com',
                    from: 'sushil@ldsengineers.com',
                    subject: 'Mail Test',
                    text: 'Mail Service for the Sendgrid v3 Web API',
                    html:'<strong>and easy to do anywhere, even with Node.js</strong>',
                };

   // sgMail.send(msg);
  	res.json('success');
}
//**********************************************************************************************************************************************************************

exports.sendPostReports = function(req,res)
{
  const users= db.get('users');
  const posts= db.get('posts');
  const templates= db.get('templates');

  //console.log('post id-',req.body.postid);
  //console.log('createdby-',req.body.created_by);

  templates.findOne({'type_code':'post_report'}).then(function(gettemplate)
  {
    var message=gettemplate.content;
    users.findOne({"unique_id":req.body.created_by}).then(function(getuserdata)
    {
      var username = getuserdata.firstname+' '+getuserdata.lastname
      message=message.replace("{Username}", username);
      message=message.replace("{r_content}", req.body.content);
      const msg = {
                    to: 'sushil@ldsengineers.com',
                    from: 'akangcha@ldsengineers.com',
                    subject: gettemplate.subject,
                    html:message,
                };
      //sgMail.send(msg);
      //console.log('Report mail success')
    res.json('Report mail success');
    })

    
    // //console.log('Report mail success')
    // res.json(message);
    // res.json('Report mail success');
  }).catch(function(error){
      //console.log("function error"+error);
      res.send([]);  
    }); 
}
exports.nudgeEmailUserInteraction = async function(req,res)
{ 
  var d = new Date();
 d.setDate(d.getDate()-15);
 var dtstartdate=d.getTime();
  const community_logs= db.get('community_logs');
  const users= db.get('users');
  const nudge_emails= db.get('nudge_emails');
  const newactiveusers = await community_logs.distinct('userid',{'module':'login','created_at':{'$gt':dtstartdate}});
  const oldactiveusers = await community_logs.distinct('userid',{'module':'login','created_at':{'$lte':dtstartdate}});
  const lastmailedusers = await nudge_emails.distinct('userid',{'created_at':{'$gte':dtstartdate}});
  let difference = oldactiveusers.filter(x => !newactiveusers.includes(x));
  let finaldifference = difference.filter(x => !lastmailedusers.includes(x));
  const emailedusers = await users.find({'unique_id':{'$in':finaldifference}});
  emailedusers.forEach(function(userdata){
    nudge_emails.insert({'userid':userdata.unique_id,'content':'mail','created_at':Date.now()}).then(function(insertnudge){
          
  }).catch(function(error){

  });
  })
  res.json(emailedusers);

}
//**********************************************************************************************************************************************************************

exports.setstudyplanDueNotification = function(req,res)
{
  if(req.params.token == "7Y1dNQEEOTyNRfA4Sj4xPNxjN13JwXCpkcKk5fWHEt5WShVOExDocxNe9cb2U7sL"){

  const notifications= db.get('notifications');
  const sp_duedates= db.get('studyplan_duedates');
   const templates= db.get('templates');
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  curdate=curdate.getTime();
  //res.json(curdate);
  sp_duedates.aggregate([
    {"$match":{'due_date': {'$gte':curdate,'$lte':Date.now()}}},
    {
      $lookup:
      {
                 from: "users",
                 localField: "created_by",
                 foreignField: "unique_id",
                 as: "userdetail"
      }
    },
    {
      $lookup:
      {
                 from: "categories",
                 localField: "topic_id",
                 foreignField: "unique_id",
                 as: "categories"
      }
    },
    {
      $lookup:
      {
                 from: "studyplan_topics",
                 localField: "topic_id",
                 foreignField: "unique_id",
                 as: "categories1"
      }
    },
    { "$unwind": "$userdetail" },
    { "$project": {
      "_id": 1,
      "created_by": 1,
      "topic_id": 1,
      "created_at": 1,
      "star_status": 1,
      "due_date": 1,
      "chkbox_status": 1,
      "userdetail.firstname":1 ,
      "categories.categoryname":1 ,
      "categories1.categoryname":1 ,

  } }  
]).then(function(get_sp_duedates){
  templates.findOne({'type_code':'studyplan_due'}).then(function(gettemplate){
      get_sp_duedates.forEach(function(userdata){
       
        var userid=userdata.created_by; 
        //console.log('userdata userid');
      //console.log('ecls');
      var message=gettemplate.content;
     // message=message.replace("{duedate}", req.body.title);
if(userdata.categories.length>0){
  message=message.replace("{topic}", userdata.categories[0].categoryname);
}else if(userdata.categories1.length>0){
  message=message.replace("{topic}", userdata.categories1[0].categoryname);
}else{
  message=message.replace("{topic}", '');
}


      notifications.insert({'notification_type':'studyplan_due','visited':false,'weburl':'/studyplan','appurl':null,'targetid':null,'pollid':null,'postid':null,'userid':userid,'content':message,'createdby':userid,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
      //  res.json(insertnotification);  
      delete message;            
  }).catch(function(error){
  //res.json([]);  
  });

      })

  }).catch(function(error){
    //res.json([]);  
    });
          
}).catch(function(error){
res.json([]);  
});

//   notifications.insert({'userid':req.body.createdby,'content':'article added','createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
//             res.json(insertnotification);             
// }).catch(function(error){
//     res.json([]);  
// });
res.json([]); 
  }else{
    res.json([{'message':'Token Miss Match'}]);  
  }

}
exports.setstudyplanReminderNotification = function(req,res)
{
if(req.params.token == "7Y1dNQEEOTyNRfA4Sj4xPNxjN13JwXCpkcKk5fWHEt5WShVOExDocxNe9cb2U7sL"){
  const notifications= db.get('notifications');
  const sp_duedates= db.get('studyplan_topicreminders');
   const templates= db.get('templates');
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  curdate=curdate.getTime();
  //res.json(curdate);
  sp_duedates.aggregate([
    {"$match":{'remindme_sdate': {'$gte':curdate,'$lte':Date.now()}}},
    {
      $lookup:
      {
                 from: "users",
                 localField: "created_by",
                 foreignField: "unique_id",
                 as: "userdetail"
      }
    },
    {
      $lookup:
      {
                 from: "categories",
                 localField: "topic_id",
                 foreignField: "unique_id",
                 as: "categories"
      }
    },
    {
      $lookup:
      {
                 from: "studyplan_topics",
                 localField: "topic_id",
                 foreignField: "unique_id",
                 as: "categories1"
      }
    },
    { "$unwind": "$userdetail" },
    { "$project": {
      "_id": 1,
      "created_by": 1,
      "topic_id": 1,
      "created_at": 1,
      "star_status": 1,
      "due_date": 1,
      "chkbox_status": 1,
      "userdetail.firstname":1 ,
      "categories.categoryname":1 ,
      "categories1.categoryname":1 ,

  } }  
]).then(function(get_sp_duedates){
  templates.findOne({'type_code':'studyplan_reminder'}).then(function(gettemplate){
      get_sp_duedates.forEach(function(userdata){
       
        var userid=userdata.created_by; 
        //console.log('userdata userid');
      //console.log('ecls');
      var message=gettemplate.content;
     // message=message.replace("{duedate}", req.body.title);
if(userdata.categories.length>0){
  message=message.replace("{topic}", userdata.categories[0].categoryname);
}else if(userdata.categories1.length>0){
  message=message.replace("{topic}", userdata.categories1[0].categoryname);
}else{
  message=message.replace("{topic}", '');
}


      notifications.insert({'notification_type':'studyplan_reminder','visited':false,'weburl':'/studyplan','appurl':null,'targetid':null,'pollid':null,'postid':null,'userid':userid,'content':message,'createdby':userid,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
      //  res.json(insertnotification);  
      delete message;            
  }).catch(function(error){
  //res.json([]);  
  });

      })

  }).catch(function(error){
    //res.json([]);  
    });
          
}).catch(function(error){
res.json([]);  
});

//   notifications.insert({'userid':req.body.createdby,'content':'article added','createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
//             res.json(insertnotification);             
// }).catch(function(error){
//     res.json([]);  
// });
res.json([]); 
}else{
  res.json([{'message':'Token Miss Match'}]); 
}
}
//****************************************************************************
exports.setstudyplanReminderPreNotification = function(req,res)
{
  if(req.params.token == "7Y1dNQEEOTyNRfA4Sj4xPNxjN13JwXCpkcKk5fWHEt5WShVOExDocxNe9cb2U7sL")
  {
    const notifications = db.get('notifications');
    const sp_duedates = db.get('studyplan_topicreminders');
    const templates = db.get('templates');
    
    var curdate = new Date(new Date().setHours(0, 0, 0, 0));
    var startdate = curdate.setDate(curdate.getDate() + 3);
    var enddate = new Date(new Date(startdate).setHours(23, 59, 59, 999));
    enddate=enddate.getTime();

    // //console.log('startdate',startdate)
    // //console.log('startdate',new Date(startdate))
    // //console.log('*********************************')
    // //console.log('enddate',enddate)
    // //console.log('enddate',new Date(enddate))
    // res.json(curdate);
    sp_duedates.aggregate([
        {"$match":{'remindme_sdate': {'$gte':startdate,'$lte':enddate}}},
        {
          $lookup:
          {
                     from: "users",
                     localField: "created_by",
                     foreignField: "unique_id",
                     as: "userdetail"
          }
        },
        {
          $lookup:
          {
                     from: "categories",
                     localField: "topic_id",
                     foreignField: "unique_id",
                     as: "categories"
          }
        },
        {
          $lookup:
          {
                     from: "studyplan_topics",
                     localField: "topic_id",
                     foreignField: "unique_id",
                     as: "categories1"
          }
        },
        { "$unwind": "$userdetail" },
        { "$project": {
                          "_id": 1,
                          "created_by": 1,
                          "topic_id": 1,
                          "created_at": 1,
                          "star_status": 1,
                          "due_date": 1,
                          "chkbox_status": 1,
                          "userdetail.firstname":1 ,
                          "categories.categoryname":1 ,
                          "categories1.categoryname":1 ,
                      } 
        }  
    ]).then(function(get_sp_duedates)
      {
          templates.findOne({'type_code':'studyplan_reminder'}).then(function(gettemplate)
          {
              get_sp_duedates.forEach(function(userdata)
              {
                var userid=userdata.created_by; 
                //console.log('userdata userid');
                //console.log('ecls');
                var message=gettemplate.content;
                // message=message.replace("{duedate}", req.body.title);
                if(userdata.categories.length>0)
                {     message=message.replace("{topic}", userdata.categories[0].categoryname);    }
                else if(userdata.categories1.length>0)
                {
                      message=message.replace("{topic}", userdata.categories1[0].categoryname);
                }
                else { message=message.replace("{topic}", '');  }

                notifications.insert({'notification_type':'studyplan_reminder','visited':false,'weburl':'/studyplan','appurl':null,'targetid':null,'pollid':null,'postid':null,'userid':userid,'content':message,'createdby':userid,'status':true,'created_at':Date.now(),'publish_at':Date.now()})
                .then(function(insertnotification)
                {
                  //  res.json(insertnotification);  
                  delete message;            
                }).catch(function(error){
                    //res.json([]);  
                  });
              })
          }).catch(function(error){
                //res.json([]);  
            });
      }).catch(function(error){
          res.json([]);  
        });
      res.json([]); 
  }
  else {  res.json([{'message':'Token Miss Match'}]); }
}

//****************************************************************************
exports.setpostnotification = function(req,res)
{
  const notifications= db.get('notifications');
  notifications.insert({'userid':req.body.createdby,'content':'article added','createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
            res.json(insertnotification);             
}).catch(function(error){
    res.json([]);  
});
}
exports.SearchNotification = function(req,res)
{
const notifications= db.get('notifications');
/*const users= db.get('users');
users.find({"$or":[{'firstname': new RegExp(req.body.searched, 'i')},{'lastname': new RegExp(req.body.searched, 'i')}]}).then(function(getusers){

  res.json(getusers.join); 
*/
notifications.aggregate([
  {"$match":{ "publish_at": {"$lte": Date.now() },'userid': req.body.userid,'status':true,'content': new RegExp(req.body.searched, 'i')}},
  {"$sort": {"publish_at": -1}},
{
  $lookup:
  {
             from: "users",
             localField: "createdby",
             foreignField: "unique_id",
             as: "userdetail"
  }
},
{ "$unwind": "$userdetail" },
  { "$project": {
      "_id":1,
      "created_at":1,
      "publish_at":1,
      "content":1,
      "weburl":1,
      "targetid":1,
      "childtargetid":1,
      "status":1,
      "visited":1,
      "userdetail.unique_id":1,
      "userdetail.firstname":1,
      "userdetail.lastname":1, 
      "userdetail.profile":1    

  } 
}
]).then(function(notifications){
  res.json(notifications);
}).catch(function(error){
  res.json('error');
});
/*}).catch(function(error){
  res.json(['dhgfhdg']);  
  });*/
}
exports.saveTemplate = function(req,res)
{
  const templates= db.get('templates');
  templates.insert({'type_code':req.body.type_code,'subject':req.body.subject,'roles':req.body.roles,'content':req.body.content,'createdby':req.body.createdby,'status':true,'created_at':Date.now()}).then(function(inserttemplate){
            res.json(inserttemplate);             
}).catch(function(error){
    res.json([]);  
});
}
exports.getTemplatebyID = function(req,res)
{
  const templates= db.get('templates');
  templates.findOne({'_id':req.body.id}).then(function(gettemplate){
            res.json(gettemplate);             
}).catch(function(error){
    res.json([]);  
});
}
exports.updateTemplate = function(req,res)
{
  const templates= db.get('templates');
  templates.findOneAndUpdate({'_id':req.body.id},{$set:{'type_code':req.body.type_code,'subject':req.body.subject,'roles':req.body.roles,'content':req.body.content,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(inserttemplate){
            res.json(inserttemplate);             
}).catch(function(error){
    res.json([]);  
});
}
exports.getAllTemplates = function(req,res)
{
  const templates= db.get('templates');
  templates.aggregate( [
  {"$sort": {"_id": -1}},
  {
     $lookup:
     {
                from: "template_types",
                localField: "type_code",
                foreignField: "shortname",
                as: "templatetype"
     }
 },
 { "$unwind": "$templatetype" },
 { "$project": {
     "_id":1,
     "type_code":1,
     "content":1,
     "created_at":1,
     "templatetype.templatename":1,  

 } 
}
 ]).then(function(getTemplates){
            res.json(getTemplates);            
}).catch(function(error){
    res.json([]);  
});
}
exports.getallTemplateType = function(req,res)
{
  const template_types= db.get('template_types');
  template_types.find({}).then(function(gettemplate_types){
            res.json(gettemplate_types);             
}).catch(function(error){
    res.json([]);  
});
}
exports.removeTemplate = function(req,res)
{
  const templates= db.get('templates');
  templates.remove({ '_id': req.body.id});
  res.json([{'status':200}]); 
}

exports.setarticlepublishnotification = function(req,res)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const templates= db.get('templates');
  templates.findOne({'type_code':'publish_article'}).then(function(gettemplate){
  users.find({}).then(function(getUsers){
    
    //console.log('userdata',getUsers);
    getUsers.forEach(function(userdata){
     
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
  users.findOne({'unique_id':req.body.authorid}).then(function(getAuthors){
      var author=getAuthors.firstname+' '+getAuthors.lastname
      var message=gettemplate.content;
      var message=message.replace("{article_name}", req.body.title);
      var message1=message.split("{author_body}");
message=message1[0]+message1[1]+message1[2];
      //var message=message+' Posted By '+author;
      var message=message.replace("{author_name}", author);
      //console.log('author ');
    notifications.insert({'notification_type':'publish_article','visited':false,'weburl':req.body.weburl,'appurl':req.body.appurl,'targetid':req.body.targetid,'articleid':req.body.articleid,'postid':req.body.postid,'userid':userid,'content':message,'createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':req.body.scheduled}).then(function(insertnotification){
      //res.json(insertnotification);
      if(req.body.scheduled<=Date.now()){
        pushNotification.sendNotification(insertnotification,'New Article Published'); 
  }  
      delete message;           
}).catch(function(error){
//res.json([]);  
});
  }).catch(function(error){
    //console.log('ecls');
    var message=gettemplate.content;
    var message=message.replace("{article_name}", req.body.title);
    var message1=message.split("{author_body}");
    var message=message1[0]+message1[2];
    notifications.insert({'notification_type':'publish_article','visited':false,'weburl':req.body.weburl,'appurl':req.body.appurl,'targetid':req.body.targetid,'articleid':req.body.articleid,'postid':req.body.postid,'userid':userid,'content':message,'createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':req.body.scheduled}).then(function(insertnotification){
    //  res.json(insertnotification);  
    if(req.body.scheduled<=Date.now()){
      pushNotification.sendNotification(insertnotification,'New Article Published'); 
}
    delete message;            
}).catch(function(error){
//res.json([]);  
});
});
    })
}).catch(function(error){
  //res.json([]);  
  });
}).catch(function(error){
  //res.json([]);  
  });
 res.json([]);  
}
exports.internalsetarticlepublishnotification = function(reqdata)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const templates= db.get('templates');
  templates.findOne({'type_code':'publish_article'}).then(function(gettemplate){
  users.find({}).then(function(getUsers){
    
    //console.log('userdata',getUsers);
    getUsers.forEach(function(userdata){
     
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
  users.findOne({'unique_id':reqdata.authorid}).then(function(getAuthors){
      var author=getAuthors.firstname+' '+getAuthors.lastname
      var message=gettemplate.content;
      var message=message.replace("{article_name}", reqdata.title);
      var message1=message.split("{author_body}");
message=message1[0]+message1[1]+message1[2];
      //var message=message+' Posted By '+author;
      var message=message.replace("{author_name}", author);
      //console.log('author ');
    notifications.insert({'notification_type':'publish_article','visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'targetid':reqdata.targetid,'articleid':reqdata.articleid,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':reqdata.scheduled}).then(function(insertnotification){
      //res.json(insertnotification); 
      if(req.body.scheduled<=Date.now()){
        pushNotification.sendNotification(insertnotification,'New Article Published'); 
  }    
      delete message;           
}).catch(function(error){
//res.json([]);  
});
  }).catch(function(error){
    //console.log('ecls');
    var message=gettemplate.content;
    var message=message.replace("{article_name}", reqdata.title);
    var message1=message.split("{author_body}");
    var message=message1[0]+message1[2];
    notifications.insert({'notification_type':'publish_article','visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'targetid':reqdata.targetid,'articleid':reqdata.articleid,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':reqdata.scheduled}).then(function(insertnotification){
    //  res.json(insertnotification);  
    if(req.body.scheduled<=Date.now()){
      pushNotification.sendNotification(insertnotification,'New Article Published'); 
}
    delete message;            
}).catch(function(error){
//res.json([]);  
});
});
    })
}).catch(function(error){
  //res.json([]);  
  });
}).catch(function(error){
  //res.json([]);  
  });
 return true;
}

exports.setpollpublishnotification = function(req,res)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const templates= db.get('templates');
  templates.findOne({'type_code':'publish_poll'}).then(function(gettemplate){
  users.find({}).then(function(getUsers){
    
    //console.log('userdata',getUsers);
    getUsers.forEach(function(userdata){
     
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
    //console.log('ecls');
    var message=gettemplate.content;
    var message=message.replace("{title}", req.body.title);
    notifications.insert({'notification_type':'publish_poll','visited':false,'weburl':req.body.weburl,'appurl':req.body.appurl,'targetid':req.body.targetid,'pollid':req.body.pollid,'postid':req.body.postid,'userid':userid,'content':message,'createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
    //  res.json(insertnotification);  
    delete message;            
}).catch(function(error){
//res.json([]);  
});

    })
}).catch(function(error){
  //res.json([]);  
  });
}).catch(function(error){
  //res.json([]);  
  });
 res.json([]);  
}
exports.setquestionpublishnotification = function(req,res)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const templates= db.get('templates');
  templates.findOne({'type_code':'publish_question'}).then(function(gettemplate){
  users.find({}).then(function(getUsers){
    //console.log('userdata');
    getUsers.forEach(function(userdata){
      var message=gettemplate.content;
      var message=message.replace("{title}", req.body.title);
      var message=message.replace("{question_type}", req.body.q_type);
     // var message="New Question posted "+'"'+req.body.title+'"';
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
    notifications.insert({'notification_type':'publish_question','visited':false,'weburl':req.body.weburl,'appurl':req.body.appurl,'targetid':req.body.targetid,'questionid':req.body.questionid,'postid':req.body.postid,'userid':userid,'content':message,'createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':req.body.scheduled}).then(function(insertnotification){
      //console.log(insertnotification);
      
if(req.body.scheduled<=Date.now()){
      pushNotification.sendNotification(insertnotification,'New Question Published'); 
}
      delete message;           
}).catch(function(error){
//console.log(error);
});

    })
}).catch(function(error){
  //console.log(error);
  });
}).catch(function(error){
  //console.log(error);
  });
 res.json([]);  
}
exports.intsetquestionpublishnotification = function(reqdata)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const templates= db.get('templates');
  templates.findOne({'type_code':'publish_question'}).then(function(gettemplate){
  users.find({}).then(function(getUsers){
    //console.log('userdata');
    getUsers.forEach(function(userdata){
      var message=gettemplate.content;
      var message=message.replace("{title}", reqdata.title);
      var message=message.replace("{question_type}", reqdata.q_type);
     // var message="New Question posted "+'"'+req.body.title+'"';
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
    notifications.insert({'notification_type':'publish_question','visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'childtargetid':reqdata.childtargetid,'targetid':reqdata.targetid,'questionid':reqdata.questionid,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':reqdata.scheduled}).then(function(insertnotification){
      //console.log("question notification "+insertnotification);  
      pushNotification.sendNotification(insertnotification,'New Question Published'); 
      delete message;           
}).catch(function(error){
//console.log(error);
});

    })
}).catch(function(error){
  //console.log(error);
  });
}).catch(function(error){
  //console.log(error);
  });
return true;
}
exports.updatenotificatiodate = function(questionid,publishdata)
{
  const notifications= db.get('notifications');
  notifications.find({'questionid':questionid}).then(function(getquestions){
    getquestions.forEach(function(questiondata){
     var qid= questiondata._id.toString()
      notifications.findOneAndUpdate({'_id':qid},{$set:{'publish_at':publishdata}});

    })
  }).catch(function(error){
    //console.log(error);
    });

   
//console.log('hellocheck',questionid+' '+publishdata);
return true;
}
exports.setpostlikenotification = function(req,res)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const posts= db.get('posts');
  const templates= db.get('templates');
  templates.findOne({'type_code':'post_like'}).then(function(gettemplate){
    var finalusers=[];
    posts.aggregate([
      {"$match":{'unique_id':req.body.postid}},
    {
      $lookup:
      {
                 from: "post_likes",
                 localField: "unique_id",
                 foreignField: "postid",
                 as: "likedetail"
      }
  },
  {
    $lookup:
    {
               from: "comments",
               localField: "unique_id",
               foreignField: "postid",
               as: "commentdetail"
    }
  },
      { "$project": {
          "_id":1,
          "created_by":1,
          "likedetail.likeby":1,
          "commentdetail.created_by":1  
  
      } 
  }
  ]).then(function(getUsers){
      //finalusers.push(getUsers[0].created_by);
      if(getUsers[0].likedetail.length>0){
        getUsers[0].likedetail.forEach(function(udata){
          if(finalusers.indexOf(udata.likeby)<0 && req.body.createdby!=udata.likeby){
          finalusers.push(udata.likeby);
           }
     });
      }
      if(getUsers[0].commentdetail.length>0){
        getUsers[0].commentdetail.forEach(function(udata){
  if(finalusers.indexOf(udata.created_by)<0 && req.body.createdby!=udata.created_by){
          finalusers.push(udata.created_by);
  }
        });
  
      }
    //console.log(finalusers);
  
  users.find({'unique_id':{ $in: finalusers }}).then(function(getUsers){
    //console.log('userdata');
    getUsers.forEach(function(userdata){
      var message=gettemplate.content;
      //var message=message.replace("{title}", req.body.title);
      //var message=message.replace("{question_type}", req.body.q_type);
     // var message="New Question posted "+'"'+req.body.title+'"';
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
    notifications.insert({'notification_type':'post_like','visited':false,'weburl':req.body.weburl,'appurl':req.body.appurl,'targetid':req.body.targetid,'questionid':null,'postid':req.body.postid,'userid':userid,'content':message,'createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
      //res.json(insertnotification);  
      delete message;           
}).catch(function(error){
//res.json([]);  
});

    })
}).catch(function(error){
  res.json([]);  
  });
}).catch(function(error){
  //console.log("function error"+error);
  res.send([]);  
  });

}).catch(function(error){
  res.json([]);  
  });
 res.json([]);  
}
exports.setpostcommentnotification = function(req,res)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const posts= db.get('posts');
  const templates= db.get('templates');
  templates.findOne({'type_code':'add_comment'}).then(function(gettemplate){
    var finalusers=[];
    posts.aggregate([
      {"$match":{'unique_id':req.body.postid}},
    {
      $lookup:
      {
                 from: "post_likes",
                 localField: "unique_id",
                 foreignField: "postid",
                 as: "likedetail"
      }
  },
  {
    $lookup:
    {
               from: "comments",
               localField: "unique_id",
               foreignField: "postid",
               as: "commentdetail"
    }
  },
      { "$project": {
          "_id":1,
          "created_by":1,
          "likedetail.likeby":1,
          "commentdetail.created_by":1  
  
      } 
  }
  ]).then(function(getUsers){
     // finalusers.push(getUsers[0].created_by);
      if(getUsers[0].likedetail.length>0){
        getUsers[0].likedetail.forEach(function(udata){
          if(finalusers.indexOf(udata.likeby)<0 && req.body.createdby!=udata.likeby){
          finalusers.push(udata.likeby);
           }
     });
      }
      if(getUsers[0].commentdetail.length>0){
        getUsers[0].commentdetail.forEach(function(udata){
  if(finalusers.indexOf(udata.created_by)<0 && req.body.createdby!=udata.created_by){
          finalusers.push(udata.created_by);
  }
        });
  
      }
      if(getUsers.length>0){

        if(finalusers.indexOf(getUsers[0].created_by)<0 && reqdata.createdby!=getUsers[0].created_by){
                finalusers.push(getUsers[0].created_by);
        }
      
        
            }
    //console.log(finalusers);
  
  users.find({'unique_id':{ $in: finalusers }}).then(function(getUsers){
    //console.log('userdata');
    getUsers.forEach(function(userdata){
      var message=gettemplate.content;
      //var message=message.replace("{title}", req.body.title);
      //var message=message.replace("{question_type}", req.body.q_type);
     // var message="New Question posted "+'"'+req.body.title+'"';
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
    notifications.insert({'notification_type':'add_comment','visited':false,'weburl':req.body.weburl,'appurl':req.body.appurl,'childtargetid':req.body.childtargetid,'targetid':req.body.targetid,'questionid':null,'postid':req.body.postid,'userid':userid,'content':message,'createdby':req.body.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
      //res.json(insertnotification);  
        pushNotification.sendNotification(insertnotification,'New Comment Added'); 
  
      delete message;           
}).catch(function(error){
//res.json([]);  
});

    })
}).catch(function(error){
  res.json([]);  
  });
}).catch(function(error){
  //console.log("function error"+error);
  res.send([]);  
  });

}).catch(function(error){
  res.json([]);  
  });
 res.json([]);  
}
exports.setcasecommentnotification = function(reqdata)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const posts= db.get('posts');
  const templates= db.get('templates');
  templates.findOne({'type_code':'add_comment'}).then(function(gettemplate){
    var finalusers=[];
    posts.aggregate([
      {"$match":{'unique_id':reqdata.postid}},
    {
      $lookup:
      {
                 from: "post_likes",
                 localField: "unique_id",
                 foreignField: "postid",
                 as: "likedetail"
      }
  },
  {
    $lookup:
    {
               from: "case_comments",
               localField: "unique_id",
               foreignField: "postid",
               as: "commentdetail"
    }
  },
      { "$project": {
          "_id":1,
          "created_by":1,
          "likedetail.likeby":1,
          "commentdetail.created_by":1  
  
      } 
  }
  ]).then(function(getUsers){
     // finalusers.push(getUsers[0].created_by);
      if(getUsers[0].likedetail.length>0){
        getUsers[0].likedetail.forEach(function(udata){
          if(finalusers.indexOf(udata.likeby)<0 && reqdata.createdby!=udata.likeby){
          finalusers.push(udata.likeby);
           }
     });
      }
      if(getUsers[0].commentdetail.length>0){
        getUsers[0].commentdetail.forEach(function(udata){
  if(finalusers.indexOf(udata.created_by)<0 && reqdata.createdby!=udata.created_by){
          finalusers.push(udata.created_by);
  }
        });
  
      }
      if(getUsers.length>0){

        if(finalusers.indexOf(getUsers[0].created_by)<0 && reqdata.createdby!=getUsers[0].created_by){
                finalusers.push(getUsers[0].created_by);
        }
      
        
            }
   // res.send(finalusers);
  
  users.find({'unique_id':{ $in: finalusers }}).then(function(getUsers){
    //console.log('userdata');
    getUsers.forEach(function(userdata){
      var message=gettemplate.content;
      //var message=message.replace("{title}", req.body.title);
      //var message=message.replace("{question_type}", req.body.q_type);
     // var message="New Question posted "+'"'+req.body.title+'"';
      var userid=userdata.unique_id; 
      //console.log('userdata userid');
    notifications.insert({'notification_type':'add_comment','asynccheck':reqdata.asynccheck,'dummyname':reqdata.dummyname,'dummyprofile':reqdata.dummyprofile,'visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'childtargetid':reqdata.childtargetid,'targetid':reqdata.targetid,'questionid':null,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
      //res.json(insertnotification);
      pushNotification.sendNotification(insertnotification,'New Comment Added');  
      delete message;           
}).catch(function(error){
//res.json([]);  
});

    })
}).catch(function(error){
  //res.json([]);  
  });
}).catch(function(error){
  //console.log("function error"+error);
  //res.send([]);  
  });

}).catch(function(error){
  //res.json([]);  
  });
return true; 
}
exports.setkfpcommentnotification = function(reqdata)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const posts= db.get('posts');
  const templates= db.get('templates');
  templates.findOne({'type_code':'add_comment'}).then(function(gettemplate){
    var finalusers=[];
    posts.aggregate([
      {"$match":{'unique_id':reqdata.postid}},
    {
      $lookup:
      {
                 from: "post_likes",
                 localField: "unique_id",
                 foreignField: "postid",
                 as: "likedetail"
      }
  },
  {
    $lookup:
    {
               from: "comments",
               localField: "unique_id",
               foreignField: "postid",
               as: "commentdetail"
    }
  },
      { "$project": {
          "_id":1,
          "created_by":1,
          "likedetail.likeby":1,
          "commentdetail.created_by":1  
  
      } 
  }
  ]).then(function(getUsers){
     // finalusers.push(getUsers[0].created_by);
      if(getUsers[0].likedetail.length>0){
        getUsers[0].likedetail.forEach(function(udata){
          if(finalusers.indexOf(udata.likeby)<0 && reqdata.createdby!=udata.likeby){
          finalusers.push(udata.likeby);
           }
     });
      }
      if(getUsers[0].commentdetail.length>0){
        getUsers[0].commentdetail.forEach(function(udata){
  if(finalusers.indexOf(udata.created_by)<0 && reqdata.createdby!=udata.created_by){
          finalusers.push(udata.created_by);
  }
        });
  
      }
      if(getUsers.length>0){

  if(finalusers.indexOf(getUsers[0].created_by)<0 && reqdata.createdby!=getUsers[0].created_by){
          finalusers.push(getUsers[0].created_by);
  }

  
      }
    //console.log(finalusers);
  
  users.find({'unique_id':{ $in: finalusers }}).then(function(getUsers){
    //console.log('userdata');
    getUsers.forEach(function(userdata){
      var message=gettemplate.content;
      //var message=message.replace("{title}", req.body.title);
      //var message=message.replace("{question_type}", req.body.q_type);
     // var message="New Question posted "+'"'+req.body.title+'"';
      var userid=userdata.unique_id; 
      //console.log('userdata userid for notification');
    notifications.insert({'notification_type':'add_comment','asynccheck':reqdata.asynccheck,'dummyname':reqdata.dummyname,'dummyprofile':reqdata.dummyprofile,'visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'childtargetid':reqdata.childtargetid,'targetid':reqdata.targetid,'questionid':null,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
      //res.json(insertnotification); 
      pushNotification.sendNotification(insertnotification,'New Comment Added'); 
      delete message;           
}).catch(function(error){
//res.json([]);  
});

    })
}).catch(function(error){
  res.json([]);  
  });
}).catch(function(error){
  //console.log("function error"+error);
  res.send([]);  
  });

}).catch(function(error){
  res.json([]);  
  });
 res.json([]);  
}
//***************************************************************************************************

exports.setsbacommentnotification = function(reqdata)
{
    const notifications= db.get('notifications');
    const users= db.get('users');
    const posts= db.get('posts');
    const templates= db.get('templates');
    templates.findOne({'type_code':'add_comment'}).then(function(gettemplate)
    {
        var finalusers=[];
        posts.aggregate([
            {"$match":{'unique_id':reqdata.postid}},
            {
                $lookup:
                {
                    from: "post_likes",
                    localField: "unique_id",
                    foreignField: "postid",
                    as: "likedetail"
                }
            },
            {
                $lookup:
                {
                           from: "comments",
                           localField: "unique_id",
                           foreignField: "postid",
                           as: "commentdetail"
                }
            },
            { "$project": {
                              "_id":1,
                              "created_by":1,
                              "likedetail.likeby":1,
                              "commentdetail.created_by":1  
  
                          } 
            }
        ]).then(function(getUsers)
        {
            if(getUsers[0].likedetail.length>0)
            {
                getUsers[0].likedetail.forEach(function(udata)
                {
                    if(finalusers.indexOf(udata.likeby)<0 && reqdata.createdby!=udata.likeby)
                    {    finalusers.push(udata.likeby); }
                });
            }
            if(getUsers[0].commentdetail.length>0)
            {
                getUsers[0].commentdetail.forEach(function(udata)
                {
                    if(finalusers.indexOf(udata.created_by)<0 && reqdata.createdby!=udata.created_by)
                    {  finalusers.push(udata.created_by);   }
                });
            }
            if(getUsers.length>0){

              if(finalusers.indexOf(getUsers[0].created_by)<0 && reqdata.createdby!=getUsers[0].created_by){
                      finalusers.push(getUsers[0].created_by);
              }
            
              
                  }
            //console.log(finalusers);
            users.find({'unique_id':{ $in: finalusers }}).then(function(getUsers)
            {
                //console.log('userdata');
                getUsers.forEach(function(userdata)
                {
                    var message=gettemplate.content;
                    var userid=userdata.unique_id; 
                    //console.log('userdata userid');
                    notifications.insert({'notification_type':'add_comment','asynccheck':reqdata.asynccheck,'dummyname':reqdata.dummyname,'dummyprofile':reqdata.dummyprofile,'visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'childtargetid':reqdata.childtargetid,'targetid':reqdata.targetid,'questionid':null,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()})
                    .then(function(insertnotification)
                    {
                      pushNotification.sendNotification(insertnotification,'New Comment Added');
                        delete message;           
                    }).catch(function(error){
                      //console.log(error);
                    });
                })
            }).catch(function(error){
              //console.log(error);
                    res.json([]);  
                });
        }).catch(function(error){
            //console.log("function error"+error);
            res.send([]);  
           });
    }).catch(function(error){
      //console.log(error);
        res.json([]);  
      });
    res.json([]);  
}

//***************************************************************************************************
exports.setfiveuserscommentnotification = function(reqdata)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const posts= db.get('posts');
  const case_comments= db.get('case_comments');
  const templates= db.get('templates');
  templates.findOne({'type_code':'five_comments'}).then(function(gettemplate){
    var finalusers=[];
    case_comments.distinct('created_by',{'postid':reqdata.postid}).then(function(getsubUsers){
      //console.log("submitter count"+getsubUsers.length);
      if(getsubUsers.length%5==0){
        var submittercount=getsubUsers.length;
        posts.aggregate([
          {"$match":{'unique_id':reqdata.postid}},
        {
          $lookup:
          {
                     from: "post_likes",
                     localField: "unique_id",
                     foreignField: "postid",
                     as: "likedetail"
          }
      },
      {
        $lookup:
        {
                   from: "case_comments",
                   localField: "unique_id",
                   foreignField: "postid",
                   as: "commentdetail"
        }
      },
          { "$project": {
              "_id":1,
              "created_by":1,
              "likedetail.likeby":1,
              "commentdetail.created_by":1  
      
          } 
      }
      ]).then(function(getUsers){
         // finalusers.push(getUsers[0].created_by);
          if(getUsers[0].likedetail.length>0){
            getUsers[0].likedetail.forEach(function(udata){
              if(finalusers.indexOf(udata.likeby)<0 && reqdata.createdby!=udata.likeby){
              finalusers.push(udata.likeby);
               }
         });
          }
          if(getUsers[0].commentdetail.length>0){
            getUsers[0].commentdetail.forEach(function(udata){
      if(finalusers.indexOf(udata.created_by)<0 && reqdata.createdby!=udata.created_by){
              finalusers.push(udata.created_by);
      }
            });
      
          }
        //console.log(finalusers);
      
      users.find({'unique_id':{ $in: finalusers }}).then(function(getUsers){
        //console.log('userdata');
        getUsers.forEach(function(userdata){
          var message=gettemplate.content;
          var message=message.replace("{commentcount}", submittercount);
          var message=message.replace("{title}", reqdata.title);
          var message=message.replace("{question_type}", reqdata.q_type);
          var userid=userdata.unique_id; 
          //console.log('userdata userid');
        notifications.insert({'notification_type':'case_comments','asynccheck':reqdata.asynccheck,'dummyname':reqdata.dummyname,'dummyprofile':reqdata.dummyprofile,'visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'childtargetid':reqdata.childtargetid,'targetid':reqdata.targetid,'questionid':null,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
          return true;
          delete message;           
    }).catch(function(error){
      return true;
    });
    
        })
    }).catch(function(error){
      return true;
      });
    }).catch(function(error){
      //console.log("function error"+error);
      return true;
      });
      }else{
        return true;
      }
}).catch(function(error){
  //console.log("function error"+error);
  return true;
  });

}).catch(function(error){
  return true;
  });
return true;
}
exports.setfiveusersanswernotification = function(reqdata)
{
  const notifications= db.get('notifications');
  const users= db.get('users');
  const posts= db.get('posts');
  const question_answers= db.get('question_answers');
  const templates= db.get('templates');
  templates.findOne({'type_code':'five_answers'}).then(function(gettemplate){
    var finalusers=[];
    question_answers.distinct('answerby',{'questionid':reqdata.questionid}).then(function(getsubUsers){
      //console.log("submitter count"+getsubUsers.length);
      if(getsubUsers.length%5==0){
        var submittercount=getsubUsers.length;
        posts.aggregate([
          {"$match":{'unique_id':reqdata.postid}},
        {
          $lookup:
          {
                     from: "post_likes",
                     localField: "unique_id",
                     foreignField: "postid",
                     as: "likedetail"
          }
      },
      {
        $lookup:
        {
                   from: "comments",
                   localField: "unique_id",
                   foreignField: "postid",
                   as: "commentdetail"
        }
      },
          { "$project": {
              "_id":1,
              "created_by":1,
              "likedetail.likeby":1,
              "commentdetail.created_by":1  
      
          } 
      }
      ]).then(function(getUsers){
         // finalusers.push(getUsers[0].created_by);
          if(getUsers[0].likedetail.length>0){
            getUsers[0].likedetail.forEach(function(udata){
              if(finalusers.indexOf(udata.likeby)<0 && reqdata.createdby!=udata.likeby){
              finalusers.push(udata.likeby);
               }
         });
          }
          if(getUsers[0].commentdetail.length>0){
            getUsers[0].commentdetail.forEach(function(udata){
      if(finalusers.indexOf(udata.created_by)<0 && reqdata.createdby!=udata.created_by){
              finalusers.push(udata.created_by);
      }
            });
      
          }
        //console.log(finalusers);
      
      users.find({'unique_id':{ $in: finalusers }}).then(function(getUsers){
        //console.log('userdata');
        getUsers.forEach(function(userdata){
          var message=gettemplate.content;
          var message=message.replace("{commentcount}", submittercount);
          var message=message.replace("{title}", reqdata.title);
          var message=message.replace("{question_type}", reqdata.q_type);
          var userid=userdata.unique_id; 
          //console.log('userdata userid');
        notifications.insert({'notification_type':'five_answers','asynccheck':reqdata.asynccheck,'dummyname':reqdata.dummyname,'dummyprofile':reqdata.dummyprofile,'visited':false,'weburl':reqdata.weburl,'appurl':reqdata.appurl,'childtargetid':reqdata.childtargetid,'targetid':reqdata.targetid,'questionid':null,'postid':reqdata.postid,'userid':userid,'content':message,'createdby':reqdata.createdby,'status':true,'created_at':Date.now(),'publish_at':Date.now()}).then(function(insertnotification){
          return true;
          delete message;           
    }).catch(function(error){
      return true;
    });
    
        })
    }).catch(function(error){
      return true;
      });
    }).catch(function(error){
      //console.log("function error"+error);
      return true;
      });
      }else{
        return true;
      }
}).catch(function(error){
  //console.log("function error"+error);
  return true;
  });

}).catch(function(error){
  return true;
  });
return true; 
}
exports.getNotifications= function(req,res)
{
  const notifications= db.get('notifications');
  notifications.aggregate([
    {"$match":{ "publish_at": {"$lte": Date.now() },'userid': req.body.userid,'status':true}},
    {"$sort": {"publish_at": -1}},
  {
    $lookup:
    {
               from: "users",
               localField: "createdby",
               foreignField: "unique_id",
               as: "userdetail"
    }
},
{ "$unwind": "$userdetail" },
]).then(function(notifications){
    res.json(notifications);
  }).catch(function(error){
    res.json('error');
  });

}
exports.getScheduledNotifications= function(req,res)
{
  const notifications= db.get('notifications');
  notifications.aggregate([
    {"$match":{ "publish_at": {"$lte": Date.now() },'userid': req.body.userid,'status':true}},
    {"$sort": {"publish_at": -1}},
  {
    $lookup:
    {
               from: "users",
               localField: "createdby",
               foreignField: "unique_id",
               as: "userdetail"
    }
},
{ "$unwind": "$userdetail" },
    { "$project": {
        "_id":1,
        "created_at":1,
        "publish_at":1,
        "content":1,
        "weburl":1,
        "targetid":1,
        "childtargetid":1,
        "status":1,
        "visited":1,
        "notification_type":1,
        "asynccheck":1,
        "dummyname":1,
        "dummyprofile":1,
        "userdetail.unique_id":1,
        "userdetail.firstname":1,
        "userdetail.lastname":1, 
        "userdetail.profile":1    

    } 
}
]).then(function(notifications){
    res.json(notifications);
  }).catch(function(error){
    res.json('error');
  });

}
exports.RemoveNotifications= function(req,res)
{
  const notifications= db.get('notifications');
  notifications.findOneAndUpdate({ '_id': req.body.id},{$set:{'status':false}});
  res.json({'status':200});
}
//**********************************************************************************************************************************************************************
exports.ClearoldNotifications= function()
{
  cron.schedule('* * * * *', () => {
  var pastdate=(Date.now()-(1 * 24 * 60 * 60 * 1000))/1000;
 // res.json({'status':pastdate});
  console.log(pastdate);
  const notifications= db.get('notifications');
  notifications.remove({'publish_at':{'$lte':pastdate}});
  //res.json({'status':200});
  console.log('hello');
});
}

exports.ClearNotifications= function(req,res)
{
  const notifications= db.get('notifications');
  notifications.remove({ 'userid': req.body.userid,'publish_at':{'$lte':Date.now()}});
  res.json({'status':200});
}

//***************************************************************************************************************************************************************
exports.NotificationSeen= function(req,res)
{
  const notifications= db.get('notifications');
  notifications.findOneAndUpdate({ '_id': req.body.id},{$set:{'visited':true}});
  res.json({'status':200});
}
//***************************************************************************************************************************************************************

exports.getUnseenNotifications= function(req,res)
{
  const notifications= db.get('notifications');
  var fortnightAway = Date.now() - 12096e5;
  notifications.find({ "publish_at": {"$lte": Date.now(),"$gte":fortnightAway},'userid': req.body.userid,'status':true,'visited':false}
).then(function(notifications){
    res.json(notifications.length);
  }).catch(function(error){
    res.json(0);
  });

}


//***************************************************************************************************************************************************************