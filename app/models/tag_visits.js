var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagVisitsSchema   = new Schema({
  tagid: {
    type: String,
  },
  created_by:  {
        type: String
  },
  tagType: {
    type : Boolean,
    default:0
  },
  categoryType: {
    type : Boolean,
    default:0
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
 
});

module.exports = mongoose.model('tag_visits', TagVisitsSchema);
