var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var QtypeSchema   = new Schema({
    qtypename: {
        type: String,
        trim: true,
        unique: true,
	 	required: 'Please provide the group'
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
  active: {
    type : Boolean,
    default:1
},
});


module.exports = mongoose.model('question_types', QtypeSchema);
