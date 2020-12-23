var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SurveySchema   = new Schema({
    surveyname: {
    	type : String,
	 	required: 'Please provide the Survey name'
    },
  	category: {
        type: String
    },
    createdby:  {
        type: String
  },
  createddate:  {
    type: String
}
});


module.exports = mongoose.model('surveys', SurveySchema);
