// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');

//*****************************************************************************************************************************************************

exports.createHashtags = function(req,res)
{
  //console.log(req.body.htagname);
  //console.log(req.body.loginid);
  const examhashtag= db.get('exam_hashtags');
  
  req.body.htagname.forEach(function(optval)
  {
    if(optval!=='')
    {
      examhashtag.findOneAndUpdate({'hashtagname': optval},{ $inc: { "usecount" : 1 } }).then(function(updatehashtag)
      {
        //console.log('#####-',updatehashtag)
        if(updatehashtag==null)
        {
          const newIdpre = db.id()
          const newId=newIdpre.toString();
          examhashtag.insert({'hashtagname':optval,'usecount':1,'created_by':req.body.loginid,'unique_id':newId,'created_at':Date.now()}).then(function(inserthashtag)
          {
            //console.log('hashtag saved');
          }).catch(function(error){
              //console.log('error');
            });
        }
        else
        {
          //console.log('count updated');  
        }
      }); 
    } 
  });
  res.json('success')
}
  
//*****************************************************************************************************************************************************

exports.getHashtagList = function(req,res)
{
  var searchdata = req.body.searchedtopic
  //console.log("this is #tag", searchdata)

    const categorydata= db.get('categories');
    const tags= db.get('tags');
    const exam_hashtags= db.get('exam_hashtags');

    categorydata.aggregate(
    [
      { "$match":{ "categoryname": new RegExp(searchdata, 'i') }},
      {"$sort": {"created_at": -1}},
      { "$project": 
            {
                "categoryname" : 1,
                "unique_id" : 1,
            } 
      }
    ])
    .then(function(getCategories)
    {
        tags.aggregate(
        [
         { "$match":{"hashtagname": {'$regex': searchdata}}},
          {"$sort": {"created_at": -1}},
          { "$project": 
                    {
                        "categoryname" : "$tagname",
                        "unique_id" : 1,
                    } 
          }
        ])
        .then(function(getTags)
        {
            exam_hashtags.aggregate(
            [
              { "$match":{"hashtagname": new RegExp(searchdata, 'i') }},
              {"$sort": {"created_at": -1}},
              { "$project": 
                  {
                          "categoryname" : "$hashtagname",
                          "unique_id" : 1,
                  } 
              }
            ])
            .then(function(gethashtags)
            {
                var finaltopics = getCategories.concat(getTags,gethashtags);
                finaltopics = finaltopics.filter((li, idx, self) => self.map(itm => itm.categoryname).indexOf(li.categoryname) === idx)
                //console.log('Success')
                res.json(finaltopics); 
            });//gethashtags
        });//getTags
    }); //getCategories
   
}

//*****************************************************************************************************************************************************