var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ModulesSchema   = new Schema({
    modulename: {
      type : String,
      index   : { unique: true },
	 	required: 'Please provide the module name'
    },
 unique_id : {
    type    : String,
    default : mongoose.Types.ObjectId,
    index   : { unique: true }
  },
  cap_add:{
       type : String
   
  },
  cap_view:{
       type : String
    	
  },
  cap_delete:{
       type : String
    	
  },
  cap_edit:{
       type : String
    	
  },
      created_at: {
        type : Number,
        default: Date.now() 
    },
    created_by:  {
        type: String
  }
});



module.exports = mongoose.model('modules', ModulesSchema);
