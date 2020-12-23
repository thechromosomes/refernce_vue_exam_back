var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ContactSupportSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    content: {
    	type : String,
        default:""
    },
    policyid:{
       type:String,
        default:""
    },   
    userid:{
       type:String,
        default:""
    },
    created_at: {
        type : Number,
        default: Date.now() 
    },
    
});

module.exports = mongoose.model('contact_support', ContactSupportSchema);
