var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PosttypeSchema   = new Schema({
    posttype: {
    	type : String,
    },
    icon: {
    	type : String,
    },
    order: {
    	type : String,
    }
});



module.exports = mongoose.model('post_types', PosttypeSchema);
