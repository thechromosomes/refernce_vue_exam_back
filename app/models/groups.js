var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var GroupSchema   = new Schema({
    groupname: {
        type: String,
        trim: true,
        unique: true,
	 	required: 'Please provide the group'
    },
    groupmemmbers:  {
        type: String
      },
    createdby:  {
        type: String
  	},
  	createddate: {
        type: String
    }
});


module.exports = mongoose.model('groups', GroupSchema);
