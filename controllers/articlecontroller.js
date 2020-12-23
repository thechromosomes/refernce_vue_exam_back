// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');
var NotificationCons = require('./notificationcontroller');



exports.getAuthorlist = function(req,res){
    const users= db.get('users');
    users.find({},{sort:{'firstname':1,'lastname':1}}).then(function(getAuthors){
        res.json(getAuthors);
    });
  
}
exports.updatesearchdata = function(req,res){
    const posts= db.get('posts');
    posts.find({}).then(function(getPosts){
        getPosts.forEach(function(postdata){
            posts.findOneAndUpdate({'_id':postdata._id},{$set:{'searchcontent':postdata.content}}).then(function(insertquestionoption){
            }).catch(function(error){
              //console.log('question option not insert'); 
            });
           }) 
    });
  
}
/*exports.updatesearchdata = function(req,res){
    const posts= db.get('posts');
    const articles= db.get('articles');
    posts.find({'articleid': { $ne: null}}).then(function(getPosts){
        getPosts.forEach(function(postdata){
            articles.findOne({"_id":postdata.articleid},function(err,refPostdata)
            {
            posts.findOneAndUpdate({'_id':postdata._id},{$set:{'searchcontent':refPostdata.a_title}}).then(function(insertquestionoption){
            }).catch(function(error){
              //console.log('question option not insert'); 
            });
        })
           }) 
    });
  
}*/
exports.setArticleView = function(req,res){
    const article_views= db.get('article_views');
    article_views.insert({'userid':req.body.userid,'articleid':req.body.articleid,'created_at':Date.now(),'source':req.body.source}).then(function(insertarticleview){
res.json(insertarticleview);
    }).catch(function(error){
     //console.log('article view not insert'); 
   });
  
}
exports.getArticleView = function(req,res){
    const article_views= db.get('article_views');
    article_views.aggregate([
     {'$match':{'articleid':req.body.articleid}},
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
//***************************************************************************************
exports.getAllArticles = function(req,res)
{
    const articles= db.get('articles');
    
    articles.aggregate([
        {"$sort": {"_id": -1}},
        { "$addFields": { "artid": { "$toString": "$_id" }}},
        {
            $lookup:
            {
                       from: "users",
                       localField: "author_name",
                       foreignField: "unique_id",
                       as: "authordetail"
            }
        },
        {
          $lookup:
          {
            from: "posts",
            let: { post_id: { $convert: { input: "$_id", to: "string" } }, parentid:null },
            pipeline: [
                { $match:
                   { $expr:
                      { $and:
                         [
                           { $eq: [ "$articleid",  "$$post_id" ] },
                           { $eq: [ "$parentid", "$$parentid" ] },
                         ]
                      }
                   }
                },
                { $project: { articleid:1,deleted:1,posted_at:1,unique_id:1 } }
            ],
            as: "postsdetails"
          }  
        },
        {
            $lookup:
            {
                       from: "article_views",
                       localField: "artid",
                       foreignField: "articleid",
                       as: "articleviews"
            }
        },
        { "$project": {
                   "_id":1,
                   "publish":1,
                   "a_version":1,
                   "a_title":1,
                   "author_name":1,
                   "createdby":1,
                   "created_at":1,
                   "updated_at":1,
                   "scheduledatetime":1,
                    "updatedby":1,
                   "authordetail.unique_id":1,
                   "authordetail.firstname":1,
                   "authordetail.lastname":1, 
                   "authordetail.profile":1,
                   "articleviews._id":1,
                   "postsdetails.articleid":1,   
                   "postsdetails.deleted":1,   
                   "postsdetails.posted_at":1,   
                   "postsdetails.unique_id":1   
       
               } 
        }
    ]).then(function(getArticles)
    {
      var counter = -1;
      const post_likes= db.get('post_likes');
      const post_comments= db.get('comments');
      const postsdata= db.get('posts');
      asyncLoop(getArticles, function (post, next)
      {
          counter++
          getArticles[counter]['likes'] = 0;
          getArticles[counter]['dislikes'] = 0;
          getArticles[counter]['commentscount'] = 0;
          getArticles[counter]['allcomments'] = [];
          if(post.postsdetails.length>0)
          {
            if(post.postsdetails[0].deleted==false)
            {
              getArticles[counter]['publish']=1;
            }
          }
          if(post.publish==1 && post.scheduledatetime>Date.now()){
            getArticles[counter]['q_status']='Scheduled';
          }else if(post.publish==1){
              getArticles[counter]['q_status']='Published';
          }else{
              getArticles[counter]['q_status']='Draft';
          }
          if(post.postsdetails.length > 0)
          {  
              //console.log('pid-',post.postsdetails[0].unique_id)
              post_likes.find({'postid': post.postsdetails[0].unique_id, status:1}).then(function(findlikes){
                if(findlikes != undefined && findlikes.length > 0){
                  getArticles[counter]['likes'] = findlikes.length;
                }
                post_likes.find({'postid': post.postsdetails[0].unique_id, status:0}).then(function(findlikes){
                  if(findlikes != undefined && findlikes.length > 0){
                    getArticles[counter]['dislikes'] = findlikes.length;
                  }
                  post_comments.find({'postid': post.postsdetails[0].unique_id}).then(function(findcomments){
                    if(findcomments != undefined && findcomments.length > 0){
                      getArticles[counter]['commentscount'] = findcomments.length;
                      getArticles[counter]['allcomments'] = findcomments;
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
          }
          else{
            getArticles[counter]['likes'] = 0;
            getArticles[counter]['dislikes'] = 0;
            getArticles[counter]['commentscount'] = 0;
            getArticles[counter]['allcomments'] = [];
            next();
          }
      }, function (err)
        {
          if (err)
          {  console.error('Inner Error: ' + err.message);  }
          res.json(getArticles);
        });
    });
  
}
exports.getrecentthreeArticles = function(req,res){
    const articles= db.get('articles');
    const authors= db.get('users');
    const article_sections= db.get('article_sections');
    articles.find({'_id': { $ne: req.body.articleid},'publish':1},{sort:{'_id':-1},limit:3}).then(function(getArticles){
        var counter=-1;
        asyncLoop(getArticles, function (article, next)
        {
            counter++;
            getArticles[counter]['sectiondata']=null;
            getArticles[counter]['authordata']=null;
            var articleid= article._id.toString(); 
            article_sections.findOne({'articleid':articleid},{sort:{'a_order':1}}).then(function(findarticlesections){
                if(findarticlesections.section_uploaded_file!=null && findarticlesections.section_uploaded_file!=''){
                    findarticlesections.uploaded_file=findarticlesections.section_uploaded_file.split(',');
                }else if(findarticlesections.uploaded_file!=null && findarticlesections.uploaded_file!=''){
                    findarticlesections.uploaded_file=findarticlesections.uploaded_file.split(',');
                }else{
                    findarticlesections.uploaded_file=[];    
                }
               
               
                getArticles[counter]['sectiondata']=findarticlesections;
                authors.findOne({'unique_id':article.author_name}).then(function(findauthordata){
                    getArticles[counter]['authordata']=findauthordata;
                    next();
                }).catch(function(error){
                    next();
                 //console.log('article section not insert'); 
               });
            }).catch(function(error){
                next();
             //console.log('article section not insert'); 
           });
        }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
    
            res.json(getArticles);
        });
    });
  
}



exports.saveArticle = function(req,res){

    const articles= db.get('articles');  
    const article_sections= db.get('article_sections');
    const article_questions= db.get('article_questions');
    const article_question_options= db.get('article_question_options');
    articles.insert({'publish':req.body.savestatus,'a_version':req.body.a_version,'a_title':req.body.a_title,'author_name':req.body.author_name,'tags':req.body.tags,'scheduledatetime':req.body.scheduledatetime,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticle){
      //console.log('article insert');  
      res.json(insertarticle);
      req.body.data.forEach(function(sectiondata){
   var articleid= insertarticle._id.toString(); 
   var secimages=sectiondata.uploaded_file.join(",");
   var sectitleimages=sectiondata.section_uploaded_file.join(",");
   article_sections.insert({'main_image_permission':sectiondata.mainimagevalidation.image_permission,'main_image_source':sectiondata.mainimagevalidation.image_source,'section_image_permission':sectiondata.sectionimagevalidation.image_permission,'section_image_source':sectiondata.sectionimagevalidation.image_source,'section_uploaded_file':sectitleimages,'uploaded_file':secimages,'a_order':sectiondata.a_order,'article_section':sectiondata.article_section,'article_text':sectiondata.article_text,'article_content':sectiondata.article_content,'articleid':articleid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticlesection){
 if(sectiondata.questions.length>0){
    sectiondata.questions.forEach(function(questiondata){
        var sectionid= insertarticlesection._id.toString(); 
        var qimages=questiondata.uploaded_file.join(",");
        article_questions.insert({'question_image_permission':questiondata.questionimagevalidation.image_permission,'question_image_source':questiondata.questionimagevalidation.image_source,'uploaded_file':qimages,'answer_explanation':questiondata.answer_explanation,'question_text':questiondata.question_text,'optionchoice':questiondata.optionchoice,'choiceoption':questiondata.choiceoption,'q_order':questiondata.q_order,'articleid':articleid,'sectionid':sectionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticlequestion){
      if(questiondata.options.length>0){
        questiondata.options.forEach(function(optiondata){
            var questionid= insertarticlequestion._id.toString(); 
            article_question_options.insert({'answervalue':optiondata.answervalue,'option_text':optiondata.option_text,'option_order':optiondata.option_order,'articleid':articleid,'sectionid':sectionid,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestionoption){
           }).catch(function(error){
             //console.log('question option not insert'); 
           });
           })   
      }
       }).catch(function(error){
         //console.log('question not insert'); 
       });
       })   
 }
  }).catch(function(error){
    //console.log('article section not insert'); 
  });
  })       
}).catch(function(error){
    //console.log('article not insert'); 
});

}
exports.updateArticle = function(req,res){

    const articles= db.get('articles'); 
    const posts= db.get('posts');   
    const article_sections= db.get('article_sections');
    const article_questions= db.get('article_questions');
    const article_question_options= db.get('article_question_options');
if(req.body.old_version===req.body.article_version){
    if(req.body.publishcheck==1){
    var publish=1;    
    }else{
    var publish=req.body.savestatus; 
    }
    articles.findOneAndUpdate({'_id':req.body.id},{$set:{'publish':publish,'a_version':req.body.article_version,'a_title':req.body.a_title,'author_name':req.body.author_name,'tags':req.body.tags,'scheduledatetime':req.body.scheduledatetime,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(insertarticle){
      //console.log('article insert'); 
      posts.findOneAndUpdate({ 'articleid': req.body.id},{$set:{'tags':req.body.tags,'searchcontent':req.body.a_title}}).then(function(finaldata){
        //console.log('hhhh'+finaldata);
      }).catch(function(error){
        //console.log('question not insert'); 
      });
      res.json(insertarticle);
      req.body.data.forEach(function(sectiondata){
          if(sectiondata._id){
   var articleid= insertarticle._id.toString(); 
   var secimages=sectiondata.uploaded_file.join(",");
   var sectitleimages=sectiondata.section_uploaded_file.join(",");
   article_sections.findOneAndUpdate({'_id':sectiondata._id},{$set:{'main_image_permission':sectiondata.mainimagevalidation.image_permission,'main_image_source':sectiondata.mainimagevalidation.image_source,'section_image_permission':sectiondata.sectionimagevalidation.image_permission,'section_image_source':sectiondata.sectionimagevalidation.image_source,'section_uploaded_file':sectitleimages,'uploaded_file':secimages,'a_order':sectiondata.a_order,'article_section':sectiondata.article_section,'article_text':sectiondata.article_text,'article_content':sectiondata.article_content,'articleid':articleid,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(insertarticlesection){
 if(sectiondata.questions.length>0){
    sectiondata.questions.forEach(function(questiondata){
      if(questiondata._id){
        var sectionid= insertarticlesection._id.toString(); 
        var qimages=questiondata.uploaded_file.join(",");
        article_questions.findOneAndUpdate({'_id':questiondata._id},{$set:{'question_image_permission':questiondata.questionimagevalidation.image_permission,'question_image_source':questiondata.questionimagevalidation.image_source,'uploaded_file':qimages,'answer_explanation':questiondata.answer_explanation,'question_text':questiondata.question_text,'optionchoice':questiondata.optionchoice,'choiceoption':questiondata.choiceoption,'q_order':questiondata.q_order,'articleid':articleid,'sectionid':sectionid,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(insertarticlequestion){
      if(questiondata.options.length>0){
        questiondata.options.forEach(function(optiondata){
            if(optiondata._id){
            var questionid= insertarticlequestion._id.toString(); 
            article_question_options.findOneAndUpdate({'_id':optiondata._id},{$set:{'answervalue':optiondata.answervalue,'option_text':optiondata.option_text,'option_order':optiondata.option_order,'articleid':articleid,'sectionid':sectionid,'questionid':questionid,'updatedby':req.body.createdby,'updated_at':Date.now()}}).then(function(insertquestionoption){
           }).catch(function(error){
             //console.log('question option not insert'); 
           });
        }else{
            var questionid= insertarticlequestion._id.toString(); 
            article_question_options.insert({'answervalue':optiondata.answervalue,'option_text':optiondata.option_text,'option_order':optiondata.option_order,'articleid':articleid,'sectionid':sectionid,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestionoption){
           }).catch(function(error){
             //console.log('question option not insert'); 
           });
        }
           })    }
       }).catch(function(error){
         //console.log('question not insert'); 
       });
    }else{
        var sectionid= insertarticlesection._id.toString(); 
        var qimages=questiondata.uploaded_file.join(",");
        article_questions.insert({'uploaded_file':qimages,'answer_explanation':questiondata.answer_explanation,'question_text':questiondata.question_text,'optionchoice':questiondata.optionchoice,'choiceoption':questiondata.choiceoption,'q_order':questiondata.q_order,'articleid':articleid,'sectionid':sectionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticlequestion){
      if(questiondata.options.length>0){
        questiondata.options.forEach(function(optiondata){
            var questionid= insertarticlequestion._id.toString(); 
            article_question_options.insert({'answervalue':optiondata.answervalue,'option_text':optiondata.option_text,'option_order':optiondata.option_order,'articleid':articleid,'sectionid':sectionid,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestionoption){
           }).catch(function(error){
             //console.log('question option not insert'); 
           });
           })   
      }
       }).catch(function(error){
         //console.log('question not insert'); 
       });
    }
       })   
 }
  }).catch(function(error){
    //console.log('article section not insert'); 
  });
          }else{
            var articleid= insertarticle._id.toString();
            var secimages=sectiondata.uploaded_file.join(","); 
            var sectitleimages=sectiondata.section_uploaded_file.join(",");
            article_sections.insert({'section_uploaded_file':sectitleimages,'uploaded_file':secimages,'a_order':sectiondata.a_order,'article_section':sectiondata.article_section,'article_text':sectiondata.article_text,'article_content':sectiondata.article_content,'articleid':articleid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticlesection){
          if(sectiondata.questions.length>0){
             sectiondata.questions.forEach(function(questiondata){
                 var sectionid= insertarticlesection._id.toString(); 
                 var qimages=questiondata.uploaded_file.join(",");
                 article_questions.insert({'uploaded_file':qimages,'answer_explanation':questiondata.answer_explanation,'question_text':questiondata.question_text,'optionchoice':questiondata.optionchoice,'choiceoption':questiondata.choiceoption,'q_order':questiondata.q_order,'articleid':articleid,'sectionid':sectionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticlequestion){
               if(questiondata.options.length>0){
                 questiondata.options.forEach(function(optiondata){
                     var questionid= insertarticlequestion._id.toString(); 
                     article_question_options.insert({'answervalue':optiondata.answervalue,'option_text':optiondata.option_text,'option_order':optiondata.option_order,'articleid':articleid,'sectionid':sectionid,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestionoption){
                    }).catch(function(error){
                      //console.log('question option not insert'); 
                    });
                    })   
               }
                }).catch(function(error){
                  //console.log('question not insert'); 
                });
                })   
          }
           }).catch(function(error){
             //console.log('article section not insert'); 
           });    
          }
  })       
}).catch(function(error){
    //console.log('article not insert'); 
});
}else{
    articles.insert({'publish':req.body.savestatus,'a_version':req.body.article_version,'parent_articleid':req.body.id,'a_title':req.body.a_title,'author_name':req.body.author_name,'tags':req.body.tags,'scheduledatetime':req.body.scheduledatetime,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticle){
        //console.log('article insert');  
        res.json(insertarticle);
        req.body.data.forEach(function(sectiondata){
     var articleid= insertarticle._id.toString(); 
     var secimages=sectiondata.uploaded_file.join(",");
     var sectitleimages=sectiondata.section_uploaded_file.join(",");
     article_sections.insert({'section_uploaded_file':sectitleimages,'uploaded_file':secimages,'a_order':sectiondata.a_order,'article_section':sectiondata.article_section,'article_text':sectiondata.article_text,'article_content':sectiondata.article_content,'articleid':articleid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticlesection){
   if(sectiondata.questions.length>0){
      sectiondata.questions.forEach(function(questiondata){
          var sectionid= insertarticlesection._id.toString(); 
          var qimages=questiondata.uploaded_file.join(",");
          article_questions.insert({'uploaded_file':qimages,'answer_explanation':questiondata.answer_explanation,'question_text':questiondata.question_text,'optionchoice':questiondata.optionchoice,'choiceoption':questiondata.choiceoption,'q_order':questiondata.q_order,'articleid':articleid,'sectionid':sectionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertarticlequestion){
        if(questiondata.options.length>0){
          questiondata.options.forEach(function(optiondata){
              var questionid= insertarticlequestion._id.toString(); 
              article_question_options.insert({'answervalue':optiondata.answervalue,'option_text':optiondata.option_text,'option_order':optiondata.option_order,'articleid':articleid,'sectionid':sectionid,'questionid':questionid,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertquestionoption){
             }).catch(function(error){
               //console.log('question option not insert'); 
             });
             })   
        }
         }).catch(function(error){
           //console.log('question not insert'); 
         });
         })   
   }
    }).catch(function(error){
      //console.log('article section not insert'); 
    });
    })       
  }).catch(function(error){
      //console.log('article not insert'); 
  });
}
}
exports.QuestionAnswer = function(req,res){
    const article_question_answers= db.get('article_question_answers');
    article_question_answers.insert({'questionid':req.body.questionid,'answer_text':req.body.answer_text,'answerid':req.body.answerid,'answerby':req.body.createdby,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertanswer){
            res.json(insertanswer);           
}).catch(function(error){
    res.json([]);  
});
     
}
exports.deleteArticle = function(req,res){
    const articles= db.get('articles');
    const article_sections= db.get('article_sections');
    const article_questions= db.get('article_questions');
    const article_question_options= db.get('article_question_options');
    const article_question_answers= db.get('article_question_answers');
    const posts= db.get('posts');
    const notifications = db.get('notifications');
    articles.remove({ _id: req.body.articleid});
    article_sections.remove({ articleid: req.body.articleid });
    article_questions.remove({ articleid: req.body.articleid });
    article_question_options.remove({ articleid: req.body.articleid });
    article_question_answers.remove({ articleid: req.body.articleid });
    posts.remove({ articleid: req.body.articleid});
    notifications.remove({ targetid: req.body.articleid});

    res.json([{'status':200}]); 
}

exports.deleteArticleSection = function(req,res){
    const article_sections= db.get('article_sections');
    const article_questions= db.get('article_questions');
    article_sections.remove({ _id: req.body.sectionid });
    article_questions.remove({ sectionid: req.body.sectionid });
    res.json([{'status':200}]); 
     
}
exports.UnpublishArticle = function(req,res){
    const articles= db.get('articles');
    const posts= db.get('posts');
    articles.findOneAndUpdate({ '_id': req.body.articleid},{$set:{'publish':0}});
    posts.remove({ 'articleid': req.body.articleid});
    res.json([{'status':200}]); 
     
}

  module.exports.getArticleids = async (req, res) => { 
  const articles= db.get('articles');
  let articlesIds =  await articles.aggregate([
      {$match: {"scheduledatetime": {"$lte": Date.now() },"publish": 1}},
      {"$sort": {"scheduledatetime": -1}},
      { "$limit" : 100 },
      {$project: {
          "_id" : 1
      }}
  ])

  if (articlesIds.length > 0){
      res.send({
          "message": "data fetched successfully",
          "status": true,
          "data": articlesIds
      })
  }else {
      res.send({
          "message": " no data found",
          "status": false,
          "data": []
      })
  }

}
exports.PublishArticle = function(req,res){
    const articles= db.get('articles');
    const posts= db.get('posts');
   articles.findOneAndUpdate({ '_id': req.body.articleid},{$set:{'publish':1}}).then(function(updatearticle){
    const newIdpre = db.id()
    const newId=newIdpre.toString();
    //console.log('objectidd',newId);
    posts.insert({"active" : true, "deleted" : false, "reported" : false, "updated_by" : "", "resourceid" : false,'parentid':null,'eventid':null,'pollid':null,'questionid':null,'pdfpreviewimage':null,'attached':null,'content':'','searchcontent':updatearticle.a_title,'tags':updatearticle.tags,'unique_id':newId,'created_by':req.body.userid,'posted_at':updatearticle.scheduledatetime,'articleid':req.body.articleid}).then(function(insertcomment){
        var reqdata={"weburl":'articleview',"appurl":'',"targetid":req.body.articleid,"scheduled":updatearticle.scheduledatetime,"title":updatearticle.a_title,"articleid":req.body.articleid,'postid':insertcomment.unique_id,"authorid":updatearticle.author_name,'createdby':req.body.userid};
        //console.log('gfdshgfdhgfh'+reqdata);
        NotificationCons.internalsetarticlepublishnotification(reqdata);
        res.json([{'status':200}]);    
    }).catch(function(error){
        res.json([]); 
    }); 
   }).catch(function(error){
       res.json([]);  
   }); 
}
exports.getArticleById = function(req,res){

    const articles= db.get('articles');
    const authors= db.get('users');  
    const categories= db.get('categories');  
    const article_sections= db.get('article_sections');
    const article_questions= db.get('article_questions');
    const article_question_options= db.get('article_question_options');
    const article_question_answers= db.get('article_question_answers');
        const tags= db.get('tags');
      
            article_sections.find({'articleid':req.body.articleid},{sort:{'a_order':1}}).then(function(findarticlesections){
                var counter = -1;
                asyncLoop(findarticlesections, function (article, next)
                {
                    counter++;
                    findarticlesections[counter]['tagdata']=[];
                    findarticlesections[counter]['maindata']={};
                    findarticlesections[counter]['articlequestiondata']=[];
                   var sectionid=article._id.toString();
                   if(article.uploaded_file!=null && article.uploaded_file!=''){
                    article.uploaded_file=article.uploaded_file.split(',');
                   }else{
                    article.uploaded_file=[];   
                   }
                   if(article.section_uploaded_file!=null && article.section_uploaded_file!=''){
                    article.section_uploaded_file=article.section_uploaded_file.split(',');
                   }else{
                    article.section_uploaded_file=[];   
                   }
                   
                    article_questions.find({'sectionid' : sectionid},{sort:{'q_order':1}}).then(function(findquestions){
                     var questindata=[];
                     findquestions.forEach(function(qdata,index)
                     {      if(qdata.choiceoption==1){
                        qdata.answerid=null;
                     }else{
                        qdata.answerid=[];
                     }
                           

                            qdata.answerflag=false;
                            qdata.answer_text=null; 
                            if(qdata.uploaded_file!=null && qdata.uploaded_file!=''){
                             qdata.uploaded_file=qdata.uploaded_file.split(',');
                            }else{
                                qdata.uploaded_file=[];
                            }
                            
                            var questionid=qdata._id.toString();
                            //console.log('question id'+questionid);
                            article_question_options.find({'questionid' :questionid},{sort:{'option_order':1}}).then(function(findquestionoptions){
                                if(findquestionoptions.length>0){
                                qdata.optiondata=findquestionoptions;
                                questindata[index]=qdata;
                                }
                        //console.log('option data');
                        }).catch(function(error){
                            //console.log('option errror');
                        }); 
                        article_question_answers.findOne({'questionid' :questionid,'answerby':req.body.userid}).then(function(findanswer){
                            if(findanswer){    
                            qdata.answerid=findanswer.answerid;
                            qdata.answer_text=findanswer.answer_text;
                            qdata.answerflag=true;
                            }
                    //console.log('option data');
                    }).catch(function(error){
                        //console.log('option errror');
                    });                      
                       });
                   
                           findarticlesections[counter]['articlequestiondata']=questindata; 
                     

                    articles.findOne({'_id':req.body.articleid}).then(function(findarticles){
                             //console.log(findarticles);
                             findarticles.author=null;
                             if(findarticles.author_name!=''){
                         authors.findOne({'unique_id':findarticles.author_name}).then(function(findauthor){ 
                                    findarticles.author=findauthor;
                                }).catch(function(error){
                                //console.log('author not find')
                                findarticles.author=null;
                                });    
                             }
                            findarticlesections[counter]['maindata']=findarticles;
                            var taguniqs = findarticles.tags.split(",");
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
                                      findarticlesections[counter]['tagdata']=alltags;
                                    }
                               next();  
                              }).catch(function(error){
                                  next();  
                              }); 
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
                    
                            res.json(findarticlesections);
                        });                      
    }).catch(function(error){
        res.json(['article section  not found']);  
    }); 
    
    
    

}
exports.getArticleForEdit = function(req,res){

    const articles= db.get('articles');   
    const article_sections= db.get('article_sections');
    const article_questions= db.get('article_questions');
    const categories= db.get('categories');
    const article_question_options= db.get('article_question_options');

        const tags= db.get('tags');
      
            article_sections.find({'articleid':req.body.articleid},{sort:{'a_order':1}}).then(function(findarticlesections){
                var counter = -1;
                asyncLoop(findarticlesections, function (article, next)
                {
                    counter++;
                    findarticlesections[counter]['tagdata']=[];
                    findarticlesections[counter]['maindata']={};
                    findarticlesections[counter]['questions']=[];
                    findarticlesections[counter]['mainimagevalidation']={'image_permission':null,'image_source':null};
                    findarticlesections[counter]['sectionimagevalidation']={'image_permission':null,'image_source':null};
                    if(article.article_text!=null && article.article_text!=''){
                        article.article_text_flag=true;
                    }else{
                        article.article_text_flag=false;
                    }
                   var sectionid=article._id.toString();
                if(article.uploaded_file!=null && article.uploaded_file!=''){
                    article.uploaded_file=article.uploaded_file.split(','); 
                }else{
                    article.uploaded_file=[]; 
                }
                if(article.section_uploaded_file!=null && article.section_uploaded_file!=''){
                    article.section_uploaded_file=article.section_uploaded_file.split(','); 
                }else{
                    article.section_uploaded_file=[]
                }
                   

                    article_questions.find({'sectionid' : sectionid},{sort:{'q_order':1}}).then(function(findquestions){
                     var questindata=[];
                     findquestions.forEach(function(qdata,index)
                     {
                            qdata.answerid=null;
                            qdata.answerflag=false;
                            qdata.answer_text=null; 
                            qdata.sectionimagevalidation={'image_permission':null,'image_source':null};
                            if(qdata.uploaded_file!=null && qdata.uploaded_file!=null){
                                qdata.uploaded_file=qdata.uploaded_file.split(','); 
                            }else{
                                qdata.uploaded_file=[]
                            }
                            

                            var questionid=qdata._id.toString();
                            //console.log('question id'+questionid);
                            article_question_options.find({'questionid' :questionid},{sort:{'option_order':1}}).then(function(findquestionoptions){
                                
                                qdata.options=findquestionoptions;
                                questindata[index]=qdata;
                        //console.log('option data');
                        }).catch(function(error){
                            //console.log('option errror');
                        });                     
                       });
                   
                           findarticlesections[counter]['questions']=questindata; 
                     

                    articles.findOne({'_id':req.body.articleid}).then(function(findarticles)
                    {
                        //console.log(findarticles);
                        findarticlesections[counter]['maindata']=findarticles;
                        var taguniqs = findarticles.tags.split(",");
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
                            findarticlesections[counter]['tagdata']=alltags;
                          }
                     next();  
                    }).catch(function(error){
                        next();  
                    }); 
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
                    
                            res.json(findarticlesections);
                        });                      
    }).catch(function(error){
        res.json(['article section  not found']);  
    }); 
    
    
    

}
exports.getOnePosts = function(req,res)
{
    //console.log(req.body.loginid);
    const postsdata= db.get('posts');
    postsdata.aggregate([
          { "$match":{"articleid": req.body.articleid}},
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
                     "tags":1,
                     "parentid":1,
                     "attached":1,
                     "pdfpreviewimage":1,
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
            const tags= db.get('tags');
            const categories= db.get('categories');
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
                if(post.tags)
                {
                    var taguniqs = post.tags.split(",");
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
                            getPosts[counter]['alltags'] = alltags;
                          }
                          
                      });
                  });
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
                res.json(getPosts);
            });
    }).catch(function(error){
        res.json([]);
    });
  
}
