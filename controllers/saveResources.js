// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
const resource_categories = db.get('resource_categories');
var asyncLoop = require('node-async-loop');

module.exports.updateoldResources = (req, res) => {
    const postsdata= db.get('posts');
    const options = {upsert: true,returnNewDocument: true};
    postsdata.find({"resourceid":true,"deleted": false}).then(function(getResources)
    {
        getResources.forEach(function(resource)
        {
            resource_categories.findOneAndUpdate({"postId": resource.unique_id, "resource_category": 'latest01'},{$set:{
                postId:resource.unique_id,
                created_at: resource.posted_at,
                created_by: resource.created_by,
                resource_category : 'latest01'
                }},options)
          
        }) 
     
        res.send(getResources);

    });
}
module.exports.saveResources = (req, res) => {

    let postId = req.body.postId;
    let resourceType = req.body.resourceType;
    let user = req.body.user;
    const options = {upsert: true,returnNewDocument: true};

    asyncLoop(resourceType, async function (item, next){
    let resourceCategory = "";
    let resourceCategoryDelete = "";

    if(item.value == true){
        resourceCategory = item.key
    }else if (item.value == false) {
        resourceCategoryDelete = item.key
    }

    if(resourceCategory ==  "" && postId == "" && user == ""){
        next()
    } else {
        resource_categories.findOneAndUpdate({"postId": postId, "resource_category": resourceCategory},{$set:{
            postId,
            created_at: Date.now(),
            created_by: user,
            resource_category : resourceCategory
            }},options)

        resource_categories.remove({"postId": postId, "resource_category": resourceCategoryDelete})
        next();
    }

    },  function (err)
    {
        if (err){
            console.log("err", err)
            res.send({
                "message": `data can not inserted please try again`,
                "status": false
            })
        }
        res.send({
            "message": `data inserted successfully`,
            "status": true
        })
    });
}

