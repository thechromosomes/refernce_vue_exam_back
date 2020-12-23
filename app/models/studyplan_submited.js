var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StudyplanSubmitSchema   = new Schema({
     activestar: {
    type : Boolean,
    default:0
},
category_id : {
    type    : String
  },
   created_by:  {
        type: String
    },
    unique_id : {
    type    : String,
    default : mongoose.Types.ObjectId,
    index   : { unique: true }
  }
});

module.exports = mongoose.model('studyplan_submited', StudyplanSubmitSchema);