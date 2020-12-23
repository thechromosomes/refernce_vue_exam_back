var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var RoleSchema   = new Schema({
    roletitle: {
        type: String,
        trim: true,
        unique: true,
	 	required: 'Please provide the role'
    },
    roleid:  {
        type: String,
        trim: true,
        unique: true
  	},
  	desc: {
        type: String,
        trim: true
    }
});


module.exports = mongoose.model('roles', RoleSchema);
