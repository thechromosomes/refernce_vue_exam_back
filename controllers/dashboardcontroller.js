console.log// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');
const moment = require('moment');
var ObjectId=require('mongodb').ObjectID;

exports.getActiveuserdashdata = function(req,res)
{
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  todaycurdate=curdate.getTime()-19800000;
  var date = new Date();
var weekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const community_logs= db.get('community_logs');
    var counter = -1;
    var question_answerfinal=[{'today':0,'week':0,'month':0,'total':0}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        community_logs.distinct("userid",{"module" : "login",'created_at': {'$gte':todaycurdate}}).then(function(gettoday){
          question_answerfinal[counter]['today']= gettoday.length;
          community_logs.distinct("userid",{"module" : "login",'created_at': {'$gte':weekdate}}).then(function(getweek){
            question_answerfinal[counter]['week']= getweek.length;
            community_logs.distinct("userid",{"module" : "login" ,'created_at': {'$gte':monthdate}}).then(function(getmonth){
              question_answerfinal[counter]['month']= getmonth.length;
              community_logs.distinct("userid",{"module" : "login"}).then(function(getmonth){
                question_answerfinal[counter]['total']= getmonth.length;
                next();
              }).catch(function(error){
      next();
              });
            }).catch(function(error){
    next();
            });
          }).catch(function(error){
  next();
          });
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}

exports.getMostactiveusers = function(req,res)
{
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  todaycurdate=curdate.getTime()-19800000;
  var date = new Date();

var weekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
//console.log(weekdate);
//var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const community_logs= db.get('community_logs');
     community_logs.aggregate([
       {"$match":{"module" : "login","created_at":{$gte:weekdate}}},
       {"$group" : {_id:{userid:"$userid"}, count:{$sum:1}}},
       {
        $lookup:
        {
                   from: "users",
                   as: "userdetail",
                   let: { userid: '$_id.userid' },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ['$unique_id', '$$userid'] },
                  { $ne: ['$role', 1] },
                ]
              }
            }
          }
        ]
        }
    },
    { "$unwind": "$userdetail" },
    {"$sort":{"count" : -1}},
    {"$limit":10}
      ]).then(function(getmostactiveusers){
               res.json(getmostactiveusers);
              }).catch(function(error){
                //console.log(error);
res.json([]);
              });



}
exports.getMostcomments = function(req,res)
{
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  todaycurdate=curdate.getTime()-19800000;
  var date = new Date();
var weekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
//var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const comments= db.get('comments');
  const questions= db.get('questions');
  comments.aggregate([
    {"$group" : {_id:{postid:"$postid"}, count:{$sum:1}}},{"$sort":{"count" : -1}},
  {$lookup:
    {
               from: "posts",
               localField: "_id.postid",
               foreignField: "unique_id",
               as: "postdetail"
    }},
    { "$unwind": "$postdetail" },
    {$lookup:
      {
                 from: "users",
                 localField: "postdetail.created_by",
                 foreignField: "unique_id",
                 as: "usersdetail"
      }},
      { "$unwind": "$usersdetail" },
    ]).then(function(getmostcomments)
    {
      var counter=-1;
      asyncLoop(getmostcomments, function (commentitem, next)
      {
        counter++;
        getmostcomments[counter]['quesdetail']= null;
        if(commentitem.postdetail.questionid!=null || commentitem.postdetail.questionid!="")
        {
          questions.findOne({'_id':ObjectId(commentitem.postdetail.questionid) }).then(function(getquesstatus)
          {
            getmostcomments[counter]['quesdetail']= getquesstatus;
            next();
          }).catch(function(error){
              next();
            });
        }
      }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
            }
            res.json(getmostcomments);
        });
    }).catch(function(error){
                //console.log(error);
res.json([]);
              });
}
exports.getMostviews = function(req,res)
{
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  todaycurdate=curdate.getTime()-19800000;
  var date = new Date();
  var weekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
  //var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const question_views= db.get('question_views');
  const questions= db.get('questions');
  question_views.aggregate([
    {"$group" : {_id:{questionid:"$questionid"}, count:{$sum:1}}},
    {"$sort":{"count" : -1}}
  ]).then(function(getmostviews)
  {
    // res.json(getmostviews);
    var counter=-1;
    asyncLoop(getmostviews, function (commentitem, next)
    {
      counter++;
      // //console.log('commentitem-',commentitem);
      getmostviews[counter]['quesdetail']= null;
      if(commentitem._id.questionid!=null || commentitem._id.questionid!="")
      {
        //console.log(commentitem._id.questionid);
        questions.findOne({'_id':commentitem._id.questionid}).then(function(getquesstatus)
        {
           //console.log('getquesstatus-',getquesstatus);
          getmostviews[counter]['quesdetail']= getquesstatus;
          next();
        }).catch(function(error){
          //console.log(error);
            next();
          });
      }
    }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
        }
        res.json(getmostviews);
      });
  }).catch(function(error){
      //console.log(error);
      res.json([]);
    });
}
exports.getMostanswers = function(req,res)
{
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  todaycurdate=curdate.getTime()-19800000;
  var date = new Date();
  var weekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
  //var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const question_answers= db.get('question_answers');
  const questions= db.get('questions');
  question_answers.aggregate([
    {"$group" : {_id:{questionid:"$questionid"}, count:{$sum:1}}},
    {"$sort":{"count" : -1}}
    // { "$addFields": { "newquesid": { "$toObjectId": "$_id.questionid" }}},
    //  {$lookup:
    //   {
    //              from: "questions",
    //              localField: "_id.questionid",
    //              foreignField: {"$toString":"_id"},
    //              as: "postdetail"
    //   }},
    //   { "$unwind": "$postdetail" },
    //   {$lookup:
    //     {
    //                from: "users",
    //                localField: "postdetail.created_by",
    //                foreignField: "unique_id",
    //                as: "usersdetail"
    //     }},
    //     { "$unwind": "$usersdetail" },
  ]).then(function(getmostviews)
  {
    // res.json(getmostviews);
    var counter=-1;
    asyncLoop(getmostviews, function (commentitem, next)
    {
      counter++;
      // //console.log('commentitem-',commentitem);
      getmostviews[counter]['quesdetail']= null;
      if(commentitem._id.questionid!=null || commentitem._id.questionid!="")
      {
        questions.findOne({'_id':ObjectId(commentitem._id.questionid) }).then(function(getquesstatus)
        {
          // //console.log('getquesstatus-',getquesstatus);
          getmostviews[counter]['quesdetail']= getquesstatus;
          next();
        }).catch(function(error){
            next();
          });
      }
    }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
        }
        res.json(getmostviews);
      });
  }).catch(function(error){
      //console.log(error);
      res.json([]);
    });
}
exports.getStoppedactiveusers = function(req,res)
{
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  todaycurdate=curdate.getTime()-19800000;
  var date = new Date();
var weekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
var lastweekdate = (new Date(date.getTime() - (14 * 24 * 60 * 60 * 1000))).getTime();
//var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const community_logs= db.get('community_logs');
  const users= db.get('users');
     community_logs.distinct('userid',{"module" : "login","created_at":{$gte:weekdate}}).then(function(getthisweekactiveusers){

      community_logs.distinct('userid',{"module" : "login","created_at":{$lte:weekdate,$gte:lastweekdate}}).then(function(getlastweekactiveusers){

        var dddd=getthisweekactiveusers.length;
        var i=0;
        for(i;i<getthisweekactiveusers.length;i++){
        if(getlastweekactiveusers.indexOf(getthisweekactiveusers[i])>=0){
          getlastweekactiveusers.splice(getlastweekactiveusers.indexOf(getthisweekactiveusers[i]), 1)
        }
        }
        //var arrdata={"currentweek":getthisweekactiveusers,"lastweek":getlastweekactiveusers,"finalarray":dddd}
        //var myJSON = JSON.parse(JSON.stringify(getlastweekactiveusers));
        users.find({"unique_id":{$in:getlastweekactiveusers}}).then(function(getfinalusers){
res.json(getfinalusers);
         }).catch(function(error){
           //console.log(error);
  res.json([]);
         });
       }).catch(function(error){
         //console.log(error);
res.json([]);
       });
              }).catch(function(error){
                //console.log(error);
res.json([]);
              });

// var curdate=new Date(new Date().setHours(0, 0, 0, 0));
//   todaycurdate=curdate.getTime()-19800000;
//   var date = new Date();
// var weekdate = (new Date(date.getTime() - (14 * 24 * 60 * 60 * 1000))).getTime();
// //var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
//   const community_logs= db.get('community_logs');
//      community_logs.aggregate([
//        {"$match":{"module" : "login","created_at":{$gte:weekdate}}},
//        {"$group" : {_id:{userid:"$userid"}, count:{$sum:1}}},
//        {
//         $lookup:
//         {
//                    from: "users",
//                    localField: "_id.userid",
//                    foreignField: "unique_id",
//                    as: "userdetail"
//         }
//     },
//     { "$unwind": "$userdetail" },
//     {"$sort":{"count" : 1}},
//     {"$limit":100}
//       ]).then(function(getmostactiveusers){
//                res.json(getmostactiveusers);
//               }).catch(function(error){
//                 //console.log(error);
// res.json([]);
//               });

}
exports.getStudyplandashdata = function(req,res)
{
  const studyplan_duedates= db.get('studyplan_duedates');
  const studyplan_views= db.get('studyplan_views');
  const notes= db.get('notes');
  const studyplan_topicreminders= db.get('studyplan_topicreminders');


    var counter = -1;
    var question_answerfinal=[{'usercount':0,'completecount':0,'notecount':0,'remindercount':0,}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        studyplan_views.find({}).then(function(getuserviews){
          question_answerfinal[counter]['usercount']= getuserviews.length;
          studyplan_duedates.find({"chkbox_status":1}).then(function(getcompletecount){
            question_answerfinal[counter]['completecount']= getcompletecount.length;
            notes.find({}).then(function(getnotes){
              question_answerfinal[counter]['notecount']= getnotes.length;
              studyplan_topicreminders.find({'remindme_sdate': {'$gte':Date.now()}}).then(function(getreminders){
                question_answerfinal[counter]['remindercount']= getreminders.length;
      next();
              }).catch(function(error){
      next();
              });
            }).catch(function(error){
    next();
            });
          }).catch(function(error){
  next();
          });
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}
exports.getSBAQuestiondashdata = function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');
  const question_views= db.get('question_views');


    var counter = -1;
    var question_answerfinal=[{'count':0,'answercount':0,'visitcount':0}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        questions.find({'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(getquestions){

          question_answerfinal[counter]['count']= getquestions.length;
          var counter1 = -1;
          asyncLoop(getquestions, function (question, next1)
          {
              //console.log('loop');
              counter1++;
              question_answers.find({'questionid':question._id.toString()}).then(function(getquestionanswers){
                question_answerfinal[counter]['answercount'] += getquestionanswers.length;

                question_views.find({'questionid':question._id.toString()}).then(function(getquestionviews){
                  question_answerfinal[counter]['visitcount'] += getquestionviews.length;

          next1();
                }).catch(function(error){
        next1();
                });
              }).catch(function(error){
      next1();
              });


          }, function (err)
              {
                  if (err)
                  {
                      console.error('Inner Error: ' + err.message);
                      // return;
                  }
                  //res.json(question_answerfinal);
                  next();
              });


  //next();
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}
exports.getKFPQuestiondashdata = function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');
  const question_views= db.get('question_views');


    var counter = -1;
    var question_answerfinal=[{'count':0,'answercount':0,'visitcount':0}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        questions.find({'publish':1,'questiontype':'5d15fea98edfed6c417592d9'}).then(function(getquestions){

          question_answerfinal[counter]['count']= getquestions.length;
          var counter1 = -1;
          asyncLoop(getquestions, function (question, next1)
          {
              //console.log('loop');
              counter1++;
              question_answers.find({'questionid':question._id.toString()}).then(function(getquestionanswers){
                question_answerfinal[counter]['answercount'] += getquestionanswers.length;

                question_views.find({'questionid':question._id.toString()}).then(function(getquestionviews){
                  question_answerfinal[counter]['visitcount'] += getquestionviews.length;

          next1();
                }).catch(function(error){
        next1();
                });
              }).catch(function(error){
      next1();
              });


          }, function (err)
              {
                  if (err)
                  {
                      console.error('Inner Error: ' + err.message);
                      // return;
                  }
                  //res.json(question_answerfinal);
                  next();
              });


  //next();
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}
exports.getCASEQuestiondashdata = function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');

  const case_comments= db.get('case_comments');
  const question_views= db.get('question_views');


    var counter = -1;
    var question_answerfinal=[{'count':0,'answercount':0,'visitcount':0}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        questions.find({'publish':1,'questiontype':'5d15fea98edfed6c417592d14'}).then(function(getquestions){

          question_answerfinal[counter]['count']= getquestions.length;
          var counter1 = -1;
          asyncLoop(getquestions, function (question, next1)
          {
              //console.log('loop');
              counter1++;
              question_answers.find({'questionid':question._id.toString()}).then(function(getcasequestionanswers)
              {
                //console.log('q_id1-',question._id.toString())
                //console.log('case1-',getcasequestionanswers)

                question_answerfinal[counter]['answercount'] += getcasequestionanswers.length;
                question_views.find({'questionid':question._id.toString()}).then(function(getquestionviews){
                  question_answerfinal[counter]['visitcount'] += getquestionviews.length;
             case_comments.find({'parentid':null, 'parentqid':question._id.toString()}).then(function(getcasecomments)
                {
                  //console.log('case2-',getcasecomments)
                 // var finalcount = getcasequestionanswers.length+getcasecomments.length;
                  question_answerfinal[counter]['answercount'] += getcasecomments.length;
                  next1();
                }).catch(function(error){
                  next1();
                });
                }).catch(function(error){
                    next1();
                  });
              }).catch(function(error){
                    next1();
                });


          }, function (err)
              {
                  if (err)
                  {
                      console.error('Inner Error: ' + err.message);
                      // return;
                  }
                  //res.json(question_answerfinal);
                  next();
              });


  //next();
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}
exports.getArticledashdata = function(req,res)
{
  const article_views= db.get('article_views');
  article_views.find({}).then(function(getquestions){
         res.send({'count':getquestions.length});
        }).catch(function(error){
          res.send({'count':0});
        });

}
//****************************************************************************

exports.getActiveuserDaysdata = function(req,res)
{
  const community_logs= db.get('community_logs');

  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  var enddate=new Date(new Date().setHours(23, 59, 59, 999));
  var question_answerfinal=[]

  for (var i = 0; i <= 6; i++)
  {
    //console.log('*********************'+i+'**********************************')
    startdate = curdate.setDate(curdate.getDate() - i);
    //console.log('startdate-',startdate)
    enddate = new Date(new Date(startdate).setHours(23, 59, 59, 999));;
    //console.log('enddate-',enddate.getTime())

    community_logs.distinct("userid",{"module" : "login",'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(gettoday)
    {
        question_answerfinal=gettoday.length;
        //console.log('active-', question_answerfinal)
    });
  }
  //console.log('finalactive-', question_answerfinal)
  res.json(question_answerfinal);
}

exports.getChangeActiveuserdashdata = function(req,res)
{
  var startcurdate=new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  var endcurdate=(new Date(new Date(new Date().setHours(23, 59, 59, 0)).getTime()-(24 * 60 * 60 * 1000))).getTime();
  //res.json(startcurdate+' '+endcurdate);
  //todaycurdate=curdate.getTime();
  var date = new Date();
  var startweekdate = (new Date(date.getTime() - (14 * 24 * 60 * 60 * 1000))).getTime();
var startmonthdate = (new Date(date.getTime() - (60 * 24 * 60 * 60 * 1000))).getTime();
var endweekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
var endmonthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const community_logs= db.get('community_logs');
    var counter = -1;
    var question_answerfinal=[{'today':0,'week':0,'month':0,'total':0}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        community_logs.distinct("userid",{"module" : "login",'created_at': {'$gte':startcurdate,'$lt':endcurdate}}).then(function(gettoday){
          //res.json(gettoday);
          question_answerfinal[counter]['today']= gettoday.length;
          community_logs.distinct("userid",{"module" : "login",'created_at': {'$gte':startweekdate,'$lt':endweekdate}}).then(function(getweek){
            question_answerfinal[counter]['week']= getweek.length;
            community_logs.distinct("userid",{"module" : "login" ,'created_at': {'$gte':startmonthdate,'$lt':endmonthdate}}).then(function(getmonth){
              question_answerfinal[counter]['month']= getmonth.length;
              community_logs.distinct("userid",{"module" : "login"}).then(function(getmonth){
                question_answerfinal[counter]['total']= getmonth.length;
                next();
              }).catch(function(error){
                //console.log(error);
      next();
              });
            }).catch(function(error){
              //console.log(error);
    next();
            });
          }).catch(function(error){
            //console.log(error);
  next();
          });
        }).catch(function(error){
          //console.log(error);
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}

exports.getactiveuserweekincrement = function(req,res)
{
  const community_logs= db.get('community_logs');
  community_logs.aggregate([
    {$match:{"module" : "login"}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}}}  },
    {"$group" : {_id:{week:"$week",userid:"$userid"}, count:{$sum:1}}},
     { "$project": {
       "week":1,
       "count":1,
   },
},
{$sort:{"_id.week" : -1}}
   ]).then(function(userdatas){
    //res.json(userdatas);
     var counter=-1;
     var labeldata=[];
     var countdata=[];
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
if(labeldata.indexOf(userdata._id.week)<0){
  labeldata.push(userdata._id.week);
  countdata[labeldata.indexOf(userdata._id.week)]=1;
}else{
  countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
}

     // countdata.push(userdata.count);
     next();
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            var finaldata=countdata[1]-countdata[2];
            var finalsum=countdata[2];
            res.json({'result':(finaldata*100/finalsum).toFixed(2)});
           //res.json({'labels':labeldata,'countdata':countdata});
        });
    }).catch(function(error){
res.json([])
    });
}
//SBA/MCQ monthly average data
exports.getsbamcqmonthlyavrg = function(req,res)
{
  const questions= db.get('questions');
  questions.aggregate([
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}}}  },
    {"$group" : {_id:{week:"$week",userid:"$userid"}, count:{$sum:1}}},
     { "$project": {
       "week":1,
       "count":1,
   },
},
{$sort:{"_id.week" : -1}}
   ]).then(function(userdatas){
   // res.json(userdatas);
     var counter=-1;
     var labeldata=[];
     var countdata=[];
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
if(labeldata.indexOf(userdata._id.week)<0){
  labeldata.push(userdata._id.week);
  countdata[labeldata.indexOf(userdata._id.week)]=1;
}else{
  countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
}

     // countdata.push(userdata.count);
     next();
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            var finaldata=countdata[1]-countdata[2];
            var finalsum=countdata[2];
            res.json({'result':(finaldata*100/finalsum).toFixed(2)});
           //res.json({'labels':labeldata,'countdata':countdata});
        });
    }).catch(function(error){
res.json([])
    });
}
exports.getsbamcqanswermonthlyavrg = function(req,res)
{
  const question_answers= db.get('question_answers');
  question_answers.aggregate([
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}}}  },
    {"$group" : {_id:{week:"$week",userid:"$userid"}, count:{$sum:1}}},
     { "$project": {
       "week":1,
       "count":1,
   },
},
{$sort:{"_id.week" : -1}}
   ]).then(function(userdatas){
    //res.json(userdatas);
     var counter=-1;
     var labeldata=[];
     var countdata=[];
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
if(labeldata.indexOf(userdata._id.week)<0){
  labeldata.push(userdata._id.week);
  countdata[labeldata.indexOf(userdata._id.week)]=1;
}else{
  countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
}

     // countdata.push(userdata.count);
     next();
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            var finaldata=countdata[1]-countdata[2];
            var finalsum=countdata[2];
            res.json({'result':(finaldata*100/finalsum).toFixed(2)});
           //res.json({'labels':labeldata,'countdata':countdata});
        });
    }).catch(function(error){
res.json([])
    });
}

