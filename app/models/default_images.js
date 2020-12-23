var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var DefaultImageSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    title: {
        type : String,
        default:"",
    },
    link: {
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

module.exports = mongoose.model('default_images', DefaultImageSchema);
