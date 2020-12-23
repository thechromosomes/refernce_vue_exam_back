var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ResetTagsSchema   = new Schema({
    tag_id: {
          type    : Array
       
    },
    tagname: {
        type: String,
        trim: true
        
    },
    created_at: {
        type : Number,
        default: Date.now() 
    },
    created_by:  {
        type: String
  }
});


module.exports = mongoose.model('reset_tags', ResetTagsSchema);
