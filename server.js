
// connecting to mongodb with monk for live
// global.db = require('monk')('root:KQKp7mQw8Su3@127.0.0.1:27017/gpexcommunity?authSource=admin', function(err, db){
//     if(err){
//        console.error("Db is not connected", err.message);
//     }
//     else{
//        console.log("data base connected");
//     }
// });

// connecting to mongodb with monk for local
global.db = require('monk')('localhost/gpexcommunity', function(err, db){
    if(err){
       console.error("Db is not connected", err.message);
    }
    else{
        console.log("data base connected");
    }
});
var express = require('express');
var jwt = require('jsonwebtoken');
var multer  = require('multer');
// var sharp = require('sharp');
const request = require('request');
var fs = require('fs');
var path = require('path')
var app = express();
var mongoose   = require('mongoose');
var cors = require('cors')
const crypto = require('crypto');
mongoose.connect('mongodb://root:KQKp7mQw8Su3@127.0.0.1:27017/gpexcommunity?authSource=admin', { useNewUrlParser: true });
mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true)
var users = require('./app/models/users');
var roles = require('./app/models/roles');
var groups = require('./app/models/groups');
var posts = require('./app/models/posts');
var reports = require('./app/models/reports');
//var post_saves = require('./app/models/post_saves');
var default_images = require('./app/models/default_images');
//var comment_likes = require('./app/models/comment_likes');
//var resettags = require('./app/models/reset_tags');
var comments = require('./app/models/comments');
var slider_settings = require('./app/models/slider_settings');
var image_libraries = require('./app/models/image_libraries');
var categories = require('./app/models/categories');
var studyplantopic = require('./app/models/studyplan_topic');
var studyplansubtopic = require('./app/models/studyplan_subtopics');
var studyplanremindme = require('./app/models/studyplan_topicreminders');
var tags = require('./app/models/tags');
var notes = require('./app/models/notes');
var post_types = require('./app/models/post_type');
var modules = require('./app/models/modules');
//var pollsubmit = require('./app/models/polls_submitions');
var capabilitylable = require('./app/models/capabilitylable');
const APIData = require('./controllers/postcontroller');
const Logset = require('./controllers/logscontroller');
const QuestionCons = require('./controllers/questioncontroller');
const ArticleCons = require('./controllers/articlecontroller');
const UserCons = require('./controllers/usercontroller');
const StudyPlan = require('./controllers/studyplancontroller');
const CapabilityCont = require('./controllers/modulecontroller');
const PDFPreview = require('./controllers/pdfpreviewcontroller');
const TagsData = require('./controllers/tagscontroller');
const PollData = require('./controllers/pollcontroller');
const Notification = require('./controllers/notificationcontroller');
const Settings = require('./controllers/settingscontroller');
const Dashboard = require('./controllers/dashboardcontroller');
const UserDashboard = require('./controllers/userdashboardcontroller');
const ExamHashtag = require('./controllers/examhashtagscontroller');
const McqCompchart = require('./controllers/mcqcontroller');
//const userperweek = require('./controllers/userperweekcontroller.js');
const appDevice = require('./controllers/appController.js');
const cron = require('./controllers/cronController.js');
const summarycon = require('./controllers/summarycontroller.js');


// send Mail Note
const sendMailNote = require('./controllers/sendMailNote')
// save Resources
const saveResources = require('./controllers/saveResources')
// Related Resources module
const resourcesModule = require('./controllers/resourcesModule')
// userlog report
const userLogReport = require('./controllers/userLogReport')


var config = require('./config');
var bodyParser = require('body-parser');
//var asyncLoop = require('node-async-loop');
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
router.post('/createhashtag', ExamHashtag.createHashtags);
router.post('/gethashtaglists', ExamHashtag.getHashtagList);

router.post('/checkNodeServer', APIData.checkNodeServer);
router.post('/getallposts', APIData.getAllposts);
router.post('/getallpostsbytitle', APIData.getallpostsbytitle);
router.post('/gettablerecord', APIData.getTableRecord);
router.post('/getallresourceposts', APIData.getAllresourceposts);
router.post('/getdefaultresourceposts', APIData.getDefaultResourcePosts);
router.post('/getnextallposts', APIData.getNextPosts);
router.post('/getonepost',APIData.getOnePosts);
router.post('/get_addRestags',APIData.getAddRestags);
router.post('/getsavedrespost',APIData.getSavedResposts);
router.post('/availtopicnsubtopic',APIData.availTopicnSubtopic);
router.get('/getalltags', APIData.getAlltags);
router.get('/getalldefaultimages', APIData.getAlldefaultimages);
router.post('/getallcategory', APIData.getAllcategory);
router.get('/getallquestiontypes', APIData.getAllquestiontypes);
router.post('/getpermitedallquestiontypes', APIData.getAllPermitedquestiontypes);
router.get('/getallcolleges', APIData.getAllcolleges);
router.get('/getalldomain', APIData.getAlldomain);
router.get('/getallicpc2', APIData.getAllicpc2);
router.get('/getallgender', APIData.getAllgender);
router.get('/getallagerange', APIData.getAllagerange);
router.get('/getallsliderimages', APIData.getAllSliderimages);
router.get('/getalllibraryimages', APIData.getAlllibraryimages);
router.get('/getalllibimages', APIData.getalllibimages);
router.post('/getcommentsofpost', APIData.getCommentsofPost);
router.post('/getcommentuserlist', APIData.getCommentUserlist);
router.post('/getpostlikers', APIData.getPostlikers);
router.post('/getcommentlikers', APIData.getCommentlikers);
router.post('/getTitleresourceposts', APIData.getTitleResourcePosts);
router.post('/getSharedresourceposts', APIData.getSharedResourcePosts);
router.post('/getusersdetails',APIData.getUsersDetails);
router.post('/getusersresourcedetails',APIData.getUsersrecourseDetails);
router.get('/gettagdatatable',APIData.getTagDataTable);
router.post('/editcategory',APIData.getEditCategory);
router.post('/updatecategory',APIData.getUpdateCategory);
router.post('/edittagcategory',APIData.getEditTagcategory);
router.post('/edittags',APIData.getEditTags);
router.post('/updatetags',APIData.getUpdateTags);
router.post('/getcommentsofcomments', APIData.getCommentsofComments);
router.post('/getmailapi', APIData.getMailApi);
router.post('/getallusersdata', APIData.getAllUsersData);
router.post('/multitopic', APIData.multiTopics);
router.post('/getoneslider', APIData.getOneSlider);
router.post('/editsliderimage', APIData.editSliderImage);
router.post('/updateeditcomment', APIData.updateEditComment);
router.post('/removepostcomment', APIData.removePostComment);
router.post('/getonequestionpost', APIData.getOneQuestionPost);
router.post('/gethashtagposts', APIData.getHashtagPosts);

// to get the post with tags count
router.post('/counttags', APIData.countForTags)



router.post('/savepollquestion', PollData.savePollQuestion);
router.post('/getallpolls', PollData.getAllPolls);
router.post('/submitpoll', PollData.submitPollResult);



router.post('/saveappdevicetoken', appDevice.saveAppdevicetoken);
router.post('/removeappdevicetoken', appDevice.removeAppdevicetoken);
router.post('/sendnotification', appDevice.sendNotification);
// device entry for report
router.post('/appuserlog', appDevice.appUserLog);


cron.sendscheduledarticleNotification();
cron.sendscheduledquestionNotification();
cron.checkOneServer();




