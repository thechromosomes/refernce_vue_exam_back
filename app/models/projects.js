var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ProjectSchema   = new Schema({
    projectname: {
    	type : String,
	 	required: 'Please provide the project name'
    },
    allowgroups:  {
   	 	type: String
  	},
  	allowroles: {
        type: String
    },
    createdby:  {
        type: String
  },
  createddate:  {
    type: String
}
});


module.exports = mongoose.model('projects', ProjectSchema);
