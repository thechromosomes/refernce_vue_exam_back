var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var TriggerTypes   = new Schema({
    subject : {
        type : String,
        default:""
    },
    last_notification_day: {
        type : Number,
        default:""
    },
    content: {
        type : String,
        default:""
    },
    notification_type: {
        type : String,
        default:""
    },
    created_by: {
        type : String,
        default:""
    },
    created_at: {
        type : Number,
        default: Date.now() 
    },
    deleted: {
        type : Boolean,
        default:0
    }
});

module.exports = mongoose.model('TriggerTypes', TriggerTypes);
