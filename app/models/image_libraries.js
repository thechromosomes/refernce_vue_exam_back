var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var ImageSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    tag: {
        type : String,
        default:""
    },
    domain: {
        type : String,
        default:""
    },
    image_link: {
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
    active: {
        type : Boolean,
        default:1
    },
    deleted: {
        type : Boolean,
        default:0
    },
    reported: {
        type : Boolean,
        default:0
    }
});

module.exports = mongoose.model('image_libraries', ImageSchema);
