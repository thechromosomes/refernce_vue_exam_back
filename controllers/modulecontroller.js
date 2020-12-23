// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');


exports.getAllModules = function(req,res){
    const moduledata= db.get('modules');
    moduledata.find().then(function(getTopics){
        res.json(getTopics);
    });
}
exports.getUpdateModules = function(req,res){
     //console.log(req.body.id);
    const cat= db.get('modules');
     cat.findOneAndUpdate(
                {'unique_id':req.body.id},
           { $set: {'created_by':req.body.createdby,'modulename':req.body.name
                    } 
           }
                ).then(function(updatemodule){
   
        res.json(updatemodule);
    });

}

exports.getModule = function(req,res){
    const moduledata= db.get('modules');
    moduledata.find({"unique_id":req.body.modname}).then(function(getTopics){
        res.json(getTopics);
    }).catch(function(error){
       res.json();                         
      });
}
exports.getModuleRoles = function(req,res){
     const moduledata= db.get('roles');
     var roles =req.body.id.split(",");
  //convert string to int before passing into find query in mongodb
    var r=[];
    for(i=0;i<roles.length;i++)
     { 
      r[i]= parseInt(roles[i]);
     }
//console.log(r);
    // moduledata.find({'roleid':{"$in":r}}).then(function(getmodules){
    moduledata.find({"unique_id": req.body.id}).then(function(getmodules){
        //console.log(getmodules)
        res.json(getmodules);
    });
}

exports.getModuleDataTable = function(req,res){
     const tagsdata= db.get('roles');
     const moduledata= db.get('modules');
  //convert string to int before passing into find query in mongodb
   moduledata.find().then(function(getmod){
             var counter = -1;
             var arr=[];
             asyncLoop(getmod, function (mod, next)
            {
            counter++
    if(mod.cap_add){
        var roles = mod.cap_add.split(",");
        var r=[];
            for(i=0;i<roles.length;i++)
            { 
            r[i]= parseInt(roles[i]);
            }
            //console.log(r);
    tagsdata.aggregate([
    { "$match":{"roleid": {"$in":r } }},

    {
    $lookup:
        {
        from: "modules",
        localField: "roleid",
        foreignField: "cap_add",
        as: "moddata"
        }
    },
    { "$project": {
    "roletitle":1
    }} 
    ]).then(function(roledata){
    if(roledata != undefined && roledata.length > 0){
        //console.log("roledata-", roledata);   
        arr.push({
        'modulename':mod.modulename,
        'created_at': mod.created_at,
        'unique_id': mod.unique_id,
        'role':roledata
        });
        //console.log("arr-", arr);   
        next();
        }else{
            next();
        }
    }).catch(function(error){
    next();

    });
    } else{
     next();
 }

}, function (err)
            {
    if (err)
    {
        console.error('Inner Error: ' + err.message);
        
    }
    //console.log("final arr-", arr);   
   res.json(arr);

            });
    });
    
    }


exports.getCapabilityLable = function(req,res){
    // //console.log(req.body.id);
    const capdata= db.get('modules');
    capdata.find({}).then(function(capabilitylable){
        res.json(capabilitylable);
    });
}

// exports.getCapabilityLableList = function(req,res){
//     const capdatass= db.get('capabilitylables');
//     capdatass.find({}).then(function(capabilitylables){
//         //console.log(capabilitylables);
//         res.json(capabilitylables);
//     });
// }

exports.getCapabilityLableList = function(req,res){
    const capabilitydata= db.get('capabilitylables');
    const moduledata= db.get('modules');
    capabilitydata.aggregate([
        {"$sort": {"_id": 1}},
            {
              $lookup:
                  {
                      from: "modules",
                      localField: "moduleid",
                      foreignField: "unique_id",
                      as: "capabilitylables"
                  }
            },

                  { "$project": {
                      "created_at":1,
                      "unique_id":1,
                      "lable_text":1,
                      "capabilitylables.modulename":1
                  } 
          }
          ]).then(function(capabilitylables){
            res.json(capabilitylables); 
            
    }).catch(function(error){
        res.json([]);  
    });
}

    
exports.getEditModule = function(req,res){
  //console.log(req.body.id);
    const mod= db.get('modules');
    
    mod.find({"unique_id": req.body.id}).then(function(getMod){
        res.json(getMod);
  });

}
//*************************************************************************************************

exports.getCapLabel = function(req,res)
{
    // const caplabels= db.get('capabilitylables');
    // caplabels.findOne({"unique_id":req.body.capid}).then(function(getCapdata)
    // {
    //     res.json(getCapdata);
    // }).catch(function(error){
    //    res.json([]);                         
    //   });
       res.json('done');                         
}
//*************************************************************************************************

exports.getModuleLabels = function(req,res)
{
    const moduledata= db.get('modules');
    const caplabels= db.get('capabilitylables');
    caplabels.find({"moduleid": req.body.moduleid}).then(function(getlabels)
    {
      if(getlabels.length>0)
      {
        getlabels.forEach(function(label,index)
        {
          label.rolevalue = label.rolevalue.split(",");
        });
        // //console.log(getlabels);
        res.json(getlabels);
      }
      else{ res.json([]);}
    })
}
exports.getCreateQuestionCapability = function(req,res)
{
    const caplabels= db.get('capabilitylables');
    caplabels.findOne({"unique_id": req.body.moduleid}).then(function(getlabels)
    {
        // res.json(getlabels);
        //JSON.parse(JSON.stringify(getlastweekactiveusers))
        //res.json(getlabels.rolevalue.split(','))
        if(getlabels.rolevalue.split(',').indexOf(req.body.roleid)>=0){
            res.json({"status":true}) 
        }else{
            res.json({"status":false}) 
        }
        
    }).catch(function(error){
        res.json({"status":false}) 
    });
}