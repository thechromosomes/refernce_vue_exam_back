var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PostlikesSchema   = new Schema({
    postid: {
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



module.exports = mongoose.model('post_likes', PostlikesSchema);
