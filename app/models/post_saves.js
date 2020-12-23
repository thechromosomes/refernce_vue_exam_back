var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PostSavesSchema   = new Schema({
    postid:{
       type:String,
    },   
    created_by: {
    	type : String,
    },
    status: {
        type : Boolean,
    },
    created_at: {
        type : Number,
        default: Date.now() 
    }
});

module.exports = mongoose.model('post_saves', PostSavesSchema);
