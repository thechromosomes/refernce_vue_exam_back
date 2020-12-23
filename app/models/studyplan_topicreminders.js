var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StudyplanTopicRemindersSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
    },
    topic_id: {
        type : String
    },
    title: {
        type : String
    },
    notes: {
        type : String
    },
    remindme_sdate : {
        type    : Number,
        default : ''
    },
    remindme_edate : {
        type    : Number,
        default : ''
    },
    created_by:  {
        type: String
    },
    created_at: {
        type : Number,
        default: Date.now() 
    },
});

module.exports = mongoose.model('studyplan_topicreminders', StudyplanTopicRemindersSchema);