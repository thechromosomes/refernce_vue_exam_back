var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StudyplanSubtopicStatusSchema   = new Schema({
    topic_id: {
        type : String,
    },
    subtopic_id: {
        type : String,
    },
    chkbox_status: {
        type : Boolean,
        default : 0
    },
    created_by: {
        type : String,
    },
    created_at: {
        type : Number,
        default: Date.now() 
    },
});

module.exports = mongoose.model('studyplan_subtopicstatus', StudyplanSubtopicStatusSchema);
