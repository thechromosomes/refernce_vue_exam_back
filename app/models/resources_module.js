var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Resources_module = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    note: {
        type : String,
        default:null
    },
    content_path: {
        type : String,
        default:"",
    },
    media_type: {
        type : String,
        default:""
    },
    siteUrl: {
        type : String,
        default:""
    },
    created_by: {
        type : String,
        default:""
    },
    originalName: {
        type : String,
        default: null
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

module.exports = mongoose.model('Resources_module', Resources_module);
