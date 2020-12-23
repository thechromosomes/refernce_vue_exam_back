// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');

//*****************************************************************************************************************************************************
exports.savePollQuestion = function(req,res)
{
    var optionsdata=req.body.optiondatas;
    const poll= db.get('polls');
    poll.insert({'question_text':req.body.content,'publishDate':req.body.publishDate,'endDays':req.body.endDays,'instruction_text':req.body.instruction_text,'poll_image':req.body.poll_image,'tags':req.body.tags,'deleted':0,'created_by':req.body.createdby,'created_at':Date.now()}).then(function(insertpoll)
    {
    	//console.log(insertpoll);
        const pollsOptions= db.get('polls_options');  
	    optionsdata.forEach(function(optval,oindex)
    	{
        	if(optval.option_text!=='')
            {
                pollsOptions.insert({'poll_id':insertpoll._id.toString(),'option_text':optval.option_text,'option_order':oindex+1,'created_at':Date.now()}).then(function(insertpolloptions)
                {
                	//console.log(insertpolloptions)
                })
                .catch(function(error)
                {
                    //console.log(error)
                });
            } 
        })  
        //console.log('poll added')
        res.json(insertpoll);
    }).catch(function(error){
        	res.json([]);  
       });
}
//*****************************************************************************************************************************************************
exports.submitPollResult = function(req,res)
{
    //console.log(req.body.postid)
    //console.log(req.body.pollid)
    //console.log(req.body.optionid)
    //console.log(req.body.createdby)
    const newIdpre = db.id()
    const newId=newIdpre.toString();
    const poll_submit= db.get('polls_submitions');
    poll_submit.insert({'postid':req.body.postid,'pollid':req.body.pollid,'optionid':req.body.optionid,'created_by':req.body.createdby,'created_at':Date.now(),'unique_id':newId}).then(function(pollans)
    {
        //console.log('poll submitted')
      res.json(pollans);             
	}).catch(function(error){
    	res.json([]);  
	});
}
//*****************************************************************************************************************************************************

exports.getAllPolls = function(req,res)
{
    //console.log('user-',req.body.loginid);
    const pollsdata= db.get('polls');
    const pollsoptions= db.get('polls_options');
    if(req.body.loginid==null || req.body.loginid=='' )
    {
        pollsdata.find({"deleted":0},{sort:{'created_at':-1}}).then(function(getpolls)
        {
            if(getpolls.length>0)
            {
                var counter = -1;
                asyncLoop(getpolls, function (pollquestion, next)
                {
                    counter++;
                    getpolls[counter]['options']=[];
                    var qid=pollquestion._id.toString();
                    pollsoptions.find({'poll_id' : qid}).then(function(findquestion_options)
                    {
                        getpolls[counter]['options']=findquestion_options; 
                        next();
                    }).catch(function(error){
                        next();
                    });   
                }, function (err)
                {
                    if (err){ console.error('Inner Error: ' + err.message); }
                    res.json(getpolls);
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
    else
    {
        pollsdata.find({"deleted":0, "created_by":req.body.loginid},{sort:{'created_at':-1}}).then(function(getpolls)
        {
            var counter = -1;
            asyncLoop(getpolls, function (pollquestion, next)
            {
                counter++;
                getpolls[counter]['options']=[];
                var qid=pollquestion._id.toString();
                pollsoptions.find({'poll_id' : qid}).then(function(findquestion_options)
                {
                    getpolls[counter]['options']=findquestion_options; 
                    next();
                }).catch(function(error){
                    next();
                });   
            }, function (err)
            {
                if (err){ console.error('Inner Error: ' + err.message); }
                res.json(getpolls);
            });            
        }).catch(function(error){
            res.json(error);  
        });   
    }
}
//*****************************************************************************************************************************************************