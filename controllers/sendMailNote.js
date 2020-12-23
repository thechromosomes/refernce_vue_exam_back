// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
const moment = require('moment');
var asyncLoop = require('node-async-loop');
var postmark = require("postmark");
var client = new postmark.ServerClient("b773bde9-d116-4d2e-af51-4ba8a3ccd3ff")


module.exports.saveNotificationTemplate = (req, res) => {
    let TriggerTypes = db.get('TriggerTypes');

    let subject = req.body.subject;
    let last_notification_day = req.body.last_notification_day;
    let content = req.body.content;
    let notification_type = req.body.notification_type;
    let created_by = req.body.created_by;

    TriggerTypes.insert({
        subject,
        last_notification_day,
        content,
        notification_type,
        created_by

    }, (err) => {
        if (!err){
            res.send({
                "message": `data inserted successfully`,
                "status": true
            })
        }else{
            res.send({
                "message": `data can not inserted`,
                "status": false
            })
        }
    })
}

module.exports.allTemplateData = async (req, res) => {
    let TriggerTypes = db.get('final_mail_notification');
    let created_by = req.body.created_by;

    let allData = await TriggerTypes.find({"createdBy": created_by});
    try {
        if(allData.length > 0){
            res.send({
                "message":`data fetched successfully`,
                "allTemplateData": allData
            })
        } else{
            res.send({
                "message":`there is no data`,
                "allTemplateData": []
            })
        }
    } catch (error) {
        //console.log("ERROR :", error)
    }
}