router.post('/savequestion', QuestionCons.saveQuestion);
router.post('/deletequestion', QuestionCons.deleteMCQquestion);
router.post('/deletekfpquestion', QuestionCons.deleteKFPquestion);
router.post('/deleteimgweekquestion', QuestionCons.deleteImgWeekquestion);
router.post('/deletesingleKFPquestion', QuestionCons.deleteSingleKFPquestion);
router.post('/deletecasequestion', QuestionCons.deleteCaseQuestion);
router.post('/deletestudentquestion', QuestionCons.deleteStudentQuestion);
router.post('/savequestionoption', QuestionCons.saveQuestionOption);
router.post('/updatesavequestion', QuestionCons.updatesaveQuestion);
router.post('/updatesavequestionoption', QuestionCons.updatesaveQuestionOption);
router.post('/savekfpquestion', QuestionCons.saveKFPQuestion);
router.post('/saveimgweekquestion', QuestionCons.saveImgWeekQuestion);
router.post('/updatesavekfpquestion', QuestionCons.updatesaveKFPQuestion);
router.post('/savecasebasequestion', QuestionCons.saveCaseBaseQuestion);
router.post('/updatesavecasebasequestion', QuestionCons.updatesaveCaseBaseQuestion);
router.post('/questionanswer', QuestionCons.QuestionAnswer);
router.post('/kfpquestionanswer', QuestionCons.KFPQuestionAnswer);
router.post('/sbaquestionanswer', QuestionCons.SbaQuestionAnswer);
router.post('/savesbacomments', QuestionCons.saveSBAComments);
router.post('/imgofweekquestionanswer', QuestionCons.ImgofweekQuestionAnswer);
router.post('/imgofweeksinglequestionanswer', QuestionCons.ImgofweeksingleQuestionAnswer);
router.post('/savestudentquestion', QuestionCons.saveStudentQuestion);
router.post('/updatesavestudentquestion',QuestionCons.updateSaveStudentQuestion);

router.post('/casequestionanswer', QuestionCons.CASEsingleQuestionAnswer);
router.post('/studentquestionanswer', QuestionCons.StudentsingleQuestionAnswer);
router.post('/publishquestion', QuestionCons.publishQuestion);
router.post('/updatepublishquestion', QuestionCons.updatepublishQuestion);
router.post('/getallquestions', QuestionCons.getAllQuestions);
router.post('/getquestionpostdata', QuestionCons.getOnePosts);
router.post('/getanswersofquestion', QuestionCons.getAnswersofquestion);
router.post('/getkfpanswersofquestion', QuestionCons.getKFPAnswersofquestion);
router.post('/getimgweekanswersofquestion', QuestionCons.getImgweekAnswersofquestion);
router.post('/getcaseanswersofquestion', QuestionCons.getCaseAnswersofQuestion);
router.post('/getkfpuserwiseanswers', QuestionCons.getKFPUserwiseAnswers);
router.post('/getimageUserwiseAnswers', QuestionCons.getImageUserwiseAnswers);
router.post('/getcaseuserwiseanswers', QuestionCons.getCaseUserWiseAnswers);
router.post('/getsbauserwiseanswers', QuestionCons.getSBAUserwiseAnswers);
router.get('/getfilterquestiontypes', QuestionCons.getFilterquestiontypes);
router.post('/getallkfpquestions', QuestionCons.getAllKFPQuestions);
router.post('/getmyuserquestions', QuestionCons.getMyUserQuestions);
router.post('/getquestionbyid', QuestionCons.getQuestionbyId);
router.post('/getkfpquestionbyid', QuestionCons.getKFPQuestionbyId);
router.post('/getcasequestionbyid', QuestionCons.getCASEQuestionbyId);
router.post('/getstudentquestionbyid',QuestionCons.getStudentQuestionbyId);
router.post('/getquestionforanswer', QuestionCons.getQuestionforanswer);
router.post('/submitsinglekfp', QuestionCons.submitSingleKFP);
router.post('/submitSingleimg', QuestionCons.submitSingleIMG);

router.post('/getcasequestionforanswer', QuestionCons.getCaseQuestionforanswer);
router.post('/unpublishquestion', QuestionCons.UnpublishQuestion);
router.post('/publishquestionreport', QuestionCons.PublishQuestionReport);
router.post('/setquestionview', QuestionCons.setQuestionView);
router.post('/getquestionview', QuestionCons.getQuestionView);
router.post('/addcasecomment', QuestionCons.saveCaseComments);
router.post('/addstudentcomment', QuestionCons.saveStudentComments);
router.post('/addkfpcomment', QuestionCons.saveKFPComments);
router.post('/updatecasecomment', QuestionCons.updateCaseComments);
router.post('/updatestudentcomments',QuestionCons.updateStudentComments);
router.post('/caselikedislikecomment', QuestionCons.likedislikecomment);
router.post('/studentlikedislikecomment', QuestionCons.StudentLikeDislikeComment);
router.post('/removecasecomment', QuestionCons.removeCaseComments);
router.post('/removestudentcomment', QuestionCons.removeStudentComments);
router.post('/getcasecommentlikers', QuestionCons.getCaseCommentlikers);
router.post('/getstudentcommentlikers',QuestionCons.getStudentCommentLikers);
router.post('/getsinglecasequestion', QuestionCons.getSingleCaseQuestion);
router.post('/getsinglestudentquestion', QuestionCons.getSingleStudentQuestion);
router.post('/getquestiontagsdatas', QuestionCons.getQuestionTagsData);
router.post('/getcasequestionbyidstatus', QuestionCons.getCaseQuestionByIdStatus);
router.post('/getpostquestionstatus', QuestionCons.getPostQuestionStatus);
router.post('/getkfpquestionByidstatus', QuestionCons.getKfpQuestionByIdStatus);
router.post('/getquestionByidstatus', QuestionCons.getQuestionByIdStatus);
router.post('/getquestion', QuestionCons.getQuestion);
router.post('/getimgweekquestionbyid', QuestionCons.getImgWeekQuestionbyId);
router.post('/updatesaveimgweekquestion', QuestionCons.updatesaveImgWeekQuestion);
router.post('/deletesingleimgweekquestion', QuestionCons.deleteSingleImgWeekQuestion);
router.post('/getimgweekquestionforanswer', QuestionCons.getImgWeekQuestionforanswer);
router.post('/addimgweekcomments', QuestionCons.saveImgWeekComments);
router.post('/getstudentquestionforanswer', QuestionCons.getStudentQuestionforAnswer);
router.post('/getquestionorder', QuestionCons.getQuestionOrder);

//summary
router.post('/savequestionsummary', summarycon.saveQuestionSummary);
router.post('/getquestionsummary', summarycon.getQuestionSummary);

// Related Resources module
router.post('/saveresourcesmodule', resourcesModule.saveResourcesModule);
router.post('/getresourcesmodule', resourcesModule.getResourcesModule);
router.post('/deleteandupdateresources', resourcesModule.deleteAndUpdateResources);
router.post('/answerreltedresources', resourcesModule.answerReltedResources);
router.post('/resourcesanswer', resourcesModule.resourcesAnswer);
router.post('/updateddisplaystatus', resourcesModule.updatedDisplayStatus);
router.post('/addtoquestion', resourcesModule.addToQuestion);
router.post('/answerreltedresourcesdata', resourcesModule.answerReltedResourcesData);



