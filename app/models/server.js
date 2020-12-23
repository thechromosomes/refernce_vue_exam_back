
const db = require('monk')('localhost/gpexcommunity');
var express = require('express');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
var sharp = require('sharp');
const request = require('request');
var fs = require('fs');
var path = require('path')
var app = express();
var mongoose   = require('mongoose');
var cors = require('cors')
const crypto = require('crypto');
mongoose.connect('mongodb://127.0.0.1:27017/gpexcommunity', { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true)
var users = require('./app/models/users');
var roles = require('./app/models/roles');
var groups = require('./app/models/groups');
var posts = require('./app/models/posts');
var comment_likes = require('./app/models/comment_likes');
var comments = require('./app/models/comments');
var slider_settings = require('./app/models/slider_settings');
var image_libraries = require('./app/models/image_libraries');
var categories = require('./app/models/categories');
var tags = require('./app/models/tags');
var post_types = require('./app/models/post_type');
const APIData = require('./controllers/postcontroller');
var config = require('./config');
var bodyParser = require('body-parser');
var asyncLoop = require('node-async-loop');
var empty  = require('is-empty');
var linkPreviewHelper=require('link-preview');
var getImageUrls = require('get-image-urls');
var upload = multer({ 
    dest: './uploads/',
    limit:{
        fileSize:10000000
    }
 })
app.use(cors())
app.use(bodyParser.urlencoded({ extended : true}));
app.use(bodyParser.json());
app.set('superSecret',config.secret);
var port = process.env.PORT || 3003;
var router = express.Router();
var filerouter = express.Router();
app.use(express.static("public")); 
app.use(express.static(path.join(__dirname, 'dist')))
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
router.post('/getallposts', APIData.getAllposts);
router.get('/getalltags', APIData.getAlltags);
router.get('/getallcategory', APIData.getAllcategory);
router.get('/getallquestiontypes', APIData.getAllquestiontypes);
router.get('/getallcolleges', APIData.getAllcolleges);
router.get('/getalldomain', APIData.getAlldomain);
router.get('/getallicpc2', APIData.getAllicpc2);
router.get('/getallgender', APIData.getAllgender);
router.get('/getallagerange', APIData.getAllagerange);
router.get('/getallsliderimages', APIData.getAllSliderimages);
router.get('/getalllibraryimages', APIData.getAlllibraryimages);
router.get('/getalllibimages', APIData.getalllibimages);
router.post('/getcommentsofpost', APIData.getCommentsofPost);
router.post('/getpostlikers', APIData.getPostlikers);
router.post('/getcommentlikers', APIData.getCommentlikers);

router.route('/gettags')
     .post(function(req, res) {
         if(req.body.searchedtag==null){
            data={}
         }else{
            data={'tagname' : new RegExp(req.body.searchedtag, 'i')}
         }
         
        tags.find(data,function(err, tagsdata) {
            if (err)
                res.send(err);

            res.json(tagsdata);
        });
      });
 router.route('/getimagebydomain')
     .post(function(req, res) {
         if(req.body.searcheddomain==null){
            data={}
         }else{
            data={'domain' : new RegExp(req.body.searcheddomain, 'i')}
         }
         
         image_libraries.find(data,function(err, imagedata) {
            if (err)
                res.send(err);

            res.json(imagedata);
        });
      });
router.route('/getpostbylink')
     .post(function(req, res) {
         var urlpost=req.body.requrl;
        linkPreviewHelper.parse(urlpost).then(function(succallcallback,errorcallback){
          
           res.json(succallcallback);
         })
      });
router.route('/getallimages')
     .post(function(req, res) {
         var urlpost=req.body.requrl;
         getImageUrls(urlpost, function(err, images) {
  if (!err) {
    console.log('Images found', images.length);
    res.json(images);
  }
  else {
    console.log('ERROR', err);
  }
})
      });
router.post('/upload', upload.single('file'), async (req, res) => {
    var  currentUnixTime= Date.now();
    console.log(req);
    // res.json({file: req.file});
    try {
        var f = currentUnixTime+'_' + req.file.originalname;
        var dest = path.resolve('./publicfiles/', f);
        fs.rename(req.file.path, dest, (err)=>{
          if(err) throw err;
          else {
              console.log('Successfully moved');
              res.json({file: `/publicfiles/${f}`});
          }
        });

        // await sharp(req.file.path).toFile(`./publicfiles/${currentUnixTime}_${req.file.originalname}`);
        // fs.unlink(req.file.path,() => {
        //     res.json({file: `/publicfiles/${currentUnixTime}_${req.file.originalname}`});
        // })
    } catch(err){
        res.status(422).json({err});
    }
  })
router.route('/Signup')
    .post(function(req, res) {
    try {
        var emailCheck = new Promise(function(resolve, reject) {
            users.find({
                email: req.body.email
            }, function(err, results) {
                if (err) {
                    reject({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    })
                } else {
                    results.length ? reject({
                        httpCode: 200,
                        code: 402,
                        message: 'Email already exist.'
                    }) : resolve(results[0]);

                }
            })
        });
        Promise.all([emailCheck]).then(function(results) {
            users.create({
                'firstname': req.body.fname,
                'lastname': req.body.lname,
                'username': req.body.username,
                'email': req.body.email,
                'role': req.body.role,
                'password': req.body.password
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }

                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
router.route('/syncuserfromgpexone')
    .post(function(req, res) {
    try {
        var emailCheck = new Promise(function(resolve, reject) {
            users.find({
                email: req.body.email
            }, function(err, results) {
                if (err) {
                    reject({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    })
                } else {
                    results.length ? reject({
                        httpCode: 200,
                        code: 402,
                        message: 'Email already exist.'
                    }) : resolve(results[0]);

                }
            })
        });
        Promise.all([emailCheck]).then(function(results) {
            users.create({
                'firstname': req.body.fname,
                'lastname': req.body.lname,
                'username': req.body.username,
                'email': req.body.email,
                'role': req.body.role,
                'password': req.body.password
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }

                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
router.route('/getcurrentuserforapp')
     .post(function(req, res) {
        users.findOne({"gpexid": req.body.gpexid},function(err, curentuser) {
             if (err)
                 res.send(err);
 
             res.json(curentuser);
         });
      });

router.route('/addslider')
    .post(function(req, res) {
        console.log(req.body.link);
    try {
        Promise.all([]).then(function(results) {
            slider_settings.create({
                'image_link': req.body.link,
                // 'tags': req.body.tags,
                'created_by': req.body.createdby,
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }
                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});

router.route('/addlibrary')
    .post(function(req, res) {
        console.log(req.body.link);
    try {
        Promise.all([]).then(function(results) {
            image_libraries.create({
                'tag': req.body.tag_name,
                'domain': req.body.domain,
                'image_link': req.body.link,
                'created_by': req.body.createdby,
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }
                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
     
router.route('/addpost')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            posts.create({
                'content': req.body.postcontent,
                'tags': req.body.tags,
                'created_by': req.body.createdby,
                'posted_at': req.body.scheduledatetime
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }
                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
//santosh
//******************adding post ***************************
router.route('/addcomment')
    .post(function(req, res) {
    try {
        console.log("consolelog="+req);
        Promise.all([]).then(function(results) {
            comments.create({
                'content': req.body.comment,
                'postid': req.body.postid,
                'parentid':req.body.commentid,
                'created_by': req.body.createdby                
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                     //   'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }
                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});


//*********end*************************





router.route('/addpostbyweb')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            posts.create({
                'content': req.body.postcontent,
                'tags': req.body.tags,
                'created_by': req.body.createdby,
                'attached': req.body.attachement,
                'posted_at': req.body.scheduledatetime
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }
                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
router.route('/likedislikepost')
    .post(function(req, res) {
    try {
        
        const post_likes= db.get('post_likes');
           
            const query = { 'postid': req.body.postid, 'likeby': req.body.likeby};
                        const update = {$set:{ 'postid': req.body.postid,'likeby': req.body.likeby,'status': req.body.status,'created_at':Date.now()}};
                        const options = {upsert: true};
                        post_likes.findOneAndUpdate(query,update,options).then(function(findupdate){
                            console.log(findupdate);
                            
                            res.status(200).send({
                                 'code': 200,
                                 'data': []
                             });
                        }).catch(function(error){
                            res.status(500).send(error)
                        });
    } catch (e) {
        res.status(500).json({
            'code': 500
        });

    }
});

router.route('/likedislikecomment')
    .post(function(req, res) {
        console.log(req.body.commentid);
        console.log(req.body.likeby);
        console.log(req.body.status);
    try {
        const comment_likes= db.get('comment_likes');
           
            const query = { 'commentid': req.body.commentid, 'likeby': req.body.likeby};
                        const update = {$set:{ 'commentid': req.body.commentid,'likeby': req.body.likeby,'status': req.body.status,'created_at':Date.now()}};
                        const options = {upsert: true};
                        comment_likes.findOneAndUpdate(query,update,options).then(function(findupdate){
                            console.log(findupdate);
                            
                            res.status(200).send({
                                 'code': 200,
                                 'data': []
                             });
                        }).catch(function(error){
                            res.status(500).send(error)
                        });
    } catch (e) {
        res.status(500).json({
            'code': 500
        });

    }
});

router.route('/linkpre')
    .post(function(req, res) {
    try {

        var options = {'url': req.body.requrl};
        ogs(options, function (error, results) {
          console.log('error:', error); // This is returns true or false. True if there was a error. The error it self is inside the results object.
          console.log('results:', results);
          res.json(results);
        });
    } catch (e) {
        res.status(500).json({
            'code': 500
        });

    }
});
router.route('/createcategory')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            categories.create({
                'categoryname': req.body.category,
                'created_by': req.body.createdby
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }

                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
router.route('/getuserbyid')
.post(function(req, res) {
    console.log(req.body);
    
   users.findOne({"_id": req.body.userid},{
       password:0
   },function(err, curentuser) {
       if (err){
           res.send({
               status:0,
               err:err
           });
        } else {
            res.status(200).json({
               status:0,
               user:curentuser
           });

        }
    });
 });
 router.route('/deletepostbyid')
 .post(function(req, res) {
      var postid = req.body.postid;
      posts.findOneAndUpdate({"unique_id":postid},{"deleted":true},function(err, postdata) {
        if (err)
            res.send(err);
        res.json(postdata);
    });
  });

 router.route('/deleteSliderById')
 .post(function(req, res) {
      var sliderid = req.body.sliderid;
      console.log(sliderid);
      // slider_settings.findOneAndUpdate({"unique_id":unique_id},{"deleted":true},function(err, sliderdata) {
      slider_settings.deleteOne({"unique_id": sliderid},function(err, sliderdata) {
        if (err)
            res.send(err);
        res.json(sliderdata);
      });
  });

 router.route('/deleteTagById')
 .post(function(req, res) {
      var tagid = req.body.tagid;
      console.log(tagid);
      tags.deleteOne({"unique_id": tagid},function(err, tagdata) {
        if (err)
            res.send(err);
        res.json(tagdata);
      });
  });

 router.route('/deleteCategoryById')
 .post(function(req, res) {
      var catgid = req.body.catgid;
      console.log(catgid);
      categories.deleteOne({"unique_id": catgid},function(err, catgdata) {
        if (err)
            res.send(err);
        res.json(catgdata);
      });
  });

 router.route('/deletelibraryById')
 .post(function(req, res) {
      var imageid = req.body.imageid;
      console.log(imageid);
      image_libraries.deleteOne({"unique_id": imageid},function(err, imagedata) {
        if (err)
            res.send(err);
        res.json(imagedata);
      });
  });

router.route('/creategroup')
    .post(function(req, res) {
    try {
        var groupCheck = new Promise(function(resolve, reject) {
            groups.find({
                groupname: req.body.groupname
            }, function(err, results) {
                if (err) {
                    reject({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    })
                } else {
                    results.length ? reject({
                        httpCode: 200,
                        code: 402,
                        message: 'Group already exist.'
                    }) : resolve(results[0]);

                }
            })
        });
        Promise.all([groupCheck]).then(function(results) {
            groups.create({
                'groupname': req.body.groupname,
                'groupmemmbers': req.body.members,
                'createdby': req.body.createdby,
                'createddate': req.body.createddate
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }

                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
router.route('/createtag')
    .post(function(req, res) {
    try {
        var tagCheck = new Promise(function(resolve, reject) {
            tags.find({
                tagname: req.body.tagname
            }, function(err, results) {
                if (err) {
                    reject({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    })
                } else {
                    results.length ? reject({
                        httpCode: 200,
                        code: 402,
                        message: 'Tag already exist.'
                    }) : resolve(results[0]);

                }
            })
        });
        Promise.all([tagCheck]).then(function(results) {
            tags.create({
                'tagname': req.body.tagname,
                'category_id': req.body.category,
                'created_by': req.body.createdby
            }, 
            function(createErr, result) {
                if (createErr) {
                    res.status(CodesAndMessages.dbErrHttpCode).send({
                        httpCode: CodesAndMessages.dbErrHttpCode,
                        code: CodesAndMessages.dbErrCode,
                        message: CodesAndMessages.dbErrMessage
                    });
                } else {
                    res.status(200).send({
                       // 'message': CodesAndMessages.sucess1,
                        'code': 200,
                        'data': result
                    });
                }

                //create cart for this user:result._id,ironing:[],
                console.log('Success');
            })
        }).catch(function(err) {
            console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        console.log('catch login', e);
    }
});
router.route('/login')
    .post(function(req, res){
        users.findOne({$or:[{"email": req.body.email},{"username": req.body.email}], "password": req.body.password}, function(err, user_data){
            if(err || !user_data){
                return res.status(401).json({
                    status : 401,
                    message : "Invalid email and password.",
                });
            } else {
                const payload = {
                    name: user_data.username
                };
                const name = user_data.username
                var token = jwt.sign(payload, app.get('superSecret'), {
                            expiresIn : 60*60*24 // expires in 24 hours
                });
                res.status(200).json({
                    message : "You have succesfully loggedin.",
                    token   : token,
                    name
                });
            }
        });
    });

    router.route('/gpexlogin')
    .post(function(req, res){
        users.findOne({"email": req.body.email}, function(err, user_data){
            if(err || !user_data){
                return res.status(401).json({
                    status : 401,
                    message : "Invalid email",
                });
            } else {
                const payload = {
                    name: user_data.username
                };
                const name = user_data.username
                var token = jwt.sign(payload, app.get('superSecret'), {
                            expiresIn : 60*60*24 // expires in 24 hours
                });
                res.status(200).json({
                    message : "You have succesfully loggedin.",
                    token   : token,
                    name
                });
            }
        });
    });
router.route('/result')
    .get(function(req, res) {
        users.find(function(err, logins) {
            if (err)
                res.send(err);

            res.json(logins);
        });
     });
router.route('/getusers')
    .get(function(req, res) {
        users.find(function(err, regs) {
            if (err)
                res.send(err);

            res.json(regs);
        });
     });

router.route('/getposttypes')
     .get(function(req, res) {
        post_types.find(function(err, allposttypes) {
             if (err)
                 res.send(err);
 
             res.json(allposttypes);
         }).sort({"order":1});
      });
router.route('/getroles')
     .get(function(req, res) {
         roles.find(function(err, allroles) {
             if (err)
                 res.send(err);
 
             res.json(allroles);
         });
      });
router.route('/getgroups')
     .get(function(req, res) {
         groups.find(function(err, allgroups) {
             if (err)
                 res.send(err);
 
             res.json(allgroups);
         });
      });

router.route('/getcurrentuser')
     .post(function(req, res) {
        users.findOne({"username": req.body.username},function(err, curentuser) {
             if (err)
                 res.send(err);
 
             res.json(curentuser);
         });
      });
router.route('/getuserinfo')
     .post(function(req, res) {
        users.findOne({"gpexid": req.body.gpexid},function(err, curentuser) {
             if (err)
                 res.send(err);
 
             res.json(curentuser);
         });
      });
      filerouter.route('/')
      .get(function(req, res) {
          res.sendFile(req.query.file ,{root:__dirname});
      });
app.use('/api',router);
app.use('/public',filerouter);
app.get('/*', function(req, res){
  res.sendFile('/dist/index.html' ,{root:__dirname});
});
app.listen(port);