// to send mail users not active then five days
module.exports.sendMailNote = async (req, res) => {
    const Users = db.get('users');
    const KfpAnswers = db.get('kfpquestion_answers');
    const AllAnswers = db.get('question_answers');
    const CaseCommentsLikes = db.get('case_comment_likes');
    const CaseComments  = db.get('case_comments')
    const CaseAnswers = db.get('casequestion_answers');
    const CommentLikes = db.get('comment_likes');
    const ImageOfTheWeekAnswer = db.get('imgofweekquestion_answers')
    const FinalMailDb = db.get('final_mail_notification');

    try{
        let fourDaysAgoTemp = moment().subtract(4,'d').format('YYYY-MM-DD');
        let sixDaysAgoTemp = moment().subtract(6,'d').format('YYYY-MM-DD');

        let fourDaysAgo =  moment(fourDaysAgoTemp).unix()*1000
        let sixDaysAgo =  moment(sixDaysAgoTemp).unix()*1000

        let activeUsers = []
        let errors = []
        let userEmails = []


        let userloggedInLastWeek = await Users.aggregate([
            {$match : { "lastlogin": {$gt: sixDaysAgo, $lt: fourDaysAgo } }}
        ])

        if(userloggedInLastWeek.length > 0){
            asyncLoop(userloggedInLastWeek, async (oneUser, next) => {

                let kfpAnswersData = await KfpAnswers.aggregate([
                    {$match: {"createdby": oneUser.unique_id, "created_at": {$gt: sixDaysAgo, $lt: fourDaysAgo } }},
                    {$project: {
                        "createdby":1,
                        "_id": 0

                    }}
                ])

                let allAnswersData = await AllAnswers.aggregate([
                    {$match: {"createdby": oneUser.unique_id, "created_at": {$gt: sixDaysAgo, $lt: fourDaysAgo } }},
                    {$project: {
                        "createdby":1,
                        "_id": 0

                    }}
                ])

                let caseCommentsLikesData = await CaseCommentsLikes.aggregate([
                    {$match: {"likeby": oneUser.unique_id, "created_at": {$gt: sixDaysAgo, $lt: fourDaysAgo } }},
                    {$project: {
                        "likeby":1,
                        "_id": 0

                    }}
                ])

                let CaseCommentsData = await CaseComments.aggregate([
                    {$match: {"createdby": oneUser.unique_id, "created_at": {$gt: sixDaysAgo, $lt: fourDaysAgo } }},
                    {$project: {
                        "createdby":1,
                        "_id": 0

                    }}
                ])

                let CaseAnswersData = await CaseAnswers.aggregate([
                    {$match: {"answerby": oneUser.unique_id, "created_at": {$gt: sixDaysAgo, $lt: fourDaysAgo } }},
                    {$project: {
                        "answerby":1,
                        "_id": 0

                    }}
                ])

                let CommentLikesData = await CommentLikes.aggregate([
                    {$match: {"likeby": oneUser.unique_id, "created_at": {$gt: sixDaysAgo, $lt: fourDaysAgo } }},
                    {$project: {
                        "likeby":1,
                        "_id": 0

                    }}
                ])

                let ImageOfTheWeekAnswerData = await ImageOfTheWeekAnswer.aggregate([
                    {$match: {"answerby": oneUser.unique_id, "created_at": {$gt: sixDaysAgo, $lt: fourDaysAgo } }},
                    {$project: {
                        "answerby":1,
                        "_id": 0

                    }}
                ])
                if(kfpAnswersData.length > 0 ){
                    activeUsers.push(kfpAnswersData[0].createdby)
                }
                if(allAnswersData.length > 0){
                    activeUsers.push(allAnswersData[0].createdby)
                }
                if(caseCommentsLikesData.length > 0){
                    activeUsers.push(caseCommentsLikesData[0].likeby)
                }
                if(CaseCommentsData.length > 0){
                    activeUsers.push(CaseCommentsData[0].createdby)
                }
                if(CaseAnswersData.length > 0){
                    activeUsers.push(CaseAnswersData[0].answerby)
                }
                if(CommentLikesData.length > 0){
                    activeUsers.push(CommentLikesData[0].likeby)
                }
                if(ImageOfTheWeekAnswerData.length > 0){
                    activeUsers.push(ImageOfTheWeekAnswerData[0].answerby)
                }

                next();
            }, async (err) => {
                if(err) {
                    errors.push(err)
                }else{

                    var filteredUser = userloggedInLastWeek.filter(userId => (activeUsers.indexOf(userId.unique_id) < 0));

                    var finalMail = await FinalMailDb.find({"notificationType": "Number of days without any activity"})

                    if(finalMail.length > 0){
                        let content =  finalMail[0].content
                        .replace(/(<([^>]+)>)/ig,"")
                        asyncLoop(filteredUser, (oneUser, next) => {
                            userEmails.push(oneUser.email);
                            const msg = {
                                to: `sskumar.ssk013@gmail.com`,
                                from: "support@gpex.com.au",
                                subject: finalMail[0].subject,
                                HtmlBody: finalMail[0].content,
                            };
                            client.sendEmail(msg)
                            next();
                        }, (err) => {
                            if (err){
                                res.send({
                                    "message": `error(s) found ${errors}`,
                                    "error": err,
                                    "status" : false
                                })
                            }else {
                                res.send({
                                    "message": `message successfully sent to ${userEmails}`,
                                    "error": null,
                                    "statu": true
                                })
                            }
                        })
                    }else{
                        res.send({
                            "message": `there is no template to send`,
                            "error": `template not foumd`,
                            "status": false
                        })
                    }
                }
            })
        }else{
            res.send({
                "message": "data not found",
                "status": false,
                "error": `no data found`
            })
        }
    }catch(err){
        res.send({
            "message": "there is a error while communicating database",
            "status": false,
            "error": `not a valid parameters`
        })
    }
}


// mail to be sent to the user 
module.exports.sendFinalMail = (req, res) => {
    // const NotificationTemplate = require('../app/models/final_mail_notification');
    const NotificationTemplate = db.get('final_mail_notification')

    let content = req.body.content;
    let subject = req.body.subject;
    let notificationType = req.body.notificationType;
    let numberOfDays = req.body.numberOfDays;
    let createdBy = req.body.createdBy

    const options = {
        "upsert" :true
      };

    NotificationTemplate.findOneAndUpdate({'notificationType':notificationType}, 
        { $set:
            {
            content,
            subject,
            notificationType,
            numberOfDays,
            createdBy
            }
    }, options,(err) => {
        if (!err){
            res.send({
                "message": `data successfully inserted `,
                "status": true,
                "error": null
            })
        }else{
            res.send({
                "message":`there is problem while inserting data`,
                "status": false,
                "error": err
            })
        }
    })
}