module.exports.getSaveResource = async (req, res) => {

    const tags=db.get('tags');
    const postsdata= db.get('posts');

    let user = req.body.user;
    let range = Number(req.body.range);
    if (!req.body.range){
        range = 100
    }
    let resourceType = req.body.resourceType;
    let resourceCategory;
    if(resourceType === "featured"){
        resourceCategory = "featured06"
    } else if(resourceType === "latest"){
        resourceCategory = "latest01"
    } else if(resourceType === "recommended"){
        resourceCategory = "recommended02"
    } else if(resourceType === "mustRead"){
        resourceCategory = "mustRead03"
    } else if(resourceType === "audio"){
        resourceCategory = "audio04"
    } else if(resourceType === "video"){
        resourceCategory = "video05"
    } else {
        res.send({
            "message": `not a valid category`,
            "status": false
        })
    }

    let resultData = []
    let distinctData = await resource_categories.aggregate([
        // {$match:{"created_by": user, "resource_category": resourceCategory}},
        {$match:{"resource_category": resourceCategory}},
        {$addFields: {"postId": "$postId"}},
        {"$project": {"postId" : 1, "_id":0}}
    ])
    distinctData.forEach(function(u) { resultData.push(u.postId) })


        var cond={"posted_at": {"$lte": Date.now() },"resourceid":true,'unique_id': { $in: resultData}}

          postsdata.aggregate(
          [
            { "$match":{'unique_id':{ $in: resultData}, "deleted":false}},
            { "$limit" : range+1 },
            // { "$sort": {"posted_at": -1}},
            // { "$sort": {"_id": -1}},
            {$addFields : {"__order" : { "$indexOfArray" : [ resultData, "$unique_id" ] } } },
            {"$sort": { "__order" : -1 }},
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
                    "userdetail.profile":1,
                    "videoThumbnail":1

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
                    getPosts[counter]['videoUrl'] = [];
                    getPosts[counter]['imageUrl'] = [];
                    getPosts[counter]['uniqueId'] = [];

                    getPosts[counter]['uniqueId'] = [post.unique_id];


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
                            let data = await text.match(urlRegex);
                            return data
                        }
                        var html = await urlify(post.content);
                        if(html == null){
                            getPosts[counter]['imageUrl'] = ["<img src=\"https://exams.gpex.org.au/public?file=/icons/noimage.png\" class=\"p-fileprev\">"
                        ]

                        } else{
                            getPosts[counter]['imageUrl'] = html

                        }

                    }

                    if(post.parentid!==null)
                    {

                        postsdata.findOne({"unique_id":post.parentid},async function(err,refPostdata)
                        {
                          authors.findOne({'unique_id':refPostdata.created_by}).then(async function(refuser)
                          {
                              refPostdata.refusers=refuser
                          })
                          getPosts[counter]['refPost'] = refPostdata;
                        getPosts[counter]['uniqueId'] = [post.refPost.unique_id];


                          // to extract video url
                          if (getPosts[counter]['videoUrl'].length == 0){
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

                            // to extract image url
                            if (arrayFilled == false){
                                if (post.refPost.content !== null){
                                    async function urlify(text) {
                                        var urlRegex = /<img [^>]*src="[^"]*"[^>]*>/gm
                                        if(urlRegex!==undefined){
                                            var data = await text.match(urlRegex);
                                        }else{
                                            var data='';
                                        }
                                        return data;
                                    }
                                    var html = await urlify(post.refPost.content);
                                   // console.log('html',html);

                                    if(html == null){
                                        getPosts[counter]['imageUrl'] =  ["<img src=\"https://exams.gpex.org.au/public?file=/icons/noimage.png\" class=\"p-fileprev\">"
                                    ]

                                    } else{
                                        getPosts[counter]['imageUrl'] = html

                                    }
                                }
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
                        //console.log("taguniqs- ",taguniqs);

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
                                   // console.log(findqoptions)
                            if(findqoptions != undefined && findqoptions.length > 0){
                                getPosts[counter]['questionoptions'] = findqoptions;


                            }else{
                               // console.log("nooptions");
                            }

                        })
                        question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                           // console.log(findanswer)
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
                                "articaldata.a_title":1 ,
                                "articaldata.created_at":1

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

        // to get post by search content
exports.getResourceByTitle = async function(req,res)
{
    let user = req.body.user
    var latest = [];
    var recommended = [];
    var mustRead = [];
    var audio = [];
    var video = [];
    var featured = [];

    let toCallApi = ["latest01", "recommended02", "mustRead03", "audio04", "video05"]

    // to call for all the categories

    const resource_categories = db.get('resource_categories');

    if(req.body.searchedtitle==null || req.body.searchedtitle=='')
    {
        res.send({latest, recommended, mustRead, audio, video, featured})
    }
    else
    {
        asyncLoop(toCallApi, async function (item, next){
        let resultData = []

        let distinctData = await resource_categories.aggregate([
            {$match:{"resource_category": item}},
            {$addFields: {"postId": "$postId"}},
            {"$project": {"postId" : 1, "_id":0}}
        ])
        distinctData.forEach(function(u) { resultData.push(u.postId) })

      var search_title=req.body.searchedtitle.trim()
      const postsdata= db.get('posts');
      postsdata.aggregate([
        { "$match":{'unique_id':{ $in: resultData}}},
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
                     "userdetail.profile":1,
                    "videoThumbnail":1


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
                getPosts[counter]['uniqueId'] = [];

                getPosts[counter]['uniqueId'] = [post.unique_id];


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
                        let data = await text.match(urlRegex);
                        return data
                    }
                    var html = await urlify(post.content);
                    if(html == null){
                        getPosts[counter]['imageUrl'] = ["<img src=\"https://exams.gpex.org.au/public?file=/icons/noimage.png\" class=\"p-fileprev\">"
                    ]

                    } else{
                        getPosts[counter]['imageUrl'] = html

                    }

                }


                if(post.parentid!==null)
                {

                    postsdata.findOne({"unique_id":post.parentid},async function(err,refPostdata)
                    {
                      authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                      {
                          refPostdata.refusers=refuser
                      })
                      getPosts[counter]['refPost'] = refPostdata;
                    getPosts[counter]['uniqueId'] = [post.refPost.unique_id];


                       // to extract video url
                       if (getPosts[counter]['videoUrl'].length == 0){
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

                    // to extract image url
                    if (arrayFilled == false){
                        if (post.refPost.content !== null){
                            async function urlify(text) {
                                var urlRegex = /<img [^>]*src="[^"]*"[^>]*>/gm
                                if(urlRegex!==undefined){
                                    var data = await text.match(urlRegex);
                                }else{
                                    var data='';
                                }
                                return data;
                            }
                            var html = await urlify(post.refPost.content);
                           // console.log('html',html);

                            if(html == null){
                                getPosts[counter]['imageUrl'] =  ["<img src=\"https://exams.gpex.org.au/public?file=/icons/noimage.png\" class=\"p-fileprev\">"
                            ]

                            } else{
                                getPosts[counter]['imageUrl'] = html

                            }
                        }
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
                if(post.tags){
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
                   // console.log("notags");

                }
                if(post.questionid){

                    questions.findOne({'_id': post.questionid}).then(function(findquestion){

                        if(findquestion != null){
                            getPosts[counter]['questiondata'] = findquestion;
                            var qid=findquestion._id.toString();
                            question_options.find({'questionid': qid}).then(function(findqoptions){
                               // console.log(findqoptions)
                        if(findqoptions != undefined && findqoptions.length > 0){
                            getPosts[counter]['questionoptions'] = findqoptions;


                        }else{
                           // console.log("nooptions");
                        }

                    })
                    question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                if(findanswer != undefined && findanswer.length > 0){
                    getPosts[counter]['questionanswer'] = findanswer;
                    //getPosts[counter]['questionoptions']['questionanswer'] = findanswer;
                    getPosts[counter]['answercheck']=true;


                }else{
                   // console.log("nooptions");
                }

            })

                        }
                    })
                } else {
                  //  console.log("noquestion");

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
                        if(findpoptions != undefined && findpoptions.length > 0)
                        {
                            getPosts[counter]['polloptions'] = findpoptions;
                        }
                        else{
                            // console.log("nooptions");
                     }
                      })
                    }
                  })
                } else {
                   // console.log("no poll");
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
                // res.json(getPosts);
                // console.log(getPosts)
                if (item === "latest01"){
                    latest.push(getPosts)
                    next()
                } else if(item === "recommended02"){
                    recommended.push(getPosts)
                    next()
                } else if (item === "mustRead03"){
                    mustRead.push(getPosts)
                    next()
                } else if (item === "audio04"){
                    audio.push(getPosts)
                    next()
                } else if (item === "video05"){
                    video.push(getPosts)
                    next()
                } else if (item === "featured06"){
                    featured.push(getPosts)
                    next()
                }
            });
        }
        else
        {
            next()
            //console.log("therer is some problem")
        }
    });
}, (err) => {
    res.send({latest, recommended, mustRead, audio, video, featured})
})
}
}

