exports.saveQuestionSummary = function(req,res){
    var data=req.body.data;
    const questionsummary= db.get('questionsummary');
    const options = {upsert: true,returnNewDocument: true};
    //questionsummary.insert({'summary_content':data.summary_content,'questionid':data.questionid,'questiontype':data.questiontype,'summary_text':data.summary_text,'uploaded_file':data.uploaded_file,'updatedby':req.body.createdby,'updated_at':Date.now()})
    questionsummary.findOneAndUpdate({'questionid':data.questionid},{$set:{'summary_content':data.summary_content,'questionid':data.questionid,'questiontype':data.questiontype,'summary_text':data.summary_text,'uploaded_file':data.uploaded_file,'updatedby':req.body.createdby,'updated_at':Date.now()}},options)
    .then(function(insertquestion)
    {
        //////console.log('summary stored');
      res.json(insertquestion);                 
    }).catch(function(error){
        //////console.log(error);
        res.json(error);  
      });
}
exports.getQuestionSummary = function(req,res){
    const questionsummary= db.get('questionsummary');
    questionsummary.findOne({'questionid':req.body.questionid}).then(function(getsummary)
    {
  //////console.log('summary stored');
      res.json(getsummary);                 
    }).catch(function(error){
        //////console.log(error);
        res.json([]);  
      });

}
