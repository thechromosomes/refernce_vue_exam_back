const pdf = require('pdf-thumbnail');
const fs = require("fs")
exports.convertPdftoPreview = function(req,res){ 
  //console.log("body- ", req.body);
    var filedata=req.body.pdfname.split(".");
    const pdfBuffer = fs.readFileSync("./publicfiles/"+filedata[0]+"."+filedata[1]);

  pdf(pdfBuffer, {
    resize: {
      width: 700,   //default
      height: 534,  //default
    }
  })
  .then(data => {
    data.pipe(fs.createWriteStream("./pdfthumbnails/"+filedata[0]+".jpg"))  
 res.json({"imgurl":"/pdfthumbnails/"+filedata[0]+".jpg"});
  })
  .catch(err => 
    console.log(err)
  )


//  var PDFImage = require("pdf-image").PDFImage;
//   var pdfImage = new PDFImage("publicfiles/"+req.body.pdfname);
//   pdfImage.convertPage(0).then(function (imagePath) {
//       //console.log("success file err- ", imagePath);
//       // res.sendFile(imagePath);
//       res.send(imagePath);
//     }, function (err) {
//       //console.log("file err- ", err);
//       res.send(err, 200);
//     });
}
exports.getFilesizeInBytes=function(req,res) {
    var filename=req.body.filename;
    const stats = fs.statSync("."+filename);
    const fileSizeInBytes = stats.size;
    if(fileSizeInBytes<=123){
    fs.unlinkSync("."+filename);
    res.json({"imgurl":"/pdfthumbnails/file-type-pdf.png"})
    }else{
   res.json({"imgurl":filename})
    }
    
}
