var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var capabilitylableSchema   = new Schema({
    moduleid: {
      type : String
    },

 unique_id : {
    type    : String,
    default : mongoose.Types.ObjectId,
    index   : { unique: true }
  },

 created_at: {
    type : Number,
    default: Date.now() 
    },

 created_by:  {
   type: String
  },

  lable_text:  {
   type: String,
   default: "" 
  },
   roles:  {
   type: String,
   default: "" 
  },
   indval:  {
   type: String,
   default: "" 
  },
  rolevalue:  {
   type: String,
   default: "" 
  }
  
});



module.exports = mongoose.model('capabilitylable', capabilitylableSchema);