router.post('/getallcategorystudyplan', StudyPlan.getAllcategoryStudyPlan);
router.post('/getalltagstudyplan', StudyPlan.getAlltagStudyPlan);
router.post('/getalltopicnamestudyplan', StudyPlan.getAllcategorynameStudyPlan);
router.post('/getmergestudyplantopic', StudyPlan.getMergerdataTopic);
router.post('/getfinalcategories', StudyPlan.getFinalCategories);
router.post('/getstudyplannotes', StudyPlan.getStudyPlanNote);
router.post('/getmergestudyplansubtopic', StudyPlan.getMergerdataSubTopic);
router.post('/savestudyplansubmitdata', StudyPlan.saveStudyplanSubmitData);
router.post('/getSearchedtopic', StudyPlan.getSearchedTopic);
router.post('/getnowremindme', StudyPlan.getNowRemindme);
router.post('/setstudyplanview', StudyPlan.setStudyPlanView);



router.get('/getallmodules', CapabilityCont.getAllModules);
router.post('/getmoduledatatable', CapabilityCont.getModuleDataTable);
router.post('/editmodules',CapabilityCont.getEditModule);
router.post('/getmodule',CapabilityCont.getModule);
router.post('/getmoduleroles',CapabilityCont.getModuleRoles);
router.post('/updatemodule',CapabilityCont.getUpdateModules);
router.post('/updatemodule',CapabilityCont.getUpdateModules);
router.post('/getcapabilitylable',CapabilityCont.getCapabilityLable);
router.get('/getcapabilitylablelist',CapabilityCont.getCapabilityLableList);
router.post('/getcaplabel', CapabilityCont.getCapLabel);
router.post('/getmodulelabels', CapabilityCont.getModuleLabels);
router.post('/getcreatequestioncapability', CapabilityCont.getCreateQuestionCapability);



router.post('/convertpdftopreview',PDFPreview.convertPdftoPreview);
router.post('/getFilesizeInBytes',PDFPreview.getFilesizeInBytes);



router.post('/savetagsselected',TagsData.saveTagselected);
//userPost
const userPost = require('./controllers/userPost');
// get active users per days
const getActiveUsersPerDays = require('./controllers/getActiveUsersPerDays');

// image of the week days data
router.post('/getimageoftheweekdaysdata', Dashboard.getImageOfTheWeeKdaysData);
// image of the week weekData
router.post('/getimageoftheweekdata', Dashboard.getimageoftheweekdata);
// image of the week month data
router.post('/getimageoftheweekmonthdata', Dashboard.getimageoftheweekmonthdata);


// user question days data
router.post('/getuserquestiondaysdata', Dashboard.getuserquestiondaysdata);
// user question weekData
router.post('/getuserquestionweekdata', Dashboard.getuserquestionweekdata);
// user question monthData
router.post('/getuserquestionmonthdata', Dashboard.getuserquestionmonthdata);


// image of the week views dayData
router.post('/imageoftheweekviewdaydata', Dashboard.imageoftheweekviewdaydata);
// image of teh week view monthData
router.post('/imageoftheweekviewmonthdata', Dashboard.imageoftheweekviewmonthdata);
// image of the week view weekData
router.post('/imageoftheweekviewweekdata', Dashboard.imageoftheweekviewweekdata);


// user view dayData
router.post('/userviewdaysdata', Dashboard.userviewdaysdata);
// user view monthData
router.post('/userviewmonthdata', Dashboard.userviewmonthdata);
// user view weekData
router.post('/userviewweekdata', Dashboard.userviewweekdata);
// Question Report type
router.post('/questionreport', Dashboard.questionReport)


// report dashboard
 router.post('/reportdashboard', Dashboard.getReportDashboard)
 //  all Question Week Data Difference
router.post('/allquestionweekdatadifference', Dashboard.allQuestionWeekDataDifference)
// Week Data Difference Case And User
router.post('/datadifferencecaseanduser', Dashboard.WeekDataDifferenceCaseAndUser)

// to get search title post
router.post('/getsaveresourcesbytitle', saveResources.getResourceByTitle)

// to get post by ubique id
router.post('/getpostdatabyid', saveResources.getPostDataById)

// to get post by user detail(s)
router.post('/getpostbyuserdetail', saveResources.getPostByUserDetail)
// to get all post by user name
router.post('/getallpostbyusername', saveResources.postByUserName)
// get Posts By Tag Name
router.post('/getpostsbytagname', saveResources.getPostsByTagName)
// get data for check box
router.post('/fetchdataforcheck', saveResources.fetchDataForCheck)
//to add Thumnail To Video
router.post('/addthumnailtovideo', saveResources.addThumnailToVideo)

// articel data percentage
router.post('/articlepercentage', UserDashboard.articlePercentage)

// average time spent
router.post('/averagetimespent', UserDashboard.averageTimeSpent)

// to get average study plan
router.post('/studyplanaverage', UserDashboard.studyPlanAverage)

// send FinalMail
router.post('/sendfinalmail', sendMailNote.sendFinalMail)

//get Template Data
router.post('/gettemplatedata', sendMailNote.getTemplateData)

// to get latest post
router.post('/checknewpost', APIData.toCheckNewPost);

//send Link Via Message
router.post('/sendlinkviamessage', Dashboard.sendLinkViaMessage)
// send Link Report
router.post('/sendlinkreport', Dashboard.sendLinkReport)
// app user log report
router.post('/userlogreport', userLogReport.userLogReport);

router.post('/authorlist', ArticleCons.getAuthorlist);
router.post('/savearticle', ArticleCons.saveArticle);
router.post('/updatearticle', ArticleCons.updateArticle);
router.post('/getarticlebyid', ArticleCons.getArticleById);
router.post('/submitquestion', ArticleCons.QuestionAnswer);
router.post('/getallarticles', ArticleCons.getAllArticles);
router.post('/getarticleforedit', ArticleCons.getArticleForEdit);
router.post('/deletearticle', ArticleCons.deleteArticle);
router.post('/deletearticlesection', ArticleCons.deleteArticleSection);
router.post('/getrecentthreearticles', ArticleCons.getrecentthreeArticles);
router.post('/getarticlepostdata', ArticleCons.getOnePosts);
router.post('/unpublisharticle', ArticleCons.UnpublishArticle);
router.post('/publisharticle', ArticleCons.PublishArticle);
router.post('/setarticleview', ArticleCons.setArticleView);
router.post('/getarticleview', ArticleCons.getArticleView);
router.post('/updatesearchdata', ArticleCons.updatesearchdata);
router.post('/getarticleids', ArticleCons.getArticleids);



router.post('/getallusers', UserCons.getAllUsers);
router.post('/deleteuserfromlist', UserCons.deleteUserFrmList);
router.post('/geteditUserdata', UserCons.getEditUserData);
router.post('/getallroles', UserCons.getAllRoles);
router.post('/updateEdituserlist', UserCons.updateEditUserList);
router.post('/syncuserfromgpexone', UserCons.Syncuserfromgpexone);
router.post('/updateuserprofilefromone', UserCons.Updateuserprofilefromone);
router.post('/getsingleuser', UserCons.getSingleUser);
router.post('/examuserfromgpexone', UserCons.Examuserfromgpexone);

// create user
router.post('/createuser', UserCons.createUser);