// get template data
module.exports.getTemplateData = async (req, res) => {
    const NotificationTemplate = db.get('final_mail_notification');
    
    let searchQuery = req.body.searchQuery

    let finalData = await NotificationTemplate.find({
        "notificationType": searchQuery
    })
    if (finalData.length > 0){
        res.send({
            "message": `data successfully fetched`,
            "status": true,
            "records": finalData             
        })
    }else{
        res.send({
            "message": `no data found`,
            "status": false,
            "record": []
        })
    }
}

// send email to the user with same articel tag added
module.exports.articleWithSameTag = async (req, res) => {
    const Articles = db.get('articles');
    const FinalMailDb = db.get('final_mail_notification');
    const Users = db.get('users');

    let allTags = req.body.tags;

    try{
        if(allTags !== null && allTags !== ""){
            let articlesData = await Articles.aggregate([
                {$match : {'tags': new RegExp(allTags, 'i')}}
            ])
            var template = await FinalMailDb.find({"notificationType": "Number of days without any activity"})
            var tempEmail = []
            if (articlesData.length > 0){
                asyncLoop(articlesData, async (element, next) => {
                let userEmail = await Users.findOne({"unique_id": element.createdby})
    
                if (userEmail && template.length > 0){
                    if (tempEmail.indexOf(userEmail.email) == -1){
                        tempEmail.push(userEmail.email)
                        const msg = {
                            to: `sskumar.ssk013@gmail.com`,
                            from: "support@gpex.com.au",
                            subject: template[0].subject,
                            HtmlBody: template[0].content,
                        };
                        client.sendEmail(msg)
                    }
                    next();
                } else{
                    next("please recheck template and user email");
                }
            }, (err) => {
                if (err){
                    res.send({
                            "message": err,
                            "status": false
                        })
                    } else {
                        res.send({
                            "message": `message succesfully sent to the ${tempEmail}`,
                            "status": true
                        })
                    }
                })
    
            }else {
                res.send({
                    "message": "no article added with this tag",
                    "status": false,
                })    
            }
        }else{
            throw error
        }
        
    }catch(error){
        res.send({
            "message": "there is some problem while fetching data",
            "status": false,
        })
    }
    
}

// Added no comments or answer for "var" number of weeks
module.exports.noCommetnAndAnswer = async (req, res) => {
    const Comments = db.get('comments');
    const CaseCommetns = db.get('case_comments');
    const QuestionAnser = db.get('question_answers');
    const Users = db.get('users');
    const Templates = db.get('final_mail_notification');

    try {
        let template = await Templates.find({"notificationType": "Number of days without any activity"})

        if (template.length > 0 && template[0].numberOfDays !== null){
        var date = new Date();
        let totalDays= (new Date(date.getTime() - (template[0].numberOfDays * 24 * 60 * 60 * 1000))).getTime();

        let allInactiveEmails = []

            
        let CommentsData = await Comments.aggregate([
            {$match:{"created_at":{"$lte" :totalDays}} },
            {$group: {_id:{created_by:"$created_by"}, count:{$sum:1} } },
            {$project: {
                id: "$_id.created_by",
                '_id':0
            }}
        ])

        let CaseCommetnsData = await CaseCommetns.aggregate([
            {$match:{"created_at":{"$lte" :totalDays} } },
            {$group: {_id:{created_by:"$created_by"}, count:{$sum:1} } },
            {$project: {
                id: "$_id.created_by",
                '_id':0
            }}
        ]) 

        let QuestionAnserData = await QuestionAnser.aggregate([
            {$match:{"created_at":{"$lte" :totalDays}} },
            {$group: {_id:{answerby:"$answerby"}, count:{$sum:1} } },
            {$project: {
                id: "$_id.answerby",
                '_id':0
            }}
        ])

        let allUSerToSndMail = []
        if (CommentsData.length > 0){
            for(let element of CommentsData){
                var forQuestion = QuestionAnserData.findIndex(item => item.id == element.id)
                var forCaseComment = CaseCommetnsData.findIndex(item => item.id == element.id)
    
                if(forCaseComment >= 0  && forQuestion >= 0){
                    allUSerToSndMail.push(element)
                }
              }
        } else {
            for(let element of QuestionAnserData){
                var forCase = CommentsData.findIndex(item => item.id == element.id)
                var forCaseComment = CaseCommetnsData.findIndex(item => item.id == element.id)
    
                if(forCaseComment >= 0  && forCase >= 0){
                    allUSerToSndMail.push(element)
                }
            }
        }
        if (allUSerToSndMail.lenght > 0){
                asyncLoop(allUSerToSndMail , async (singleUser, next) => {
                    let inactiveEmail = await Users.findOne({"unique_id": singleUser.id})
                    allInactiveEmails.push(inactiveEmail.email)
                    let finalEmail = inactiveEmail.email
      
                    const msg = {
                      to: `sskumar.ssk013@gmail.com`,
                      from: "support@gpex.com.au",
                      subject: template[0].subject,
                      HtmlBody: template[0].content,
                      };
                      // client.sendEmail(msg)
                      
                    next();
                }, (err) => {
                    if(!err) {
                        res.send({
                            "message":`message sent to ${allInactiveEmails}`,
                            "status": true
                        })
                    }else {
                        res.send({
                            "message": "error while looping",
                            "status": false
                        })
                    }
                });
        }else {
            res.send({
                "message": "it seems there are no user to send email",
                "status": false
            })
        }
          
        
        }else {
            res.send({
                "message": "please add template data to send email",
                "status": false
            })
        }
    } catch (error) {
        //console.log('error', error)
    }
    
}

