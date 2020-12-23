
// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');
var NotificationCons = require('./notificationcontroller');
var ObjectId=require('mongodb').ObjectID;


exports.saveQuestion = function(req,res){
    const questions= db.get('questions');
    if(req.body.question_text!=='' && req.body.question_text!==null){
    questions.insert({'q_order':req.body.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':req.body.answer_key,'imagevisibility':req.body.imagevisibility,'q_version':req.body.q_version,'uploadedstem_file':req.body.uploadedstem_file,'hero_img':req.body.uploaded_file,'stem_image_permission':req.body.stemimagevalidation.image_permission,'stem_image_source':req.body.stemimagevalidation.image_source,'question_image_permission':req.body.questionimagevalidation.image_permission,'question_image_source':req.body.questionimagevalidation.image_source,'stem_text':req.body.stem_text,'instruction_text':req.body.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':req.body.question_text,'option_type':req.body.option_type,'answer_explanation':req.body.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(), "multiple_uploadedstem_file":req.body.multiple_uploadedstem_file,"multiple_uploaded_file":req.body.multiple_uploaded_file})

    .then(function(insertquestion){
            res.json(insertquestion);
}).catch(function(error){
    res.json([]);
});
}else{
    res.json({"error":"Some fields required in this form."});
}
}
exports.getQuestion = function(req,res){
    const questions= db.get('questions');
    questions.findOne({'_id':req.body.id}).then(function(getquestion){
            res.json(getquestion);
}).catch(function(error){
    res.json([]);
});

}
//**********************************************************************

exports.getPostQuestionStatus = function(req,res)
{
    const posts= db.get('posts');
    var quesid=req.body.quesid;
    var finalstatus=0;
    posts.findOne({'questionid': quesid}).then(function(getpostquesstatus)
    {
      if(getpostquesstatus!==undefined && getpostquesstatus!==null)
      {
        //console.log("if-",finalstatus)
        //console.log("date-",Date.now())
        if(getpostquesstatus.active==true && getpostquesstatus.deleted==false && getpostquesstatus.posted_at<Date.now())
        {
          finalstatus=1;
          //console.log("if if-", finalstatus)
          res.json(finalstatus);
        }
        // else if(getpostquesstatus.deleted==true && getpostquesstatus.posted_at<Date.now())
        // {
        //   finalstatus=1;
        //   //console.log("if else if-", finalstatus)
        //   res.json(finalstatus);
        // }
        else
        {
          //console.log("if else-",finalstatus)
          res.json(finalstatus);
        }
      }
      else
      {
          //console.log("else-", finalstatus)
        res.json(finalstatus);
      }
    }).catch(function(error){
        res.send([]);
      });
}

//**********************************************************************

exports.getQuestionTagsData = function(req,res)
{
  const tags= db.get('tags');
  var questags = ['KFP', 'SBA', 'MCQ', 'CaseOfTheWeek'];

  tags.find({ 'tagname' : { $in : questags } }).then(function(getQuesTags)
  {
    //console.log('tags-')
      res.json(getQuesTags)
  });
}
//*
//**********************************************************************
exports.setQuestionView = function(req,res){
    const question_views= db.get('question_views');
    question_views.insert({'userid':req.body.userid,'questionid':req.body.questionid,'created_at':Date.now(),'source':req.body.source}).then(function(insertquestionview){
res.json(insertquestionview);
    }).catch(function(error){
     //console.log('article view not insert');
   });

}
exports.getQuestionView = function(req,res){
    const question_views= db.get('question_views');
    question_views.aggregate([
     {'$match':{'questionid':req.body.questionid}},
     {"$sort": {"_id": -1}},
     {
        $lookup:
        {
                   from: "users",
                   localField: "userid",
                   foreignField: "unique_id",
                   as: "userdetail"
        }
    },
    { "$unwind": "$userdetail" },
    { "$project": {
        "_id":1,
        "created_at":1,
        "userdetail.unique_id":1,
        "userdetail.firstname":1,
        "userdetail.lastname":1,
        "userdetail.profile":1

    }
}
    ]).then(function(getViews){
        res.json(getViews);
    }).catch(function(error){
        //console.log('article view not found');
      });

}
exports.updatesaveQuestion = function(req,res)
{
  if(req.body.oldq_version==req.body.question_version)
  {
    const questions= db.get('questions');
    const posts= db.get('posts');
    // console.log("body >>>>>>>>>>>>>> ", req.body)

    if(req.body.question_text!=='' && req.body.question_text!==null)
    {
      questions.findOneAndUpdate({'_id':req.body.id},{$set:{'q_order':req.body.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':req.body.answer_key,'imagevisibility':req.body.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':req.body.uploadedstem_file,'hero_img':req.body.uploaded_file,'stem_image_permission':req.body.stemimagevalidation.image_permission,'stem_image_source':req.body.stemimagevalidation.image_source,'question_image_permission':req.body.questionimagevalidation.image_permission,'question_image_source':req.body.questionimagevalidation.image_source,'stem_text':req.body.stem_text,'instruction_text':req.body.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':req.body.question_text,'option_type':req.body.option_type,'answer_explanation':req.body.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'updatedby':req.body.createdby,'updated_at':Date.now(), 'multiple_uploadedstem_file': req.body.multiple_uploadedstem_file, 'multiple_uploaded_file': req.body.multiple_uploaded_file}})
      .then(function(insertquestion)
      {
        const options = {upsert: true,returnNewDocument: true};
        if(req.body.publish_date>Date.now()){
            posts.findOneAndUpdate({ 'questionid': req.body.id},{$set:{'tags':req.body.tags,'posted_at':req.body.publish_date}}).then(function(finaldata){
                //console.log('hhhh'+finaldata);
              }).catch(function(error){
                //console.log('question not insert');
              });
              NotificationCons.updatenotificatiodate(req.body.id,req.body.publish_date);
        }else{
        posts.findOneAndUpdate({ 'questionid': req.body.id},{$set:{'tags':req.body.tags}}).then(function(finaldata){
            //console.log('hhhh'+finaldata);
          }).catch(function(error){
            //console.log('question not insert');
          });
        }
        res.json(insertquestion);
      }).catch(function(error){
          res.json([]);
        });
    }
    else
    {
      res.json({"error":"Some fields required in this form."});
    }
  }
  else
  {
    const questions= db.get('questions');
    if(req.body.question_text!=='' && req.body.question_text!==null)
    {
      questions.insert({'q_order':req.body.q_order,'parent_qid':req.body.id,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':req.body.answer_key,'imagevisibility':req.body.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':req.body.uploadedstem_file,'hero_img':req.body.uploaded_file,'stem_image_permission':req.body.stemimagevalidation.image_permission,'stem_image_source':req.body.stemimagevalidation.image_source,'question_image_permission':req.body.questionimagevalidation.image_permission,'question_image_source':req.body.questionimagevalidation.image_source,'stem_text':req.body.stem_text,'instruction_text':req.body.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':req.body.question_text,'option_type':req.body.option_type,'answer_explanation':req.body.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now() , 'multiple_uploadedstem_file': req.body.multiple_uploadedstem_file, 'multiple_uploaded_file': req.body.multiple_uploaded_file})

      .then(function(insertquestion)
      {
              res.json(insertquestion);
      }).catch(function(error){
          res.json([]);
        });
    }
    else
    {
      res.json({"error":"Some fields required in this form."});
    }
  }
}
exports.UnpublishQuestion = function(req,res)
{
    const questions= db.get('questions');
    const posts= db.get('posts');
    const notifications= db.get('notifications');
    questions.findOneAndUpdate({ '_id': req.body.questionid},{$set:{'publish':0}});
    posts.findOneAndUpdate({'questionid': req.body.questionid},{$set:{'deleted':true}});
    //posts.remove({'questionid': req.body.questionid});
    notifications.update({ 'questionid': req.body.questionid},{$set:{'status':false}});
    res.json([{'status':200}]);
}
exports.getSingleCaseQuestion = function(req,res)
{
  const casequestions= db.get('casequestions');
  casequestions.findOne({'parentqid':req.body.questionid,'q_order':1}).then(function(findquestion){
    res.send(findquestion._id);
  }).catch(function(error){
      res.send(null);
    });
}
exports.getSingleStudentQuestion = function(req,res)
{
  const casequestions= db.get('studentquestions');
  casequestions.findOne({'parentqid':req.body.questionid,'q_order':1}).then(function(findquestion){
    res.send(findquestion._id);
  }).catch(function(error){
      res.send(null);
    });
}
exports.PublishQuestionReport = function(req,res){
    const questions= db.get('questions');
    const posts= db.get('posts');
    questions.findOneAndUpdate({ '_id': req.body.questionid},{$set:{'publish':1,'publish_date':Date.now()}}).then(function(updatearticle){
    const newIdpre = db.id()
    const newId=newIdpre.toString();
    //console.log('objectidd',newId);
    if(updatearticle.questiontype=='5d15fea98edfed6c417592d9'){
var questiontypename='KFP';
var pageurl='caseofweekanswer';
    }else if(updatearticle.questiontype=='5d15fea98edfed6c417592d10'){
        var questiontypename='SBA';
        var pageurl='sbaquestionanswer';
    }
    else if(updatearticle.questiontype=='5d15fea98edfed6c417592d11'){
        var questiontypename='MEMQ';
        var pageurl='sbaquestionanswer';
    }
    else if(updatearticle.questiontype=='5d15fea98edfed6c417592d12'){
        var questiontypename='MCQ';
        var pageurl='caseofweekanswer';
    }
    else if(updatearticle.questiontype=='5d15fea98edfed6c417592d13'){
        var questiontypename='SBA/MCQ';
        var pageurl='sbaquestionanswer';
    }
    else if(updatearticle.questiontype=='5d15fea98edfed6c417592d14'){
        var questiontypename='CASE';
        var pageurl='caseofweekanswer';
    }else if(updatearticle.questiontype=='5d15fea98edfed6c417592d15'){
        var questiontypename='Image of the week';
        var pageurl='imageofweekanswer';
    }else if(updatearticle.questiontype=='5d15fea98edfed6c417592d16'){
        var questiontypename='Student Question';
        var pageurl='studentquestionanswer';
    }else{
        var questiontypename='';
        var pageurl='';
    }
    const options = {upsert: true,returnNewDocument: true};
    posts.findOne({'questionid': req.body.questionid}).then(function(postcheck){
    if(postcheck!==null){
        posts.findOneAndUpdate({'questionid': req.body.questionid},{$set:{'questiontype' : updatearticle.questiontype,'active' : true, 'deleted' : false, 'reported' : false, 'updated_by' : '', 'resourceid' : false,'parentid':null,'eventid':null,'pollid':null,'acticleid':null,'pdfpreviewimage':null,'attached':null,'content':'','tags':updatearticle.tags,'created_by':req.body.userid,'posted_at':Date.now(),'questionid':req.body.questionid,'childquestionid':req.body.childquestionid}},options).then(function(insertcomment){
            var reqdata={"weburl":pageurl,"appurl":'','scheduled':Date.now(),"targetid":req.body.questionid,"childtargetid":null,"q_type":questiontypename,"title":updatearticle.q_title,"questionid":req.body.questionid,"postid":insertcomment.unique_id,"createdby":req.body.userid};
            //console.log('notification'+reqdata);
            NotificationCons.intsetquestionpublishnotification(reqdata);
            res.json([{'status':200}]);
        }).catch(function(error){
            res.json([]);
        });
    }else{
        posts.findOneAndUpdate({'questionid': req.body.questionid},{$set:{'questiontype' : updatearticle.questiontype,'active' : true, 'deleted' : false, 'reported' : false, 'updated_by' : '', 'resourceid' : false,'parentid':null,'eventid':null,'pollid':null,'acticleid':null,'pdfpreviewimage':null,'attached':null,'content':'','tags':updatearticle.tags,'unique_id':newId,'created_by':req.body.userid,'posted_at':Date.now(),'questionid':req.body.questionid,'childquestionid':req.body.childquestionid}},options).then(function(insertcomment){
            var reqdata={"weburl":pageurl,"appurl":'','scheduled':Date.now(),"targetid":req.body.questionid,"childtargetid":null,"q_type":questiontypename,"title":updatearticle.q_title,"questionid":req.body.questionid,"postid":newId,"createdby":req.body.userid};
            //console.log('notification'+reqdata);
            NotificationCons.intsetquestionpublishnotification(reqdata);
            res.json([{'status':200}]);
        }).catch(function(error){
            res.json([]);
        });
    }
}).catch(function(error){

    res.json([]);
});
   }).catch(function(error){
       res.json([]);
   });
}
exports.saveKFPQuestion = function(req,res)
{
    const kfpquestions= db.get('kfpquestions');
    req.body.data.forEach(function(qdata){
     if(qdata.stem.length>0){
var stem_text=qdata.stem[0].stem_text
     }else{
 var stem_text=null
     }
     if(qdata.question_text!=='' && qdata.question_text!==null){
    //  kfpquestions.insert({'q_subject':req.body.q_subject,'q_title':req.body.q_title,'q_order':qdata.q_order,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.q_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(),'updatedby':req.body.createdby,'updated_at':Date.now()})

    // for multiple image submission
    kfpquestions.insert({'q_subject':req.body.q_subject,'q_title':req.body.q_title,'q_order':qdata.q_order,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.q_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(),'updatedby':req.body.createdby,'updated_at':Date.now(), 'multiple_uploadedstem_file':qdata.multiple_uploadedstem_file, 'multiple_uploaded_file' : qdata.multiple_uploaded_file })
     .then(function(insertquestion){
      //console.log('KFP insert');
      const kfpquestion_options= db.get('kfpquestion_options');
      qdata.options.forEach(function(optval){
  if(optval.option_text!==''){
   var questionid= insertquestion._id.toString();
    kfpquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
  }).catch(function(error){

  });
  }
  })
}).catch(function(error){
    //console.log('KFP not insert');
});
    }else{

    }
});
res.json([]);
}
//*************************************************************************************************

exports.saveImgWeekQuestion = function(req,res)
{
    const imgweekquestions= db.get('imgofweekquestions');
    req.body.data.forEach(function(qdata)
    {
        if(qdata.stem.length>0)
        {
            var stem_text=qdata.stem[0].stem_text
        }
        else
        {
            var stem_text=null
        }
        if(qdata.question_text!=='' && qdata.question_text!==null)
        {
            imgweekquestions.insert({'q_subject':req.body.q_subject,'q_title':req.body.q_title,'q_order':qdata.q_order,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.q_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(), 'multiple_uploadedstem_file':qdata.multiple_uploadedstem_file, 'multiple_uploaded_file' : qdata.multiple_uploaded_file})

            .then(function(insertquestion)
            {
                //console.log('imgweek insert');
                const imgweekquestion_options= db.get('imgofweekquestion_options');
                qdata.options.forEach(function(optval)
                {
                    if(optval.option_text!=='')
                    {
                        var questionid= insertquestion._id.toString();
                        imgweekquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
                        }).catch(function(error){ });
                    }
                })
            }).catch(function(error){
                    //console.log('imgweek not insert');
                });
        }
        else{ }
    });
    res.json([]);
}
//*************************************************************************************************

exports.saveCaseBaseQuestion = function(req,res){

    const casequestions= db.get('casequestions');

    req.body.data.forEach(function(qdata){
     if(qdata.stem.length>0){
        var stem_text=qdata.stem[0].stem_text
     }else{
        var stem_text=null
     }
     if(qdata.question_text!=='' && qdata.question_text!==null){

    //  casequestions.insert({'q_subject':req.body.q_subject,'q_title':req.body.q_title,'q_order':qdata.q_order,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.q_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()})

    // this is new impimentation for mutiple image submission
    casequestions.insert({'q_subject':req.body.q_subject,'q_title':req.body.q_title,'q_order':qdata.q_order,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.q_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(), "multiple_uploadedstem_file": qdata.multiple_uploadedstem_file, "multiple_uploaded_file": qdata.multiple_uploaded_file})


     .then(function(insertquestion){
      const casequestion_options= db.get('casequestion_options');
      qdata.options.forEach(function(optval){
  if(optval.option_text!==''){
   var questionid= insertquestion._id.toString();
   casequestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
  }).catch(function(error){

  });
  }
  })
}).catch(function(error){
    //console.log('KFP not insert');
});
    }else{

    }
});
res.json([]);
}
//*************************************************************************************************************************************************

exports.saveStudentQuestion = function(req,res)
{
    const studentquestions= db.get('studentquestions');
    req.body.data.forEach(function(qdata)
    {
      if(qdata.stem.length>0)
      {
        var stem_text=qdata.stem[0].stem_text
      }
      else
      {
        var stem_text=null
      }
      if(qdata.question_text!=='' && qdata.question_text!==null)
      {
        studentquestions.insert({'q_subject':req.body.q_subject,'q_title':req.body.q_title,'q_order':qdata.q_order,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.q_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(), 'multiple_uploadedstem_file':qdata.multiple_uploadedstem_file, 'multiple_uploaded_file':qdata.multiple_uploaded_file})
        .then(function(insertquestion){
          //console.log('student ques insert');
          const studentquestion_options= db.get('studentquestion_options');
          qdata.options.forEach(function(optval)
          {
            if(optval.option_text!==''){
              var questionid= insertquestion._id.toString();
              studentquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()})
              .then(function(insertoptions)
              { }).catch(function(error){});
            }
          })
        }).catch(function(error){
            //console.log('student ques not insert');
          });
      }
      else
      {

      }
    });
    res.json([]);
}

