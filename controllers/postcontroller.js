
// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');

//*********************************************************************************************************************************************************************
exports.checkNodeServer = function(req,res)
{
    res.json(['Site is running successfully'],200);
}

exports.getallpostsbytitle = function(req,res)
{
    if(req.body.searchedtitle==null || req.body.searchedtitle=='')
    {
       res.json([]);
    }
    else
    {
var search_title=req.body.searchedtitle.trim()
  const tags=db.get('tags');
  const postsdata= db.get('posts');
  const questions= db.get('questions');
  const casequestions = db.get('casequestions');

  var s_tag=[];
  let ninRegex=[""];
    if(req.body.seltags==null)
    {var s_tag=[""]; }
    else
    {
        if(req.body.seltags[0] == 9211){
            let ninRegexTemp = ["5dc249f753ccd574492e0fba", "5dc2498553ccd574492e0fb8", "5d75d7945eb94a7dd37a2604", "5d845a7166ab01731b38202d"]
            ninRegex = ninRegexTemp.map(function (e) { return new RegExp(e, "i"); });
            var s_tag=[""];
        } else{
            s_tag.push(req.body.seltags);
        }
    }
    tags.find({ category_id : { $in: s_tag } },async function(err, alltags)
    {
      if(alltags!=undefined && alltags.length > 0 )
      {
        alltags.forEach(function(tagval)
        {
          if(tagval.category_id!='')
          s_tag.push(tagval.unique_id);
        })
      }
      regex = s_tag.map(function (e) { return new RegExp(e, "i"); });

    //   new search function in the question tag
      if (req.body.searchedtitle !== null || req.body.searchedtitle !==' '){

        var uniqueSearchId = []
        var finalUniqueSearchId = []

        let questionsData =  await questions.aggregate([
            { "$match":{'q_title': new RegExp(search_title, 'i') ,'deleted': 0 }},
            {"$project": {
                "_id":1
            }}
          ])
          if (questionsData.length == 0){
            let casequestionsData = await casequestions.aggregate([
                { "$match":{'q_title': new RegExp(search_title, 'i') ,'deleted': 0 }},
                {"$project": {
                    "_id":1
                }}
            ])
            uniqueSearchId = casequestionsData
            }else if (questionsData.length > 0){
                uniqueSearchId = questionsData
            }
        }
        if(uniqueSearchId.length > 0){
          finalUniqueSearchId = uniqueSearchId.map(function (e) { return new RegExp(e._id, "i"); });
        }

      postsdata.aggregate([
       { "$match": {$or: [{"posted_at": {"$lte": Date.now() },'searchcontent': new RegExp(search_title, 'i') ,'deleted':false },
       {"posted_at": {"$lte": Date.now() }, "questionid" : { $in: finalUniqueSearchId } ,'deleted':false }] } },
        {"$sort": {"posted_at": -1}},
        { "$limit" : Number(req.body.range) },
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
                     "searchcontent":1,
                     "questionid":1,
                     "questiontype":1,
                     "childquestionid":1,
                     "pollid":1,
                     "eventid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
                     "parentid":1,
                     "attached":1,
                     "preview_data":1,
                     "preview_flag":1,
                     "pdfpreviewimage":1,
                     "posted_at":1,
                     "unique_id":1,
                     "userdetail.unique_id":1,
                     "userdetail.firstname":1,
                     "userdetail.lastname":1,
                     "userdetail.profile":1

                 }
                }
         ])

         .then(function(getPosts){
            var counter = -1;
            const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const categories= db.get('categories');
            const tags= db.get('tags');
            // const questions= db.get('questions');
            // const casequestions= db.get('casequestions');
            const polls= db.get('polls');
            const pollsoptions= db.get('polls_options');
            const pollssubmit= db.get('polls_submitions');
            const authors= db.get('users');
            const article_sections= db.get('article_sections');
            const post_saves= db.get('post_saves');
            const question_options= db.get('question_options');
            const question_answers= db.get('question_answers');
            const casequestion_answers= db.get('casequestion_answers');
            const case_comments= db.get('case_comments');

            // console.log("from post controller line 88", getPosts)
            if(getPosts.length >0){
            asyncLoop(getPosts, async function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['pollactive'] = true;
                getPosts[counter]['polldata'] = {};
                getPosts[counter]['polloptions'] = [];
                getPosts[counter]['pollrescount'] = 0;
                getPosts[counter]['mypollans'] = '';
                getPosts[counter]['questiondata'] = {};
                getPosts[counter]['articledata'] = {};
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                getPosts[counter]['answercount']=0;
                getPosts[counter]['refPost']=[];
                getPosts[counter]['resourceidstatus']=false;
                if(post.parentid!==null)
                {
                    postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      if(refPostdata!=null)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                        {
                            // //console.log(refuser)
                            refPostdata.refusers=refuser
                        })
                        getPosts[counter]['refPost'] = refPostdata;
                      }
                    })
                }
                else { ////console.log("noparentid");
            }
                if(post.resourceid)
                {
                    getPosts[counter]['resourceidstatus']=post.resourceid;
                }
                else {
                   getPosts[counter]['resourceidstatus']=false;
                }
                if(post.tags)
                {

                    // //console.log("taguniqs- ",taguniqs);
                    var taguniqs = post.tags.split(",");
                    // console.log("taguniqs >>>>>>", taguniqs)
                    if(post.questionid!==null && post.questionid!==''){
                    //  var condfortag={'unique_id' : { $in : taguniqs } ,'questionvisible':true}
                     var condfortag={'unique_id' : { $in : taguniqs }}

                    }else{
                        var condfortag={'unique_id' : { $in : taguniqs } }
                    }

                    categories.aggregate([
                      {$match:condfortag},
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
                      tags.find(condfortag).then(function(getTags)
                      {
                          var alltags=getCategories.concat(getTags);
                          if(alltags != undefined && alltags.length > 0)
                          {
                            getPosts[counter]['alltags'] = alltags;
                          }

                      });
                  });
                }
                else {
                   // //console.log("notags");

                }
             if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14' && post.childquestionid==null){
                    // //console.log('this is if');
                    casequestions.findOne({'q_order': 1,'parentqid':post.questionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();

                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                   // //console.log("nooptions");
                }

            })
            case_comments.find({'parentqid': post.questionid}).then(function(findcommentd){
                // //console.log(findanswer)
        if(findcommentd != undefined && findcommentd.length > 0){

            getPosts[counter]['allcomments'] = findcommentd;
        }else{
            ////console.log("nooptions");
        }

    })
            casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer){
                // //console.log(findcountanswer)
        if(findcountanswer != undefined && findcountanswer.length > 0){
            getPosts[counter]['answercount']=findcountanswer.length;


        }else{
          //  //console.log("nooptions");
        }

        if (findquestion.tags !== "" && findquestion.tags !== null){
            console.log("findquestion.tags >>>>>>>>>>", findquestion.tags)
            var taguniqs = findquestion.tags.split(",");
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
                        getPosts[counter]['alltags']=alltags;
                    }
                }).catch(function(error){
                });
            });
        }

    })

                        }
                    })
                }
                else if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14'){
                   // //console.log('this is if');
                    casequestions.findOne({'_id': post.childquestionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();

                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                   // //console.log("nooptions");
                }

            })
            case_comments.find({'parentqid': post.questionid}).then(function(findcommentd){
                // //console.log(findanswer)
        if(findcommentd != undefined && findcommentd.length > 0){

            getPosts[counter]['allcomments'] = findcommentd;
        }else{
            ////console.log("nooptions");
        }

    })
            casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer){
                // //console.log(findcountanswer)
        if(findcountanswer != undefined && findcountanswer.length > 0){
            getPosts[counter]['answercount']=findcountanswer.length;


        }else{
          //  //console.log("nooptions");
        }

        if (findquestion.tags !== "" && findquestion.tags !== null){
            console.log("findquestion.tags >>>>>>>>>>", findquestion.tags)
            var taguniqs = findquestion.tags.split(",");
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
                        getPosts[counter]['alltags']=alltags;
                    }
                }).catch(function(error){
                });
            });
        }

    })

                        }
                    })
                }else if(post.questionid){
    //                // //console.log('this is else if');
    //                 questions.findOne({'_id': post.questionid}).then(function(findquestion){

    //                     if(findquestion != null){
    //                         getPosts[counter]['questiondata'] = findquestion;
    //                         var qid=findquestion._id.toString();
    //                         question_options.find({'questionid': qid}).then(function(findqoptions){
    //                             // //console.log(findqoptions)
    //                     if(findqoptions != undefined && findqoptions.length > 0){
    //                         getPosts[counter]['questionoptions'] = findqoptions;


    //                     }else{
    //                        // //console.log("nooptions");
    //                     }

    //                 })
    //                 question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
    //                     // //console.log(findanswer)
    //             if(findanswer != undefined && findanswer.length > 0){
    //                 getPosts[counter]['questionanswer'] = findanswer;
    //                 //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
    //                 getPosts[counter]['answercheck']=true;


    //             }else{
    //               //  //console.log("nooptions");
    //             }

    //         })
    //         question_answers.find({'questionid': qid}).then(function(findcountanswer){
    //             // //console.log(findcountanswer)
    //     if(findcountanswer != undefined && findcountanswer.length > 0){
    //         getPosts[counter]['answercount']=findcountanswer.length;


    //     }else{
    //        // //console.log("nooptions");
    //     }

    // })

    //                     }
    //                 })

                    var qid
                    let findquestion = await questions.findOne({'_id': post.questionid});
                    if(findquestion){
                        getPosts[counter]['questiondata'] = findquestion;
                        qid=findquestion._id.toString();
                    }

                    if (findquestion.tags !== "" && findquestion.tags !== null){
                        console.log("findquestion.tags >>>>>>>>>>", findquestion.tags)
                        var taguniqs = findquestion.tags.split(",");
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
                                    getPosts[counter]['alltags']=alltags;
                                }
                            }).catch(function(error){
                            });
                        });
                    }

                    let findqoptions = await  question_options.find({'questionid': qid});
                    if(findqoptions != undefined && findqoptions.length > 0){
                        getPosts[counter]['questionoptions'] = findqoptions;
                    }

                    let findanswer = await question_answers.find({'questionid': qid,'answerby':req.body.loginid});
                    if(findanswer){
                        getPosts[counter]['questionanswer'] = findanswer;
                        getPosts[counter]['answercheck']=true;
                        console.log(getPosts[counter]['questionanswer'].length);
                    }


                    let findcountanswer = await question_answers.find({'questionid': qid});
                    if(findcountanswer != undefined && findcountanswer.length > 0){
                        getPosts[counter]['answercount']=findcountanswer.length;
                    }

                } else {
                  //  //console.log("noquestion");

                }
                if(post.articleid){

                    article_sections.aggregate([
                        { "$match":{'articleid': post.articleid,'a_order':1}},
                        { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                        {
                            $lookup:
                                {
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                                }
                        },
                        { "$unwind": "$articaldata" },
                        { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                        }
                    }
                    ]).then(function(findarticle){

                        if(findarticle != null){
                            if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                }else{
                                findarticle[0].uploaded_file=[];
                                }
                                findarticle[0].partcontent=findarticle[0].article_content;
                            authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                findarticle[0].author=findauthor;

                            }).catch(function(error){
                           // //console.log('author not find')
                            findarticle[0].author=null;
                            });
                            getPosts[counter]['articledata'] = findarticle;
 }
                    })
                } else {
                   // //console.log("no article");
                    post.articleid=null;
                }
                if(post.pollid)
                {
                  polls.findOne({'_id': post.pollid, "endDays": {"$gt": Date.now() }}).then(function(findpoll)
                  {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollssubmit.findOne({'pollid':qid, 'created_by':req.body.loginid }).then(function(finduserpollans)
                      {
                        if(finduserpollans!=null)
                        getPosts[counter]['mypollans'] = finduserpollans.optionid;
                      })
                      pollssubmit.find({'pollid': qid, 'postid':post.unique_id}).then(function(allpollres)
                      {
                        getPosts[counter]['pollrescount'] = allpollres.length;
                      });
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                        // //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            findpoptions.forEach(function(poption,index)
                            {
                                var optid=poption._id.toString();
                                pollssubmit.find({'pollid':qid, 'optionid': optid}).then(function(findoptioncount)
                                {
                                  if(findoptioncount.length > 0)
                                  {
                                    var c1 = (findoptioncount.length*100)/getPosts[counter]['pollrescount'];
                                    // //console.log('c1-',c1)
                                    if(c1!=Infinity)
                                    {
                                      poption.count=Number(c1).toFixed(2);
                                    }
                                    else
                                    {
                                      poption.count=0;
                                    }
                                  }
                                  else{poption.count=0;}
                                })
                            });
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{ ////console.log("nooptions");
                     }
                      })
                    }
                    else
                    {
                            getPosts[counter]['pollactive'] = false;
                            postsdata.findOneAndUpdate({'pollid':post.pollid},{ $set: {'deleted':true}}).then(function(updatepollstatus)
                            {
                               // //console.log('poll deactivated')
                            });
                    }
                  })

                } else {
                   /// //console.log("no poll");
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
                                    if(post.questiontype!='5d15fea98edfed6c417592d14'){
                                    getPosts[counter]['allcomments'] = findcomments;
                                    }
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
        } else{
            res.send([]);
        }
    });
    });
}
}