exports.getactiveuserweekchurnrate = function(req,res)
{
    const community_logs= db.get('community_logs');
  community_logs.aggregate([
    {$match:{"module" : "login"}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}}}  },
    {"$group" : {_id:{week:"$week"}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
     { "$project": {
       "week":1,
       "count":1,
       "daydate":1,
   },
},
{$sort:{"daydate" : -1}}
   ]).then(function(userdatas){
    // console.log(userdatas);
    res.json({'result':((userdatas[2].count - userdatas[1].count)/(userdatas[2].count)).toFixed(2)});
    //res.json(userdatas);
     var counter=-1;
     var labeldata=[];
     var countdata=[];
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
if(labeldata.indexOf(userdata._id.week)<0){
  labeldata.push(userdata._id.week);
  countdata[labeldata.indexOf(userdata._id.week)]=[userdata._id.userid];
}else{
  if(countdata[labeldata.indexOf(userdata._id.week)].indexOf(userdata._id.userid)<0){
  countdata[labeldata.indexOf(userdata._id.week)].push(userdata._id.userid);
  }
}

     // countdata.push(userdata.count);
     next();
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            var finaldata=countdata[0];
            var i=0;
            var commenthisweek=[];
            for(i=0;i<countdata[1].length;i++){
           if(countdata[1].indexOf(countdata[2][i]) >0 ){
            commenthisweek.push(countdata[2][i]);
           }
            }
           // var finalsum=countdata[0].length+countdata[1].length;
           // res.json(exports.getDateFromWeek(44,2019)+' '+exports.getDateToWeek(44,2019));
         //   res.json({'result':((countdata[1].length - countdata[0].length)*100/(countdata[1].length + countdata[0].length)).toFixed(2)});
            //res.json({'labels':commenthisweek,'countdata':countdata});
        });
    }).catch(function(error){
     // console.log(error);
res.json([]);
    });
}

exports.getDateFromWeek = function(week, year) {
  return moment().day("Sunday").year(year).week(week).format('DD MMM');
}
exports.getDateToWeek = function(week, year) {
  return moment().day("Saturday").year(year).week(week).format('DD MMM');
}
exports.getChangeStudyplandashdata = function(req,res)
{
  const studyplan_duedates= db.get('studyplan_duedates');
  const studyplan_views= db.get('studyplan_views');
  const notes= db.get('notes');
  const studyplan_topicreminders= db.get('studyplan_topicreminders');


    var counter = -1;
    var question_answerfinal=[{'usercount':0,'completecount':0,'notecount':0,'remindercount':0,}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        studyplan_views.find({}).then(function(getuserviews){
          question_answerfinal[counter]['usercount']= getuserviews.length;
          studyplan_duedates.find({"chkbox_status":1}).then(function(getcompletecount){
            question_answerfinal[counter]['completecount']= getcompletecount.length;
            notes.find({}).then(function(getnotes){
              question_answerfinal[counter]['notecount']= getnotes.length;
              studyplan_topicreminders.find({'remindme_sdate': {'$gte':Date.now()}}).then(function(getreminders){
                question_answerfinal[counter]['remindercount']= getreminders.length;
      next();
              }).catch(function(error){
      next();
              });
            }).catch(function(error){
    next();
            });
          }).catch(function(error){
  next();
          });
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });
}
exports.getChangeSBAQuestiondashdata = function(req,res)
{

  var startcurdate=new Date(new Date().setHours(0, 0, 0, 0)).getTime();
  var endcurdate=(new Date(new Date(new Date().setHours(23, 59, 59, 0)).getTime()-(24 * 60 * 60 * 1000))).getTime();
  // res.json(startcurdate+' '+endcurdate);
  //todaycurdate=curdate.getTime();
  var date = new Date();
  var startweekdate = (new Date(date.getTime() - (14 * 24 * 60 * 60 * 1000))).getTime();
  var startmonthdate = (new Date(date.getTime() - (60 * 24 * 60 * 60 * 1000))).getTime();

  var endweekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
  var endmonthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const questions= db.get('questions');
  var counter = -1;
  var question_answerfinal=[{'count':0,'answercount':0,'visitcount':0}]
  asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
  {
    //console.log('loop');
    counter++;
    questions.find({'publish':1,'created_at': {'$gte':startweekdate,'$lt':endweekdate},'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14','5d15fea98edfed6c417592d14'] }})
    .then(function(getquestions)
    {
      question_answerfinal[counter]['count']= getquestions.length;
      question_answers.find({'created_at': {'$gte':startweekdate,'$lt':endweekdate}})
      .then(function(getquestionanswers)
      {
        question_answerfinal[counter]['answercount'] += getquestionanswers.length;
        question_views.find({'created_at': {'$gte':startweekdate,'$lt':endweekdate},})
        .then(function(getquestionviews)
        {
            question_answerfinal[counter]['visitcount'] += getquestionviews.length;
            next();
        }).catch(function(error){
            next();
          });
      }).catch(function(error){
          next();
        });
    }).catch(function(error){
        next();
      });
  }, function (err)
  {
    if (err)
    {
      console.error('Inner Error: ' + err.message);
    }
    res.json(question_answerfinal);
  });
}

exports.getChangeKFPQuestiondashdata = function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');
  const question_views= db.get('question_views');


    var counter = -1;
    var question_answerfinal=[{'count':0,'answercount':0,'visitcount':0}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        questions.find({'publish':1,'questiontype':'5d15fea98edfed6c417592d9'}).then(function(getquestions){

          question_answerfinal[counter]['count']= getquestions.length;
          var counter1 = -1;
          asyncLoop(getquestions, function (question, next1)
          {
              //console.log('loop');
              counter1++;
              question_answers.find({'questionid':question._id.toString()}).then(function(getquestionanswers){
                question_answerfinal[counter]['answercount'] += getquestionanswers.length;

                question_views.find({'questionid':question._id.toString()}).then(function(getquestionviews){
                  question_answerfinal[counter]['visitcount'] += getquestionviews.length;

          next1();
                }).catch(function(error){
        next1();
                });
              }).catch(function(error){
      next1();
              });


          }, function (err)
              {
                  if (err)
                  {
                      console.error('Inner Error: ' + err.message);
                      // return;
                  }
                  //res.json(question_answerfinal);
                  next();
              });


  //next();
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}
exports.getChangeCASEQuestiondashdata = function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');

  const case_comments= db.get('case_comments');
  const question_views= db.get('question_views');


    var counter = -1;
    var question_answerfinal=[{'count':0,'answercount':0,'visitcount':0}]
    asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
    {
        //console.log('loop');
        counter++;
        questions.find({'publish':1,'questiontype':'5d15fea98edfed6c417592d14'}).then(function(getquestions){

          question_answerfinal[counter]['count']= getquestions.length;
          var counter1 = -1;
          asyncLoop(getquestions, function (question, next1)
          {
              //console.log('loop');
              counter1++;
              question_answers.find({'questionid':question._id.toString()}).then(function(getcasequestionanswers)
              {
                //console.log('q_id1-',question._id.toString())
                //console.log('case1-',getcasequestionanswers)

                question_answerfinal[counter]['answercount'] += getcasequestionanswers.length;
                question_views.find({'questionid':question._id.toString()}).then(function(getquestionviews){
                  question_answerfinal[counter]['visitcount'] += getquestionviews.length;
             case_comments.find({'parentid':null, 'parentqid':question._id.toString()}).then(function(getcasecomments)
                {
                  //console.log('case2-',getcasecomments)
                 // var finalcount = getcasequestionanswers.length+getcasecomments.length;
                  question_answerfinal[counter]['answercount'] += getcasecomments.length;
                  next1();
                }).catch(function(error){
                  next1();
                });
                }).catch(function(error){
                    next1();
                  });
              }).catch(function(error){
                    next1();
                });


          }, function (err)
              {
                  if (err)
                  {
                      console.error('Inner Error: ' + err.message);
                      // return;
                  }
                  //res.json(question_answerfinal);
                  next();
              });


  //next();
        }).catch(function(error){
next();
        });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(question_answerfinal);
        });


}
exports.getChangeArticledashdata = async function(req,res)
{
  const article_views= db.get('article_views');

    let protoDate = new Date().getTime()
    let currenDate = protoDate - (7* 24 * 60 * 60 * 1000);
    let lastWeekDate = protoDate - (21* 24 * 60 * 60 * 1000);
    let middleDate = protoDate - (14* 24 * 60 * 60 * 1000);

    let getquestions = await article_views.find({});
    let questionTypeKFPData = await article_views.aggregate([
      {$match : {"created_at":{"$gte":lastWeekDate, "$lte" :currenDate}} },
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
         {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
         { "$project":
          {
            "week":1,
            "count":1,
            "dayOfWeek": 1,
          },
        },
        {$sort:{"_id.week" : 1}}
    ])
    let incOrDec
    if(questionTypeKFPData.length > 0){
      if(questionTypeKFPData.length < 2){
        var weeknumber = moment(middleDate).week();
        if (questionTypeKFPData[0]._id.week >= weeknumber){
            incOrDec = 100
        }else {
          incOrDec = 0
        }
      } else{
        let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
        let calculation =  ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
        if (calculation > 100){
          incOrDec = 100
        }else {
          incOrDec = calculation
        }
      }
    } else {
      incOrDec = 0
    }

    var currentDate = new Date()
    var lastWeekDate2 = new Date()
    currentDate.setDate(1);
    lastWeekDate2.setDate(1);
    currentDate.setMonth(currentDate.getMonth()).valueOf();
    lastWeekDate2.setMonth(lastWeekDate2.getMonth()-2).valueOf();

    let endDate = currentDate.valueOf();
    let startDate = lastWeekDate2.valueOf();
    let endMonth = currentDate.getMonth();

    let questionTypeKFPData2 = await article_views.aggregate([
      {"$match":{"created_at":{"$gt":startDate, "$lt" :endDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}},'year': {$year:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month", year:"$year"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,
        "year":1
       },
      },
      {$sort:{"_id.year" : 1 , "_id.month" : 1}}
    ])

    let MonthDataViews
    if(questionTypeKFPData2.length > 0){
      if(questionTypeKFPData2.length == 1 && questionTypeKFPData2[0]._id.month == endMonth){
        MonthDataViews = 100
      } else if(questionTypeKFPData2.length ==2 ){
        let toCompare = Math.round(questionTypeKFPData2[1].count-questionTypeKFPData2[0].count)
        MonthDataViews = ((toCompare*100)/questionTypeKFPData2[0].count).toFixed(2)
      } else{
        MonthDataViews = 0
      }
    } else {
      MonthDataViews = 0
    }

    res.send({'count':getquestions.length , incOrDec, MonthDataViews});
}
//****************************************************************************

exports.getChangeActiveuserDaysdata = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    //var days = Math.floor((req.body.endDate-req.body.startDate)/1000/60/60/24);
var days=(dateended-datestarted)/(1000*3600*24);
//console.log('days',days);
for (var i=0; i<=days; i++) {
  var d = new Date(req.body.endDate);
  d.setDate(d.getDate() - i);
  countdata.push(0);
  daydatas.push(d.getTime());
  labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
}
  }else{
  for (var i=0; i<14; i++) {
      var d = new Date(new Date().setHours(0, 0, 0, 0));
      d.setDate(d.getDate() - i);
      countdata.push(0);
      daydatas.push(d.getTime());
      labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
  }}
//res.json({'labels':labeldata});
  const community_logs= db.get('community_logs');
    var counter=-1;
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);
    community_logs.distinct("userid",{"module" : "login",'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(userdatas){
      //console.log('check in'+labelday+'hhhhhh'+userdatas.length);
      countdata[counter]=userdatas.length;
      next();
    }).catch(function(error){
      next();
    });
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
}
exports.getChangeActiveuserDayschurndata = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  // for (var i=0; i<14; i++) {
  //     var d = new Date(new Date().setHours(0, 0, 0, 0));
  //     d.setDate(d.getDate() - i);
  //     countdata.push(0);
  //     daydatas.push(d.getTime());
  //     labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
  // }
  if(req.body.startDate!==null && req.body.endDate){
    var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    //console.log('days',days);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  const community_logs= db.get('community_logs');
    var counter=-1;
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);
    community_logs.distinct("userid",{"module" : "login",'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(userdatas){
      //console.log('churnrate ');
      countdata[counter]=userdatas.length;
      next();
    }).catch(function(error){
      next();
    });
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
}
exports.getChangeActiveuserMonthdata = function(req,res)
{
  var newstartDate =Number(req.body.startDate)
      var newendDate =Number(req.body.endDate)
      //console.log("newstartDate",newstartDate)
      //console.log("newendDate",newendDate)
    if(req.body.startDate!==null && req.body.endDate!==null)
    {
      var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const community_logs= db.get('community_logs');
      community_logs.aggregate([
        {$match:{"module" : "login",'created_at': {'$gte':newstartDate,'$lte':newendDate}}},
        { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
        {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
         { "$project": {
           "month":1,
           "daydate":1,
           "count":1,

       }
    },
    {$sort:{"daydate":1}}
       ]).then(function(userdatas){
        // res.json(userdatas)
         var counter=-1;
         var labeldata=[];
         var countdata=[];
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          labeldata.push(months[userdata._id.month]);
          countdata.push(userdata.count);
         next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata,'countdata':countdata});
            });
          //res.json(userdatas)
        }).catch(function(error){
    res.json(error)
        });
    }else{
      var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const community_logs= db.get('community_logs');
      community_logs.aggregate([
        {$match:{"module" : "login"}},
        { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
        {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
         { "$project": {
           "month":1,
           "daydate":1,
           "count":1,

       }
    },
    {$sort:{"daydate":1}}
       ]).then(function(userdatas){
        // res.json(userdatas)
         var counter=-1;
         var labeldata=[];
         var countdata=[];
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          labeldata.push(months[userdata._id.month]);
          countdata.push(userdata.count);
         next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata,'countdata':countdata});
            });
          //res.json(userdatas)
        }).catch(function(error){
    res.json(error)
        });
    }


  }