router.post('/sendremindermail', Notification.sendReminderMail);
router.post('/getnotifications', Notification.getNotifications);
router.post('/getschedulednotifications', Notification.getScheduledNotifications);
router.post('/setarticlepublishnotification', Notification.setarticlepublishnotification);
router.post('/setquestionpublishnotification', Notification.setquestionpublishnotification);
router.post('/removenotifications', Notification.RemoveNotifications);
router.post('/clearnotifications', Notification.ClearNotifications);
Notification.ClearoldNotifications();
router.post('/clearoldnotifications', Notification.ClearoldNotifications);
router.post('/savetemplate', Notification.saveTemplate);
router.post('/getalltemplatetype', Notification.getallTemplateType);
router.post('/getalltemplates', Notification.getAllTemplates);
router.post('/removetemplate', Notification.removeTemplate);
router.post('/gettemplatebyid', Notification.getTemplatebyID);
router.post('/searchnotification', Notification.SearchNotification);
router.post('/updatetemplate', Notification.updateTemplate);
router.post('/setpostlikenotification', Notification.setpostlikenotification);
router.post('/setpostcommentnotification', Notification.setpostcommentnotification);
router.post('/notificationseen', Notification.NotificationSeen);
router.post('/getunseennotification', Notification.getUnseenNotifications);
router.post('/setpollpublishnotification', Notification.setpollpublishnotification);
router.post('/setfiveuserscommentnotification', Notification.setfiveuserscommentnotification);
router.post('/setfiveusersanswernotification', Notification.setfiveusersanswernotification);
router.post('/setstudyplanDueNotification/:token', Notification.setstudyplanDueNotification);
router.post('/setstudyplanremindernotification/:token', Notification.setstudyplanReminderNotification);
router.post('/setstudyplanreminderprenotification/:token', Notification.setstudyplanReminderPreNotification);
router.post('/sendpostreport', Notification.sendPostReports);
router.post('/nudgeemailuserinteraction', Notification.nudgeEmailUserInteraction);


router.get('/mcqcompchart', McqCompchart.mcqcompchart);
router.post('/getallmcqcompchart', McqCompchart.getallMCQCompChart);
router.post('/getmcquser', McqCompchart.getMcquser);



router.post('/getboardinglist', Settings.getBoardingList);
router.post('/addonboarding', Settings.saveBoardingList);
router.post('/updateonboarding', Settings.updateBoardingList);
router.post('/deleteonboarding', Settings.deleteBoardingList);
router.post('/getoneboardinglist', Settings.getOneBoardingList);
router.post('/saveboardingsubmission', Settings.saveBoardingSubmission);
router.post('/getuserboardingsubmission', Settings.getUserBoardingSubmission);
router.post('/savepolicycontent', Settings.savePolicyContent);
router.post('/getpolicycontent', Settings.getPolicyContent);
router.post('/saveuseraccept', Settings.saveUserAccept);
router.post('/getuseraccept', Settings.getUserAccept);
router.post('/sendContactsupportmail', Settings.sendContactSupportMail);
router.post('/saveusercontactsupport', Settings.saveUserContactSupport);
router.post('/getpolicyaccepted', Settings.getPolicyaccepted);


router.post('/getalluserlogs', Logset.getAllUserlogs);
router.post('/setfeepagescrolluserlog', Logset.setfeepageScrollUserlog);
router.post('/settagsvisit', Logset.setTagsVisit);
router.post('/setresourcesview', Logset.setResourcesView);



router.post('/getstudyplandashdata', Dashboard.getStudyplandashdata);
router.post('/getsbaquestiondashdata', Dashboard.getSBAQuestiondashdata);
router.post('/getcasequestiondashdata', Dashboard.getCASEQuestiondashdata);
router.post('/getkfpquestiondashdata', Dashboard.getKFPQuestiondashdata);
router.post('/getarticledashdata', Dashboard.getArticledashdata);
router.post('/getactiveuserdashdata', Dashboard.getActiveuserdashdata);
router.post('/getactiveuserdaysdata', Dashboard.getActiveuserDaysdata);
router.post('/getchangestudyplandashdata', Dashboard.getChangeStudyplandashdata);
router.post('/getchangesbaquestiondashdata', Dashboard.getChangeSBAQuestiondashdata);
router.post('/getchangecasequestiondashdata', Dashboard.getChangeCASEQuestiondashdata);
router.post('/getchangekfpquestiondashdata', Dashboard.getChangeKFPQuestiondashdata);
router.post('/getchangearticledashdata', Dashboard.getChangeArticledashdata);
router.post('/getchangeactiveuserdashdata', Dashboard.getChangeActiveuserdashdata);
router.post('/getchangeactiveuserdaysdata', Dashboard.getChangeActiveuserDaysdata);
router.post('/getchangeactiveusermonthdata', Dashboard.getChangeActiveuserMonthdata);
router.post('/getchangeactiveuserdayschurndata', Dashboard.getChangeActiveuserDayschurndata);
router.post('/getchangeactiveusermonthchurndata', Dashboard.getChangeActiveuserMonthchurndata);
router.post('/getchangeactiveuserweekdata', Dashboard.getChangeActiveuserWeekdata);
router.post('/getchangeactiveuserweekchurndata', Dashboard.getChangeActiveuserWeekchurndata);
router.post('/getchangequestiondaysdata', Dashboard.getChangeQuestionDaysdata);
router.post('/getchangequestionviewsdaysdata', Dashboard.getChangeQuestionViewsDaysdata);
router.post('/getchangequestionanswersdaysdata', Dashboard.getChangeQuestionAnswersDaysdata);
router.post('/getchangequestionmonthdata', Dashboard.getChangeQuestionMonthdata);
router.post('/getchangequestionanswersmonthdata', Dashboard.getChangeQuestionAnswersMonthdata);
router.post('/getchangequestionviewsmonthdata', Dashboard.getChangeQuestionViewsMonthdata);
router.post('/getchangequestionweekdata', Dashboard.getChangeQuestionWeekdata);
router.post('/getchangequestionanswersweekdata', Dashboard.getChangeQuestionAnswersWeekdata);
router.post('/getchangequestionviewsweekdata', Dashboard.getChangeQuestionViewsWeekdata);
router.post('/getactiveuserweekincrement', Dashboard.getactiveuserweekincrement);
router.post('/getactiveuserweekchurnrate', Dashboard.getactiveuserweekchurnrate);
router.post('/getsbaviewsdaysdata', Dashboard.getSBAviewsdaysdata);
router.post('/getsbaquestionsdaysdata', Dashboard.getSBAquestionsdaysdata);
router.post('/getsbaquestionanswersdaysdata', Dashboard.getSBAquestionanswersdaysdata);
router.post('/getkfpviewsdaysdata', Dashboard.getKFPviewsdaysdata);
router.post('/getkfpquestionsdaysdata', Dashboard.getKFPquestionsdaysdata);
router.post('/getimgquestionsdaysdata', Dashboard.getIMGquestionsdaysdata);
router.post('/getuserquestionsdaysdata', Dashboard.getUSERquestionsdaysdata);
router.post('/getkfpquestionanswersdaysdata', Dashboard.getKFPquestionanswersdaysdata);
router.post('/getcaseviewsdaysdata', Dashboard.getCASEviewsdaysdata);
router.post('/getcasequestionsdaysdata', Dashboard.getCASEquestionsdaysdata);
router.post('/getcasequestionanswersdaysdata', Dashboard.getCASEquestionanswersdaysdata);
router.post('/getarticleviewsdaysdata', Dashboard.getArticleviewsdaysdata);
router.post('/getsbaviewsweekdata', Dashboard.getSBAviewsweekdata);
router.post('/getsbaquestionsweekdata', Dashboard.getSBAquestionsweekdata);
router.post('/getsbaquestionanswersweekdata', Dashboard.getSBAquestionanswersweekdata);
router.post('/getcaseviewsweekdata', Dashboard.getCASEviewsweekdata);
router.post('/getcasequestionsweekdata', Dashboard.getCASEquestionsweekdata);
router.post('/getcasequestionanswersweekdata', Dashboard.getCASEquestionanswersweekdata);
router.post('/getkfpviewsweekdata', Dashboard.getKFPviewsweekdata);
router.post('/getkfpquestionsweekdata', Dashboard.getKFPquestionsweekdata);
router.post('/getimgquestionsweekdata', Dashboard.getIMGquestionsweekdata);
router.post('/getuserquestionsweekdata', Dashboard.getUSERquestionsweekdata);
router.post('/getkfpquestionanswersweekdata', Dashboard.getKFPquestionanswersweekdata);
router.post('/getarticleviewsweekdata', Dashboard.getArticleviewsweekdata);
router.post('/getsbaviewsmonthdata', Dashboard.getSBAviewsmonthdata);
router.post('/getsbaquestionsmonthdata', Dashboard.getSBAquestionsmonthdata);
router.post('/getsbaquestionanswersmonthdata', Dashboard.getSBAquestionanswersmonthdata);
router.post('/getcaseviewsmonthdata', Dashboard.getCASEviewsmonthdata);
router.post('/getcasequestionsmonthdata', Dashboard.getCASEquestionsmonthdata);
router.post('/getimgquestionsmonthdata', Dashboard.getIMGquestionsmonthdata);
router.post('/getuserquestionsmonthdata', Dashboard.getUSERquestionsmonthdata);
router.post('/getcasequestionanswersmonthdata', Dashboard.getCASEquestionanswersmonthdata);
router.post('/getkfpviewsmonthdata', Dashboard.getKFPviewsmonthdata);
router.post('/getkfpquestionsmonthdata', Dashboard.getKFPquestionsmonthdata);
router.post('/getkfpquestionanswersmonthdata', Dashboard.getKFPquestionanswersmonthdata);
router.post('/getarticleviewsmonthdata', Dashboard.getArticleviewsmonthdata);
router.post('/getmostactiveusers', Dashboard.getMostactiveusers);
router.post('/getmostcomments', Dashboard.getMostcomments);
router.post('/getmostviews', Dashboard.getMostviews);
router.post('/getmostanswers', Dashboard.getMostanswers);
router.post('/getstoppedactiveusers', Dashboard.getStoppedactiveusers);
router.post('/getpostsavers', Dashboard.getPostSavers);
router.post('/getsbamcqmonthlyavrg', Dashboard.getsbamcqmonthlyavrg);
router.post('/getsbamcqanswermonthlyavrg', Dashboard.getsbamcqanswermonthlyavrg);



