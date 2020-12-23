module.exports.userLogReport = async (req, res) => {
    let Users = db.get("users")
    let Posts = db.get("posts")

    let userId = req.body.userId

    try {
        let userData = await Users.aggregate([
            {$match: {"unique_id": userId}},
            // for last post
            {
                $lookup:{
                    from: "posts",
                    let: { "postId": { "$toObjectId": "$unique_id" }},
                    pipeline: [
                       {'$match': { '$expr': { '$eq': ['$created_by', userId] } } }, 
                        {'$sort': {  'posted_at': -1 }},
                        {'$limit': 1},
                     ],
                  as :"lastPost"
                }
              },

            // for last question
            {
                $lookup:{
                    from: "questions",
                    let: { "postId": { "$toObjectId": "$unique_id" }},
                    pipeline: [
                       {'$match': { '$expr': { '$eq': ['$createdby', userId] } } }, 
                        {'$sort': {  'created_at': -1 }},
                        {'$limit': 1},
                     ],
                  as :"lastQuestion"
                }
              },

            // for last articles
            {
                $lookup:{
                    from: "articles",
                    let: { "postId": { "$toObjectId": "$unique_id" }},
                    pipeline: [
                       {'$match': { '$expr': { '$eq': ['$createdby', userId] } } }, 
                        {'$sort': {  'created_at': -1 }},
                        {'$limit': 1},
                     ],
                  as :"lastArticle"
                }
              },

        // ````````````````````````````````````````````````````````````````````````````````````````````````````````
        // ````````````````````````````````````````````````````````````````````````````````````````````````````````
        // for last edited user log report

        // for last post
            {
                $lookup:{
                    from: "posts",
                    let: { "postId": { "$toObjectId": "$unique_id" }},
                    pipeline: [
                       {'$match': { '$expr': { '$eq': ['$updated_by', userId] } } }, 
                        {'$sort': {  'updated_at': -1 }},
                        {'$limit': 1},
                     ],
                  as :"lastPostEdited"
                }
              },

        // for last question
        {
            $lookup:{
                from: "questions",
                let: { "postId": { "$toObjectId": "$unique_id" }},
                pipeline: [
                   {'$match': { '$expr': { '$eq': ['$updatedby', userId] } } }, 
                    {'$sort': {  'updated_at': -1 }},
                    {'$limit': 1},
                 ],
              as :"lastQuestionEdited"
            }
          },

        // for last articles
        {
            $lookup:{
                from: "articles",
                let: { "postId": { "$toObjectId": "$unique_id" }},
                pipeline: [
                   {'$match': { '$expr': { '$eq': ['$updatedby', userId] } } }, 
                    {'$sort': {  'updated_at': -1 }},
                    {'$limit': 1},
                 ],
              as :"lastArticleEdited"
            }
          },

            {$project: {
            //     "lastPost.posted_at": 1,
            //     "lastPost.created_by": 1,
            //     "lastQuestion.createdby": 1,
            //     "lastQuestion.created_at": 1,
            //     "lastArticle.createdby": 1,
            //     "lastArticle.created_at": 1,
            //     "firstname": 1,
            //     "lastname": 1,
            //     "profile": 1
                    "password": 0,
                    "email":0
            }}

    
        ])


        res.send({
            "message": "data fetched succesfully",
            "status": true,
            "data": userData
        })   
    } catch (error) {
        console.log("error from userlog report >>>>", error);
        res.send({
            "message": "there is problem while fetching data",
            "status": false,
            "data": []
        })
    }
}