// to refactor above api
// exports.getChangeActiveuserMonthdata = async function(req,res)
//   {
//     const PerMonthData= db.get('per_month_data');
//     let labels = [];
//     let countdata = [];
//     let monthData = await PerMonthData.find({});
//     for (let item of monthData){
//       labels.push(item.month)
//       countdata.push(item.totalCount)
//     }
//     res.send({labels, countdata});
//   }

  exports.getChangeActiveuserMonthchurndata = function(req,res)
{
  var newstartDate =Number(req.body.startDate)
      var newendDate =Number(req.body.endDate)
      //console.log("newstartDate",newstartDate)
      //console.log("newendDate",newendDate)
    if(req.body.startDate!==null && req.body.endDate!==null)
    {
      var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const community_logs= db.get('community_logs');
      community_logs.aggregate([
        {$match:{"module" : "login",'created_at': {'$gte':newstartDate,'$lte':newendDate}}},
        { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
        {"$group" : {_id:{month:"$month"}, count:{$sum:1}}},
         { "$project": {
           "month":1,
           "count":1,

       }
    },
    {$sort:{"_id.month" : 1}}
       ]).then(function(userdatas){
         var counter=-1;
         var labeldata=[];
         var countdata=[];
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          labeldata.push(months[userdata._id.month]);
          countdata.push(userdata.count);
         next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }

                res.json({'labels':labeldata,'countdata':countdata});
            });
          //res.json(userdatas)
        }).catch(function(error){
    res.json([])
        });
    }else{

  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const community_logs= db.get('community_logs');
      community_logs.aggregate([
        {$match:{"module" : "login"}},
        { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
        {"$group" : {_id:{month:"$month"}, count:{$sum:1}}},
         { "$project": {
           "month":1,
           "count":1,

       }
    },
    {$sort:{"_id.month" : 1}}
       ]).then(function(userdatas){
         var counter=-1;
         var labeldata=[];
         var countdata=[];
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          labeldata.push(months[userdata._id.month]);
          countdata.push(userdata.count);
         next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }

                res.json({'labels':labeldata,'countdata':countdata});
            });
          //res.json(userdatas)
        }).catch(function(error){
    res.json([])
        });
    }

  }
//****************************************************************************************************************************************
  exports.getChangeActiveuserWeekdata = function(req,res)
  {
      var newstartDate =Number(req.body.startDate)
      var newendDate =Number(req.body.endDate)
      //console.log("newstartDate",newstartDate)
      //console.log("newendDate",newendDate)
    if(req.body.startDate!==null && req.body.endDate!==null)
    {
      var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const community_logs= db.get('community_logs');
      var labeldata=[];
      var countdata=[];
      var labeldatarng=[];

      //let now = new Date();
      var curyear1 = moment(newendDate).format('YYYY');
      var currweeknum=moment(newendDate).week();
      var oldweeknumber=moment(newstartDate).week();
      ////console.log('now-',now)
      ////console.log('moment-',moment(newendDate).week())
      //console.log('currweeknum-'+currweeknum+'last_currweeknum-'+oldweeknumber)

      if(moment(newendDate).week()>=moment(newstartDate).week()){
        var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
      }else{
        var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
      }
    //console.log('weekdiff',weekdiff);
      if((currweeknum-weekdiff)<=0)
      {
        var startweeknum=52-(weekdiff-currweeknum);
        var currweeknumold=currweeknum
        currweeknum=52;
        for(startweeknum;startweeknum<=currweeknum;startweeknum++)
        {
          labeldata.push(startweeknum);
          countdata.push(0);
          labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
          if(startweeknum==52){
            startweeknum=0;
            currweeknum=currweeknumold;
          }
        }
      }
      else
      {
        var startweeknum=currweeknum-weekdiff;
        for(startweeknum;startweeknum<=currweeknum;startweeknum++){
          labeldata.push(startweeknum);
          countdata.push(0);
          labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        }
      }

     // //console.log("labeldata",labeldata)
      community_logs.aggregate([
        {$match:{'module' : 'login','created_at': {'$gte':newstartDate,'$lte':newendDate}}},
        {$addFields:{'week':{$isoWeek:{$toDate:'$created_at'}}}},
        {'$group' : {_id:{week:'$week',userid:'$userid'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
        { '$project': { 'week':1,'count':1}},
        {$sort:{'_id.week' : 1}}
      ]).then(function(userdatas)
      {
        // res.json(userdatas);
        // //console.log('this is custom -',userdatas)
        var counter=-1;
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          var curyear = moment(userdata.daydate).format('YYYY');
          //res.json(curr);
          // get current date
          //var first = curr.getDate() - curr.getDay()+(curr.getDay() === 0 ? -6 : 1); // First day is the day of the month - the day of the week
          //var last = first + 6; // last day is the first day + 6
          ////console.log('curdate'+userdata.daydate+' '+curr.getDate()+'-'+curr.getDay()+'first='+first+'last'+last);
          //firstday = moment(curr.setDate(first)).format("DD MMM");
          //const curr1 = userdata.daydate;
          ////console.log('currentdate after set',curr1);

          //lastday = moment(curr1.setDate(last)).format("DD MMM");
          ////console.log('firstday',firstday);
          ////console.log('lastday',lastday);
          // if(labeldata.indexOf(firstday+' - '+lastday)<0){
          //   labeldata.push(firstday+' - '+lastday);
          //   countdata[labeldata.indexOf(firstday+' - '+lastday)]=1;
          // }else{
          //   countdata[labeldata.indexOf(firstday+' - '+lastday)]=countdata[labeldata.indexOf(firstday+' - '+lastday)]+1;
          // }
          // if(labeldata.indexOf(userdata._id.week)<0){
          //   labeldata.push(userdata._id.week);
          //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
          //     labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          //     }countdata[labeldata.indexOf(userdata._id.week)]=1;
          // }
                //  //console.log('userdata: ',userdata._id.week);
                 // //console.log('labeldatarng: ',labeldatarng);
          if(labeldata.indexOf(userdata._id.week)>=0)
          {

           // //console.log('if12345 ',labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear)));
            if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
              labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
            }
            countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          }
          // countdata.push(userdata.count);
          next();
        }, function (err)
        {
          if (err)
          {
                  console.error('Inner Error: ' + err.message);
                  return;
          }
        //  //console.log('labels-',labeldatarng);
          ////console.log('countdata-',countdata);
          labeldatarng.pop();
          countdata.pop();
          res.json({'labels':labeldatarng,'countdata':countdata});
        });
      }).catch(function(error){
          //console.log(error);
          res.json([])
        });
    }
    else
    {

  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const community_logs= db.get('community_logs');
  var labeldata=[];
  var countdata=[];
  var labeldatarng=[];
  let now = new Date();
  var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }


//res.json(labeldatarng);
  community_logs.aggregate([
    {$match:{"module" : "login"}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}}}  },
    {"$group" : {_id:{week:"$week",userid:"$userid"}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
     { "$project": {
       "week":1,
       "count":1,
       "daydate": 1,

   },

},
{$sort:{"_id.week" : 1}}
   ]).then(function(userdatas){
   //res.json(userdatas);
     var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;

      var curyear = moment(userdata.daydate).format('YYYY');
if(labeldata.indexOf(userdata._id.week)>=0){
  if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
    //labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
    }
  countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
}

     // countdata.push(userdata.count);
     next();
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            labeldatarng.pop();
          countdata.pop();
            res.json({'labels':labeldatarng,'countdata':countdata});
        });
    }).catch(function(error){
      //console.log(error);
res.json([])
    });
  }
  }

// to refine above API
// exports.getChangeActiveuserWeekdata = async function(req,res)
// {
//   const PerWeekData= db.get('per_week_data');
//   let labels = [];
//   let countdata = [];

//   // to get last week number
//   Date.prototype.getWeek = function() {
//     var dt = new Date(this.getFullYear(),0,1);
//     return Math.ceil((((this - dt) / 86400000) + dt.getDay()+1)/7);
//   };

//   let d = new Date();
//   let lastDate = new Date (d.setDate(d.getDate() - 70));
//   let lastWeekNumber = lastDate.getWeek();
//   let lastYear = lastDate.getFullYear()

//   let weekData = await PerWeekData.find({
//     weekNumber: { $gte: lastWeekNumber },
//     year: { $gte: lastYear }
//   },{$sort:{"month" : 1}});

//   for(let item of weekData){
//     let finalDate  = item.dateRange.replace (/,/g, "");
//     countdata.push(item.totalCount);
//     labels.push(finalDate)
//   }
//   res.send({labels, countdata})
// }

  exports.getChangeActiveuserWeekchurndata = function(req,res)
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    //console.log("newstartDate",newstartDate)
    //console.log("newendDate",newendDate)
  if(req.body.startDate!==null && req.body.endDate!==null)
  {
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const community_logs= db.get('community_logs');
    var labeldata=[];
  var countdata=[];
  var churncountdata=[];
  var labeldatarng=[];
  var curyear1 = moment(newendDate).format('YYYY');
  var currweeknum=moment(newendDate).week();
  var oldweeknumber=moment(newstartDate).week();
  ////console.log('now-',now)
  ////console.log('moment-',moment(newendDate).week())
  //console.log('currweeknum-'+currweeknum+'last_currweeknum-'+oldweeknumber)

  if(moment(newendDate).week()>=moment(newstartDate).week()){
    var weekdiff=(moment(newendDate).week()-moment(newstartDate).week())+1;
  }else{
    var weekdiff=((52-moment(newstartDate).week())+moment(newendDate).week())+1;
  }
//console.log('weekdiff',weekdiff);
  if((currweeknum-weekdiff)<=0){
    var startweeknum=52-(weekdiff-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      churncountdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      churncountdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    community_logs.aggregate([
      {$match:{"module" : "login"}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}}}  },
      {"$group" : {_id:{week:"$week",userid:"$userid"}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
       { "$project": {
         "week":1,
         "count":1,
         "daydate": 1,

     },

  },
  {$sort:{"_id.week" : 1}}
     ]).then(function(userdatas){
      //res.json(userdatas);
       var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        // //console.log('currentdate before set',userdata.daydate);
        var curyear = moment(userdata.daydate).format('YYYY');
  if(labeldata.indexOf(userdata._id.week)>=0){
    if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
      //labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
      }
    countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
    churncountdata[labeldata.indexOf(userdata._id.week)]=churncountdata[labeldata.indexOf(userdata._id.week)]+1;
  }
       next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              for(var i=0;i<countdata.length;i++){
                churncountdata[i]=((countdata[i]-countdata[i+1])/countdata[i]).toFixed(2);
              }
             churncountdata.pop();
             labeldatarng.splice(0, 1);
             labeldatarng.pop();
             churncountdata.pop();
              res.json({'labels':labeldatarng,'countdata':churncountdata});
          });
      }).catch(function(error){
  res.json([])
      });
    }else{
      var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const community_logs= db.get('community_logs');
      var labeldata=[];
    var countdata=[];
    var churncountdata=[];
    var labeldatarng=[];
    let now = new Date();
    var curyear1 = moment(now).format('YYYY');
    let startweedate=now.setDate(now.getDate() - 7 * 7);
    var currweeknum=moment(new Date()).week();
    if((currweeknum-8)<=0){
      var startweeknum=52-(8-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        churncountdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }else{
      var startweeknum=currweeknum-8;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        churncountdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }
      community_logs.aggregate([
        {$match:{"module" : "login"}},
        { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}}}  },
        {"$group" : {_id:{week:"$week",userid:"$userid"}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
         { "$project": {
           "week":1,
           "count":1,
           "daydate": 1,

       },

    },
    {$sort:{"_id.week" : 1}}
       ]).then(function(userdatas){
        //res.json(userdatas);
         var counter=-1;
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          // //console.log('currentdate before set',userdata.daydate);
          var curyear = moment(userdata.daydate).format('YYYY');
    if(labeldata.indexOf(userdata._id.week)>=0){
      if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
        //labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
        }
      countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
      churncountdata[labeldata.indexOf(userdata._id.week)]=churncountdata[labeldata.indexOf(userdata._id.week)]+1;
    }
         next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                for(var i=0;i<countdata.length;i++){
                  churncountdata[i]=((countdata[i]-countdata[i+1])/countdata[i]).toFixed(2);
                }
               churncountdata.pop();
               labeldatarng.splice(0, 1);
               labeldatarng.pop();
               churncountdata.pop();
                res.json({'labels':labeldatarng,'countdata':churncountdata});
            });
        }).catch(function(error){
    res.json([])
        });
    }

    }
exports.getChangeQuestionDaysdata = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null ){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    var days=(dateended-datestarted)/(1000*3600*24);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  const questions= db.get('questions');
    var counter=-1;
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);
      questions.find({"publish" : 1,'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(userdatas){
      //console.log('check in'+labelday+'hhhhhh'+userdatas.length);
      countdata[counter]=userdatas.length;
      next();
    }).catch(function(error){
      next();
    });
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
}

