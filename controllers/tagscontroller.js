// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');

exports.saveTagselected = function(req,res){
     //console.log(req.body.id);
    const resettags= db.get('reset_tags');
    var tagdata ={
          $each: [{ tagname:  req.body.tag_name ,
          unique_id:  req.body.tag_id  }],$slice: -10};
//    resettags.insert({
//                'unique_id':req.body.tag_id,
//               
//                'tagname':req.body.tag_name,
//                'created_by': req.body.createdby,
//               
//            } 
      //           { $push: {unique_id:{ $each:req.body.tag_id,$slice: -10 },
//                   tagname:{ $each:req.body.tag_name,$slice: -10 }
//                   }
//                  
//           }    
// { "$project": { "relevancy": { "$slice": [ "$relevancy", -1 ] } } },
     resettags.findOneAndUpdate(
                {"_id":"5d49067f0617ff6c3dd0f9ce"},
                {  $push: {
                 tagdata,
                }
            }
                ).then(function(updatetags){
   
        res.json(updatetags);
    });

}