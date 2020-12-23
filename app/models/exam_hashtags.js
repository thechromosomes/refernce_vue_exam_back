var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ExamHashtagsSchema   = new Schema({
    hashtagname: {
      type : String,
      index   : { unique: true },
    },
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
    },
    usecount : {
        type    : String,
        default : 1
    },
    created_by:  {
        type: String
    },
    created_at:  {
        type : Number,
        default: Date.now() 
    },
});
module.exports = mongoose.model('exam_hashtags', ExamHashtagsSchema);