// get post data by id
module.exports.getPostDataById = async (req, res) => {
    const postsdata= db.get('posts');


    postsdata.aggregate(
        [
          { "$match":{'unique_id':req.body.uniqueId}},
          { "$sort": {"posted_at": -1}},
          { "$sort": {"_id": -1}},
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
                  "userdetail.profile":1,
                  "videoThumbnail":1

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

                  // to extract video url
                  getPosts[counter]['videoUrl'] = [];
                  if(post.content){
                      function urlify(text) {
                          var urlRegex = /(<iframe.+?<\/iframe>)/g;
                          let data = text.match(urlRegex);
                          return data;
                      }

                      var html = urlify(post.content);
                     // console.log("html", html)
                      if(html == null){
                          getPosts[counter]['videoUrl'] = []
                      } else{
                          getPosts[counter]['videoUrl'] = html
                      }
                  }

                  if(post.parentid!==null)
                  {
                      postsdata.findOne({"unique_id":post.parentid},function(err,refPostdata)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                        {
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
                  if(post.tags)
                  {
                      var taguniqs = post.tags.split(",");
                      //console.log("taguniqs- ",taguniqs);

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
                                 // console.log(findqoptions)
                          if(findqoptions != undefined && findqoptions.length > 0){
                              getPosts[counter]['questionoptions'] = findqoptions;


                          }else{
                             // console.log("nooptions");
                          }

                      })
                      question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                         // console.log(findanswer)
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
                              "articaldata.a_title":1 ,
                              "articaldata.created_at":1

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
// get post by user details
exports.getPostByUserDetail = async function(req,res)
{
    var search_user= req.body.searcheduser.trim();
    let user = req.body.user

    if(search_user==null || search_user=='')
    {
        res.send([])

    }
    else
    {
        const Posts = db.get('posts');
        const Users = db.get('users');
        const Articles = db.get('articles')
        let resultData = []

        let resourceCat = await resource_categories.aggregate([
            {
                $lookup:{
                    from: "posts",
                    localField: "postId",
                    foreignField: "unique_id",
                    as: "postdata"
                }
            },
            { "$unwind": "$postdata"},
            {$project: {
                "_id":0,
                "postdata.created_by": 1,
            }}

        ])
        resourceCat.forEach(function(u) { resultData.push(u.postdata.created_by) })
        Users.aggregate([
            {$match: {"unique_id":{ $in: resultData}} },
            {$match:{'firstname' : new RegExp(search_user, 'i')}},
            {$limit :10},
            ]).then(function(getselusers){
                var finalusers=[];
                var finaluserscount=[];
               if(getselusers.length > 0){
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
               } else {
                res.send([])
               }
            });
    }
}


// get all post detail by user name
module.exports.postByUserName = async (req, res) => {
    let loginid = req.body.loginid;
    let userid = req.body.userid;
    const postsdata= db.get('posts');
    var latest = [];
    var recommended = [];
    var mustRead = [];
    var audio = [];
    var video = [];
    var featured = [];

    let toCallApi = ["latest01", "recommended02", "mustRead03", "audio04", "video05"]

    asyncLoop(toCallApi, async (item, next) => {

        let resultData = []

        let distinctData = await resource_categories.aggregate([
            {$match:{"resource_category": item}},
            {$addFields: {"postId": "$postId"}},
            {"$project": {"postId" : 1, "_id":0}}
        ])

        // console.log("distinctData", distinctData)

        distinctData.forEach(function(u) { resultData.push(u.postId) })

        postsdata.aggregate(
            [
                {"$match":{"posted_at": {"$lte": Date.now() }, "resourceid":true, 'questionid':null, "unique_id":{ $in: resultData} }},
                {"$sort": {"posted_at": -1}},
                {"$sort": {"_id": -1}},
                {"$limit" : 20 },
                {"$match": {"created_by":userid }},
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
                             "userdetail.profile":1,
                              "videoThumbnail":1

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
                    getPosts[counter]['answercount']=0;
                    getPosts[counter]['refPost']=[];
                    getPosts[counter]['resourceidstatus']=false;
                    getPosts[counter]['videoUrl'] = [];
                    getPosts[counter]['imageUrl'] = [];
                    getPosts[counter]['uniqueId'] = [];

                    getPosts[counter]['uniqueId'] = [post.unique_id];


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
                            let data = await text.match(urlRegex);
                           // console.log("data >>>>>> ", data)
                            return data
                        }
                        var html = await urlify(post.content);
                        if(html == null){
                            getPosts[counter]['imageUrl'] = []

                        } else{
                            getPosts[counter]['imageUrl'] = html

                            varTracker = true
                        }

                    }
                    if(post.parentid!==null)
                    {

                       postsdata.findOne({"unique_id":post.parentid}, async function(err,refPostdata)
                            {
                              authors.findOne({'unique_id':refPostdata.created_by}).then(function(refuser)
                              {
                                //  console.log(refuser)
                                  refPostdata.refusers=refuser
                              })
                              getPosts[counter]['refPost'] = refPostdata;
                            getPosts[counter]['uniqueId'] = [post.refPost.unique_id];

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
                                                    let data = await text.match(urlRegex);
                                                    return data
                                                }
                                                var html = await urlify(post.refPost.content);
                                                if(html == null){
                                                    getPosts[counter]['imageUrl'] = []

                                                } else{
                                                    getPosts[counter]['imageUrl'] = html
                                                }
                                        }
                                    }
                            })
                    }
                    else {
                        // console.log("noparentid");
                 }
                    if(post.resourceid)
                    {
                        getPosts[counter]['resourceidstatus']=post.resourceid;
                    }
                    else { getPosts[counter]['resourceidstatus']=false; }
                    if(post.tags)
                    {
                       var taguniqs = post.tags.split(",");
                            //console.log("taguniqs- ",taguniqs);

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
                        questions.findOne({'_id': post.questionid}).then(function(findquestion)
                        {
                            if(findquestion != null)
                            {
                                getPosts[counter]['questiondata'] = findquestion;
                                var qid=findquestion._id.toString();
                                question_options.find({'questionid': qid}).then(function(findqoptions){
                                    //console.log(findqoptions)
                                    if(findqoptions != undefined && findqoptions.length > 0)
                                    { getPosts[counter]['questionoptions'] = findqoptions; }
                                    else{
                                       //  console.log("nooptions");
                                         }
                                })
                                question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                                   // console.log(findanswer)
                                    if(findanswer != undefined && findanswer.length > 0)
                                    {
                                            getPosts[counter]['questionanswer'] = findanswer;
                                            getPosts[counter]['answercheck']=true;
                                    }
                                    else{
                                       // console.log("nooptions");
                                }
                                })
                                question_answers.find({'questionid': qid}).then(function(findcountanswer){
                                    //console.log(findcountanswer)
                                    if(findcountanswer != undefined && findcountanswer.length > 0)
                                    { getPosts[counter]['answercount']=findcountanswer.length;}
                                    else{
                                        // console.log("nooptions");
                                 }
                                })
                            }
                        })
                    }
                    else{
                        //console.log("noquestion");
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
                                    "articaldata.a_title":1  ,
                                    "articaldata.created_at": 1

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
                                   // console.log('author not find')
                                    findarticle[0].author=null;
                                });
                                getPosts[counter]['articledata'] = findarticle;
                            }
                        })
                    }
                    else {
                       // console.log("no article");
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
                                { getPosts[counter]['polloptions'] = findpoptions; }
                                else{
                                    // console.log("nooptions");
                                    }
                              })
                            }
                        })
                    }
                    else {
                       // console.log("no poll");
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
                    if (item === "latest01"){
                        latest.push(getPosts)
                        next()
                    } else if(item === "recommended02"){
                        recommended.push(getPosts)
                        next()
                    } else if (item === "mustRead03"){
                        mustRead.push(getPosts)
                        next()
                    } else if (item === "audio04"){
                        audio.push(getPosts)
                        next()
                    } else if (item === "video05"){
                        video.push(getPosts)
                        next()
                    } else if (item === "featured06"){
                        featured.push(getPosts)
                        next()
                    }
                });
                }
                else{
                    next()
                 }
            });

    }, (err) => {
        if (!err) {
            res.send({latest, recommended, mustRead, audio, video, featured})
        } else{
            res.send({latest, recommended, mustRead, audio, video, featured})
        }
    })
}

