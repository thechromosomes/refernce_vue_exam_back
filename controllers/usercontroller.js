
// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');



exports.getSingleUser = function(req,res)
{
    const users= db.get('users');
    users.findOne({'unique_id':req.body.userid}).then(function(getAuthors)
    {
        res.json(getAuthors);
    });
  
}
//*************************************************************************************************
exports.getAllUsers = function(req,res)
{
    const users= db.get('users');
    const community_logs= db.get('community_logs');
    users.aggregate([
        {"$sort": {"firstname": 1,"firstname": 1}},
        {
        $lookup:
        {
                   from: "roles",
                   localField: "role",
                   foreignField: "roleid",
                   as: "roledetail"
        }
        
    }

]).then(function(getUsers)
    { 
        res.json(getUsers);
    }).catch(function(error){
        res.json([]);
    //console.log(error);
       });
}
//*************************************************************************************************
exports.deleteUserFrmList = function(req,res)
{
    //console.log(req.body.del_userid);
    const user= db.get('users');
    user.findOneAndUpdate({'unique_id':req.body.del_userid},{ $set: {'deleted':true }}).then(function(updatemodule)
    {
      //console.log('deleted')
      res.json(updatemodule);
    });
}
//*************************************************************************************************
exports.getEditUserData = function(req,res)
{
    //console.log(req.body.userid);
    const user= db.get('users');
    user.find({'unique_id':req.body.userid}).then(function(getedituser)
    {
        if(getedituser!=null && getedituser.length > 0)
        {
            var counter = -1;
            const roles= db.get('roles');
            asyncLoop(getedituser, function (post, next)
            {
                counter++
                getedituser[counter]['roleTitle'] = '';
                
                roles.findOne({'roleid': Number(post.role)}).then(function(findrole)
                {
                    getedituser[counter]['roleTitle'] = findrole.roletitle;
                    next();
                }).catch(function(error){ next(); });                    
            }, function (err)
            {
                    if (err){ console.error('Inner Error: ' + err.message); }
                    res.json(getedituser);
            });
        }
        else{res.json([]); }
    });
}
//*************************************************************************************************
exports.getAllRoles = function(req,res)
{
    const rolesdata= db.get('roles');
    rolesdata.find({},{sort:{'roletitle':1}}).then(function(getroles)
    {
        res.json(getroles);
    });
}
//*************************************************************************************************
exports.updateEditUserList = function(req,res)
{
    const user= db.get('users');
    user.findOneAndUpdate({'unique_id':req.body.userid},
    { 
        $set: {
            "firstname" : req.body.firstname,
            "lastname" : req.body.lastname,
            "username" : req.body.username,
            "email" : req.body.email,
            "role" : req.body.rolename,         
            "deleted" : req.body.ustatus,
            "gpexid": req.body.gpexId
         }})
    .then(function(updatemodule)
    {
      //console.log('updated')
      res.json(updatemodule);
    });
}
exports.Syncuserfromgpexone = function(req,res)
{
    const user= db.get('users');
    var gpexid=req.body.gpexid.toString();
    user.find({'gpexid':gpexid}).then(function(getUser)
    {
        if(getUser.length>0){
        user.findOneAndUpdate({'gpexid':gpexid},
        { 
            $set: {
                "firstname" : req.body.firstname,
                "lastname" : req.body.lastname,
                "username" : req.body.username,
                "email" : req.body.email,
                "role" : req.body.role,  
                "profile" : req.body.profile,          
                "deleted" : 0
             }})
        .then(function(updatemodule)
        {
          //console.log('updated')
          res.json(updatemodule);
        });
    }else{
        const newIdpre = db.id()
    const newId=newIdpre.toString();
        user.insert({'gpexid':gpexid,"firstname" : req.body.firstname,"profile" : req.body.profile,"lastname" : req.body.lastname,"username" : req.body.username,"email" : req.body.email,"role" : req.body.role,"unique_id":newId})
        .then(function(updatemodule)
        {
          //console.log('updated')
          res.json(updatemodule);
        });   
    }
    }).catch(function(error){
        //console.log('article view not found'); 
        res.json([]);
      });
    

}

exports.Examuserfromgpexone = function(req,res)
{
    const user= db.get('users');
    var gpexid=req.body.gpexid.toString();
    var roleid=Number(req.body.role[0]);
    user.find({'gpexid':gpexid}).then(function(getUser)
    {
        if(getUser.length>0){
        user.findOneAndUpdate({'gpexid':gpexid},
        { 
            $set: {
                "firstname" : req.body.fname,
                "lastname" : req.body.lname,
                "username" : req.body.username,
                "email" : req.body.email,
                "role" : roleid,  
                "profile" : req.body.profile,          
                "deleted" : 0
             }})
        .then(function(updatemodule)
        {
          //console.log('updated')
          res.json(updatemodule);
        }).catch(function(error){
            //console.log(error); 
            res.json([]);
          });
    }else{
        const newIdpre = db.id()
        //console.log('exams',newIdpre);
    const newId=newIdpre.toString();
        user.insert({'gpexid':gpexid,"firstname" : req.body.fname,"profile" : req.body.profile,"lastname" : req.body.lname,"username" : req.body.username,"email" : req.body.email,"role" : roleid,"unique_id":newId,"deleted" : 0})
        .then(function(updatemodule)
        {
          //console.log('updated')
          res.json(updatemodule);
        });   
    }
    }).catch(function(error){
        //console.log(error); 
        res.json([]);
      });
    

}

exports.Updateuserprofilefromone = function(req,res)
{
    const user= db.get('users');
    req.body.data.forEach(function(udata){
    var gpexid=udata.id.toString();
    user.find({'gpexid':gpexid}).then(function(getUser)
    {
        if(getUser.length>0){
        user.findOneAndUpdate({'gpexid':gpexid},
        {
          $set: {
                "profile" : udata.profile_image
             }
            }).then(function(updatemodule){ 
          //console.log('updated')
         // res.json(updatemodule);
        }).catch(function(error){
            //console.log(error); 
           // res.json([]);
          });
    }
    }).catch(function(error){
        //console.log(error); 
       // res.json([]);
      });
    });
    res.json('hello');
}

// create user 
exports.createUser = function(req,res)
{
    const user= db.get('users');

    user.find(
        {
            'username':req.body.username,
            'email':req.body.email
        })
        .then(function(getUser)
        {
        if(getUser.length > 0){
        user.findOneAndUpdate({'username':req.body.username, 'email':req.body.email },
        { 
            $set: {
                "firstname" : req.body.fname,
                "lastname" : req.body.lname,
                "username" : req.body.username,
                "email" : req.body.email,
                "role" : req.body.role, 
                "gpexid": req.body.gpexid,
                "password": req.body.password,  
                "deleted" : 0,
                
            }})
        .then(function(updatemodule)
        {
          res.json(updatemodule);
          //console.log('updated')
        }).catch(function(error){
            //console.log(error); 
            res.json([]);
          });
        }else{
            const newIdpre = db.id()
            const newId=newIdpre.toString();
            user.insert(
                {
            "firstname" : req.body.fname,
            "lastname" : req.body.lname,
            "username" : req.body.username,
            "email" : req.body.email,
            "role" : req.body.role,
            "gpexid": req.body.gpexid,
            "password": req.body.password, 
            "deleted" : 0,
            "unique_id":newId
        })
        .then(function(updatemodule)
        {
        //console.log('inserted')
        res.json(updatemodule);
        });   
        }
        }).catch(function(error){
            //console.log(error); 
            res.json([]);
        });
}
