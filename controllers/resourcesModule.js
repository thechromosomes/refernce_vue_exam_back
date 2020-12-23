const ResourcesModule =  require('../app/models/resources_module');
const options = {upsert: true,returnNewDocument: true};


module.exports.saveResourcesModule = async (req, res) => {
    let note = req.body.note
    let content_path = req.body.content_path
    let media_type = req.body.media_type
    let created_by = req.body.created_by
    let siteUrl = req.body.siteUrl
    let originalName = req.body.originalName
    let imageValidation = req.body.imageValidation
    let linkpreviewdata = req.body.linkpreviewdata

    try {
        ResourcesModule.insertMany({
            note,
            content_path,
            media_type,
            created_by,
            siteUrl,
            originalName,
            imageValidation,
            linkpreviewdata

        }, (err, response) => {
            if (!err){
                res.send({
                    "message": "updated sucessfully",
                    "status": true,
                    "data": response
                })
            }else {
                res.send({
                    "message": "problem while inserting data",
                    "status": false,
                    "data": []
                })
            }
        })
    } catch (error) {
      //  console.log("error", error)
        res.send({
            "message": "problem while inserting data",
            "status": false
        })
    }
}

module.exports.getResourcesModule = async (req, res) => {
    let searchContent = req.body.searchContent
    let sort = Number(req.body.sort)

    if (searchContent == null || searchContent == ""){
        try {
            ResourcesModule.aggregate([
                {$match:{"deleted": false} }, 
                {"$skip": req.body.range},
                {"$limit": sort}
        ])
            .then((response) => {
                ResourcesModule.aggregate( [
                    {$match:{"deleted": false} }, 
                    { $group: { _id: null, myCount: { $sum: 1 } } },
                    { $project: { _id: 0 } }
                 ])
                 .then((count) =>{
                res.send({
                    "message": "data found",
                    'status': true,
                    "data": response,
                    "count": count  
                })
            })
        })
        } catch (error) {
            console.log("error :", error)
        }
    }else{
        try {
            let resourcesModuleData = await ResourcesModule.aggregate([
                {$match:{'originalName' : new RegExp(searchContent, 'i'), "deleted":false }},
            ])

            if (resourcesModuleData.length > 0){
                res.send({
                    "message": "data found",
                    'status': true,
                    "data": resourcesModuleData
                })
            } else{
                res.send({
                    "message": "data not found",
                    'status': false,
                    "data": []
                })
            }
        } catch (error) {
            console.log('error: ', error)
        }
    }
}

// to edit and delete items 
module.exports.deleteAndUpdateResources = async (req, res) => {
    // action type 2 is edit and 1 is delete
    let actionType = req.body.actionType
    let uniqueId = req.body.uniqueId
    let note = req.body.note
    let content_path = req.body.content_path
    let media_type = req.body.media_type
    let siteUrl = req.body.siteUrl
    let originalName = req.body.originalName

    if (actionType == 2){
        ResourcesModule.findOneAndUpdate(
            {"unique_id": uniqueId},
            {$set: {
                note,
                content_path,
                media_type,
                siteUrl,
                originalName

            }},options)
            .then(function(data){
                if(!data){
                    res.send({
                        "message": `data can not inserted please try again`,
                        "status": false,
                        "data": []

                    })
                } else{
                    res.send({
                        "message": `data inserted successfully`,
                        "status": true,
                        "data": data

                    })
                }
            }); 
    }else {
        ResourcesModule.findOneAndUpdate(
            {"unique_id": uniqueId},
            {$set: {
            "deleted": true
            }},options)
            .then(function(data){
                if(!data){
                    res.send({
                        "message": `data can not deleted please try again`,
                        "status": false,
                        "data": []
                    })
                } else{
                    res.send({
                        "message": `data deleted successfully`,
                        "status": true,
                        "data": data
                    })
                }
            }); 
    }
}

