var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PollsOptionsSchema   = new Schema({
  poll_id:  
  {
        type: String
  },
  option_text:  
  {
        type: String
  },
  option_order: 
  {
        type: Number,  
  },
  created_at: 
  {
      type : Number,
      default: Date.now() 
  },
  deleted: 
  {
    type : Boolean,
    default:0
  }

});


module.exports = mongoose.model('polls_options', PollsOptionsSchema);