exports.getChangeQuestionViewsDaysdata = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate){
    var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    //console.log('days',days);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  const question_views= db.get('question_views');
    var counter=-1;
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);
      question_views.find({'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(userdatas){
      //console.log('check in'+labelday+'hhhhhh'+userdatas.length);
      countdata[counter]=userdatas.length;
      next();
    }).catch(function(error){
      next();
    });
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
}
exports.getChangeQuestionAnswersDaysdata = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null ){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    var days=(dateended-datestarted)/(1000*3600*24);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  const question_answers= db.get('question_answers');
    var counter=-1;
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);
      question_answers.find({'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(userdatas){
      //console.log('check in'+labelday+'hhhhhh'+userdatas.length);
      countdata[counter]=userdatas.length;
      next();
    }).catch(function(error){
      next();
    });
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
}
exports.getChangeQuestionMonthdata = async function(req,res)
{
  const questions= db.get('questions');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let userdata =  await questions.aggregate([
      {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
    }
  },
  {$sort:{"_id.month":1}}
  ])
     let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }

    asyncLoop(userdata, (singleUser, next) => {
      countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
      next();
     }, (err) => {
       if (!err){
       res.send({labels, countdata})
       } else{
         //console.log("error : ", err )
       }
     });
  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    questions.aggregate([
      {$match:{"publish" : 1, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,
    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count
      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }
  }
  exports.getChangeQuestionViewsMonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const question_views= db.get('question_views');
  question_views.aggregate([
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
     { "$project": {
       "month":1,
       "count":1,
       "daydate":1,

   }
},
{$sort:{"daydate":1}}
   ]).then(function(userdatas){
     var counter=-1;
     var labeldata=[];
     var countdata=[];
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
      labeldata.push(months[userdata._id.month]);
      countdata.push(userdata.count);
     next();
    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata,'countdata':countdata});
        });
      //res.json(userdatas)
    }).catch(function(error){
res.json([])
    });
  }
  exports.getChangeQuestionAnswersMonthdata = async function(req,res)
{
  const question_views = db.get('question_answers');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date"  && req.body.endDate != "Invalid date"){
  let userdata = await question_views.aggregate([
    {"$match": {"created_at":{"$gte":newstartDate, '$lte':newendDate}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}},'year': {$year:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month", year:"$year"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,
      "year":1
  }
},
{$sort:{"daydate":1, "year": 1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }

    asyncLoop(userdata, (singleUser, next) => {
      countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
      next();
     }, (err) => {
       if (!err){
       res.send({labels, countdata})
       } else{
         //console.log("error : ", err )
       }
     });

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();
    const question_answers= db.get('question_answers');
    question_answers.aggregate([
      {"$match": {'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count
      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
       res.json([])
      });
    }
  }
  exports.getChangeQuestionWeekdata = async function(req,res)
{
  const questions= db.get('questions');
  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")

  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

   questions.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'publish':1}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
    {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},

      { "$project": {
        "week":1,
        "count":1,
    },
},
{$sort:{"_id.week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
  if (userdatas.length > 0){
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
      var curyear = moment(userdata.daydate).format('YYYY');
      if(labeldata.indexOf(userdata._id.week)>=0)
      {
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
        }
        // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
        countdata[labeldata.indexOf(userdata._id.week)]=userdata.count

      }
      next();
    }, function (err)
    {
      if (err)
      {
        console.error('Inner Error: ' + err.message);
        return;
      }
      labeldatarng.pop();
      countdata.pop();
      res.json({'labels':labeldatarng,'countdata':countdata, userdatas});
    });
  }else {
    res.json({'labels':labeldatarng,'countdata':countdata, userdatas});
  }
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  } else{

    var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.aggregate([
      {$match:{"publish" : 1,'created_at':{"$gte":startweedate}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
    // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
      { "$project": {
        "week":1,
        //"count":1,
        "dayOfWeek": 1,

    },

  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      if(userdatas.length > 0){

        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          //var curr = userdata.dayOfWeek // get current date
          var curyear = moment(userdata.dayOfWeek).format('YYYY');
          // if(labeldata.indexOf(userdata.week)<0){
          //   labeldata.push(userdata.week);
          //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          //     }
          //   countdata[labeldata.indexOf(userdata.week)]=1;

          // }
          if(labeldata.indexOf(userdata.week)>=0){
            if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
              //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
              }
            countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
          }
        next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                labeldatarng.pop();
                countdata.pop();
                res.json({'labels':labeldatarng,'countdata':countdata});
            });
      }else{
        res.json({'labels':labeldatarng,'countdata':countdata});
      }
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }
  }
  exports.getSBAviewsdaysdata = function(req,res)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var labeldata=[];
    var daydatas=[];
    var countdata=[];
    if(req.body.startDate!==null && req.body.endDate!==null ){
      let datestarted=new Date(req.body.startDate).getTime();
      let dateended=new Date(req.body.endDate).getTime();
      // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
      var days=(dateended-datestarted)/(1000*3600*24);
      for (var i=0; i<=days; i++) {
      var d = new Date(req.body.endDate);
      d.setDate(d.getDate() - i);
      countdata.push(0);
      daydatas.push(d.getTime());
      labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }
      }else{
      for (var i=0; i<14; i++) {
          var d = new Date(new Date().setHours(0, 0, 0, 0));
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }}
//res.json({'labels':labeldata});
  const question_views= db.get('question_views');
  const questions= db.get('questions');
    var counter=-1;
    var qdata=[];
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);

      questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
        var myJSON = JSON.parse(JSON.stringify(sbaquestions));
             //res.json(sbaquestions);
       /// countdata[counter]=sbaquestions;
      question_views.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
       countdata[counter]=userdatas.length;
        next();
      }).catch(function(error){
        //console.log(error);
        next();
      });
    }).catch(function(error){
      //console.log(error);
      next();
    });

    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
    }
    exports.getSBAquestionsdaysdata = function(req,res)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate){
    var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    //console.log('days',days);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  //const question_views= db.get('question_views');
  const questions= db.get('questions');
    var counter=-1;
    var qdata=[];
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);

      questions.find({'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] },'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(sbaquestions){
       countdata[counter]=sbaquestions.length;
        next();

    }).catch(function(error){
      //console.log(error);
      next();
    });

    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
    }
    exports.getSBAquestionanswersdaysdata = function(req,res)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null ){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    var days=(dateended-datestarted)/(1000*3600*24);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  const question_answers= db.get('question_answers');
  const questions= db.get('questions');
    var counter=-1;
    var qdata=[];
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);

      questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
        var myJSON = JSON.parse(JSON.stringify(sbaquestions));
             //res.json(sbaquestions);
       /// countdata[counter]=sbaquestions;
       question_answers.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
        //console.log('check in'+labelday+'hhhhhh'+userdatas.length+''+'questiondata'+sbaquestions);
       countdata[counter]=userdatas.length;
        next();
      }).catch(function(error){
        //console.log(error);
        next();
      });
    }).catch(function(error){
      //console.log(error);
      next();
    });

    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
    }
    exports.getKFPviewsdaysdata = function(req,res)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var labeldata=[];
    var daydatas=[];
    var countdata=[];
    if(req.body.startDate!==null && req.body.endDate!==null ){
      let datestarted=new Date(req.body.startDate).getTime();
      let dateended=new Date(req.body.endDate).getTime();
      // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
      var days=(dateended-datestarted)/(1000*3600*24);
      for (var i=0; i<=days; i++) {
      var d = new Date(req.body.endDate);
      d.setDate(d.getDate() - i);
      countdata.push(0);
      daydatas.push(d.getTime());
      labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }
      }else{
      for (var i=0; i<14; i++) {
          var d = new Date(new Date().setHours(0, 0, 0, 0));
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }}
//res.json({'labels':labeldata});
  const question_views= db.get('question_views');
  const questions= db.get('questions');
    var counter=-1;
    var qdata=[];
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);

      questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
        var myJSON = JSON.parse(JSON.stringify(sbaquestions));
             //res.json(sbaquestions);
       /// countdata[counter]=sbaquestions;
      question_views.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
        //console.log('check in'+labelday+'hhhhhh'+userdatas.length+''+'questiondata'+sbaquestions);
       countdata[counter]=userdatas.length;
        next();
      }).catch(function(error){
        //console.log(error);
        next();
      });
    }).catch(function(error){
      //console.log(error);
      next();
    });

    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
    }
    exports.getKFPquestionsdaysdata = function(req,res)
    {
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var labeldata=[];
    var daydatas=[];
    var countdata=[];
    if(req.body.startDate!==null && req.body.endDate){
      var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
      //console.log('days',days);
      for (var i=0; i<=days; i++) {
      var d = new Date(req.body.endDate);
      d.setDate(d.getDate() - i);
      countdata.push(0);
      daydatas.push(d.getTime());
      labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }
      }else{
      for (var i=0; i<14; i++) {
          var d = new Date(new Date().setHours(0, 0, 0, 0));
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }}
  //res.json({'labels':labeldata});
    //const question_views= db.get('question_views');
    const questions= db.get('questions');
      var counter=-1;
      var qdata=[];
      asyncLoop(daydatas, function (labelday, next)
      {
        counter++;
        var startdate=new Date(labelday).setHours(0, 0, 0, 0);
        var enddate=new Date(labelday).setHours(23, 59, 59, 0);
        //res.json(enddate);
        //console.log('startdate'+startdate+'enddate'+enddate);

        questions.find({'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] },'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(sbaquestions){
         countdata[counter]=sbaquestions.length;
          next();
      }).catch(function(error){
        //console.log(error);
        next();
      });

      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
          });
      }
      exports.getIMGquestionsdaysdata = function(req,res)
      {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labeldata=[];
      var daydatas=[];
      var countdata=[];
      if(req.body.startDate!==null && req.body.endDate){
        var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
        //console.log('days',days);
        for (var i=0; i<=days; i++) {
        var d = new Date(req.body.endDate);
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
        }
        }else{
        for (var i=0; i<14; i++) {
            var d = new Date(new Date().setHours(0, 0, 0, 0));
            d.setDate(d.getDate() - i);
            countdata.push(0);
            daydatas.push(d.getTime());
            labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
        }}
    //res.json({'labels':labeldata});
      //const question_views= db.get('question_views');
      const questions= db.get('questions');
        var counter=-1;
        var qdata=[];
        asyncLoop(daydatas, function (labelday, next)
        {
          counter++;
          var startdate=new Date(labelday).setHours(0, 0, 0, 0);
          var enddate=new Date(labelday).setHours(23, 59, 59, 0);
          //res.json(enddate);
          //console.log('startdate'+startdate+'enddate'+enddate);

          questions.find({'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] },'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(sbaquestions){
           countdata[counter]=sbaquestions.length;
            next();
        }).catch(function(error){
          //console.log(error);
          next();
        });

        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
            });
        }
        exports.getUSERquestionsdaysdata = function(req,res)
        {
          var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var labeldata=[];
        var daydatas=[];
        var countdata=[];
        if(req.body.startDate!==null && req.body.endDate){
          var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
          //console.log('days',days);
          for (var i=0; i<=days; i++) {
          var d = new Date(req.body.endDate);
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
          }
          }else{
          for (var i=0; i<14; i++) {
              var d = new Date(new Date().setHours(0, 0, 0, 0));
              d.setDate(d.getDate() - i);
              countdata.push(0);
              daydatas.push(d.getTime());
              labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
          }}
      //res.json({'labels':labeldata});
        //const question_views= db.get('question_views');
        const questions= db.get('questions');
          var counter=-1;
          var qdata=[];
          asyncLoop(daydatas, function (labelday, next)
          {
            counter++;
            var startdate=new Date(labelday).setHours(0, 0, 0, 0);
            var enddate=new Date(labelday).setHours(23, 59, 59, 0);
            //res.json(enddate);
            //console.log('startdate'+startdate+'enddate'+enddate);

            questions.find({'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] },'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(sbaquestions){
             countdata[counter]=sbaquestions.length;
              next();
          }).catch(function(error){
            //console.log(error);
            next();
          });

          }, function (err)
              {
                  if (err)
                  {
                      console.error('Inner Error: ' + err.message);
                      // return;
                  }
                  res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
              });
          }
      exports.getKFPquestionanswersdaysdata = function(req,res)
      {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var labeldata=[];
        var daydatas=[];
        var countdata=[];
        if(req.body.startDate!==null && req.body.endDate!==null ){
          let datestarted=new Date(req.body.startDate).getTime();
          let dateended=new Date(req.body.endDate).getTime();
          // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
          var days=(dateended-datestarted)/(1000*3600*24);
          for (var i=0; i<=days; i++) {
          var d = new Date(req.body.endDate);
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
          }
          }else{
          for (var i=0; i<14; i++) {
              var d = new Date(new Date().setHours(0, 0, 0, 0));
              d.setDate(d.getDate() - i);
              countdata.push(0);
              daydatas.push(d.getTime());
              labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
          }}
    //res.json({'labels':labeldata});
      const question_answers= db.get('question_answers');
      const questions= db.get('questions');
        var counter=-1;
        var qdata=[];
        asyncLoop(daydatas, function (labelday, next)
        {
          counter++;
          var startdate=new Date(labelday).setHours(0, 0, 0, 0);
          var enddate=new Date(labelday).setHours(23, 59, 59, 0);
          //res.json(enddate);
          //console.log('startdate'+startdate+'enddate'+enddate);

          questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
            var myJSON = JSON.parse(JSON.stringify(sbaquestions));
                 //res.json(sbaquestions);
           /// countdata[counter]=sbaquestions;
           question_answers.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
            //console.log('check in'+labelday+'hhhhhh'+userdatas.length+''+'questiondata'+sbaquestions);
           countdata[counter]=userdatas.length;
            next();
          }).catch(function(error){
            //console.log(error);
            next();
          });
        }).catch(function(error){
          //console.log(error);
          next();
        });

        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
            });
        }
    exports.getCASEviewsdaysdata = function(req,res)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var labeldata=[];
    var daydatas=[];
    var countdata=[];
    if(req.body.startDate!==null && req.body.endDate!==null ){
      let datestarted=new Date(req.body.startDate).getTime();
      let dateended=new Date(req.body.endDate).getTime();
      // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
      var days=(dateended-datestarted)/(1000*3600*24);
      for (var i=0; i<=days; i++) {
      var d = new Date(req.body.endDate);
      d.setDate(d.getDate() - i);
      countdata.push(0);
      daydatas.push(d.getTime());
      labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }
      }else{
      for (var i=0; i<14; i++) {
          var d = new Date(new Date().setHours(0, 0, 0, 0));
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }}
//res.json({'labels':labeldata});
  const question_views= db.get('question_views');
  const questions= db.get('questions');
    var counter=-1;
    var qdata=[];
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);

      questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
        var myJSON = JSON.parse(JSON.stringify(sbaquestions));
             //res.json(sbaquestions);
       /// countdata[counter]=sbaquestions;
      question_views.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
       countdata[counter]=userdatas.length;
        next();
      }).catch(function(error){
        //console.log(error);
        next();
      });
    }).catch(function(error){
      //console.log(error);
      next();
    });

    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
    }
    exports.getCASEquestionsdaysdata = function(req,res)
    {
      var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var labeldata=[];
    var daydatas=[];
    var countdata=[];
    if(req.body.startDate!==null && req.body.endDate){
      var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
      //console.log('days',days);
      for (var i=0; i<=days; i++) {
      var d = new Date(req.body.endDate);
      d.setDate(d.getDate() - i);
      countdata.push(0);
      daydatas.push(d.getTime());
      labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }
      }else{
      for (var i=0; i<14; i++) {
          var d = new Date(new Date().setHours(0, 0, 0, 0));
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
      }}
  //res.json({'labels':labeldata});
   // const question_views= db.get('question_views');
    const questions= db.get('questions');
      var counter=-1;
      var qdata=[];
      asyncLoop(daydatas, function (labelday, next)
      {
        counter++;
        var startdate=new Date(labelday).setHours(0, 0, 0, 0);
        var enddate=new Date(labelday).setHours(23, 59, 59, 0);
        //res.json(enddate);
        //console.log('startdate'+startdate+'enddate'+enddate);
        questions.find({'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] },'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(sbaquestions){
         countdata[counter]=sbaquestions.length;
          next();

      }).catch(function(error){
        //console.log(error);
        next();
      });

      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
          });
      }
      exports.getCASEquestionanswersdaysdata = function(req,res)
      {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var labeldata=[];
        var daydatas=[];
        var countdata=[];
        if(req.body.startDate!==null && req.body.endDate!==null ){
          let datestarted=new Date(req.body.startDate).getTime();
          let dateended=new Date(req.body.endDate).getTime();
          // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
          var days=(dateended-datestarted)/(1000*3600*24);
          for (var i=0; i<=days; i++) {
          var d = new Date(req.body.endDate);
          d.setDate(d.getDate() - i);
          countdata.push(0);
          daydatas.push(d.getTime());
          labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
          }
          }else{
          for (var i=0; i<14; i++) {
              var d = new Date(new Date().setHours(0, 0, 0, 0));
              d.setDate(d.getDate() - i);
              countdata.push(0);
              daydatas.push(d.getTime());
              labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
          }}
    //res.json({'labels':labeldata});
      const question_answers= db.get('question_answers');
      const questions= db.get('questions');
        var counter=-1;
        var qdata=[];
        asyncLoop(daydatas, function (labelday, next)
        {
          counter++;
          var startdate=new Date(labelday).setHours(0, 0, 0, 0);
          var enddate=new Date(labelday).setHours(23, 59, 59, 0);
          //res.json(enddate);
          //console.log('startdate'+startdate+'enddate'+enddate);

          questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
            var myJSON = JSON.parse(JSON.stringify(sbaquestions));
                 //res.json(sbaquestions);
           /// countdata[counter]=sbaquestions;
           question_answers.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
            //console.log('check in'+labelday+'hhhhhh'+userdatas.length+''+'questiondata'+sbaquestions);
           countdata[counter]=userdatas.length;
            next();
          }).catch(function(error){
            //console.log(error);
            next();
          });
        }).catch(function(error){
          //console.log(error);
          next();
        });

        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
            });
        }
 exports.getArticleviewsdaysdata = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null ){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    var days=(dateended-datestarted)/(1000*3600*24);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  const article_views= db.get('article_views');
    var counter=-1;
    var qdata=[];
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);
      //console.log('startdate'+startdate+'enddate'+enddate);
       article_views.find({'created_at': {'$gte':startdate,'$lte':enddate}}).then(function(userdatas){
        //console.log('check in'+labelday+'hhhhhh'+userdatas.length+'');
       countdata[counter]=userdatas.length;
        next();
      }).catch(function(error){
        //console.log(error);
        next();
      });


    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });

}

exports.getSBAviewsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');


  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
    else
    {
      var startweeknum=currweeknum-weekdiff;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }

    let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d13','5d15fea98edfed6c417592d11','5d15fea98edfed6c417592d10','5d15fea98edfed6c417592d12'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])

  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count;
        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{

    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    const question_views= db.get('question_views');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{'created_at':{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
      //res.json(userdatas)
      let counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //     countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          // labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        //res.json(labeldata)
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
      res.json([])
          });
  }

}

exports.getSBAquestionsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")

  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

  questions.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d13','5d15fea98edfed6c417592d11','5d15fea98edfed6c417592d10','5d15fea98edfed6c417592d12']}}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
    {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},

      { "$project": {
        "week":1,
        "count":1,
    },
},
{$sort:{"_id.week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)]=userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        labeldatarng.pop();
        countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata, userdatas});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else {
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
  //res.json(labeldata);
  questions.aggregate([
      {"$match":{'created_at':{"$gte":startweedate},'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d13','5d15fea98edfed6c417592d11','5d15fea98edfed6c417592d10','5d15fea98edfed6c417592d12'] }}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
      //res.json(userdatas)
      let counter=-1;
    if(userdatas){
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //   labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //   }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          // labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        //res.json(labeldata)
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
        }else{
          labeldatarng.pop();
          countdata.pop();
          res.json({'labels':labeldatarng,'countdata':countdata});
        }
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
 }
}