//*************************************************************************************************************************************************
exports.saveCaseComments = function(req,res){
    const post_comments= db.get('comments');
    const case_comments= db.get('case_comments');
    var anonymousimags=['/icons/anonymoususer_1.svg','/icons/anonymoususer_2.svg','/icons/anonymoususer_3.svg','/icons/anonymoususer_4.svg','/icons/anonymoususer_5.svg'];
    var dummyprofile=anonymousimags[Math.floor(Math.random() * anonymousimags.length)];
    if(req.body.content!==null && req.body.content!==''){
    case_comments.insert({'asynccheck':req.body.asynccheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile, 'replyid':req.body.replyid,'questionid':req.body.questionid,'content':req.body.content,'postid':req.body.postid,'parentqid':req.body.parentqid,'parentid':req.body.commentid,'created_by':req.body.createdby,'created_at':Date.now()}).then(function(insertcomments){
        const newIdpre = db.id()
        const newId=newIdpre.toString();
        //console.log('objectidd',newId);
        post_comments.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'questionid':req.body.parentqid,'unique_id':newId,'replyid':req.body.replyid,'asynccheck':req.body.asynccheck,'content':req.body.content,'postid':req.body.postid,'parentid':req.body.commentid,'created_by':req.body.createdby,'created_at':Date.now()}).then(function(insertcomment){
            var reqdata={"weburl":'caseofweekanswer',"appurl":'',"targetid":req.body.parentqid,'asynccheck':req.body.asynccheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,"childtargetid":req.body.questionid,"q_type":'CASE',"title":req.body.title,"questionid":req.body.questionid,postid:req.body.postid,createdby:req.body.createdby};
            //console.log('notification'+reqdata);
            NotificationCons.setcasecommentnotification(reqdata);

            NotificationCons.setfiveuserscommentnotification(reqdata);

        }).catch(function(error){
        });
res.json(insertcomments);
  }).catch(function(error){
    res.json([]);
});
}else{
    res.json([]);
}

}
//*************************************************************************************************************************************************
exports.saveStudentComments = function(req,res)
{
    const post_comments= db.get('comments');
    const case_comments= db.get('student_comments');
    var anonymousimags=['/icons/anonymoususer_1.svg','/icons/anonymoususer_2.svg','/icons/anonymoususer_3.svg','/icons/anonymoususer_4.svg','/icons/anonymoususer_5.svg'];
    var dummyprofile=anonymousimags[Math.floor(Math.random() * anonymousimags.length)];
    if(req.body.content!==null && req.body.content!=='')
    {
      case_comments.insert({'asynccheck':req.body.asynccheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile, 'replyid':req.body.replyid,'questionid':req.body.questionid,'content':req.body.content,'postid':req.body.postid,'parentqid':req.body.parentqid,'parentid':req.body.commentid,'created_by':req.body.createdby,'created_at':Date.now()})
      .then(function(insertcomments)
      {
        const newIdpre = db.id()
        const newId=newIdpre.toString();
        //console.log('objectidd',newId);
        post_comments.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'questionid':req.body.parentqid,'unique_id':newId,'replyid':req.body.replyid,'asynccheck':req.body.asynccheck,'content':req.body.content,'postid':req.body.postid,'parentid':req.body.commentid,'created_by':req.body.createdby,'created_at':Date.now()})
        .then(function(insertcomment)
        {
            var reqdata={"weburl":'studentquestionanswer',"appurl":'',"targetid":req.body.parentqid,'asynccheck':req.body.asynccheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,"childtargetid":req.body.questionid,"q_type":'Student Question',"title":req.body.title,"questionid":req.body.questionid,postid:req.body.postid,createdby:req.body.createdby};
            //console.log('notification'+reqdata);
            // NotificationCons.setcasecommentnotification(reqdata);

            NotificationCons.setfiveuserscommentnotification(reqdata);

        }).catch(function(error){
        });
res.json(insertcomments);
  }).catch(function(error){
    res.json([]);
});
}else{
    res.json([]);
}

}
//*************************************************************************************************************************************************
exports.saveKFPComments = function(req,res){
    const post_comments= db.get('comments');
    var anonymousimags=['/icons/anonymoususer_1.svg','/icons/anonymoususer_2.svg','/icons/anonymoususer_3.svg','/icons/anonymoususer_4.svg','/icons/anonymoususer_5.svg'];
    var dummyprofile=anonymousimags[Math.floor(Math.random() * anonymousimags.length)];
        const newIdpre = db.id()
        const newId=newIdpre.toString();
        //console.log('objectidd',newId);
        post_comments.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'questionid':null,'unique_id':newId,'asynccheck':req.body.asynccheck,'content':req.body.comment,'postid':req.body.postid,'parentid':req.body.commentid,'replyid':req.body.replyid,'created_by':req.body.createdby,'created_at':Date.now()}).then(function(insertcomment){
            var reqdata={"weburl":'questionanswer',"appurl":'',"targetid":req.body.questionid,'asynccheck':req.body.asynccheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,"childtargetid":null,"q_type":'KFP',"title":req.body.title,"questionid":req.body.questionid,postid:req.body.postid,createdby:req.body.createdby};
            //console.log('notification'+reqdata);
            NotificationCons.setkfpcommentnotification(reqdata);

            res.json(insertcomment);
        }).catch(function(error){
            res.json([]);
        });



}
//*******************************************************************************************************

exports.saveImgWeekComments = function(req,res)
{
    const post_comments= db.get('comments');
    var anonymousimags=['/icons/anonymoususer_1.svg','/icons/anonymoususer_2.svg','/icons/anonymoususer_3.svg','/icons/anonymoususer_4.svg','/icons/anonymoususer_5.svg'];
    var dummyprofile=anonymousimags[Math.floor(Math.random() * anonymousimags.length)];
    const newIdpre = db.id()
    const newId=newIdpre.toString();
    //console.log('objectidd',newId);
    post_comments.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'questionid':null,'unique_id':newId,'asynccheck':req.body.asynccheck,'content':req.body.comment,'postid':req.body.postid,'parentid':req.body.commentid,'replyid':req.body.replyid,'created_by':req.body.createdby,'created_at':Date.now()})
    .then(function(insertcomment)
    {
        // var reqdata={"weburl":'imageofweekanswer',"appurl":'',"targetid":req.body.questionid,'asynccheck':req.body.asynccheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,"childtargetid":null,"q_type":'Image of the Week',"title":req.body.title,"questionid":req.body.questionid,postid:req.body.postid,createdby:req.body.createdby};
        // //console.log('notification'+reqdata);
        // NotificationCons.setkfpcommentnotification(reqdata);
        res.json(insertcomment);
    }).catch(function(error){
            res.json([]);
        });
}
//*******************************************************************************************************

exports.saveSBAComments = function(req,res)
{
    const post_comments= db.get('comments');
    var anonymousimags=['/icons/anonymoususer_1.svg','/icons/anonymoususer_2.svg','/icons/anonymoususer_3.svg','/icons/anonymoususer_4.svg','/icons/anonymoususer_5.svg'];
    var dummyprofile=anonymousimags[Math.floor(Math.random() * anonymousimags.length)];
    const newIdpre = db.id()
    const newId=newIdpre.toString();
    //console.log('objectidd',newId);
    post_comments.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'questionid':null,'unique_id':newId,'asynccheck':req.body.asynccheck,'content':req.body.comment,'postid':req.body.postid,'parentid':req.body.commentid,'replyid':req.body.replyid,'created_by':req.body.createdby,'created_at':Date.now()})
    .then(function(insertcomment)
    {
            var reqdata={"weburl":'sbaquestionanswer',"appurl":'',"targetid":req.body.questionid,'asynccheck':req.body.asynccheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,"childtargetid":null,"q_type":'SBA',"title":req.body.title,"questionid":req.body.questionid,postid:req.body.postid,createdby:req.body.createdby};
            //console.log('notification'+reqdata);
            NotificationCons.setsbacommentnotification(reqdata);
            res.json(insertcomment);
    }).catch(function(error){
            res.json([]);
      });
}

//*******************************************************************************************************
exports.removeCaseComments = function(req,res){
    const case_comments= db.get('case_comments');
    case_comments.remove({'_id':req.body.id});
    res.json([]);
}
exports.removeStudentComments = function(req,res){
    const case_comments= db.get('student_comments');
    case_comments.remove({'_id':req.body.id});
    res.json([]);
}
exports.updateCaseComments = function(req,res){
    const post_comments= db.get('comments');
    const case_comments= db.get('case_comments');
    //console.log('updated it');
    case_comments.findOneAndUpdate({'_id':req.body.id},{$set:{'content':req.body.content,'updated_by':req.body.createdby,'updated_at':Date.now()}}).then(function(insertcomments){
//console.log('case updated');
        post_comments.findOneAndUpdate({'_id':req.body.id},{$set:{'content':req.body.content,'updated_by':req.body.createdby,'updated_at':Date.now()}}).then(function(insertcomment){
            //console.log('post updated');
        }).catch(function(error){
            //console.log('post not updated');
        });
res.json(insertcomments);
  }).catch(function(error){
    //console.log('case not  updated');
    res.json([]);
});

}
//***************************************************************************************************************