exports.getAllposts = function(req,res)
{
    const tags=db.get('tags');
    const postsdata= db.get('posts');

  var s_tag=[];
  let ninRegex=[];
    if(req.body.seltags==null)
    {var s_tag=[]; }
    else
    {
        if(req.body.seltags[0] == 9211){
            let ninRegexTemp = ["5dc249f753ccd574492e0fba", "5dc2498553ccd574492e0fb8", "5d75d7945eb94a7dd37a2604", "5d845a7166ab01731b38202d"]
            ninRegex = ninRegexTemp.map(function (e) { return new RegExp(e, "i"); });
            var s_tag=[""];
        } else{
            s_tag.push(req.body.seltags);
        }
    }
    tags.find({ category_id : { $in: s_tag } },function(err, alltags)
    {
      if(alltags!=undefined && alltags.length > 0 )
      {
        alltags.forEach(function(tagval)
        {
          if(tagval.category_id!='')
          s_tag.push(tagval.unique_id);
        })
      }
      regex = s_tag.map(function (e) { return new RegExp(e, "i"); });

      console.log("s_tag", s_tag)
      console.log("ninRegex", ninRegex)


      postsdata.aggregate([
       { "$match":{"posted_at": {"$lte": Date.now() },'deleted':false,$and: [{ "tags": {"$in" : regex } }, { "tags": {"$nin" : ninRegex } } ] }},
        {"$sort": {"posted_at": -1}},
        { "$limit" : Number(req.body.range) },
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
                     "searchcontent":1,
                     "questionid":1,
                     "questiontype":1,
                     "childquestionid":1,
                     "pollid":1,
                     "eventid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
                     "parentid":1,
                     "attached":1,
                     "preview_data":1,
                     "preview_flag":1,
                     "pdfpreviewimage":1,
                     "posted_at":1,
                     "unique_id":1,
                     "userdetail.unique_id":1,
                     "userdetail.firstname":1,
                     "userdetail.lastname":1,
                     "userdetail.profile":1

                 }
                }
                //    to exclude tags
            // {"$match": { "tags": {"$nin" : ninRegex } }}
         ]).then(function(getPosts){
            var counter = -1;
            const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const categories= db.get('categories');
            const tags= db.get('tags');
            const questions= db.get('questions');
            const casequestions= db.get('casequestions');
            const polls= db.get('polls');
            const pollsoptions= db.get('polls_options');
            const pollssubmit= db.get('polls_submitions');
            const authors= db.get('users');
            const article_sections= db.get('article_sections');
            const post_saves= db.get('post_saves');
            const question_options= db.get('question_options');
            const question_answers= db.get('question_answers');
            const casequestion_answers= db.get('casequestion_answers');
            const case_comments= db.get('case_comments');


            asyncLoop(getPosts, async function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['pollactive'] = true;
                getPosts[counter]['polldata'] = {};
                getPosts[counter]['polloptions'] = [];
                getPosts[counter]['pollrescount'] = 0;
                getPosts[counter]['mypollans'] = '';
                getPosts[counter]['questiondata'] = {};
                getPosts[counter]['articledata'] = {};
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                getPosts[counter]['answercount']=0;
                getPosts[counter]['refPost']=[];
                getPosts[counter]['resourceidstatus']=false;
                if(post.parentid!==null)
                {
                    postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      if(refPostdata!=null)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                        {
                            // //console.log(refuser)
                            refPostdata.refusers=refuser
                        })
                        getPosts[counter]['refPost'] = refPostdata;
                      }
                    })
                }
                else { ////console.log("noparentid");
            }
                if(post.resourceid)
                {
                    getPosts[counter]['resourceidstatus']=post.resourceid;
                }
                else {
                   getPosts[counter]['resourceidstatus']=false;
                }
                if(post.tags)
                {

                    // //console.log("taguniqs- ",taguniqs);
                    var taguniqs = post.tags.split(",");
                    // console.log("taguniqs >>>>>>", taguniqs)
                    if(post.questionid!==null && post.questionid!==''){
                    //  var condfortag={'unique_id' : { $in : taguniqs } ,'questionvisible':true}
                     var condfortag={'unique_id' : { $in : taguniqs }}

                    }else{
                        var condfortag={'unique_id' : { $in : taguniqs } }
                    }

                    categories.aggregate([
                      {$match:condfortag},
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
                      tags.find(condfortag).then(function(getTags)
                      {
                          var alltags=getCategories.concat(getTags);
                          if(alltags != undefined && alltags.length > 0)
                          {
                            getPosts[counter]['alltags'] = alltags;
                          }

                      });
                  });
                }
                else {
                   // //console.log("notags");

                }
             if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14' && post.childquestionid==null){
                    // //console.log('this is if');
                    casequestions.findOne({'q_order': 1,'parentqid':post.questionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();

                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                   // //console.log("nooptions");
                }

            })
            case_comments.find({'parentqid': post.questionid}).then(function(findcommentd){
                // //console.log(findanswer)
        if(findcommentd != undefined && findcommentd.length > 0){

            getPosts[counter]['allcomments'] = findcommentd;
        }else{
            ////console.log("nooptions");
        }

    })
            casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer){
                // //console.log(findcountanswer)
        if(findcountanswer != undefined && findcountanswer.length > 0){
            getPosts[counter]['answercount']=findcountanswer.length;


        }else{
          //  //console.log("nooptions");
        }

        if (findquestion.tags !== "" && findquestion.tags !== null){

            var taguniqs = findquestion.tags.split(",");
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
                        getPosts[counter]['alltags']=alltags;
                    }
                }).catch(function(error){
                });
            });
        }

    })

                        }
                    })
                }
                else if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14'){
                   // //console.log('this is if');
                    casequestions.findOne({'_id': post.childquestionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();

                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                   // //console.log("nooptions");
                }

            })
            case_comments.find({'parentqid': post.questionid}).then(function(findcommentd){
                // //console.log(findanswer)
        if(findcommentd != undefined && findcommentd.length > 0){

            getPosts[counter]['allcomments'] = findcommentd;
        }else{
            ////console.log("nooptions");
        }

    })
            casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer){
                // //console.log(findcountanswer)
        if(findcountanswer != undefined && findcountanswer.length > 0){
            getPosts[counter]['answercount']=findcountanswer.length;


        }else{
          //  //console.log("nooptions");
        }

        if (findquestion.tags !== "" && findquestion.tags !== null){

            var taguniqs = findquestion.tags.split(",");
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
                        getPosts[counter]['alltags']=alltags;
                    }
                }).catch(function(error){
                });
            });
        }

    })

                        }
                    })
                }else if(post.questionid){
    //                // //console.log('this is else if');
    //                 questions.findOne({'_id': post.questionid}).then(function(findquestion){

    //                     if(findquestion != null){
    //                         getPosts[counter]['questiondata'] = findquestion;
    //                         var qid=findquestion._id.toString();
    //                         question_options.find({'questionid': qid}).then(function(findqoptions){
    //                             // //console.log(findqoptions)
    //                     if(findqoptions != undefined && findqoptions.length > 0){
    //                         getPosts[counter]['questionoptions'] = findqoptions;


    //                     }else{
    //                        // //console.log("nooptions");
    //                     }

    //                 })
    //                 question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
    //                     // //console.log(findanswer)
    //             if(findanswer != undefined && findanswer.length > 0){
    //                 getPosts[counter]['questionanswer'] = findanswer;
    //                 //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
    //                 getPosts[counter]['answercheck']=true;


    //             }else{
    //               //  //console.log("nooptions");
    //             }

    //         })
    //         question_answers.find({'questionid': qid}).then(function(findcountanswer){
    //             // //console.log(findcountanswer)
    //     if(findcountanswer != undefined && findcountanswer.length > 0){
    //         getPosts[counter]['answercount']=findcountanswer.length;


    //     }else{
    //        // //console.log("nooptions");
    //     }

    // })

    //                     }
    //                 })

                var qid

                let findquestion = await questions.findOne({'_id': post.questionid});
                if(findquestion){
                    getPosts[counter]['questiondata'] = findquestion;
                    qid=findquestion._id.toString();

                    if (findquestion.tags !== "" && findquestion.tags !== null){

                    var taguniqs = findquestion.tags.split(",");
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
                                getPosts[counter]['alltags']=alltags;
                            }
                        }).catch(function(error){
                        });
                    });
                }
                }

                let findqoptions = await  question_options.find({'questionid': qid});
                if(findqoptions != undefined && findqoptions.length > 0){
                    getPosts[counter]['questionoptions'] = findqoptions;
                }

                let findanswer = await question_answers.find({'questionid': qid,'answerby':req.body.loginid});
                if(findanswer){
                    getPosts[counter]['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;
                    console.log(getPosts[counter]['questionanswer'].length);
                }


                let findcountanswer = await question_answers.find({'questionid': qid});
                if(findcountanswer != undefined && findcountanswer.length > 0){
                    getPosts[counter]['answercount']=findcountanswer.length;
                }

                } else {
                  //  //console.log("noquestion");
                }


                if(post.articleid){

                    article_sections.aggregate([
                        { "$match":{'articleid': post.articleid,'a_order':1}},
                        { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                        {
                            $lookup:
                                {
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                                }
                        },
                        { "$unwind": "$articaldata" },
                        { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                        }
                    }
                    ]).then(function(findarticle){

                        if(findarticle != null){
                            if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                }else{
                                findarticle[0].uploaded_file=[];
                                }
                                findarticle[0].partcontent=findarticle[0].article_content;
                            authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                findarticle[0].author=findauthor;

                            }).catch(function(error){
                           // //console.log('author not find')
                            findarticle[0].author=null;
                            });
                            getPosts[counter]['articledata'] = findarticle;
 }
                    })
                } else {
                   // //console.log("no article");
                    post.articleid=null;
                }
                if(post.pollid)
                {
                  polls.findOne({'_id': post.pollid, "endDays": {"$gt": Date.now() }}).then(function(findpoll)
                  {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollssubmit.findOne({'pollid':qid, 'created_by':req.body.loginid }).then(function(finduserpollans)
                      {
                        if(finduserpollans!=null)
                        getPosts[counter]['mypollans'] = finduserpollans.optionid;
                      })
                      pollssubmit.find({'pollid': qid, 'postid':post.unique_id}).then(function(allpollres)
                      {
                        getPosts[counter]['pollrescount'] = allpollres.length;
                      });
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                        // //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            findpoptions.forEach(function(poption,index)
                            {
                                var optid=poption._id.toString();
                                pollssubmit.find({'pollid':qid, 'optionid': optid}).then(function(findoptioncount)
                                {
                                  if(findoptioncount.length > 0)
                                  {
                                    var c1 = (findoptioncount.length*100)/getPosts[counter]['pollrescount'];
                                    // //console.log('c1-',c1)
                                    if(c1!=Infinity)
                                    {
                                      poption.count=Number(c1).toFixed(2);
                                    }
                                    else
                                    {
                                      poption.count=0;
                                    }
                                  }
                                  else{poption.count=0;}
                                })
                            });
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{ ////console.log("nooptions");
                     }
                      })
                    }
                    else
                    {
                            getPosts[counter]['pollactive'] = false;
                            postsdata.findOneAndUpdate({'pollid':post.pollid},{ $set: {'deleted':true}}).then(function(updatepollstatus)
                            {
                               // //console.log('poll deactivated')
                            });
                    }
                  })

                } else {
                   /// //console.log("no poll");
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
                                    if(post.questiontype!='5d15fea98edfed6c417592d14'){
                                    getPosts[counter]['allcomments'] = findcomments;
                                    }
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
    });//end of getPosts
      // res.json(s_tag)
    });//tags


}
//***************************************************************************************************************************************************************

exports.getCommentUserlist = function(req,res){
    if(req.body.searcheduser==null || req.body.searcheduser==''){
        res.json([]);
        }else{
    var search_title=req.body.searcheduser.trim()
    const users= db.get('users');
    users.find({$or: [{'firstname': new RegExp(search_title,'i')},{'lastname': new RegExp(search_title,'i')}]},{sort:{'_id':-1},limit:10}).then(function(getComment){
        res.json(getComment);
    });
    }
}

exports.getTableRecord = function(req,res){

    const tabledata= db.get(req.body.tablename);
    tabledata.aggregate([
        {$sort:{_id:req.body.sortorder}},
    ]).then(function(getRecords){
        res.json(getRecords);
    });

}

