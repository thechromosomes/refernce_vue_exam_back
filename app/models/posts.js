var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PostSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    content: {
    	type : String,
    },
    searchcontent: {
        type : String,
        default:""
    },
    tags: {
        type : String,
        default:""
    },
    attached: {
        type : String,
        default:""
    },
    created_by: {
    	type : String,
    },
    questionid: {
        type : String,
        default: null 
    },
    childquestionid: {
        type : String,
        default: null 
    },
    questiontype: {
        type : String,
        default: null 
    },
    articleid: {
        type : String,
        default: null 
    },
    pollid: {
        type : String,
        default: null 
    },
    eventid: {
        type : String,
        default: null 
    },
    created_at: {
        type : Number,
        default: Date.now() 
    },
    posted_at: {
    	type : Number,
    },
    active: {
        type : Boolean,
        default:1
    },
    deleted: {
        type : Boolean,
        default:0
    },
    publish_status: {
        type : Number,
        default:1
    },
    reported: {
        type : Boolean,
        default:0
    },
    pdfpreviewimage:{
        type : String,
        default:null  
    },
    updated_by: {
        type : String,
        default: "" 
    },
    updated_at: {
        type : Number,
    },
    parentid:{
        type : String,
        default:null  
    },
    resourceid:{
        type : Boolean,
        default:0  
    },
    preview_data:{
        type : String,
        default:null  
    },
    preview_flag:{
        type : Boolean,
        default:0  
    }
    
});

module.exports = mongoose.model('posts', PostSchema);