// to get resources by tag name
module.exports.getPostsByTagName = (req, res) => {

    let loginid =  req.body.loginid;

    var latest = [];
    var recommended = [];
    var mustRead = [];
    var audio = [];
    var video = [];
    var featured = [];

    let toCallApi = ["latest01", "recommended02", "mustRead03", "audio04", "video05"]

    asyncLoop(toCallApi, async (item, next) => {

        const tags=db.get('tags');
  const postsdata= db.get('posts');
  //console.log('input-',req.body.seltags)
  if(req.body.seltags.length>0 || req.body.seltags=='')
  {
      let resultData = []

        let distinctData = await resource_categories.aggregate([
            {$match:{"resource_category": item}},
            {$addFields: {"postId": "$postId"}},
            {"$project": {"postId" : 1, "_id":0}}
        ])
        distinctData.forEach(function(u) { resultData.push(u.postId) })


        postsdata.aggregate(
        [
        {"$match": { "unique_id":{ $in: resultData}}},
        { "$match":{ 'tags': new RegExp(req.body.seltags, 'i') }},
        // { "$match":cond},
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
                  "userdetail.profile":1,
                  "videoThumbnail":1
                }
          }
        ]).then(function(getPosts)
        {
            if(item == "recommended02"){
               // console.log("getPosts", getPosts)
            }

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
                  getPosts[counter]['videoUrl'] = [];
                  getPosts[counter]['imageUrl'] = [];
                  getPosts[counter]['uniqueId'] = [];

                  getPosts[counter]['uniqueId'] = [post.unique_id];


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
                            let data = await text.match(urlRegex);
                           // console.log("data >>>>>> ", data)
                            return data
                        }
                        var html = await urlify(post.content);
                        if(html == null){
                            getPosts[counter]['imageUrl'] = []

                        } else{
                            getPosts[counter]['imageUrl'] = html

                            varTracker = true
                        }

                    }

                  if(post.parentid!==null)
                  {
                      postsdata.findOne({"unique_id":post.parentid},async function(err,refPostdata)
                      {
                        authors.findOne({'unique_id':refPostdata.created_by}).then(async function(refuser)
                        {
                           // console.log(refuser)
                            refPostdata.refusers=refuser
                        })
                        getPosts[counter]['refPost'] = refPostdata;
                        getPosts[counter]['uniqueId'] = [post.refPost.unique_id];

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
                                            let data = await text.match(urlRegex);
                                            return data
                                        }
                                        var html = await urlify(post.refPost.content);
                                        if(html == null){
                                            getPosts[counter]['imageUrl'] = []

                                        } else{
                                            getPosts[counter]['imageUrl'] = html
                                        }
                                }
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
                      //console.log("taguniqs- ",taguniqs);

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
                                 // console.log(findqoptions)
                          if(findqoptions != undefined && findqoptions.length > 0){
                              getPosts[counter]['questionoptions'] = findqoptions;


                          }else{
                             // console.log("nooptions");
                          }

                      })
                      question_answers.find({'questionid': qid,'answerby':req.body.loginid}).then(function(findanswer){
                         // console.log(findanswer)
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
                  if (err)
                    { console.error('Inner Error: ' + err.message);}
                    if (item === "latest01"){
                        latest.push(getPosts)
                        next()
                    } else if(item === "recommended02"){
                        recommended.push(getPosts)
                        next()
                    } else if (item === "mustRead03"){
                        mustRead.push(getPosts)
                        next()
                    } else if (item === "audio04"){
                        audio.push(getPosts)
                        next()
                    } else if (item === "video05"){
                        video.push(getPosts)
                        next()
                    } else if (item === "featured06"){
                        featured.push(getPosts)
                        next()
                    }
              });
            }//if
            else
            {
              next()
            }
        });  //end of getPosts
      // res.json(s_tag)
    // });
  }
  else
  {
    next()
  }
    }, (err) => {
        if (!err){
            res.send({latest, recommended, mustRead, audio, video, featured})

        }else{
            res.send({latest, recommended, mustRead, audio, video, featured})
        }
    })
}