exports.getSBAquestionanswersweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    //console.log("custom body", req.body)
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d10'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));

  //console.log("my JOSN", myJSON)

  question_answers.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  } else{

    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();


  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d10'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_answers.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
      res.json([])
      });
    }
}
exports.getKFPviewsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');


  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
    else
    {
      var startweeknum=currweeknum-weekdiff;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }

    let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])

  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count;
        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else {
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    const question_views= db.get('question_views');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
    let now = new Date();
    var curyear1 = moment(now).format('YYYY');
    let startweedate=now.setDate(now.getDate() - 7 * 7);
    var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          // labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
            countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
        res.json([])
      });
    }
}
exports.getKFPquestionsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

  questions.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d9']}}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
    {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},

      { "$project": {
        "week":1,
        "count":1,
    },
},
{$sort:{"_id.week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)]=userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        labeldatarng.pop();
        countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata });
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
    // var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    // if (1>3){
    //   res.send("closed")
    // }else{
      var labeldata=[];
      var countdata=[];
      var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
      let startweedate=now.setDate(now.getDate() - 7 * 7);
      var currweeknum=moment(new Date()).week();


    if((currweeknum-7)<=0){
      var startweeknum=52-(7-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }else{
      var startweeknum=currweeknum-7;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }
  // }
  // //console.log("this is data>>>", startweekdate)
  let newendDate = req.body.endDate
  questions.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d9']}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);

        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        // res.json([])
        labeldatarng.pop();
        countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});

      });
    }
}
exports.getIMGquestionsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

  questions.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d15']}}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
    {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},

      { "$project": {
        "week":1,
        "count":1,
    },
},
{$sort:{"_id.week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)]=userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        labeldatarng.pop();
        countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata, userdatas});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
    // var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();


  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
  questions.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d15']}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);

        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }
}
exports.getUSERquestionsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

  questions.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d16']}}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
    {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},

      { "$project": {
        "week":1,
        "count":1,
    },
},
{$sort:{"_id.week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    if(userdatas.lentgh > 0){

      asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          var curyear = moment(userdata.daydate).format('YYYY');
          if(labeldata.indexOf(userdata._id.week)>=0)
          {
            if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
              labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
            }
            // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
            countdata[labeldata.indexOf(userdata._id.week)]=userdata.count

          }
          next();
        }, function (err)
        {
          if (err)
          {
            console.error('Inner Error: ' + err.message);
            return;
          }
          labeldatarng.pop();
          countdata.pop();
          res.json({'labels':labeldatarng,'countdata':countdata, userdatas});
        });
    }else{
      res.json({'labels':labeldatarng,'countdata':countdata, userdatas});
    }
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  } else{
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
    // var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();


  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
  questions.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d16']}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      if(userdatas.length > 0){
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          var curyear = moment(userdata.dayOfWeek).format('YYYY');
          // if(labeldata.indexOf(userdata.week)<0){
          //   labeldata.push(userdata.week);

          //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          //     }
          //   countdata[labeldata.indexOf(userdata.week)]=1;

          // }
          if(labeldata.indexOf(userdata.week)>=0){
            if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
              //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
              }
            countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
          }
          setTimeout(next, 0);
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                labeldatarng.pop();
                countdata.pop();
                res.json({'labels':labeldatarng,'countdata':countdata});
            });

      }else{
        res.json({'labels':labeldatarng,'countdata':countdata});
      }
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }
}
exports.getKFPquestionanswersweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    //console.log("custom body", req.body)
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));

  question_answers.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();


  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_answers.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
      res.json([])
    });
  }
}
exports.getCASEviewsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');


  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
    else
    {
      var startweeknum=currweeknum-weekdiff;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }

    let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])

  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count;
        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    const questions= db.get('questions');
    const question_views= db.get('question_views');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(caseuserdatas){
    //res.json(caseuserdatas)
      var counter=-1;
      asyncLoop(caseuserdatas, function (caseuserdata, next)
      {
        counter++;
        var curyear = moment(caseuserdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(caseuserdata.week)<0){
        //   labeldata.push(caseuserdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(caseuserdata.week)]=1;

        // }
        if(labeldata.indexOf(caseuserdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
            }
          countdata[labeldata.indexOf(caseuserdata.week)]=countdata[labeldata.indexOf(caseuserdata.week)]+1;
        }
      //next();
      setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }

  labeldatarng.pop();
  countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
      res.json([])
    });
  }
}
exports.getCASEquestionsweekdata = async function(req,res)
{
  const questions= db.get('questions');
  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

  questions.aggregate([
   {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'publish':1,'questiontype':{$in: ['5d15fea98edfed6c417592d14']}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},

        { "$project": {
          "week":1,
          "count":1,
      },
  },
  {$sort:{"_id.week" : 1}}
  ])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)]=userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        labeldatarng.pop();
        countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata, userdatas});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  } else{

    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      //var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
  questions.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questiontype':{$in: ['5d15fea98edfed6c417592d14'] }}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(caseuserdatas){
    //res.json(caseuserdatas)
      var counter=-1;
      asyncLoop(caseuserdatas, function (caseuserdata, next)
      {
        counter++;
        var curyear = moment(caseuserdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(caseuserdata.week)<0){
        //   labeldata.push(caseuserdata.week);

        //   if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(caseuserdata.week)]=1;

        // }
        if(labeldata.indexOf(caseuserdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          // labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
            }
          countdata[labeldata.indexOf(caseuserdata.week)]=countdata[labeldata.indexOf(caseuserdata.week)]+1;
        }
      //next();
      setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }
}
exports.getCASEquestionanswersweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('case_comments');

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    //console.log("custom body", req.body)
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));

  //console.log("my JOSN", myJSON)

  question_answers.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'parentqid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    const questions= db.get('questions');
    const question_answers= db.get('case_comments');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_answers.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'parentqid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(caseuserdatas){
    //res.json(caseuserdatas)
      var counter=-1;
      asyncLoop(caseuserdatas, function (caseuserdata, next)
      {
        counter++;
        var curyear = moment(caseuserdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(caseuserdata.week)<0){
        //   labeldata.push(caseuserdata.week);

        //   if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(caseuserdata.week)]=1;

        // }
        if(labeldata.indexOf(caseuserdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
            countdata[labeldata.indexOf(caseuserdata._id.week)] = caseuserdata.count
            }
           }
      //next();
      setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
      res.json([])
    });
  }
}
exports.getArticleviewsweekdata = function(req,res)
{
  const questions= db.get('questions');
  const article_views= db.get('article_views');

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
    else
    {
      var startweeknum=currweeknum-weekdiff;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }

    article_views.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])

  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count;
        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const article_views= db.get('article_views');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    article_views.aggregate([
      {"$match":{"created_at":{"$gte":startweedate}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);

        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          // labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        res.json([])
      });
  }
}
exports.getSBAviewsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}, 'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
      if (userdata.length > 0){
        asyncLoop(userdata, (singleUser, next) => {
          countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
          next();
        }, (err) => {
          if (!err){
          res.send({labels, countdata, userdata})
          } else{
            //console.log("error : ", err )
          }
        });
      }else {
        res.send({labels, countdata})
      }
  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_views= db.get('question_views');
    questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
      res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}
exports.getSBAquestionsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let userdata =  await questions.aggregate([
      {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questiontype':{$nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14']}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
    }
  },
  {$sort:{"_id.month":1}}
  ])
    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
      if(userdata.length > 0){
        asyncLoop(userdata, (singleUser, next) => {
          countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
          next();
        }, (err) => {
          if (!err){
          res.send({labels, countdata, userdata})
          } else{
            //console.log("error : ", err )
          }
        });
      }else {
        res.send({labels, countdata})
      }
    }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      //var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      questions.aggregate([
      {"$match":{'questiontype':{$nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14']}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }
}
exports.getSBAquestionanswersmonthdata = async function(req,res)
{
  const question_views= db.get('question_answers');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,
  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if (userdata.length > 0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err )
         }
       });
    }else {
      res.send({labels, countdata})
    }

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      question_answers.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}
exports.getKFPviewsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}, 'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length > 0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err )
         }
       });
    }else{
      res.send({labels, countdata})
    }
  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_views= db.get('question_views');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
  res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}
exports.getKFPquestionsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let userdata =  await questions.aggregate([
      {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questiontype':{$in: ['5d15fea98edfed6c417592d9']}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
    }
  },
  {$sort:{"_id.month":1}}
  ])
      let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }

    if(userdata.length > 0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err )
         }
       });
    }else{
      res.send({labels, countdata})
    }

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
    // var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      questions.aggregate([
      {"$match":{'questiontype':{$in: ['5d15fea98edfed6c417592d9']}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count;
      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        // //console.log("error :", error)
        res.json([])
      });
    }
}
exports.getKFPquestionanswersmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_answers');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length > 0){

      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err )
         }
       });
    }else{
      res.send({labels, countdata})
    }

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      question_answers.aggregate([
      {"$match":{'questionid':{'$in':myJSON},'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count
      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}
exports.getCASEviewsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}, 'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length > 0){
        asyncLoop(userdata, (singleUser, next) => {
          countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
          next();
        }, (err) => {
          if (!err){
          res.send({labels, countdata, userdata})
          } else{
            //console.log("error : ", err )
          }
        });
      }else{
        res.send({labels, countdata})
      }
    }else{

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_views= db.get('question_views');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}
exports.getCASEquestionsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let userdata =  await questions.aggregate([
      {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questiontype':{$in: ['5d15fea98edfed6c417592d14']}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
    }
  },
  {$sort:{"_id.month":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length > 0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err )
         }
       });
    }else{
      res.send({labels, countdata})
    }

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      //var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      questions.aggregate([
      {"$match":{'questiontype':{$in: ['5d15fea98edfed6c417592d14']}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.countnt

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
  }
}
exports.getIMGquestionsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let userdata =  await questions.aggregate([
      {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questiontype':{$in: ['5d15fea98edfed6c417592d15']}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
    }
  },
  {$sort:{"_id.month":1}}
  ])
     let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length > 0){
        asyncLoop(userdata, (singleUser, next) => {
          countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
          next();
        }, (err) => {
          if (!err){
          res.send({labels, countdata})
          } else{
            //console.log("error : ", err )
          }
        });
    }else{
      res.send({labels, countdata, userdata})
    }

  }else{

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      //var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      questions.aggregate([
      {"$match":{'questiontype':{$in: ['5d15fea98edfed6c417592d15']}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
      res.json([])
      });
    }
}
exports.getUSERquestionsmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let userdata =  await questions.aggregate([
      {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questiontype':{$in: ['5d15fea98edfed6c417592d16']}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
    }
  },
  {$sort:{"_id.month":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length > 0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err )
         }
       });

    }else{
      res.send({labels, countdata, userdata})

    }

  }else{

    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    //const question_views= db.get('question_views');
    //questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      //var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      questions.aggregate([
      {"$match":{'questiontype':{$in: ['5d15fea98edfed6c417592d16']}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      if(userdatas.length > 0){
        asyncLoop(userdatas, function (userdata, next)
        {
          // counter++;
          // labeldata.push(months[userdata._id.month]);
          // countdata.push(userdata.count);
          var shortName = moment.monthsShort(userdata._id.month - 1);
          countdata[labeldata.indexOf(shortName)] = userdata.count

        next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata,'countdata':countdata});
            });
          //res.json(userdatas)

        }else{
          res.json({'labels':labeldata,'countdata':countdata});

        }
        }).catch(function(error){
          res.json([])
        });
    }
}
exports.getCASEquestionanswersmonthdata = async function(req,res)
{
  const question_views= db.get('case_comments');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'parentqid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }

    asyncLoop(userdata, (singleUser, next) => {
      countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
      next();
     }, (err) => {
       if (!err){
       res.send({labels, countdata, userdata})
       } else{
         //console.log("error : ", err )
       }
     });

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_answers= db.get('case_comments');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      question_answers.aggregate([
      {"$match":{'parentqid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1,}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}
exports.getArticleviewsmonthdata = async function(req,res)
{
  const article_views= db.get('article_views');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let userdata = await article_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate} }},
  { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
  {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
  { "$project": {
    "month":1,
    "count":1,
    "daydate":1,

}
},
{$sort:{"daydate":1}}
])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }

    if(userdata.length > 0){
        asyncLoop(userdata, (singleUser, next) => {
          countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
          next();
        }, (err) => {
          if (!err){
          res.send({labels, countdata, userdata})
          } else{
            //console.log("error : ", err )
          }
        });
      }else {
        res.send({labels, countdata, userdata})
      }
    }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const article_views= db.get('article_views');
    article_views.aggregate([
      {"$match" : {'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count
      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }
}
  exports.getChangeQuestionAnswersWeekdata = function(req,res)
  {
    const questions= db.get('questions');
    const question_answers= db.get('question_answers');

    if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
    {
      //console.log("custom body", req.body)
      var newstartDate =Number(req.body.startDate)
      var newendDate =Number(req.body.endDate)
      var labeldata=[];
      var countdata=[];
      var labeldatarng=[];

      var curyear1 = moment(newendDate).format('YYYY');
      var currweeknum=moment(newendDate).week();
      var oldweeknumber=moment(newstartDate).week();
      if(moment(newendDate).week()>=moment(newstartDate).week()){
        var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
      }else{
        var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
      }
      if((currweeknum-weekdiff)<=0)
      {
        var startweeknum=52-(weekdiff-currweeknum);
        var currweeknumold=currweeknum
        currweeknum=52;
        for(startweeknum;startweeknum<=currweeknum;startweeknum++)
        {
          labeldata.push(startweeknum);
          countdata.push(0);
          labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
          if(startweeknum==52){
            startweeknum=0;
            currweeknum=currweeknumold;
          }
        }
      }
    else
    {
      var startweeknum=currweeknum-weekdiff;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }
  question_answers.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}}},
    { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}},
    {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
      { "$project": {
        "week":1,
        "count":1,
        // "dayOfWeek": 1,
    },
  },
  {$sort:{"_id.week" : 1}}
  ])
    .then(function(userdatas)
    {
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          var curyear = moment(userdata.daydate).format('YYYY');
          if(labeldata.indexOf(userdata._id.week)>=0)
          {
            if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
              labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
            }
            // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
            countdata[labeldata.indexOf(userdata._id.week)] = userdata.count

          }
          next();
        }, function (err)
        {
          if (err)
          {
            console.error('Inner Error: ' + err.message);
            return;
          }
          // labeldatarng.pop();
          // countdata.pop();
          res.json({'labels':labeldatarng,'countdata':countdata});
        });
      }).catch(function(error){
          //console.log(error);
          res.json([])
        });
    } else{
        var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const question_answers= db.get('question_answers');
        var labeldata=[];
        var countdata=[];
        var labeldatarng=[];
          let now = new Date();
          var curyear1 = moment(now).format('YYYY');
      let startweedate=now.setDate(now.getDate() - 7 * 7);
      var currweeknum=moment(new Date()).week();


    if((currweeknum-7)<=0){
      var startweeknum=52-(7-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }else{
      var startweeknum=currweeknum-7;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }
        question_answers.aggregate([
          {"$match":{'created_at':{"$gte":startweedate}}},
          { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
          // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
            { "$project": {
              "week":1,
              //"count":1,
              "dayOfWeek": 1,

          },

      },
      {$sort:{"week" : 1}}
        ]).then(function(userdatas){
        // res.json(userdatas)
          var counter=-1;
          asyncLoop(userdatas, function (userdata, next)
          {
            counter++;
            var curyear = moment(userdata.dayOfWeek).format('YYYY');
            // if(labeldata.indexOf(userdata.week)<0){
            //   labeldata.push(userdata.week);
            //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            //     }
            //   countdata[labeldata.indexOf(userdata.week)]=1;

            // }
            if(labeldata.indexOf(userdata.week)>=0){
              if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
                //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
                }
              countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
            }
          next();
          }, function (err)
              {
                  if (err)
                  {
                      console.error('Inner Error: ' + err.message);
                      // return;
                  }
                  labeldatarng.pop();
                  countdata.pop();
                  res.json({'labels':labeldatarng,'countdata':countdata});
              });
          }).catch(function(error){
          res.json([])
          });
      }
    }
    exports.getChangeQuestionViewsWeekdata = function(req,res)
    {
     // var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const question_views= db.get('question_views');
      var labeldata=[];
      var countdata=[];
      var labeldatarng=[];
        let now = new Date();
        var curyear1 = moment(now).format('YYYY');
    let startweedate=now.setDate(now.getDate() - 7 * 7);
    var currweeknum=moment(new Date()).week();
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
      question_views.aggregate([
        {"$match":{'created_at':{"$gte":startweedate}}},
        { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
   // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
     { "$project": {
       "week":1,
       //"count":1,
       "dayOfWeek": 1,

   },

},
{$sort:{"week" : 1}}
       ]).then(function(userdatas){
        //res.json(userdatas)
         var counter=-1;
        asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          var curyear = moment(userdata.dayOfWeek).format('YYYY');
          if(labeldata.indexOf(userdata.week)<0){
            labeldata.push(userdata.week);

            labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));

            countdata[labeldata.indexOf(userdata.week)]=1;

          }else{
            countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
          }
         next()
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldatarng,'countdata':countdata});
            });
        }).catch(function(error){
    res.json([])
        });
      }


// report dashboard
exports.getReportDashboard = async function(req, res) {
  let postSaves = db.get('post_saves');

  let finalObj = {
    postData : "",
    totalPost: null,
    totalUser: null

  };

  const postData = await postSaves.aggregate([
    {"$match" : {'status':0}},
    {"$group" : {_id:{postid:"$postid"}, count:{$sum:1}}},
      {
        $lookup:
          {
            from: "posts",
            localField: "_id.postid",
            foreignField: "unique_id",
            as: "savedpost"
          }
      },
      { "$unwind": "$savedpost" },
      {
      $lookup:
        {
          from: "users",
          localField: "savedpost.created_by",
          foreignField: "unique_id",
          as: "userdetail"
        }
      },
      { "$unwind": "$userdetail" },
      {$sort:{"count" : -1}}
       ])

  let totalPosts = await postSaves.distinct('postid',{'status':0});
  let totaUsers = await postSaves.find({'status':0});
  finalObj.postData = postData;
  finalObj.totalUser = totaUsers.length;
  finalObj.totalPost = totalPosts.length;

  res.send(finalObj)
}
exports.getPostSavers = function(req,res){
  //console.log(req.body.postid);

  const post_saves= db.get('post_saves');
  post_saves.aggregate([
      { "$match":{'postid': req.body.postid,'status':0}},
      {"$sort": {"_id": 1}},
        {
            $lookup:
                {
                    from: "users",
                    localField: "created_by",
                    foreignField: "unique_id",
                    as: "likebyuser"
                }
        },
        { "$unwind": "$likebyuser" },
                { "$project": {
                    "created_at":1,
                    "unique_id":1,
                    "likebyuser.unique_id":1,
                    "likebyuser.firstname":1,
                    "likebyuser.lastname":1,
                    "likebyuser.profile":1

                }
        }
        ]).then(function(findlikers){
          res.json(findlikers);

}).catch(function(error){
  res.json([]);
});

}