exports.getCommentsofPost = function(req,res)
{
  ////console.log(req.body.postid);

  const comment_likes= db.get('comment_likes');
  const post_comments= db.get('comments');
  const users= db.get('users');

  post_comments.aggregate([
    { "$match":{'postid': req.body.postid,'parentid':null}},
    { $addFields: { 'editflag': false} },
    { $addFields: { 'settingflag': false} },
    {"$sort": {"_id": 1}},
    {
        $lookup:
        {
            from: "users",
            localField: "created_by",
            foreignField: "unique_id",
            as: "commentby"
        }
    },
    { "$unwind": "$commentby" },
    { "$project": {
                      "content":1,
                      "created_at":1,
                      "parentid":1,
                      "replyid":1,
                      "editflag":1,
                      "settingflag":1,
                      "asynccheck":1,
                      "questionid":1,
                      "dummyname":1,
                      "dummyprofile":1,
                      "unique_id":1,
                      "commentby.unique_id":1,
                      "commentby.firstname":1,
                      "commentby.lastname":1,
                      "commentby.profile":1

                  }
    }
  ]).then(function(findcomments)
  {
    // //console.log('findcomments:',findcomments)
    if(findcomments.length>0)
    {
      var counter = -1;
      asyncLoop(findcomments, function (comment, next)
      {
          counter++
          findcomments[counter]['likes']=0;
          findcomments[counter]['likestatus']=0;
          findcomments[counter]['commentofcomment'] = [];
          if(comment.asynccheck==null){
            comment.asynccheck=false;
          }
          post_comments.aggregate([
              { "$match":{'parentid': comment.unique_id}},
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
                              "unique_id":1,
                              "commentby_n.unique_id":1,
                              "commentby_n.firstname":1,
                              "commentby_n.lastname":1,
                              "commentby_n.profile":1
                            }
              }
          ]).then(function(findcommentofcomment)
          {
            // //console.log('commentofcomment:',findcommentofcomment)
            comment_likes.find({'commentid': comment.unique_id, 'likeby': req.body.loginid,'status': 1}).then(function(findupdatestatus){
              if(findupdatestatus != undefined && findupdatestatus.length > 0){
                findcomments[counter]['likestatus'] = 1;
              }
              comment_likes.find({'commentid': comment.unique_id, status:1}).then(function(findlikes){
                if(findlikes != undefined && findlikes.length > 0){
                  findcomments[counter]['likes'] = findlikes.length;
                }
                if(findcommentofcomment != undefined && findcommentofcomment.length > 0)
                {
                  // //console.log('in')
                  var counter1 = -1;
                  var arr=[];
                  asyncLoop(findcommentofcomment, function (comment1, next1)
                  {
                      counter1++;

                      findcommentofcomment[counter1]['likes']=0;
                      findcommentofcomment[counter1]['likestatus']=0;
                      findcommentofcomment[counter1]['parentcontent']=[];
                      comment_likes.find({'commentid': comment1.unique_id, 'likeby': req.body.loginid,'status': 1}).then(function(findupdatestatus1)
                      {
                        // //console.log('findupdatestatus1:')
                          if(findupdatestatus1 != undefined && findupdatestatus1.length > 0){
                              findcommentofcomment[counter1]['likestatus'] = 1;
                          }
                          comment_likes.find({'commentid': comment1.unique_id, status:1}).then(function(findlikes1){
                            // //console.log('findlikes1:')
                              if(findlikes1 != undefined && findlikes1.length > 0){
                                  findcommentofcomment[counter1]['likes'] = findlikes1.length;
                              }
                               post_comments.aggregate([
                                    { "$match":{'unique_id':comment1.replyid}},
                                    {
                                        $lookup:
                                        {
                                            from: "users",
                                            localField: "created_by",
                                            foreignField: "unique_id",
                                            as: "replyby"
                                        }
                                    },
                                    { "$unwind": "$replyby" },
                                    { "$project": {
                                                      "content":1,
                                                      "created_at":1,
                                                      "created_by":1,
                                                      "unique_id":1,
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
                                      findcommentofcomment[counter1]['parentcontent']=finparentcontent;
                                    }
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
                      arr.push(findcommentofcomment[counter1]);
                  }, function (err)
                  {
                        if (err)
                        {
                            console.error('Inner Error: ' + err.message);
                            next()
                        }
                        // //console.log('arr:',arr)
                        findcomments[counter]['commentofcomment'] = arr;
                         next();
                  });
                }
                else
                {
                  // //console.log('out')
                  next()
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
                    console.error('Inner Error: ' + err.message);
                }
                res.json(findcomments);
            });
    }
    else
    {
      res.json([]);
    }
  }).catch(function(error){
      res.json([]);
    });
}
//***********************************************************************************************************************************************************************************
exports.getAllresourceposts = function(req,res)
{
  ////console.log(req.body.loginid);
 // //console.log('tid-',req.body.seltags);
  const tags=db.get('tags');
  const postsdata= db.get('posts');
  ////console.log('input-',req.body.seltags)
//   if(req.body.seltags.length>0 || req.body.seltags=='')
if(req.body.seltags !== null || req.body.seltags=='' || req.body.seltags !== undefined)

  {
    ////console.log('if')
    var s_tag=[];
    finalarr=[];
    if(req.body.seltags=='')
    {
      var s_tag=[""];
      var cond={"posted_at": {"$lte": Date.now() },'deleted':false, "resourceid":true,"questionid":null}
    }
    else
    {
        if(Array.isArray(req.body.seltags)){
      req.body.seltags.forEach(function(sel)
      {
          s_tag.push(sel);
          var jj={"tags":new RegExp(sel, 'i')}
        finalarr.push(jj);

      })
    }else{
        s_tag.push(req.body.seltags);
          var jj={"tags":new RegExp(req.body.seltags, 'i')}
        finalarr.push(jj);
    }
      var cond={"posted_at": {"$lte": Date.now() },'deleted':false, "resourceid":true,"questionid":null,$and: finalarr }
    }
   // //console.log('s_tag-',s_tag)
    tags.find({ category_id : { $in: s_tag } },function(err, alltags)
    {
     // //console.log('alltags-',alltags)
      if(alltags!=undefined && alltags.length > 0 )
      {
        alltags.forEach(function(tagval)
        {
          if(tagval.category_id!='')
          s_tag.push(tagval.unique_id);
        })
      }
      else
      {

      }
     // //console.log('s_tag-',s_tag)
      //regex = s_tag.map(function (e) { return new RegExp(e, "i"); });
      /*finalarr=[];
      s_tag.forEach(function(regsel)
      {
          var jj={"tags":regsel}
        finalarr.push(jj);
      })*/
     // //console.log('hello',finalarr)
        postsdata.aggregate(
        [
          { "$match":cond},
          { "$sort": {"posted_at": -1}},
          { "$sort": {"_id": -1}},
         // { "$limit" : 20 },
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
          { "$project":
              {
                  "content":1,
                  "questionid":1,
                  "pollid":1,
                  "articleid":1,
                  "tags":1,
                  "resourceid":1,
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
        ]).then(function(getPosts)
        {
            if(getPosts.length > 0)
            {
              var counter = -1;
              const post_likes= db.get('post_likes');
              const post_comments= db.get('comments');
              const tags= db.get('tags');
              const categories= db.get('categories');
              const questions= db.get('questions');
              const polls= db.get('polls');
              const pollsoptions= db.get('polls_options');
              const authors= db.get('users');
              const article_sections= db.get('article_sections');
              const post_saves= db.get('post_saves');
              const question_options= db.get('question_options');
              const question_answers= db.get('question_answers');
              asyncLoop(getPosts, async function (post, next)
              {
                  counter++
                  getPosts[counter]['likestatus'] = 0;
                  getPosts[counter]['likes'] = 0;
                  getPosts[counter]['dislikes'] = 0;
                  getPosts[counter]['alltags'] = [];
                  getPosts[counter]['polldata'] = {};
                  getPosts[counter]['polloptions'] = [];
                  getPosts[counter]['questiondata'] = {};
                  getPosts[counter]['articledata'] = {};
                  getPosts[counter]['questionoptions'] = [];
                  getPosts[counter]['allcomments'] = [];
                  getPosts[counter]['allsaveposts'] = 0;
                  getPosts[counter]['questionanswer']=[];
                  getPosts[counter]['answercheck']=false;
                  getPosts[counter]['refPost']=[];
                  getPosts[counter]['resourceidstatus']=false;
                   // to extract video url
                   getPosts[counter]['videoUrl'] = [];
                   getPosts[counter]['imageUrl'] = [];


                   if(post.content){
                       function urlify(text) {
                           var urlRegex = /(<iframe.+?<\/iframe>)/g;
                           let data = text.match(urlRegex);
                           return data;
                       }

                       var html = urlify(post.content);
                       if(html == null){
                        getPosts[counter]['videoUrl'] = []
                    } else{
                        getPosts[counter]['videoUrl'] = html
                    }
                   }

                   // to extract image url
                   let arrayFilled  = false

                   if (post.content !== null){
                       async function urlify(text) {
                           var urlRegex = /<img [^>]*src="[^"]*"[^>]*>/gm;
                           let data = text.match(urlRegex);
                           return data
                       }
                       var html = await urlify(post.content);
                       if(html == null){
                           getPosts[counter]['imageUrl'] = []
                       } else{
                           getPosts[counter]['imageUrl'] = html
                       }

                   }


                  if(post.parentid!==null)
                  {
                      postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                        {
                           // //console.log(refuser)
                            refPostdata.refusers=refuser
                        })
                        getPosts[counter]['refPost'] = refPostdata;
                      })
                  }
                  else { ////console.log("noparentid");
                 }
                  if(post.resourceid)
                  {
                      getPosts[counter]['resourceidstatus']=post.resourceid;
                  }
                  else {
                     getPosts[counter]['resourceidstatus']=false;
                  }
                  if(post.tags)
                  {
                      var taguniqs = post.tags.split(",");
                      ////console.log("taguniqs- ",taguniqs);

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
                      ////console.log("notags");

                  }
                  if(post.questionid){

                      questions.findOne({'_id': post.questionid}).then(function(findquestion){

                          if(findquestion != null){
                              getPosts[counter]['questiondata'] = findquestion;
                              var qid=findquestion._id.toString();
                              question_options.find({'questionid': qid}).then(function(findqoptions){
                                 // //console.log(findqoptions)
                          if(findqoptions != undefined && findqoptions.length > 0){
                              getPosts[counter]['questionoptions'] = findqoptions;


                          }else{
                             // //console.log("nooptions");
                          }

                      })
                      question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                         // //console.log(findanswer)
                  if(findanswer != undefined && findanswer.length > 0){
                      getPosts[counter]['questionanswer'] = findanswer;
                      //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                      getPosts[counter]['answercheck']=true;


                  }else{
                      ////console.log("nooptions");
                  }

              })

                          }
                      })
                  } else {
                      ////console.log("noquestion");

                  }
                  if(post.articleid){

                      article_sections.aggregate([
                          { "$match":{'articleid': post.articleid,'a_order':1}},
                          { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                          {
                              $lookup:
                                  {
                                      from: "articles",
                                      localField: "artid",
                                      foreignField: "_id",
                                      as: "articaldata"
                                  }
                          },
                          { "$unwind": "$articaldata" },
                          { "$project": {
                              "articleid":1,
                              "uploaded_file":1,
                              "section_uploaded_file":1,
                              "article_content":1,
                              "articaldata.author_name":1,
                              "articaldata.a_title":1

                          }
                      }
                      ]).then(function(findarticle){

                          if(findarticle != null){
                              if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                  findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                  }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                  findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                  }else{
                                  findarticle[0].uploaded_file=[];
                                  }
                              findarticle[0].partcontent=findarticle[0].article_content;
                              authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                  findarticle[0].author=findauthor;

                              }).catch(function(error){
                              ////console.log('author not find')
                              findarticle[0].author=null;
                              });
                              getPosts[counter]['articledata'] = findarticle;
   }
                      })
                  } else {
                      ////console.log("no article");

                  }
                  if(post.pollid)
                  {
                    polls.findOne({'_id': post.pollid}).then(function(findpoll)
                    {
                      if(findpoll != null)
                      {
                        getPosts[counter]['polldata'] = findpoll;
                        var qid=findpoll._id.toString();
                        pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                        {
                          ////console.log(findpoptions)
                          if(findpoptions != undefined && findpoptions.length > 0)
                          {
                              getPosts[counter]['polloptions'] = findpoptions;
                          }
                          else{ ////console.log("nooptions");
                         }
                        })
                      }
                    })
                  } else {
                      ////console.log("no poll");
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
            }//if
            else
            {
              res.json([]);
            }
        });  //end of getPosts
      // res.json(s_tag)
    });//tags
  }
  else
  {
    ////console.log('else')
    res.json([])
  }

}

//*********************************************************************************************************************************************************************
exports.getDefaultResourcePosts = function(req,res){
    ////console.log(req.body.loginid);

    const postsdata= db.get('posts');
    postsdata.aggregate([
       { "$match":{"posted_at": {"$lte": Date.now() }, "questionid":null, "resourceid":true }},
        {"$sort": {"posted_at": -1}},
        {"$sort": {"_id": -1}},

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
                     "pollid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
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
         ]).then(async function(getPosts){
             var counter = -1;
            const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const tags= db.get('tags');
            const categories= db.get('categories');
            const questions= db.get('questions');
            const polls= db.get('polls');
            const pollsoptions= db.get('polls_options');
            const authors= db.get('users');
            const article_sections= db.get('article_sections');
            const post_saves= db.get('post_saves');
            const question_options= db.get('question_options');
            const question_answers= db.get('question_answers');
            asyncLoop(getPosts, async function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['polldata'] = {};
                getPosts[counter]['polloptions'] = [];
                getPosts[counter]['questiondata'] = {};
                getPosts[counter]['articledata'] = {};
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                getPosts[counter]['refPost']=[];
                getPosts[counter]['resourceidstatus']=false;
                // to extract video url
                getPosts[counter]['videoUrl'] = [];
                getPosts[counter]['imageUrl'] = [];


                if(post.content){
                    function urlify(text) {
                        var urlRegex = /(<iframe.+?<\/iframe>)/g;
                        let data = text.match(urlRegex);
                        return data;
                    }

                    var html = await urlify(post.content);
                    if(html == null){
                     getPosts[counter]['videoUrl'] = []
                 } else{
                     getPosts[counter]['videoUrl'] = html
                 }
                }

                // to extract image url
                let arrayFilled  = false

                if (post.content !== null){
                    async function urlify(text) {
                        var urlRegex = /<img [^>]*src="[^"]*"[^>]*>/gm;
                        let data =  text.match(urlRegex);
                        return data
                    }
                    var html =  await urlify(post.content);
                    if(html == null){
                        getPosts[counter]['imageUrl'] = []
                    } else{
                        getPosts[counter]['imageUrl'] = html
                    }

                }

                if(post.parentid!==null)
                {
                    postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                      {
                         // //console.log(refuser)
                          refPostdata.refusers=refuser
                      })
                      getPosts[counter]['refPost'] = refPostdata;
                    })
                }
                else { ////console.log("noparentid");
             }
                if(post.resourceid)
                {
                    getPosts[counter]['resourceidstatus']=post.resourceid;
                }
                else {
                   getPosts[counter]['resourceidstatus']=false;
                }
                if(post.tags)
                {
                    var taguniqs = post.tags.split(",");
                    ////console.log("taguniqs- ",taguniqs);

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
                    ////console.log("notags");

                }
                if(post.questionid){

                    questions.findOne({'_id': post.questionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();
                            question_options.find({'questionid': qid}).then(function(findqoptions){
                               // //console.log(findqoptions)
                        if(findqoptions != undefined && findqoptions.length > 0){
                            getPosts[counter]['questionoptions'] = findqoptions;


                        }else{
                            ////console.log("nooptions");
                        }

                    })
                    question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        ////console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                   // //console.log("nooptions");
                }

            })

                        }
                    })
                } else {
                   // //console.log("noquestion");

                }
                if(post.articleid){

                    article_sections.aggregate([
                        { "$match":{'articleid': post.articleid,'a_order':1}},
                        { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                        {
                            $lookup:
                                {
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                                }
                        },
                        { "$unwind": "$articaldata" },
                        { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                        }
                    }
                    ]).then(function(findarticle){

                        if(findarticle != null){
                            if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                }else{
                                findarticle[0].uploaded_file=[];
                                }
                            findarticle[0].partcontent=findarticle[0].article_content;
                            authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                findarticle[0].author=findauthor;

                            }).catch(function(error){
                            ////console.log('author not find')
                            findarticle[0].author=null;
                            });
                            getPosts[counter]['articledata'] = findarticle;
 }
                    })
                } else {
                    ////console.log("no article");

                }
                if(post.pollid)
                {
                  polls.findOne({'_id': post.pollid}).then(function(findpoll)
                  {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                       // //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{ ////console.log("nooptions");
                     }
                      })
                    }
                  })
                } else {
                   // //console.log("no poll");
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
    });
}
//*********************************************************************************************************************************************************************
exports.multiTopics = function(req,res)
{
  ////console.log(req.body.loginid);
  ////console.log('hashtag-',req.body.hashtag);
  ////console.log('range-',Number(req.body.range));
  const tags=db.get('tags');
  const postsdata= db.get('posts');
  const categories= db.get('categories');

  var str=[];
  var s_tag=[];
  str.push(req.body.hashtag);
  str.push(req.body.hashtag.replace(/_/g," "));
  ////console.log(str);

  tags.find({ tagname : { $in: str } },function(err, alltags)
// tags.find({ tagname : str },function(err, alltags)

  {
    if(alltags!=undefined && alltags.length > 0 )
    {
      alltags.forEach(function(tagval)
      {
          if(tagval.category_id!='')
            s_tag.push(tagval.unique_id);
      })
    }
    else
    {
      categories.find({ categoryname : { $in: str } },function(err, allcategories)
      {
        if(allcategories!=undefined && allcategories.length > 0 )
        {
          allcategories.forEach(function(catgval)
          {
              if(catgval.category_id!='')
                s_tag.push(catgval.unique_id);
          })
        }
      });
    }
    regex = s_tag.map(function (e) { return new RegExp(e, "i"); });
    strregex = str.map(function (e) { return new RegExp(e, "i"); });
    // //console.log('regex-',regex)
    // //console.log('regex-',strregex)

    postsdata.aggregate([
      { "$match":{'deleted':false,$or: [{ "tags": {"$in" : regex } }, {"searchcontent":{"$in" : strregex }} ] }},
      { "$sort": {"posted_at": -1}},
      { "$limit" : Number(req.body.range) },
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
                     "searchcontent":1,
                     "questionid":1,
                     "questiontype":1,
                     "childquestionid":1,
                     "pollid":1,
                     "eventid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
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
      ]).then(function(getPosts)
      {
        // //console.log('getposts-',getPosts)
        if(getPosts.length > 0)
        {
          var counter = -1;
          const post_likes= db.get('post_likes');
          const post_comments= db.get('comments');
          const categories= db.get('categories');
          const tags= db.get('tags');
          const questions= db.get('questions');
          const casequestions= db.get('casequestions');
          const polls= db.get('polls');
          const pollsoptions= db.get('polls_options');
          const pollssubmit= db.get('polls_submitions');
          const authors= db.get('users');
          const article_sections= db.get('article_sections');
          const post_saves= db.get('post_saves');
          const question_options= db.get('question_options');
          const question_answers= db.get('question_answers');
          const casequestion_answers= db.get('casequestion_answers');
          const case_comments= db.get('case_comments')
          asyncLoop(getPosts, function (post, next)
          {
            counter++
            getPosts[counter]['likestatus'] = 0;
            getPosts[counter]['likes'] = 0;
            getPosts[counter]['dislikes'] = 0;
            getPosts[counter]['alltags'] = [];
            getPosts[counter]['pollactive'] = true;
            getPosts[counter]['polldata'] = {};
            getPosts[counter]['polloptions'] = [];
            getPosts[counter]['pollrescount'] = 0;
            getPosts[counter]['mypollans'] = '';
            getPosts[counter]['questiondata'] = {};
            getPosts[counter]['articledata'] = {};
            getPosts[counter]['questionoptions'] = [];
            getPosts[counter]['allcomments'] = [];
            getPosts[counter]['allsaveposts'] = 0;
            getPosts[counter]['questionanswer']=[];
            getPosts[counter]['answercheck']=false;
            getPosts[counter]['answercount']=0;
            getPosts[counter]['refPost']=[];
            getPosts[counter]['resourceidstatus']=false;
            if(post.parentid!==null)
            {
                postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                {
                  if(refPostdata!=null)
                  {
                    authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                    {
                        refPostdata.refusers=refuser;
                    })
                    getPosts[counter]['refPost'] = refPostdata;
                  }
                })
            }
            else { //console.log("noparentid");
         }
            if(post.resourceid)
            {   getPosts[counter]['resourceidstatus']=post.resourceid;  }
            else { getPosts[counter]['resourceidstatus']=false; }
            if(post.tags)
            {
                var taguniqs = post.tags.split(",");
                if(post.questionid!==null && post.questionid!==''){
                  var condfortag={'unique_id' : { $in : taguniqs } ,'questionvisible':true}
                }
                else{
                    var condfortag={'unique_id' : { $in : taguniqs } }
                }
                categories.aggregate([
                  {$match:condfortag},
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
                  tags.find(condfortag).then(function(getTags)
                  {
                      var alltags=getCategories.concat(getTags);
                      if(alltags != undefined && alltags.length > 0)
                      {  getPosts[counter]['alltags'] = alltags;  }
                  });
                });
            }
            else
            {  //console.log("notags");
         }
            if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14' && post.childquestionid==null)
            {
                //console.log('this is if');
                casequestions.findOne({'q_order': 1,'parentqid':post.questionid}).then(function(findquestion)
                {
                  if(findquestion != null)
                  {
                    getPosts[counter]['questiondata'] = findquestion;
                    var qid=findquestion._id.toString();
                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
                    {
                      if(findanswer != undefined && findanswer.length > 0)
                      {
                        getPosts[counter]['questionanswer'] = findanswer;
                        getPosts[counter]['answercheck']=true;
                      }
                      else
                      { //console.log("nooptions");
                    }
                    })
                    case_comments.find({'parentqid': post.questionid}).then(function(findcommentd)
                    {
                      if(findcommentd != undefined && findcommentd.length > 0)
                      { getPosts[counter]['allcomments'] = findcommentd;  }
                      else{ //console.log("nooptions");
                     }
                    })
                    casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer)
                    {
                      if(findcountanswer != undefined && findcountanswer.length > 0)
                      { getPosts[counter]['answercount']=findcountanswer.length;  }
                      else{ //console.log("nooptions");
                     }
                    })
                  }
                })
            }
            else if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14')
            {
                casequestions.findOne({'_id': post.childquestionid}).then(function(findquestion)
                {
                  if(findquestion != null)
                  {
                      getPosts[counter]['questiondata'] = findquestion;
                      var qid=findquestion._id.toString();
                      casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
                      {
                        if(findanswer != undefined && findanswer.length > 0)
                        {
                          getPosts[counter]['questionanswer'] = findanswer;
                          getPosts[counter]['answercheck']=true;
                        }
                        else
                        { //console.log("nooptions");
                    }
                      })
                      case_comments.find({'parentqid': post.questionid}).then(function(findcommentd)
                      {
                        if(findcommentd != undefined && findcommentd.length > 0)
                        { getPosts[counter]['allcomments'] = findcommentd; }
                        else
                        {  //console.log("nooptions");
                     }
                      })
                      casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer)
                      {
                        if(findcountanswer != undefined && findcountanswer.length > 0)
                        { getPosts[counter]['answercount']=findcountanswer.length; }
                        else{ //console.log("nooptions");
                    }
                      })
                  }
                })
            }
            else if(post.questionid)
            {
                questions.findOne({'_id': post.questionid}).then(function(findquestion)
                {
                  if(findquestion != null)
                  {
                    getPosts[counter]['questiondata'] = findquestion;
                    var qid=findquestion._id.toString();
                    question_options.find({'questionid': qid}).then(function(findqoptions)
                    {
                        if(findqoptions != undefined && findqoptions.length > 0)
                        { getPosts[counter]['questionoptions'] = findqoptions;  }
                        else{ //console.log("nooptions");
                    }
                    })
                    question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
                    {
                      if(findanswer != undefined && findanswer.length > 0)
                      {
                        getPosts[counter]['questionanswer'] = findanswer;
                        getPosts[counter]['answercheck']=true;
                      }
                      else{ //console.log("nooptions");
                    }
                    })
                    question_answers.find({'questionid': qid}).then(function(findcountanswer)
                    {
                      if(findcountanswer != undefined && findcountanswer.length > 0)
                      { getPosts[counter]['answercount']=findcountanswer.length; }
                      else{ //console.log("nooptions");
                    }
                    })
                  }
                })
            }
            else
            { //console.log("noquestion");
         }
            if(post.articleid)
            {
                article_sections.aggregate([
                  { "$match":{'articleid': post.articleid,'a_order':1}},
                  { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                  { $lookup:
                          {
                                      from: "articles",
                                      localField: "artid",
                                      foreignField: "_id",
                                      as: "articaldata"
                          }
                  },
                  { "$unwind": "$articaldata" },
                  { "$project": {
                              "articleid":1,
                              "uploaded_file":1,
                              "section_uploaded_file":1,
                              "article_content":1,
                              "articaldata.author_name":1,
                              "articaldata.a_title":1
                          }
                  }
                ]).then(function(findarticle)
                {
                  if(findarticle != null){
                    if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                      findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                    }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                      findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                    }else{
                          findarticle[0].uploaded_file=[];
                    }
                    findarticle[0].partcontent=findarticle[0].article_content;
                    authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                      findarticle[0].author=findauthor;
                    }).catch(function(error){
                        //console.log('author not find')
                        findarticle[0].author=null;
                      });
                    getPosts[counter]['articledata'] = findarticle;
                  }
                })
            }
            else
            {
                //console.log("no article");
                post.articleid=null;
            }
            if(post.pollid)
            {
                polls.findOne({'_id': post.pollid, "endDays": {"$gt": Date.now() }}).then(function(findpoll)
                {
                  if(findpoll != null)
                  {
                    getPosts[counter]['polldata'] = findpoll;
                    var qid=findpoll._id.toString();
                    pollssubmit.findOne({'pollid':qid, 'created_by':req.body.loginid }).then(function(finduserpollans)
                    {
                      if(finduserpollans!=null)
                          getPosts[counter]['mypollans'] = finduserpollans.optionid;
                    })
                    pollssubmit.find({'pollid': qid, 'postid':post.unique_id}).then(function(allpollres)
                    {
                      getPosts[counter]['pollrescount'] = allpollres.length;
                    });
                    pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                    {
                      if(findpoptions != undefined && findpoptions.length > 0)
                      {
                              findpoptions.forEach(function(poption,index)
                              {
                                  var optid=poption._id.toString();
                                  pollssubmit.find({'pollid':qid, 'optionid': optid}).then(function(findoptioncount)
                                  {
                                    if(findoptioncount.length > 0)
                                    {
                                      var c1 = (findoptioncount.length*100)/getPosts[counter]['pollrescount'];
                                      // //console.log('c1-',c1)
                                      if(c1!=Infinity)
                                      {
                                        poption.count=Number(c1).toFixed(2);
                                      }
                                      else
                                      {
                                        poption.count=0;
                                      }
                                    }
                                    else{poption.count=0;}
                                  })
                              });
                              getPosts[counter]['polloptions'] = findpoptions;
                      }
                      else{ //console.log("nooptions");
                     }
                    })
                  }
                  else
                  {
                      getPosts[counter]['pollactive'] = false;
                      postsdata.findOneAndUpdate({'pollid':post.pollid},{ $set: {'deleted':true}}).then(function(updatepollstatus)
                      {
                          //console.log('poll deactivated')
                      });
                  }
                })
            }
            else
            { //console.log("no poll");
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
                        if(post.questiontype!='5d15fea98edfed6c417592d14'){
                            getPosts[counter]['allcomments'] = findcomments;
                        }
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
              }
              res.json(getPosts);
          });
        }
        else
        {
          res.json(getPosts);
        }
      });//end of getPosts
      // res.json(s_tag)
    });//tags
}
//*********************************************************************************************************************************************************************
exports.getPostlikers = function(req,res){
    // //console.log(req.body.postid);

    const post_likes= db.get('post_likes');
    post_likes.aggregate([
        { "$match":{'postid': req.body.postid,'status':1}},
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
exports.getCommentlikers = function(req,res){
    // //console.log(req.body.commentid);

    const comment_likes= db.get('comment_likes');
    comment_likes.aggregate([
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
exports.getTagDataTable = function(req,res){
    const tagsdata= db.get('tags');
    const cat=db.get('categories');

        tagsdata.aggregate([

        {"$sort": {"_id": 1}},
          {
              $lookup:
                  {
                      from: "categories",
                      localField: "category_id",
                      foreignField: "unique_id",
                      as: "topicsubtopic"
                  }
          },

                  { "$project": {
                      "created_at":1,
                      "unique_id":1,
                      "tagname":1,
                      "topicsubtopic.categoryname":1


                  }
          }
          ]).then(function(topicsubtopic){
            res.json(topicsubtopic);

}).catch(function(error){
    res.json([]);
});

}
exports.getAlltags = function(req,res){
    const tagsdata= db.get('tags');
    tagsdata.find({},{sort:{'tagname':1}}).then(function(getTags)
    {
    	var finaltags=getTags.sort(function(a, b)
        {
            var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
            if (nameA < nameB) //sort string ascending
                return -1
            if (nameA > nameB)
                return 1
            return 0 //default return value (no sorting)
        })
        res.json(finaltags);
 	});

}

exports.getAllcategory = function(req,res){
    const categorysdata = db.get('categories');

    let searchCategory = req.body.searchCategory

    if (searchCategory == null || searchCategory == ""){
        res.json([])
    } else{
        let data = {$match: {'categoryname' : new RegExp(req.body.searchCategory, 'i')} }

        categorysdata.aggregate([data])
        .then(function(getCategories)
        {
            var finaltopics=getCategories.sort(function(a, b)
            {
                var nameA=a.categoryname.toLowerCase(), nameB=b.categoryname.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            res.json(finaltopics);
        });
    }
}


exports.getAllPermitedquestiontypes = function(req,res){
    const question_types= db.get('question_types');
    const caplabels= db.get('capabilitylables');
    caplabels.findOne({"unique_id": "5d8f46fe8532fa312822c887"}).then(function(getlabels)
    {
        if(getlabels.rolevalue.split(',').indexOf(req.body.roleid)>=0){
            caplabels.findOne({"unique_id": "5df9c2bb5f61211833be8da1"}).then(function(getuserlabels)
            {
                if(getuserlabels.rolevalue.split(',').indexOf(req.body.roleid)>=0){
                    question_types.find({}).then(function(getQuestion_types){
                        res.json(getQuestion_types);
                    });
                }else{
                    question_types.find({"unique_id":{$ne:'5d15fea98edfed6c417592d16'}}).then(function(getQuestion_types){
                        res.json(getQuestion_types);
                    });
                }

            }).catch(function(error){
                question_types.find({"unique_id":{$ne:'5d15fea98edfed6c417592d16'}}).then(function(getQuestion_types){
                    res.json(getQuestion_types);
                });
            });
        }else{
            caplabels.findOne({"unique_id": "5df9c2bb5f61211833be8da1"}).then(function(getuserlabels)
            {
                if(getuserlabels.rolevalue.split(',').indexOf(req.body.roleid)>=0){
                    question_types.find({"unique_id":"5d15fea98edfed6c417592d16"}).then(function(getQuestion_types){
                        res.json(getQuestion_types);
                    });
                }else{
                    res.json([])
                }

            }).catch(function(error){
                res.json([])
            });
        }

    }).catch(function(error){
        res.json([])
    });
}
exports.getAllquestiontypes = function(req,res){
    const question_types= db.get('question_types');
   question_types.find({}).then(function(getQuestion_types){
                        res.json(getQuestion_types);
                    });

}

exports.getAllcolleges = function(req,res){
    const colleges= db.get('colleges');
    colleges.find({}).then(function(getColleges){
        res.json(getColleges);
    });

}
exports.getAlldomain = function(req,res){
    const categories= db.get('tags');
    categories.find({"category_id": '5d3587222769b02a2439de25'}).then(function(getCategories){
        res.json(getCategories);
    });

}
exports.getAllicpc2 = function(req,res){
    const categories= db.get('tags');
    categories.find({"category_id": '5d3566175d35071c1a7e2db7'}).then(function(getCategories){
        res.json(getCategories);
    });

}
exports.getAllgender = function(req,res){
    const categories= db.get('tags');
    categories.find({"category_id": '5d31b4c114f66528d55d0523'}).then(function(getCategories){
        res.json(getCategories);
    });

}
exports.getAllagerange = function(req,res){
    const categories= db.get('tags');
    categories.find({"category_id": '5d3565f15d35071c1a7e2db5'}).then(function(getCategories){
        res.json(getCategories);
    });

}
exports.getAllSliderimages = function(req,res){
    const slidersdata= db.get('slider_settings');
    slidersdata.find({}).then(function(getSloiders){
        res.json(getSloiders);
    });

}
exports.getalllibimages = function(req,res){
    const libimgdata= db.get('image_library');
    libimgdata.find({}).then(function(getLibimgs){
        res.json(getLibimgs);
    });

}
exports.getAlllibraryimages = function(req,res){
    const libimgdata= db.get('image_libraries');
    libimgdata.find({}).then(function(getLibimgs){
        res.json(getLibimgs);
    });

}
exports.getAlldefaultimages = function(req,res){
    const defaultImages= db.get('default_images');
    defaultImages.find({}).then(function(getDefaultimages){
        res.json(getDefaultimages);
    });

}
exports.getEditCategory = function(req,res){
    //  //console.log(req.body.id);
    const categories= db.get('categories');
    categories.find({"unique_id": req.body.id}).then(function(getCategories){
        res.json(getCategories);
    });

}
exports.getUpdateCategory = function(req,res){
    //  //console.log(req.body.id);
    const cat= db.get('categories');
     cat.findOneAndUpdate(
                {'unique_id':req.body.id},
           { $set: {'created_by':req.body.createdby,'categoryname':req.body.name,
                   'available':req.body.avail,'studyplan':req.body.studypln,'resources':req.body.resources,'questionvisible':req.body.visible }
           }
                ).then(function(updatemodule){

        res.json(updatemodule);
    });

}
//*****************************************************************************
exports.availTopicnSubtopic = function(req,res)
{
  const categories= db.get('categories');
    const tagsdata= db.get('tags');
    categories.aggregate([
        {$match:{"available":true}},
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
    ]).then(function(getResCategories)
    {
        tagsdata.find({'available':true}).then(function(getTags)
        {
            var allres=getResCategories.concat(getTags);
            var finaltopics=allres.sort(function(a, b)
            {
                var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            res.json(finaltopics);
        });
    });
}
//*****************************************************************************
exports.getAddRestags = function(req,res){
    // //console.log(req.body.searchedtag);
    const categories= db.get('categories');
    const tagsdata= db.get('tags');
    if(req.body.searchedtag==null || req.body.searchedtag=='')
    {
        categories.aggregate([
            {$match:{"resources":true}},
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
        ]).then(function(getResCategories)
        {
          tagsdata.find({'resources':true}).then(function(getTags)
          {
              var allres=getResCategories.concat(getTags);
              var finaltopics=allres.sort(function(a, b)
              {
                  var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
                  if (nameA < nameB) //sort string ascending
                      return -1
                  if (nameA > nameB)
                      return 1
                  return 0 //default return value (no sorting)
              })
              res.json(finaltopics);
          });
        });
    }
    else
    {
      var search_tag = req.body.searchedtag.trim();
        categories.aggregate([
            {$match:{ 'categoryname': new RegExp(search_tag, 'i') } },
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
        ]).then(function(getResCategories)
        {
          tagsdata.aggregate([
            {$match:  { 'tagname': new RegExp(search_tag, 'i') }  },

            // {$match:{'resources':true,'tagname' : new RegExp(search_tag, 'i')}},
            { "$project": {
                         "_id":1,
                         "tagname":1,
                         "available":1,
                         "studyplan":1,
                         "resources":1,
                         "created_by":1,
                         "created_at":1,
                         "unique_id":1
                        }
            }
          ]).then(function(getTags)
            {
            //   //console.log(getTags.length)
              if(getTags.length == 0)
              {
                //console.log('if')
                tagsdata.find({}).then(function(getTags1)
                {

                  var allres=getResCategories.concat(getTags1);
                //   //console.log('allres',allres)
                  var finaltopics=allres.sort(function(a, b)
                  {
                      var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
                      if (nameA < nameB) //sort string ascending
                          return -1
                      if (nameA > nameB)
                          return 1
                      return 0 //default return value (no sorting)
                  })
                      res.json([]);
                })
              }
              else
              {
                //console.log('else')
                var allres=getResCategories.concat(getTags);
                // //console.log('allres',allres)
                  var finaltopics=allres.sort(function(a, b)
                  {
                      var nameA=a.tagname.toLowerCase(),nameB=b.tagname.toLowerCase(),nameC=search_tag.toLowerCase()
                      if (nameA.indexOf(nameC) < nameB.indexOf(nameC)) //sort string ascending
                          return -1
                      if (nameA.indexOf(nameC) > nameB.indexOf(nameC))
                          return 1
                      return 0 //default return value (no sorting)
                  })
                      res.json(finaltopics);
              }

            });
        });
    }
}
exports.getEditTags = function(req,res){
    //  //console.log(req.body.id);
    const tags= db.get('tags');
    const cat=db.get('categories');
    tags.find({"unique_id": req.body.id}).then(function(getTags){
        res.json(getTags);
  });

}

exports.getOneSlider = function(req,res)
{
  const slider = db.get('slider_settings');
  slider.find({"unique_id": req.body.id}).then(function(getslider)
  {
    //console.log('slider-',getslider)
        res.json(getslider);
  });
}

exports.editSliderImage = function(req,res)
{
    // //console.log(req.body.id);
    // //console.log(req.body.imagelink);
    // //console.log(req.body.linkurl);
    // res.json('done')
    slider = db.get('slider_settings');
    slider.findOneAndUpdate({'unique_id':req.body.id},
      { $set: {'image_link':req.body.imagelink,'linkurl':req.body.linkurl }}).then(function(editedslider){
        res.json(editedslider);
    });

}

exports.getEditTagcategory = function(req,res){
    //  //console.log(req.body.id);

    const cat=db.get('categories');
    cat.find({"unique_id": req.body.id}).then(function(gettags){
        res.json(gettags);
  });

}
exports.getUpdateTags = function(req,res){
    //  //console.log(req.body.id);
    const datatags= db.get('tags');
     datatags.findOneAndUpdate(
                {'unique_id':req.body.id},
           { $set: {'created_by':req.body.createdby,'category_id':req.body.catname,'available':req.body.avail,'studyplan':req.body.studypln,'tagname':req.body.tagname, 'resources':req.body.resources, 'questionvisible':req.body.visible}
           }
                ).then(function(updatetags){

        res.json(updatetags);
    });

}
exports.saveTagsSelected = function(req,res){
    //  //console.log(req.body.id);
    const resettags= db.get('reset_tags');
//    resettags.insert({
//                'unique_id':req.body.tag_id,
//
//                'tagname':req.body.tag_name,
//                'created_by': req.body.createdby,
//
//            }

     resettags.findOneAndUpdate(
                {"_id":"5d47fe2c860b2c5a73b95d67"},
           { $push: {unique_id:{ $each:req.body.tag_id,$slice: -10 },
                   tagname:{ $each:req.body.tag_name,$slice: -10 }
                   }

           }

                ).then(function(updatetags){

        res.json(updatetags);
    });

}
//*************************************************************************************************************************************
exports.getOnePosts = function(req,res)  //
{
    // //console.log(req.body.loginid);
    // //console.log(req.body.post_id);

    const postsdata= db.get('posts');
    postsdata.aggregate([
        { "$match":{"unique_id": req.body.post_id }},
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
                     "searchcontent":1,
                     "questionid":1,
                     "pollid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
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
    ]).then(function(getPosts)
    {
        var counter = -1;
        const post_likes= db.get('post_likes');
        const post_comments= db.get('comments');
        const tags= db.get('tags');
        const categories= db.get('categories');
        const questions= db.get('questions');
        const polls= db.get('polls');
        const pollsoptions= db.get('polls_options');
        const authors= db.get('users');
        const article_sections= db.get('article_sections');
        const post_saves= db.get('post_saves');
        const question_options= db.get('question_options');
        const question_answers= db.get('question_answers');
        asyncLoop(getPosts, function (post, next)
        {
          counter++
          getPosts[counter]['likestatus'] = 0;
          getPosts[counter]['likes'] = 0;
          getPosts[counter]['dislikes'] = 0;
          getPosts[counter]['alltags'] = [];
          getPosts[counter]['polldata'] = {};
          getPosts[counter]['polloptions'] = [];
          getPosts[counter]['questiondata'] = {};
          getPosts[counter]['articledata'] = {};
          getPosts[counter]['questionoptions'] = [];
          getPosts[counter]['allcomments'] = [];
          getPosts[counter]['allsaveposts'] = 0;
          getPosts[counter]['questionanswer']=[];
          getPosts[counter]['answercheck']=false;
          getPosts[counter]['answercount']=0;
          getPosts[counter]['refPost']=[];
          getPosts[counter]['resourceidstatus']=false;
          getPosts[counter]['tempcontent']=null;
          getPosts[counter]['temppostfile']=null;
          // getPosts[counter]['tempvideofile']=null;
          if(post.content!=null)
          {
            if(post.content.toLowerCase().indexOf(".doc") >= 0 || post.content.toLowerCase().indexOf(".docx") >= 0 || post.content.toLowerCase().indexOf(".xls") >= 0 || post.content.toLowerCase().indexOf(".xlsx") >= 0 || post.content.toLowerCase().indexOf(".ppt") >= 0 || post.content.toLowerCase().indexOf(".pptx") >= 0 || post.content.toLowerCase().indexOf(".csv") >= 0 || post.content.toLowerCase().indexOf(".csvx") >= 0 )
            {
              //console.log('DOCUMENT')
              var str=post.content
              var p = str.split('<div ');
              getPosts[counter]['tempcontent'] = p[0]
              var str=p[1]
              var n = str.split('file=');
              var m = n[1].split('target=');
              getPosts[counter]['temppostfile']=m[0].replace(/"/g,"")
            }
            else if(post.content.toLowerCase().indexOf(".png") >= 0 || post.content.toLowerCase().indexOf(".jpg") >= 0 || post.content.toLowerCase().indexOf(".gif") >= 0 || post.content.toLowerCase().indexOf(".bmp") >= 0 || post.content.toLowerCase().indexOf(".jpeg") >= 0 )
            {
              //console.log('IMAGE')
              var str=post.content
              var p = str.split('<div ');
              getPosts[counter]['tempcontent']= p[0]
              var str=p[1]
              var n = str.split('file=');
              var m = n[1].split('target=');
              getPosts[counter]['temppostfile']=m[0].replace(/"/g,"")
            }
            else if(post.content.toLowerCase().indexOf("<iframe") >= 0 )
            {
              //console.log('Video')
              var str=post.content
              var p = str.split('<iframe ');
              getPosts[counter]['tempcontent']=( p[0]);
              var str=p[1]
              var res = "<iframe ";
              getPosts[counter]['temppostfile']=res.concat(str);
            }
            else
            {
              //console.log('TEXT')
              getPosts[counter]['tempcontent'] = post.content
            }

          }
          if(post.parentid!==null)
          {
              postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
              {
                      authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                      {
                        //   //console.log(refuser)
                          refPostdata.refusers=refuser
                      })
                      getPosts[counter]['refPost'] = refPostdata;
              })
          }
          else { //console.log("noparentid");
        }
          if(post.resourceid)
          { getPosts[counter]['resourceidstatus']=post.resourceid; }
          else
          { getPosts[counter]['resourceidstatus']=false; }
          if(post.tags)
          {
              var taguniqs = post.tags.split(",");
            //   //console.log("taguniqs- ",taguniqs);
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
          }
          else { //console.log("notags");
        }
          if(post.questionid)
          {
              questions.findOne({'_id': post.questionid}).then(function(findquestion)
              {
                  if(findquestion != null)
                  {
                      getPosts[counter]['questiondata'] = findquestion;
                      var qid=findquestion._id.toString();
                      question_options.find({'questionid': qid}).then(function(findqoptions){
                        //   //console.log(findqoptions)
                          if(findqoptions != undefined && findqoptions.length > 0){
                            getPosts[counter]['questionoptions'] = findqoptions;
                          }
                          else{  //console.log("nooptions");
                        }
                      })
                      question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        // //console.log(findanswer)
                        if(findanswer != undefined && findanswer.length > 0){
                          getPosts[counter]['questionanswer'] = findanswer;
                          //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                          getPosts[counter]['answercheck']=true;
                        }
                        else{ //console.log("nooptions");
                     }
                      })
                      question_answers.find({'questionid': qid}).then(function(findcountanswer){
                        // //console.log(findcountanswer)
                        if(findcountanswer != undefined && findcountanswer.length > 0){
                            getPosts[counter]['answercount']=findcountanswer.length;
                        }
                        else{ //console.log("nooptions");
                    }
                      })
                  }
              })
          }
          else { //console.log("noquestion");
        }
          if(post.articleid)
          {
              article_sections.aggregate([
                        { "$match":{'articleid': post.articleid,'a_order':1}},
                        { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                        {
                            $lookup:
                                {
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                                }
                        },
                        { "$unwind": "$articaldata" },
                        { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                        }
                    }
              ]).then(function(findarticle)
              {

                        if(findarticle != null){
                            if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                }else{
                                findarticle[0].uploaded_file=[];
                                }
                            findarticle[0].partcontent=findarticle[0].article_content;
                            authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                findarticle[0].author=findauthor;
                            }).catch(function(error){
                            //console.log('author not find')
                            findarticle[0].author=null;
                            });
                            getPosts[counter]['articledata'] = findarticle;
                        }
              })
          }
          else { //console.log("no article");
        }
          if(post.pollid)
          {
                  polls.findOne({'_id': post.pollid}).then(function(findpoll)
                  {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                        // //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{ //console.log("nooptions");
                    }
                      })
                    }
                  })
          }
          else {   //console.log("no poll");
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
    });
}
//*************************************************************************************************************************************
exports.getNextPosts = function(req,res)
{
//   //console.log(req.body.loginid);
  //console.log('tid-',req.body.seltags);
  const tags=db.get('tags');
  const postsdata= db.get('posts');

//   //console.log('input-',req.body.seltags)
  var s_tag=[];
  var ninRegex=[""];

    if(req.body.seltags==null)
    {
      var s_tag=[""];
    }
    else
    {
        if(req.body.seltags[0] == 9211){
            let ninRegexTemp = ["5dc249f753ccd574492e0fba", "5dc2498553ccd574492e0fb8", "5d75d7945eb94a7dd37a2604", "5d845a7166ab01731b38202d"]
            ninRegex = ninRegexTemp.map(function (e) { return new RegExp(e, "i"); });
            var s_tag=[""];
        } else{
            s_tag.push(req.body.seltags);
        }
    }
    tags.find({ category_id : { $in: s_tag } },function(err, alltags)
    {
    //   //console.log('alltags-',alltags)
      if(alltags!=undefined && alltags.length > 0 )
      {
        alltags.forEach(function(tagval)
        {
          if(tagval.category_id!='')
          s_tag.push(tagval.unique_id);
        })
      }
    //   //console.log('s_tag-',s_tag)
      regex = s_tag.map(function (e) { return new RegExp(e, "i"); });
    //   //console.log(regex)
      postsdata.aggregate([
    //    { "$match":{"posted_at": {"$lte": Date.now() },'deleted':false,$or: [{ "tags": {"$in" : regex } } ] }},
    { "$match":{"posted_at": {"$lte": Date.now() },'deleted':false,$and: [{ "tags": {"$in" : regex } }, { "tags": {"$nin" : ninRegex } } ] }},
        {"$sort": {"posted_at": -1}},
        {"$skip": req.body.range},
        { "$limit" : 20 },
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
                     "searchcontent":1,
                     "questionid":1,
                     "questiontype":1,
                     "childquestionid":1,
                     "pollid":1,
                     "eventid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
                     "parentid":1,
                     "attached":1,
                     "preview_data":1,
                     "preview_flag":1,
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
          if(getPosts.length>0)
          {
             var counter = -1;
             const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const categories= db.get('categories');
            const tags= db.get('tags');
            const questions= db.get('questions');
            const casequestions= db.get('casequestions');
            const polls= db.get('polls');
            const pollsoptions= db.get('polls_options');
            const pollssubmit= db.get('polls_submitions');
            const authors= db.get('users');
            const article_sections= db.get('article_sections');
            const post_saves= db.get('post_saves');
            const question_options= db.get('question_options');
            const question_answers= db.get('question_answers');
            const casequestion_answers= db.get('casequestion_answers');
            asyncLoop(getPosts, async function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['pollactive'] = true;
                getPosts[counter]['polldata'] = {};
                getPosts[counter]['polloptions'] = [];
                getPosts[counter]['pollrescount'] = 0;
                getPosts[counter]['mypollans'] = '';
                getPosts[counter]['questiondata'] = {};
                getPosts[counter]['articledata'] = {};
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                getPosts[counter]['answercount']=0;
                getPosts[counter]['refPost']=[];
                getPosts[counter]['resourceidstatus']=false;
                if(post.parentid!==null)
                {
                    postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      if(refPostdata!=null)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                        {
                            // //console.log(refuser)
                            refPostdata.refusers=refuser
                        })
                        getPosts[counter]['refPost'] = refPostdata;
                      }
                    })
                }
                else { //console.log("noparentid");
            }
                if(post.resourceid)
                {
                    getPosts[counter]['resourceidstatus']=post.resourceid;
                }
                else {
                   getPosts[counter]['resourceidstatus']=false;
                }
                if(post.tags)
                {
                    var taguniqs = post.tags.split(",");
                    // //console.log("taguniqs- ",taguniqs);
                    if(post.questionid!==null && post.questionid!==''){
                        var condfortag={'unique_id' : { $in : taguniqs } ,'questionvisible':true}
                       }else{
                           var condfortag={'unique_id' : { $in : taguniqs } }
                       }
                    categories.aggregate([
                      {$match:condfortag},
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
                      tags.find(condfortag).then(function(getTags)
                      {
                          var alltags=getCategories.concat(getTags);
                          if(alltags != undefined && alltags.length > 0)
                          {
                            getPosts[counter]['alltags'] = alltags;
                          }

                      });
                  });
                }
                else {
                    //console.log("notags");

                }
                if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14' && post.childquestionid==null){
                    //console.log('this is iff')
                    casequestions.findOne({'q_order': 1,'parentqid':post.questionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();

                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.userid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                    //console.log("nooptions");
                }

            })
            casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer){
                // //console.log(findcountanswer)
        if(findcountanswer != undefined && findcountanswer.length > 0){
            getPosts[counter]['answercount']=findcountanswer.length;


        }else{
            //console.log("nooptions");
        }
        if (findquestion.tags !== "" && findquestion.tags !== null){

            var taguniqs = findquestion.tags.split(",");
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
                        getPosts[counter]['alltags']=alltags;
                    }
                }).catch(function(error){
                });
            });
        }

    })

                        }
                    })
                }
                else if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14'){
                    //console.log('this is iff')
                    casequestions.findOne({'_id': post.childquestionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();

                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.userid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                    //console.log("nooptions");
                }

            })
            casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer){
                // //console.log(findcountanswer)
        if(findcountanswer != undefined && findcountanswer.length > 0){
            getPosts[counter]['answercount']=findcountanswer.length;


        }else{
            //console.log("nooptions");
        }

        if (findquestion.tags !== "" && findquestion.tags !== null){

            var taguniqs = findquestion.tags.split(",");
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
                        getPosts[counter]['alltags']=alltags;
                    }
                }).catch(function(error){
                });
            });
        }

    })

                        }
                    })
                }else if(post.questionid){
    //                 // //console.log('this is elss iff')
    //                 questions.findOne({'_id': post.questionid}).then(function(findquestion){

    //                     if(findquestion != null){
    //                         getPosts[counter]['questiondata'] = findquestion;
    //                         var qid=findquestion._id.toString();
    //                         question_options.find({'questionid': qid}).then(function(findqoptions){
    //                             //console.log(findqoptions)
    //                     if(findqoptions != undefined && findqoptions.length > 0){
    //                         getPosts[counter]['questionoptions'] = findqoptions;


    //                     }else{
    //                         //console.log("nooptions");
    //                     }

    //                 })
    //                 question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
    //                     //console.log(findanswer)
    //             if(findanswer != undefined && findanswer.length > 0){
    //                 getPosts[counter]['questionanswer'] = findanswer;
    //                 //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
    //                 getPosts[counter]['answercheck']=true;


    //             }else{
    //                 //console.log("nooptions");
    //             }

    //         })
    //         question_answers.find({'questionid': qid}).then(function(findcountanswer){
    //             //console.log(findcountanswer)
    //     if(findcountanswer != undefined && findcountanswer.length > 0){
    //         getPosts[counter]['answercount']=findcountanswer.length;


    //     }else{
    //         //console.log("nooptions");
    //     }

    // })

    //                     }
    //                 })
                    var qid
                    let findquestion = await questions.findOne({'_id': post.questionid});
                    if(findquestion){
                        getPosts[counter]['questiondata'] = findquestion;
                        qid=findquestion._id.toString();
                    }

                    let findqoptions = await  question_options.find({'questionid': qid});
                    if(findqoptions != undefined && findqoptions.length > 0){
                        getPosts[counter]['questionoptions'] = findqoptions;
                    }

                    let findanswer = await question_answers.find({'questionid': qid,'answerby':req.body.userid});
                    if(findanswer){
                        getPosts[counter]['questionanswer'] = findanswer;
                        getPosts[counter]['answercheck']=true;
                        console.log(getPosts[counter]['questionanswer'].length);
                    }


                    let findcountanswer = await question_answers.find({'questionid': qid});
                    if(findcountanswer != undefined && findcountanswer.length > 0){
                        getPosts[counter]['answercount']=findcountanswer.length;
                    }
                } else {
                    //console.log("noquestion");

                }
                if (findquestion.tags !== "" && findquestion.tags !== null){

                    var taguniqs = findquestion.tags.split(",");
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
                                getPosts[counter]['alltags']=alltags;
                            }
                        }).catch(function(error){
                        });
                    });
                }

                if(post.articleid){

                    article_sections.aggregate([
                        { "$match":{'articleid': post.articleid,'a_order':1}},
                        { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                        {
                            $lookup:
                                {
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                                }
                        },
                        { "$unwind": "$articaldata" },
                        { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                        }
                    }
                    ]).then(function(findarticle){

                        if(findarticle != null){
                            if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                }else{
                                findarticle[0].uploaded_file=[];
                                }
                                findarticle[0].partcontent=findarticle[0].article_content;
                            authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                findarticle[0].author=findauthor;

                            }).catch(function(error){
                            //console.log('author not find')
                            findarticle[0].author=null;
                            });
                            getPosts[counter]['articledata'] = findarticle;
 }
                    })
                } else {
                    //console.log("no article");
                    post.articleid=null;
                }
                if(post.pollid)
                {
                  polls.findOne({'_id': post.pollid, "endDays": {"$gt": Date.now() }}).then(function(findpoll)
                  {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollssubmit.findOne({'pollid':qid, 'created_by':req.body.userid }).then(function(finduserpollans)
                      {
                        // //console.log('fps-',finduserpollans.optionid)
                        getPosts[counter]['mypollans'] = finduserpollans.optionid;
                      })
                      pollssubmit.find({'pollid': qid, 'postid':post.unique_id}).then(function(allpollres)
                      {
                        getPosts[counter]['pollrescount'] = allpollres.length;
                      });
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                        // //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            findpoptions.forEach(function(poption,index)
                            {
                                var optid=poption._id.toString();
                                pollssubmit.find({'pollid':qid, 'optionid': optid}).then(function(findoptioncount)
                                {
                                  if(findoptioncount.length > 0)
                                  {
                                    var c1 = (findoptioncount.length*100)/getPosts[counter]['pollrescount'];
                                    //console.log('c1-',c1)
                                    if(c1!=Infinity)
                                    {
                                      poption.count=Number(c1).toFixed(2);
                                    }
                                    else
                                    {
                                      poption.count=0;
                                    }
                                  }
                                  else{poption.count=0;}
                                })
                            });
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{ //console.log("nooptions");
                    }
                      })
                    }
                    else
                    {
                            getPosts[counter]['pollactive'] = false;
                            postsdata.findOneAndUpdate({'pollid':post.pollid},{ $set: {'deleted':true}}).then(function(updatepollstatus)
                            {
                                //console.log('poll deactivated')
                            });
                    }
                  })

                } else {
                    //console.log("no poll");
                }
                post_likes.find({'postid': post.unique_id, 'likeby': req.body.userid,'status': 1}).then(function(findupdate){
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
                                post_saves.find({'postid': post.unique_id, 'created_by':req.body.userid, status:0}).then(function(findsaveposts){
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
    }
    else
    {
      res.json([]);
    }
    });//end of getPosts
      // res.json(s_tag)
    });//tags
}
//*************************************************************************************************************************************
exports.getMailApi = function(req,res)
{
    // //console.log(req.body.loginid);
    // //console.log(req.body.searchedtitle);
    if(req.body.searchedtitle==null || req.body.searchedtitle=='')
    {
       res.json([]);
    }
    else
    {
      const postsdata= db.get('posts');
      const articledata= db.get('articles');
      postsdata.aggregate([
        { "$match":{"posted_at": {"$lte": Date.now() },'deleted':false, "resourceid":true, "questionid":null, "content": new RegExp(req.body.searchedtitle, 'i')  }},
        {"$sort": {"posted_at": -1}}, {"$sort": {"_id": -1}}, { "$limit" : 20 },
        {   $lookup: { from: "users", localField: "created_by", foreignField: "unique_id", as: "userdetail"}},
        { "$unwind": "$userdetail" },
        { "$project":
                {
                     "content":1,
                     "questionid":1,
                     "pollid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
                     "parentid":1,
                     "attached":1,
                     "pdfpreviewimage":1,
                     "posted_at":1,
                     "unique_id":1,
                     "userdetail.unique_id":1,
                     "userdetail.firstname":1,
                     "userdetail.lastname":1,
                     "userdetail.profile":1,
                }
         }
      ]).then(function(getPosts)
      {
        // //console.log('getposts1-',getPosts)
        articledata.find({"a_title": new RegExp(req.body.searchedtitle, 'i')}).then(function(getarticles)
        {
          if(getarticles!=null && getarticles.length > 0)
          {
            var counter=-1;
          	var arr=[];
            asyncLoop(getarticles, function (artval, next)
            {
              counter++;
              postsdata.aggregate([
                { "$match":{"posted_at": {"$lte": Date.now() },'deleted':false, "resourceid":true, "questionid":null, "articleid":artval._id.toString()  }},
                {"$sort": {"posted_at": -1}}, {"$sort": {"_id": -1}},
                {   $lookup: { from: "users", localField: "created_by", foreignField: "unique_id", as: "userdetail"}},
                { "$unwind": "$userdetail" },
                { "$project":
                      {
                           "content":1,
                           "questionid":1,
                           "pollid":1,
                           "articleid":1,
                           "tags":1,
                           "resourceid":1,
                           "parentid":1,
                           "attached":1,
                           "pdfpreviewimage":1,
                           "posted_at":1,
                           "unique_id":1,
                           "userdetail.unique_id":1,
                           "userdetail.firstname":1,
                           "userdetail.lastname":1,
                           "userdetail.profile":1,
                    }
                }
              ]).then(function(getartPosts)
              {
                if(getartPosts!=null && getartPosts.length > 0)
                {
               		 arr.push(getartPosts)
        			// //console.log('arr-',arr);
                }
              })
              next()
          	}); //getarticles
          }//if
        // //console.log('gp-',getPosts);
        res.json(getPosts)
        });// articlesdata
      }); //getposts
    } //else
}
//*************************************************************************************************************************************
// exports.getNextPosts = function(req,res)
// {
//     //console.log(req.body.loginid);
//     const postsdata= db.get('posts');
//     postsdata.aggregate([
//        { "$match":{"posted_at": {"$lte": Date.now() },'deleted':false }},
//         {"$sort": {"posted_at": -1}},
//         {"$sort": {"_id": -1}},
//         {"$skip": req.body.range},
//         { "$limit" : 20 },
//          {
//              $lookup:
//                  {
//                      from: "users",
//                      localField: "created_by",
//                      foreignField: "unique_id",
//                      as: "userdetail"
//                  }
//          },
//          { "$unwind": "$userdetail" },
//                  { "$project": {
//                      "content":1,
//                      "questionid":1,
//                      "tags":1,
//                      "parentid":1,
//                      "attached":1,
//                      "pdfpreviewimage":1,
//                      "posted_at":1,
//                      "unique_id":1,
//                      "userdetail.unique_id":1,
//                      "userdetail.firstname":1,
//                      "userdetail.lastname":1,
//                      "userdetail.profile":1

