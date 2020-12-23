var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PollsSchema   = new Schema({
  question_text: 
  {
      type: String,
      trim: true,
      unique: true,
	 	required: 'Please provide the question'
  },
  publishDate:
  {
      type: String,
      default: ''
  },
  endDays:
  {
      type: String,
      default: ''
  },
  tags: 
  {
      type : String,
      default:""
  },
  instruction_text: 
  {
      type : String,
      default:""
  },
  poll_image: 
  {
      type : String,
      default:""
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
  deleted: 
  {
    type : Boolean,
    default:0
  },
});

module.exports = mongoose.model('polls', PollsSchema);