exports.dataPerDayWeekMonth = async function(req, res){
  const CommunityLogs = db.get('community_logs');
  var months = [
    'January', 'February', 'March', 'April', 'May',
    'June', 'July', 'August', 'September',
    'October', 'November', 'December'
    ];

  const per_week_data = db.get('per_week_data');
  const per_month_data = db.get('per_month_data');
  const per_year_data = db.get('per_year_data');
  const per_day_data = db.get('per_day_data');


  // one day data
let allDayData = await CommunityLogs.aggregate([
  {$match:{"module" : "login"}},
  {
    $group: {
      _id: {
        day: { $dateToString: { format: "%Y-%m-%d", date:  {$toDate:'$created_at'} } }
      },
      count: { $sum: 1 }
    }
  },
  {$sort:{"_id.month" : 1}}

]);

  // all month data
    let allMonthData = await CommunityLogs.aggregate([
    {$match:{"module" : "login"}},
    {
      $group: {
        _id: {
          month: { $month: {$toDate:'$created_at'} },
          year: { $year: {$toDate:'$created_at'} }
        },
        count: { $sum: 1 }
      }
    },
    {$sort:{"_id.month" : 1}}

  ]);

  // all year data
let allYearData = await CommunityLogs.aggregate([
  {$match:{"module" : "login"}},
  {
    $group : {
      _id: {
        year: { $year : {$toDate:'$created_at'} },
      },
      count: { $sum : 1 }
  }
},
{$sort:{"_id.year" : 1}}
]);

// all week data
  var allWeekData = await CommunityLogs.aggregate([
    {$match:{"module" : "login"}},
    {
      $group : {
        _id: {
          year: { $year : {$toDate:'$created_at'} },
          month: { $month: {$toDate:'$created_at'} },
          week: { $isoWeek : {$toDate:'$created_at'} }
        },
        count: { $sum : 1 }
    }
  },
  {$sort:{"_id.month" : 1}}
]);

var finalWeekData =[];

asyncLoop(allWeekData, function (weekData, next)
    {
      var week = weekData._id.week
      var year = weekData._id.year
      if(weekData){
        // to convert week number to date range
        Date.prototype.getWeek = function() {
          var date = new Date(this.getTime());
          date.setHours(0, 0, 0, 0);
          date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
          var week1 = new Date(date.getFullYear(), 0, 4);
          return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
        }

        function getDateRangeOfWeek(weekNo, y){
            var d1, numOfdaysPastSinceLastMonday, rangeIsFrom, rangeIsTo;
            d1 = new Date(''+y+'');
            numOfdaysPastSinceLastMonday = d1.getDay() - 1;
            d1.setDate(d1.getDate() - numOfdaysPastSinceLastMonday);
            d1.setDate(d1.getDate() + (7 * (weekNo - d1.getWeek())));
            rangeIsFrom = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear();
            d1.setDate(d1.getDate() + 6);
            rangeIsTo = (d1.getMonth() + 1) + "-" + d1.getDate() + "-" + d1.getFullYear() ;
            return  moment(rangeIsFrom).format("D, MMM") + " - "   + moment(rangeIsTo).format("D, MMM");
        };
        let weekDataRange = getDateRangeOfWeek(week, year);
        weekData.dateRange = weekDataRange
        finalWeekData.push(weekData)
        next();
      }
    }, function (err)
    {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
        }
        // res.json({finalWeekData, allMonthData , allYearData});
    });


  //inserting per week data to database
  const options = {upsert: true,returnNewDocument: true};
  for (let item of finalWeekData){
    per_week_data.findOneAndUpdate({"dateRange": item.dateRange, "year": item._id.year,"weekNumber": item._id.week},{$set:{
      "year": item._id.year,
      "month": months[item._id.month - 1] || '',
      "weekNumber": item._id.week,
      "totalCount": item.count,
      "dateRange": item.dateRange
    }},options).then(function(data)
    {
      // //console.log('updated week data')
    });
  }

  // inserting per month data to database
  for(let item of allMonthData){
    let finalMonthData = months[item._id.month - 1] || ''
    per_month_data.findOneAndUpdate({"month": finalMonthData, "year": item._id.year},{$set:{
      "year": item._id.year,
      "month": finalMonthData,
      "monthNumber": item._id.month,
      "totalCount": item.count
    }},options).then(function(data)
    {
      // //console.log('updated month data')
    });
  }

  // // inserting per year data to database
  for(let item of allYearData){
    per_year_data.findOneAndUpdate({"year": item._id.year},{$set:{
      "year": item._id.year,
      "totalCount": item.count
    }},options).then(function(data)
    {
      // //console.log('updated year data')
    });
  }

  // inserting per day data to database
  for(let item of allDayData){
    per_day_data.findOneAndUpdate({"day": item._id.day},{$set:{
      "day": item._id.day,
      "totalCount": item.count,
    }},options).then(function(data)
    {
      // //console.log('updated year data')
    });
  }


  res.end("all entries done")
}

// get image of the wee days data
exports.getImageOfTheWeeKdaysData = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null ){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    var days=(dateended-datestarted)/(1000*3600*24);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
const question_answers= db.get('question_answers');
const questions= db.get('questions');
  var counter=-1;
  var qdata=[];
  asyncLoop(daydatas, function (labelday, next)
  {
    counter++;
    var startdate=new Date(labelday).setHours(0, 0, 0, 0);
    var enddate=new Date(labelday).setHours(23, 59, 59, 0);
    //res.json(enddate);
    // //console.log('startdate'+startdate+'enddate'+enddate);

    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
           //res.json(sbaquestions);
     /// countdata[counter]=sbaquestions;
     question_answers.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
      //console.log('check in'+labelday+'hhhhhh'+userdatas.length+''+'questiondata'+sbaquestions);
     countdata[counter]=userdatas.length;
      next();
    }).catch(function(error){
      //console.log(error);
      next();
    });
  }).catch(function(error){
    //console.log(error);
    next();
  });

  }, function (err)
      {
          if (err)
          {
              console.error('Inner Error: ' + err.message);
              // return;
          }
          res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
      });
  }

  // get user question days data
  exports.getuserquestiondaysdata = function(req,res)
      {
        var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      var labeldata=[];
      var daydatas=[];
      var countdata=[];
      if(req.body.startDate!==null && req.body.endDate!==null ){
        let datestarted=new Date(req.body.startDate).getTime();
        let dateended=new Date(req.body.endDate).getTime();
        // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
        var days=(dateended-datestarted)/(1000*3600*24);

        // //console.log('days',days);
        for (var i=0; i<=days; i++) {
        var d = new Date(req.body.endDate);
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
        }
        }else{
        for (var i=0; i<14; i++) {
            var d = new Date(new Date().setHours(0, 0, 0, 0));
            d.setDate(d.getDate() - i);
            countdata.push(0);
            daydatas.push(d.getTime());
            labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
        }}
    //res.json({'labels':labeldata});
      const question_answers= db.get('question_answers');
      const questions= db.get('questions');
        var counter=-1;
        var qdata=[];
        asyncLoop(daydatas, function (labelday, next)
        {
          counter++;
          var startdate=new Date(labelday).setHours(0, 0, 0, 0);
          var enddate=new Date(labelday).setHours(23, 59, 59, 0);
          //res.json(enddate);
          // //console.log('startdate'+startdate+'enddate'+enddate);

          questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }}).then(function(sbaquestions){
            var myJSON = JSON.parse(JSON.stringify(sbaquestions));
                 //res.json(sbaquestions);
           /// countdata[counter]=sbaquestions;
           question_answers.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
            // //console.log('check in'+labelday+'hhhhhh'+userdatas.length+''+'questiondata'+sbaquestions);
           countdata[counter]=userdatas.length;
            next();
          }).catch(function(error){
            //console.log(error);
            next();
          });
        }).catch(function(error){
          //console.log(error);
          next();
        });

        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
            });
        }


// get image of the week weekdata
exports.getimageoftheweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    //console.log("custom body", req.body)
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));

  //console.log("my JOSN", myJSON)

  question_answers.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])
  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count

        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();


  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_answers.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
        res.json([])
      });
  }
}

// get user question weekData
exports.getuserquestionweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('case_comments');

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    //console.log("custom body", req.body)
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
  else
  {
    var startweeknum=currweeknum-weekdiff;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }

let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));

  //console.log("my JOSN", myJSON)

  question_answers.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'parentqid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])
  .then(function(userdatas)
  {
    if(userdatas.length > 0){
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          var curyear = moment(userdata.daydate).format('YYYY');
          if(labeldata.indexOf(userdata._id.week)>=0)
          {
            if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
              labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
            }
            // countdata[labeldata.indexOf(userdata._id.week)]=countdata[labeldata.indexOf(userdata._id.week)]+1;
            countdata[labeldata.indexOf(userdata._id.week)] = userdata.count

          }
          next();
        }, function (err)
        {
          if (err)
          {
            console.error('Inner Error: ' + err.message);
            return;
          }
          // labeldatarng.pop();
          // countdata.pop();
          res.json({'labels':labeldatarng,'countdata':countdata});
        });

    }else{
      res.json({'labels':labeldatarng,'countdata':countdata});

    }
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  }else{
    const questions= db.get('questions');
    const question_answers= db.get('case_comments');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_answers.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'parentqid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(caseuserdatas){
    //res.json(caseuserdatas)
    if(caseuserdatas.lentgh > 0){
      var counter=-1;
      asyncLoop(caseuserdatas, function (caseuserdata, next)
      {
        counter++;
        var curyear = moment(caseuserdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(caseuserdata.week)<0){
        //   labeldata.push(caseuserdata.week);

        //   if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(caseuserdata.week)]=1;

        // }
        if(labeldata.indexOf(caseuserdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
            //labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
            }
          countdata[labeldata.indexOf(caseuserdata.week)]=countdata[labeldata.indexOf(caseuserdata.week)]+1;
        }
      //next();
      setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });

    }else{
      res.json({'labels':labeldatarng,'countdata':countdata});

    }
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
      res.json([])
    });
  }
}

// get image of the week monthData
exports.getimageoftheweekmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_answers');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length > 0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err)
         }
       });
    }

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      question_answers.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
      res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}

// get user question month data
exports.getuserquestionmonthdata = async function(req,res)
{
  const question_views= db.get('case_comments');
  const questions= db.get('questions');
  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)


  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'parentqid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
    let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if(userdata.length >0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count

        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata})
         } else{
           //console.log("error : ", err )
         }
       });
    } else{
      res.send({labels, countdata})

    }

  }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_answers= db.get('case_comments');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      question_answers.aggregate([
      {"$match":{'parentqid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1,}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }

      if(userdatas.length > 0){
        asyncLoop(userdatas, function (userdata, next)
        {
          // counter++;
          // labeldata.push(months[userdata._id.month]);
          // countdata.push(userdata.count);
          var shortName = moment.monthsShort(userdata._id.month - 1);
          countdata[labeldata.indexOf(shortName)] = userdata.count

        next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata,'countdata':countdata});
            });

      }else{
        res.json({'labels':labeldata,'countdata':countdata});

      }
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}

// view report image of the week daysData
exports.imageoftheweekviewdaydata = function(req,res)
{
  var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null ){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    var days=(dateended-datestarted)/(1000*3600*24);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
const question_views= db.get('question_views');
const questions= db.get('questions');
  var counter=-1;
  var qdata=[];
  asyncLoop(daydatas, function (labelday, next)
  {
    counter++;
    var startdate=new Date(labelday).setHours(0, 0, 0, 0);
    var enddate=new Date(labelday).setHours(23, 59, 59, 0);
    //res.json(enddate);
    //console.log('startdate'+startdate+'enddate'+enddate);

    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
      // //console.log("this is custom", myJSON)
           //res.json(sbaquestions);
     /// countdata[counter]=sbaquestions;
    question_views.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
      //console.log('check in'+labelday+'hhhhhh'+userdatas.length+''+'questiondata'+sbaquestions);
     countdata[counter]=userdatas.length;
      next();
    }).catch(function(error){
      //console.log(error);
      next();
    });
  }).catch(function(error){
    //console.log(error);
    next();
  });

  }, function (err)
      {
          if (err)
          {
              console.error('Inner Error: ' + err.message);
              // return;
          }
          res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
      });
  }

  // user question view daysData
  exports.userviewdaysdata = function(req,res)
  {
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var labeldata=[];
  var daydatas=[];
  var countdata=[];
  if(req.body.startDate!==null && req.body.endDate!==null ){
    let datestarted=new Date(req.body.startDate).getTime();
    let dateended=new Date(req.body.endDate).getTime();
    // var days=new Date(req.body.endDate).getDate()-new Date(req.body.startDate).getDate();
    var days=(dateended-datestarted)/(1000*3600*24);
    for (var i=0; i<=days; i++) {
    var d = new Date(req.body.endDate);
    d.setDate(d.getDate() - i);
    countdata.push(0);
    daydatas.push(d.getTime());
    labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }
    }else{
    for (var i=0; i<14; i++) {
        var d = new Date(new Date().setHours(0, 0, 0, 0));
        d.setDate(d.getDate() - i);
        countdata.push(0);
        daydatas.push(d.getTime());
        labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
    }}
//res.json({'labels':labeldata});
  const question_views= db.get('question_views');
  const questions= db.get('questions');
    var counter=-1;
    var qdata=[];
    asyncLoop(daydatas, function (labelday, next)
    {
      counter++;
      var startdate=new Date(labelday).setHours(0, 0, 0, 0);
      var enddate=new Date(labelday).setHours(23, 59, 59, 0);
      //res.json(enddate);

      questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }}).then(function(sbaquestions){
        var myJSON = JSON.parse(JSON.stringify(sbaquestions));
             //res.json(sbaquestions);
       /// countdata[counter]=sbaquestions;
      question_views.find({'created_at': {'$gte':startdate,'$lte':enddate},'questionid': { '$in': myJSON}}).then(function(userdatas){
       countdata[counter]=userdatas.length;
        next();
      }).catch(function(error){
        //console.log(error);
        next();
      });
    }).catch(function(error){
      //console.log(error);
      next();
    });

    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({'labels':labeldata.reverse(),'countdata':countdata.reverse()});
        });
    }

    // image of the week view monthData
exports.imageoftheweekviewmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}, 'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,

  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
    if (userdata.length > 0){
      asyncLoop(userdata, (singleUser, next) => {
        countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
        next();
       }, (err) => {
         if (!err){
         res.send({labels, countdata, userdata})
         } else{
           //console.log("error : ", err )
         }
       });
    }else {
      res.send({labels, countdata, userdata})
    }
    }else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();

    const questions= db.get('questions');
    const question_views= db.get('question_views');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      asyncLoop(userdatas, function (userdata, next)
      {
        // counter++;
        // labeldata.push(months[userdata._id.month]);
        // countdata.push(userdata.count);
        var shortName = moment.monthsShort(userdata._id.month - 1);
        countdata[labeldata.indexOf(shortName)] = userdata.count

      next();
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({'labels':labeldata,'countdata':countdata});
          });
        //res.json(userdatas)
      }).catch(function(error){
  res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}

// user view monthData
exports.userviewmonthdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');

  var newstartDate =Number(req.body.startDate)
  var newendDate =Number(req.body.endDate)
  var months = ["months:", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date"){
  const questions= db.get('questions');
  let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }})
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  let userdata = await question_views.aggregate([
    {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate}, 'questionid':{'$in':myJSON}}},
    { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
    {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
    { "$project": {
      "month":1,
      "count":1,
      "daydate":1,
  }
},
{$sort:{"daydate":1}}
  ])

    let startMonth = moment(new Date(newstartDate)).month() +1 ;
    let endMonth = moment(new Date(newendDate)).month() +1 ;
    var labels=[];
    var countdata=[];
    var toLoop = (12-startMonth +1 )+endMonth
    // to add blank data in the array
        let counter = 1
    for (let i = 0; i <= toLoop; i++){
      if ((startMonth+i) <= 12){
        labels.push(months[startMonth+i])
        countdata.push(0)
      } else {
        labels.push(months[counter++])
        countdata.push(0)
      }
    }
