var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CommentlikesSchema   = new Schema({
    commentid: {
    	type : String,
    },
    likeby: {
    	type : String,
    },
    status: {
    	type : Boolean,
    },

      created_at: {
        type : Number,
        default: Date.now() 
    },
});



module.exports = mongoose.model('comment_likes', CommentlikesSchema);
