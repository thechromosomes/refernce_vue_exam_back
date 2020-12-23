var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var validateEmail = function(email) {
    var re = /^[ A-Za-z0-9_@./#&+-]*$/;
    return re.test(email);
};


var LoginSchema   = new Schema({
    name: {
    	type : String,
	 	required: 'Please provide the username'
    },
    password:  {
   	 	type: String,
   	 	required: 'Please provide the password'
  	},
  	// confirm_password : {
  	// 	type : String,
  	// 	required : "Please provide the confirm password." ,
  	// 	validate: [passwordConfirm, 'Password and confirm password ......']	
  	// },
  	email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: 'Email address is required',
        validate: [validateEmail, 'Please fill a valid email address'],
        match: [/^[ A-Za-z0-9_@./#&+-]*$/, 'Please fill a valid email address']
    }
});

// function that validate the password and confirm password
// function passwordConfirm(value) {
//   // `this` is the mongoose document
//   return this.password == value;
// }

module.exports = mongoose.model('users', LoginSchema);