if(userdata.length > 0){
  asyncLoop(userdata, (singleUser, next) => {
    countdata[labels.indexOf(months[singleUser._id.month])]=singleUser.count
    next();
   }, (err) => {
     if (!err){
     res.send({labels, countdata, userdata})
     } else{
       //console.log("error : ", err )
     }
   });

}else{
  res.send({labels, countdata, userdata})

}
}else{
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    var sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    let finalDate =  sixMonthsAgo.valueOf();


    const questions= db.get('questions');
    const question_views= db.get('question_views');
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, 'created_at':{"$gte": finalDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,

    }
  },
  {$sort:{"daydate":1}}
    ]).then(function(userdatas){
      let labeldata =[]
      let countdata = []

      var today = new Date();
      var d;
      var tempMonth;
      for(var i = 6; i > 0; i --) {
        d = new Date(today.getFullYear(), today.getMonth() - i +1);
        tempMonth = months[d.getMonth()];
        countdata.push(0)
        labeldata.push(tempMonth)
      }
      if(userdatas > 0){
        asyncLoop(userdatas, function (userdata, next)
        {
          // counter++;
          // labeldata.push(months[userdata._id.month]);
          // countdata.push(userdata.count);
          var shortName = moment.monthsShort(userdata._id.month - 1);
          countdata[labeldata.indexOf(shortName)] = userdata.count

        next();
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json({'labels':labeldata,'countdata':countdata});
            });

      }else{
        res.json({'labels':labeldata,'countdata':countdata});

      }
        //res.json(userdatas)
      }).catch(function(error){
        res.json([])
      });
    }).catch(function(error){
      res.json([])
    });
  }
}

// image of the weeek weekData
exports.imageoftheweekviewweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');


  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
    else
    {
      var startweeknum=currweeknum-weekdiff;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }

    let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])

  .then(function(userdatas)
  {
    var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.daydate).format('YYYY');
        if(labeldata.indexOf(userdata._id.week)>=0)
        {
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
          }
          countdata[labeldata.indexOf(userdata._id.week)] = userdata.count;
        }
        next();
      }, function (err)
      {
        if (err)
        {
          console.error('Inner Error: ' + err.message);
          return;
        }
        // labeldatarng.pop();
        // countdata.pop();
        res.json({'labels':labeldatarng,'countdata':countdata});
      });
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  } else{
    //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const questions= db.get('questions');
    const question_views= db.get('question_views');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d15'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(userdatas){
    // res.json(userdatas)
      var counter=-1;
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var curyear = moment(userdata.dayOfWeek).format('YYYY');
        // if(labeldata.indexOf(userdata.week)<0){
        //   labeldata.push(userdata.week);
        //   if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        //     labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        //     }
        //   countdata[labeldata.indexOf(userdata.week)]=1;

        // }
        if(labeldata.indexOf(userdata.week)>=0){
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          // labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=countdata[labeldata.indexOf(userdata.week)]+1;
        }
        setTimeout(next, 0);
      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              labeldatarng.pop();
            countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
        //console.log(error);
        res.json([])
      });
    }).catch(function(error){
      //console.log(error);
        res.json([])
            });
    }
}

// user view weeData
exports.userviewweekdata = async function(req,res)
{
  const questions= db.get('questions');
  const question_views= db.get('question_views');


  if(req.body.startDate != "Invalid date" && req.body.endDate != "Invalid date")
  {
    var newstartDate =Number(req.body.startDate)
    var newendDate =Number(req.body.endDate)
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];

    var curyear1 = moment(newendDate).format('YYYY');
    var currweeknum=moment(newendDate).week();
    var oldweeknumber=moment(newstartDate).week();
    if(moment(newendDate).week()>=moment(newstartDate).week()){
      var weekdiff=moment(newendDate).week()-moment(newstartDate).week();
    }else{
      var weekdiff=(52-moment(newstartDate).week())+moment(newendDate).week();
    }
    if((currweeknum-weekdiff)<=0)
    {
      var startweeknum=52-(weekdiff-currweeknum);
      var currweeknumold=currweeknum
      currweeknum=52;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++)
      {
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
        if(startweeknum==52){
          startweeknum=0;
          currweeknum=currweeknumold;
        }
      }
    }
    else
    {
      var startweeknum=currweeknum-weekdiff;
      for(startweeknum;startweeknum<=currweeknum;startweeknum++){
        labeldata.push(startweeknum);
        countdata.push(0);
        labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      }
    }

    let sbaquestions = await questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }})
  var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
  {"$match":{"created_at":{"$gte":newstartDate, '$lte':newendDate},'questionid':{$in:myJSON}}},
  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
  {'$group' : {_id:{week:'$week',userid:'$createdby'}, count:{$sum:1},daydate:{$first:{$toDate:'$created_at'}}}},
    { "$project": {
      "week":1,
      "count":1,
      // "dayOfWeek": 1,
  },
},
{$sort:{"week" : 1}}
])

  .then(function(userdatas)
  {
    var counter=-1;
    if(userdatas.length > 0){
      asyncLoop(userdatas, function (userdata, next)
        {
          counter++;
          var curyear = moment(userdata.daydate).format('YYYY');
          if(labeldata.indexOf(userdata._id.week)>=0)
          {
            if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
              labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
            }
            countdata[labeldata.indexOf(userdata._id.week)] = userdata.count;
          }
          next();
        }, function (err)
        {
          if (err)
          {
            console.error('Inner Error: ' + err.message);
            return;
          }
          // labeldatarng.pop();
          // countdata.pop();
          res.json({'labels':labeldatarng,'countdata':countdata});
        });

    }else{
      res.json({'labels':labeldatarng,'countdata':countdata});

    }
    }).catch(function(error){
        //console.log(error);
        res.json([])
      });
  } else {
    const questions= db.get('questions');
    const question_views= db.get('question_views');
    var labeldata=[];
    var countdata=[];
    var labeldatarng=[];
      let now = new Date();
      var curyear1 = moment(now).format('YYYY');
  let startweedate=now.setDate(now.getDate() - 7 * 7);
  var currweeknum=moment(new Date()).week();
  if((currweeknum-7)<=0){
    var startweeknum=52-(7-currweeknum);
    var currweeknumold=currweeknum
    currweeknum=52;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
      if(startweeknum==52){
        startweeknum=0;
        currweeknum=currweeknumold;
      }
    }
  }else{
    var startweeknum=currweeknum-7;
    for(startweeknum;startweeknum<=currweeknum;startweeknum++){
      labeldata.push(startweeknum);
      countdata.push(0);
      labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
    }
  }
    questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d16'] }}).then(function(sbaquestions){
      var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_views.aggregate([
      {"$match":{"created_at":{"$gte":startweedate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      // {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
        { "$project": {
          "week":1,
          //"count":1,
          "dayOfWeek": 1,

      },
  },
  {$sort:{"week" : 1}}
    ]).then(function(caseuserdatas){
    //res.json(caseuserdatas)
      var counter=-1;
      if(caseuserdatas.length > 0){
        asyncLoop(caseuserdatas, function (caseuserdata, next)
        {
          counter++;
          var curyear = moment(caseuserdata.dayOfWeek).format('YYYY');
          // if(labeldata.indexOf(caseuserdata.week)<0){
          //   labeldata.push(caseuserdata.week);
          //   if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          //     labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
          //     }
          //   countdata[labeldata.indexOf(caseuserdata.week)]=1;

          // }
          if(labeldata.indexOf(caseuserdata.week)>=0){
            if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
              //labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
              }
            countdata[labeldata.indexOf(caseuserdata.week)]=countdata[labeldata.indexOf(caseuserdata.week)]+1;
          }
        //next();
        setTimeout(next, 0);
        }, function (err)
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
              labeldatarng.pop();
              countdata.pop();
              res.json({'labels':labeldatarng,'countdata':countdata});
            });

      } else{
        res.json({'labels':labeldatarng,'countdata':countdata});
      }
    }).catch(function(error){
      //console.log(error);
      res.json([])
    });
    }).catch(function(error){
      //console.log(error);
      res.json([])
    });
  }
}

