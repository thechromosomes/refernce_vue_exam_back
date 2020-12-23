var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StudyPlanSubTopicsSchema   = new Schema({
    tagname: {
        type: String,
        trim: true,
        index   : { unique: true },
	 	required: 'Please provide the tags'
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
  category_id : {
    type    : String
  },
  active: {
    type : Boolean,
    default:1
},
available: {
        type : Boolean,
        default:0
    },
    studyplan: {
        type : Boolean,
        default:0
    }
});


module.exports = mongoose.model('studyplan_subtopics', StudyPlanSubTopicsSchema);
