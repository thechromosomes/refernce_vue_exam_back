var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var StudyPlanDuedateSchema   = new Schema({
    topic_id: {
        type : String,
    },
    due_date: {
        type : Number,
        default : ''
    },
    star_status: {
        type : Boolean,
        default : 0
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

module.exports = mongoose.model('studyplan_duedates', StudyPlanDuedateSchema);