// all Question Week Data Differece
module.exports.allQuestionWeekDataDifference = async (req, res) => {
  const questions = db.get('questions');
  const question_answers = db.get('question_answers');

  let questionType = req.body.questionType


  let protoDate = new Date().getTime()
  let currenDate = protoDate - (7* 24 * 60 * 60 * 1000);
  let lastWeekDate = protoDate - (21* 24 * 60 * 60 * 1000);
  let middleDate = protoDate - (14* 24 * 60 * 60 * 1000);


  let questionTypeKFP = await questions.distinct("_id",{'publish':1,'questiontype': { $in: [questionType] }})
    var myJSON = JSON.parse(JSON.stringify(questionTypeKFP));

  let questionTypeKFPData = await question_answers.aggregate([
      {"$match":{"created_at":{"$gte":lastWeekDate, "$lte" :currenDate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
      { "$project": {
          "week":1,
          "count":1,
          "dayOfWeek": 1,
       },
      },
      {$sort:{"_id.week" : 1}}
    ])

    let incOrDec
    if(questionTypeKFPData.length > 0){
      if(questionTypeKFPData.length < 2){
        var weeknumber = moment(middleDate).week();
        if (questionTypeKFPData[0]._id.week >= weeknumber){
            incOrDec = 100
        }else {
          incOrDec = 0
        }
      } else{
        let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
        let calculation = ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
        if (calculation > 100){
          incOrDec = 100
        }else {
          incOrDec = calculation
        }
      }
    } else {
      incOrDec = 0
    }

  res.send({questionTypeKFPData, incOrDec})
}

/// for case and user question
module.exports.WeekDataDifferenceCaseAndUser = async (req, res) => {
  const questions = db.get('questions');
  let question_answers
  let questionType = req.body.questionType

  if (questionType === '5d15fea98edfed6c417592d14'){
    question_answers = db.get('case_comments');
  } else{
    question_answers = db.get('student_comments');
  }

  let protoDate = new Date().getTime()
  let currenDate = protoDate - (7* 24 * 60 * 60 * 1000);
  let lastWeekDate = protoDate - (21* 24 * 60 * 60 * 1000);
  let middleDate = protoDate - (14* 24 * 60 * 60 * 1000);

  let questionTypeKFP = await questions.distinct("_id",{'publish':1,'questiontype': { $in: [questionType] }})
    var myJSON = JSON.parse(JSON.stringify(questionTypeKFP));

  let questionTypeKFPData = await question_answers.aggregate([
      {"$match":{"created_at":{"$gte":lastWeekDate, "$lte" :currenDate},'parentqid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
      { "$project": {
          "week":1,
          "count":1,
          "dayOfWeek": 1,
       },
      },
      {$sort:{"_id.week" : 1}}
    ])
    if(questionTypeKFPData.length > 0){
      if(questionTypeKFPData.length < 2){
        var weeknumber = moment(middleDate).week();
        let incOrDec
        if (questionTypeKFPData[0]._id.week >= weeknumber){
            incOrDec = 100
        }else {
          incOrDec = 0
        }
      } else{
        let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
        let calculation =  ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
        if (calculation > 100){
          incOrDec = 100
        }else {
          incOrDec = calculation
        }
      }
    } else {
      incOrDec = 0
    }
    res.send({questionTypeKFPData, incOrDec})
}

module.exports.getviewsweeklychanges = async (req, res) => {
  const questions = db.get('questions');
  const question_answers = db.get('question_views');

   let questionType = req.body.questionType

   let protoDate = new Date().getTime()
   let currenDate = protoDate - (7* 24 * 60 * 60 * 1000);
   let lastWeekDate = protoDate - (21* 24 * 60 * 60 * 1000);
   let middleDate = protoDate - (14* 24 * 60 * 60 * 1000);

   let questionTypeKFP = await questions.distinct("_id",{'publish':1,'questiontype': { $in: [questionType] }})
   var myJSON = JSON.parse(JSON.stringify(questionTypeKFP));
   let questionTypeKFPData = await question_answers.aggregate([
      {"$match":{"created_at":{"$gte":lastWeekDate, "$lte" :currenDate},'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
       {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
       { "$project":
        {
          "week":1,
          "count":1,
          "dayOfWeek": 1,
        },
      },
      {$sort:{"_id.week" : 1}}
    ])
  let incOrDec
  if(questionTypeKFPData.length > 0){
    if(questionTypeKFPData.length < 2){
      var weeknumber = moment(middleDate).week();
      if (questionTypeKFPData[0]._id.week >= weeknumber){
          incOrDec = 100
      }else {
        incOrDec = 0
      }
    } else{
      let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
      let calculation =  ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
      if (calculation > 100){
        incOrDec = 100
      }else {
        incOrDec = calculation
      }
    }
  } else {
    incOrDec = 0
  }

res.send({questionTypeKFPData, incOrDec})}


  //  month data percentage
  module.exports.monthDataDiffrence = async (req, res) => {
    const questions = db.get('questions');
    const question_answers = db.get('question_answers');

    let questionType = req.body.questionType

    var currentDate = new Date()
    var lastWeekDate = new Date()
    currentDate.setDate(1);
    lastWeekDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth()).valueOf();
    lastWeekDate.setMonth(lastWeekDate.getMonth()-2).valueOf();

    let endDate = currentDate.valueOf();
    let startDate = lastWeekDate.valueOf();
    let endMonth = currentDate.getMonth()


    let questionTypeKFP = await questions.distinct("_id",{'publish':1,'questiontype': { $in: [questionType] }})
      var myJSON = JSON.parse(JSON.stringify(questionTypeKFP));

    let questionTypeKFPData = await question_answers.aggregate([
        {"$match":{'questionid':{'$in':myJSON}, "created_at":{"$gte":startDate, "$lte" :endDate}}},
        { $addFields: { 'month': {$month:{$toDate:'$created_at'}},'year': {$year:{$toDate:'$created_at'}}} },
        {"$group" : {_id:{month:"$month", year:"$year"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
        { "$project": {
          "month":1,
          "count":1,
          "daydate":1,
          "year":1
         },
        },
        {$sort:{"_id.year" : 1 , "_id.month" : 1}}
      ])

      let incOrDec
      if(questionTypeKFPData.length > 0){
        if(questionTypeKFPData.length == 1 && questionTypeKFPData[0]._id.month == endMonth){
          incOrDec = 100
        } else if(questionTypeKFPData.length ==2 ){
          let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
          incOrDec = ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
        } else{
          incOrDec = 0
        }
      } else {
        incOrDec = 0
      }
    res.send({incOrDec})
  }

  module.exports.monthDataDiffrenceCaseAndUser = async (req, res) => {
    const questions = db.get('questions');
    let question_answers
    let questionType = req.body.questionType

    if (questionType === '5d15fea98edfed6c417592d14'){
      question_answers = db.get('case_comments');
    } else{
      question_answers = db.get('student_comments');
    }


    var currentDate = new Date()
    var lastWeekDate = new Date()
    currentDate.setDate(1);
    lastWeekDate.setDate(1);
    currentDate.setMonth(currentDate.getMonth()).valueOf();;
    lastWeekDate.setMonth(lastWeekDate.getMonth()-2).valueOf();;

    let endDate = currentDate.valueOf();
    let startDate = lastWeekDate.valueOf();
    let endMonth = currentDate.getMonth();

    let questionTypeKFP = await questions.distinct("_id",{'publish':1,'questiontype': { $in: [questionType] }})
      var myJSON = JSON.parse(JSON.stringify(questionTypeKFP));

    let questionTypeKFPData = await question_answers.aggregate([
        {"$match":{'parentqid':{'$in':myJSON}, "created_at":{"$gte":startDate, "$lte" :endDate}}},
        { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
        {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
        { "$project": {
          "month":1,
          "count":1,
      }
    },
    {$sort:{"_id.year" : 1 , "_id.month" : 1}}
      ])

      let incOrDec
      if(questionTypeKFPData.length > 0){
        if(questionTypeKFPData.length == 1 && questionTypeKFPData[0]._id.month == endMonth){
          incOrDec = 100
        } else if(questionTypeKFPData.length ==2 ){
          let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
          incOrDec = ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
        } else{
          incOrDec = 0
        }
      } else {
        incOrDec = 0
      }
    res.send({incOrDec})
  }

  // month data percentage for views
module.exports.monthDataDiffrenceViews = async (req, res) => {
  const questions = db.get('questions');
  const question_answers = db.get('question_views');

  let questionType = req.body.questionType

  var currentDate = new Date()
	var lastWeekDate = new Date()
  currentDate.setDate(1);
	lastWeekDate.setDate(1);
  currentDate.setMonth(currentDate.getMonth()).valueOf();
  lastWeekDate.setMonth(lastWeekDate.getMonth()-2).valueOf();

  //console.log("currentDate", currentDate)
  //console.log("lastWeekDate", lastWeekDate)


  let endDate = currentDate.valueOf();
  let startDate = lastWeekDate.valueOf();
  let endMonth = currentDate.getMonth()

  let questionTypeKFP = await questions.distinct("_id",{'publish':1,'questiontype': { $in: [questionType] }})
    var myJSON = JSON.parse(JSON.stringify(questionTypeKFP));

  let questionTypeKFPData = await question_answers.aggregate([
      {"$match":{'questionid':{'$in':myJSON}, "created_at":{"$gte":startDate, "$lte" :endDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}},'year': {$year:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month", year:"$year"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,
        "year":1
       },
      },
      {$sort:{"_id.year" : 1 , "_id.month" : 1}}
    ])

    let incOrDec
    if(questionTypeKFPData.length > 0){
      if(questionTypeKFPData.length == 1 && questionTypeKFPData[0]._id.month == endMonth){
        incOrDec = 100
      } else if(questionTypeKFPData.length ==2 ){
        let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
        incOrDec = ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
      } else{
        incOrDec = 0
      }
    } else {
      incOrDec = 0
    }
  res.send({incOrDec, questionTypeKFPData})
}


  // weekly data percentage for question(s)
module.exports.weeklyQuestionPercentage = async (req, res) => {
  const questions = db.get('questions');
  let questionType = req.body.questionType


  let protoDate = new Date().getTime()
  let currenDate = protoDate - (7* 24 * 60 * 60 * 1000);
  let lastWeekDate = protoDate - (21* 24 * 60 * 60 * 1000);
  let middleDate = protoDate - (14* 24 * 60 * 60 * 1000);

  let questionTypeKFPData = await questions.aggregate([
      {"$match":{"created_at":{"$gte":lastWeekDate, "$lte" :currenDate},'questiontype':{'$in':[questionType]}}},
      { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
      { "$project": {
          "week":1,
          "count":1,
          "dayOfWeek": 1,
       },
      },
      {$sort:{"_id.week" : 1}}
    ])
      let incOrDec
      if(questionTypeKFPData.length > 0){
        if(questionTypeKFPData.length < 2){
          var weeknumber = moment(middleDate).week();
          if (questionTypeKFPData[0]._id.week >= weeknumber){
              incOrDec = 100
          }else {
            incOrDec = 0
          }
        } else{
          let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
          let calculation =  ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
          if (calculation > 100){
            incOrDec = 100
          }else {
            incOrDec = calculation
          }
        }
      } else {
        incOrDec = 0
      }
  res.send({questionTypeKFPData, incOrDec})
}

  // MOnthly data percentage for question(s)
module.exports.monthlyQuestionPercentage = async (req, res) => {
  const questions = db.get('questions');
  let questionType = req.body.questionType


  var currentDate = new Date()
	var lastWeekDate = new Date()
  currentDate.setDate(1);
	lastWeekDate.setDate(1);
  currentDate.setMonth(currentDate.getMonth()).valueOf();
  lastWeekDate.setMonth(lastWeekDate.getMonth()-2).valueOf();

  let endDate = currentDate.valueOf();
  let startDate = lastWeekDate.valueOf();
  let endMonth = currentDate.getMonth()


  let questionTypeKFPData = await questions.aggregate([
      {"$match":{'questiontype':{'$in':[questionType]}, "created_at":{"$gte":startDate, "$lte" :endDate}}},
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}}} },
      { $addFields: { 'month': {$month:{$toDate:'$created_at'}},'year': {$year:{$toDate:'$created_at'}}} },
      {"$group" : {_id:{month:"$month", year:"$year"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
      { "$project": {
        "month":1,
        "count":1,
        "daydate":1,
        "year":1
       },
      },
      {$sort:{"_id.year" : 1 , "_id.month" : 1}}
    ])
    let incOrDec
    if(questionTypeKFPData.length > 0){
      if(questionTypeKFPData.length == 1 && questionTypeKFPData[0]._id.month == endMonth){
        incOrDec = 100
      } else if(questionTypeKFPData.length == 2 ){
        let toCompare = Math.round(questionTypeKFPData[1].count-questionTypeKFPData[0].count)
        let calculation = ((toCompare*100)/questionTypeKFPData[0].count).toFixed(2)
        if (calculation > 100){
          incOrDec = 100
        }else [
          incOrDec = calculation
        ]
      } else{
        incOrDec = 0
      }
    } else {
      incOrDec = 0
    }

  res.send({questionTypeKFPData, incOrDec})
}

  // Study Plan
  exports.StudyPlanDataPerWeek = function(req,res)
  {
    const studyplan_duedates= db.get('studyplan_duedates');
    const studyplan_views= db.get('studyplan_views');

    const notes= db.get('notes');
    const studyplan_topicreminders= db.get('studyplan_topicreminders');


      var counter = -1;
      var question_answerfinal=[{'usercount':0,'completecount':0,'notecount':0,'remindercount':0,}]
      asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
      {

        let protoDate = new Date()
        let currenDate = protoDate.setDate(protoDate.getDate() - 7);
        let lastWeekDate = protoDate.setDate(protoDate.getDate() - 21);

          counter++;
          studyplan_views.aggregate([
          {"$match":  {"created_at":{"$gte":lastWeekDate, "$lte" :currenDate}}},
          { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
          {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
          { "$project": {
              "week":1,
              "count":1,
              "dayOfWeek": 1,
          },
          },
        {$sort:{"_id.week" : 1}}
          ])
          .then(function(getuserviews){
            let incOrDec
            if (getuserviews > 0){
              if (getuserviews < 2){
                incOrDec = 0
              } else {
                let toCompare = Math.round(getuserviews[1].count-getuserviews[0].count)
               incOrDec = ((toCompare*100)/getuserviews[0].count).toFixed(2)
               question_answerfinal[counter]['usercount']= incOrDec
              }
            }

            studyplan_duedates.aggregate([
              {"$match":  {"created_at":{"$gte":lastWeekDate, "$lte" :currenDate}, "chkbox_status":1}},
              { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
              {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
              { "$project": {
                "week":1,
                "count":1,
                "dayOfWeek": 1,
              },
              },
            {$sort:{"_id.week" : 1}}
            ])
            .then(function(getcompletecount){

              let incOrDec
              if (getcompletecount > 0){
                if (getcompletecount < 2){
                  incOrDec = 0
                } else {
                let toCompare = Math.round(getcompletecount[1].count-getcompletecount[0].count)
                incOrDec = ((toCompare*100)/getcompletecount[0].count).toFixed(2)
                question_answerfinal[counter]['completecount'] = incOrDec;
                }
              }

              notes.aggregate([
                {"$match":  {"created_at":{"$gte":lastWeekDate, "$lte" :currenDate}, "chkbox_status":1}},
                { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
                {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
                { "$project": {
                  "week":1,
                  "count":1,
                  "dayOfWeek": 1,
                },
                },
              {$sort:{"_id.week" : 1}}
              ])

              .then(function(getnotes){
                let incOrDec
                if (getnotes > 0){
                  if (getnotes < 2){
                    incOrDec = 0
                  } else {
                  let toCompare = Math.round(getnotes[1].count-getnotes[0].count)
                  incOrDec = ((toCompare*100)/getnotes[0].count).toFixed(2)
                  question_answerfinal[counter]['notecount'] = incOrDec;
                  }
                }
                studyplan_topicreminders.aggregate([
                  {"$match":  {"created_at":{"$gte":lastWeekDate, "$lte" :currenDate}, "chkbox_status":1}},
                  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
                  {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
                  { "$project": {
                    "week":1,
                    "count":1,
                    "dayOfWeek": 1,
                  },
                  },
                  {$sort:{"_id.week" : 1}}
                ])

                .then(function(getreminders){
                  let incOrDec
                  if (getreminders > 0){
                    if (getreminders < 2){
                      incOrDec = 0
                    } else {
                      let toCompare = Math.round(getreminders[1].count-getreminders[0].count)
                      incOrDec = ((toCompare*100)/getreminders[0].count).toFixed(2)
                  question_answerfinal[counter]['remindercount'] = incOrDec;
                  }
                }
                  next();
                }).catch(function(error){
                   next();
                });
              }).catch(function(error){
                 next();
              });
            }).catch(function(error){
              next();
            });
          }).catch(function(error){
            next();
          });

      }, function (err)
          {
              if (err)
              {
                  console.error('Inner Error: ' + err.message);
                  // return;
              }
              res.json({question_answerfinal});
          });
  }

  // study plan month data
  exports.StudyPlanDataPerMonth = function(req,res)
  {
    const studyplan_duedates= db.get('studyplan_duedates');
    const studyplan_views= db.get('studyplan_views');
    const notes= db.get('notes');
    const studyplan_topicreminders= db.get('studyplan_topicreminders');


      var counter = -1;
      var question_answerfinal=[{'usercount':0,'completecount':0,'notecount':0,'remindercount':0,}]
      asyncLoop(question_answerfinal, function (question_answerfinaldata, next)
      {

        var currentDate = new Date()
        var lastWeekDate = new Date()
        currentDate.setDate(1);
        lastWeekDate.setDate(1);
        currentDate.setMonth(currentDate.getMonth()).valueOf();
        lastWeekDate.setMonth(lastWeekDate.getMonth()-2).valueOf();

        let endDate = currentDate.valueOf();
        let startDate = lastWeekDate.valueOf();
        let endMonth = currentDate.getMonth()


          counter++;
          studyplan_views.aggregate([
          {"$match":  {"created_at":{"$gte":endDate, "$lte" :startDate}}},
          { $addFields: { 'month': {$month:{$toDate:'$created_at'}},'year': {$year:{$toDate:'$created_at'}}} },
          {"$group" : {_id:{month:"$month", year:"$year"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
          { "$project": {
            "month":1,
            "count":1,
            "daydate":1,
            "year":1
           },
          },
          {$sort:{"_id.year" : 1 , "_id.month" : 1}}
          ])
          .then(function(getuserviews){
            let incOrDec
            if (getuserviews > 0){
              if (getuserviews < 2){
                incOrDec = 0
              } else {
                let toCompare = Math.round(getuserviews[1].count-getuserviews[0].count)
               incOrDec = ((toCompare*100)/getuserviews[0].count).toFixed(2)
               question_answerfinal[counter]['usercount']= incOrDec
              }
            }

            studyplan_duedates.aggregate([
              {"$match":  {"created_at":{"$gte":endDate, "$lte" :startDate}, "chkbox_status":1}},
              { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
              { $addFields: { 'month': {$month:{$toDate:'$created_at'}},'year': {$year:{$toDate:'$created_at'}}} },
              {"$group" : {_id:{month:"$month", year:"$year"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
              { "$project": {
                "month":1,
                "count":1,
                "daydate":1,
                "year":1
              },
              },
              {$sort:{"_id.year" : 1 , "_id.month" : 1}}
          ])
            .then(function(getcompletecount){

              let incOrDec
              if (getcompletecount > 0){
                if (getcompletecount < 2){
                  incOrDec = 0
                } else {
                let toCompare = Math.round(getcompletecount[1].count-getcompletecount[0].count)
                incOrDec = ((toCompare*100)/getcompletecount[0].count).toFixed(2)
                question_answerfinal[counter]['completecount'] = incOrDec;
                }
              }

              notes.aggregate([
                {"$match":  {"created_at":{"$gte":endDate, "$lte" :startDate}, "chkbox_status":1}},
                { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
                {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
                { "$project": {
                  "month":1,
                  "count":1,
                  }
                },
                {$sort:{"_id.month":1,}}
              ])
              .then(function(getnotes){

                let incOrDec
                if (getnotes > 0){
                  if (getnotes < 2){
                    incOrDec = 0
                  } else {
                  let toCompare = Math.round(getnotes[1].count-getnotes[0].count)
                  incOrDec = ((toCompare*100)/getnotes[0].count).toFixed(2)
                  question_answerfinal[counter]['notecount'] = incOrDec;
                  }
                }
                studyplan_topicreminders.aggregate([
                  {"$match":  {"created_at":{"$gte":endDate, "$lte" :startDate}, "chkbox_status":1}},
                  { $addFields: { 'week': {$isoWeek:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
                  {"$group" : {_id:{month:"$month"}, count:{$sum:1},daydate:{$last:{$toDate:'$created_at'}}}},
                  { "$project": {
                    "month":1,
                    "count":1,
                    }
                  },
                  {$sort:{"_id.month":1,}}
                ])

                .then(function(getreminders){
                  let incOrDec
                  if (getreminders > 0){
                    if (getreminders < 2){
                      incOrDec = 0
                    } else {
                      let toCompare = Math.round(getreminders[1].count-getreminders[0].count)
                      incOrDec = ((toCompare*100)/getreminders[0].count).toFixed(2)
                  question_answerfinal[counter]['remindercount'] = incOrDec;
                  }
                }
                  next();
                }).catch(function(error){
                   next();
                });
              }).catch(function(error){
                 next();
              });
            }).catch(function(error){
              next();
            });
          }).catch(function(error){
            next();
          });

      }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json({question_answerfinal});
        });
  }

  module.exports.handleNotification = async (req, res) => {

      let user = req.body.user;
      const options = {upsert: true,returnNewDocument: true};
      const appNotification = db.get('appNotification');

     try{
       let alreadyShown = await appNotification.find({"user": user})

      //  console.log("alreadyShown", alreadyShown)
       if(alreadyShown.length > 0){
         res.send({
            "message": `already shown by user`,
            "shown": false
         })
       }
       if (req.body.hidePopUp == true){
        appNotification.findOneAndUpdate({"user":user},{$set:{
          user,
          "shown": true
        }},options).then(function(data){
          res.send("updated")
        })
       }else{
          res.send({
            "message": "you are first time user",
            "shown": true
          })
        }
     }catch(errr){
       res.send(`there is an error`)
     }
  }

 // send link via mobile number
module.exports.sendLinkViaMessage = async (req, res) => {
  const axios = require('axios');
  const AppLinkEntry = db.get('app_link_entry')

  let mobileNumber = req.body.mobileNumber;
  let user =  req.body.user;
  let platform

  let link
  if(req.body.platform === 1){
    link = "Download the GPEx Exams app for iPhone : https://play.google.com/store/apps/details?id=com.gpexcommunity Requested using GPEx Exams."
    platform = "Android"
  }else {
    link = "Download the GPEx Exams app for iPhone : https://apps.apple.com/au/app/gpex-exams-collective/id1480212027 Requested using GPEx Exams."
    platform = "Iphone"
  }

  let finalLink = `http://world.msg91.com/api/sendhttp.php?authkey=7344AiMbiuz0JvK5e745ff1P123&mobiles=${mobileNumber}&message=${link}&sender=GPExSA&route=4&country=0`

  axios.post(finalLink)
  .then(async (response) => {
  // //console.log("respnse", response)
  await AppLinkEntry.insert({
    mobileNumber,
    platform,
    user,
    "created_at": Date.now()
  }, (err) => {
  //console.log("error", err)

    if (!err){
      res.send({
        "message": `link successfully sent to ${mobileNumber}`,
        "status": true,
        "error": null,
      })
    }
  })
  })
  .catch(error => {
  //console.log("error", error)
  res.send({
    "message": `there is problem while sendting link`,
    "status": false,
    "error": error,
  })
  });
  }

//question report types
exports.questionReport = async function(req,res)
{
  const Questions = db.get('questions');
  const QuestionsViews = db.get('question_views');
  const QuestionsAnswer = db.get('question_answers');
  const CaseComments= db.get('case_comments');
  const UserAnswer= db.get('student_comments');



  var questionType = req.body.questionType;

  let allQuestion = await Questions.aggregate([
    {$match: {"questiontype": questionType}},
  ])

  var QuestionsAnswerData = 0
  var QuestionsViewsData = 0
if (allQuestion.length > 0){
  asyncLoop(allQuestion, async function (singleAnswer, next)
    {
      if (questionType === "5d15fea98edfed6c417592d14"){
        let QuestionsAnswerQuery = await CaseComments.find({'parentid':null, 'parentqid':singleAnswer._id.toString()});
        QuestionsAnswerData += QuestionsAnswerQuery.length

      }else if (questionType === "5d15fea98edfed6c417592d16"){
        let QuestionsAnswerQuery = await UserAnswer.find({'parentqid':singleAnswer._id.toString()});
        QuestionsAnswerData += QuestionsAnswerQuery.length
      } else {
        let QuestionsAnswerQuery = await QuestionsAnswer.find({'questionid':singleAnswer._id.toString()});
        QuestionsAnswerData += QuestionsAnswerQuery.length
      }

      let questionViewsQuery = await QuestionsViews.find({'questionid':singleAnswer._id.toString()});
      QuestionsViewsData += questionViewsQuery.length

      next()
    }, (err) => {
      if (err){
        res.send({
          "message": 'data not found',
          "status": false,
          "data": [],
          "QuestionsAnswerData":[],
          "QuestionsViewsData": []
        })
      }else{
        if(allQuestion.length > 0){
          let allQuestionLength = allQuestion.length
          res.send({
            "message": 'data found',
            "status": true,
            "data": allQuestionLength,
            "QuestionsAnswerData": QuestionsAnswerData,
            "QuestionsViewsData": QuestionsViewsData,
          })
        }else{
          res.send({
            "message": 'data not found',
            "status": false,
            "data": [],
            "QuestionsAnswerData": [],
            "QuestionsViewsData": []
          })
        }
      }
    })
  }else {
    res.send({
      "message": 'data found',
      "status": true,
      "data": [],
      "QuestionsAnswerData": [],
      "QuestionsViewsData": []
    })
  }

}

// let check send link report
module.exports.sendLinkReport = async (req, res) => {
  const AppLinkEntry = db.get('app_link_entry')

  try {
    let linkEntryReport = await AppLinkEntry.aggregate([
      {$lookup:
        {
            from: "users",
            localField: "user",
            foreignField: "unique_id",
            as: "userDetails"
        }
      },
      { "$unwind": "$userDetails" }
    ])
    if (linkEntryReport.length > 0){
      res.send({
        "message": `data found`,
        "status": true,
        "data": linkEntryReport
      })
    }else {
      res.send({
        "message": `no data found`,
        "status": false,
        "data": []
      })
    }
  } catch (error) {
    //console.log("eror from link Entry Report, ", error)
    res.send({
      "message": `there is an error`,
      "status": false,
      "data":[]
    })
  }

}