exports.updateStudentComments = function(req,res)
{
  const post_comments= db.get('comments');
  const student_comments= db.get('student_comments');
  //console.log('updated it');
  student_comments.findOneAndUpdate({'_id':req.body.id},{$set:{'content':req.body.content,'updated_by':req.body.createdby,'updated_at':Date.now()}})
  .then(function(insertcomments)
  {
    //console.log('student ques updated');
    post_comments.findOneAndUpdate({'_id':req.body.id},{$set:{'content':req.body.content,'updated_by':req.body.createdby,'updated_at':Date.now()}})
    .then(function(insertcomment)
    {
      //console.log('post updated');
    }).catch(function(error){
        //console.log('post not updated');
      });
    res.json(insertcomments);
  }).catch(function(error){
      //console.log('student ques not  updated');
      res.json([]);
    });
}
//***************************************************************************************************************
exports.getFilterquestiontypes = function(req,res){
    const question_types= db.get('question_types');
    question_types.find({'unique_id': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14','5d15fea98edfed6c417592d15','5d15fea98edfed6c417592d16'] }}).then(function(getQuestion_types){
        res.json(getQuestion_types);
    });

}
exports.updatesaveKFPQuestion = function(req,res){
    if(req.body.oldq_version==req.body.question_version){
        const kfpquestions= db.get('kfpquestions');
    req.body.data.forEach(function(qdata){
     if(qdata.stem.length>0){
var stem_text=qdata.stem[0].stem_text
     }else{
 var stem_text=null
     }
     if(qdata.id){
     kfpquestions.findOneAndUpdate({'_id':qdata.id},{$set:{'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'hero_img':qdata.uploaded_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'updatedby':req.body.createdby,'updated_at':Date.now(), "multiple_uploadedstem_file": qdata.multiple_uploadedstem_file, "multiple_uploaded_file": qdata.multiple_uploaded_file}})

     .then(function(insertquestion){
      //console.log('KFP insert');
      const kfpquestion_options= db.get('kfpquestion_options');
      qdata.options.forEach(function(optval){
  if(optval.option_text!==''){
   var questionid= insertquestion._id.toString();
   if(optval.id){
    kfpquestion_options.findOneAndUpdate({'_id':optval.id},{$set:{'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(insertoptions){
  }).catch(function(error){

  });
   }else{
    kfpquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
    }).catch(function(error){

    });
   }
  }
  })
}).catch(function(error){
    //console.log('KFP not insert');
});
     }else{
        if(qdata.question_text!=='' && qdata.question_text!==null){
        kfpquestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(),'updatedby':req.body.createdby,'updated_at':Date.now()}).then(function(insertquestion){
            //console.log('KFP insert');
            const kfpquestion_options= db.get('kfpquestion_options');
            qdata.options.forEach(function(optval){
        if(optval.option_text!==''){
         var questionid= insertquestion._id.toString();
          kfpquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
        }).catch(function(error){

        });
        }
        })
      }).catch(function(error){
          //console.log('KFP not insert');
      });
    }
     }

});
res.json([]);
    }else{
        const kfpquestions= db.get('kfpquestions');
        req.body.data.forEach(function(qdata){
         if(qdata.stem.length>0){
    var stem_text=qdata.stem[0].stem_text
         }else{
     var stem_text=null
         }
         kfpquestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestion){
          //console.log('KFP insert');
          const kfpquestion_options= db.get('kfpquestion_options');
          qdata.options.forEach(function(optval){
      if(optval.option_text!==''){
       var questionid= insertquestion._id.toString();
        kfpquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
      }).catch(function(error){

      });
      }
      })
    }).catch(function(error){
        //console.log('KFP not insert');
    });

    });
    res.json([]);
    }
}
exports.updatesaveCaseBaseQuestion = function(req,res){

    if(req.body.oldq_version==req.body.question_version){
        const casequestions= db.get('casequestions');
        const posts= db.get('posts');
    req.body.data.forEach(function(qdata){
     if(qdata.stem.length>0){
var stem_text=qdata.stem[0].stem_text
     }else{
 var stem_text=null
     }
     if(qdata.id){
        casequestions.findOneAndUpdate({'_id':qdata.id},{$set:{'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'hero_img':qdata.uploaded_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'updatedby':req.body.createdby,'updated_at':Date.now(), multiple_uploadedstem_file: qdata.multiple_uploadedstem_file, multiple_uploaded_file: qdata.multiple_uploaded_file}})
        .then(function(insertquestion){
      //console.log('case insert');
      const casequestion_options= db.get('casequestion_options');
      qdata.options.forEach(function(optval){
  if(optval.option_text!==''){
   var questionid= insertquestion._id.toString();
   if(optval.id){
    casequestion_options.findOneAndUpdate({'_id':optval.id},{$set:{'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(insertoptions){
  }).catch(function(error){

  });
   }else{
    casequestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
    }).catch(function(error){

    });
   }
  }
  })
}).catch(function(error){
    //console.log('case not insert');
});
     }else{
        casequestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestion){
            //console.log('KFP insert');
            var newIdpre = db.id()
    var newId=newIdpre.toString();
    //console.log('objectidd',newId);
    var questionid= insertquestion._id.toString();
    if(req.body.publish_date>Date.now()){
    var pblsdate=req.body.publish_date;
    }else{
        var pblsdate=Date.now();
    }
    posts.insert({'questiontype' : req.body.questiontype, 'active' : true, 'deleted' : false, 'reported' : false, 'updated_by' : '', 'resourceid' : false,'parentid':null,'eventid':null,'pollid':null,'acticleid':null,'pdfpreviewimage':null,'attached':null,'content':'','searchcontent':req.body.q_title,'tags':req.body.tags,'unique_id':newId,'created_by':req.body.createdby,'posted_at':pblsdate,'questionid':req.body.parentqid,'childquestionid':questionid,'created_at':Date.now()}).then(function(insertcomment){
        var reqdata={"weburl":'caseofweekanswer',"appurl":'',"targetid":req.body.parentqid,"childtargetid":questionid,"q_type":'CASE',"title":req.body.q_title,"questionid":questionid,"postid":newId,"createdby":req.body.createdby,'scheduled':Date.now()};
        //console.log('notification'+reqdata);
        NotificationCons.intsetquestionpublishnotification(reqdata);
                   //console.log('post insert in case');
            const casequestion_options= db.get('casequestion_options');
            qdata.options.forEach(function(optval){
        if(optval.option_text!==''){

         casequestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
        }).catch(function(error){
        //console.log(error);
        });
        }
        })

    }).catch(function(error){
        //console.log(error);
    });
      }).catch(function(error){
          //console.log('KFP not insert');
      });
     }

});
res.json([]);
    }else{
        const casequestions= db.get('casequestions');
        req.body.data.forEach(function(qdata){
         if(qdata.stem.length>0){
    var stem_text=qdata.stem[0].stem_text
         }else{
     var stem_text=null
         }
         casequestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestion){
          //console.log('KFP insert');
          const casequestion_options= db.get('casequestion_options');
          qdata.options.forEach(function(optval){
      if(optval.option_text!==''){
       var questionid= insertquestion._id.toString();
       casequestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
      }).catch(function(error){

      });
      }
      })
    }).catch(function(error){
        //console.log('KFP not insert');
    });

    });
    res.json([]);
    }
}
//******************************************************************************************************
exports.updateSaveStudentQuestion = function(req,res)
{
  if(req.body.oldq_version==req.body.question_version)
  {
    const casequestions= db.get('studentquestions');
    const posts= db.get('posts');
    req.body.data.forEach(function(qdata)
    {
      if(qdata.stem.length>0){
        var stem_text=qdata.stem[0].stem_text
      }else{
        var stem_text=null
      }
      if(qdata.id)
      {
        casequestions.findOneAndUpdate({'_id':qdata.id},{$set:{'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'hero_img':qdata.uploaded_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'updatedby':req.body.createdby,'updated_at':Date.now(), 'multiple_uploadedstem_file': qdata.multiple_uploadedstem_file, 'multiple_uploaded_file' : qdata.multiple_uploaded_file }})
        .then(function(insertquestion)
        {
          //console.log('case insert');
          const casequestion_options= db.get('studentquestion_options');
          qdata.options.forEach(function(optval)
          {
            if(optval.option_text!==''){
              var questionid= insertquestion._id.toString();
              if(optval.id){
                casequestion_options.findOneAndUpdate({'_id':optval.id},{$set:{'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'updatedby':req.body.createdby,'updated_at':Date.now()}})
                .then(function(insertoptions){ }).catch(function(error){ });
              }else{
                casequestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()})
                .then(function(insertoptions){ }).catch(function(error){ });
              }
            }
          })
        }).catch(function(error){
            //console.log('case not insert');
          });
      }
      else
      {
        casequestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()})
        .then(function(insertquestion)
        {
          //console.log('KFP insert');
          var newIdpre = db.id()
          var newId=newIdpre.toString();
          //console.log('objectidd',newId);
          var questionid= insertquestion._id.toString();
          if(req.body.publish_date>Date.now()){
            var pblsdate=req.body.publish_date;
          }else{
            var pblsdate=Date.now();
          }
          posts.insert({'questiontype' : req.body.questiontype, 'active' : true, 'deleted' : false, 'reported' : false, 'updated_by' : '', 'resourceid' : false,'parentid':null,'eventid':null,'pollid':null,'acticleid':null,'pdfpreviewimage':null,'attached':null,'content':'','searchcontent':req.body.q_title,'tags':req.body.tags,'unique_id':newId,'created_by':req.body.createdby,'posted_at':pblsdate,'questionid':req.body.parentqid,'childquestionid':questionid,'created_at':Date.now()})
          .then(function(insertcomment)
          {
            var reqdata={"weburl":'studentquestionanswer',"appurl":'',"targetid":req.body.parentqid,"childtargetid":questionid,"q_type":'Student Question',"title":req.body.q_title,"questionid":questionid,"postid":newId,"createdby":req.body.createdby,'scheduled':Date.now()};
            //console.log('notification'+reqdata);
            NotificationCons.intsetquestionpublishnotification(reqdata);
            //console.log('post insert in case');
            const casequestion_options= db.get('studentquestion_options');
            qdata.options.forEach(function(optval){
              if(optval.option_text!=='')
              {
                casequestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()})
                .then(function(insertoptions)
                { }).catch(function(error){
                      //console.log(error);
                    });
              }
            })
          }).catch(function(error){
              //console.log(error);
            });
        }).catch(function(error){
            //console.log('KFP not insert');
          });
      }
    });
    res.json([]);
  }
  else
  {
    const casequestions= db.get('studentquestions');
    req.body.data.forEach(function(qdata){
    if(qdata.stem.length>0)
    {
      var stem_text=qdata.stem[0].stem_text
    }else{
      var stem_text=null
    }
    casequestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()})
    .then(function(insertquestion)
    {
      //console.log('KFP insert');
      const casequestion_options= db.get('studentquestion_options');
      qdata.options.forEach(function(optval){
        if(optval.option_text!==''){
          var questionid= insertquestion._id.toString();
          casequestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()})
          .then(function(insertoptions){ }).catch(function(error){ });
        }
      })
    }).catch(function(error){
        //console.log('KFP not insert');
      });
    });
    res.json([]);
  }
}
//****************************************************************************************************************************************
exports.publishQuestion = function(req,res){
    const questions= db.get('questions');
    if(req.body.question_text!=='' && req.body.question_text!==null){

    // questions.insert({'q_order':req.body.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'imagevisibility':req.body.imagevisibility,'answer_key':req.body.answer_key,'q_version':req.body.q_version,'uploadedstem_file':req.body.uploadedstem_file,'hero_img':req.body.uploaded_file,'stem_image_permission':req.body.stemimagevalidation.image_permission,'stem_image_source':req.body.stemimagevalidation.image_source,'question_image_permission':req.body.questionimagevalidation.image_permission,'question_image_source':req.body.questionimagevalidation.image_source,'stem_text':req.body.stem_text,'instruction_text':req.body.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':req.body.question_text,'option_type':req.body.option_type,'answer_explanation':req.body.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':1,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()})

    // this is new implimentation for multiple image submission

    questions.insert({'q_order':req.body.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'imagevisibility':req.body.imagevisibility,'answer_key':req.body.answer_key,'q_version':req.body.q_version,'uploadedstem_file':req.body.uploadedstem_file,'hero_img':req.body.uploaded_file,'stem_image_permission':req.body.stemimagevalidation.image_permission,'stem_image_source':req.body.stemimagevalidation.image_source,'question_image_permission':req.body.questionimagevalidation.image_permission,'question_image_source':req.body.questionimagevalidation.image_source,'stem_text':req.body.stem_text,'instruction_text':req.body.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':req.body.question_text,'option_type':req.body.option_type,'answer_explanation':req.body.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':1,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now(), 'multiple_uploadedstem_file':req.body.multiple_uploadedstem_file, 'multiple_uploaded_file' : req.body.multiple_uploaded_file})
    .then(function(insertquestion){
        res.json(insertquestion);
    }).catch(function(error){
        res.json([]);
    });
    }else{
        res.json({"error":"Some fields required in this form."});
    }

}
exports.updatepublishQuestion = function(req,res)
{
  if(req.body.oldq_version==req.body.question_version)
  {
    const questions= db.get('questions');
    const posts= db.get('posts');
    if(req.body.question_text!=='' && req.body.question_text!==null)
    {
      questions.findOneAndUpdate({'_id':req.body.id},{$set:{'q_order':req.body.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':req.body.answer_key,'imagevisibility':req.body.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':req.body.uploadedstem_file,'hero_img':req.body.uploaded_file,'stem_image_permission':req.body.stemimagevalidation.image_permission,'stem_image_source':req.body.stemimagevalidation.image_source,'question_image_permission':req.body.questionimagevalidation.image_permission,'question_image_source':req.body.questionimagevalidation.image_source,'stem_text':req.body.stem_text,'instruction_text':req.body.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':req.body.question_text,'option_type':req.body.option_type,'answer_explanation':req.body.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':1,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'updatedby':req.body.createdby,'updated_at':Date.now()}})
      .then(function(insertquestion)
      {
        posts.findOneAndUpdate({ 'questionid': req.body.id},{$set:{'tags':req.body.tags,'posted_at':req.body.publish_date}}).then(function(finaldata){
          //console.log('hhhh'+finaldata);
        }).catch(function(error){
          //console.log('question not insert');
        });
        NotificationCons.updatenotificatiodate(req.body.id,req.body.publish_date);
         res.json(insertquestion);
      }).catch(function(error){
          res.json([]);
        });
    }
    else
    {
      res.json({"error":"Some fields required in this form."});
    }
  }
  else
  {
    const questions= db.get('questions');
    if(req.body.question_text!=='' && req.body.question_text!==null)
    {
      questions.insert({'parent_qid':req.body.id,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'imagevisibility':req.body.imagevisibility,'answer_key':req.body.answer_key,'q_version':req.body.question_version,'uploadedstem_file':req.body.uploadedstem_file,'hero_img':req.body.uploaded_file,'stem_image_permission':req.body.stemimagevalidation.image_permission,'stem_image_source':req.body.stemimagevalidation.image_source,'question_image_permission':req.body.questionimagevalidation.image_permission,'question_image_source':req.body.questionimagevalidation.image_source,'stem_text':req.body.stem_text,'instruction_text':req.body.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':req.body.question_text,'option_type':req.body.option_type,'answer_explanation':req.body.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':1,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()})
      .then(function(insertquestion){
            res.json(insertquestion);
      }).catch(function(error){
          res.json([]);
        });
    }
    else
    {
      res.json({"error":"Some fields required in this form."});
    }
  }
}
exports.QuestionAnswer = function(req,res){
    const question_answers= db.get('question_answers');
    question_answers.insert({'questionid':req.body.questionid,'answerid':req.body.answerid,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){
            res.json(insertanswer);
}).catch(function(error){
    res.json([]);
});


}
exports.KFPQuestionAnswer = function(req,res){
    const question_answers= db.get('question_answers');
    const posts= db.get('posts');
    const post_comments= db.get('comments');
    var anonymousimags=['/icons/anonymoususer_1.svg','/icons/anonymoususer_2.svg','/icons/anonymoususer_3.svg','/icons/anonymoususer_4.svg','/icons/anonymoususer_5.svg'];
      var dummyprofile=anonymousimags[Math.floor(Math.random() * anonymousimags.length)];
    question_answers.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'starttime':req.body.scurrenttime,'endtime':Date.now(),'questionid':req.body.questionid,'answerid':null,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

        req.body.answerdata.forEach(function(ansval){
        const kfpquestion_answers= db.get('kfpquestion_answers');
        if(Array.isArray(ansval.answerid)==true && ansval.answerid.length > 0){
         var answerids=ansval.answerid.join(",");
        }else if(Array.isArray(ansval.answerid)==false){
            var answerids=ansval.answerid;
        }else{
            var answerids=null;
        }
        kfpquestion_answers.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'starttime':req.body.scurrenttime,'endtime':Date.now(),'pquestionid':ansval._id,'answertext':ansval.answertext,'answerid':answerids,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

    }).catch(function(error){
    });
        });
        posts.findOne({'questionid':req.body.questionid}).then(function(findpost){
            const newIdpre = db.id()
            const newId=newIdpre.toString();
            //console.log('objectidd',newId);

            post_comments.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'questionid':req.body.questionid,'unique_id':newId,'asynccheck':req.body.anonymouscheck,'content':req.body.answerdata[0].answertext,'postid':findpost.unique_id,'parentid':null,'created_by':req.body.createdby,'created_at':Date.now()}).then(function(insertcomment){
                var reqdata={"weburl":'questionanswer',"appurl":'',"targetid":req.body.questionid,'asynccheck':req.body.anonymouscheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,"childtargetid":null,"q_type":'KFP',"title":req.body.title,"questionid":req.body.questionid,postid:null,createdby:req.body.createdby};
                //console.log('notification'+reqdata);
                NotificationCons.setkfpcommentnotification(reqdata);
            }).catch(function(error){
            });
}).catch(function(error){

});
}).catch(function(error){

});
res.json([]);

}


// Start Image Of the Week-------------------------------------------------------------- 23-11-2019------------------------------------------------------

exports.ImgofweekQuestionAnswer = function(req,res)
{
    const question_answers= db.get('question_answers');
    const posts= db.get('posts');
    const post_comments= db.get('comments');
    const imgofweekquestion_answers= db.get('imgofweekquestion_answers');

    var anonymousimags=['/icons/anonymoususer_1.svg','/icons/anonymoususer_2.svg','/icons/anonymoususer_3.svg','/icons/anonymoususer_4.svg','/icons/anonymoususer_5.svg'];
    var dummyprofile=anonymousimags[Math.floor(Math.random() * anonymousimags.length)];
    question_answers.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'starttime':req.body.scurrenttime,'endtime':Date.now(),'questionid':req.body.questionid,'answerid':null,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()})
    .then(function(insertanswer)
    {
        req.body.answerdata.forEach(function(ansval)
        {
            if(Array.isArray(ansval.answerid)==true && ansval.answerid.length > 0)
            {
                var answerids=ansval.answerid.join(",");
            }
            else if(Array.isArray(ansval.answerid)==false)
            {
                var answerids=ansval.answerid;
            }
            else
            {
                var answerids=null;
            }
            imgofweekquestion_answers.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'starttime':req.body.scurrenttime,'endtime':Date.now(),'pquestionid':ansval._id,'answertext':ansval.answertext,'answerid':answerids,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()})
            .then(function(insertanswer)
            {   }).catch(function(error){   });
        });
        posts.findOne({'questionid':req.body.questionid}).then(function(findpost)
        {
            const newIdpre = db.id()
            const newId=newIdpre.toString();
            //console.log('objectidd',newId);
            post_comments.insert({'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,'questionid':req.body.questionid,'unique_id':newId,'asynccheck':req.body.anonymouscheck,'content':req.body.answerdata[0].answertext,'postid':findpost.unique_id,'parentid':null,'created_by':req.body.createdby,'created_at':Date.now()})
            .then(function(insertcomment)
            {
                // var reqdata={"weburl":'imageofweekanswer',"appurl":'',"targetid":req.body.questionid,'asynccheck':req.body.anonymouscheck,'dummyname':req.body.dummyname,'dummyprofile':dummyprofile,"childtargetid":null,"q_type":'KFP',"title":req.body.title,"questionid":req.body.questionid,postid:null,createdby:req.body.createdby};
                // //console.log('notification'+reqdata);
                // NotificationCons.setkfpcommentnotification(reqdata);
            }).catch(function(error){   });
        }).catch(function(error){   });
    }).catch(function(error){ });
    res.json([]);
}


exports.ImgofweeksingleQuestionAnswer = function(req,res){
    const question_answers= db.get('question_answers');
    question_answers.insert({'questionid':req.body.questionid,'answerid':null,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

        req.body.answerdata.forEach(function(ansval){
        const imgofweekquestion_answers= db.get('kfpquestion_answers');
        if(Array.isArray(ansval.answerid)==true && ansval.answerid.length > 0){
         var answerids=ansval.answerid.join(",");
        }else if(Array.isArray(ansval.answerid)==false){
            var answerids=ansval.answerid;
        }else{
            var answerids=null;
        }
        imgofweekquestion_answers.insert({'pquestionid':ansval._id,'answertext':ansval.answertext,'answerid':answerids,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){
    }).catch(function(error){
    });
        });
}).catch(function(error){

});
res.json([]);

}



