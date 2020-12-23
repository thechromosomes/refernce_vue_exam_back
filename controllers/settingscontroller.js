
// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');
//const sgMail = require('@sendgrid/mail');
//sgMail.setApiKey("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");


exports.getBoardingList = function(req,res){
    const onboardings= db.get('onboardings');
    onboardings.find({},{"$sort":{"placeorder":1}}).then(function(allonboardings){
            res.json(allonboardings);             
}).catch(function(error){
    res.json([]);  
});
}
exports.getOneBoardingList = function(req,res){
    const onboardings= db.get('onboardings');
    onboardings.findOne({"_id":req.body.id}).then(function(allonboardings){
            res.json(allonboardings);             
}).catch(function(error){
    res.json([]);  
});
}
exports.saveBoardingList = function(req,res){
    const onboardings= db.get('onboardings');
    onboardings.insert({'hero_img':req.body.hero_img,'title':req.body.title,'description':req.body.desc,'placeorder':req.body.order,'createdby':req.body.createdby,'created_at':Date.now()}).then(function(insertonboardings){
            res.json(insertonboardings);             
}).catch(function(error){
    res.json([]);  
});
}
exports.saveBoardingSubmission = function(req,res){
    const onboarding_submissions= db.get('onboarding_submissions');
    onboarding_submissions.insert({'userid':req.body.userid,'createdby':req.body.userid,'created_at':Date.now()}).then(function(insertonboardings){
            res.json(insertonboardings);             
}).catch(function(error){
    res.json([]);  
});
}
exports.getUserBoardingSubmission = function(req,res){
    const onboarding_submissions= db.get('onboarding_submissions');
    onboarding_submissions.find({'userid':req.body.userid}).then(function(getonboardings){
            res.json(getonboardings);             
}).catch(function(error){
    res.json([]);  
});
}
exports.updateBoardingList = function(req,res){
    const onboardings= db.get('onboardings');
    onboardings.findOneAndUpdate({'_id':req.body.id},{$set:{'hero_img':req.body.hero_img,'title':req.body.title,'description':req.body.desc,'placeorder':req.body.order,'createdby':req.body.createdby,'created_at':Date.now()}}).then(function(allonboardings){
            res.json(allonboardings);             
}).catch(function(error){
    res.json([]);  
});
}
exports.deleteBoardingList = function(req,res){
    const onboardings= db.get('onboardings');
    onboardings.remove({'_id':req.body.id});
    res.json([]); 
}
//****************************************************************

exports.savePolicyContent = function(req,res)
{
    const policycontent =  db.get('policycontent_types');

    const newIdpre = db.id()
    const newId=newIdpre.toString();  
    policycontent.insert({'pversion':req.body.pversion, 'type':req.body.type, 'type_name': req.body.typename, 'policy_title': req.body.policy_title, 'active': 0, 'content': req.body.content, 'created_by': req.body.loginid, 'created_at': Date.now(), 'updated_at': Date.now(),'unique_id':newId})
    .then(function(savepolicycontent)
    {
        //console.log('saved')
        res.json(savepolicycontent);
    });
}
//****************************************************************

exports.editPolicyContent = function(req,res)
{
    const policycontent =  db.get('policycontent_types');
      
    policycontent.findOneAndUpdate({'unique_id':req.body.pid}, 
                                  {$set:{'policy_title': req.body.policy_title, 'content_title': req.body.content_title, 'content': req.body.content, 'updated_at':Date.now()}})
    .then(function(updatepolicycontent)
    {
        //console.log('updated')
        res.json(updatepolicycontent);
    });
}
//****************************************************************

exports.getPolicyContent = function(req,res)
{
    const acceptpolicies =  db.get('accept_policies');
    const policycontent_types =  db.get('policycontent_types');
    policycontent_types.find({"active": "1"}).then(function(getpolicycontents)
  {
    if(getpolicycontents.length>0){
    var counter=-1;
    var finalarr=[];
    asyncLoop(getpolicycontents, function (getpolicycontent, next)
    {
      acceptpolicies.findOne({"policyid":getpolicycontent.unique_id,"userid":req.body.loginid}).then(function(getpolicycontents)
      {
        if(getpolicycontents){
          next();
        }else{
          finalarr.push(getpolicycontent);
          next();
        }

      }).catch(function(error){
        finalarr.push(getpolicycontent);
       next();
    }); 

    }, function (err)
        {
            if (err)
            {
                console.error('Inner Error: ' + err.message);
                // return;
            }
            res.json(finalarr);
        }); 
      }else{
        res.json([]);
      }
  }).catch(function(error){
    res.json([]);
}); 

}
//****************************************************************

exports.saveUserAccept = function(req,res)
{
    const acceptpolicies =  db.get('accept_policies');

    acceptpolicies.findOne({'userid':req.body.userid, 'policyid':req.body.policy_id}).then(function(getacceptpolicies)
    {
        //console.log(getacceptpolicies)
      if(getacceptpolicies==null || getacceptpolicies.length==0)
      {
        //console.log('if')
        const newIdpre = db.id()
        const newId=newIdpre.toString(); 
         acceptpolicies.insert({'policyid':req.body.policy_id, 'accepted':req.body.accepted, 'p_type':req.body.type, 'userid': req.body.userid, 'unique_id':newId, 'created_at':Date.now()})
        .then(function(saveacceptpolicies)
        {
          //console.log('saved')
          res.json(saveacceptpolicies);
        }).catch(function(error){
            res.json([]);  
          });
      }
      else
      {
        //console.log('else')
         res.json([]);
      }
    }).catch(function(error){
        res.json([]);  
       });
}