//                  }
//          }
//          ]).then(function(getPosts){
//              var counter = -1;
//             const post_likes= db.get('post_likes');
//             const post_comments= db.get('comments');
//             const tags= db.get('tags');
//             const questions= db.get('questions');
//             const post_saves= db.get('post_saves');
//             const question_options= db.get('question_options');
//             const question_answers= db.get('question_answers');
//             asyncLoop(getPosts, function (post, next)
//             {
//                 counter++
//                 getPosts[counter]['likestatus'] = 0;
//                 getPosts[counter]['likes'] = 0;
//                 getPosts[counter]['dislikes'] = 0;
//                 getPosts[counter]['alltags'] = [];
//                 getPosts[counter]['questiondata'] = {};
//                 getPosts[counter]['questionoptions'] = [];
//                 getPosts[counter]['allcomments'] = [];
//                 getPosts[counter]['allsaveposts'] = 0;
//                 getPosts[counter]['questionanswer']=[];
//                 getPosts[counter]['answercheck']=false;
//                 getPosts[counter]['refPost']=[];
//                 if(post.parentid!==null)
//                 {
//                     postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
//                     {
//                       getPosts[counter]['refPost'] = refPostdata;
//                     })
//                 }
//                 else { //console.log("noparentid"); }
//                 if(post.tags){
//                     var taguniqs = post.tags.split(",");
//                     //console.log("taguniqs- ",taguniqs);