// Viewed at least number of KFP, Image or Case question but did not answer or commented
module.exports.viewedButNoAnswer = async (req, res) => {
    const QuestionsViews = db.get('question_views');
    const QuestionsAnswer = db.get('question_answers');
    const Templates = db.get('final_mail_notification');
     try {
        let template = await Templates.find({"notificationType": "Number of days without any activity"});

        if (template.length > 0 && template[0].numberOfDays !== null){
            var date = new Date();
            let totalDays= (new Date(date.getTime() - (template[0].numberOfDays * 24 * 60 * 60 * 1000))).getTime();


            let QuestionsViewsDataKfp = await QuestionsViews.aggregate([
                {$match:{"created_at":{"$gte" :totalDays} } },
                { "$lookup": {
                    "let": { "postId": { "$toObjectId": "$questionid" } },
                    "from": "questions",
                    "pipeline": [
                      { "$match": { "$expr": { "$eq": [ "$_id", "$$postId" ] } } },
                      {$match : { "questiontype": "5d15fea98edfed6c417592d9"}}
                    ],
                    "as": "questions"
                  }},
                { "$unwind": "$questions" },
                {$project: {
                    // "questionid": 1,
                    "questions.createdby": 1
                }}
            ])

            let QuestionsViewsDataImage = await QuestionsViews.aggregate([
                {$match:{"created_at":{"$gte" :totalDays} } },
                { "$lookup": {
                    "let": { "postId": { "$toObjectId": "$questionid" } },
                    "from": "questions",
                    "pipeline": [
                      { "$match": { "$expr": { "$eq": [ "$_id", "$$postId" ] } } },
                      {$match : { "questiontype": "5d15fea98edfed6c417592d15"}}
                    ],
                    "as": "questions"
                  }},
                { "$unwind": "$questions" },
                {$project: {
                    // "questionid": 1,
                    "questions.createdby": 1

                }}
            ])

            let QuestionsViewsDataCase = await QuestionsViews.aggregate([
                {$match:{"created_at":{"$gte" :totalDays} } },
                { "$lookup": {
                    "let": { "postId": { "$toObjectId": "$questionid" } },
                    "from": "questions",
                    "pipeline": [
                      { "$match": { "$expr": { "$eq": [ "$_id", "$$postId" ] } } },
                      {$match : { "questiontype": "5d15fea98edfed6c417592d14"}}
                    ],
                    "as": "questions"
                  }},
                { "$unwind": "$questions" },
                {$project: {
                    // "questionid": 1,
                    "questions.createdby": 1

                }}
            ])

            let allUSerToSndMail = []
            if (QuestionsViewsDataKfp.length > 0){
                for(let element of QuestionsViewsDataKfp){
                    var forQuestionCase = QuestionsViewsDataCase.findIndex(item => item.questions.createdby == element.questions.createdby)
                    var forCaseCommentImage = QuestionsViewsDataImage.findIndex(item => item.questions.createdby == element.questions.createdby)
        
                    if(forQuestionCase >= 0  && forCaseCommentImage >= 0){
                        allUSerToSndMail.push(element)
                    }
                }
            } else {
                for(let element of QuestionsViewsDataCase){
                    var forQuestionKfp = QuestionsViewsDataKfp.findIndex(item => item.questions.createdby == element.questions.createdby)
                    var forCaseCommentImage = QuestionsViewsDataImage.findIndex(item => item.questions.createdby == element.questions.createdby)
        
                    if(forQuestionKfp >= 0  && forCaseCommentImage >= 0){QuestionsViewsDataImage
                        allUSerToSndMail.push(element)
                    }
                }
            }


            if (allUSerToSndMail.lenght > 0){ 
                asyncLoop(allUSerToSndMail , async (singleUser, next) => {
                    let inactiveEmail = await Users.findOne({"unique_id": singleUser.questions.createdby})
                    allInactiveEmails.push(inactiveEmail.email)
                    let finalEmail = inactiveEmail.email
      
                    const msg = {
                      to: `sskumar.ssk013@gmail.com`,
                      from: "support@gpex.com.au",
                      subject: template[0].subject,
                      HtmlBody: template[0].content,
                      };
                      client.sendEmail(msg)
                      
                    next();
                }, (err) => {
                    if(!err) {
                        res.send({
                            "message":`message sent to ${allInactiveEmails}`,
                            "status": true
                        })
                    }else {
                        res.send({
                            "message": "error while looping",
                            "status": false
                        })
                    }
                });
        }else {
            res.send({
                "message": "it seems there are no user to send email",
                "status": false
            })
        }

        }else {
            res.send({
                "message": "please add template data first",
                "status": false,
            })
        }
     } catch (error) {
         //console.log("error", error)
         res.send({
            "message": "there is an error while fetching data",
            "status": false
        })
         
     }
        
}


