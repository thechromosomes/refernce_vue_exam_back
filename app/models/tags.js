var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TagSchema   = new Schema({
    tagname: {
        type: String,
        trim: true,
        index   : { unique: true },
	 	required: 'Please provide the group'
    },
    created_by:  {
        type: String
    },
    created_at: {
      type : Number,
      default: Date.now() 
  },
  unique_id : {
    type    : String,
    default : mongoose.Types.ObjectId,
    index   : { unique: true }
  },
  category_id : {
    type    : String
  },
  active: {
    type : Boolean,
    default:1
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


module.exports = mongoose.model('tags', TagSchema);