//                     tags.find({ unique_id : { $in : taguniqs } }, {unique_id:1, tagname:1},function(err, alltags){
//                         if(alltags != undefined && alltags.length > 0){
//                             getPosts[counter]['alltags'] = alltags;

//                         }
//                     })
//                 } else {
//                     //console.log("notags");

//                 }
//                 if(post.questionid){

//                     questions.findOne({'_id': post.questionid}).then(function(findquestion){

//                         if(findquestion != null){
//                             getPosts[counter]['questiondata'] = findquestion;
//                             var qid=findquestion._id.toString();
//                             question_options.find({'questionid': qid}).then(function(findqoptions){
//                                 //console.log(findqoptions)
//                         if(findqoptions != undefined && findqoptions.length > 0){
//                             getPosts[counter]['questionoptions'] = findqoptions;


//                         }else{
//                             //console.log("nooptions");
//                         }

//                     })
//                     question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
//                         //console.log(findanswer)
//                 if(findanswer != undefined && findanswer.length > 0){
//                     getPosts[counter]['questionanswer'] = findanswer;
//                     getPosts[counter]['answercheck']=true;


//                 }else{
//                     //console.log("nooptions");
//                 }

//             })

//                         }
//                     })
//                 } else {
//                     //console.log("noquestion");

//                 }
//                 post_likes.find({'postid': post.unique_id, 'likeby': req.body.loginid,'status': 1}).then(function(findupdate){
//                     if(findupdate != undefined && findupdate.length > 0){
//                         getPosts[counter]['likestatus'] = 1;
//                     }
//                     post_likes.find({'postid': post.unique_id, status:1}).then(function(findlikes){
//                         if(findlikes != undefined && findlikes.length > 0){
//                             getPosts[counter]['likes'] = findlikes.length;
//                         }
//                         post_likes.find({'postid': post.unique_id, status:0}).then(function(findlikes){
//                             if(findlikes != undefined && findlikes.length > 0){
//                                 getPosts[counter]['dislikes'] = findlikes.length;
//                             }
//                             post_comments.find({'postid': post.unique_id}).then(function(findcomments){
//                                 if(findcomments != undefined && findcomments.length > 0){
//                                     getPosts[counter]['allcomments'] = findcomments;
//                                 }
//                                 post_saves.find({'postid': post.unique_id, 'created_by':req.body.loginid, status:0}).then(function(findsaveposts){
//                                 if(findsaveposts != undefined && findsaveposts.length > 0){
//                                     getPosts[counter]['allsaveposts'] = 1;
//                                 }
//                           next();
//                           }).catch(function(error){
//                             next();
//                           });
//                         }).catch(function(error){
//                             next();
//                         });
//                     }).catch(function(error){
//                         next();
//                     });
//                 }).catch(function(error){
//                     next();
//                 });
//                 }).catch(function(error){
//                     next();
//                 });

