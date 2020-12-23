var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;
var validateEmail = function(email) {
    var re = /^[ A-Za-z0-9_@./#&+-]*$/;
    return re.test(email);
};

ObjectId = Schema.ObjectId;
var LoginSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
    },
    firstname: {
    	type : String,
	 	  required: 'Please provide the first name'
    },
    lastname: {
    	type : String,
	 	  required: 'Please provide the last name'
    },
    username: {
    	type : String,
	 	  required: 'Please provide the username'
    },
    profile: {
    	type : String
    },
    role: {
    	type : String 
    },
    password:  {
   	 	type: String,
   	 	required: 'Please provide the password'
    },
    gpexid:  {
   	 	type: String
    },
    deleted: {
        type : Boolean,
        default:0
    },
    lastlogin: {
        type : Number,
        default:0
    },
    token:  {
      type: String
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
    },
    lastLogOut: {
        type : Number,
        default:0
    },
});

// function that validate the password and confirm password
// function passwordConfirm(value) {
//   // `this` is the mongoose document
//   return this.password == value;
// }

module.exports = mongoose.model('users', LoginSchema);
LoginSchema.methods.getFullname = function() {
    return this.firstname[0] + this.lastname[0]
  }
