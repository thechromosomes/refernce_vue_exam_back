// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');
var asyncLoop = require('node-async-loop');
//const SGmail = require('@sendgrid/mail')

//**********************************************************************************************************************************************************************
exports.getAllcategoryStudyPlan = function(req,res)
{
    const categorydata= db.get('categories');
    const topics= db.get('studyplan_topics');
    const sp_duedates= db.get('studyplan_duedates');
    categorydata.find({"studyplan":true},{sort:{'categoryname':1}})
    .then(function(getTopics)
    {
        topics.find({"studyplan":true, "created_by":req.body.createdby},{sort:{'categoryname':1}})
        .then(function(get_spTopics)
        {
            var primes = getTopics.concat(get_spTopics);
            var finaltopics=primes.sort(function(a, b)
            {
                var nameA=a.categoryname.toLowerCase(), nameB=b.categoryname.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1 
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            var counter = -1;
            const notes= db.get('notes');
            const remindme= db.get('studyplan_topicreminders');
            asyncLoop(finaltopics, function (t_data, next)
            {
                counter++
                finaltopics[counter]['duedate']='';
                finaltopics[counter]['starstatus']=0;
                finaltopics[counter]['chkstatus']=0;
                finaltopics[counter]['notestatus']=false;
                finaltopics[counter]['note_id']='';
                finaltopics[counter]['note_content']='';
                finaltopics[counter]['remindmeid']='';
                finaltopics[counter]['remindmesdate']='';
                finaltopics[counter]['remindmeNote']='';
                finaltopics[counter]['remindmeTitle']='';

                 sp_duedates.find({'topic_id': t_data.unique_id, 'created_by': req.body.createdby}).then(function(findduedate)
                {
                    //console.log(findduedate);
                    if(findduedate != undefined && findduedate.length > 0)
                    {
                        findduedate.forEach(function(entry)
                        {
                                if(entry.due_date){finaltopics[counter]['duedate']=entry.due_date;}
                                else{finaltopics[counter]['duedate'] = '';}
                                if(entry.star_status){finaltopics[counter]['starstatus'] = entry.star_status;}
                                else{finaltopics[counter]['starstatus'] = 0 ;}
                                if(entry.chkbox_status){finaltopics[counter]['chkstatus']=entry.chkbox_status;}
                                else{finaltopics[counter]['chkstatus'] = 0}
                        });
                    }
                    notes.findOne({'topic_id':t_data.unique_id, created_by:req.body.createdby},{sort:{'created_at':-1}}).then(function(findnotes)
                    {
                        if(findnotes != null)
                        {
                                finaltopics[counter]['notestatus'] = true;
                                finaltopics[counter]['note_id'] = findnotes.unique_id;
                                finaltopics[counter]['note_content'] = findnotes.content;
                        }
                        remindme.findOne({'topic_id':t_data.unique_id, created_by:req.body.createdby},{sort:{'created_at':-1}}).then(function(findremindme)
                        {
                            if(findremindme != null)
                            {
                                    finaltopics[counter]['remindmeid'] = findremindme._id;
                                    finaltopics[counter]['remindmesdate'] = findremindme.remindme_sdate;
                                    finaltopics[counter]['remindmeNote'] = findremindme.notes;
                                    finaltopics[counter]['remindmeTitle'] = findremindme.title;
                            }
                            next();
                        }).catch(function(error){
                            next();
                        });
                    }).catch(function(error){
                        next();
                    });
                }).catch(function(error){
                    next();
                });
            }, function (err)
                {
                    if (err)
                    {
                        console.error('Inner Error: ' + err.message);
                        // return;
                    }
                    res.json(finaltopics);
                }); 
        });
    });
}
exports.setStudyPlanView= function(req,res){
  const studyplan_views= db.get('studyplan_views');
  studyplan_views.insert({'userid':req.body.userid,'created_at':Date.now()}).then(function(insertstudyplan){
res.json(insertstudyplan);
  }).catch(function(error){
    res.json([]);
   //console.log('article view not insert'); 
 });

}
//*************************************************************************************************************************************************************************
exports.getAlltagStudyPlan = function(req,res){
     const categorydata= db.get('tags');
     const sp_subtopic= db.get('studyplan_subtopics');
    categorydata.find({"studyplan":true,"category_id":req.body.cat_id},{sort:{'tagname':1}}).then(function(getTopics)
    {
        sp_subtopic.find({"studyplan":true,"category_id":req.body.cat_id,"created_by":req.body.createdby},{sort:{'tagname':1}})
        .then(function(get_spTopics)
        {
            var primes = getTopics.concat(get_spTopics);
            var finalsubtopics=primes.sort(function(a, b)
            {
                var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1 
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            res.json(finalsubtopics);
        });
    });
 }
 //************************************************************************************************************************************************************************
exports.getFinalCategories = function(req,res)
{
	 //console.log(req.body.createdby)
    //console.log(req.body.searchedtopic)

    var searchdata=req.body.searchedtopic.trim();
    //console.log('after-',searchdata)
    const categorydata= db.get('categories');
    const topics= db.get('studyplan_topics');
    const tags= db.get('tags');
    const subtopics= db.get('studyplan_subtopics');
    const sp_duedates= db.get('studyplan_duedates');

    if( searchdata==null || searchdata=='')
    { 
      //console.log('no topic')
      res.json([]); 
    }
    else
    {
        categorydata.aggregate(
        [
          { "$match":{ "studyplan":true, "categoryname": new RegExp(searchdata, 'i') }},
          {"$sort": {"created_at": -1}},
          { "$project": 
              {
                  "created_at" : 1,
                  "available" : 1,
                  "studyplan" : 1,
                  "resources" : 1,
                  "categoryname" : 1,
                  "created_by" : 1,
                  "unique_id" : 1,
                } 
          }
        ])
        .then(function(getCategories)
        {
          //console.log('cat-',getCategories)
            // topics.find({"studyplan":true, "created_by":req.body.createdby},{sort:{'categoryname':1}})
            topics.aggregate(
            [
              { "$match":{ "studyplan":true, "created_by":req.body.createdby, "categoryname": new RegExp(searchdata, 'i') }},
              {"$sort": {"created_at": -1}},
              { "$project": 
                  {
                      "created_at" : 1,
                      "available" : 1,
                      "studyplan" : 1,
                      "categoryname" : 1,
                      "created_by" : 1,
                      "unique_id" : 1,
                    } 
              }
            ])
            .then(function(getTopics)
            {
              //console.log('gt-',getTopics)
              tags.aggregate(
              [
                {"$match":{ "studyplan":true, "tagname": new RegExp(searchdata, 'i') }},
                {"$sort": {"created_at": -1}},
                {
                    $lookup:
                    {
                        from: "categories",
                        localField: "category_id",
                        foreignField: "unique_id",
                        as: "tagdata"
                    }
                },
                { "$unwind": "$tagdata" },
                { "$project": 
                    {
                        "created_at" : "$tagdata.created_at",
                        "available" : "$tagdata.available",
                        "studyplan" : "$tagdata.studyplan",
                        "categoryname" : "$tagdata.categoryname",
                        "created_by" : "$tagdata.created_by",
                        "unique_id" : "$tagdata.unique_id",
                      } 
                }
              ])
              .then(function(getTags)
              {
                //console.log('gtt-',getTags)
                subtopics.aggregate(
                [
                  { "$match":{ "studyplan":true, "created_by":req.body.createdby, "tagname": new RegExp(searchdata, 'i') }},
                  {"$sort": {"created_at": -1}},
                  {
                    $lookup:
                    {
                        from: "studyplan_topics",
                        localField: "category_id",
                        foreignField: "unique_id",
                        as: "sptopicdata"
                    }
                  },
                  { "$unwind": "$sptopicdata" },
                  { "$project": 
                    {
                        "created_at" : "$sptopicdata.created_at",
                        "available" : "$sptopicdata.available",
                        "studyplan" : "$sptopicdata.studyplan",
                        "categoryname" : "$sptopicdata.categoryname",
                        "created_by" : "$sptopicdata.created_by",
                        "unique_id" : "$sptopicdata.unique_id",
                      } 
                  }
                ])
                .then(function(getsubTopics)
                {
                  //console.log('gst-',getsubTopics)
                  subtopics.aggregate(
                  [
                    { "$match":{ "studyplan":true, "created_by":req.body.createdby, "tagname": new RegExp(searchdata, 'i') }},
                    {"$sort": {"created_at": -1}},
                    {
                      $lookup:
                      {
                          from: "categories",
                          localField: "category_id",
                          foreignField: "unique_id",
                          as: "topicdata"
                      }
                    },
                    { "$unwind": "$topicdata" },
                    { "$project": 
                      {
                          "created_at" : "$topicdata.created_at",
                          "available" : "$topicdata.available",
                          "studyplan" : "$topicdata.studyplan",
                          "categoryname" : "$topicdata.categoryname",
                          "created_by" : "$topicdata.created_by",
                          "unique_id" : "$topicdata.unique_id",
                        } 
                    }
                  ])
                  .then(function(getsubTopics2)
                  {
                    //console.log('gst2-',getsubTopics)
                    var subprimes = getCategories.concat(getTopics,getTags,getsubTopics,getsubTopics2);
                    var uniq = {}
                    var primes = subprimes.filter(obj => !uniq[obj.unique_id] && (uniq[obj.unique_id] = true));
                    //console.log("primes:",primes)
                    var finaltopics=primes.sort(function(a, b)
                    {
                      var nameA=a.categoryname.toLowerCase(), nameB=b.categoryname.toLowerCase()
                      if (nameA < nameB) //sort string ascending
                          return -1 
                      if (nameA > nameB)
                          return 1
                      return 0 //default return value (no sorting)
                    })
                    res.json(finaltopics); 
                  });
                });//getsubTopics
              });//getTags
            }); //getTopics
        }); //getCategories
    }//else
}
 //**************************************************************************************************************************************************************************

 exports.getSearchedTopic = function(req,res)
{
	//console.log(req.body.createdby)
    //console.log(req.body.searchedtopic)

    var searchdata=req.body.searchedtopic.trim();
    //console.log('after-',searchdata)
    const categorydata= db.get('categories');
    const topics= db.get('studyplan_topics');
    const tags= db.get('tags');
    const subtopics= db.get('studyplan_subtopics');
    const sp_duedates= db.get('studyplan_duedates');

    if( searchdata==null || searchdata=='')
    { 
      //console.log('no topic')
      res.json([]); 
    }
    else
    {
        categorydata.aggregate(
        [
          { "$match":{ "studyplan":true, "categoryname": new RegExp(searchdata, 'i') }},
          {"$sort": {"created_at": -1}},
          { "$project": 
              {
                  "created_at" : 1,
                  "available" : 1,
                  "studyplan" : 1,
                  "resources" : 1,
                  "categoryname" : 1,
                  "created_by" : 1,
                  "unique_id" : 1,
                } 
          }
        ])
        .then(function(getCategories)
        {
          //console.log('cat-',getCategories)
            // topics.find({"studyplan":true, "created_by":req.body.createdby},{sort:{'categoryname':1}})
            topics.aggregate(
            [
              { "$match":{ "studyplan":true, "created_by":req.body.createdby, "categoryname": new RegExp(searchdata, 'i') }},
              {"$sort": {"created_at": -1}},
              { "$project": 
                  {
                      "created_at" : 1,
                      "available" : 1,
                      "studyplan" : 1,
                      "categoryname" : 1,
                      "created_by" : 1,
                      "unique_id" : 1,
                    } 
              }
            ])
            .then(function(getTopics)
            {
              //console.log('gt-',getTopics)
              tags.aggregate(
              [
                {"$match":{ "studyplan":true, "tagname": new RegExp(searchdata, 'i') }},
                {"$sort": {"created_at": -1}},
                {
                    $lookup:
                    {
                        from: "categories",
                        localField: "category_id",
                        foreignField: "unique_id",
                        as: "tagdata"
                    }
                },
                { "$unwind": "$tagdata" },
                { "$project": 
                    {
                        "created_at" : "$tagdata.created_at",
                        "available" : "$tagdata.available",
                        "studyplan" : "$tagdata.studyplan",
                        "categoryname" : "$tagdata.categoryname",
                        "created_by" : "$tagdata.created_by",
                        "unique_id" : "$tagdata.unique_id",
                      } 
                }
              ])
              .then(function(getTags)
              {
                //console.log('gtt-',getTags)
                subtopics.aggregate(
                [
                  { "$match":{ "studyplan":true, "created_by":req.body.createdby, "tagname": new RegExp(searchdata, 'i') }},
                  {"$sort": {"created_at": -1}},
                  {
                    $lookup:
                    {
                        from: "studyplan_topics",
                        localField: "category_id",
                        foreignField: "unique_id",
                        as: "topicdata"
                    }
                },
                 { "$unwind": "$topicdata" },
                { "$project": 
                    {
                        "created_at" : "$topicdata.created_at",
                        "available" : "$topicdata.available",
                        "studyplan" : "$topicdata.studyplan",
                        "categoryname" : "$topicdata.categoryname",
                        "created_by" : "$topicdata.created_by",
                        "unique_id" : "$topicdata.unique_id",
                      } 
                }
                ])
                .then(function(getsubTopics)
                {
                  //console.log('gst-',getsubTopics)
                  subtopics.aggregate(
                  [
                    { "$match":{ "studyplan":true, "created_by":req.body.createdby, "tagname": new RegExp(searchdata, 'i') }},
                    {"$sort": {"created_at": -1}},
                    {
                      $lookup:
                      {
                          from: "categories",
                          localField: "category_id",
                          foreignField: "unique_id",
                          as: "topicdata"
                      }
                    },
                    { "$unwind": "$topicdata" },
                    { "$project": 
                      {
                          "created_at" : "$topicdata.created_at",
                          "available" : "$topicdata.available",
                          "studyplan" : "$topicdata.studyplan",
                          "categoryname" : "$topicdata.categoryname",
                          "created_by" : "$topicdata.created_by",
                          "unique_id" : "$topicdata.unique_id",
                        } 
                    }
                  ])
                  .then(function(getsubTopics2)
                  {
                    //console.log('gst-',getsubTopics2)
                    var subprimes = getCategories.concat(getTopics,getTags,getsubTopics,getsubTopics2);
                    var uniq = {}
                    var primes = subprimes.filter(obj => !uniq[obj.unique_id] && (uniq[obj.unique_id] = true));
                    //console.log("primes:",primes)
                    var finaltopics=primes.sort(function(a, b)
                    {
                      // var nameA=a.categoryname.toLowerCase(), nameB=b.categoryname.toLowerCase()
                      // if (nameA < nameB) //sort string ascending
                      //     return -1 
                      // if (nameA > nameB)
                      //     return 1
                      // return 0 //default return value (no sorting)

                      var nameA=a.categoryname.toLowerCase(), nameB=b.categoryname.toLowerCase(),nameC=searchdata.toLowerCase()
                      if (nameA.indexOf(nameC) > nameB.indexOf(nameC)) //sort string ascending
                          return -1 
                      if (nameA.indexOf(nameC) < nameB.indexOf(nameC))
                          return 1
                      return 0 //default return value (no sorting)
                    })
                    if(finaltopics.length > 0)
                    {
                      var counter = -1;
                      const notes= db.get('notes');
                      const remindme= db.get('studyplan_topicreminders');

                      asyncLoop(finaltopics, function (t_data, next)
                      {
                        counter++
                        finaltopics[counter]['duedate']='';
                        finaltopics[counter]['starstatus']=0;
                        finaltopics[counter]['chkstatus']=0;
                        finaltopics[counter]['notestatus']=false;
                        finaltopics[counter]['note_id']='';
                        finaltopics[counter]['note_content']='';
                        finaltopics[counter]['remindmeid']='';
                        finaltopics[counter]['remindmesdate']='';
                        finaltopics[counter]['remindmeNote']='';
                        finaltopics[counter]['remindmeTitle']='';

                        sp_duedates.find({'topic_id': t_data.unique_id, 'created_by': req.body.createdby}).then(function(findduedate)
                        {
                          // //console.log('duedates-',findduedate);
                          if(findduedate != undefined && findduedate.length > 0)
                          {
                              findduedate.forEach(function(entry)
                              {
                                      if(entry.due_date){finaltopics[counter]['duedate']=entry.due_date;}
                                      else{finaltopics[counter]['duedate'] = '';}
                                      if(entry.star_status){finaltopics[counter]['starstatus'] = entry.star_status;}
                                      else{finaltopics[counter]['starstatus'] = 0 ;}
                                      if(entry.chkbox_status){finaltopics[counter]['chkstatus']=entry.chkbox_status;}
                                      else{finaltopics[counter]['chkstatus'] = 0}
                              });
                          }
                          notes.findOne({'topic_id':t_data.unique_id, created_by:req.body.createdby},{sort:{'created_at':-1}}).then(function(findnotes)
                          {
                            // //console.log('noes-',findnotes);
                              if(findnotes != null)
                              {
                                      finaltopics[counter]['notestatus'] = true;
                                      finaltopics[counter]['note_id'] = findnotes.unique_id;
                                      finaltopics[counter]['note_content'] = findnotes.content;
                              }
                              remindme.findOne({'topic_id':t_data.unique_id, created_by:req.body.createdby},{sort:{'created_at':-1}}).then(function(findremindme)
                              {
                                // //console.log('remindme-',findremindme);
                                  if(findremindme != null)
                                  {
                                          finaltopics[counter]['remindmeid'] = findremindme._id;
                                          finaltopics[counter]['remindmesdate'] = findremindme.remindme_sdate;
                                          finaltopics[counter]['remindmeNote'] = findremindme.notes;
                                          finaltopics[counter]['remindmeTitle'] = findremindme.title;
                                  }
                                  next();
                              }).catch(function(error){
                                  next();
                              });
                          }).catch(function(error){
                              next();
                          });
                        }).catch(function(error){
                          next();
                        });
                      }, function (err)
                      {
                          if (err)
                          {
                              console.error('Inner Error: ' + err.message);
                          }
                          // //console.log('final-');
                          res.json(finaltopics);
                      });
                    }
                    else
                    {
                      //console.log('final- nodata');
                      res.json([]);
                    } 

                  // res.json(finaltopics); 
                  });//getsubTopics2
                });//getsubTopics
              });//getTags
            }); //getTopics
        }); //getCategories
    }//else
}
 //*********************************************************************************************************************************************************************
 exports.getAllcategorynameStudyPlan = function(req,res)
 {
    //console.log(req.body.id);
    const categorydata= db.get('categories');
    const topicsdata= db.get('studyplan_topics');
    const tags= db.get('tags');
    const subtopics= db.get('studyplan_subtopics');
    const sp_duedates= db.get('studyplan_duedates');
    const subtopicStatus= db.get('studyplan_subtopicstatus');
    categorydata.find({"unique_id":req.body.id},{sort:{'categoryname':1}}).then(function(getTopics)
    {
        topicsdata.find({"unique_id":req.body.id},{sort:{'tagname':1}})
        .then(function(get_spTopics)
        {
            var primes = getTopics.concat(get_spTopics);
            var counter = -1;
            asyncLoop(primes, function (getpTopic, next)
            {
                counter++;
                primes[counter]['duedate']='';
                primes[counter]['starstatus']=0;
                primes[counter]['chkstatus']=0;
                primes[counter]['subtopics']=[];
                sp_duedates.find({'topic_id': req.body.id, 'created_by': req.body.createdby}).then(function(findduedate)
                {
                    if(findduedate != undefined && findduedate.length > 0){
                            // finaltopics[counter]['duedateData'] = findduedate ;
                           findduedate.forEach(function(entry)
                           {
                                if(entry.due_date){primes[counter]['duedate']=entry.due_date;}
                                else{primes[counter]['duedate'] = '';}
                                if(entry.star_status){primes[counter]['starstatus'] = entry.star_status;}
                                else{primes[counter]['starstatus'] = 0 ;}
                                if(entry.chkbox_status){primes[counter]['chkstatus']=entry.chkbox_status;}
                                else{primes[counter]['chkstatus'] = 0}
                           });
                        }
                }); //sp_duedates
                tags.find({"studyplan":true,"category_id":getpTopic.unique_id},{sort:{'tagname':1}}).then(function(getsubTags)
                {
                            // //console.log('getsubTags-', getsubTags)
                    subtopics.find({"studyplan":true,"category_id":getpTopic.unique_id, "created_by":req.body.createdby},{sort:{'tagname':1}}).then(function(getsubTopics)
                    {
                            // //console.log('getsubTopics-', getsubTopics)
                        var subprimes = getsubTags.concat(getsubTopics);
                            //console.log('subprimes-', subprimes)
                        if(subprimes.length > 0)
                        {
                          //console.log('in')
                            var counter1 = -1;
                            var arr=[];
                            asyncLoop(subprimes, function (spost, next1)
                            {
                                counter1++
                                subprimes[counter1]['chkbox_status'] = 0;
                                subtopicStatus.findOne({"topic_id":spost.category_id,"subtopic_id":spost.unique_id, "created_by":req.body.createdby}).then(function(findrole)
                                {
                                    //console.log('s-',spost.unique_id)
                                   
                                    if(findrole!==null)
                                    {
                                        // //console.log('cstatus-',findrole.chkbox_status)
if(findrole.chkbox_status!==null){
  subprimes[counter1]['chkbox_status'] = findrole.chkbox_status;
}else{
  subprimes[counter1]['chkbox_status'] = 0;
}
                                   

                                    }
                                    else{
                                        
                                        // //console.log(' no cstatus-',0)
                                        subprimes[counter1]['chkbox_status'] = 0;
                                    }
                                    arr.push(subprimes[counter1]);
                                    //console.log('ar-',arr)
                                    next1();
                                });                    
                            }, function (err)
                            {
                                    if (err){ console.error('Inner Error: ' + err.message); }
                                    // return
                                    //console.log('array push');
                                   
                            primes[counter]['subtopics']=arr; 
                             next(); 
                            });
                             //console.log('finalsubprimepppppps-',arr);
                        }
                        else{
                          //console.log('out')
                          next(); 
                        }
                    }); //subtopics
                }); //tags
            }, function (err) //getpTopic
            {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                    // return;
                }
                res.json(primes);
            });
        }); //topicsdata
    });//categorydata
 }
 //****************************************************************************************************************************************************************
 exports.getStudyPlanNote = function(req,res)
{
    //console.log(req.body.topic_id);
    //console.log(req.body.createdby);
    const notes= db.get('notes');
    notes.findOne({"created_by":req.body.createdby,'topic_id':req.body.topic_id},{sort:{'created_at':-1}}).then(function(getnotes)
    {
        if(getnotes!=null || getnotes!=undefined)
        {
            res.json(getnotes);
        }
        else{res.json([]);}
    });             
  
}
//*******************************************************************************************************************************************************************
exports.getNowRemindme = function(req,res)
{
    //console.log('Date-', Date.now())
    const topicreminder= db.get('studyplan_topicreminders');
    
    topicreminder.find({"remindme_sdate":req.body.reminder}).then(function(getreminders)
    {
      //console.log('reminder-', getreminders)
        if(getreminders!=null || getreminders!=undefined)
        {
            var counter = -1;
            const users= db.get('users');
            const categories= db.get('categories');
            const topics= db.get('studyplan_topics');
            asyncLoop(getreminders, function (t_data, next)
            {
                counter++
                getreminders[counter]['firstname']='';
                getreminders[counter]['lastname']='';
                getreminders[counter]['user_mail']='';
                getreminders[counter]['topicname']='';
                users.findOne({'unique_id':t_data.created_by}).then(function(findusers)
                {
                  if(findusers != null)
                  {
                    getreminders[counter]['firstname']=findusers.firstname;
                    getreminders[counter]['lastname']=findusers.lastname;
                    getreminders[counter]['user_mail']=findusers.email;
                  }
                  categories.findOne({"unique_id":t_data.topic_id}).then(function(getCategories)
                  {
                    if(getCategories ==null)
                    {
                      topics.findOne({"unique_id":t_data.topic_id}).then(function(getTopics)
                      {
                        getreminders[counter]['topicname']=getTopics.categoryname;
                        next();    
                      });
                    }
                    else
                    {
                      getreminders[counter]['topicname']=getCategories.categoryname;
                      next(); 
                    }
                }); //categories
                }).catch(function(error){
                    next();
                }); 
            }, function (err)
              {
                if (err)
                {
                    console.error('Inner Error: ' + err.message);
                }
                res.json(getreminders);
              }); 
        }
        else{res.json([]);}
    });             
}
//***************************************************************************************************************************************************************
 
 exports.getMergerdataTopic = function(req,res){
      //console.log(req.body.id);
      const topics= db.get('studyplan_topics');
    topics.find({'created_by': req.body.createdby,'studyplan':true}).then(function(getTopics){
        res.json(getTopics);
    });             
  
}

 exports.getMergerdataSubTopic = function(req,res){
    //console.log(req.body.id);
      const subtopics= db.get('studyplan_subtopics');
    subtopics.find({'created_by': req.body.createdby,'studyplan':true}).then(function(getTopics){
        res.json(getTopics);
    });  
 }
 exports.saveStudyplanSubmitData= function(req,res){
    //console.log(req.body.id);
      const subtopics= db.get('studyplan_submited');
    subtopics.insert({'category_id':req.body.cat_id,'created_by': req.body.createdby,'activestar':true}).then(function(getTopics){
        res.json(getTopics);
    });  
 }
 

 