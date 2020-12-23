var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var PolicycontentTypesSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
    },
    pversion: {
        type : String,
    },
    type: {
    	type : Number,
    },
    type_name: {
    	type : String,
    },
    policy_title: {
        type : String,
    },
    content_title: {
        type : String,
    },
    content: {
        type : String,
    },
    active: {
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
    updated_at: {
        type : Number,
    }
});

module.exports = mongoose.model('policycontent_types', PolicycontentTypesSchema);