//             }, function (err)
//             {
//                 if (err)
//                 {
//                     console.error('Inner Error: ' + err.message);
//                     // return;
//                 }
//                 res.json(getPosts);
//             });
//     });
// }
//*************************************************************************************************************************************
exports.getSavedResposts = function(req,res){
    // //console.log(req.body.loginid);

    const postsdata= db.get('posts');
    postsdata.aggregate([
      {"$match":{"posted_at": {"$lte": Date.now() },"questionid":null, $or:[{'deleted':false},{'resourceid':true}]}},
      {"$sort": {"posted_at": -1}},
      {"$sort": {"_id": -1}},
      {
        $lookup:
         {
           from: "post_saves",
          let: { post_id: "$unique_id", createdby: req.body.loginid, status:0 },
           pipeline: [
              { $match:
                 { $expr:
                    { $and:
                       [
                         { $eq: [ "$postid",  "$$post_id" ] },
                         { $eq: [ "$status", "$$status" ] },
                         { $eq: [ "$created_by", "$$createdby" ] }
                       ]
                    }
                 }
              },
              { $limit: 20 },
              { $project: { status:1, postid:1 } }
           ],
           as: "savedpost"
         }
      },
      { "$unwind": "$savedpost" },
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
                     "searchcontent":1,
                     "questionid":1,
                     "pollid":1,
                     "articleid":1,
                     "resourceid":1,
                     "tags":1,
                     "parentid":1,
                     "attached":1,
                     "pdfpreviewimage":1,
                     "posted_at":1,
                     "unique_id":1,
                     "userdetail.unique_id":1,
                     "userdetail.firstname":1,
                     "userdetail.lastname":1,
                     "userdetail.profile":1,
                     "savedpost.status":1,
                     "savedpost.postid":1
                 }
      }
  ]).then(function(getPosts)
  {
        if(getPosts!=null && getPosts.length > 0)
        {
            var counter = -1;
            const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const categories= db.get('categories');
            const tags= db.get('tags');
            const questions= db.get('questions');
            const polls= db.get('polls');
            const pollsoptions= db.get('polls_options');
            const authors= db.get('users');
            const article_sections= db.get('article_sections');
            const post_saves= db.get('post_saves');
            const question_options= db.get('question_options');
            const question_answers= db.get('question_answers');
            asyncLoop(getPosts, async function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['polldata'] = {};
                getPosts[counter]['polloptions'] = [];
                getPosts[counter]['questiondata'] = {};
                getPosts[counter]['articledata'] = {};
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                getPosts[counter]['refPost']=[];
                getPosts[counter]['resourceidstatus']=false;

                getPosts[counter]['videoUrl'] = [];
                getPosts[counter]['imageUrl'] = [];

                // to extract video url
                if(post.content !== null){
                    async function urlify(text) {
                        var urlRegex = /(<iframe.+?<\/iframe>)/g;
                        let data = await text.match(urlRegex);
                        return data
                    }

                    var html = await urlify(post.content);

                    if(html == null){
                        getPosts[counter]['videoUrl'] = []
                    } else{
                        getPosts[counter]['videoUrl'] = html
                    }
                }

                // to extract image url
                let arrayFilled  = false
                if (post.content !== null){
                    async function urlify(text) {
                        var urlRegex = /<img [^>]*src="[^"]*"[^>]*>/gm;
                        let data =  text.match(urlRegex);
                        //console.log("data >>>>>> ", data)
                        return data
                    }
                    var html =  urlify(post.content);
                    if(html == null){
                        getPosts[counter]['imageUrl'] = []
                    } else{
                        getPosts[counter]['imageUrl'] = html
                        varTracker = true
                    }

                }

                if(post.parentid!==null)
                {
                     postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      if(refPostdata!=null)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                        {
                            // //console.log(refuser)
                            refPostdata.refusers=refuser
                        })
                        getPosts[counter]['refPost'] = refPostdata;
                      }
                    })
                }
                else { //console.log("noparentid");
            }
                if(post.resourceid)
                {
                    getPosts[counter]['resourceidstatus']=post.resourceid;
                }
                else {
                   getPosts[counter]['resourceidstatus']=false;
                }
                if(post.tags)
                {
                   var taguniqs = post.tags.split(",");
                    // //console.log("taguniqs- ",taguniqs);

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
                  ]).then(async function(getCategories)
                  {
                      tags.find({ unique_id : { $in : taguniqs } }).then(async function(getTags)
                      {
                          var alltags=getCategories.concat(getTags);
                          if(alltags != undefined && alltags.length > 0)
                          {
                            getPosts[counter]['alltags'] = alltags;
                          }

                          // to extract video url
                          if (post.content == null){
                                if (post.refPost.content){
                                    async function urlify(text) {
                                        var urlRegex = /(<iframe.+?<\/iframe>)/g;
                                        let data = await text.match(urlRegex);
                                        return data
                                    }

                                    var html = await urlify(post.refPost.content);
                                    if(html == null){
                                        getPosts[counter]['videoUrl'] = []
                                    } else{
                                        getPosts[counter]['videoUrl'] = html
                                    }
                                }
                            }
                            /// to extract image url
                            if (arrayFilled == false){
                                if (post.refPost.content !== null){
                                        async function urlify(text) {
                                            var urlRegex = /<img [^>]*src="[^"]*"[^>]*>/gm
                                            let data =  text.match(urlRegex);
                                            return data
                                        }
                                        var html =  urlify(post.content);
                                        if(html == null){
                                            getPosts[counter]['imageUrl'] = []
                                        } else{
                                            getPosts[counter]['imageUrl'] = html
                                        }
                                    }
                                }
                      });
                  });
                } else {
                    //console.log("notags");

                }
                if(post.questionid){

                    questions.findOne({'_id': post.questionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();
                            question_options.find({'questionid': qid}).then(function(findqoptions){
                                // //console.log(findqoptions)
                        if(findqoptions != undefined && findqoptions.length > 0){
                            getPosts[counter]['questionoptions'] = findqoptions;


                        }else{
                            //console.log("nooptions");
                        }

                    })
                    question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                    //console.log("nooptions");
                }

            })

                        }
                    })
                } else {
                    //console.log("noquestion");

                }
                if(post.articleid){

                    article_sections.aggregate([
                        { "$match":{'articleid': post.articleid,'a_order':1}},
                        { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                        {
                            $lookup:
                                {
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                                }
                        },
                        { "$unwind": "$articaldata" },
                        { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                        }
                    }
                    ]).then(function(findarticle){

                        if(findarticle != null){
                            if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                }else{
                                findarticle[0].uploaded_file=[];
                                }
                            findarticle[0].partcontent=findarticle[0].article_content;
                            authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                findarticle[0].author=findauthor;
                            }).catch(function(error){
                            //console.log('author not find')
                            findarticle[0].author=null;
                            });
                            getPosts[counter]['articledata'] = findarticle;
 }
                    })
                } else {
                    //console.log("no article");

                }
                if(post.pollid)
                {
                  polls.findOne({'_id': post.pollid}).then(function(findpoll)
                  {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                        //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{ //console.log("nooptions");
                     }
                      })
                    }
                  })
                } else {
                    //console.log("no poll");
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
        }
        else
        { res.json([]);}
  });
}
//*************************************************************************************************************************************
exports.getTitleResourcePosts = function(req,res)
{
    // //console.log(req.body.loginid);
    // //console.log(req.body.searchedtitle);
    if(req.body.searchedtitle==null || req.body.searchedtitle=='')
    {
       res.json([]);
    }
    else
    {
      var search_title=req.body.searchedtitle.trim()
      const postsdata= db.get('posts');
      postsdata.aggregate([
        { "$match":{"posted_at": {"$lte": Date.now() }, "resourceid":true, "questionid":null, "searchcontent": new RegExp(search_title, 'i')  }},
        {"$sort": {"posted_at": -1}},
        {"$sort": {"_id": -1}},
        { "$limit" : 20 },
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
                     "pollid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
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
         ]).then(function(getPosts)
         {
           if(getPosts!=null && getPosts.length > 0)
           {
            var counter = -1;
            const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const categories= db.get('categories');
            const tags= db.get('tags');
            const questions= db.get('questions');
            const polls= db.get('polls');
            const pollsoptions= db.get('polls_options');
            const authors= db.get('users');
            const article_sections= db.get('article_sections');
            const post_saves= db.get('post_saves');
            const question_options= db.get('question_options');
            const question_answers= db.get('question_answers');
            asyncLoop(getPosts, function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['polldata'] = {};
                getPosts[counter]['polloptions'] = [];
                getPosts[counter]['questiondata'] = {};
                getPosts[counter]['articledata'] = {};
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                getPosts[counter]['refPost']=[];
                getPosts[counter]['resourceidstatus']=false;
                if(post.parentid!==null)
                {
                    postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                      {
                        //   //console.log(refuser)
                          refPostdata.refusers=refuser
                      })
                      getPosts[counter]['refPost'] = refPostdata;
                    })
                }
                else { //console.log("noparentid");
             }
                if(post.resourceid)
                {
                    getPosts[counter]['resourceidstatus']=post.resourceid;
                }
                else {
                   getPosts[counter]['resourceidstatus']=false;
                }
                if(post.tags){
                    var taguniqs = post.tags.split(",");
                    // //console.log("taguniqs- ",taguniqs);

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
                if(post.questionid){

                    questions.findOne({'_id': post.questionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();
                            question_options.find({'questionid': qid}).then(function(findqoptions){
                                // //console.log(findqoptions)
                        if(findqoptions != undefined && findqoptions.length > 0){
                            getPosts[counter]['questionoptions'] = findqoptions;


                        }else{
                            //console.log("nooptions");
                        }

                    })
                    question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                        // //console.log(findanswer)
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                    //console.log("nooptions");
                }

            })

                        }
                    })
                } else {
                    //console.log("noquestion");

                }
                if(post.articleid){

                    article_sections.aggregate([
                        { "$match":{'articleid': post.articleid,'a_order':1}},
                        { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                        {
                            $lookup:
                                {
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                                }
                        },
                        { "$unwind": "$articaldata" },
                        { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                        }
                    }
                    ]).then(function(findarticle){

                        if(findarticle != null){
                            if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                                }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                                findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                                }else{
                                findarticle[0].uploaded_file=[];
                                }
                            findarticle[0].partcontent=findarticle[0].article_content;
                            authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                                findarticle[0].author=findauthor;
                            //console.log('author not find')
                            findarticle[0].author=null;
                            });
                            getPosts[counter]['articledata'] = findarticle;
 }
                    })
                } else {
                    //console.log("no article");

                }
                if(post.pollid)
                {
                  polls.findOne({'_id': post.pollid}).then(function(findpoll)
                  {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                        // //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{ //console.log("nooptions");
                     }
                      })
                    }
                  })
                } else {
                    //console.log("no poll");
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
          }
          else
          {
            res.json([]);
          }
      });
    }
}
//*************************************************************************************************************************************
exports.getSharedResourcePosts = function(req,res)
{
    // //console.log(req.body.loginid);
    const postsdata= db.get('posts');
    postsdata.aggregate(
    [
        {"$match":{"posted_at": {"$lte": Date.now() }, "resourceid":true, 'questionid':null, "created_by":req.body.userid }},
        {"$sort": {"posted_at": -1}},
        {"$sort": {"_id": -1}},
        {"$limit" : 20 },
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
                     "pollid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
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
    ]).then(function(getPosts)
    {
        if(getPosts!=null && getPosts.length > 0)
        {
        var counter = -1;
        const post_likes= db.get('post_likes');
        const post_comments= db.get('comments');
        const categories= db.get('categories');
        const tags= db.get('tags');
        const questions= db.get('questions');
        const polls= db.get('polls');
        const pollsoptions= db.get('polls_options');
        const authors= db.get('users');
        const article_sections= db.get('article_sections');
        const post_saves= db.get('post_saves');
        const question_options= db.get('question_options');
        const question_answers= db.get('question_answers');
        asyncLoop(getPosts, function (post, next)
        {
            counter++
            getPosts[counter]['likestatus'] = 0;
            getPosts[counter]['likes'] = 0;
            getPosts[counter]['dislikes'] = 0;
            getPosts[counter]['alltags'] = [];
            getPosts[counter]['polldata'] = {};
            getPosts[counter]['polloptions'] = [];
            getPosts[counter]['questiondata'] = {};
            getPosts[counter]['articledata'] = {};
            getPosts[counter]['questionoptions'] = [];
            getPosts[counter]['allcomments'] = [];
            getPosts[counter]['allsaveposts'] = 0;
            getPosts[counter]['questionanswer']=[];
            getPosts[counter]['answercheck']=false;
            getPosts[counter]['answercount']=0;
            getPosts[counter]['refPost']=[];
            getPosts[counter]['resourceidstatus']=false;
            if(post.parentid!==null)
            {
               postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                      {
                        //   //console.log(refuser)
                          refPostdata.refusers=refuser
                      })
                      getPosts[counter]['refPost'] = refPostdata;
                    })
            }
            else { //console.log("noparentid");
         }
            if(post.resourceid)
            {
                getPosts[counter]['resourceidstatus']=post.resourceid;
            }
            else { getPosts[counter]['resourceidstatus']=false; }
            if(post.tags)
            {
               var taguniqs = post.tags.split(",");
                    // //console.log("taguniqs- ",taguniqs);

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
            }
            else { //console.log("notags");
         }
            if(post.questionid)
            {
                questions.findOne({'_id': post.questionid}).then(function(findquestion)
                {
                    if(findquestion != null)
                    {
                        getPosts[counter]['questiondata'] = findquestion;
                        var qid=findquestion._id.toString();
                        question_options.find({'questionid': qid}).then(function(findqoptions){
                            // //console.log(findqoptions)
                            if(findqoptions != undefined && findqoptions.length > 0)
                            { getPosts[counter]['questionoptions'] = findqoptions; }
                            else{ //console.log("nooptions");
                         }
                        })
                        question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                            // //console.log(findanswer)
                            if(findanswer != undefined && findanswer.length > 0)
                            {
                                    getPosts[counter]['questionanswer'] = findanswer;
                                    getPosts[counter]['answercheck']=true;
                            }
                            else{ //console.log("nooptions");
                         }
                        })
                        question_answers.find({'questionid': qid}).then(function(findcountanswer){
                            //console.log(findcountanswer)
                            if(findcountanswer != undefined && findcountanswer.length > 0)
                            { getPosts[counter]['answercount']=findcountanswer.length;}
                            else{ //console.log("nooptions");
                        }
                        })
                    }
                })
            }
            else{ //console.log("noquestion");
        }
            if(post.articleid)
            {
                article_sections.aggregate(
                [
                    { "$match":{'articleid': post.articleid,'a_order':1}},
                    { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                    {
                        $lookup:{
                                    from: "articles",
                                    localField: "artid",
                                    foreignField: "_id",
                                    as: "articaldata"
                        }
                    },
                    { "$unwind": "$articaldata" },
                    { "$project": {
                            "articleid":1,
                            "uploaded_file":1,
                            "section_uploaded_file":1,
                            "article_content":1,
                            "articaldata.author_name":1,
                            "articaldata.a_title":1

                            }
                    }
                ]).then(function(findarticle)
                {
                    if(findarticle != null)
                    {
                        if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                            findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                            }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                            findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                            }else{
                            findarticle[0].uploaded_file=[];
                            }
                        findarticle[0].partcontent=findarticle[0].article_content;
                        authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                            findarticle[0].author=findauthor;
                        }).catch(function(error){
                            //console.log('author not find')
                            findarticle[0].author=null;
                        });
                        getPosts[counter]['articledata'] = findarticle;
                    }
                })
            }
            else { //console.log("no article");
         }
            if(post.pollid)
            {
                polls.findOne({'_id': post.pollid}).then(function(findpoll)
                {
                    if(findpoll != null)
                    {
                      getPosts[counter]['polldata'] = findpoll;
                      var qid=findpoll._id.toString();
                      pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                      {
                        // //console.log(findpoptions)
                        if(findpoptions != undefined && findpoptions.length > 0)
                        { getPosts[counter]['polloptions'] = findpoptions; }
                        else{ //console.log("nooptions");
                    }
                      })
                    }
                })
            }
            else { //console.log("no poll");
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
            { console.error('Inner Error: ' + err.message);}
            res.json(getPosts);
        });
        }
        else{ res.json([]); }
    });

}
//*************************************************************************************************************************************
exports.getUsersDetails = function(req,res)
{
    const usersdata= db.get('users');
    var search_user= req.body.searcheduser.trim()
    if(search_user==null || search_user=='')
    {
       res.json([]);
    }
    else
    {
      usersdata.aggregate([
            { "$project": {
                      "fullname": { $concat: ['$firstname', ' ', '$lastname']},
                      "_id" : 1,
                      "firstname" : 1,
                      "lastname" : 1,
                      "username" : 1,
                      "email" : 1,
                      "password" : 1,
                      "profile" : 1,
                      "unique_id" : 1,
                      "gpexid" : 1,
                      "role" : 1
                  }
            },
            {$match:{'fullname' : new RegExp(search_user, 'i')}},
            {$limit :10},
        ]).then(function(getselusers){
            res.json(getselusers);
        });
    }
}
exports.getUsersrecourseDetails = function(req,res)
{
    const usersdata= db.get('users');
    var search_user= req.body.searcheduser.trim()
    if(search_user==null || search_user=='')
    {
       res.json([]);
    }
    else
    {
      usersdata.aggregate([
        {
            $lookup:{
                        from: "posts",
                        localField: "unique_id",
                        foreignField: "created_by",
                        as: "postdata"
            }
        },
        { "$unwind": "$postdata" },
            {
                "$project": {
                      "fullname": { $concat: ['$firstname', ' ', '$lastname']},
                      "_id" : 1,
                      "firstname" : 1,
                      "lastname" : 1,
                      "username" : 1,
                      "email" : 1,
                      "password" : 1,
                      "profile" : 1,
                      "unique_id" : 1,
                      "gpexid" : 1,
                      "role" : 1,
                      "postdata.resourceid":1
                  }
            },
            {$match:{'fullname' : new RegExp(search_user, 'i'),'postdata.resourceid' :true }},
            {$limit :10},
        ]).then(function(getselusers){
            var finalusers=[];
            var finaluserscount=[];
            asyncLoop(getselusers, function (user, next)
            {

                if(finaluserscount.indexOf(user.unique_id)<0){
                finaluserscount.push(user.unique_id);
                finalusers.push(user);
                }
                next();
            }, function (err)
            {
                if (err)
                { console.error('Inner Error: ' + err.message); }
                res.json(finalusers);
            });
            //res.json(getselusers);
        });
    }
}
//*************************************************************************************************************************************
exports.getCommentsofComments = function(req,res)
{
//     //console.log(req.body.loginid); // 5d0b76d35093d91542092db5
//     //console.log(req.body.postid); // 5d6ca7052af7214c31514fc9
//     //console.log(req.body.commentid); // 5d6ca7252af7214c31514fcb

    const comment_likes= db.get('comment_likes');
    const post_comments= db.get('comments');
    post_comments.aggregate(
    [
        { "$match":{'postid': req.body.postid,'parentid':req.body.commentid}},
        {"$sort": {"_id": 1}},
        {
            $lookup:
            {
              from: "users",
              localField: "created_by",
              foreignField: "unique_id",
              as: "commentby"
            }
        },
        { "$unwind": "$commentby" },
        { "$project":
            {
                "content":1,
                "created_at":1,
                "parentid":1,
                "asynccheck":1,
                "questionid":1,
                "unique_id":1,
                "commentby.unique_id":1,
                "commentby.firstname":1,
                "commentby.lastname":1,
                "commentby.profile":1
            }
        }
    ]).then(function(commentsofcomments)
    {
        if(commentsofcomments != undefined && commentsofcomments.length > 0)
        {
            var counter1 = -1;
            asyncLoop(commentsofcomments, function (comment1, next)
            {
                counter1++;
                commentsofcomments[counter1]['likes']=0;
                commentsofcomments[counter1]['likestatus']=0;

                comment_likes.find({'commentid': comment1.unique_id, 'likeby': req.body.loginid,'status': 1}).then(function(findupdatestatus1)
                {
                    if(findupdatestatus1 != undefined && findupdatestatus1.length > 0)
                    {  commentsofcomments[counter1]['likestatus'] = 1;  }
                    comment_likes.find({'commentid': comment1.unique_id, status:1}).then(function(findlikes1)
                    {
                        if(findlikes1 != undefined && findlikes1.length > 0)
                        {commentsofcomments[counter1]['likes'] = findlikes1.length;}
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
                { console.error('Inner Error: ' + err.message); }
                res.json(commentsofcomments);
            });
        }
        else{res.json([])}
    });
}
//****************************************
exports.getAllUsersData = function(req,res)
{

  const usersdata= db.get('users');
  usersdata.find({}).then(function(getusersdata){
    //console.log('success')
        res.json(getusersdata);
  });

}
//****************************************
exports.updateEditComment = function(req,res)
{
//   //console.log(req.body.commentid)
//   //console.log(req.body.content)
//   //console.log(req.body.createdby)
  const post_comments= db.get('comments');
  post_comments.findOneAndUpdate({'_id':req.body.commentid},{$set:{'content':req.body.content,'updated_by':req.body.createdby,'updated_at':Date.now()}}).then(function(insertcomments)
  {
    //console.log('comment updated');
    res.json(insertcomments);
  }).catch(function(error){
    //console.log('comment not  updated');
    res.json([]);
  });
}
//****************************************
exports.removePostComment = function(req,res)
{
//   //console.log('cid-',req.body.id)
    const post_comments= db.get('comments');
    post_comments.remove({'_id':req.body.id});
    post_comments.remove({$or: [{ "unique_id": req.body.id},{"parentid": req.body.id} ]}).then(function(remove)
    {
      //console.log('comment removed')
      res.json(remove);
    })
}
//**************************************************************************************************************

exports.getOneQuestionPost = function(req,res)
{
  const postsdata= db.get('posts');
  postsdata.aggregate([
      { "$match":{"unique_id": req.body.postid}},
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
                     "searchcontent":1,
                     "questionid":1,
                     "questiontype":1,
                     "childquestionid":1,
                     "pollid":1,
                     "eventid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
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
      ]).then(function(getPosts)
      {
            var counter = -1;
            const post_likes= db.get('post_likes');
            const post_comments= db.get('comments');
            const categories= db.get('categories');
            const tags= db.get('tags');
            const questions= db.get('questions');
            const casequestions= db.get('casequestions');
            const polls= db.get('polls');
            const pollsoptions= db.get('polls_options');
            const pollssubmit= db.get('polls_submitions');
            const authors= db.get('users');
            const article_sections= db.get('article_sections');
            const post_saves= db.get('post_saves');
            const question_options= db.get('question_options');
            const question_answers= db.get('question_answers');
            const casequestion_answers= db.get('casequestion_answers');
            const case_comments= db.get('case_comments');


            asyncLoop(getPosts, function (post, next)
            {
                counter++
                getPosts[counter]['likestatus'] = 0;
                getPosts[counter]['likes'] = 0;
                getPosts[counter]['dislikes'] = 0;
                getPosts[counter]['alltags'] = [];
                getPosts[counter]['pollactive'] = true;
                getPosts[counter]['polldata'] = {};
                getPosts[counter]['polloptions'] = [];
                getPosts[counter]['pollrescount'] = 0;
                getPosts[counter]['mypollans'] = '';
                getPosts[counter]['questiondata'] = {};
                getPosts[counter]['articledata'] = {};
                getPosts[counter]['questionoptions'] = [];
                getPosts[counter]['allcomments'] = [];
                getPosts[counter]['allsaveposts'] = 0;
                getPosts[counter]['questionanswer']=[];
                getPosts[counter]['answercheck']=false;
                getPosts[counter]['answercount']=0;
                getPosts[counter]['refPost']=[];
                getPosts[counter]['resourceidstatus']=false;
                if(post.parentid!==null)
                {
                    postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                    {
                      if(refPostdata!=null)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                        {
                            // //console.log(refuser)
                            refPostdata.refusers=refuser
                        })
                        getPosts[counter]['refPost'] = refPostdata;
                      }
                    })
                }
                else { //console.log("noparentid");
             }
                if(post.resourceid)
                {
                    getPosts[counter]['resourceidstatus']=post.resourceid;
                }
                else {
                   getPosts[counter]['resourceidstatus']=false;
                }
                if(post.tags)
                {
                    var taguniqs = post.tags.split(",");
                    // //console.log("taguniqs- ",taguniqs);

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
                }
                else {
                    //console.log("notags");

                }

                if(post.questionid)
                {
                    // //console.log('this is else if');
                    questions.findOne({'_id': post.questionid}).then(function(findquestion)
                    {

                      if(findquestion != null)
                      {
                          getPosts[counter]['questiondata'] = findquestion;
                          var qid=findquestion._id.toString();
                          question_options.find({'questionid': qid}).then(function(findqoptions)
                          {
                            if(findqoptions != undefined && findqoptions.length > 0){
                              getPosts[counter]['questionoptions'] = findqoptions;
                            }
                            else
                            {
                              //console.log("nooptions");
                            }
                          })
                          question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
                          {
                            if(findanswer != undefined && findanswer.length > 0)
                            {
                              getPosts[counter]['questionanswer'] = findanswer;
                              getPosts[counter]['answercheck']=true;
                            }
                            else
                            {
                              //console.log("nooptions");
                            }
                          })
                          question_answers.find({'questionid': qid}).then(function(findcountanswer)
                          {
                            if(findcountanswer != undefined && findcountanswer.length > 0){
                              getPosts[counter]['answercount']=findcountanswer.length;
                            }
                            else{
                              //console.log("nooptions");
                            }
                          })
                      }
                    })
                }
                else
                {
                    //console.log("noquestion");
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
                                    if(post.questiontype!='5d15fea98edfed6c417592d14'){
                                    getPosts[counter]['allcomments'] = findcomments;
                                    }
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
    });//end of getPosts
}

//*************************************************************************************************************************

exports.getHashtagPosts = function(req,res)
{
    //   //console.log(req.body.loginid);
    const tags=db.get('tags');
    const categories=db.get('categories');
    const postsdata= db.get('posts');
    var str=[];
    var s_tag=[];
    str.push(req.body.hashtag.trim());
    str.push(req.body.hashtag.trim().replace(/_/g," "));
    //   //console.log("this is #tag request >>>>>> ",str);
      tags.find({ tagname : { $in: str } },function(err, alltags)
    {
    // //console.log("this is tag searched .....", alltags)
    if(alltags!=undefined && alltags.length > 0 )
    {
      alltags.forEach(function(tagval)
      {
          if(tagval.category_id!='')
            s_tag.push(tagval.unique_id);
      })
    }
    else
    {
      categories.find({ categoryname : { $in: str } },function(err, allcategories)
      {
        if(allcategories!=undefined && allcategories.length > 0 )
        {
          allcategories.forEach(function(catgval)
          {
              if(catgval.category_id!='')
                s_tag.push(catgval.unique_id);
          })
        }
      });
    }
    regex = s_tag.map(function (e) { return new RegExp(e, "i"); });
    for(var i = 0; i < str.length;i++)
    {
       str[i]="#"+str[i];
    }
    strregex = str.map(function (e) { return new RegExp(e, "i"); });
    // //console.log('regex->>>>>>>>>>>>>>>>>',regex)
    // //console.log('strregex->>>>>>>>>>>>>>',strregex)

    postsdata.aggregate([
      { "$match":{"posted_at": {"$lte": Date.now() },'deleted':false,$or: [{ "tags": {"$in" : regex } }, {"searchcontent":{"$in" : strregex }} ] }},
      { "$sort": {"posted_at": -1}},
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
                     "searchcontent":1,
                     "questionid":1,
                     "questiontype":1,
                     "childquestionid":1,
                     "pollid":1,
                     "eventid":1,
                     "articleid":1,
                     "tags":1,
                     "resourceid":1,
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
      ]).then(function(getPosts)
      {
        // //console.log('getposts-',getPosts)
        if(getPosts.length > 0)
        {
          var counter = -1;
          const post_likes= db.get('post_likes');
          const post_comments= db.get('comments');
          const categories= db.get('categories');
          const tags= db.get('tags');
          const questions= db.get('questions');
          const casequestions= db.get('casequestions');
          const polls= db.get('polls');
          const pollsoptions= db.get('polls_options');
          const pollssubmit= db.get('polls_submitions');
          const authors= db.get('users');
          const article_sections= db.get('article_sections');
          const post_saves= db.get('post_saves');
          const question_options= db.get('question_options');
          const question_answers= db.get('question_answers');
          const casequestion_answers= db.get('casequestion_answers');
          const case_comments= db.get('case_comments')
          asyncLoop(getPosts, function (post, next)
          {
            counter++
            getPosts[counter]['likestatus'] = 0;
            getPosts[counter]['likes'] = 0;
            getPosts[counter]['dislikes'] = 0;
            getPosts[counter]['alltags'] = [];
            getPosts[counter]['pollactive'] = true;
            getPosts[counter]['polldata'] = {};
            getPosts[counter]['polloptions'] = [];
            getPosts[counter]['pollrescount'] = 0;
            getPosts[counter]['mypollans'] = '';
            getPosts[counter]['questiondata'] = {};
            getPosts[counter]['articledata'] = {};
            getPosts[counter]['questionoptions'] = [];
            getPosts[counter]['allcomments'] = [];
            getPosts[counter]['allsaveposts'] = 0;
            getPosts[counter]['questionanswer']=[];
            getPosts[counter]['answercheck']=false;
            getPosts[counter]['answercount']=0;
            getPosts[counter]['refPost']=[];
            getPosts[counter]['resourceidstatus']=false;
            if(post.parentid!==null)
            {
                postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                {
                  if(refPostdata!=null)
                  {
                    authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                    {
                        refPostdata.refusers=refuser
                    })
                    getPosts[counter]['refPost'] = refPostdata;
                  }
                })
            }
            else { //console.log("noparentid");
         }
            if(post.resourceid)
            {   getPosts[counter]['resourceidstatus']=post.resourceid;  }
            else { getPosts[counter]['resourceidstatus']=false; }
            if(post.tags)
            {
                var taguniqs = post.tags.split(",");
                if(post.questionid!==null && post.questionid!==''){
                  var condfortag={'unique_id' : { $in : taguniqs } ,'questionvisible':true}
                }
                else{
                    var condfortag={'unique_id' : { $in : taguniqs } }
                }
                categories.aggregate([
                  {$match:condfortag},
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
                  tags.find(condfortag).then(function(getTags)
                  {
                      var alltags=getCategories.concat(getTags);
                      if(alltags != undefined && alltags.length > 0)
                      {  getPosts[counter]['alltags'] = alltags;  }
                  });
                });
            }
            else
            {  //console.log("notags");
        }
            if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14' && post.childquestionid==null)
            {
                //console.log('this is if');
                casequestions.findOne({'q_order': 1,'parentqid':post.questionid}).then(function(findquestion)
                {
                  if(findquestion != null)
                  {
                    getPosts[counter]['questiondata'] = findquestion;
                    var qid=findquestion._id.toString();
                    casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
                    {
                      if(findanswer != undefined && findanswer.length > 0)
                      {
                        getPosts[counter]['questionanswer'] = findanswer;
                        getPosts[counter]['answercheck']=true;
                      }
                      else
                      { //console.log("nooptions");
                     }
                    })
                    case_comments.find({'parentqid': post.questionid}).then(function(findcommentd)
                    {
                      if(findcommentd != undefined && findcommentd.length > 0)
                      { getPosts[counter]['allcomments'] = findcommentd;  }
                      else{ //console.log("nooptions");
                    }
                    })
                    casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer)
                    {
                      if(findcountanswer != undefined && findcountanswer.length > 0)
                      { getPosts[counter]['answercount']=findcountanswer.length;  }
                      else{ //console.log("nooptions");
                     }
                    })
                  }
                })
            }
            else if(post.questionid!=null && post.questionid!='' && post.questiontype=='5d15fea98edfed6c417592d14')
            {
                // //console.log('this is if');
                casequestions.findOne({'_id': post.childquestionid}).then(function(findquestion)
                {
                  if(findquestion != null)
                  {
                      getPosts[counter]['questiondata'] = findquestion;
                      var qid=findquestion._id.toString();
                      casequestion_answers.find({'pquestionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
                      {
                        if(findanswer != undefined && findanswer.length > 0)
                        {
                          getPosts[counter]['questionanswer'] = findanswer;
                          getPosts[counter]['answercheck']=true;
                        }
                        else
                        { //console.log("nooptions");
                    }
                      })
                      case_comments.find({'parentqid': post.questionid}).then(function(findcommentd)
                      {
                        if(findcommentd != undefined && findcommentd.length > 0)
                        { getPosts[counter]['allcomments'] = findcommentd; }
                        else
                        {  //console.log("nooptions");
                    }
                      })
                      casequestion_answers.find({'pquestionid': qid}).then(function(findcountanswer)
                      {
                        if(findcountanswer != undefined && findcountanswer.length > 0)
                        { getPosts[counter]['answercount']=findcountanswer.length; }
                        else{ //console.log("nooptions");
                     }
                      })
                  }
                })
            }
            else if(post.questionid)
            {
                // //console.log('this is else if');
                questions.findOne({'_id': post.questionid}).then(function(findquestion)
                {
                  if(findquestion != null)
                  {
                    getPosts[counter]['questiondata'] = findquestion;
                    var qid=findquestion._id.toString();
                    question_options.find({'questionid': qid}).then(function(findqoptions)
                    {
                        if(findqoptions != undefined && findqoptions.length > 0)
                        { getPosts[counter]['questionoptions'] = findqoptions;  }
                        else{ //console.log("nooptions");
                    }
                    })
                    console.log("qid", qid)
                    question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer)
                    {
                        console.log("findanswer", findanswer)
                      if(findanswer != undefined && findanswer.length > 0)
                      {
                        getPosts[counter]['questionanswer'] = findanswer;
                        getPosts[counter]['answercheck']=true;
                      }
                      else{ //console.log("nooptions");
                    }
                    })
                    question_answers.find({'questionid': qid}).then(function(findcountanswer)
                    {
                      if(findcountanswer != undefined && findcountanswer.length > 0)
                      { getPosts[counter]['answercount']=findcountanswer.length; }
                      else{ //console.log("nooptions");
                    }
                    })
                  }
                })
            }
            else
            { //console.log("noquestion");
        }
            if(post.articleid)
            {
                article_sections.aggregate([
                  { "$match":{'articleid': post.articleid,'a_order':1}},
                  { "$addFields": { "artid": { "$toObjectId": "$articleid" }}},
                  { $lookup:
                          {
                                      from: "articles",
                                      localField: "artid",
                                      foreignField: "_id",
                                      as: "articaldata"
                          }
                  },
                  { "$unwind": "$articaldata" },
                  { "$project": {
                              "articleid":1,
                              "uploaded_file":1,
                              "section_uploaded_file":1,
                              "article_content":1,
                              "articaldata.author_name":1,
                              "articaldata.a_title":1
                          }
                  }
                ]).then(function(findarticle)
                {
                  if(findarticle != null){
                    if(findarticle[0].section_uploaded_file!=null && findarticle[0].section_uploaded_file!=''){
                      findarticle[0].uploaded_file=findarticle[0].section_uploaded_file.split(',');
                    }else if(findarticle[0].uploaded_file!=null && findarticle[0].uploaded_file!=''){
                      findarticle[0].uploaded_file=findarticle[0].uploaded_file.split(',');
                    }else{
                          findarticle[0].uploaded_file=[];
                    }
                    findarticle[0].partcontent=findarticle[0].article_content;
                    authors.findOne({'unique_id':findarticle[0].articaldata.author_name}).then(function(findauthor){
                      findarticle[0].author=findauthor;
                    }).catch(function(error){
                        //console.log('author not find')
                        findarticle[0].author=null;
                      });
                    getPosts[counter]['articledata'] = findarticle;
                  }
                })
            }
            else
            {
                //console.log("no article");
                post.articleid=null;
            }
            if(post.pollid)
            {
                polls.findOne({'_id': post.pollid, "endDays": {"$gt": Date.now() }}).then(function(findpoll)
                {
                  if(findpoll != null)
                  {
                    getPosts[counter]['polldata'] = findpoll;
                    var qid=findpoll._id.toString();
                    pollssubmit.findOne({'pollid':qid, 'created_by':req.body.loginid }).then(function(finduserpollans)
                    {
                      if(finduserpollans!=null)
                          getPosts[counter]['mypollans'] = finduserpollans.optionid;
                    })
                    pollssubmit.find({'pollid': qid, 'postid':post.unique_id}).then(function(allpollres)
                    {
                      getPosts[counter]['pollrescount'] = allpollres.length;
                    });
                    pollsoptions.find({'poll_id': qid}).then(function(findpoptions)
                    {
                      if(findpoptions != undefined && findpoptions.length > 0)
                      {
                              findpoptions.forEach(function(poption,index)
                              {
                                  var optid=poption._id.toString();
                                  pollssubmit.find({'pollid':qid, 'optionid': optid}).then(function(findoptioncount)
                                  {
                                    if(findoptioncount.length > 0)
                                    {
                                      var c1 = (findoptioncount.length*100)/getPosts[counter]['pollrescount'];
                                      // //console.log('c1-',c1)
                                      if(c1!=Infinity)
                                      {
                                        poption.count=Number(c1).toFixed(2);
                                      }
                                      else
                                      {
                                        poption.count=0;
                                      }
                                    }
                                    else{poption.count=0;}
                                  })
                              });
                              getPosts[counter]['polloptions'] = findpoptions;
                      }
                      else{ //console.log("nooptions");
                     }
                    })
                  }
                  else
                  {
                      getPosts[counter]['pollactive'] = false;
                      postsdata.findOneAndUpdate({'pollid':post.pollid},{ $set: {'deleted':true}}).then(function(updatepollstatus)
                      {
                        //   //console.log('poll deactivated')
                      });
                  }
                })
            }
            else
            {
                // //console.log("no poll");
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
                        if(post.questiontype!='5d15fea98edfed6c417592d14'){
                            getPosts[counter]['allcomments'] = findcomments;
                        }
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
              }
              res.json(getPosts);
          });
        }
        else
        {
          res.json(getPosts);
        }
      });//end of getPosts
      // res.json(s_tag)
    });//tags
}