// get first 20 question ID(s)
module.exports.questionIds = async (req, res) => {
    const Questions =  db.get('questions');

    let questionIds =  await Questions.aggregate([
        //{$match: {"publish_date": {"$lte": Date.now() },"deleted": 0,"questiontype":{$in:["5d15fea98edfed6c417592d14","5d15fea98edfed6c417592d9"]}}},
        {$match: {"publish_date": {"$lte": Date.now() },"deleted": 0}},
        {"$sort": {"publish_date": -1}},
        { "$limit" : 100 },
        {$project: {
            "_id" : 1,
                "questiontype":1
        }}
    ])

    if (questionIds.length > 0){
        res.send({
            "message": "data fetched successfully",
            "status": true,
            "data": questionIds
        })
    }else {
        res.send({
            "message": " no data found",
            "status": false,
            "data": []
        })
    }
}



// get all post data for report
module.exports.getAllPosts = async (req, res) => {
    const Posts = db.get('posts');

    let allPosts =  await Posts.aggregate([
        {$match: {"deleted": false, "questionid": null} } ,
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
          {
            $lookup:
            {
                from: "resource_categories",
                localField: "unique_id",
                foreignField: "postId",
                as: "resources"
            }
          },
          { "$lookup": {
            "let": { "postId": { "$toObjectId": "$articleid" } },
            "from": "articles",
            "pipeline": [
              { "$match": { "$expr": { "$eq": [ "$_id", "$$postId" ] } } },
            ],
            "as": "articles"
          }},

        // {$match: {"resources.resource_category": {$ne:"latest01"}  }},

    ]);


    if (allPosts.length > 0){
        res.send({
            "message": 'data sucessfully fetched',
            "status": true,
            'data': allPosts
        })
    }else {
        res.send({
            "message": "data not found",
            "status": false,
            "data": []
        })
    }
}