// data Per Day week Month
router.post('/dataperdayweekmonth', Dashboard.dataPerDayWeekMonth);



router.post('/getallpolicies', Settings.getAllPolicies);
router.post('/changepolicystatus', Settings.changePolicyStatus);
router.post('/deletepolicy', Settings.deletePolicy);
router.post('/getpolicybyid', Settings.getPolicyById);
router.post('/editpolicycontent', Settings.editPolicyContent);


router.post('/getuserlastlogin', Settings.getUserLastLogin);
// userPosts
router.post('/getusersavedpost', userPost.userPost);
// get active user days churn data
router.post('/getactiveusersperdays', getActiveUsersPerDays.getActiveUsersPerDays);

// send mail notification
router.post('/sendmailnote', sendMailNote.sendMailNote);
// notification template
router.post('/savenotificationtemplate', sendMailNote.saveNotificationTemplate);
// all Template Data
router.post('/alltemplatedata', sendMailNote.allTemplateData);
// article With Same Tag
router.post('/articlewithsametag', sendMailNote.articleWithSameTag);
// no Commetn And Answer
router.post('/nocommetnandanswer', sendMailNote.noCommetnAndAnswer);
// viewed But No Answer
router.post('/viewedbutnoanswer', sendMailNote.viewedButNoAnswer);
// to find single user activity in last seven days
router.post('/useactivityanalysis', sendMailNote.useActivityAnalysis);

//User dashboard ---suraj--

router.post('/userdashboardquestion', UserDashboard.questionanswered);
router.post('/userdashboardquestion_imgoftheweek', UserDashboard.userdashboardquestion_imgoftheweek);
router.post('/userdashboardquestion_chart', UserDashboard.userdashboardquestion_chart);
router.post('/getviewsweeklychanges', Dashboard.getviewsweeklychanges);
router.post('/getviewsweeklychanges1', UserDashboard.getviewsweeklychanges);

// save Resources
router.post('/saveresources', saveResources.saveResources)

// get saved Resources
router.post('/getsaveresources', saveResources.getSaveResource)

router.post('/testing_123', UserDashboard.testing_123);

//  all Question Week Data Difference
router.post('/allquestionweekdatadifference', Dashboard.allQuestionWeekDataDifference)

// Week Data Difference Case And User
router.post('/datadifferencecaseanduser', Dashboard.WeekDataDifferenceCaseAndUser)
// month data percentage
router.post('/monthdatadifference', Dashboard.monthDataDiffrence)

// month data percentage caase and user
router.post('/monthdatadifferencecaseanduser', Dashboard.monthDataDiffrenceCaseAndUser)

// month data percentage views
router.post('/monthdatadifferenceviews', Dashboard.monthDataDiffrenceViews)

//weekly data percentage for question(s)
router.post('/weeklyquestionpercentage', Dashboard.weeklyQuestionPercentage)

//monthly data percentage for question(s)
router.post('/monthlyquestionpercentage', Dashboard.monthlyQuestionPercentage)

//weekly data percentage for Study Plan
router.post('/studyplandataperweek', Dashboard.StudyPlanDataPerWeek)

//monthly data percentage for Study Plan
router.post('/studyplandatapermonth', Dashboard.StudyPlanDataPerMonth)

//to hide bottom Store notification
router.post('/handlenotification', Dashboard.handleNotification)

// to get average correct answer
router.post('/getcorrectanswer', UserDashboard.getCorrectAnswer)

// to get latest post
router.post('/questionids', saveResources.questionIds);

// to get all posts
router.post('/getallpostsforeport', saveResources.getAllPosts);


// to get the post with unique id
router.post('/getposttoview', saveResources.getPostToView)




router.route('/getroles')
     .post(function(req, res) {
         if(req.body.searchedrole==null){
            data={}
         }else{
            data={'roletitle' : new RegExp(req.body.searchedrole, 'i')}
         }

        roles.find(data,function(err,rolesdata) {
            if (err)
                res.send(err);

            res.json(rolesdata);
        });
      });