// get latest post

module.exports.toCheckNewPost = async (req, res) => {
    let Posts = db.get('posts');

    let newPost =  await Posts.aggregate([
        {$match: {'deleted':false} },
        {$sort: {_id: -1} },
        { "$limit" : 1 },
        {$project: {
            "unique_id":1,
            "_id":1
        }}
    ])
    if(newPost.length == 0){
        res.send({
            "message": `no data found`,
            "status": false,
            "post": []
        })
    }else {
        res.send({
            'message': "data feched successfully",
            'status': true,
            "post": newPost
        })
    }
}

// to fetch the count for different tags
module.exports.countForTags = async (req, res) => {
    const postsdata = db.get('posts');
    let reqTag = req.body.reqTag
    let finalArray = []
    let others
    let totalCount = 0

    asyncLoop(reqTag, async function (tags, next){
        let cond
        if (req.body.reqFor === "resources"){
            cond = {"posted_at": {"$lte": Date.now() },'deleted':false, 'resourceid' :true,"tags":{"$regex": tags } }
        }else{
            cond = {"posted_at": {"$lte": Date.now() },'deleted':false, "tags":{"$regex": tags } }
        }
        let postData = await postsdata.aggregate([
            {$match:  cond },
            {$group: { _id: null, count: { $sum: 1 } } }
        ])
        if (postData.length > 0){
            if(tags == ""){
                others = postData[0].count
            }else{
                totalCount += postData[0].count
                let obj = {[tags]: postData[0].count }
                finalArray.push(obj)
            }
        }
        next()
    }, () => {
        res.send({
            "message": `fetched successfully`,
            "data": finalArray,
            "others": [others - totalCount]
        })
    })
}