//****************************************************************

exports.getOneUserAccept = function(req,res)
{
    const acceptpolicies =  db.get('accept_policies');

    acceptpolicies.findOne({'userid':req.body.userid, 'p_type':req.body.type}).then(function(getacceptpolicies)
    {
        //console.log(getacceptpolicies)
      if(getacceptpolicies==null || getacceptpolicies.length==0)
      {
        //console.log('if')
        const newIdpre = db.id()
        const newId=newIdpre.toString(); 
         acceptpolicies.insert({'accepted':req.body.accepted,'p_type':req.body.type, 'userid': req.body.userid, 'unique_id':newId})
        .then(function(saveacceptpolicies)
        {
          //console.log('saved')
          res.json(saveacceptpolicies);
        }).catch(function(error){
            res.json([]);  
          });
      }
      else
      {
        //console.log('else')
         res.json([]);
      }
    }).catch(function(error){
        res.json([]);  
       });
}
//*******************************************************************************************

exports.getUserAccept = function(req,res)
{
    const acceptpolicies =  db.get('accept_policies');

    acceptpolicies.findOne({'userid':req.body.userid, 'p_type':req.body.type, 'policyid':req.body.policyid}).then(function(getacceptpolicies)
    {
          //console.log('acceptpolicies')
          res.json(getacceptpolicies);
      
    });
}
//*******************************************************************************************

exports.getUserLastLogin = function(req,res)
{
    const community_logs= db.get('community_logs');  

    community_logs.findOne({"userid":req.body.userid, "module":req.body.module},{sort:{'created_at':-1}}).then(function(getuserlogin)
    {
          //console.log('getuserlogin')
          res.json(getuserlogin); 
    });
}
//*******************************************************************************************

exports.getAllPolicies = function(req,res)
{
    const policycontent =  db.get('policycontent_types');
    policycontent.find({}).then(function(allpolicies)
    {
      if(allpolicies.length>0)  {
          res.json(allpolicies);
      }else{
        res.json([]);
      }
    });
}
//*******************************************************************************************

exports.changePolicyStatus = function(req,res)
{
    const policycontent =  db.get('policycontent_types');
    policycontent.findOneAndUpdate({ 'unique_id': req.body.id},{$set:{'active':req.body.active}});
    res.json([{'status':200}]);
}
//*******************************************************************************************

exports.deletePolicy = function(req,res)
{
    const policycontent =  db.get('policycontent_types');
    policycontent.remove({'unique_id': req.body.uid});
    res.json([{'status':200}]);
}
//*******************************************************************************************

exports.getPolicyById = function(req,res)
{
    const policycontent =  db.get('policycontent_types');

    policycontent.findOne({'unique_id':req.body.pid}).then(function(policybyid)
    {
          //console.log('policybyid')
          res.json(policybyid); 
    });
}
//*******************************************************************************************

exports.sendContactSupportMail = function(req,res)
{
  const users= db.get('users');
  const templates= db.get('templates');

  ////console.log('policy id-',req.body.policyid);
  // //console.log('content-',req.body.content);
  //console.log('createdby-',req.body.userid);

  templates.findOne({'type_code':'contact_support'}).then(function(gettemplate)
  {
    var message=gettemplate.content;
    users.findOne({"unique_id":req.body.userid}).then(function(getuserdata)
    {
      var username = getuserdata.firstname+' '+getuserdata.lastname;
      var usermailid = getuserdata.email;
      message=message.replace("{Username}", username);
      // message=message.replace("{content}", req.body.content);
      const msg = {
                    to: 'support@gpex.com.au',
                    from: usermailid,
                    subject: gettemplate.subject,
                    html:message,
                };
        // sgMail.send(msg).then((sent) => 
        // {
        //   //console.log('CS mail success')
        //   res.json('CS mail success');
        // })
    })
  }).catch(function(error){
      //console.log("function error"+error);
      res.send([]);  
    }); 
}
//*******************************************************************************************

exports.saveUserContactSupport = function(req,res)
{
    const contactSupport =  db.get('contact_support');

    const newIdpre = db.id()
    const newId=newIdpre.toString(); 
    contactSupport.insert({'policyid':req.body.policy_id, 'userid': req.body.userid, 'unique_id':newId, 'created_at':Date.now()})
    .then(function(savecontactsupport)
    {
      //console.log('saved')
      res.json(savecontactsupport);
    }).catch(function(error){
        res.json([]);  
      });
}

exports.getPolicyaccepted = function(req, res)
{
 const acceptpolicies =  db.get('accept_policies');
  acceptpolicies.aggregate([
    //  {"$match": {"module":'login'}},
    {
      $lookup:
      {
        from: "policycontent_types",
        localField: "p_type",
        foreignField: "type",
        as: "accepted"
      }
    },
    { "$unwind": "$accepted" },
    {"$sort": {"accepted.created_at": -1}},
   {
    $lookup:
    {
     from: "users",
     localField: "userid",
     foreignField: "unique_id",
     as: "user"
    }
},
   { "$unwind": "$user" },
   { "$project": {
       "_id":1,
       "created_at":1,
       "userid":1,
       "accepted":1,
       "user.firstname":1,
       "user.lastname":1
      //  "accepted.unique_id":1,
      //  "accepted.type_name":1, 
   } 
}
   ]).then(function(getaccepted){
    res.json(getaccepted);
}).catch(function(error){
  //console.log("ERROR(s)>>", error);
  return true; 
});
}