// to save resources with anser 
module.exports.resourcesAnswer = (req, res) => {
    const ResourcesAnswer = db.get('resources_answer');

    let questionId = req.body.questionId
    let resourceId = req.body.resourceId

    ResourcesAnswer.insert({
        questionId,
        resourceId,
        display: true,
        created_at: Date.now(),
        deleted: false
    })
    .then(function(data){
        if(!data){
            res.send({
                "message": `data can not updated please try again`,
                "status": false
            })
        } else{
            res.send({
                "message": `data updated successfully`,
                "status": true
            })
        }
    }); 
}

// to show all answer related answer data
module.exports.answerReltedResources = async (req, res) => {
    const ResourcesAnswer = db.get('resources_answer');
    let questionId = req.body.questionId

    let ResourcesModuleData =  await ResourcesAnswer.aggregate([
        {$match: {"questionId": questionId, "deleted": false}},
        {$lookup:
            {
                from: "resources_modules",
                localField: "resourceId",
                foreignField: "unique_id",
                as: "resources"
            }
          },
          { "$unwind": "$resources" },
          {$match: {"resources.deleted":false}}
    ])
    if (ResourcesModuleData.length > 0){
        res.send({
            "message": "data found",
            "status": true,
            "data": ResourcesModuleData
        })
    }else {
        res.send({
            "message": "no data found",
            "status": false,
            "data": []
        })
    }
} 


// to update display or not 
module.exports.updatedDisplayStatus = async (req, res) => {
    const ResourcesAnswer = db.get('resources_answer');
    let APIbehave = req.body.APIbehave

    if(APIbehave === "chechbox" ){
        let questionId = req.body.questionId
        let resourceId = req.body.resourceId
        let display = req.body.display

        ResourcesAnswer.findOneAndUpdate(
            {"questionId": questionId, "resourceId": resourceId},
            {$set: {
            "display": display
            }},options)
            .then(function(data){
                if(!data){
                    res.send({
                        "message": `data can not updated`,
                        "status": false,
                    })
                } else{
                    res.send({
                        "message": `data updated successfully`,
                        "status": true,
                    })
                }
            }); 
    }else{
        let deleted = req.body.deleted
        let resourceId = req.body.resourceId

        ResourcesAnswer.findOneAndUpdate(
            {"resourceId": resourceId},
            {$set: {
            "deleted": deleted
            }},options)
            .then(function(data){
               // console.log(data)
                if(!data){
                    res.send({
                        "message": `data can not deleted please try again`,
                        "status": false,
                    })
                } else{
                    res.send({
                        "message": `data deleted successfully`,
                        "status": true,
                    })
                }
            }); 
    }
}

// add to question 
module.exports.addToQuestion = async (req, res) => {
    const ResourcesAnswer = db.get('resources_answer');
    let questionId = req.body.questionId
    let resourceId = req.body.resourceId
    let display = req.body.display

    ResourcesAnswer.findOneAndUpdate(
        {"resourceId": resourceId},
        {$set: {
        resourceId,
        questionId,
        display,
        created_at: Date.now(),
        deleted: false
        }},options)
        .then(function(data){
            if(!data){
                res.send({
                    "message": `data can not inserted please try again`,
                    "status": false,
                })
            } else{
                res.send({
                    "message": `data inserted successfully`,
                    "status": true,
                })
            }
        }); 
}

// to show all answer related DATA IN ANSWER PAGE   
module.exports.answerReltedResourcesData = async (req, res) => {
    const ResourcesAnswer = db.get('resources_answer');
    let questionId = req.body.questionId

    let ResourcesModuleData =  await ResourcesAnswer.aggregate([
        {$match: {"questionId": questionId, "deleted": false, "display": true}},
        {$lookup:
            {
                from: "resources_modules",
                localField: "resourceId",
                foreignField: "unique_id",
                as: "resources"
            }
          },
          { "$unwind": "$resources" },
          {$match: {"resources.deleted":false}}
    ])
    if (ResourcesModuleData.length > 0){
        res.send({
            "message": "data found",
            "status": true,
            "data": ResourcesModuleData
        })
    }else {
        res.send({
            "message": "no data found",
            "status": false,
            "data": []
        })
    }
}