//****************************************************************************************************************
router.route('/gettags')
.post(function(req, res)
{
  if(req.body.searchedtag==null)
  {
    // const cat=db.get('reset_tags');
    // cat.aggregate(
    // [
    //   {"$sort": {"_id": -1}},
    //   { "$limit" : 10 },{ $unwind : "$tagdata" },
    //   { $project : { _id:0, tagname : '$tagdata.tagname', unique_id : '$tagdata.unique_id' } }
    // ])
    // .then(function(gettags)
    // {
    //   var s_tag=[];
    //   if(gettags!=undefined && gettags.length > 0 )
    //   {
    //     gettags.forEach(function(tagval)
    //     {
    //       if(tagval.tagname!==null)
    //       s_tag.push(tagval);
    //     })
    //     res.json(s_tag);
    //   }
    // });
    res.json([]);
  }
  else
  {
    categories.aggregate([
        {$match:{"available":true,'categoryname' : new RegExp(req.body.searchedtag, 'i')}},
        { "$project": {
                         "_id":1,
                         "tagname":"$categoryname",
                         "available":1,
                         "studyplan":1,
                         "resources":1,
                         "created_by":1,
                         "created_at":1,
                         "unique_id":1
                        }
            }
    ]).then(function(getResCategories)
    {
        tags.find({'available':true, 'tagname' : new RegExp(req.body.searchedtag, 'i')}).then(function(getTags)
        {
            var allres=getResCategories.concat(getTags);
            var finaltopics=allres.sort(function(a, b)
            {
                // var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
                // if (nameA < nameB) //sort string ascending
                //     return -1
                // if (nameA > nameB)
                //     return 1
                // return 0 //default return value (no sorting)

                var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase(),nameC=req.body.searchedtag.toLowerCase()
                if (nameA.indexOf(nameC) < nameB.indexOf(nameC)) //sort string ascending
                          return -1
                if (nameA.indexOf(nameC) > nameB.indexOf(nameC))
                          return 1
                return 0 //default return value (no sorting)
            })
            res.json(finaltopics);
        });
    });
  }
});
//****************************************************************************************************************
router.route('/get_resTags')
.post(function(req, res)
{
    const categories= db.get('categories');
    const tagsdata= db.get('tags');
    categories.aggregate([
        {$match:{"resources":true}},
        { "$project": {
                         "_id":1,
                         "tagname":"$categoryname",
                         "available":1,
                         "studyplan":1,
                         "resources":1,
                         "created_by":1,
                         "created_at":1,
                         "unique_id":1
                        }
            }
    ]).then(function(getResCategories)
    {
        tagsdata.find({'resources':true}).then(function(getTags)
        {
            var allres=getResCategories.concat(getTags);
            var finaltopics=allres.sort(function(a, b)
            {
                var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            res.json(finaltopics);
        });
    });
});

//****************************************************************************************************************
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
//****************************************************************************************************************
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
    ////console.log('Images found', images.length);
    res.json(images);
  }
  else {
    ////console.log('ERROR', err);
  }
})
      });
