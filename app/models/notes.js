var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var NotesSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
    },
    topic_id:{
       type:String,
        default:""
    },
    content: {
    	type : String,
    },
    created_by: {
    	type : String,
    },
    created_at: {
        type : Number,
        default: Date.now() 
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

module.exports = mongoose.model('notes', NotesSchema);
