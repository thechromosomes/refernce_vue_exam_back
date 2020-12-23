// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
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
module.exports.getviewsweeklychanges = async (req, res) => {
  const questions = db.get('questions');
  const question_answers = db.get('question_views');
  let questionType = req.body.questionType;
  let questionTypeKFP = await questions.distinct("_id",{'publish':1,'questiontype': { $in: [questionType] }})
    var myJSON = JSON.parse(JSON.stringify(questionTypeKFP));

  let questionTypeKFPData = await question_answers.aggregate([
      {"$match":{'questionid':{'$in':myJSON}}},
      { $addFields: { 'week': {$month:{$toDate:'$created_at'}},'dayOfWeek': {$toDate:'$created_at'}}  },
      {"$group" : {_id:{week:"$week"}, count:{$sum:1}}},
      { "$project": {
          "week":1,
          "count":1,
          "dayOfWeek": 1,
       },
      },
      {$sort:{"week" : 1}}
    ])

  res.send({questionTypeKFPData})
}
exports.getMostactiveusers = function(req,res)
{
  var curdate=new Date(new Date().setHours(0, 0, 0, 0));
  todaycurdate=curdate.getTime()-19800000;
  var date = new Date();
var weekdate = (new Date(date.getTime() - (7 * 24 * 60 * 60 * 1000))).getTime();
//var monthdate = (new Date(date.getTime() - (30 * 24 * 60 * 60 * 1000))).getTime();
  const community_logs= db.get('community_logs');
     community_logs.aggregate([

       {"$group" : {_id:{userid:"$userid"}, count:{$sum:1}}},
       {
        $lookup:
        {
                   from: "users",
                   localField: "_id.userid",
                   foreignField: "unique_id",
                   as: "userdetail"
        }
    },
    { "$unwind": "$userdetail" },
    {"$match":{"module" : "login","created_at":{$gte:weekdate},"userdetail.role" :{$ne:[1]}}},
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
exports.getactiveuserweekchurnrate = function(req,res)
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
            res.json({'result':(commenthisweek.length*100/countdata[1].length).toFixed(2)});
           // res.json({'labels':commenthisweek,'countdata':countdata});
        });
    }).catch(function(error){
      //console.log(error);
res.json([])
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
  res.json(startcurdate+' '+endcurdate);
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
exports.getChangeArticledashdata = function(req,res)
{
  const article_views= db.get('article_views');
  article_views.find({}).then(function(getquestions){
         res.send({'count':getquestions.length});
        }).catch(function(error){
          res.send({'count':0});
        });

}
//****************************************************************************

exports.getChangeActiveuserDaysdata = function(req,res)
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
  exports.getChangeActiveuserMonthchurndata = function(req,res)
{
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
  exports.getChangeActiveuserWeekdata = function(req,res)
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
  var startweeknum=currweeknum-7;
  for(startweeknum;startweeknum<=currweeknum;startweeknum++){
    labeldata.push(startweeknum);
    countdata.push(0);
    labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
  }
//res.json(labeldata);
  community_logs.aggregate([
    {$match:{"module" : "login",'created_at':{"$gte":startweedate}}},
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
   // res.json(userdatas);
     var counter=-1;
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
      //console.log('currentdate before set',userdata.daydate);
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
if(labeldata.indexOf(userdata._id.week)<0){
  labeldata.push(userdata._id.week);
  if(labeldatarng.indexOf(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear))<0){
    labeldatarng.push(exports.getDateFromWeek(userdata._id.week,curyear)+' - '+exports.getDateToWeek(userdata._id.week,curyear));
    }countdata[labeldata.indexOf(userdata._id.week)]=1;

}else{
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
                // return;
            }
            res.json({'labels':labeldatarng,'countdata':countdata});
        });
    }).catch(function(error){
      //console.log(error);
res.json([])
    });
  }

  exports.getChangeActiveuserWeekchurndata = function(req,res)
  {
    var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const community_logs= db.get('community_logs');
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
       var labeldata=[];
       var countdata=[];
      asyncLoop(userdatas, function (userdata, next)
      {
        counter++;
        var lastdatacount=0;
        var firstday='';
        var lastday='';
        //console.log('currentdate before set',userdata.daydate);
        const curr = userdata.daydate;
        // get current date
  var first = curr.getDate() - curr.getDay()+(curr.getDay() === 0 ? -6 : 1); // First day is the day of the month - the day of the week
  var last = first + 6; // last day is the first day + 6
  //console.log('curdate'+userdata.daydate+' '+curr.getDate()+'-'+curr.getDay()+'first='+first+'last'+last);
  firstday = moment(curr.setDate(first)).format("DD MMM");
  const curr1 = userdata.daydate;
  //console.log('currentdate after set',curr1);

  lastday = moment(curr1.setDate(last)).format("DD MMM");
  //console.log('firstday',firstday);
  //console.log('lastday',lastday);
  if(labeldata.indexOf(firstday+' - '+lastday)<0){
    labeldata.push(firstday+' - '+lastday);
    countdata[labeldata.indexOf(firstday+' - '+lastday)]=1;
  }else{
    countdata[labeldata.indexOf(firstday+' - '+lastday)]=countdata[labeldata.indexOf(firstday+' - '+lastday)]+1;
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
              res.json({'labels':labeldata,'countdata':countdata});
          });
      }).catch(function(error){
  res.json([])
      });
    }