exports.KFPsingleQuestionAnswer = function(req,res){
    const question_answers= db.get('question_answers');
    question_answers.insert({'questionid':req.body.questionid,'answerid':null,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

        req.body.answerdata.forEach(function(ansval){
        const kfpquestion_answers= db.get('kfpquestion_answers');
        if(Array.isArray(ansval.answerid)==true && ansval.answerid.length > 0){
         var answerids=ansval.answerid.join(",");
        }else if(Array.isArray(ansval.answerid)==false){
            var answerids=ansval.answerid;
        }else{
            var answerids=null;
        }
        kfpquestion_answers.insert({'pquestionid':ansval._id,'answertext':ansval.answertext,'answerid':answerids,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){
    }).catch(function(error){
    });
        });
}).catch(function(error){

});
res.json([]);

}
exports.CASEsingleQuestionAnswer = function(req,res){
    const question_answers= db.get('question_answers');
    question_answers.insert({'dummyname':req.body.dummyname,'starttime':req.body.scurrenttime,'endtime':Date.now(),'questionid':req.body.questionid,'answerid':null,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

        req.body.answerdata.forEach(function(ansval){
        const casequestion_answers= db.get('casequestion_answers');
        if(Array.isArray(ansval.answerid)==true && ansval.answerid.length > 0){
         var answerids=ansval.answerid.join(",");
        }else if(Array.isArray(ansval.answerid)==false){
            var answerids=ansval.answerid;
        }else{
            var answerids=null;
        }
        casequestion_answers.insert({'dummyname':req.body.dummyname,'starttime':req.body.scurrenttime,'endtime':Date.now(),'pquestionid':ansval._id,'answertext':ansval.answertext,'answerid':answerids,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

    }).catch(function(error){
    });
        });
}).catch(function(error){

});
res.json([]);

}
exports.StudentsingleQuestionAnswer = function(req,res){
    const question_answers= db.get('question_answers');
    question_answers.insert({'dummyname':req.body.dummyname,'starttime':req.body.scurrenttime,'endtime':Date.now(),'questionid':req.body.questionid,'answerid':null,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

        req.body.answerdata.forEach(function(ansval){
        const casequestion_answers= db.get('studentquestion_answers');
        if(Array.isArray(ansval.answerid)==true && ansval.answerid.length > 0){
         var answerids=ansval.answerid.join(",");
        }else if(Array.isArray(ansval.answerid)==false){
            var answerids=ansval.answerid;
        }else{
            var answerids=null;
        }
        casequestion_answers.insert({'dummyname':req.body.dummyname,'starttime':req.body.scurrenttime,'endtime':Date.now(),'pquestionid':ansval._id,'answertext':ansval.answertext,'answerid':answerids,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){

    }).catch(function(error){
    });
        });
}).catch(function(error){

});
res.json([]);

}
exports.saveQuestionOption = function(req,res)
{
    var optionsdata=req.body.optiondatas;
    //console.log("optiondatas- ",optionsdata);
    const question_options= db.get('question_options');
    if(optionsdata.length>0 && optionsdata!==null)
    {
	    optionsdata.forEach(function(optval)
      {
        if(optval.option_text!=='' && optval.option_text!==null)
        {
          question_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':req.body.questionid,'createdby':req.body.createdby,'created_at':Date.now()})
          .then(function(insertoptions)
          {
            //console.log("option saved")
          }).catch(function(error){ });
        }
      })
    }
    res.json([]);
}
//******************************************************************************************
exports.getCaseCommentlikers = function(req,res)
{
    //console.log(req.body.commentid);
    const casecomment_likes= db.get('case_comment_likes');
    casecomment_likes.aggregate([
        { "$match":{'commentid': req.body.commentid,'status':1}},
        {"$sort": {"_id": 1}},
          {
              $lookup:
                  {
                      from: "users",
                      localField: "likeby",
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
//******************************************************************************************
exports.getStudentCommentLikers = function(req,res)
{
    //console.log(req.body.commentid);
    const studentcomment_likes= db.get('student_comment_likes');
    studentcomment_likes.aggregate([
        { "$match":{'commentid': req.body.commentid,'status':1}},
        {"$sort": {"_id": 1}},
          {
              $lookup:
                  {
                      from: "users",
                      localField: "likeby",
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
//******************************************************************************************
exports.updatesaveQuestionOption = function(req,res){
    if(req.body.oldq_version==req.body.question_version){
    var optionsdata=req.body.optiondatas;
    const question_options= db.get('question_options');
	optionsdata.forEach(function(optval){
if(optval.option_text!==''){
    if(optval.id){
    question_options.findOneAndUpdate(
            {'_id':optval.id},
            {$set:{'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'updatedby':req.body.createdby,'updated_at':Date.now()}}
        ).then(function(insertoptions){
}).catch(function(error){

});
    }else{
        question_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':req.body.questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
        }).catch(function(error){

        });
    }
}
})
res.json([]);
    }else{
        var optionsdata=req.body.optiondatas;
    const question_options= db.get('question_options');
	optionsdata.forEach(function(optval){
if(optval.option_text!==''){
    question_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':req.body.questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
}).catch(function(error){

});
}
})
res.json([]);
    }
}
exports.getQuestionOrder = function(req,res){
const questions= db.get(req.body.tablename);
if(req.body.questionid==req.body.targetid){
    questions.findOne({"parentqid":req.body.questionid,"q_order":1}).then(function(getquestions){
        res.json(getquestions);
   }).catch(function(error){
       res.json([]);
   });
}else{
    questions.findOne({"_id":req.body.questionid}).then(function(getquestions){
        res.json(getquestions);
   }).catch(function(error){
       res.json([]);
   });
}
}
exports.getAllQuestions = function(req,res){
    const questions= db.get('questions');
    const question_views= db.get('question_views');
    const question_answers= db.get('question_answers');
    let searchContent = req.body.search.trim()
    let skip
    if(req.body.skip){
        skip = req.body.skip
    }else{
        skip = 0
    }

    if(req.body.q_type==null){
        if (req.body.category.length > 0){
            let tagsArray = req.body.category
            questions.aggregate([
                { "$match":{'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14','5d15fea98edfed6c417592d15','5d15fea98edfed6c417592d16'] }, 'q_subject': new RegExp(searchContent, 'i')}},

                {"$match": {$or: [{"category" : { $in : tagsArray } }, {"tags" : { $in : tagsArray } }]}},
                { "$sort": {"_id": -1}},
                { $skip : skip },
                { $limit : 11 },
                { "$addFields": { "newquesid": { "$toString": "$_id" }}},
                {$lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
                {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
                {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
                { "$project": {
                    "createdbyuser.password": 0,
                    "updatedbyuser.password": 0

                   }
                }

              ])
              .then(function(questions){
                  var counter = -1;
                  asyncLoop(questions, function (question, next)
                  {
                      counter++;
                      questions[counter]['answercount']=[];
                      questions[counter]['visitcount']=[];
                      if(question.postsdata.length>0)
                      {
                        if(question.postsdata[0].deleted==false  && question.publish_date>Date.now())
                        {
                          questions[counter]['publish']=1;
                        }
                      }
                      if(question.publish==1 && question.publish_date>Date.now()){
                          questions[counter]['q_status']='Scheduled';
                      }else if(question.publish==1){
                          questions[counter]['q_status']='Published';
                      }else{
                          questions[counter]['q_status']='Draft';
                      }

                      var qid=question._id.toString();
                      question_answers.find({'questionid' : qid}).then(function(findanswer){
                          questions[counter]['answercount']=findanswer;
                          question_views.find({'questionid' : qid}).then(function(findviews){
                              questions[counter]['visitcount']=findviews;
                       next();
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
                          res.json(questions);
                      });
      }).catch(function(error){
          res.json([]);
      });
        }else{
                questions.aggregate([
                    { "$match":{'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14','5d15fea98edfed6c417592d15','5d15fea98edfed6c417592d16'] }, 'q_subject': new RegExp(searchContent, 'i')}},
                    { "$sort": {"_id": -1}},
                    { $skip : skip },
                    { $limit : 11 },
                    { "$addFields": { "newquesid": { "$toString": "$_id" }}},
                    {$lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
                    {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
                    {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
                    { "$project": {
                        "createdbyuser.password": 0,
                        "updatedbyuser.password": 0

                       }
                    },

                ])
                .then(function(questions){
                    var counter = -1;
                    asyncLoop(questions, function (question, next)
                    {
                        counter++;
                        questions[counter]['answercount']=[];
                        questions[counter]['visitcount']=[];
                        if(question.postsdata.length>0)
                        {
                            if(question.postsdata[0].deleted==false  && question.publish_date>Date.now())
                            {
                            questions[counter]['publish']=1;
                            }
                        }
                        if(question.publish==1 && question.publish_date>Date.now()){
                            questions[counter]['q_status']='Scheduled';
                        }else if(question.publish==1){
                            questions[counter]['q_status']='Published';
                        }else{
                            questions[counter]['q_status']='Draft';
                        }

                        var qid=question._id.toString();
                        question_answers.find({'questionid' : qid}).then(function(findanswer){
                            questions[counter]['answercount']=findanswer;
                            question_views.find({'questionid' : qid}).then(function(findviews){
                                questions[counter]['visitcount']=findviews;
                        next();
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
                            res.json(questions);
                        });
            }).catch(function(error){
                res.json([]);
            });
        }
    }else{
       if (req.body.category.length > 0){
        let tagsArray = req.body.category
        questions.aggregate([
            { "$match":{'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14','5d15fea98edfed6c417592d15','5d15fea98edfed6c417592d16']}, 'questiontype':req.body.q_type, 'q_subject': new RegExp(searchContent, 'i')}},
            {"$match": {$or: [{"category" : { $in : tagsArray } }, {"tags" : { $in : tagsArray } }]}},
            { "$addFields": { "newquesid": { "$toString": "$_id" }}},
            { "$sort": {"_id": -1}},
            { $skip : skip },
            { $limit : 11 },
            {$lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
            {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
            {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
            { "$project": {
                "createdbyuser.password": 0,
                "updatedbyuser.password": 0

               }
            },
          ])
          .then(function(questions){
              var counter = -1;
              asyncLoop(questions, function (question, next)
              {
                  counter++;
                  questions[counter]['answercount']=[];
                  questions[counter]['visitcount']=[];
                  if(question.postsdata.length>0)
                  {
                    if(question.postsdata[0].deleted==false)
                    {
                      questions[counter]['publish']=1;
                    }
                  }
                  if(question.publish==1 && question.publish_date>Date.now()){
                      questions[counter]['q_status']='Scheduled';
                  }else if(question.publish==1){
                      questions[counter]['q_status']='Published';
                  }else{
                      questions[counter]['q_status']='Draft';
                  }
                  var qid=question._id.toString();
                  question_answers.find({'questionid' : qid}).then(function(findanswer){
                      questions[counter]['answercount']=findanswer;
                      question_views.find({'questionid' : qid}).then(function(findviews){
                          questions[counter]['visitcount']=findviews;
                   next();
              })
              .catch(function(error){
               next();
              });
          })
          .catch(function(error){
              next();
          });

          }, function (err){
              if (err){
                  console.error('Inner Error: ' + err.message);
              }
                  res.json(questions);
              });
          })
          .catch(function(error){
              res.json([]);
          });
       }else {
        questions.aggregate([
            { "$match":{'questiontype': { $nin: ['5d15fea98edfed6c417592d9','5d15fea98edfed6c417592d14','5d15fea98edfed6c417592d15','5d15fea98edfed6c417592d16']}, 'questiontype':req.body.q_type, 'q_subject': new RegExp(searchContent, 'i')}},
            { "$addFields": { "newquesid": { "$toString": "$_id" }}},
            { $skip : skip },
            { $limit : 11 },
            { "$sort": {"_id": -1}},
            {$lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
            {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
            {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
            { "$project": {
                "createdbyuser.password": 0,
                "updatedbyuser.password": 0

               }
            },
          ])
          .then(function(questions){
              var counter = -1;
              asyncLoop(questions, function (question, next)
              {
                  counter++;
                  questions[counter]['answercount']=[];
                  questions[counter]['visitcount']=[];
                  if(question.postsdata.length>0)
                  {
                    if(question.postsdata[0].deleted==false)
                    {
                      questions[counter]['publish']=1;
                    }
                  }
                  if(question.publish==1 && question.publish_date>Date.now()){
                      questions[counter]['q_status']='Scheduled';
                  }else if(question.publish==1){
                      questions[counter]['q_status']='Published';
                  }else{
                      questions[counter]['q_status']='Draft';
                  }
                  var qid=question._id.toString();
                  question_answers.find({'questionid' : qid}).then(function(findanswer){
                      questions[counter]['answercount']=findanswer;
                      question_views.find({'questionid' : qid}).then(function(findviews){
                          questions[counter]['visitcount']=findviews;
                   next();
              })
              .catch(function(error){
               next();
              });
          })
          .catch(function(error){
              next();
          });

          }, function (err){
              if (err){
                  console.error('Inner Error: ' + err.message);
              }
                  res.json(questions);
              });
          })
          .catch(function(error){
              res.json([]);
          });
       }
    }
}

exports.getAnswersofquestion = function(req,res){
    const question_answers= db.get('question_answers');
    const question_options= db.get('question_options');
    const questions= db.get('questions');
    question_answers.aggregate([
        { "$match":{'questionid': req.body.questionid}},
        {"$sort": {"_id": 1}},
          {
              $lookup:
                  {
                      from: "users",
                      localField: "answerby",
                      foreignField: "unique_id",
                      as: "submitbyuser"
                  }
          },
          { "$unwind": "$submitbyuser" },
                  { "$project": {
                      "created_at":1,
                      "_id":1,
                      "answerid":1,
                      "questionid":1,
                      "submitbyuser.unique_id":1,
                      "submitbyuser.firstname":1,
                      "submitbyuser.lastname":1,
                      "submitbyuser.profile":1

                  }
          }
          ]).then(function(question_answerdatas){
            var counter = -1;
            var question_answerfinal=[]
            asyncLoop(question_answerdatas, function (question_answerdata, next)
            {
                //console.log('loop');
                counter++;
                question_answerdatas[counter]['questiondata']=[];
                question_answerdatas[counter]['optioncount']=0;
                question_answerdatas[counter]['rightanswer']=0;
                questions.findOne({'_id' : question_answerdata.questionid,'questiontype': { $ne: '5d15fea98edfed6c417592d9' }}).then(function(questiondata){
                   if(questiondata!==null){
                    //console.log('loop question ');
                    question_answerdatas[counter]['questiondata']=questiondata;
                    //question_answerfinal.push(question_answerdatas[counter]);
                    question_options.find({'questionid' : question_answerdata.questionid,$or:[{'answervalue':true},{'answervalue':'true'}]}).then(function(optiondata){
                         question_answerdatas[counter]['optioncount']=optiondata.length;
                         //console.log('loop options');
                       // question_answerfinal.push(question_answerdatas[counter]);
                          var answerids=question_answerdata.answerid.split(',');
                          //console.log(answerids);
                        question_options.find({'_id': { $in: answerids },'questionid' : question_answerdata.questionid,$or:[{'answervalue':true},{'answervalue':'true'}]}).then(function(rightoptiondata){
                            question_answerdatas[counter]['rightanswer']=rightoptiondata.length;
                           question_answerfinal.push(question_answerdatas[counter]);
                           //console.log('loop right option');
                    next();
               }).catch(function(error){
             next();
               });
            }).catch(function(error){
          next();
            });
        }else{
            next();
        }
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

}).catch(function(error){
    res.json([]);
});
}

exports.getKFPAnswersofquestion = function(req,res){
    //console.log(res);
    const kfpquestion_answers= db.get('question_answers');
    const post_comments= db.get('comments');
    const postsdata= db.get('posts');
    const kfpquestions= db.get('questions');

    kfpquestions.find({'_id' : req.body.questionid}).then(function(questiondatas){
        var counter = -1;
        var question_answerfinal=[]
        asyncLoop(questiondatas, function (question_answerdata, next)
        {
            counter++;
            questiondatas[counter]['questiondata']=[];
            questiondatas[counter]['optioncount']=0;
            questiondatas[counter]['rightanswer']=0;
            questiondatas[counter]['commentcount']=0;

            kfpquestion_answers.aggregate([
                {"$match": {"questionid": question_answerdata._id.toString()}},
                {"$sort": {"_id": 1}},
                  {
                      $lookup:
                          {
                              from: "users",
                              localField: "answerby",
                              foreignField: "unique_id",
                              as: "submitbyuser"
                          }
                  },
                  { "$unwind": "$submitbyuser" },
                          { "$project": {
                              "created_at":1,
                              "_id":1,
                              "answerid":1,
                              "answertext":1,
                              "pquestionid":1,
                              "submitbyuser.unique_id":1,
                              "submitbyuser.firstname":1,
                              "submitbyuser.lastname":1,
                              "submitbyuser.profile":1

                          }
                  }
                  ]).then(function(kfpanswers){
                //   res.json(kfpanswers);
                questiondatas[counter]['questiondata']=kfpanswers

                  postsdata.findOne({'questionid' : req.body.questionid}).then(function(questionpost){
                    var postid= questionpost.unique_id;
                       post_comments.find({'postid' :postid}).then(function(commentcount){
                           questiondatas[counter]['commentcount']=commentcount.length;
                           next()
                       }).catch(function(error){
                        next()
                       });

                   })

        })


        },
        function (err){
            if (err){
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(questiondatas);
        });
    }).catch(function(error){
        res.json([]);
    });

}
//*******************************************************************************************

exports.getImgweekAnswersofquestion = function(req,res)
{
    //console.log(res);
    const imgquestion_answers= db.get('question_answers');
    const post_comments= db.get('comments');
    const postsdata= db.get('posts');
    const imgquestions= db.get('questions');

    imgquestions.find({'_id' : req.body.questionid}).then(function(questiondatas){
        var counter = -1;
        var question_answerfinal=[]
        asyncLoop(questiondatas, function (question_answerdata, next)
        {
            counter++;
            questiondatas[counter]['questiondata']=[];
            questiondatas[counter]['optioncount']=0;
            questiondatas[counter]['rightanswer']=0;
            questiondatas[counter]['commentcount']=0;

            imgquestion_answers.aggregate([
                {"$match": {"questionid": question_answerdata._id.toString()}},
                {"$sort": {"_id": 1}},
                  {
                      $lookup:
                          {
                              from: "users",
                              localField: "answerby",
                              foreignField: "unique_id",
                              as: "submitbyuser"
                          }
                  },
                  { "$unwind": "$submitbyuser" },
                          { "$project": {
                              "created_at":1,
                              "_id":1,
                              "answerid":1,
                              "answertext":1,
                              "pquestionid":1,
                              "submitbyuser.unique_id":1,
                              "submitbyuser.firstname":1,
                              "submitbyuser.lastname":1,
                              "submitbyuser.profile":1

                          }
                  }
                  ]).then(function(kfpanswers){
                //   res.json(kfpanswers);
                questiondatas[counter]['questiondata']=kfpanswers

                  postsdata.findOne({'questionid' : req.body.questionid}).then(function(questionpost){
                    var postid= questionpost.unique_id;
                       post_comments.find({'postid' :postid}).then(function(commentcount){
                           questiondatas[counter]['commentcount']=commentcount.length;
                           next()
                       }).catch(function(error){
                        next()
                       });

                   })

        })


        },
        function (err){
            if (err){
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(questiondatas);
        });
    }).catch(function(error){
        res.json([]);
    });

}
//*******************************************************************************************

exports.getCaseAnswersofQuestion = function(req,res){
    const casequestion_answers= db.get('question_answers');
    const post_comments= db.get('comments');
    const postsdata= db.get('posts');
    const casequestions= db.get('questions');

    casequestions.find({'_id' : req.body.questionid}).then(function(questiondatas){
        var counter = -1;
        var question_answerfinal=[]
        asyncLoop(questiondatas, function (question_answerdata, next)
        {
            counter++;
            questiondatas[counter]['questiondata']=[];
            questiondatas[counter]['optioncount']=0;
            questiondatas[counter]['rightanswer']=0;
            questiondatas[counter]['commentcount']=0;

            casequestion_answers.aggregate([
                {"$match": {"questionid": question_answerdata._id.toString()}},
                {"$sort": {"_id": 1}},
                  {
                      $lookup:
                          {
                              from: "users",
                              localField: "answerby",
                              foreignField: "unique_id",
                              as: "submitbyuser"
                          }
                  },
                  { "$unwind": "$submitbyuser" },
                          { "$project": {
                              "created_at":1,
                              "_id":1,
                              "answerid":1,
                              "answertext":1,
                              "pquestionid":1,
                              "submitbyuser.unique_id":1,
                              "submitbyuser.firstname":1,
                              "submitbyuser.lastname":1,
                              "submitbyuser.profile":1

                          }
                  }
                  ]).then(function(caseanswers){
                //   res.json(kfpanswers);
                questiondatas[counter]['questiondata']=caseanswers

                  postsdata.findOne({'questionid' : req.body.questionid}).then(function(questionpost){
                    var postid= questionpost.unique_id;
                       post_comments.find({'postid' :postid}).then(function(commentcount){
                           questiondatas[counter]['commentcount']=commentcount.length;
                           next()
                       }).catch(function(error){
                        next()
                       });

                   })

        })


        },
        function (err){
            if (err){
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(questiondatas);
        });
    }).catch(function(error){
        res.json([]);
    });

}


exports.deleteMCQquestion = function(req,res){
    const questions= db.get('questions');
    const question_options= db.get('question_options');
    const question_answers= db.get('question_answers');
    const posts= db.get('posts');
    const notifications= db.get('notifications');
    questions.remove({ _id: req.body.questionid});
    question_options.remove({ questionid: req.body.questionid });
    question_answers.remove({ questionid: req.body.questionid });
    posts.remove({ questionid: req.body.questionid});
    notifications.remove({ questionid: req.body.questionid});
    res.json([{'status':200}]);
}
exports.deleteKFPquestion = function(req,res){
    const questions= db.get('questions');
    const question_options= db.get('question_options');
    const question_answers= db.get('question_answers');
    const kfpquestions= db.get('kfpquestions');
    const kfpquestion_options= db.get('kfpquestion_options');
    const kfpquestion_answers= db.get('kfpquestion_answers');
    const posts= db.get('posts');
    const notifications= db.get('notifications');
    kfpquestions.find({'parentqid': req.body.questionid}).then(function(kfpquestiondatas){
        kfpquestiondatas.forEach(function(kfpquestiondata){
            var qid=kfpquestiondata._id.toString();
             kfpquestions.remove({ _id: qid});
    kfpquestion_options.remove({ questionid: qid});
    kfpquestion_answers.remove({ pquestionid: qid });
            })

    });
    questions.remove({ _id: req.body.questionid});
    question_options.remove({ questionid: req.body.questionid });
    question_answers.remove({ questionid: req.body.questionid });
    posts.remove({ questionid: req.body.questionid});
    notifications.remove({ questionid: req.body.questionid});
    res.json([{'status':200}]);
}
//*****************************************************************************

exports.deleteImgWeekquestion = function(req,res)
{
    const questions= db.get('questions');
    const question_options= db.get('question_options');
    const question_answers= db.get('question_answers');
    const imgofweekquestions= db.get('imgofweekquestions');
    const imgofweekquestion_options= db.get('imgofweekquestion_options');
    const imgofweekquestion_answers= db.get('imgofweekquestion_answers');
    const posts= db.get('posts');
    const notifications= db.get('notifications');
    imgofweekquestions.find({'parentqid': req.body.questionid}).then(function(imgweekquestiondatas){
        imgweekquestiondatas.forEach(function(imgweekquestiondata){
            var qid=imgweekquestiondata._id.toString();
             imgofweekquestions.remove({ _id: qid});
    imgofweekquestion_options.remove({ questionid: qid});
    imgofweekquestion_answers.remove({ pquestionid: qid });
            })
    });
    questions.remove({ _id: req.body.questionid});
    question_options.remove({ questionid: req.body.questionid });
    question_answers.remove({ questionid: req.body.questionid });
    posts.remove({ questionid: req.body.questionid});
    // notifications.remove({ questionid: req.body.questionid});
    res.json([{'status':200}]);
}
//*****************************************************************************

exports.deleteSingleKFPquestion = function(req,res)
{
    const kfpquestions= db.get('kfpquestions');
    kfpquestions.remove({ _id: req.body.questionid});
    res.json([{'status':200}]);
}
exports.deleteSingleImgWeekQuestion = function(req,res)
{
    const imgofweekquestions= db.get('imgofweekquestions');
    imgofweekquestions.remove({ _id: req.body.questionid});
    res.json([{'status':200}]);
}
exports.deleteCaseQuestion = function(req,res)
{
    const questions= db.get('questions');
    const question_options= db.get('question_options');
    const question_answers= db.get('question_answers');
    const casequestions= db.get('casequestions');
    const casequestion_options= db.get('casequestion_options');
    const casequestion_answers= db.get('casequestion_answers');
    const posts= db.get('posts');
    const notifications= db.get('notifications');

    casequestions.find({'parentqid': req.body.questionid}).then(function(casequestiondatas)
    {
        casequestiondatas.forEach(function(casequestiondata)
        {
            var qid=casequestiondata._id.toString();
            casequestions.remove({ _id: qid});
            casequestion_options.remove({ questionid: qid});
            casequestion_answers.remove({ pquestionid: qid });
        })
    });
    questions.remove({ _id: req.body.questionid});
    question_options.remove({ questionid: req.body.questionid });
    question_answers.remove({ questionid: req.body.questionid });
    posts.remove({ questionid: req.body.questionid});
    notifications.remove({ questionid: req.body.questionid});
    res.json([{'status':200}]);
}
//*********************************************************************************
exports.deleteStudentQuestion = function(req,res)
{
    const questions= db.get('questions');
    const question_options= db.get('question_options');
    const question_answers= db.get('question_answers');
    const casequestions= db.get('studentquestions');
    const casequestion_options= db.get('studentquestion_options');
    const casequestion_answers= db.get('studentquestion_answers');
    const posts= db.get('posts');
    const notifications= db.get('notifications');

    casequestions.find({'parentqid': req.body.questionid}).then(function(casequestiondatas)
    {
        casequestiondatas.forEach(function(casequestiondata)
        {
            var qid=casequestiondata._id.toString();
            casequestions.remove({ _id: qid});
            casequestion_options.remove({ questionid: qid});
            casequestion_answers.remove({ pquestionid: qid });
        })
    });
    questions.remove({ _id: req.body.questionid});
    question_options.remove({ questionid: req.body.questionid });
    question_answers.remove({ questionid: req.body.questionid });
    posts.remove({ questionid: req.body.questionid});
    notifications.remove({ questionid: req.body.questionid});
    res.json([{'status':200}]);
}
//*********************************************************************************
exports.getKFPUserwiseAnswers = function(req,res){
    const question_answers= db.get('question_answers');
    const posts= db.get('posts');
    const comments= db.get('comments');
    const questions= db.get('questions');
    question_answers.find({'answerby':req.body.userid},{sort:{'_id':-1}}).then(function(question_answerdatas){
                var counter = -1;
                var question_answerfinal=[];
                asyncLoop(question_answerdatas, function (question_answerdata, next)
                {
                    counter++;
                    question_answerdatas[counter]['questiondata']=[];
                    question_answerdatas[counter]['commentcount']=0;
                    questions.findOne({'_id' : question_answerdata.questionid}).then(function(questiondata){
                        if(questiondata.questiontype=='5d15fea98edfed6c417592d9'){
                            question_answerdatas[counter]['questiondata']=questiondata;

                            posts.findOne({'questionid' : question_answerdata.questionid}).then(function(getpost){
                                if(getpost!==null){
                                    comments.find({'postid' : getpost.unique_id}).then(function(getcomments){
                                        question_answerdatas[counter]['commentcount']=getcomments.length;
                                        question_answerfinal.push(question_answerdatas[counter]);
                                 next();
                            }).catch(function(error){
                                //console.log(error);
                                question_answerfinal.push(question_answerdatas[counter]);
                          next();
                            });

                                    }else{
                                        question_answerfinal.push(question_answerdatas[counter]);
                                        next();
                                    }
                    }).catch(function(error){
                        //console.log(error);
                        question_answerfinal.push(question_answerdatas[counter]);
                  next();
                    });

                            }else{
                                next();
                            }

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
}).catch(function(error){
    res.json([]);
});
}
//*********************************************************************************
exports.getImageUserwiseAnswers = function(req,res){
    const question_answers= db.get('question_answers');
    const posts= db.get('posts');
    const comments= db.get('comments');
    const questions= db.get('questions');
    question_answers.find({'answerby':req.body.userid},{sort:{'_id':-1}}).then(function(question_answerdatas){
                var counter = -1;
                var question_answerfinal=[];
                asyncLoop(question_answerdatas, function (question_answerdata, next)
                {
                    counter++;
                    question_answerdatas[counter]['questiondata']=[];
                    question_answerdatas[counter]['commentcount']=0;
                    questions.findOne({'_id' : question_answerdata.questionid}).then(function(questiondata){
                        if(questiondata.questiontype=='5d15fea98edfed6c417592d15'){
                            question_answerdatas[counter]['questiondata']=questiondata;

                            posts.findOne({'questionid' : question_answerdata.questionid}).then(function(getpost){
                                if(getpost!==null){
                                    comments.find({'postid' : getpost.unique_id}).then(function(getcomments){
                                        question_answerdatas[counter]['commentcount']=getcomments.length;
                                        question_answerfinal.push(question_answerdatas[counter]);
                                 next();
                            }).catch(function(error){
                                //console.log(error);
                                question_answerfinal.push(question_answerdatas[counter]);
                          next();
                            });

                                    }else{
                                        question_answerfinal.push(question_answerdatas[counter]);
                                        next();
                                    }
                    }).catch(function(error){
                        //console.log(error);
                        question_answerfinal.push(question_answerdatas[counter]);
                  next();
                    });

                            }else{
                                next();
                            }

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
}).catch(function(error){
    res.json([]);
});
}
exports.getCaseUserWiseAnswers = function(req,res){
    const question_answers= db.get('question_answers');
    const questions= db.get('questions');
    const casecomment= db.get('case_comments');
    question_answers.find({'answerby':req.body.userid},{sort:{'_id':-1}}).then(function(question_answerdatas){
        var counter = -1;
        var question_answerfinal=[];
        asyncLoop(question_answerdatas, function (question_answerdata, next)
        {
            counter++;
            question_answerdatas[counter]['questiondata']=[];
            question_answerdatas[counter]['commentcount']=0;
            question_answerdatas[counter]['replycount']=0;
            questions.findOne({'_id' : question_answerdata.questionid}).then(function(questiondata){
                if(questiondata.questiontype=='5d15fea98edfed6c417592d14'){
                    question_answerdatas[counter]['questiondata']=questiondata;

                        casecomment.find({'parentqid' :question_answerdata.questionid,'parentid':null}).then(function(getcomments){
                            question_answerdatas[counter]['commentcount']=getcomments.length;

                        casecomment.find({'parentqid' :question_answerdata.questionid,'parentid':{ $ne: null }}).then(function(getreply){
                            question_answerdatas[counter]['replycount']=getreply.length;
                            question_answerfinal.push(question_answerdatas[counter]);
                            next();
                        }).catch(function(error){
                            //console.log(error);
                            question_answerfinal.push(question_answerdatas[counter]);
                            next();
                        });


                    }).catch(function(error){
                        //console.log(error);
                        question_answerfinal.push(question_answerdatas[counter]);
                        next();
                    });
                }else{
                next();
                }

    }).catch(function(error){
            next();
        });
    },
        function (err){
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
                res.json(question_answerfinal);
            });
}).catch(function(error){
    res.json([]);
});
}
exports.getSBAUserwiseAnswers = function(req,res){
    const question_answers= db.get('question_answers');
    const question_options= db.get('question_options');
    const questions= db.get('questions');
    question_answers.find({'answerby':req.body.userid},{sort:{'_id':-1}}).then(function(question_answerdatas){
                var counter = -1;
                var question_answerfinal=[]
                asyncLoop(question_answerdatas, function (question_answerdata, next)
                {
                    counter++;
                    question_answerdatas[counter]['questiondata']=[];
                    question_answerdatas[counter]['optioncount']=0;
                    question_answerdatas[counter]['rightanswer']=0;
                    questions.findOne({'_id' : question_answerdata.questionid,'questiontype': { $ne: '5d15fea98edfed6c417592d9' }}).then(function(questiondata){
                       if(questiondata!==null){
                        question_answerdatas[counter]['questiondata']=questiondata;
                        //question_answerfinal.push(question_answerdatas[counter]);
                        question_options.find({'questionid' : question_answerdata.questionid,$or:[{'answervalue':true},{'answervalue':'true'}]}).then(function(optiondata){
                             question_answerdatas[counter]['optioncount']=optiondata.length;
                           // question_answerfinal.push(question_answerdatas[counter]);
                              var answerids=question_answerdata.answerid.split(',');
                              //console.log(answerids);
                            question_options.find({'_id': { $in: answerids },'questionid' : question_answerdata.questionid,$or:[{'answervalue':true},{'answervalue':'true'}]}).then(function(rightoptiondata){
                                question_answerdatas[counter]['rightanswer']=rightoptiondata.length;
                               question_answerfinal.push(question_answerdatas[counter]);
                        next();
                   }).catch(function(error){
                 next();
                   });
                }).catch(function(error){
              next();
                });
            }else{
                next();
            }
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
}).catch(function(error){
    res.json([]);
});
}
exports.getAllKFPQuestions = function(req,res){
    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    const question_views= db.get('question_views');
    let searchContent = req.body.search.trim() || ""
    let skip
    if(req.body.skip){
        skip = req.body.skip
    }else{
        skip = 0
    }
    if(req.body.q_type==null)
    {
        questions.aggregate([
            // { "$match":{'q_subject': new RegExp(searchContent, 'i') }},
            {"$match":{$or: [{'q_subject': new RegExp(searchContent, 'i')}, {'q_subject': null}] }},

            { "$sort": {"_id": -1}},
            { $skip : skip },
            { $limit : 11 },
          { "$addFields": { "newquesid": { "$toString": "$_id" }}},
          {
            $lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
            {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
            {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
            { "$project": {
                "createdbyuser.password": 0,
                "updatedbyuser.password": 0

               }
            },
        ]).then(function(questions)

        {
            console.log("searchContent", questions)
            var counter = -1;
            asyncLoop(questions, function (question, next)
            {
                counter++;
                // questions[counter]['publish_status']=0;
                questions[counter]['answercount']=0;
                questions[counter]['visitcount']=0;
                if(question.postsdata.length>0)
                {
                  if(question.postsdata[0].deleted==false)
                  {
                    questions[counter]['publish']=1;
                  }
                }
                if(question.publish_date>Date.now()){
                    questions[counter]['q_status']='Scheduled';
                    questions[counter]['publish']=0;
                }else if(question.publish==1){
                    questions[counter]['q_status']='Published';
                }else{
                    questions[counter]['q_status']='Draft';
                }
                var qid=question._id.toString();
                question_answers.find({'questionid' : qid}).then(function(findanswer){
                    questions[counter]['answercount']=findanswer.length;
                    question_views.find({'questionid' : qid}).then(function(findviews){
                        questions[counter]['visitcount']=findviews.length;
                 next();
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
                        res.json([]);
                    }
                    res.json(questions);
                });
}).catch(function(error){
    res.json([]);
});
    }else{
        if (req.body.category.length == 0){

            questions.aggregate([
                // {"$match":{'questiontype' : req.body.q_type, 'q_subject': new RegExp(searchContent, 'i')}},
                {"$match":{'questiontype' : req.body.q_type, $or: [{'q_subject': new RegExp(searchContent, 'i')}, {'q_subject': null}] }},

                { "$sort": {"_id": -1}},
                { $skip : skip },
                { $limit : 11 },
                { "$addFields": { "newquesid": { "$toString": "$_id" }}},
                {
                $lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
                {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
                {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
                { "$project": {
                    "createdbyuser.password": 0,
                    "updatedbyuser.password": 0

                   }
                },
            ]).then(function(questions)
            {
        // console.log("searchContent", questions)

                var counter = -1;
                asyncLoop(questions, function (question, next)
                {
                    counter++;
                    // questions[counter]['publish_status']=0;
                    questions[counter]['answercount']=[];
                    questions[counter]['visitcount']=[];
                    if(question.postsdata.length>0)
                    {
                        if(question.postsdata[0].deleted==false)
                        {
                        questions[counter]['publish']=1;
                        }
                    }
                    if(question.publish_date>Date.now()){
                        questions[counter]['q_status']='Scheduled';
                        questions[counter]['publish']=0;
                    }else if(question.publish==1){
                        questions[counter]['q_status']='Published';
                    }else{
                        questions[counter]['q_status']='Draft';
                    }
                    var qid=question._id.toString();
                    question_answers.find({'questionid' : qid}).then(function(findanswer){
                        questions[counter]['answercount']=findanswer;
                        question_views.find({'questionid' : qid}).then(function(findviews){
                            questions[counter]['visitcount']=findviews;
                    next();
                }).catch(function(error){
                    next();
                });
                }).catch(function(error){
                next();
                });
                }, function (err){
                    if (err)
                    {
                        console.error('Inner Error: ' + err.message);
                        // return;
                    }
                    res.json(questions);
                });
            }).catch(function(error){
                res.json([]);
            });
        } else if (req.body.category.length > 0){
        console.log("searchContent", searchContent)

            let tagsArray = req.body.category
            questions.aggregate([
                // {"$match":{'questiontype' : req.body.q_type, 'q_subject': new RegExp(searchContent, 'i')  }},
                {"$match":{'questiontype' : req.body.q_type, $or: [{'q_subject': new RegExp(searchContent, 'i')}, {'q_subject': null}] }},

                { "$sort": {"_id": -1}},
                { $skip : skip },
                { $limit : 11 },
                {"$match": {$or: [{"category" : { $in : tagsArray } }, {"tags" : { $in : tagsArray } }]}},
                { "$addFields": { "newquesid": { "$toString": "$_id" }}},
                {
                  $lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
                  {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
                  {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
                  { "$project": {
                    "createdbyuser.password": 0,
                    "updatedbyuser.password": 0

                   }
                },
              ]).then(function(questions)
              {
                  var counter = -1;
                  asyncLoop(questions, function (question, next)
                  {
                      counter++;
                      // questions[counter]['publish_status']=0;
                      questions[counter]['answercount']=[];
                      questions[counter]['visitcount']=[];
                      if(question.postsdata.length>0)
                      {
                        if(question.postsdata[0].deleted==false)
                        {
                          questions[counter]['publish']=1;
                        }
                      }
                      if(question.publish_date>Date.now()){
                          questions[counter]['q_status']='Scheduled';
                          questions[counter]['publish']=0;
                      }else if(question.publish==1){
                          questions[counter]['q_status']='Published';
                      }else{
                          questions[counter]['q_status']='Draft';
                      }
                      var qid=question._id.toString();
                      question_answers.find({'questionid' : qid}).then(function(findanswer){
                          questions[counter]['answercount']=findanswer;
                          question_views.find({'questionid' : qid}).then(function(findviews){
                              questions[counter]['visitcount']=findviews;
                       next();
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
                          res.json(questions);
                      });
            }).catch(function(error){
                res.json([]);
            });
        }

    }
}


exports.getMyUserQuestions = function(req,res){
    const questions= db.get('questions');
    const question_answers= db.get('question_answers');
    const question_views= db.get('question_views');
    if(req.body.q_type==null)
    {
        res.json([]);
    }else{
        // questions.find({'questiontype':req.body.q_type},{sort:{'_id':-1}})
        questions.aggregate([
          {"$match":{'questiontype' : req.body.q_type,'createdby':req.body.loggedinuser}},
          { "$addFields": { "newquesid": { "$toString": "$_id" }}},
          {
            $lookup:{ from: "posts", localField: "newquesid", foreignField: "questionid", as: "postsdata" }},
            {$lookup:{ from: "users", localField: "createdby", foreignField: "unique_id", as: "createdbyuser" }},
            {$lookup:{ from: "users", localField: "updatedby", foreignField: "unique_id", as: "updatedbyuser" }},
            { "$project": {
                "createdbyuser.password": 0,
                "updatedbyuser.password": 0

               }
            },
        ]).then(function(questions)
        {
            var counter = -1;
            asyncLoop(questions, function (question, next)
            {
                counter++;
                // questions[counter]['publish_status']=0;
                questions[counter]['answercount']=[];
                questions[counter]['visitcount']=[];
                if(question.postsdata.length>0)
                {
                  if(question.postsdata[0].deleted==false)
                  {
                    questions[counter]['publish']=1;
                  }
                }
                if(question.publish_date>Date.now()){
                    questions[counter]['q_status']='Scheduled';
                    questions[counter]['publish']=0;
                }else if(question.publish==1){
                    questions[counter]['q_status']='Published';
                }else{
                    questions[counter]['q_status']='Draft';
                }
                var qid=question._id.toString();
                question_answers.find({'questionid' : qid}).then(function(findanswer){
                    questions[counter]['answercount']=findanswer;
                    question_views.find({'questionid' : qid}).then(function(findviews){
                        questions[counter]['visitcount']=findviews;
                 next();
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
                    res.json(questions);
                });
}).catch(function(error){
    res.json([]);
});
    }
}
exports.getQuestionbyId = function(req,res){
    const questions= db.get('questions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const question_options= db.get('question_options');
        questions.find({'_id':req.body.questionid}).then(function(findquestions){
            var counter = -1;
            asyncLoop(findquestions, function (question, next)
            {
                counter++;
                findquestions[counter]['tagdata']=[];
                findquestions[counter]['domaindata']=[];
                findquestions[counter]['categorydata']=[];
                findquestions[counter]['age_rangedata']=[];
                findquestions[counter]['genderdata']=[];
                findquestions[counter]['question_options']=[];
                findquestions[counter]['questionimagevalidation']={'image_permission':null,'image_source':null};
                findquestions[counter]['stemimagevalidation']={'image_permission':null,'image_source':null};

                var taguniqs = question.tags.split(",");

                    categories.aggregate([
                        {$match:{unique_id : { $in : taguniqs } }},
                        { "$project": {
                                         "_id":1,
                                         "tagname":"$categoryname",
                                         "available":1,
                                         "studyplan":1,
                                         "resources":1,
                                         "created_by":1,
                                         "created_at":1,
                                         "unique_id":1
                                        }
                            }
                    ]).then(function(getCategories)
                    {
                        tags.find({ unique_id : { $in : taguniqs } }).then(function(getTags)
                        {
                            var alltags=getCategories.concat(getTags);
                            if(alltags != undefined && alltags.length > 0)
                            {
                                findquestions[counter]['tagdata']=alltags;
                            }
                      /// next();
                      }).catch(function(error){
                        //  next();
                      });
                    });
                    //findquestions[counter]['tagdata']=findtags;
                    var domainuniqs = question.domain.split(",");
                    tags.find({'unique_id' : { $in : domainuniqs }}).then(function(finddomain){
                        findquestions[counter]['domaindata']=finddomain;
                            var categoryuniqs = question.category.split(",");
                            tags.find({'unique_id' : { $in : categoryuniqs }}).then(function(findcategory){
                                findquestions[counter]['categorydata']=findcategory;
                                    var age_rangeuniqs = question.age_range.split(",");
                                    tags.find({'unique_id' : { $in : age_rangeuniqs }}).then(function(findage_range){
                                        findquestions[counter]['age_rangedata']=findage_range;
                var genderuniqs = question.gender.split(",");
                tags.find({'unique_id' : { $in : genderuniqs }}).then(function(findgender){
                    findquestions[counter]['genderdata']=findgender;
                        var qid=question._id.toString();
                    question_options.find({'questionid' : qid}).then(function(findquestion_options){
                        findquestions[counter]['question_options']=findquestion_options;
                 next();
            }).catch(function(error){
          next();
            });
        }).catch(function(error){

        });

                            }).catch(function(error){

                            });

                    }).catch(function(error){

                    });

            }).catch(function(error){
            });



                    }, function (err)
                    {
                        if (err)
                        {
                            console.error('Inner Error: ' + err.message);
                            // return;
                        }
                        res.json(findquestions);
                    });
}).catch(function(error){
    res.json([]);
});

}
exports.getKFPQuestionbyId = function(req,res){
    const questions= db.get('kfpquestions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const question_options= db.get('kfpquestion_options');
        questions.find({'parentqid':req.body.questionid},{sort:{'q_order':1}}).then(function(findquestions){
            var counter = -1;
            asyncLoop(findquestions, function (question, next)
            {
                counter++;
                findquestions[counter]['tagdata']=[];
                findquestions[counter]['domaindata']=[];
                findquestions[counter]['categorydata']=[];
                findquestions[counter]['age_rangedata']=[];
                findquestions[counter]['genderdata']=[];
                findquestions[counter]['kfpquestion_options']=[];
                findquestions[counter]['questionimagevalidation']={'image_permission':null,'image_source':null};
                findquestions[counter]['stemimagevalidation']={'image_permission':null,'image_source':null};

                var taguniqs = question.tags.split(",");
                categories.aggregate([
                    {$match:{unique_id : { $in : taguniqs } }},
                    { "$project": {
                                     "_id":1,
                                     "tagname":"$categoryname",
                                     "available":1,
                                     "studyplan":1,
                                     "resources":1,
                                     "created_by":1,
                                     "created_at":1,
                                     "unique_id":1
                                    }
                        }
                ]).then(function(getCategories)
                {
                    tags.find({ unique_id : { $in : taguniqs } }).then(function(getTags)
                    {
                        var alltags=getCategories.concat(getTags);
                        if(alltags != undefined && alltags.length > 0)
                        {
                            findquestions[counter]['tagdata']=alltags;
                        }
                  /// next();
                  }).catch(function(error){
                    //  next();
                  });
                });
                    var domainuniqs = question.domain.split(",");
                    tags.find({'unique_id' : { $in : domainuniqs }}).then(function(finddomain){
                        findquestions[counter]['domaindata']=finddomain;
                            var categoryuniqs = question.category.split(",");
                            tags.find({'unique_id' : { $in : categoryuniqs }}).then(function(findcategory){
                                findquestions[counter]['categorydata']=findcategory;
                                    var age_rangeuniqs = question.age_range.split(",");
                                    tags.find({'unique_id' : { $in : age_rangeuniqs }}).then(function(findage_range){
                                        findquestions[counter]['age_rangedata']=findage_range;
                var genderuniqs = question.gender.split(",");
                tags.find({'unique_id' : { $in : genderuniqs }}).then(function(findgender){
                    findquestions[counter]['genderdata']=findgender;
                        var qid=question._id.toString();
                    question_options.find({'questionid' : qid}).then(function(findquestion_options){
                        findquestions[counter]['kfpquestion_options']=findquestion_options;
                 next();
            }).catch(function(error){
          next();
            });
        }).catch(function(error){

        });

                            }).catch(function(error){

                            });

                    }).catch(function(error){

                    });

            }).catch(function(error){
            });



                    }, function (err)
                    {
                        if (err)
                        {
                            console.error('Inner Error: ' + err.message);
                            // return;
                        }
                        res.json(findquestions);
                    });
}).catch(function(error){
    res.json([]);
});

}
exports.getQuestionByIdStatus = function(req,res)
{
    const questions= db.get('questions');
    var quesid=req.body.questionid;
  questions.findOne({'_id':ObjectId(quesid),  }).then(function(getquesstatus)
  {
    res.json(getquesstatus);
  }).catch(function(error){
      res.send([]);
    });
}
exports.getKfpQuestionByIdStatus = function(req,res)
{
    const questions= db.get('questions');
    var quesid=req.body.questionid;
  questions.findOne({'_id':ObjectId(quesid),  }).then(function(getkfpquesstatus)
  {
    res.json(getkfpquesstatus);
  }).catch(function(error){
      res.send([]);
    });
}
exports.getCaseQuestionByIdStatus = function(req,res)
{
    const questions= db.get('questions');
    var quesid=req.body.questionid;
  questions.findOne({'_id':ObjectId(quesid),  }).then(function(getcasequesstatus)
  {
    res.json(getcasequesstatus);
  }).catch(function(error){
      res.send([]);
    });
}

exports.getCASEQuestionbyId = function(req,res){
    const questions= db.get('casequestions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const question_options= db.get('casequestion_options');
        questions.find({'parentqid':req.body.questionid},{sort:{'q_order':1}}).then(function(findquestions){
            var counter = -1;
            asyncLoop(findquestions, function (question, next)
            {
                counter++;
                findquestions[counter]['tagdata']=[];
                findquestions[counter]['domaindata']=[];
                findquestions[counter]['categorydata']=[];
                findquestions[counter]['age_rangedata']=[];
                findquestions[counter]['genderdata']=[];
                findquestions[counter]['casequestion_options']=[];
                findquestions[counter]['questionimagevalidation']={'image_permission':null,'image_source':null};
                findquestions[counter]['stemimagevalidation']={'image_permission':null,'image_source':null};

                var taguniqs = question.tags.split(",");
                categories.aggregate([
                    {$match:{unique_id : { $in : taguniqs } }},
                    { "$project": {
                                     "_id":1,
                                     "tagname":"$categoryname",
                                     "available":1,
                                     "studyplan":1,
                                     "resources":1,
                                     "created_by":1,
                                     "created_at":1,
                                     "unique_id":1
                                    }
                        }
                ]).then(function(getCategories)
                {
                    tags.find({ unique_id : { $in : taguniqs } }).then(function(getTags)
                    {
                        var alltags=getCategories.concat(getTags);
                        if(alltags != undefined && alltags.length > 0)
                        {
                            findquestions[counter]['tagdata']=alltags;
                        }
                  /// next();
                  }).catch(function(error){
                    //  next();
                  });
                });
                    var domainuniqs = question.domain.split(",");
                    tags.find({'unique_id' : { $in : domainuniqs }}).then(function(finddomain){
                        findquestions[counter]['domaindata']=finddomain;
                            var categoryuniqs = question.category.split(",");
                            tags.find({'unique_id' : { $in : categoryuniqs }}).then(function(findcategory){
                                findquestions[counter]['categorydata']=findcategory;
                                    var age_rangeuniqs = question.age_range.split(",");
                                    tags.find({'unique_id' : { $in : age_rangeuniqs }}).then(function(findage_range){
                                        findquestions[counter]['age_rangedata']=findage_range;
                var genderuniqs = question.gender.split(",");
                tags.find({'unique_id' : { $in : genderuniqs }}).then(function(findgender){
                    findquestions[counter]['genderdata']=findgender;
                        var qid=question._id.toString();
                    question_options.find({'questionid' : qid}).then(function(findquestion_options){
                        findquestions[counter]['casequestion_options']=findquestion_options;
                 next();
            }).catch(function(error){
          next();
            });
        }).catch(function(error){

        });

                            }).catch(function(error){

                            });

                    }).catch(function(error){

                    });

            }).catch(function(error){
            });



                    }, function (err)
                    {
                        if (err)
                        {
                            console.error('Inner Error: ' + err.message);
                            // return;
                        }
                        res.json(findquestions);
                    });
}).catch(function(error){
    res.json([]);
});

}
//****************************************************************************************************
exports.getStudentQuestionbyId = function(req,res)
{
    const studentquestions= db.get('studentquestions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const studentquestion_options= db.get('studentquestion_options');
    studentquestions.find({'parentqid':req.body.questionid},{sort:{'q_order':1}}).then(function(findquestions)
    {
      var counter = -1;
      asyncLoop(findquestions, function (question, next)
      {
          counter++;
          findquestions[counter]['tagdata']=[];
          findquestions[counter]['domaindata']=[];
          findquestions[counter]['categorydata']=[];
          findquestions[counter]['age_rangedata']=[];
          findquestions[counter]['genderdata']=[];
          findquestions[counter]['studentquestion_options']=[];
          findquestions[counter]['questionimagevalidation']={'image_permission':null,'image_source':null};
          findquestions[counter]['stemimagevalidation']={'image_permission':null,'image_source':null};
          var taguniqs = question.tags.split(",");
          categories.aggregate([
            {$match:{unique_id : { $in : taguniqs } }},
            { "$project": {
                                     "_id":1,
                                     "tagname":"$categoryname",
                                     "available":1,
                                     "studyplan":1,
                                     "resources":1,
                                     "created_by":1,
                                     "created_at":1,
                                     "unique_id":1
                                    }
                        }
          ]).then(function(getCategories)
          {
              tags.find({ unique_id : { $in : taguniqs } }).then(function(getTags)
              {
                  var alltags=getCategories.concat(getTags);
                  if(alltags != undefined && alltags.length > 0)
                  {
                    findquestions[counter]['tagdata']=alltags;
                  }
                  /// next();
                  }).catch(function(error){
                    //  next();
                  });
          });
          var domainuniqs = question.domain.split(",");
          tags.find({'unique_id' : { $in : domainuniqs }}).then(function(finddomain)
          {
              findquestions[counter]['domaindata']=finddomain;
              var categoryuniqs = question.category.split(",");
              tags.find({'unique_id' : { $in : categoryuniqs }}).then(function(findcategory)
              {
                  findquestions[counter]['categorydata']=findcategory;
                  var age_rangeuniqs = question.age_range.split(",");
                  tags.find({'unique_id' : { $in : age_rangeuniqs }}).then(function(findage_range)
                  {
                      findquestions[counter]['age_rangedata']=findage_range;
                      var genderuniqs = question.gender.split(",");
                      tags.find({'unique_id' : { $in : genderuniqs }}).then(function(findgender)
                      {
                        findquestions[counter]['genderdata']=findgender;
                        var qid=question._id.toString();
                        studentquestion_options.find({'questionid' : qid}).then(function(findquestion_options)
                        {
                          findquestions[counter]['studentquestion_options']=findquestion_options;
                          next();
                        }).catch(function(error){
                            next();
                          });
                      }).catch(function(error){ });
                  }).catch(function(error){ });
              }).catch(function(error){  });
          }).catch(function(error){ });
      }, function (err)
      {
          if (err)
          {
              console.error('Inner Error: ' + err.message);
          }
          res.json(findquestions);
      });
    }).catch(function(error){
        res.json([]);
      });
}
//****************************************************************************************************
exports.getQuestionforanswer = function(req,res){
    const questions= db.get('kfpquestions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const question_options= db.get('kfpquestion_options');
    const kfpquestion_answers= db.get('kfpquestion_answers');
    const kfpdummy_answers= db.get('kfpdummy_answers');
        questions.find({'parentqid':req.body.questionid},{sort:{'q_order':1}}).then(function(findquestions){
            var counter = -1;
            var answerflag=0;
            asyncLoop(findquestions, function (question, next)
            {
                counter++;
                findquestions[counter]['tagdata']=[];
                findquestions[counter]['answertext']='Please type your answer';
                findquestions[counter]['answerid']=[];
                findquestions[counter]['answered']=false;
                findquestions[counter]['answerflag']=answerflag;
                findquestions[counter]['answerplaceholder']='Please type your answer';
                findquestions[counter]['error']=null;
                findquestions[counter]['question_options']=[];



           if(question._id!==null){
            var taguniqs = question.tags.split(",");
            categories.aggregate([
                {$match:{unique_id : { $in : taguniqs } ,'questionvisible':true}},
                { "$project": {
                                 "_id":1,
                                 "tagname":"$categoryname",
                                 "available":1,
                                 "studyplan":1,
                                 "resources":1,
                                 "created_by":1,
                                 "created_at":1,
                                 "unique_id":1
                                }
                    }
            ]).then(function(getCategories)
            {
                tags.find({ unique_id : { $in : taguniqs } ,'questionvisible':true}).then(function(getTags)
                {
                    var alltags=getCategories.concat(getTags);
                    if(alltags != undefined && alltags.length > 0)
                    {
                        findquestions[counter]['tagdata']=alltags;
                    }
              /// next();
              }).catch(function(error){
                //  next();
              });
            });
                var qid=question._id.toString();
                //console.log('out question option');
            question_options.find({'questionid' : qid}).then(function(findquestion_options){
                findquestions[counter]['question_options']=findquestion_options;
                //console.log('in question option');
              kfpquestion_answers.findOne({'pquestionid' : qid,'answerby':req.body.loggedinuser}).then(function(findanswer){
                   if(findanswer!==null){
                findquestions[counter]['answertext']=findanswer.answertext;
                                findquestions[counter]['answerid']=findanswer.answerid;
                                //console.log('in question answers');

                         findquestions[counter]['answered']=true;
                         next();
                                }else{
                                kfpdummy_answers.findOne({'questionid' : qid,'userid':req.body.loggedinuser}).then(function(finddummyanswer){
                                    if(finddummyanswer!==null){
                                    findquestions[counter]['answertext']=finddummyanswer.answertext;
                                    findquestions[counter]['asyncname']=finddummyanswer.asyncname;
                                    findquestions[counter]['asynccheck']=finddummyanswer.asynccheck;
                                    answerflag=answerflag+1;
                                    findquestions[counter]['answerflag']=answerflag;
                                    //console.log('in question dunny answers');

                                }
                                next();
                        }).catch(function(error){
                            next();
                        });
                    }
                    }).catch(function(error){
                        next();
                    });




    }).catch(function(error){
  next();
    });
}

                    }, function (err)
                    {
                        if (err)
                        {
                            console.error('Inner Error: ' + err.message);
                            // return;
                        }
                        res.json(findquestions);
                    });
}).catch(function(error){
    res.json([]);
});

}
exports.submitSingleKFP = function(req,res){
    const kfpdummy_answers= db.get('kfpdummy_answers');
    const query = {'userid':req.body.userid,'questionid':req.body.questionid};
    const update = {$set:{ 'userid':req.body.userid,'questionid':req.body.questionid,'answertext':req.body.answertext,'asynccheck':req.body.asynccheck,'asyncname':req.body.asyncname,'created_at':Date.now()}};
    const options = {upsert: true};
    kfpdummy_answers.findOneAndUpdate(query,update,options).then(function(findupdate){
                    //console.log(findupdate);

                    res.status(200).send({
                         'code': 200,
                         'data': []
                     });
                }).catch(function(error){
                    res.status(500).send(error)
                });
}

exports.submitSingleIMG = function(req,res){
    const kfpdummy_answers= db.get('imgdummy_answers');
    const query = {'userid':req.body.userid,'questionid':req.body.questionid};
    const update = {$set:{ 'userid':req.body.userid,'questionid':req.body.questionid,'answertext':req.body.answertext,'asynccheck':req.body.asynccheck,'asyncname':req.body.asyncname,'created_at':Date.now()}};
    const options = {upsert: true};
    kfpdummy_answers.findOneAndUpdate(query,update,options).then(function(findupdate){
                    //console.log(findupdate);

                    res.status(200).send({
                         'code': 200,
                         'data': []
                     });
                }).catch(function(error){
                    res.status(500).send(error)
                });
}

exports.likedislikecomment = function(req,res)
{
    const case_comment_likes= db.get('case_comment_likes');

    const query = { 'commentid': req.body.commentid, 'likeby': req.body.likeby};
                const update = {$set:{ 'commentid': req.body.commentid,'likeby': req.body.likeby,'status': req.body.status,'created_at':Date.now()}};
                const options = {upsert: true};
                case_comment_likes.findOneAndUpdate(query,update,options).then(function(findupdate){
                    //console.log(findupdate);

                    res.status(200).send({
                         'code': 200,
                         'data': []
                     });
                }).catch(function(error){
                    res.status(500).send(error)
                });
}
//*********************************************************************************************

exports.StudentLikeDislikeComment = function(req,res)
{
    const student_comment_likes= db.get('student_comment_likes');
    const query = { 'commentid': req.body.commentid, 'likeby': req.body.likeby};
    const update = {$set:{ 'commentid': req.body.commentid,'likeby': req.body.likeby,'status': req.body.status,'created_at':Date.now()}};
    const options = {upsert: true};
    student_comment_likes.findOneAndUpdate(query,update,options).then(function(findupdate)
    {
      //console.log(findupdate);
      res.status(200).send({
          'code': 200,
          'data': []
      });
    }).catch(function(error){
        res.status(500).send(error)
      });
}
//*********************************************************************************************

exports.getCaseQuestionforanswer = function(req,res)
{
    //console.log('ses----------------');
    const questions= db.get('casequestions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const question_options= db.get('casequestion_options');
    const case_comments= db.get('case_comments');
    const case_comment_likes= db.get('case_comment_likes');
    const casequestion_answers= db.get('casequestion_answers');

    questions.aggregate(
        [
            {"$match":{'parentqid':req.body.questionid}},
        {
            $lookup:
            {
              from: "users",
              localField: "createdby",
              foreignField: "unique_id",
              as: "postedby"
            }
        },
        {$sort:{'q_order':1}},
        { "$unwind": "$postedby" }
    ]).then(function(findquestions)
    {
      var counter = -1;
      asyncLoop(findquestions, function (question, next)
      {
          counter++;
          question.dummyname=null;
          question.anonymouscheck=false;
          findquestions[counter]['tagdata']=[];
          findquestions[counter]['answertext']=null;
          findquestions[counter]['answerid']=[];
          findquestions[counter]['comments']=[];
          findquestions[counter]['answered']=false;
          findquestions[counter]['question_options']=[];
          if(question._id!==null)
          {
            var taguniqs = question.tags.split(",");
            categories.aggregate([
              {$match:{unique_id : { $in : taguniqs } ,'questionvisible':true}},
              { "$project": {
                                 "_id":1,
                                 "tagname":"$categoryname",
                                 "available":1,
                                 "studyplan":1,
                                 "resources":1,
                                 "created_by":1,
                                 "created_at":1,
                                 "unique_id":1
                                }
              }
            ]).then(function(getCategories)
            {
                tags.find({ unique_id : { $in : taguniqs } ,'questionvisible':true}).then(function(getTags)
                {
                    var alltags=getCategories.concat(getTags);
                    if(alltags != undefined && alltags.length > 0)
                    {
                        findquestions[counter]['tagdata']=alltags;
                    }
                    // next();
                }).catch(function(error){
                    //  next();
                  });
            });
            var qid=question._id.toString();
            question_options.find({'questionid' : qid}).then(function(findquestion_options)
            {
              //console.log('outside');
              findquestions[counter]['question_options']=findquestion_options;
              casequestion_answers.findOne({'pquestionid' : qid,'answerby':req.body.loginid}).then(function(findanswerq)
              {
                if(findanswerq!==null)
                {
                  findquestions[counter]['answertext']=findanswerq.answertext;
                  findquestions[counter]['answerid']=findanswerq.answerid;
                  findquestions[counter]['answered']=true;
                }
                //console.log('inside2');
                case_comments.aggregate([
                  {"$match":{'questionid' : qid,'parentid' : null}},
                  { $addFields: { 'editflag': false} },
                  { $addFields: { 'settingflag': false} },
                  { $addFields: { 'new_comment': null} },
                  {
                      $lookup:
                      {
                        from: "users",
                        localField: "created_by",
                        foreignField: "unique_id",
                        as: "commentby"
                      }
                  },
                  { "$project": {
                                 "_id":1,
                                 "content":1,
                                 "editflag":1,
                                 "settingflag":1,
                                 "asynccheck":1,
                                 "parentid":1,
                                 "dummyname":1,
                                 "created_at":1,
                                 "dummyprofile":1,
                                 "new_comment":1,
                                 "commentby.firstname":1,
                                 "commentby.lastname":1,
                                 "commentby.profile":1,
                                 "commentby.unique_id":1
                                }
                  },
                  { "$unwind": "$commentby" },
                ]).then(function(findanswer)
                {
                    var counter1 = -1;
                    asyncLoop(findanswer, function (comment1, next1)
                    {
                        counter1++;
                        findanswer[counter1]['likes']=0;
                        findanswer[counter1]['commentofcomment']=[];
                        case_comments.aggregate([
                            { "$match":{'parentid': comment1._id.toString()}},
                            { $addFields: { 'reditflag': false} },
                            { $addFields: { 'rsettingflag': false} },
                            {"$sort": {"_id": 1}},
                            {
                                $lookup:
                                {
                                    from: "users",
                                    localField: "created_by",
                                    foreignField: "unique_id",
                                    as: "commentby_n"
                                }
                            },
                            { "$unwind": "$commentby_n" },
                            { "$project": {
                                            "content":1,
                                            "created_at":1,
                                            "parentid":1,
                                            "replyid":1,
                                            "reditflag":1,
                                            "rsettingflag":1,
                                            "commentby_n.unique_id":1,
                                            "commentby_n.firstname":1,
                                            "commentby_n.lastname":1,
                                            "commentby_n.profile":1
                                          }
                            }
                        ]).then(function(findcommentofcomment)
                        {
                            if(findcommentofcomment != undefined && findcommentofcomment.length > 0)
                            {
                                var counter2 = -1;
                                asyncLoop(findcommentofcomment, function (comment2, next2)
                                {

                                    counter2++;
                                    findcommentofcomment[counter2]['likes']=0;
                                    findcommentofcomment[counter2]['likestatus']=0;
                                    findcommentofcomment[counter2]['parentcontent']=[];
                                    var commenntid1=comment2._id.toString();
                                    var commentreplyid=ObjectId(comment2.replyid)
                                    case_comments.aggregate([
                                        { "$match":{'_id':commentreplyid}},
                                        { $lookup:{ from: "users", localField: "created_by",  foreignField: "unique_id", as: "replyby"  } },
                                        { "$unwind": "$replyby" },
                                        { "$project": {
                                                                "content":1,
                                                                "created_at":1,
                                                                "created_by":1,
                                                                "unique_id":1,
                                                                "asynccheck": 1,
                                                                "dummyname": 1,
                                                                "dummyprofile": 1,
                                                                "replyby.unique_id":1,
                                                                "replyby.firstname":1,
                                                                "replyby.lastname":1,
                                                                "replyby.profile":1
                                                              }
                                        }
                                    ]).then(function(finparentcontent)
                                    {
                                        if(finparentcontent != undefined )
                                        {
                                            findcommentofcomment[counter2]['parentcontent']=finparentcontent;
                                        }
                                        case_comment_likes.find({'commentid': commenntid1, status:1}).then(function(findlikes1)
                                        {
                                            if(findlikes1 != undefined && findlikes1.length > 0){
                                                findcommentofcomment[counter2]['likes'] = findlikes1.length;
                                            }
                                            case_comment_likes.find({'commentid': commenntid1, 'likeby': req.body.loginid,'status': 1}).then(function(findupdatestatus1)
                                            {
                                              if(findupdatestatus1 != undefined && findupdatestatus1.length > 0){
                                                findcommentofcomment[counter2]['likestatus'] = 1;
                                              }
                                                next2();
                                            }).catch(function(error){
                                                next2();
                                              });
                                        }).catch(function(error){
                                            next2();
                                          });
                                    }).catch(function(error){
                                          next2();
                                      });
                                }, function (err)
                                {
                                    if (err)
                                    {
                                        console.error('Inner Error: ' + err.message);
                                        // return;
                                    }
                                    //res.json(findcomments);
                                });
                                //console.log("commentofcomment-",findcommentofcomment )
                                findanswer[counter1]['commentofcomment'] = findcommentofcomment;
                            }
                        }).catch(function(error){
                            next1();
                          });
                        findanswer[counter1]['likestatus']=0;
                        var commenntid=comment1._id.toString();
                        case_comment_likes.find({'commentid': commenntid, 'likeby': req.body.loginid,'status': 1}).then(function(findupdatestatus1)
                        {
                            if(findupdatestatus1 != undefined && findupdatestatus1.length > 0){
                                findanswer[counter1]['likestatus'] = 1;
                            }
                            case_comment_likes.find({'commentid': commenntid, status:1}).then(function(findlikes1){
                                if(findlikes1 != undefined && findlikes1.length > 0){
                                    findanswer[counter1]['likes'] = findlikes1.length;
                                }
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
                        //res.json(findcomments);
                        findquestions[counter]['comments']=findanswer;
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
          }

      }, function (err)
      {
          if (err)
          {
              console.error('Inner Error: ' + err.message);
          }
          // //console.log('comments-',findquestions[0].comments)
          res.json(findquestions);
      });
    }).catch(function(error){
        //console.log(error);
        res.json([]);
      });
}
//********************************************************************************
exports.getStudentQuestionforAnswer = function(req,res)
{
    //console.log('ses----------------');
    const questions= db.get('studentquestions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const question_options= db.get('studentquestion_options');
    const case_comments= db.get('student_comments');
    const case_comment_likes= db.get('student_comment_likes');
    const casequestion_answers= db.get('studentquestion_answers');

    questions.aggregate(
        [
            {"$match":{'parentqid':req.body.questionid}},
        {
            $lookup:
            {
              from: "users",
              localField: "createdby",
              foreignField: "unique_id",
              as: "postedby"
            }
        },
        {$sort:{'q_order':1}},
        { "$unwind": "$postedby" }
    ]).then(function(findquestions)
    {
      var counter = -1;
      asyncLoop(findquestions, function (question, next)
      {
          counter++;
          question.dummyname=null;
          question.anonymouscheck=false;
          findquestions[counter]['tagdata']=[];
          findquestions[counter]['answertext']=null;
          findquestions[counter]['answerid']=[];
          findquestions[counter]['comments']=[];
          findquestions[counter]['answered']=false;
          findquestions[counter]['question_options']=[];
          if(question._id!==null)
          {
            var taguniqs = question.tags.split(",");
            categories.aggregate([
              {$match:{unique_id : { $in : taguniqs } ,'questionvisible':true}},
              { "$project": {
                                 "_id":1,
                                 "tagname":"$categoryname",
                                 "available":1,
                                 "studyplan":1,
                                 "resources":1,
                                 "created_by":1,
                                 "created_at":1,
                                 "unique_id":1
                                }
              }
            ]).then(function(getCategories)
            {
                tags.find({ unique_id : { $in : taguniqs } ,'questionvisible':true}).then(function(getTags)
                {
                    var alltags=getCategories.concat(getTags);
                    if(alltags != undefined && alltags.length > 0)
                    {
                        findquestions[counter]['tagdata']=alltags;
                    }
                    // next();
                }).catch(function(error){
                    //  next();
                  });
            });
            var qid=question._id.toString();
            question_options.find({'questionid' : qid}).then(function(findquestion_options)
            {
              //console.log('outside');
              findquestions[counter]['question_options']=findquestion_options;
              casequestion_answers.findOne({'pquestionid' : qid,'answerby':req.body.loginid}).then(function(findanswerq)
              {
                if(findanswerq!==null)
                {
                  findquestions[counter]['answertext']=findanswerq.answertext;
                  findquestions[counter]['answerid']=findanswerq.answerid;
                  findquestions[counter]['answered']=true;
                }
                //console.log('inside2');
                case_comments.aggregate([
                  {"$match":{'questionid' : qid,'parentid' : null}},
                  { $addFields: { 'editflag': false} },
                  { $addFields: { 'settingflag': false} },
                  { $addFields: { 'new_comment': null} },
                  {
                      $lookup:
                      {
                        from: "users",
                        localField: "created_by",
                        foreignField: "unique_id",
                        as: "commentby"
                      }
                  },
                  { "$project": {
                                 "_id":1,
                                 "content":1,
                                 "editflag":1,
                                 "settingflag":1,
                                 "asynccheck":1,
                                 "parentid":1,
                                 "dummyname":1,
                                 "created_at":1,
                                 "dummyprofile":1,
                                 "new_comment":1,
                                 "commentby.firstname":1,
                                 "commentby.lastname":1,
                                 "commentby.profile":1,
                                 "commentby.unique_id":1
                                }
                  },
                  { "$unwind": "$commentby" },
                ]).then(function(findanswer)
                {
                    var counter1 = -1;
                    asyncLoop(findanswer, function (comment1, next1)
                    {
                        counter1++;
                        findanswer[counter1]['likes']=0;
                        findanswer[counter1]['commentofcomment']=[];
                        case_comments.aggregate([
                            { "$match":{'parentid': comment1._id.toString()}},
                            { $addFields: { 'reditflag': false} },
                            { $addFields: { 'rsettingflag': false} },
                            {"$sort": {"_id": 1}},
                            {
                                $lookup:
                                {
                                    from: "users",
                                    localField: "created_by",
                                    foreignField: "unique_id",
                                    as: "commentby_n"
                                }
                            },
                            { "$unwind": "$commentby_n" },
                            { "$project": {
                                            "content":1,
                                            "created_at":1,
                                            "parentid":1,
                                            "replyid":1,
                                            "reditflag":1,
                                            "rsettingflag":1,
                                            "commentby_n.unique_id":1,
                                            "commentby_n.firstname":1,
                                            "commentby_n.lastname":1,
                                            "commentby_n.profile":1
                                          }
                            }
                        ]).then(function(findcommentofcomment)
                        {
                            if(findcommentofcomment != undefined && findcommentofcomment.length > 0)
                            {
                                var counter2 = -1;
                                asyncLoop(findcommentofcomment, function (comment2, next2)
                                {

                                    counter2++;
                                    findcommentofcomment[counter2]['likes']=0;
                                    findcommentofcomment[counter2]['likestatus']=0;
                                    findcommentofcomment[counter2]['parentcontent']=[];
                                    var commenntid1=comment2._id.toString();
                                    var commentreplyid=ObjectId(comment2.replyid)
                                    case_comments.aggregate([
                                        { "$match":{'_id':commentreplyid}},
                                        { $lookup:{ from: "users", localField: "created_by",  foreignField: "unique_id", as: "replyby"  } },
                                        { "$unwind": "$replyby" },
                                        { "$project": {
                                                                "content":1,
                                                                "created_at":1,
                                                                "created_by":1,
                                                                "unique_id":1,
                                                                "asynccheck": 1,
                                                                "dummyname": 1,
                                                                "dummyprofile": 1,
                                                                "replyby.unique_id":1,
                                                                "replyby.firstname":1,
                                                                "replyby.lastname":1,
                                                                "replyby.profile":1
                                                              }
                                        }
                                    ]).then(function(finparentcontent)
                                    {
                                        if(finparentcontent != undefined )
                                        {
                                            findcommentofcomment[counter2]['parentcontent']=finparentcontent;
                                        }
                                        case_comment_likes.find({'commentid': commenntid1, status:1}).then(function(findlikes1)
                                        {
                                            if(findlikes1 != undefined && findlikes1.length > 0){
                                                findcommentofcomment[counter2]['likes'] = findlikes1.length;
                                            }
                                            case_comment_likes.find({'commentid': commenntid1, 'likeby': req.body.loginid,'status': 1}).then(function(findupdatestatus1)
                                            {
                                              if(findupdatestatus1 != undefined && findupdatestatus1.length > 0){
                                                findcommentofcomment[counter2]['likestatus'] = 1;
                                              }
                                                next2();
                                            }).catch(function(error){
                                                next2();
                                              });
                                        }).catch(function(error){
                                            next2();
                                          });
                                    }).catch(function(error){
                                          next2();
                                      });
                                }, function (err)
                                {
                                    if (err)
                                    {
                                        console.error('Inner Error: ' + err.message);
                                        // return;
                                    }
                                    //res.json(findcomments);
                                });
                                //console.log("commentofcomment-",findcommentofcomment )
                                findanswer[counter1]['commentofcomment'] = findcommentofcomment;
                            }
                        }).catch(function(error){
                            next1();
                          });
                        findanswer[counter1]['likestatus']=0;
                        var commenntid=comment1._id.toString();
                        case_comment_likes.find({'commentid': commenntid, 'likeby': req.body.loginid,'status': 1}).then(function(findupdatestatus1)
                        {
                            if(findupdatestatus1 != undefined && findupdatestatus1.length > 0){
                                findanswer[counter1]['likestatus'] = 1;
                            }
                            case_comment_likes.find({'commentid': commenntid, status:1}).then(function(findlikes1){
                                if(findlikes1 != undefined && findlikes1.length > 0){
                                    findanswer[counter1]['likes'] = findlikes1.length;
                                }
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
                        //res.json(findcomments);
                        findquestions[counter]['comments']=findanswer;
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
          }

      }, function (err)
      {
          if (err)
          {
              console.error('Inner Error: ' + err.message);
          }
          // //console.log('comments-',findquestions[0].comments)
          res.json(findquestions);
      });
    }).catch(function(error){
        //console.log(error);
        res.json([]);
      });
}
//********************************************************************************

exports.getOnePosts = function(req,res)
{
    //console.log(req.body.loginid);
    const postsdata= db.get('posts');
    postsdata.aggregate([
          { "$match":{"questionid": req.body.questionid}},
          {"$sort": {"posted_at": -1}},
          {"$sort": {"_id": -1}},
          { "$limit" : 1 },
          {
              $lookup:
              {
                         from: "users",
                         localField: "created_by",
                         foreignField: "unique_id",
                         as: "userdetail"
              }
          },
          { "$unwind": "$userdetail" },
          { "$project": {
                     "content":1,
                     "questionid":1,
                     "questiontype":1,
                     "tags":1,
                     "parentid":1,
                     "attached":1,
                     "pdfpreviewimage":1,
                     "created_by":1,
                     "posted_at":1,
                     "unique_id":1,
                     "userdetail.unique_id":1,
                     "userdetail.firstname":1,
                     "userdetail.lastname":1,
                     "userdetail.profile":1

                 }
          }
      ]).then(function(getPosts){
             var counter = -1;
            const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const case_comments= db.get('case_comments');
            const tags= db.get('tags');
            const post_saves= db.get('post_saves');
            asyncLoop(getPosts, function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['questiondata'] = [];
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                if(post.tags){
                    var taguniqs = post.tags.split(",");
                    //console.log("taguniqs- ",taguniqs);

                    tags.find({ unique_id : { $in : taguniqs } }, {unique_id:1, tagname:1},function(err, alltags){
                        if(alltags != undefined && alltags.length > 0){
                            getPosts[counter]['alltags'] = alltags;

                        }
                    })
                } else {
                    //console.log("notags");

                }

                post_likes.find({'postid': post.unique_id, 'likeby': req.body.loginid,'status': 1}).then(function(findupdate){
                    if(findupdate != undefined && findupdate.length > 0){
                        getPosts[counter]['likestatus'] = 1;
                    }
                    post_likes.find({'postid': post.unique_id, status:1}).then(function(findlikes){
                        if(findlikes != undefined && findlikes.length > 0){
                            getPosts[counter]['likes'] = findlikes.length;
                        }
                        post_likes.find({'postid': post.unique_id, status:0}).then(function(findlikes){
                            if(findlikes != undefined && findlikes.length > 0){
                                getPosts[counter]['dislikes'] = findlikes.length;
                            }
                            if(post.questiontype=='5d15fea98edfed6c417592d14'){
                            case_comments.find({'parentqid': post.questionid}).then(function(findcomments){
                                if(findcomments != undefined && findcomments.length > 0){
                                    getPosts[counter]['allcomments'] = findcomments;
                                }

                                post_saves.find({'postid': post.unique_id, 'created_by':req.body.loginid, status:0}).then(function(findsaveposts){
                                if(findsaveposts != undefined && findsaveposts.length > 0){
                                    getPosts[counter]['allsaveposts'] = 1;
                                }
                          next();
                          }).catch(function(error){
                            next();
                          });
                        }).catch(function(error){
                            next();
                        });
                    }else{
                        post_comments.find({'postid': post.unique_id}).then(function(findcomments){
                            if(findcomments != undefined && findcomments.length > 0){
                                getPosts[counter]['allcomments'] = findcomments;
                            }

                            post_saves.find({'postid': post.unique_id, 'created_by':req.body.loginid, status:0}).then(function(findsaveposts){
                            if(findsaveposts != undefined && findsaveposts.length > 0){
                                getPosts[counter]['allsaveposts'] = 1;
                            }
                      next();
                      }).catch(function(error){
                        next();
                      });
                    }).catch(function(error){
                        next();
                    });
                    }
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
                    res.json([]);
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json(getPosts);
            });
    });

}
//*******************************************

exports.SbaQuestionAnswer = function(req,res)
{
    const questions= db.get('questions');
    const tags= db.get('tags');
    const categories= db.get('categories');
    const question_options= db.get('question_options');
    const question_answers= db.get('question_answers');
    const dummy_answers= db.get('dummy_answers');

    questions.findOne({'_id': req.body.questionid}).then(function(findquestion)
    {
        if(findquestion != null)
        {
            var qid=findquestion._id.toString();
            question_options.find({'questionid': qid}).then(function(findqoptions)
            {
              if(findqoptions != undefined && findqoptions.length > 0)
              {
                findquestion['questionoptions'] = findqoptions;
              }
              else
              {
                findquestion['questionoptions'] = [];
                //console.log("nooptions");
              }
              question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
              {
                  if(findanswer != undefined && findanswer.length > 0)
                  {
                      findquestion['questionanswer'] = findanswer;
                      findquestion['answercheck']=true;
                  }
                  else
                  {
                    findquestion['questionanswer'] = [];
                    findquestion['answercheck']=false;
                    //console.log("nooptions");
                  }
                question_answers.find({'questionid': qid}).then(function(findcountanswer)
                {
                    if(findcountanswer != undefined && findcountanswer.length > 0){
                        findquestion['answercount']=findcountanswer.length;
                    }
                    else
                    {
                      findquestion['answercount']=0;
                      //console.log("nooptions");
                    }
                    //console.log("findquestion-",findquestion)
                    res.json(findquestion);
                })
              })
            })
        }
    })
}
//***********************************************************************

exports.getImgWeekQuestionbyId = function(req,res)
{
  const questions= db.get('imgofweekquestions');
  const tags= db.get('tags');
  const categories= db.get('categories');
  const question_options= db.get('imgofweekquestion_options');
  questions.find({'parentqid':req.body.questionid},{sort:{'q_order':1}}).then(function(findquestions)
  {
    var counter = -1;
    asyncLoop(findquestions, function (question, next)
    {
        counter++;
        findquestions[counter]['tagdata']=[];
        findquestions[counter]['domaindata']=[];
        findquestions[counter]['categorydata']=[];
        findquestions[counter]['age_rangedata']=[];
        findquestions[counter]['genderdata']=[];
        findquestions[counter]['imgofweekquestion_options']=[];
        findquestions[counter]['questionimagevalidation']={'image_permission':null,'image_source':null};
        findquestions[counter]['stemimagevalidation']={'image_permission':null,'image_source':null};

        var taguniqs = question.tags.split(",");
        categories.aggregate([
          {$match:{unique_id : { $in : taguniqs } }},
          { "$project": {
                          "_id":1,
                          "tagname":"$categoryname",
                          "available":1,
                          "studyplan":1,
                          "resources":1,
                          "created_by":1,
                          "created_at":1,
                          "unique_id":1
                        }
          }
        ]).then(function(getCategories)
        {
            tags.find({ unique_id : { $in : taguniqs } }).then(function(getTags)
            {
                var alltags=getCategories.concat(getTags);
                if(alltags != undefined && alltags.length > 0)
                {
                  findquestions[counter]['tagdata']=alltags;
                }
            /// next();
            }).catch(function(error){
              //  next();
              });
        });
        var domainuniqs = question.domain.split(",");
        tags.find({'unique_id' : { $in : domainuniqs }}).then(function(finddomain)
        {
            findquestions[counter]['domaindata']=finddomain;
            var categoryuniqs = question.category.split(",");
            tags.find({'unique_id' : { $in : categoryuniqs }}).then(function(findcategory)
            {
                findquestions[counter]['categorydata']=findcategory;
                var age_rangeuniqs = question.age_range.split(",");
                tags.find({'unique_id' : { $in : age_rangeuniqs }}).then(function(findage_range)
                {
                  findquestions[counter]['age_rangedata']=findage_range;
                  var genderuniqs = question.gender.split(",");
                  tags.find({'unique_id' : { $in : genderuniqs }}).then(function(findgender)
                  {
                    findquestions[counter]['genderdata']=findgender;
                    var qid=question._id.toString();
                    question_options.find({'questionid' : qid}).then(function(findquestion_options)
                    {
                      findquestions[counter]['imgofweekquestion_options']=findquestion_options;
                      next();
                    }).catch(function(error){
                        next();
                      });
                  }).catch(function(error){
                    });
                }).catch(function(error){
                  });
            }).catch(function(error){
              });
        }).catch(function(error){
          });
    }, function (err)
      {
          if (err)
          {
              console.error('Inner Error: ' + err.message);
              // return;
          }
          res.json(findquestions);
      });
  }).catch(function(error){
      res.json([]);
    });
}
//***********************************************************************

exports.updatesaveImgWeekQuestion = function(req,res)
{
  if(req.body.oldq_version==req.body.question_version)
  {
      const imgofweekquestions= db.get('imgofweekquestions');
      req.body.data.forEach(function(qdata)
      {
        if(qdata.stem.length>0)
        {
          var stem_text=qdata.stem[0].stem_text
        }
        else
        {
          var stem_text=null
        }
        if(qdata.id)
        {
          imgofweekquestions.findOneAndUpdate({'_id':qdata.id},{$set:{'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'hero_img':qdata.uploaded_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'updatedby':req.body.createdby,'updated_at':Date.now(), 'multiple_uploadedstem_file':qdata.multiple_uploadedstem_file, 'multiple_uploaded_file' : qdata.multiple_uploaded_file}})
          .then(function(insertquestion)
          {
            //console.log('imgweek insert');
            const imgofweekquestion_options= db.get('imgofweekquestion_options');
            qdata.options.forEach(function(optval)
            {
              if(optval.option_text!=='')
              {
                var questionid= insertquestion._id.toString();
                if(optval.id)
                {
                  imgofweekquestion_options.findOneAndUpdate({'_id':optval.id},{$set:{'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(insertoptions){
                  }).catch(function(error){ });
                }
                else
                {
                  imgofweekquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertoptions){
                  }).catch(function(error){  });
                }
              }
            })
          }).catch(function(error){
              //console.log('imgweek not insert');
            });
        }
        else
        {
          if(qdata.question_text!=='' && qdata.question_text!==null)
          {
            imgofweekquestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()})
            .then(function(insertquestion)
            {
              //console.log('imgweek insert');
              const imgofweekquestion_options= db.get('imgofweekquestion_options');
              qdata.options.forEach(function(optval)
              {
                if(optval.option_text!=='')
                {
                  var questionid= insertquestion._id.toString();
                  imgofweekquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()})
                  .then(function(insertoptions)
                  { }).catch(function(error){ });
                }
              })
            }).catch(function(error){
                //console.log('imgweek not insert');
              });
          }
        }
      });
      res.json([]);
    }
    else
    {
        const imgweekquestions= db.get('imgofweekquestions');
        req.body.data.forEach(function(qdata)
        {
          if(qdata.stem.length>0){
            var stem_text=qdata.stem[0].stem_text
          }
          else
          {
            var stem_text=null
          }
          imgweekquestions.insert({'q_order':qdata.q_order,'q_subject':req.body.q_subject,'q_title':req.body.q_title,'answer_key':qdata.answer_key,'parentqid':req.body.parentqid,'imagevisibility':qdata.imagevisibility,'q_version':req.body.question_version,'uploadedstem_file':qdata.uploadedstem_file,'stem_image_permission':qdata.stemimagevalidation.image_permission,'stem_image_source':qdata.stemimagevalidation.image_source,'question_image_permission':qdata.questionimagevalidation.image_permission,'question_image_source':qdata.questionimagevalidation.image_source,'hero_img':qdata.uploaded_file,'stem_text':stem_text,'instruction_text':qdata.instruction_text,'version':req.body.version,'questiontype':req.body.questiontype,'college':req.body.college,'question_text':qdata.question_text,'option_type':qdata.choiceoption,'answer_explanation':qdata.answer_explanation,'tags':req.body.tags,'domain':req.body.domain,'category':req.body.category,'age_range':req.body.age_range,'gender':req.body.gender,'atsi':req.body.atsi,'deleted':0,'publish':0,'publish_date':req.body.publish_date,'answerpublish_date':req.body.answerpublish_date,'createdby':req.body.createdby,'created_at':Date.now()})
          .then(function(insertquestion)
          {
            //console.log('imgweek insert');
            const imgofweekquestion_options= db.get('imgofweekquestion_options');
            qdata.options.forEach(function(optval)
            {
              if(optval.option_text!=='')
              {
                var questionid= insertquestion._id.toString();
                imgofweekquestion_options.insert({'option_order':optval.option_order,'answervalue':optval.answervalue,'option_text':optval.option_text,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()})
                .then(function(insertoptions){
                }).catch(function(error){ });
              }
            })
          }).catch(function(error){
              //console.log('imgweek not insert');
            });
        });
        res.json([]);
    }
}
//*******************************************************************************************************************

exports.getImgWeekQuestionforanswer = function(req,res)
{
  const questions= db.get('imgofweekquestions');
  const tags= db.get('tags');
  const categories= db.get('categories');
  const question_options= db.get('imgofweekquestion_options');
  const kfpquestion_answers= db.get('imgofweekquestion_answers');
  const kfpdummy_answers= db.get('imgdummy_answers');
  questions.find({'parentqid':req.body.questionid},{sort:{'q_order':1}}).then(function(findquestions)
  {
    var counter = -1;
    var answerflag=0;
    asyncLoop(findquestions, function (question, next)
    {
                counter++;
                findquestions[counter]['tagdata']=[];
                findquestions[counter]['answertext']='Please type your answer';
                findquestions[counter]['answerid']=[];
                findquestions[counter]['answered']=false;
                findquestions[counter]['answerflag']=answerflag;
                findquestions[counter]['answerplaceholder']='Please type your answer';
                findquestions[counter]['error']=null;
                findquestions[counter]['question_options']=[];



           if(question._id!==null){
            var taguniqs = question.tags.split(",");
            categories.aggregate([
                {$match:{unique_id : { $in : taguniqs } ,'questionvisible':true}},
                { "$project": {
                                 "_id":1,
                                 "tagname":"$categoryname",
                                 "available":1,
                                 "studyplan":1,
                                 "resources":1,
                                 "created_by":1,
                                 "created_at":1,
                                 "unique_id":1
                                }
                    }
            ]).then(function(getCategories)
            {
                tags.find({ unique_id : { $in : taguniqs } ,'questionvisible':true}).then(function(getTags)
                {
                    var alltags=getCategories.concat(getTags);
                    if(alltags != undefined && alltags.length > 0)
                    {
                        findquestions[counter]['tagdata']=alltags;
                    }
              /// next();
              }).catch(function(error){
                //  next();
              });
            });
                var qid=question._id.toString();
                //console.log('out question option');
            question_options.find({'questionid' : qid}).then(function(findquestion_options){
                findquestions[counter]['question_options']=findquestion_options;
                //console.log('in question option');
              kfpquestion_answers.findOne({'pquestionid' : qid,'answerby':req.body.loggedinuser}).then(function(findanswer){
                   if(findanswer!==null){
                findquestions[counter]['answertext']=findanswer.answertext;
                                findquestions[counter]['answerid']=findanswer.answerid;
                                //console.log('in question answers');

                         findquestions[counter]['answered']=true;
                         next();
                                }else{
                                kfpdummy_answers.findOne({'questionid' : qid,'userid':req.body.loggedinuser}).then(function(finddummyanswer){
                                    if(finddummyanswer!==null){
                                    findquestions[counter]['answertext']=finddummyanswer.answertext;
                                    findquestions[counter]['asyncname']=finddummyanswer.asyncname;
                                    findquestions[counter]['asynccheck']=finddummyanswer.asynccheck;
                                    answerflag=answerflag+1;
                                    findquestions[counter]['answerflag']=answerflag;
                                    //console.log('in question dunny answers');

                                }
                                next();
                        }).catch(function(error){
                            next();
                        });
                    }
                    }).catch(function(error){
                        next();
                    });




    }).catch(function(error){
  next();
    });
}

                    }, function (err)
                    {
                        if (err)
                        {
                            console.error('Inner Error: ' + err.message);
                            // return;
                        }
                        res.json(findquestions);
                    });
}).catch(function(error){
    res.json([]);
});

}