router.post('/upload', upload.single('file'), async (req, res) => {
    var  currentUnixTime= Date.now();
   // //console.log(req);
    // res.json({file: req.file});
    try {
        var f = currentUnixTime+'_' + req.file.originalname;
        var dest = path.resolve('./publicfiles/', f);
        fs.rename(req.file.path, dest, (err)=>{
          if(err) throw err;
          else {
            //  //console.log('Successfully moved');
            //   res.json({file: `/publicfiles/${f}`});
            res.json({file: `/publicfiles/${f}`, "details": req.file});
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
                ////console.log('Success');
            })
        }).catch(function(err) {
            ////console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        ////console.log('catch login', e);
    }
});
/*
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});*/
router.route('/getcurrentuserforapp')
     .post(function(req, res) {
        // //console.log(res);
        users.findOne({"gpexid": req.body.gpexid},function(err, curentuser) {
             if (err)
                 res.send(err);

             res.json(curentuser);
         });
      });

router.route('/addslider')
    .post(function(req, res) {
        ////console.log(req.body.link);
    try {
        Promise.all([]).then(function(results) {
            slider_settings.create({
                'image_link': req.body.link,
                'linkurl': req.body.linkurl,
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
                ////console.log('Success');
            })
        }).catch(function(err) {
            ////console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        ////console.log('catch login', e);
    }
});

router.route('/addlibrary')
    .post(function(req, res) {
      //  //console.log(req.body.link);
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
               // //console.log('Success');
            })
        }).catch(function(err) {
            ////console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});

router.route('/addpost')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            posts.create({
                'content': req.body.postcontent,
                'searchcontent': req.body.postcontent,
                'tags': req.body.tags,
                'created_by': req.body.createdby,
                'posted_at': req.body.scheduledatetime,
                'preview_flag': req.body.preview_flag,
                'preview_data': req.body.preview_data
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});
//santosh
//******************adding post ***************************
router.route('/addcomment')
    .post(function(req, res) {
    try {
        //console.log("consolelog="+req);
        Promise.all([]).then(function(results) {
            comments.create({
                'content': req.body.comment,
                'postid': req.body.postid,
                'parentid':req.body.commentid,
                'replyid':req.body.replyid,
                'created_by': req.body.createdby,
                'asynccheck': req.body.asynccheck,
                'dummyname': req.body.dummyname,
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});


//*********end*************************

//*************************************************************************************************************************************************
router.route('/savepost')
    .post(function(req, res) {
    try {

        const post_saves= db.get('post_saves');

            const query = { 'postid': req.body.postid, 'created_by': req.body.created_by};
                        const update = {$set:{ 'postid': req.body.postid,'created_by': req.body.created_by,'status': req.body.status,'created_at':Date.now()}};
                        const options = {upsert: true};
                        post_saves.findOneAndUpdate(query,update,options).then(function(findupdate){
                            //console.log(findupdate);
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
//*************************************************************************************************************************************************
router.route('/updateEditedpost')
.post(function(req, res)
{
    posts.updateOne(
        {"unique_id": req.body.edt_postid},
        {
            $set: {
              "content": req.body.postcontent,
              "searchcontent": req.body.searchcontent,
              "tags": req.body.tags,
              "attached": req.body.attachement,
              "pdfpreviewimage": req.body.pdfpreviewimage,
              "posted_at": req.body.scheduledatetime,
              "updated_by": req.body.updatedby,
              "updated_at": Date.now()
            }
        },function(err, editpostdata)
          {
              if (err)
                res.send(err);
              res.json(editpostdata);
          });
});
//*************************************************************************************************************************************************
router.route('/updateNote')
.post(function(req, res) {
       notes.updateOne(
                      {"unique_id": req.body.note_id},
                      {
                        $set: {
                          "content": req.body.content,
                        }
                      },function(err, notedata)
                      {
                            if (err)
                                res.send(err);
                            res.json(notedata);
                      });

 });
//*************************************************************************************************************************************************
router.route('/createReport')
    .post(function(req, res) {
    try {
        //console.log("consolelog="+req);
        Promise.all([]).then(function(results) {
            reports.create({
                'content': req.body.content,
                'postid': req.body.postid,
                'created_by': req.body.created_by
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});
//*************************************************************************************************************************************************
router.route('/getonetag')
     .post(function(req, res) {
        tags.findOne({"unique_id": req.body.tag_id},function(err, onetag) {
             if (err)
                 res.send(err);

             res.json(onetag);
         });
      });

//*************************************************************************************************************************************************
 router.route('/addToresources')
    .post(function(req, res)
    {
        posts.updateOne(
                        {"unique_id": req.body.postid},
                          {
                            $set: {
                              "resourceid": req.body.status,
                            }
                          },function(err, addresources)
                          {
                                if (err)
                                    res.send(err);
                                res.json(addresources);
                          });

     });
//*************************************************************************************************************************************************
router.route('/createRemindme')
.post(function(req, res)
{
    try {
        Promise.all([]).then(function(results) {
            studyplanremindme.create({
                'topic_id': req.body.topic_id,
                'title': req.body.title,
                'notes': req.body.notes,
                'remindme_sdate': req.body.remindme_sdate,
                'remindme_edate': req.body.remindme_edate,
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});
//*************************************************************************************************************************************************
router.route('/updateRemindme')
.post(function(req, res)
{
    studyplanremindme.updateOne(
    {"_id": req.body.remindme_id},
    { $set: {
                'title': req.body.title,
                'notes': req.body.notes,
                'remindme_sdate': req.body.remindme_sdate,
                'remindme_edate': req.body.remindme_edate,
            }
    },function(err, remindmedata)
    {
        if (err)
            res.send(err);
        res.json(remindmedata);
    });

});
//*************************************************************************************************************************************************
router.route('/demosavepost')
.post(function(req, res)
{
  if(req.body.searchedtag==null)
  {
    const cat=db.get('reset_tags');
    cat.aggregate(
    [
      {"$sort": {"_id": -1}},
      { "$limit" : 10 },{ $unwind : "$tagdata" },
      { $project : { _id:0, tagname : '$tagdata.tagname', unique_id : '$tagdata.unique_id' } }
    ])
    .then(function(gettags)
    {
      var s_tag=[];
      if(gettags!=undefined && gettags.length > 0 )
      {
        gettags.forEach(function(tagval)
        {
          if(tagval.tagname!==null)
          s_tag.push(tagval);
        })
        res.json(s_tag);
      }
    });
  }
  else
  {
    categories.aggregate([
        {$match:{"available":true,'categoryname' : new RegExp(req.body.searchedtag, 'i')}},
        { "$project": {
                         "_id":1,
                         "tagname":"$categoryname",
                         "available":1,
                         "studyplan":1,
                         "resources":1,
                         "created_by":1,
                         "created_at":1,
                         "unique_id":1
                        }
            }
    ]).then(function(getResCategories)
    {
        tags.find({'available':true, 'tagname' : new RegExp(req.body.searchedtag, 'i')}).then(function(getTags)
        {
            var allres=getResCategories.concat(getTags);
            var finaltopics=allres.sort(function(a, b)
            {
                var nameA=a.tagname.toLowerCase(), nameB=b.tagname.toLowerCase()
                if (nameA < nameB) //sort string ascending
                    return -1
                if (nameA > nameB)
                    return 1
                return 0 //default return value (no sorting)
            })
            res.json(finaltopics);
        });
    });
  }
});
 //*************************************************************************************************************************************************

router.route('/addDefaultImage')
    .post(function(req, res)
    {
        try
        {
            //console.log(req.body.title);
            //console.log(req.body.link);
            //console.log(req.body.created_by);
            default_images.find({'title':req.body.title},function(err,imagedata){
                if(err){
                    res.send(err);
                }
                else if(imagedata.length==0)
                {
                    Promise.all([]).then(function(results) {
                        default_images.create({
                            'title': req.body.title,
                            'link': req.body.link,
                            'created_by': req.body.created_by,
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
                                    'code': 200,
                                    'data': result
                                });
                              }
                            //console.log('Success');
                        })
                    }).catch(function(err) {
                        //console.log('error', err)
                        res.status(err.httpCode).json(err);
                  });
                }
                else{
                 res.status(200).send({
                                    'code': 400,
                                    'data': 'title name already exist'
                                });
                }
            });
        }
        catch (e){
            res.status(500).json({
                'code': 500
            });
        }
    });

 //*************************************************************************************************************************************************
 router.route('/createStudyplanNote')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            notes.create({
                'topic_id': req.body.topic_id,
                'content': req.body.content,
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});
 //*************************************************************************************************************************************************
router.route('/createStudyplanDuedate')
    .post(function(req, res) {
    try {

        const sp_duedates= db.get('studyplan_duedates');

            const query = { 'topic_id': req.body.topic_id, 'created_by': req.body.createdby};
                        const update = {$set:{ 'topic_id': req.body.topic_id,'created_by': req.body.createdby,'due_date': req.body.due_date,'created_at':Date.now()}};
                        const options = {upsert: true};
                        sp_duedates.findOneAndUpdate(query,update,options).then(function(findspduedate){
                            //console.log(findspduedate);
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
//*************************************************************************************************************************************************
router.route('/savesubTopic_chkbox')
.post(function(req, res) {
    try {

        const subtopicStatus= db.get('studyplan_subtopicstatus');
        const query = { 'topic_id':req.body.topic_id ,'subtopic_id': req.body.subtopic_id, 'created_by': req.body.createdby};
        const update = {$set:{'topic_id':req.body.topic_id, 'subtopic_id': req.body.subtopic_id,'created_by': req.body.createdby,'chkbox_status': req.body.stChk_status,'created_at':Date.now()}};
        const options = {upsert: true};
        subtopicStatus.findOneAndUpdate(query,update,options).then(function(addsubtopicStatus){
                        //console.log(addsubtopicStatus);
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
//*************************************************************************************************************************************************
router.route('/saveTopic_star')
    .post(function(req, res) {
    try {

        const sp_duedates= db.get('studyplan_duedates');

            const query = { 'topic_id': req.body.topic_id, 'created_by': req.body.createdby};
                        const update = {$set:{ 'topic_id': req.body.topic_id,'created_by': req.body.createdby,'star_status': req.body.s_status,'created_at':Date.now()}};
                        const options = {upsert: true};
                        sp_duedates.findOneAndUpdate(query,update,options).then(function(findstarstatus){
                            //console.log(findstarstatus);
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
//*************************************************************************************************************************************************
router.route('/saveTopic_chkbox')
    .post(function(req, res) {
    try {

        const sp_duedates= db.get('studyplan_duedates');

            const query = { 'topic_id': req.body.topic_id, 'created_by': req.body.createdby};
                        const update = {$set:{ 'topic_id': req.body.topic_id,'created_by': req.body.createdby,'chkbox_status': req.body.ck_status,'created_at':Date.now()}};
                        const options = {upsert: true};
                        sp_duedates.findOneAndUpdate(query,update,options).then(function(findchkstatus){
                            //console.log(findchkstatus);
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
//*************************************************************************************************************************************************


router.route('/addpostbyweb')
    .post(function(req, res) {
    try {
        //console.log(req);
        Promise.all([]).then(function(results) {
            posts.create({
                'content': req.body.postcontent,
                'searchcontent': req.body.searchcontent,
                'tags': req.body.tags,
                'created_by': req.body.createdby,
                'attached': req.body.attachement,
                'posted_at': req.body.scheduledatetime,
                'pdfpreviewimage':req.body.pdfpreviewimage,
                   'questionid': req.body.questionid,
                   'questiontype': req.body.questiontype,
                   'articleid': req.body.articleid,
                   'pollid': req.body.pollid,
                   'deleted': req.body.deleted,
                   'parentid': req.body.parentid,
                   'preview_flag': req.body.preview_flag,
                   'preview_data': req.body.preview_data
            },
            function(createErr, result) {
                if (createErr) {
                    //console.log('hello',createErr);
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
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
                            //console.log(findupdate);

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


router.route('/savemodulecapacity')
    .post(function(req, res) {
   try{
       // const module= db.get('modules');
       //console.log(req.body.unique_id+'yooooooooooooooooooooooo');
  modules.find({"unique_id":req.body.unique_id}, function(err, mod) {
    if (!mod)
      res.status(404).send("data is not found");
    else {

        modules.findOneAndUpdate({'unique_id':req.body.unique_id},
                   {
                    $set: {'created_by':req.body.createdby,'unique_id':req.body.unique_id}
                   }
                ).then(function(updatemodule){
                    //console.log(updatemodule);


                    req.body.cap_label.forEach((element, i) => {

                    var roles=element.selected_roles_id.join(",");
                    capabilitylable.findOneAndUpdate({ 'unique_id':element.unique_id },
                            {
                            $set: {'rolevalue':roles}
                            }
                        ).then(function(updatee){
                            //console.log(updatee);
                        }).catch(function(error){
                            //console.log(error);

                        });
                    });

                    res.status(200).send({
                         'code': 200,
                         'data': []
                     });
                }).catch(function(error){
                    res.status(500).send(error)
                });
         }
    });
    }
    catch (e) {
    res.status(500).json({
        'code': 500
    });
    }
    });

router.route('/likedislikecomment')
    .post(function(req, res) {
        //console.log(req.body.commentid);
        //console.log(req.body.likeby);
        //console.log(req.body.status);
    try {
        const comment_likes= db.get('comment_likes');

            const query = { 'commentid': req.body.commentid, 'likeby': req.body.likeby};
                        const update = {$set:{ 'commentid': req.body.commentid,'likeby': req.body.likeby,'status': req.body.status,'created_at':Date.now()}};
                        const options = {upsert: true};
                        comment_likes.findOneAndUpdate(query,update,options).then(function(findupdate){
                            //console.log(findupdate);

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
          //console.log('error:', error); // This is returns true or false. True if there was a error. The error it self is inside the results object.
          //console.log('results:', results);
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
                'created_by': req.body.createdby,
                'available':req.body.avail,
                'studyplan':req.body.studypln,
                'resources':req.body.resources,
                'questionvisible':req.body.visible

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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});

router.route('/editCategoryById')
 .post(function(req, res) {
      var catgid = req.body.catgid;
      categories.find({"unique_id":catgid},function(err, catgiddata) {
        if (err)
            res.send(err);
        res.json(catgiddata);
    });
  });

router.route('/createstudyplantopic')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            studyplantopic.create({
                'categoryname': req.body.category,
                'created_by': req.body.createdby,

                   'studyplan':req.body.studypln
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});
router.route('/createstudyplansubtopic')
    .post(function(req, res) {
    //console.log('tag-',req.body.tag)
    //console.log('createdby-',req.body.createdby)
    //console.log('cat_id-',req.body.cat_id)
    //console.log('studypln-',req.body.studypln)
    try {
        Promise.all([]).then(function(results) {
            studyplansubtopic.create({
                'tagname': req.body.tag,
                'created_by': req.body.createdby,
               'category_id':req.body.cat_id,
                   'studyplan':req.body.studypln
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});
router.route('/createmodule')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            modules.create({
                'modulename': req.body.module,
                'created_by': req.body.createdby,
               'cap_add':req.body.addcap,
                   'cap_edit':req.body.editcap,
                       'cap_view':req.body.viewcap,
                           'cap_delete':req.body.deletecap
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});

router.route('/getuserbyid')
.post(function(req, res) {
    //console.log(req.body);

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

 router.route('/fetchDefaultimage')
 .post(function(req, res) {
      //console.log(req.body.title);
      default_images.findOne({"title": req.body.title},function(err, defaultImage) {
        if (err)
            res.send(err);
        res.json(defaultImage);
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

 router.route('/deleteRespostbyid')
 .post(function(req, res) {
      var postid = req.body.postid;
      posts.findOneAndUpdate({"unique_id":postid},{"resourceid":false},function(err, respostdata) {
        if (err)
            res.send(err);
        res.json(respostdata);
    });
  });

 router.route('/deleteSliderById')
 .post(function(req, res) {
      var sliderid = req.body.sliderid;
      //console.log(sliderid);
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
      //console.log(tagid);
      tags.deleteOne({"unique_id": tagid},function(err, tagdata) {
        if (err)
            res.send(err);
        res.json(tagdata);
      });
  });

 router.route('/deleteCategoryById')
 .post(function(req, res) {
      var catgid = req.body.catgid;
      //console.log(catgid);
      categories.deleteOne({"unique_id": catgid},function(err, catgdata) {
        if (err)
            res.send(err);
        res.json(catgdata);
      });
  });
 router.route('/deleteModuleById')
 .post(function(req, res) {
      var modid = req.body.modid;
      //console.log(modid);
      modules.deleteOne({"unique_id": modid},function(err, catgdata) {
        if (err)
            res.send(err);
        res.json(catgdata);
      });
  });
 router.route('/deletelibraryById')
 .post(function(req, res) {
      var imageid = req.body.imageid;
      //console.log(imageid);
      image_libraries.deleteOne({"unique_id": imageid},function(err, imagedata) {
        if (err)
            res.send(err);
        res.json(imagedata);
      });
  });
router.route('/deletedefaultimage')
 .post(function(req, res) {
      var imageid = req.body.imageid;
      //console.log(imageid);
      default_images.deleteOne({"unique_id": imageid},function(err, imagedata) {
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
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
                'created_by': req.body.createdby,
                'available':req.body.avail,
                'studyplan':req.body.studypln,
                'resources':req.body.resources,
                'questionvisible':req.body.visible
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
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
        users.findOne({"gpexid": req.body.email}, function(err, user_data){
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
                Logset.loginuser(name);
                var token = jwt.sign(payload, app.get('superSecret'), {
                            expiresIn : 60*60*1 // expires in 1 hour

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
     	//console.log('Hello world');
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

router.route('/createcapability')
    .post(function(req, res) {
    try {
        Promise.all([]).then(function(results) {
            capabilitylable.create({
                'moduleid': req.body.module,
                'lable_text': req.body.addlable,
                'savemodule': req.body.savemodule,
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
                //console.log('Success');
            })
        }).catch(function(err) {
            //console.log('error', err)
            res.status(err.httpCode).json(err);
        });
    } catch (e) {
        res.status(500).json({
            httpCode: CodesAndMessages.dbErrHttpCode,
            code: CodesAndMessages.dbErrCode,
            message: CodesAndMessages.dbErrMessage
        });
        //console.log('catch login', e);
    }
});

router.route('/getallcapabilitylable')
.post(function(req, res){
    //console.log(req.body);
   capabilitylable.find({"moduleid": req.body.moduleid},function(err, capabilitylable){
       if (err){
        res.json([]);
        } else {
           res.json(capabilitylable)

        }
 	});
});

router.route('/selectedrole')
.post(function(req, res){
    //console.log(req.body);
    roles.find({'roleid':req.body.rolevalue},
    function(err, roles){
             if (err){
           res.send({
               status:0,
               err:err
           });
        } else {
            res.status(200).json({
               status:1,
               data:roles
           });
           res.json(roles)

        }
       res.json(roles);
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
          //console.log('hello',req.query.file);
          res.sendFile(req.query.file ,{root:__dirname});
      });

// logout route
router.route('/logout')
.post(function(req, res){
    users.findOneAndUpdate({"username": req.body.username},
    {
     $set: {'lastLogOut':Date.now()}
    }, function(err, user_data){
        if(err || !user_data){
            return res.status(401).json({
                status : 401,
                message : "Invalid email",
            });
        } else {
            res.status(200).json({
                message : "You have succesfully logge out.",
                status: 200
            });
        }
    });
});


app.use('/api',router);
app.use('/public',filerouter);
app.get('/*', function(req, res){
  res.sendFile('/dist/index.html' ,{root:__dirname});
});
app.listen(port);
setTimeout(function(){
    //process.exit(0);
    fs.unlinkSync('/var/log/mongodb/mongod.log')
}, 60 * 60 * 48 * 1000);

