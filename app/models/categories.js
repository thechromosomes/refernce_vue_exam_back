var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CategoriesSchema   = new Schema({
    categoryname: {
      type : String,
      index   : { unique: true },
	 	required: 'Please provide the category name'
    },
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
      
    created_by:  {
        type: String
  },
  created_at:  {
    type : Number,
        default: Date.now() 
},
 available: {
        type : Boolean,
        default:0
    },
    studyplan: {
        type : Boolean,
        default:0
    },
    resources: {
        type : Boolean,
        default:0
    },
    questionvisible: {
        type : Boolean,
        default:0
    }

});


module.exports = mongoose.model('categories', CategoriesSchema);
