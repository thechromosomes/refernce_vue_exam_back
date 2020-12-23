var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PollsSubmitionsSchema   = new Schema({
  postid:  
  {
        type: String
  },
  pollid:  
  {
        type: String
  },
  optionid: 
  {
        type:Number
  },
  created_by:  
  {
        type: String
  },
  created_at: 
  {
      type : Number,
      default: Date.now() 
  },
  unique_id : 
  {
      type    : String,
      default : mongoose.Types.ObjectId,
      index   : { unique: true }
  },
  active: 
  {
    type : Boolean,
    default:1
  },
});


module.exports = mongoose.model('polls_submitions', PollsSubmitionsSchema);