exports.getChangeQuestionDaysdata = function(req,res)
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
exports.getChangeQuestionMonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  questions.aggregate([
    {$match:{"publish" : 1}},
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
  exports.getChangeQuestionViewsMonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const question_views= db.get('question_views');
  question_views.aggregate([
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
  exports.getChangeQuestionAnswersMonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const question_answers= db.get('question_answers');
  question_answers.aggregate([
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
  exports.getChangeQuestionWeekdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
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
    asyncLoop(userdatas, function (userdata, next)
    {
      counter++;
      //var curr = userdata.dayOfWeek // get current date
      var curyear = moment(userdata.dayOfWeek).format('YYYY');
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          }
        countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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
            res.json({'labels':labeldatarng,'countdata':countdata});
        });
    }).catch(function(error){
      //console.log(error);
res.json([])
    });
  }
  exports.getSBAviewsdaysdata = function(req,res)
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
  for (var i=0; i<14; i++) {
      var d = new Date(new Date().setHours(0, 0, 0, 0));
      d.setDate(d.getDate() - i);
      countdata.push(0);
      daydatas.push(d.getTime());
      labeldata.push(new Date(d.getTime()).getDate()+' '+months[new Date(d.getTime()).getMonth()])
  }
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
      exports.getKFPquestionanswersdaysdata = function(req,res)
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

exports.getSBAviewsweekdata = function(req,res)
{
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
var startweeknum=currweeknum-7;
for(startweeknum;startweeknum<=currweeknum;startweeknum++){
  labeldata.push(startweeknum);
  countdata.push(0);
  labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
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
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          }
          countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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

exports.getSBAquestionsweekdata = function(req,res)
{
  //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
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
//res.json(labeldata);
questions.aggregate([
    {"$match":{'created_at':{"$gte":startweedate},'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}},
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
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
        labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
        }
        countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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

exports.getSBAquestionanswersweekdata = function(req,res)
{
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
var startweeknum=currweeknum-7;
for(startweeknum;startweeknum<=currweeknum;startweeknum++){
  labeldata.push(startweeknum);
  countdata.push(0);
  labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
}
  questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));

question_answers.aggregate([
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
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          }
        countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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
exports.getKFPviewsweekdata = function(req,res)
{
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
var startweeknum=currweeknum-7;
for(startweeknum;startweeknum<=currweeknum;startweeknum++){
  labeldata.push(startweeknum);
  countdata.push(0);
  labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
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
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          }
        countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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
exports.getKFPquestionsweekdata = function(req,res)
{
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
 var startweeknum=currweeknum-7;
 for(startweeknum;startweeknum<=currweeknum;startweeknum++){
   labeldata.push(startweeknum);
   countdata.push(0);
   labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
 }
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
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);

        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          }
        countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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
            res.json({'labels':labeldatarng,'countdata':countdata});
        });
    }).catch(function(error){
      //console.log(error);
res.json([])
    });

}
exports.getKFPquestionanswersweekdata = function(req,res)
{
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
var startweeknum=currweeknum-7;
for(startweeknum;startweeknum<=currweeknum;startweeknum++){
  labeldata.push(startweeknum);
  countdata.push(0);
  labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
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
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          }
        countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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
exports.getCASEviewsweekdata = function(req,res)
{
  const questions= db.get('questions');
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
      if(labeldata.indexOf(caseuserdata.week)<0){
        labeldata.push(caseuserdata.week);
        if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
          }
        countdata[labeldata.indexOf(caseuserdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
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
exports.getCASEquestionsweekdata = function(req,res)
{
  const questions= db.get('questions');
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
var startweeknum=currweeknum-7;
for(startweeknum;startweeknum<=currweeknum;startweeknum++){
  labeldata.push(startweeknum);
  countdata.push(0);
  labeldatarng.push(exports.getDateFromWeek(startweeknum,curyear1)+' - '+exports.getDateToWeek(startweeknum,curyear1));
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
      if(labeldata.indexOf(caseuserdata.week)<0){
        labeldata.push(caseuserdata.week);

        if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
          }
        countdata[labeldata.indexOf(caseuserdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
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
            res.json({'labels':labeldatarng,'countdata':countdata});
        });
    }).catch(function(error){
      //console.log(error);
res.json([])
    });

}
exports.getCASEquestionanswersweekdata = function(req,res)
{
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');
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
  questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
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
   ]).then(function(caseuserdatas){
  //res.json(caseuserdatas)
     var counter=-1;
    asyncLoop(caseuserdatas, function (caseuserdata, next)
    {
      counter++;
      var curyear = moment(caseuserdata.dayOfWeek).format('YYYY');
      if(labeldata.indexOf(caseuserdata.week)<0){
        labeldata.push(caseuserdata.week);

        if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
          }
        countdata[labeldata.indexOf(caseuserdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(caseuserdata.week,curyear)+' - '+exports.getDateToWeek(caseuserdata.week,curyear));
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
exports.getArticleviewsweekdata = function(req,res)
{
  //var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const article_views= db.get('article_views');
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
      if(labeldata.indexOf(userdata.week)<0){
        labeldata.push(userdata.week);

        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
          }
        countdata[labeldata.indexOf(userdata.week)]=1;

      }else{
        if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
          labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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
            res.json({'labels':labeldatarng,'countdata':countdata});
        });
    }).catch(function(error){
res.json([])
    });

}
exports.getSBAviewsmonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  const question_views= db.get('question_views');
  questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
    {"$match":{'questionid':{'$in':myJSON}}},
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
  }).catch(function(error){
    res.json([])
        });
}
exports.getSBAquestionsmonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  //const question_views= db.get('question_views');
  //questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
    //var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    questions.aggregate([
    {"$match":{'questiontype':{$nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14']}}},
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
exports.getSBAquestionanswersmonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');
  questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_answers.aggregate([
    {"$match":{'questionid':{'$in':myJSON}}},
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
  }).catch(function(error){
    res.json([])
        });
}
exports.getKFPviewsmonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  const question_views= db.get('question_views');
  questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
    {"$match":{'questionid':{'$in':myJSON}}},
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
  }).catch(function(error){
    res.json([])
        });
}
exports.getKFPquestionsmonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  //const question_views= db.get('question_views');
  //questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
   // var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    questions.aggregate([
    {"$match":{'questionid':{$in: ['5d15fea98edfed6c417592d9']}}},
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
exports.getKFPquestionanswersmonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');
  questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d9'] }}).then(function(sbaquestions){
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_answers.aggregate([
    {"$match":{'questionid':{'$in':myJSON}}},
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
  }).catch(function(error){
    res.json([])
        });
}
exports.getCASEviewsmonthdata = function(req,res)
{

  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  const question_views= db.get('question_views');
  questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
  question_views.aggregate([
    {"$match":{'questionid':{'$in':myJSON}}},
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
  }).catch(function(error){
    res.json([])
        });
}
exports.getCASEquestionsmonthdata = function(req,res)
{

  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  //const question_views= db.get('question_views');
  //questions.distinct("_id",{'publish':1,'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
    //var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    questions.aggregate([
    {"$match":{'questiontype':{$in: ['5d15fea98edfed6c417592d14']}}},
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
exports.getCASEquestionanswersmonthdata = function(req,res)
{

  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const questions= db.get('questions');
  const question_answers= db.get('question_answers');
  questions.distinct("_id",{'publish':1,'questiontype': { $in: ['5d15fea98edfed6c417592d14'] }}).then(function(sbaquestions){
    var myJSON = JSON.parse(JSON.stringify(sbaquestions));
    question_answers.aggregate([
    {"$match":{'questionid':{'$in':myJSON}}},
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
  }).catch(function(error){
    res.json([])
        });
}
exports.getArticleviewsmonthdata = function(req,res)
{
  var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const article_views= db.get('article_views');
  article_views.aggregate([
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
  exports.getChangeQuestionAnswersWeekdata = function(req,res)
  {
    var months = ["month","Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const question_answers= db.get('question_answers');
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
        if(labeldata.indexOf(userdata.week)<0){
          labeldata.push(userdata.week);
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
            }
          countdata[labeldata.indexOf(userdata.week)]=1;

        }else{
          if(labeldatarng.indexOf(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear))<0){
            labeldatarng.push(exports.getDateFromWeek(userdata.week,curyear)+' - '+exports.getDateToWeek(userdata.week,curyear));
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
              res.json({'labels':labeldatarng,'countdata':countdata});
          });
      }).catch(function(error){
  res.json([])
      });
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
         next();
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

      // User Dashboard count
      exports.questionanswered = async function(req, res){
        const userid = req.body.userid;
        // sba
        const  question_answers_sba =  db.get('question_answers');
        // case
        const case_comments = db.get('case_comments');
        const kfpquestion_Answer = db.get('kfpquestion_answers');
         const question_answers_sba_count = await question_answers_sba.find({ "createdby": userid });
         const case_comments_count = await case_comments.find({ "created_by": userid });
         const kfpquestion_Answer_count = await kfpquestion_Answer.find({ "createdby": userid });
        res.json({'sba_count' : question_answers_sba_count, 'case_count' : case_comments_count, 'kfp_count' : kfpquestion_Answer_count });
      }
      exports.userdashboardquestion_chart = async function(req, res){
        const userid = req.body.userid;
        let displaytype = req.body.displaytype;
        var startDate = req.body.startDate;
        var endData = req.body.endDate;
        var countdata=[];
        var labeldatarng=[];
        var countdataForAll=[];

        if(displaytype==1){
          var firstweek=moment(startDate).month();
          var lastweek=moment(endData).month();
          var curyear=moment(startDate).year().toString();
          console.log("firstweek", firstweek)
          for (firstweek; firstweek <= lastweek; firstweek++){
            var startdate = moment.monthsShort(firstweek);
            var startdatetimestamp=moment(curyear).add(firstweek, 'months').startOf('month').unix()*1000;
            var enddatetimestamp=moment(curyear).add(firstweek, 'months').endOf('month').unix()*1000;
            console.log("startdatetimestamp", startdatetimestamp)
            let datacount= await userdashboardquestion_chartcount(userid,startdatetimestamp,enddatetimestamp);
            let sumdatacount=datacount.sbaMcq+datacount.kfp+datacount.case+datacount.imageOfTheWek+datacount.userQuestion
            let sumdatacountcommunity=datacount.communityaverage;
            labeldatarng.push(startdate);
            countdata.push(sumdatacount)
            countdataForAll.push(sumdatacountcommunity)
          }
        }else{
         // var weeks=enumerateDaysBetweenDates(startDate,endData);
        var firstweek=moment(startDate).isoWeek();
        var lastweek=moment(endData).isoWeek();
        var curyear=moment(startDate).year().toString();
        var weeknum=firstweek;
        console.log('firstweek'+firstweek+'lastweek'+lastweek)
        for(weeknum;weeknum<lastweek;weeknum++){
          var startdate=moment(curyear).add(weeknum, 'weeks').startOf('isoWeek').format('DD MMM');
          var enddate=moment(curyear).add(weeknum, 'weeks').endOf('isoWeek').format('DD MMM');
          var startdatetimestamp=moment(curyear).add(weeknum, 'weeks').startOf('isoWeek').unix()*1000;
          var enddatetimestamp=moment(curyear).add(weeknum, 'weeks').endOf('isoWeek').unix()*1000;
          let datacount= await userdashboardquestion_chartcount(userid,startdatetimestamp,enddatetimestamp);
          let sumdatacount=datacount.sbaMcq+datacount.kfp+datacount.case+datacount.imageOfTheWek+datacount.userQuestion
          let sumdatacountcommunity=datacount.communityaverage;
          labeldatarng.push(startdate+' - '+enddate);
          countdata.push(sumdatacount)
          countdataForAll.push(sumdatacountcommunity)
          }
        }

       res.json({'countdata':countdata,'labeldatarng':labeldatarng,'countdataForAll':countdataForAll})
      }
       async function userdashboardquestion_chartcount(userid,startDate,endData){
        const question_answers =  db.get('question_answers');
        const case_comments = db.get('case_comments');
        const kfpquestion_answers = db.get('kfpquestion_answers');
        const imgofweekquestion_answers = db.get('imgofweekquestion_answers');
        const student_comments = db.get('student_comments');
        const questions = db.get('questions');
        const kfpquestions = db.get('kfpquestions');
        const casequestions = db.get('casequestions');
        const imgofweekquestions = db.get('imgofweekquestions');
        const studentquestions = db.get('studentquestions');

        var sbaqcheck=['5d15fea98edfed6c417592d10','5d15fea98edfed6c417592d11','5d15fea98edfed6c417592d12','5d15fea98edfed6c417592d13'];
        var kfpqcheck='5d15fea98edfed6c417592d9';
        var caseqcheck='5d15fea98edfed6c417592d14';
        var imageqcheck='5d15fea98edfed6c417592d15';
        var userqcheck='5d15fea98edfed6c417592d16';

        var labeldata=[];
        var countdata=[];
        var labeldatarng=[];
        var countdataForAll = []



        let allAnswerByCommunity = {
          "sbaMcq": 0,
          "kfp": 0,
          "case": 0,
          "imageOfTheWek": 0,
          "userQuestion": 0,
          "sbaMcqcommunity": 0,
          "kfpcommunity": 0,
          "casecommunity": 0,
          "imageOfTheWekcommunity": 0,
          "userQuestioncommunity": 0,
          "totalsbaMcq": 0,
          "totalkfp": 0,
          "totalcase": 0,
          "totalimageOfTheWek": 0,
          "totaluserQuestion": 0,
          "communityaverage":0
        }

      //  try{

        allAnswerByCommunity.totalsbaMcq = await questions.count({"publish":1,"questiontype":{'$in':sbaqcheck},"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totalkfp = await questions.count({"publish":1,"questiontype":kfpqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totalcase = await questions.count({"publish":1,"questiontype":caseqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totalimageOfTheWek = await questions.count({"publish":1,"questiontype":imageqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totaluserQuestion = await questions.count({"publish":1,"questiontype":userqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition1 = await questions.distinct('_id',{"publish":1,"questiontype":{'$in':sbaqcheck},"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition2 = await questions.distinct('_id',{"publish":1,"questiontype":kfpqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition3 = await questions.distinct('_id',{"publish":1,"questiontype":caseqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition4 = await questions.distinct('_id',{"publish":1,"questiontype":imageqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition5 = await questions.distinct('_id',{"publish":1,"questiontype":userqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});//res.json(allAnswerByUser);
        ///usersba count
           var myJSON1 = JSON.parse(JSON.stringify(condition1));
           let sbaanswer = await question_answers.distinct('questionid',{"createdby" : userid,"questionid":{'$in':myJSON1}});
          let sbaanswerjson=JSON.parse(JSON.stringify(sbaanswer));
          allAnswerByCommunity.sbaMcq=sbaanswerjson.length;
        let reqdistuser=await question_answers.distinct("createdby",{"questionid":{'$in':myJSON1}});
        let reqdistuserjson=JSON.parse(JSON.stringify(reqdistuser));
        let totalsbasubmission=await question_answers.count({"questionid":{'$in':myJSON1}});
        if(totalsbasubmission!==0){
        allAnswerByCommunity.sbaMcqcommunity = Number((totalsbasubmission/reqdistuserjson.length).toFixed(2));
        }else{
          allAnswerByCommunity.sbaMcqcommunity =0;
        }

          //kfp user count
          var myJSON2 = JSON.parse(JSON.stringify(condition2));
          let condition22= await kfpquestions.distinct('_id',{"parentqid":{'$in':myJSON2}});
          var myJSON22 = JSON.parse(JSON.stringify(condition22));
          let kfpanswer=await kfpquestion_answers.distinct('pquestionid',{"answerby" : userid,"pquestionid":{'$in':myJSON22}});
          let kfpanswerjson=JSON.parse(JSON.stringify(kfpanswer));
          let kfpanswerjson22= await kfpquestions.distinct('parentqid',{"_id":{'$in':kfpanswerjson}});
          let kfpanswercount=JSON.parse(JSON.stringify(kfpanswerjson22));
          allAnswerByCommunity.kfp =kfpanswercount.length;

          //kfp average
          var totalkfpsubmission=0;
          for(var questionid of myJSON2){
          let kfpanswerjson22questioncount= await kfpquestions.distinct('_id',{"parentqid":questionid});
          let kfpanswercountquestioncount=JSON.parse(JSON.stringify(kfpanswerjson22questioncount));
          let kfpanswerusercount=await kfpquestion_answers.distinct('answerby',{"pquestionid":{'$in':kfpanswercountquestioncount}});
          let kfpanswerusercount1=JSON.parse(JSON.stringify(kfpanswerusercount));

          totalkfpsubmission =totalkfpsubmission+kfpanswerusercount1.length;

          }

          console.log('questionid',totalkfpsubmission);
          // let kfpanswerquestioncount=await kfpquestion_answers.distinct('pquestionid',{"pquestionid":{'$in':myJSON22}});
          // let kfpanswerjsonquestioncount=JSON.parse(JSON.stringify(kfpanswerquestioncount));
          // let kfpanswerjson22questioncount= await kfpquestions.distinct('parentqid',{"_id":{'$in':kfpanswerjsonquestioncount}});
          // let kfpanswercountquestioncount=JSON.parse(JSON.stringify(kfpanswerjson22questioncount));
          let kfpanswerusercount=await kfpquestion_answers.distinct('answerby',{"pquestionid":{'$in':myJSON22}});
          let kfpanswerusercountjson=JSON.parse(JSON.stringify(kfpanswerusercount));
          if(totalkfpsubmission!==0){
          allAnswerByCommunity.kfpcommunity =Number((totalkfpsubmission/kfpanswerusercountjson.length).toFixed(2));
          }else{
          allAnswerByCommunity.kfpcommunity=0;
          }
          //case user count
          var myJSON3 = JSON.parse(JSON.stringify(condition3));
          let condition33= await casequestions.distinct('_id',{"parentqid":{'$in':myJSON3}});
          var myJSON33 = JSON.parse(JSON.stringify(condition33));
          let caseanswer=await case_comments.distinct('questionid',{"created_by" : userid,"questionid":{'$in':myJSON33}});
          let caseanswerjson=JSON.parse(JSON.stringify(caseanswer));
          let caseanswerjson33= await casequestions.distinct('parentqid',{"_id":{'$in':caseanswerjson}});
          let caseanswercount=JSON.parse(JSON.stringify(caseanswerjson33));
          allAnswerByCommunity.case =caseanswercount.length;

          //caseaverage
          // let caseansweravg=await case_comments.distinct('questionid',{"questionid":{'$in':myJSON33}});
          // let caseanswerjsonavg=JSON.parse(JSON.stringify(caseansweravg));
          // let caseanswerjson33avg= await casequestions.distinct('parentqid',{"_id":{'$in':caseanswerjsonavg}});
          // let caseanswercountavg=JSON.parse(JSON.stringify(caseanswerjson33avg));
          var totalcasesubmission=0;
          for(var questionid of myJSON3){
          let caseanswerjson22questioncount= await casequestions.distinct('_id',{"parentqid":questionid});
          let caseanswercountquestioncount=JSON.parse(JSON.stringify(caseanswerjson22questioncount));
          let caseanswerusercount=await case_comments.distinct('created_by',{"questionid":{'$in':caseanswercountquestioncount}});
          let caseanswerusercount1=JSON.parse(JSON.stringify(caseanswerusercount));

          totalcasesubmission =totalcasesubmission+caseanswerusercount1.length;

          }

          console.log('questionid',totalkfpsubmission);
          let caseansweruseravg=await case_comments.distinct('created_by',{"questionid":{'$in':myJSON33}});
          let caseanswerjsonuseravg=JSON.parse(JSON.stringify(caseansweruseravg));
          if(totalcasesubmission!==0){
          allAnswerByCommunity.casecommunity =Number((totalcasesubmission/caseanswerjsonuseravg.length).toFixed(2));
          }else{
          allAnswerByCommunity.casecommunity=0;
          }
          //let caseanswer=await case_comments.count({"created_by" : userid,"questionid":{'$in':myJSON33}});
          //let caseanswerpercentage=(caseanswer*100)/myJSON33.length;
          // allAnswerByCommunity.case =Math.round((caseanswerpercentage*allAnswerByCommunity.totalcase)/100);
         // allAnswerByCommunity.case= await case_comments.count({"created_by" : userid,"questionid":{'$in':myJSON3}});
         //image of the week user count
          var myJSON4 = JSON.parse(JSON.stringify(condition4));
          let condition44= await imgofweekquestions.distinct('_id',{"parentqid":{'$in':myJSON4}});
          var myJSON44= JSON.parse(JSON.stringify(condition44));
          let imageanswer=await imgofweekquestion_answers.distinct('pquestionid',{"createdby" : userid,"pquestionid":{'$in':myJSON44}});
          let imageanswerjson=JSON.parse(JSON.stringify(imageanswer));
          let imageanswerjson44= await imgofweekquestions.distinct('parentqid',{"_id":{'$in':imageanswerjson}});
          let imageanswercount=JSON.parse(JSON.stringify(imageanswerjson44));
          allAnswerByCommunity.imageOfTheWek =imageanswercount.length;
          //image of the week avg
          // let imageansweravg=await imgofweekquestion_answers.distinct('pquestionid',{"pquestionid":{'$in':myJSON44}});
          // let imageanswerjsonavg=JSON.parse(JSON.stringify(imageansweravg));
          // let imageanswerjson44avg= await imgofweekquestions.distinct('parentqid',{"_id":{'$in':imageanswerjsonavg}});
          // let imageanswercountavg=JSON.parse(JSON.stringify(imageanswerjson44avg));
          var totalimagesubmission=0;
           for(var questionid of myJSON4){
          let imageanswerjson22questioncount= await imgofweekquestions.distinct('_id',{"parentqid":questionid});
          let imageanswercountquestioncount=JSON.parse(JSON.stringify(imageanswerjson22questioncount));
          let imageanswerusercount=await imgofweekquestion_answers.distinct('answerby',{"pquestionid":{'$in':imageanswercountquestioncount}});
          let imageanswerusercount1=JSON.parse(JSON.stringify(imageanswerusercount));

          totalimagesubmission =totalimagesubmission+imageanswerusercount1.length;

          }
          let imageansweravguser=await imgofweekquestion_answers.distinct('createdby',{"pquestionid":{'$in':myJSON44}});
          let imageanswerjsonavguser=JSON.parse(JSON.stringify(imageansweravguser));
          if(totalimagesubmission!==0){
          allAnswerByCommunity.imageOfTheWekcommunity=Number((totalimagesubmission/imageanswerjsonavguser.length).toFixed(2));
          }else{
            allAnswerByCommunity.imageOfTheWekcommunity=0;
          }

         //user question user count
          var myJSON5 = JSON.parse(JSON.stringify(condition5));
          let condition55= await studentquestions.distinct('_id',{"parentqid":{'$in':myJSON5}});
          var myJSON55 = JSON.parse(JSON.stringify(condition55));
          let useranswer=await student_comments.distinct('questionid',{"created_by" : userid,"questionid":{'$in':myJSON55}});
          let useranswerjson=JSON.parse(JSON.stringify(useranswer));
          let useranswerjson55= await studentquestions.distinct('parentqid',{"_id":{'$in':useranswerjson}});
          let useranswercount=JSON.parse(JSON.stringify(useranswerjson55));
          allAnswerByCommunity.userQuestion =useranswercount.length;
          //user question avg

          // let useransweravg=await student_comments.distinct('questionid',{"questionid":{'$in':myJSON55}});
          // let useranswerjsonavg=JSON.parse(JSON.stringify(useransweravg));
          // let useranswerjson55avg= await studentquestions.distinct('parentqid',{"_id":{'$in':useranswerjsonavg}});
          // let useranswercountavg=JSON.parse(JSON.stringify(useranswerjson55avg));
          var totalusersubmission=0;
          for(var questionid of myJSON5){
          let useranswerjson22questioncount= await studentquestions.distinct('_id',{"parentqid":questionid});
          let useranswercountquestioncount=JSON.parse(JSON.stringify(useranswerjson22questioncount));
          let useranswerusercount=await student_comments.distinct('created_by',{"questionid":{'$in':useranswercountquestioncount}});
          let useranswerusercount1=JSON.parse(JSON.stringify(useranswerusercount));

          totalusersubmission =totalusersubmission+useranswerusercount1.length;

          }
          let useransweravguser=await student_comments.distinct('created_by',{"questionid":{'$in':myJSON55}});
          let useranswerjsonavguser=JSON.parse(JSON.stringify(useransweravguser));
          if(totalusersubmission!==0){
          allAnswerByCommunity.userQuestioncommunity =Number((totalusersubmission/useranswerjsonavguser.length).toFixed(2));
          }else{
            allAnswerByCommunity.userQuestioncommunity=0;
          }

          let totaluserqsubmitted1=useranswerjsonavguser.concat(imageanswerjsonavguser).concat(caseanswerjsonuseravg).concat(kfpanswerusercountjson).concat(reqdistuserjson);
          totaluserqsubmitted = totaluserqsubmitted1.filter(function(elem, pos) {
            return totaluserqsubmitted1.indexOf(elem) == pos;
        })
          //allAnswerByCommunity.communityaverage=totaluserqsubmitted;
          if(totaluserqsubmitted.length!==0){
          allAnswerByCommunity.communityaverage=Number(((totalsbasubmission+totalkfpsubmission+totalcasesubmission+totalimagesubmission+totalusersubmission)/totaluserqsubmitted.length).toFixed(2));
           }else{
            allAnswerByCommunity.communityaverage=0;
           }
           return allAnswerByCommunity
      }

      exports.userdashboardquestion_imgoftheweek = async function(req, res){
        const userid = req.body.userid;
        const question_answers =  db.get('question_answers');
        const case_comments = db.get('case_comments');
        const kfpquestion_answers = db.get('kfpquestion_answers');
        const imgofweekquestion_answers = db.get('imgofweekquestion_answers');
        const student_comments = db.get('student_comments');
        const questions = db.get('questions');
        const kfpquestions = db.get('kfpquestions');
        const casequestions = db.get('casequestions');
        const imgofweekquestions = db.get('imgofweekquestions');
        const studentquestions = db.get('studentquestions');

        let displaytype = req.body.displaytype
        var sbaqcheck=['5d15fea98edfed6c417592d10','5d15fea98edfed6c417592d11','5d15fea98edfed6c417592d12','5d15fea98edfed6c417592d13'];
        var kfpqcheck='5d15fea98edfed6c417592d9';
        var caseqcheck='5d15fea98edfed6c417592d14';
        var imageqcheck='5d15fea98edfed6c417592d15';
        var userqcheck='5d15fea98edfed6c417592d16';

        var labeldata=[];
        var countdata=[];
        var labeldatarng=[];
        var countdataForAll = []


          var startDate = req.body.startDate;

          var endData = req.body.endDate;



        let allAnswerByCommunity = {
          "sbaMcq": 0,
          "kfp": 0,
          "case": 0,
          "imageOfTheWek": 0,
          "userQuestion": 0,
          "sbaMcqcommunity": 0,
          "kfpcommunity": 0,
          "casecommunity": 0,
          "imageOfTheWekcommunity": 0,
          "userQuestioncommunity": 0,
          "totalsbaMcq": 0,
          "totalkfp": 0,
          "totalcase": 0,
          "totalimageOfTheWek": 0,
          "totaluserQuestion": 0
        }

      //  try{

        allAnswerByCommunity.totalsbaMcq = await questions.count({"publish":1,"questiontype":{'$in':sbaqcheck},"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totalkfp = await questions.count({"publish":1,"questiontype":kfpqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totalcase = await questions.count({"publish":1,"questiontype":caseqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totalimageOfTheWek = await questions.count({"publish":1,"questiontype":imageqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
        allAnswerByCommunity.totaluserQuestion = await questions.count({"publish":1,"questiontype":userqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition1 = await questions.distinct('_id',{"publish":1,"questiontype":{'$in':sbaqcheck},"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition2 = await questions.distinct('_id',{"publish":1,"questiontype":kfpqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition3 = await questions.distinct('_id',{"publish":1,"questiontype":caseqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition4 = await questions.distinct('_id',{"publish":1,"questiontype":imageqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});
           let condition5 = await questions.distinct('_id',{"publish":1,"questiontype":userqcheck,"publish_date": {'$gte':startDate,'$lte':endData}});//res.json(allAnswerByUser);
        ///usersba count
           var myJSON1 = JSON.parse(JSON.stringify(condition1));
           let sbaanswer = await question_answers.distinct('questionid',{"createdby" : userid,"questionid":{'$in':myJSON1}});
          let sbaanswerjson=JSON.parse(JSON.stringify(sbaanswer));
          allAnswerByCommunity.sbaMcq=sbaanswerjson.length;
        let reqdistuser=await question_answers.distinct("createdby",{"questionid":{'$in':myJSON1}});
        let reqdistuserjson=JSON.parse(JSON.stringify(reqdistuser));
        let totalsbasubmission=await question_answers.count({"questionid":{'$in':myJSON1}});
        if(totalsbasubmission!==0){
        allAnswerByCommunity.sbaMcqcommunity = Number((totalsbasubmission/reqdistuserjson.length).toFixed(2));
        }else{
          allAnswerByCommunity.sbaMcqcommunity =0;
        }

          //kfp user count
          var myJSON2 = JSON.parse(JSON.stringify(condition2));
          let condition22= await kfpquestions.distinct('_id',{"parentqid":{'$in':myJSON2}});
          var myJSON22 = JSON.parse(JSON.stringify(condition22));
          let kfpanswer=await kfpquestion_answers.distinct('pquestionid',{"answerby" : userid,"pquestionid":{'$in':myJSON22}});
          let kfpanswerjson=JSON.parse(JSON.stringify(kfpanswer));
          let kfpanswerjson22= await kfpquestions.distinct('parentqid',{"_id":{'$in':kfpanswerjson}});
          let kfpanswercount=JSON.parse(JSON.stringify(kfpanswerjson22));
          allAnswerByCommunity.kfp =kfpanswercount.length;

          //kfp average
          var totalkfpsubmission=0;
          for(var questionid of myJSON2){
          let kfpanswerjson22questioncount= await kfpquestions.distinct('_id',{"parentqid":questionid});
          let kfpanswercountquestioncount=JSON.parse(JSON.stringify(kfpanswerjson22questioncount));
          let kfpanswerusercount=await kfpquestion_answers.distinct('answerby',{"pquestionid":{'$in':kfpanswercountquestioncount}});
          let kfpanswerusercount1=JSON.parse(JSON.stringify(kfpanswerusercount));

          totalkfpsubmission =totalkfpsubmission+kfpanswerusercount1.length;

          }

          console.log('questionid',totalkfpsubmission);
          // let kfpanswerquestioncount=await kfpquestion_answers.distinct('pquestionid',{"pquestionid":{'$in':myJSON22}});
          // let kfpanswerjsonquestioncount=JSON.parse(JSON.stringify(kfpanswerquestioncount));
          // let kfpanswerjson22questioncount= await kfpquestions.distinct('parentqid',{"_id":{'$in':kfpanswerjsonquestioncount}});
          // let kfpanswercountquestioncount=JSON.parse(JSON.stringify(kfpanswerjson22questioncount));
          let kfpanswerusercount=await kfpquestion_answers.distinct('answerby',{"pquestionid":{'$in':myJSON22}});
          let kfpanswerusercountjson=JSON.parse(JSON.stringify(kfpanswerusercount));
          if(totalkfpsubmission!==0){
          allAnswerByCommunity.kfpcommunity =Number((totalkfpsubmission/kfpanswerusercountjson.length).toFixed(2));
          }else{
          allAnswerByCommunity.kfpcommunity=0;
          }
          //case user count
          var myJSON3 = JSON.parse(JSON.stringify(condition3));
          let condition33= await casequestions.distinct('_id',{"parentqid":{'$in':myJSON3}});
          var myJSON33 = JSON.parse(JSON.stringify(condition33));
          let caseanswer=await case_comments.distinct('questionid',{"created_by" : userid,"questionid":{'$in':myJSON33}});
          let caseanswerjson=JSON.parse(JSON.stringify(caseanswer));
          let caseanswerjson33= await casequestions.distinct('parentqid',{"_id":{'$in':caseanswerjson}});
          let caseanswercount=JSON.parse(JSON.stringify(caseanswerjson33));
          allAnswerByCommunity.case =caseanswercount.length;

          //caseaverage
          // let caseansweravg=await case_comments.distinct('questionid',{"questionid":{'$in':myJSON33}});
          // let caseanswerjsonavg=JSON.parse(JSON.stringify(caseansweravg));
          // let caseanswerjson33avg= await casequestions.distinct('parentqid',{"_id":{'$in':caseanswerjsonavg}});
          // let caseanswercountavg=JSON.parse(JSON.stringify(caseanswerjson33avg));
          var totalcasesubmission=0;
          for(var questionid of myJSON3){
          let caseanswerjson22questioncount= await casequestions.distinct('_id',{"parentqid":questionid});
          let caseanswercountquestioncount=JSON.parse(JSON.stringify(caseanswerjson22questioncount));
          let caseanswerusercount=await case_comments.distinct('created_by',{"questionid":{'$in':caseanswercountquestioncount}});
          let caseanswerusercount1=JSON.parse(JSON.stringify(caseanswerusercount));

          totalcasesubmission =totalcasesubmission+caseanswerusercount1.length;

          }

          console.log('questionid',totalkfpsubmission);
          let caseansweruseravg=await case_comments.distinct('created_by',{"questionid":{'$in':myJSON33}});
          let caseanswerjsonuseravg=JSON.parse(JSON.stringify(caseansweruseravg));
          if(totalcasesubmission!==0){
          allAnswerByCommunity.casecommunity =Number((totalcasesubmission/caseanswerjsonuseravg.length).toFixed(2));
          }else{
          allAnswerByCommunity.casecommunity=0;
          }
          //let caseanswer=await case_comments.count({"created_by" : userid,"questionid":{'$in':myJSON33}});
          //let caseanswerpercentage=(caseanswer*100)/myJSON33.length;
          // allAnswerByCommunity.case =Math.round((caseanswerpercentage*allAnswerByCommunity.totalcase)/100);
         // allAnswerByCommunity.case= await case_comments.count({"created_by" : userid,"questionid":{'$in':myJSON3}});
         //image of the week user count
          var myJSON4 = JSON.parse(JSON.stringify(condition4));
          let condition44= await imgofweekquestions.distinct('_id',{"parentqid":{'$in':myJSON4}});
          var myJSON44= JSON.parse(JSON.stringify(condition44));
          let imageanswer=await imgofweekquestion_answers.distinct('pquestionid',{"createdby" : userid,"pquestionid":{'$in':myJSON44}});
          let imageanswerjson=JSON.parse(JSON.stringify(imageanswer));
          let imageanswerjson44= await imgofweekquestions.distinct('parentqid',{"_id":{'$in':imageanswerjson}});
          let imageanswercount=JSON.parse(JSON.stringify(imageanswerjson44));
          allAnswerByCommunity.imageOfTheWek =imageanswercount.length;
          //image of the week avg
          // let imageansweravg=await imgofweekquestion_answers.distinct('pquestionid',{"pquestionid":{'$in':myJSON44}});
          // let imageanswerjsonavg=JSON.parse(JSON.stringify(imageansweravg));
          // let imageanswerjson44avg= await imgofweekquestions.distinct('parentqid',{"_id":{'$in':imageanswerjsonavg}});
          // let imageanswercountavg=JSON.parse(JSON.stringify(imageanswerjson44avg));
          var totalimagesubmission=0;
           for(var questionid of myJSON4){
          let imageanswerjson22questioncount= await imgofweekquestions.distinct('_id',{"parentqid":questionid});
          let imageanswercountquestioncount=JSON.parse(JSON.stringify(imageanswerjson22questioncount));
          let imageanswerusercount=await imgofweekquestion_answers.distinct('answerby',{"pquestionid":{'$in':imageanswercountquestioncount}});
          let imageanswerusercount1=JSON.parse(JSON.stringify(imageanswerusercount));

          totalimagesubmission =totalimagesubmission+imageanswerusercount1.length;

          }
          let imageansweravguser=await imgofweekquestion_answers.distinct('createdby',{"pquestionid":{'$in':myJSON44}});
          let imageanswerjsonavguser=JSON.parse(JSON.stringify(imageansweravguser));
          if(totalimagesubmission!==0){
          allAnswerByCommunity.imageOfTheWekcommunity=Number((totalimagesubmission/imageanswerjsonavguser.length).toFixed(2));
          }else{
            allAnswerByCommunity.imageOfTheWekcommunity=0;
          }

         //user question user count
          var myJSON5 = JSON.parse(JSON.stringify(condition5));
          let condition55= await studentquestions.distinct('_id',{"parentqid":{'$in':myJSON5}});
          var myJSON55 = JSON.parse(JSON.stringify(condition55));
          let useranswer=await student_comments.distinct('questionid',{"created_by" : userid,"questionid":{'$in':myJSON55}});
          let useranswerjson=JSON.parse(JSON.stringify(useranswer));
          let useranswerjson55= await studentquestions.distinct('parentqid',{"_id":{'$in':useranswerjson}});
          let useranswercount=JSON.parse(JSON.stringify(useranswerjson55));
          allAnswerByCommunity.userQuestion =useranswercount.length;
          //user question avg

          // let useransweravg=await student_comments.distinct('questionid',{"questionid":{'$in':myJSON55}});
          // let useranswerjsonavg=JSON.parse(JSON.stringify(useransweravg));
          // let useranswerjson55avg= await studentquestions.distinct('parentqid',{"_id":{'$in':useranswerjsonavg}});
          // let useranswercountavg=JSON.parse(JSON.stringify(useranswerjson55avg));
          var totalusersubmission=0;
          for(var questionid of myJSON5){
          let useranswerjson22questioncount= await studentquestions.distinct('_id',{"parentqid":questionid});
          let useranswercountquestioncount=JSON.parse(JSON.stringify(useranswerjson22questioncount));
          let useranswerusercount=await student_comments.distinct('created_by',{"questionid":{'$in':useranswercountquestioncount}});
          let useranswerusercount1=JSON.parse(JSON.stringify(useranswerusercount));

          totalusersubmission =totalusersubmission+useranswerusercount1.length;

          }
          let useransweravguser=await student_comments.distinct('created_by',{"questionid":{'$in':myJSON55}});
          let useranswerjsonavguser=JSON.parse(JSON.stringify(useransweravguser));
          if(totalusersubmission!==0){
          allAnswerByCommunity.userQuestioncommunity =Number((totalusersubmission/useranswerjsonavguser.length).toFixed(2));
          }else{
            allAnswerByCommunity.userQuestioncommunity=0;
          }
           res.json({'countdata':allAnswerByCommunity});

      }

      exports.testing_123 = async function(req, res){
        // Average on behalf of other user data.
        const userid = req.body.userid;
        // const q_type = req.body.q_type;
        const question_answers_sba =  db.get('question_answers');
        const case_comments = db.get('case_comments');
        const kfpquestion_Answer = db.get('kfpquestion_answers');
        const imageoftheweek = db.get('imgofweekquestions');
        const questions = db.get('questions');
        let question_answers_sba_count  =  await question_answers_sba.aggregate([
            { $match : { "createdby" : userid } },
            {
              $group :
              {
                _id : null,
                count : { $sum : 1 }
              }
            }
          ]);
         let question_answers_sba_count_all  =  await question_answers_sba.aggregate([
            {
              $group :
              {
                _id : null,
                count : { $sum : 1 }

              }
            }
          ]);
         const question_answers_sba_count_value = question_answers_sba_count[0].count;
         const question_answers_sba_count_all_value = question_answers_sba_count_all[0].count;
         const avg_percentage = (question_answers_sba_count_value/question_answers_sba_count_all_value)*100;


        res.json({ 'question_answers_sba_count' : question_answers_sba_count_value , 'question_answers_sba_count_all' : question_answers_sba_count_all_value, 'sba_avg' : avg_percentage });
      }

      module.exports.articlePercentage = async (req, res) => {

        const Article = db.get('article_views')
        var userid = req.body.userid;

        var date = new Date();
        var startDate = (new Date(date.getTime() - (37 * 24 * 60 * 60 * 1000))).getTime();

        let endData = Date.now()
        if(Number(req.body.startDate) !== 0 ){
          startDate = Number(req.body.startDate);
        }
        if(Number(req.body.endDate) !== 0 ){
          endData = Number(req.body.endDate);
        }
        try{
          let articelDataByAllUser = await Article.aggregate([
            {$match : {"created_at": {'$gte':startDate,'$lte':endData}  }},
            // {$match: {"userid": {$ne: userid}} },

                  // {
                  //   $group :
                  //   {
                  //     _id : null,
                  //     count : { $sum : 1 }
                  //   }
                  // }
          ]);

          let articleDatabyOneUser = await Article.aggregate([
            { $match : { "userid" : userid, "created_at": {'$gte':startDate,'$lte':endData} } },
                  {
                    $group :
                    {
                      _id : null,
                      count : {  $sum : 1 }
                    }
                  }
          ])

          var articlePercentageOneUser
          var articlePercentageAllUser

          var articlePercentageOneUserAvg
          var articlePercentageAllUserAvg

          if (articleDatabyOneUser.length > 0){

          articlePercentageOneUser = articleDatabyOneUser[0].count
          articlePercentageOneUserAvg = articleDatabyOneUser[0].count/articelDataByAllUser.length * 100

          }if (articelDataByAllUser.length > 0){
            var count = {};
            articelDataByAllUser.forEach(function(i) { count[i.userid] = (count[i.userid]||0) + 1;});
            let array = (Object.values(count) )
            articlePercentageAllUser = array.reduce((a, b) => a + b) / array.length;
            articlePercentageAllUserAvg = articlePercentageAllUser/articelDataByAllUser.length * 100


          }if (articelDataByAllUser.length == 0) {
            articlePercentageAllUser = 0
            articlePercentageAllUserAvg = 0

          }if (articleDatabyOneUser.length == 0) {
            articlePercentageOneUser = 0
            articlePercentageOneUserAvg = 0
          }

          res.send({
            articlePercentageOneUser,
            articlePercentageAllUser,
            articlePercentageAllUserAvg,
            articlePercentageOneUserAvg

          })
        } catch (err){
          //console.log("error :", err)
          res.send([])
        }

      }

    // to extract average time spend in kfp case and articles

    module.exports.averageTimeSpent = async (req, res) => {
      let KfpAnswers = db.get('kfpquestion_answers');
      let CaseAnswer = db.get('casequestion_answers');
      let ArticleAnswer = db.get('article_question_answers');
      let Questions = db.get('questions');

      let userid = req.body.userid

      var date = new Date();
      var startDate = (new Date(date.getTime() - (37*24*60*60*1000))).getTime();

      let endData = Date.now()
      if(Number(req.body.startDate) !== 0 ){
        startDate = Number(req.body.startDate);
      }
      if(Number(req.body.endDate) !== 0 ){
        endData = Number(req.body.endDate);
      }

      try{
        // average formula
        const average = list => list.reduce((prev, curr) => prev + curr) / list.length;

        let averageByOneUser = await KfpAnswers.aggregate([
          { $match : { "createdby" : userid, "created_at": {'$gte':startDate,'$lte':endData} } },
        ])
        let averageByAllUser = await KfpAnswers.aggregate([
          {$match : {"created_at": {'$gte':startDate,'$lte':endData}}}
        ])

        let averageByAllUserCase = await Questions.aggregate([
          {$match: {"created_at": {'$gte':startDate,'$lte':endData}, "questiontype": "5d15fea98edfed6c417592d14"} },
          {
            "$project": {
              "uniqueId": {
                "$toString": "$_id"
              },
              "_id": 0
          }
          },
          {
            $lookup:{
              from : "case_comments",
              localField : "uniqueId",
              foreignField : "parentqid",
              as :"caseBaseQuestionSubmit"
            }
          },
          { "$unwind": "$caseBaseQuestionSubmit"},
          {
            $lookup:
            {
                from: "question_views",
                'let': {
                  'caseId': '$uniqueId',
                  'lastDate': '$caseBaseQuestionSubmit.created_at',
                  'user': '$caseBaseQuestionSubmit.created_by'

                },
                    pipeline: [
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$questionid', '$$caseId'] } } ]} } ,
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$userid', '$$user'] } } ]} } ,
                        {'$match':  { $or: [ { '$expr': { '$lte': [ "$created_at", '$$lastDate' ] }} ]} },
                        {"$sort":{"_id":-1} }
                    ],
                as: "caseBaseQuestionViews"
            }
          },
        ])

        let averageByOneUserCaseTemp = await Questions.aggregate([
          {$match: { "createdby" : userid, "created_at": {'$gte':startDate,'$lte':endData}, "questiontype": "5d15fea98edfed6c417592d14"} },
          {
            "$project": {
              "uniqueId": {
                "$toString": "$_id"
              },
              "_id": 0
          }
          },
          {
            $lookup:{
              from : "case_comments",
              localField : "uniqueId",
              foreignField : "parentqid",
              as :"caseBaseQuestionSubmit"
            }
          },
          { "$unwind": "$caseBaseQuestionSubmit"},
          {
            $lookup:
            {
                from: "question_views",
                'let': {
                  'caseId': '$uniqueId',
                  'lastDate': '$caseBaseQuestionSubmit.created_at',
                  'user': '$caseBaseQuestionSubmit.created_by'
                },
                    pipeline: [
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$questionid', '$$caseId'] } } ]} } ,
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$userid', '$$user'] } } ]} } ,
                        {'$match':  { $or: [ { '$expr': { '$lte': [ "$created_at", '$$lastDate' ] }} ]} },
                        {"$sort":{"_id":-1} }
                    ],
                as: "caseBaseQuestionViews"
            }
          },
        ])

        let averageByAllUserArticle = await ArticleAnswer.aggregate([
          {$match : {"created_at": {'$gte':startDate,'$lte':endData}}}
        ])
        let averageByOneUserArticle = await ArticleAnswer.aggregate([
          { $match : { "createdby" : userid, "created_at": {'$gte':startDate,'$lte':endData} } },
        ])

        var totalTimeByOneUser = []
        var totalTimeByAllUser = []
        var totalTimeByAllUserArticle = []
        var totalTimeByOneUserArticle = []

        // for average By One User KFP
        if(averageByOneUser.length > 0){
          asyncLoop(averageByOneUser, function (singleUser, next){
            var startTime = moment(singleUser.starttime)
            var endTime = moment(singleUser.endtime)

            var duration = moment.duration(endTime.diff(startTime));
            totalTimeByOneUser.push(duration.asMinutes());
            next()
          });
        }else{
          totalTimeByOneUser.push(0)
        }

        // for average By All User KFP
        if(averageByAllUser.length > 0){
          asyncLoop(averageByAllUser, (singleUser2, next2) => {
            var startTime2 = moment(singleUser2.starttime)
            var endTime2 = moment(singleUser2.endtime)

            var duration2 = moment.duration(endTime2.diff(startTime2));
            totalTimeByAllUser.push(duration2.seconds());
            next2()
           });
        }else{
          totalTimeByAllUser.push(0)
        }
          // for average By one user Case
          var totalCaseTimeByOneUser = []
          if(averageByOneUserCaseTemp.length > 0){
            asyncLoop(averageByOneUserCaseTemp, (singleUser2, next2) => {
              if (singleUser2.caseBaseQuestionViews.length > 0 && singleUser2.caseBaseQuestionSubmit){

                var startTimeCase= moment(singleUser2.caseBaseQuestionViews[0].created_at)
                var endTimeCase = moment(singleUser2.caseBaseQuestionSubmit.created_at)

                var duration = moment.duration(endTimeCase.diff(startTimeCase));
                totalCaseTimeByOneUser.push(duration.asMinutes());
                }
              next2()
             });
          }else{
            next2()
          }
          let totalTimeByOneUserCaseData = totalCaseTimeByOneUser.reduce((a, b) => a + b, 0)


        //  for average By all user Case
        var totalCaseTimeByAllUser = []
        var totalUserWhoCommented = {}

        if(averageByAllUserCase.length > 0){
          asyncLoop(averageByAllUserCase, (singleUser2, next2) => {
            if (singleUser2.caseBaseQuestionViews.length > 0 && singleUser2.caseBaseQuestionSubmit){

              totalUserWhoCommented[singleUser2.caseBaseQuestionSubmit.parentqid] = (totalUserWhoCommented[singleUser2.caseBaseQuestionSubmit.parentqid] || 0) + 1;

              var startTimeCase= moment(singleUser2.caseBaseQuestionViews[0].created_at)
              var endTimeCase = moment(singleUser2.caseBaseQuestionSubmit.created_at)

              var duration = moment.duration(endTimeCase.diff(startTimeCase));
              totalCaseTimeByAllUser.push(duration.asMinutes());
              }
            next2()
           });
        }else{
          next2()
        }
        let array = (Object.keys(totalUserWhoCommented))
        let totalTimeByAllUserCaseDataTemp = totalCaseTimeByAllUser.reduce((a, b) => a + b, 0)
        let totalTimeByAllUserCaseData = totalTimeByAllUserCaseDataTemp / array.length


        // for average by one user article
        if(averageByOneUserArticle.length > 0){
          asyncLoop(averageByOneUserArticle, (singleUser2, next2) => {
            var startTime2 = moment(singleUser2.starttime)
            var endTime2 = moment(singleUser2.endtime)

            var duration2 = moment.duration(endTime2.diff(startTime2));
            totalTimeByOneUserArticle.push(duration2.asMinutes());
            next2()
           });
        }else {
          totalTimeByOneUserArticle.push(0)
        }

        // for average by all user article
        if(averageByAllUserArticle.length > 0){
          asyncLoop(averageByAllUserArticle, (singleUser2, next2) => {
            var startTime2 = moment(singleUser2.starttime)
            var endTime2 = moment(singleUser2.endtime)

            var duration2 = moment.duration(endTime2.diff(startTime2));
            totalTimeByAllUserArticle.push(duration2.asMinutes());
            next2()
           });
        }else {
          totalTimeByAllUserArticle.push(0)
        }

        // to extract average
        let totalTimeByAllUserData = average(totalTimeByAllUser)
        let totalTimeByOneUserData = average(totalTimeByOneUser)
        // let totalTimeByOneUserCaseData = average(totalTimeByOneUserCase)
        // let totalTimeByAllUserCaseData = average(totalTimeByAllUserCase)
        let totalTimeByOneUserArticleData = average(totalTimeByOneUserArticle)
        let totalTimeByAllUserArticleData = average(totalTimeByAllUserArticle)



        res.send({
          totalTimeByAllUserData,
          totalTimeByOneUserData,
          totalTimeByOneUserCaseData,
          totalTimeByAllUserCaseData,
          totalTimeByOneUserArticleData,
          totalTimeByAllUserArticleData,

          totalUserWhoCommented,
        })
      } catch(err){
        //console.log("ERROR :", err)
      }
    }

    // to get correct answers Percentage
    module.exports.getCorrectAnswer = async (req, res) => {
      const question_options = db.get('question_options')
      const userid = req.body.userid;
      const question_answers =  db.get('question_answers');
      const questions = db.get('questions');
      var sbaqcheck=['5d15fea98edfed6c417592d10','5d15fea98edfed6c417592d11','5d15fea98edfed6c417592d12','5d15fea98edfed6c417592d13'];
        startDate = req.body.startDate;
        endData = req.body.endDate;
      let allAnswerByCommunity = {
        "correctanswers": 0,
        "correctanswerscommunity": 0,
        "totalquestions":0
      }
      allAnswerByCommunity.totalquestions = await questions.count({"publish":1,"questiontype":{'$in':sbaqcheck},"publish_date": {'$gte':startDate,'$lte':endData}});
       let condition1 = await questions.distinct('_id',{"publish":1,"questiontype":{'$in':sbaqcheck},"publish_date": {'$gte':startDate,'$lte':endData}});
      var myJSON1 = JSON.parse(JSON.stringify(condition1));
      let questionoptions=await question_options.distinct("_id",{"questionid":{'$in':myJSON1},'answervalue':{'$in':[true,'true']}});
      let questionoptionjson=JSON.parse(JSON.stringify(questionoptions));
      let totalsbasubmission=await question_answers.count({"questionid":{'$in':myJSON1},"answerid":{'$in':questionoptionjson}});
      let sbacorrectandss=await question_answers.distinct('questionid',{"createdby" : userid,"questionid":{'$in':myJSON1},"answerid":{'$in':questionoptionjson}});
      let sbacorrectandssjson=JSON.parse(JSON.stringify(sbacorrectandss));
      allAnswerByCommunity.correctanswers = sbacorrectandssjson.length;
      let reqdistuser=await question_answers.distinct("createdby",{"questionid":{'$in':myJSON1},"answerid":{'$in':questionoptionjson}});
      let reqdistuserjson=JSON.parse(JSON.stringify(reqdistuser));
      if(totalsbasubmission!==0){
      allAnswerByCommunity.correctanswerscommunity = Number((totalsbasubmission/reqdistuserjson.length).toFixed(2));
      }else{
        allAnswerByCommunity.correctanswerscommunity =0;
      }
res.json({'countdata':allAnswerByCommunity});
    }

    // study PlanAverage
    module.exports.studyPlanAverage = async (req, res) => {
      const Topics = db.get('studyplan_duedates');
      const SubTopics = db.get('studyplan_subtopicstatus');
      const Reminder = db.get('studyplan_topicreminders');
      const SubTopicAdded = db.get ('studyplan_subtopics');
      const TopicAdded = db.get('studyplan_topics');

      var userid = req.body.userid;

      var date = new Date();
      var startDate = (new Date(date.getTime() - (37 * 24 * 60 * 60 * 1000))).getTime();

      let endData = Date.now()
      if(Number(req.body.startDate) !== 0 ){
        startDate = Number(req.body.startDate);
      }
      if(Number(req.body.endDate) !== 0 ){
        endData = Number(req.body.endDate);
      }

      try{
        let totalTopicAddedByUserTemp = await TopicAdded.aggregate([
          {$match: { "created_by": userid, "created_at": {'$gte':startDate,'$lte':endData} }}

        ])
        let totalSubTopicAddedByUserTemp = await SubTopicAdded.aggregate([
          {$match: { "created_by": userid, "created_at": {'$gte':startDate,'$lte':endData} }}
        ])

        let totalTopicByOneUser = await Topics.aggregate([
          {$match : { "created_at": {'$gte':startDate,'$lte':endData} }},
          {$group: {_id: null, count:{ $sum: 1 }} }
        ])

        let subTopicsBYOneUser = await SubTopics.aggregate([
          {$match : { "created_at": {'$gte':startDate,'$lte':endData} }},
          {$group: {_id: null, count:{ $sum: 1 }} }
        ])

        let reminderByOneUser = await Reminder.aggregate([
          {$match: {"created_by": userid, "created_at": {'$gte':startDate,'$lte':endData} }},
          {$group: {_id: null, count:{ $sum: 1 }} }
        ])

        let dueDatesByOneUserTmp = await Topics.aggregate([
          {$match: {"created_by" : userid, "created_at": {'$gte':startDate,'$lte':endData} }},
          {$match : {"due_date": { $exists: true } } }
        ])

        let dueDatesByOneUser = dueDatesByOneUserTmp.length

        let CompletedTopicsByOneUserData = await Topics.aggregate([
          {$match : {"created_by": userid, "chkbox_status": 1, "created_at": {'$gte':startDate,'$lte':endData} }},
          {$group: {_id: null, count:{ $sum: 1 }} }
        ])

        let completedSubTopicsByOneUserData = await SubTopics.aggregate([
          {$match : {"created_by": userid, "chkbox_status": 1, "created_at": {'$gte':startDate,'$lte':endData} }},
          {$group: {_id: null, count:{ $sum: 1 }} }
        ])



        let completedTopicsByOneUser
        if (totalTopicByOneUser.length > 0 && CompletedTopicsByOneUserData.length > 0){
          completedTopicsByOneUser = (CompletedTopicsByOneUserData[0].count / totalTopicByOneUser[0].count ) * 100

        } else{
          completedTopicsByOneUser = 0
        }

        let completedSubTopicsByOneUser
        if (completedSubTopicsByOneUserData.length > 0 && subTopicsBYOneUser.length > 0){
          completedSubTopicsByOneUser = (completedSubTopicsByOneUserData[0].count / subTopicsBYOneUser[0].count ) * 100
        } else{
          completedSubTopicsByOneUser = 0
        }

        // for average one user
        var totalSubTopicsTempOne = 0
        var comleteSubTopicsTempOne = 0
        var totalTopicsTempOne = 0
        var completedTopicsTempOne = 0
        if (subTopicsBYOneUser.length > 0){
          totalSubTopicsTempOne  = subTopicsBYOneUser[0].count
        }
        if (completedSubTopicsByOneUserData.length > 0){
          comleteSubTopicsTempOne = completedSubTopicsByOneUserData[0].count
        }
        if (totalTopicByOneUser.length > 0){
          totalTopicsTempOne = totalTopicByOneUser[0].count
        }
        if (CompletedTopicsByOneUserData.length > 0){
          completedTopicsTempOne = CompletedTopicsByOneUserData[0].count
        }

        let averageCompletedByOneUser = ((comleteSubTopicsTempOne + completedTopicsTempOne) / (totalSubTopicsTempOne + totalTopicsTempOne)) * 100

      // for average all user
      let totalTopicsAll = await Topics.find({"created_at": {'$gte':startDate,'$lte':endData} })
      let totalSubTopicsAll = await SubTopics.find({"created_at": {'$gte':startDate,'$lte':endData} })
      let compltedtopicsAll = await Topics.find({
        "chkbox_status": 1,
        "created_at": {'$gte':startDate,'$lte':endData}
      })
       let completedSubTopicsAll = await SubTopics.find({
        "chkbox_status": 1,
        "created_at": {'$gte':startDate,'$lte':endData}
      })
      let averageCompltedByAllUser = ((compltedtopicsAll.length + completedSubTopicsAll.length) / (totalTopicsAll.length + totalSubTopicsAll.length)) * 100

      // for topic and sub topic  added
      let totalTopicAddedByUser = totalTopicAddedByUserTemp.length
      let totalSubTopicAddedByUser = totalSubTopicAddedByUserTemp.length

        res.send({
          totalTopicAddedByUser,
          totalSubTopicAddedByUser,
          reminderByOneUser,
          dueDatesByOneUser,
          completedTopicsByOneUser,
          completedSubTopicsByOneUser,
          averageCompletedByOneUser,
          averageCompltedByAllUser
        })
    } catch (err){
      //console.log("ERROR: ", err)
      res.send([])
    }
  }