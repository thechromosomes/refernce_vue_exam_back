// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');

//*************************************************************************************************************************************************************************

exports.loginuser = function(username)
{
  const users= db.get('users');
  const community_logs= db.get('community_logs');
  users.findOne({'username':username}).then(function(getuser){
    community_logs.insert({'module':'login','userid':getuser.unique_id,'created_at':Date.now()}).then(function(insertnotification){
      users.findOneAndUpdate({'unique_id':getuser.unique_id},{"$set":{'lastlogin':Date.now()}}).then(function(update){
        return true;          
  }).catch(function(error){
  return true;
  });        
}).catch(function(error){
return true;
});  
}).catch(function(error){
  return true; 
});
}
//***************************************************************************************************************************************************************************

exports.logoutuser = function(username)
{
  const users= db.get('users');
  const community_logs= db.get('community_logs');
  users.findOne({'username':username}).then(function(getuser){
    community_logs.insert({'module':'logout','userid':getuser.unique_id,'created_at':Date.now()}).then(function(insertnotification){
      return true;          
}).catch(function(error){
return true;
});  
}).catch(function(error){
  return true; 
});
}
//***********************************************************************************************************************************************************************

exports.setfeepageScrollUserlog = function(req,res)
{
  const question_views= db.get('question_views');
  const community_logs= db.get('community_logs');
    community_logs.insert({'module':'feedpage','userid':req.body.userid,'postid':req.body.postid,'created_at':Date.now()}).then(function(insertfeedlog){
if(req.body.questionid!=null && req.body.questionid!=''){
      question_views.insert({'module':'feedpage','userid':req.body.userid,'questionid':req.body.questionid,'created_at':Date.now()}).then(function(insertquestionview){
  res.json(insertquestionview);
      }).catch(function(error){
        res.send([]);  
     });  
    }else{
      res.json(insertfeedlog);  
    }
}).catch(function(error){
  res.send([]);    
});  

}
//***************************************************************************************************************************************************************************

exports.getAllUserlogs = function(req, res)
{
  const community_logs= db.get('community_logs');
  community_logs.aggregate([
    {"$match": {"module":'login'}},
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
   ]).then(function(getUsers){
    res.json(getUsers);
}).catch(function(error){
  return true; 
});
}
//***************************************************************************************************************************************************************************

exports.setTagsVisit = function(req,res)
{
  const tagvisits= db.get('tag_visits');
  const tags= db.get('tags');
  const categories= db.get('categories');

  var cat_type=0;
  var tag_type=0;

  categories.find({'unique_id':req.body.tagid}).then(function(getCategory)
  {
    //console.log('cat-',getCategory)
    if(getCategory.length > 0)
    {
      cat_type=1;
    }
    else
    {
      tag_type=1;
    }
    //console.log('cat-',cat_type)
    //console.log('tag-',tag_type)
    tagvisits.insert({'tagid':req.body.tagid,'created_by':req.body.userid,'tagType':tag_type,'categoryType':cat_type,'created_at':Date.now()}).then(function(setvisit)
    {
        res.json(setvisit);    
    }).catch(function(error){
        res.send([]);    
      });  
  })
}
//***************************************************************************************************************************************************************************

exports.setResourcesView = function(req,res)
{
  const community_logs= db.get('community_logs');

  community_logs.insert({'module':'resources_visit','userid':req.body.userid,'created_at':Date.now()}).then(function(insertresourcesvisit)
  {
    res.json(insertresourcesvisit);
  }).catch(function(error){
      res.send([]);    
    });  
}