var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    content: {
    	type : String,
    },
    postid:{
       type:String,
        default:""
    },   
    parentid:{
       type:String,
        default:""
    },
    replyid:{
       type:String,
        default:null
    }, 
    questionid:{
        type:String,
         default:null
     }, 
     dummyname:{
        type:String,
         default:null
     },
     dummyprofile:{
        type:String,
         default:null
     }, 
    asynccheck:{
        type : Boolean,
        default:0
     },    
    attached: {
        type : String,
        default:""
    },
    created_by: {
    	type : String,
    },
    created_at: {
        type : Number,
        default: Date.now() 
    },
    updated_at: {
        type : Number,
        default: null 
    },
    updated_by: {
        type : String,
    },
    posted_at: {
    	type : Number,
                default:""
    },
    active: {
        type : Boolean,
        default:1
    },
    deleted: {
        type : Boolean,
        default:0
    },
    reported: {
        type : Boolean,
        default:0
    }
});

module.exports = mongoose.model('comments', CommentSchema);