// to fetch data for check box
module.exports.fetchDataForCheck = async (req, res) => {
    let postId = req.body.postId
    let created_by = req.body.created_by

    resource_categories.aggregate([
        {$match: {"postId": postId, "created_by": created_by}}
    ], (err, data) => {
        if (!err){
            res.send(data)
        }else {
            res.sedn([])
        }
    })

}


// to get the posts to view in the new page
module.exports.getPostToView = async (req, res) => {
    let Posts = db.get('posts');
    const post_saves= db.get('post_saves');


    let postId = req.body.postId;
    let userId = req.body.userId

    try {
        let postData = await Posts.aggregate([
            {$match: { "unique_id": postId}},
            {
                $lookup:
                {
                    from: "post_likes",
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$likeby', userId] } } ]} } ,
                            {'$match':  { $or: [ { '$expr': { '$eq': [ "$postid", postId ] }} ]} }
                        ],
                    as: "likes"
                }
              },

              {
                $lookup:
                {
                    from: "comments",
                    localField: postId,
                    foreignField: "postid",
                    as: "comments"
                }
              },

              {
                $lookup:
                {
                    from: "users",
                    localField: "created_by",
                    foreignField: "unique_id",
                    as: "refusers"
                }
              },

              {$project: {
                  "refusers.password": 0,
                  "refusers.email": 0

              }}
        ]);

        if (postData.length > 0){
            let savedPost = await  post_saves.aggregate([
                {$match: {"created_by": userId, "postid": postId}}
            ]);

            if (savedPost.length > 0){
                postData[0]["savedPost"] = savedPost;
            }else{
                postData[0]["savedPost"] = []
            }
        }

        if(postData.length > 0 && postData[0].parentid !== null){
            let refPostData  = await Posts.findOne({"unique_id":postData[0].parentid})
            if(refPostData){
                postData[0]["refPost"] = refPostData;
            }
         }else{
            postData[0]["refPost"] = null
        }

        if (postData.length > 0){
            res.send({
                "message": "data fetched successfully",
                "status": true,
                "data": postData
            })
        }else{
            throw new Error('no data found');
        }

    } catch (error) {
        console.log("error >> ", error);
        res.send({
            "message": "there is an error while fetching data",
            "status": false,
            "data": []
        })

    }
}

// to add thumnail to the post
module.exports.addThumnailToVideo = async (req, res) => {
    let postId = req.body.postId
    let videoThumbnailPath = req.body.videoThumbnailPath

    const Posts = db.get('posts');
    const options = {upsert: true,returnNewDocument: true};


    Posts.findOneAndUpdate({"unique_id": postId},{$set:{
    'videoThumbnail': videoThumbnailPath
    }},options)
    .then( () => {
        res.send({
            "message": `video Thubmnail added`,
            "status": true
        })
    })
    .catch(err => {
        res.send({
            "message": `error while inserting data`,
            "status": false
        })
    })
}