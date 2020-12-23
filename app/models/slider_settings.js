var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var SliderSchema   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    image_link: {
        type : String,
        default:""
    },
    created_by: {
        type : String,
        default:""
    },
    linkurl:{
        type : String,
        default:null   
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

module.exports = mongoose.model('slider_settings', SliderSchema);
