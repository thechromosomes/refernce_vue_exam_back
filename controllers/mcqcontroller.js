// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var Request = require("request");
var asyncLoop = require('node-async-loop');

exports.mcqcompchart = function(req,res){

    const mcqdata= db.get('mcqrecords');

    Request.get({ "headers": { "content-type": "application/json" },
    "url":"https://onedev1.gpex.com.au/api/auth/getmcqtabledata",
    "body": JSON.stringify({
      functionname:['getmcqtabledata'],
        token:['1623335984458']}
        )},  
        (error, response, result) => {
            var alldata = JSON.parse(result);
            alldata.data.forEach(element => {
                console.log(element);
                mcqdata.insert(element).then(function(insert){ 
                    console.log("insert", insert)
            })
                
            });
            res.send(result);
    });

}

exports.getallMCQCompChart = function(req,res)
{
  const mcqrecords= db.get('mcqrecords');
  mcqrecords.find({"reg_id": req.body.reg_id}).then(function(getmcqrecords){
            res.json(getmcqrecords);             
}).catch(function(error){
    res.json([]);  
});
}
 
exports.getMcquser = function(req,res){
const mcquserecords= db.get('mcqrecords'); 
mcquserecords.find({'reg_id':Number(req.body.reg_id)}).then(function(findmcquser){
    res.json(findmcquser);
    }).catch(function(error){
        res.json([]);
});   
}