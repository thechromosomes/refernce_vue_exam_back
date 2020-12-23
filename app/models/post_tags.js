var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var Post_tagsSchema   = new Schema({
    postid: {
        type: String,
        trim: true,
        unique: true,
	 	required: 'Please provide post id'
    },
    created_by:  {
        type: String
    },
    created_at: {
      type : Number,
      default: Date.now() 
  },
  unique_id : {
    type    : String,
    default : mongoose.Types.ObjectId,
    index   : { unique: true }
  },
  tagids: {
    type : Array
},
});


module.exports = mongoose.model('tags', Post_tagsSchema);
