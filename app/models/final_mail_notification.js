var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var final_mail_notification   = new Schema({
    unique_id : {
        type    : String,
        default : mongoose.Types.ObjectId,
        index   : { unique: true }
      },
    content : {
        type : String,
        default:""
    },
    subject: {
        type : String,
        default:""
    },
    notificationType: {
        type : String,
        default:""
    },
    createdBy: {
        type : String,
        default:""
    },
    createdDate: {
        type : Number,
        default: Date.now() 
    },
  
});

module.exports = mongoose.model('final_mail_notification', final_mail_notification);