// to find single user activity in last seven days
// need to create email notification - one of the notifications will be weekly analysis

module.exports.useActivityAnalysis = async (req, res) => {
    const Users = db.get('users');
    // let userId = req.body.userId
    let sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).setHours(0, 0, 0, 0);
    
    let userData = await Users.aggregate([
        {$match: {"deleted": false} }
    ])

    let weeklyDataAnalysis = []


    asyncLoop(userData, async (oneUser, next) => {
        if(oneUser.unique_id !== null  && oneUser.unique_iderId !== ""){ 
            let userId = oneUser.unique_id
            console.log("userId >>>>>>>>>>", userId)

            try {
            var userAnalysis = await Users.aggregate([

                // for last week post   
                {
                    $lookup:{
                        from: "posts",
                        pipeline: [
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } },{ '$expr': { '$eq': ['$updated_by', userId] }} ]} } , 
                        {'$match':  { $or: [ { '$expr': { '$gte': [ "$posted_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                        {
                            $group:
                            {
                                _id:{"created_by":userId, "updated_by": userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"post"
                    }
                },


                // for last week article_sections
                {
                    $lookup:{
                        from: "article_sections",
                        pipeline: [
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$createdby', userId] } },{ '$expr': { '$eq': ['$updatedby', userId] }} ]} } , 
                        {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"createdby":userId, "updatedby": userId},
                                    "count":{$sum:1},
                                }
                            }
                        ],
                    as :"article_sections"
                    }
                },

                // for last week article_views
                {
                    $lookup:{
                        from: "article_views",
                        pipeline: [
                        {'$match': { '$expr': { '$eq': ['$userid', userId] } } }, 
                        {'$match': { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} }, 
                            {
                                $group:
                                {
                                    _id:"$userid",
                                    "count":{$sum:1},
                                }
                            }
                        ],
                    as :"article_views"
                    }
                },

                // for last week articles
                {
                    $lookup:{
                        from: "articles",
                        pipeline: [
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$createdby', userId] } },{ '$expr': { '$eq': ['$updatedby', userId] }} ]} } , 
                        {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                        {
                            $group:
                            {
                                _id:{"createdby":userId, "updatedby": userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"articles"
                    }
                },

                // for last week case_comment_likes
                {
                    $lookup:{
                        from: "case_comment_likes",
                        pipeline: [
                        {'$match': { '$expr': { '$eq': ['$likeby', userId] } } },
                        {'$match': { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} }, 
                        {
                            $group:
                            {
                                _id:{"likeby":userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"case_comment_likes"
                    }
                },

                // for last week case_comments
                {
                    $lookup:{
                        from: "case_comments",
                        pipeline: [
                        
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } },{ '$expr': { '$eq': ['$updated_by', userId] }} ]} } ,        
                        {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                        {
                            $group:
                            {
                                _id:{"created_by":userId, "updated_by": userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"case_comments"
                    }
                },

                // for last week casequestion_answers
                {
                    $lookup:{
                        from: "casequestion_answers",
                        pipeline: [
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$answerby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                        {'$match': { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} }, 
                            {
                                $group:
                                {
                                    _id:{"answerby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }
                        ],
                    as :"casequestion_answers"
                    }
                },

                // for last week casequestion_options
                {
                    $lookup:{
                        from: "casequestion_options",
                        pipeline: [
                        {'$match':  { $or: [ { '$expr': { '$eq': ['$updatedby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                        {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"updatedby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }
                        ],
                    as :"casequestion_options"
                    }
                },

                // for last week casequestions
                {
                    $lookup:{
                        from: "casequestions",
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$createdby', userId] } },{ '$expr': { '$eq': ['$updatedby', userId] }} ]} } , 
                        {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }}, { '$expr': { '$eq': ['$publish_date', userId] } } ]} },
                        {
                            $group:
                            {
                                _id:{"updatedby":userId, "createdby": userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"casequestions"
                    }
                },

                // for last week comment_likes
                {
                    $lookup:{
                        from: "comment_likes",
                        pipeline: [
                            {'$match': { '$expr': { '$eq': ['$likeby', userId] } } },
                            {'$match': { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} }, 
                            {
                                $group:
                                {
                                    _id:{"likeby":userId},
                                    "count":{$sum:1},
                                }
                            }
                        ],
                    as :"comment_likes"
                    }
                },

                // for last week comments
                {
                    $lookup:{
                        from: "comments",
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$updated_by', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$posted_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"updated_by":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }
                        ],
                    as :"comments"
                    }
                },

                // for last week imgdummy_answers
                {
                    $lookup:{
                        from: "imgdummy_answers",   
                        pipeline: [
                            {'$match': { '$expr': { '$eq': ['$userid', userId] } } },
                        {'$match': { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} }, 
                        {
                            $group:
                            {
                                _id:{"userid":userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"imgdummy_answers"
                    }
                },

                // for last week imgofweekquestion_answers
                {
                    $lookup:{
                        from: "imgofweekquestion_answers",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$answerby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                        {'$match': { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} }, 
                        {
                            $group:
                            {
                                _id:{"answerby":userId, "createdby": userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"imgofweekquestion_answers"
                    }
                },

                // for last week imgofweekquestions       
                {
                    $lookup:{
                        from: "imgofweekquestions",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$updatedby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"updatedby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"imgofweekquestions"
                    }
                },

                // for last week kfpdummy_answers       
                {
                    $lookup:{
                        from: "kfpdummy_answers",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$userid', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"userid":userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"kfpdummy_answers"
                    }
                },

                // for last week kfpquestion_answers         
                {
                    $lookup:{
                        from: "kfpquestion_answers  ",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$answerby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"answerby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"kfpquestion_answers"
                    }
                },

                // for last week kfpquestions       
                {
                    $lookup:{
                        from: "kfpquestions",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$updatedby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"updatedby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"kfpquestions"
                    }
                },

                // for last week post_likes       
                {
                    $lookup:{
                        from: "post_likes",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$likeby', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"likeby":userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"post_likes"
                    }
                },

                // for last week post_saves       
                {
                    $lookup:{
                        from: "post_saves",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"post_saves"
                    }
                },

                // for last week question_answers       
                {
                    $lookup:{
                        from: "question_answers",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$answerby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"answerby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"question_answers"
                    }   
                },

                // for last week question_options       
                {
                    $lookup:{
                        from: "question_options",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$updatedby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"updatedby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }
                        ],
                    as :"question_options"
                    }
                },

                // for last week question_views              
                {
                    $lookup:{
                        from: "question_views",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$userid', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"userid":userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"question_views"
                    }
                },

                // for last week questions
                {
                    $lookup:{
                        from: "questions",
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$createdby', userId] } },{ '$expr': { '$eq': ['$updatedby', userId] }} ]} } , 
                             {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }},  { '$expr': { '$eq': ['$publish_date', userId] } } ]} },
                        {
                            $group:
                            {
                                _id:{"updatedby":userId, "createdby": userId},
                                "count":{$sum:1},
                            }
                        }
                        ],
                    as :"questions"
                    }
                },

                // for last week student_comments       
                {
                    $lookup:{
                        from: "student_comments",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$updated_by', userId] } },{ '$expr': { '$eq': ['$created_by', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"updated_by":userId, "created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"student_comments"
                    }
                },

                // for last week studentquestion_options              
                {
                    $lookup:{
                        from: "studentquestion_options",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$createdby', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"createdby": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studentquestion_options"
                    }
                },

                // for last week studentquestions       
                {
                    $lookup:{
                        from: "studentquestions",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$updatedby', userId] } },{ '$expr': { '$eq': ['$createdby', userId] }} ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }}, { '$expr': { '$gte': [ "$updated_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"updatedby":userId, "createdby": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studentquestions"
                    }
                },

                // for last week studyplan_duedates              
                {
                    $lookup:{
                        from: "studyplan_duedates",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studyplan_duedates"
                    }
                },

                // for last week studyplan_subtopics              
                {
                    $lookup:{
                        from: "studyplan_subtopics",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studyplan_subtopics"
                    }
                },

                // for last week studyplan_subtopicstatus              
                {
                    $lookup:{
                        from: "studyplan_subtopicstatus",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studyplan_subtopicstatus"
                    }
                },


                // for last week studyplan_topicreminders              
                {
                    $lookup:{
                        from: "studyplan_topicreminders",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studyplan_topicreminders"
                    }
                },

                // for last week studyplan_topics              
                {
                    $lookup:{
                        from: "studyplan_topics",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studyplan_topics"
                    }
                },

                // for last week studyplan_topics              
                {
                    $lookup:{
                        from: "studyplan_topics",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$userid', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"userid":userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"studyplan_topics"
                    }
                },

                // for last week tag_visits              
                {
                    $lookup:{
                        from: "tag_visits",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"tag_visits"
                    }
                },

                // for last week tags              
                {
                    $lookup:{
                        from: "tags",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$created_by', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"created_by": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"tags"
                    }
                },

                // for last week tags              
                {
                    $lookup:{
                        from: "tags",   
                        pipeline: [
                            {'$match':  { $or: [ { '$expr': { '$eq': ['$createdby', userId] } } ]} } ,        
                            {'$match':  { $or: [ { '$expr': { '$gte': [ "$created_at", sevenDaysAgo ] }} ]} },
                            {
                                $group:
                                {
                                    _id:{"createdby": userId},
                                    "count":{$sum:1},
                                }
                            }

                        ],
                    as :"tags"
                    }
                },


            ]);
            } catch (error) {
                console.log("catch error", error)
            }


            // console.log("user analysis", userAnalysis)

            // weeklyDataAnalysis.push(userAnalysis)
            // let data = userAnalysis[0]
            // for (let element in data){
            //     console.log(">>>>>>>>>>>>>>...", typeof(element))
            //     // console.log(userAnalysis.class)
            //     if (typeof(element) == "array"){
            //         weeklyDataAnalysis.push(element)
            //         console.log(element)
            //     }
            // }
            next();
        }else{
            next();
        }

        }, (err) => {
            if(!err){
                res.send("hello")
            }
            console.log("error", err)
        })  
}
