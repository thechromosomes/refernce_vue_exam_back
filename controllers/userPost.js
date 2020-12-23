// const db = require('monk')('root:hSm2kdMfPnu9@127.0.0.1:27017/gpexcommunity?authSource=admin');

module.exports.userPost = async (req, res) => {
    let UserId = db.get('post_saves');

    let userData = await UserId.aggregate([
      {$lookup:
        {
            from: "posts",
            localField: "postid",
            foreignField: "unique_id",
            as: "postdetail"
        }},
        { "$unwind": "$postdetail" },
        {$lookup:
          {
            from: "users",
            localField: "created_by",
            foreignField: "unique_id",
            as: "saverdetail"
          }},
          {$lookup:
            {
              from: "users",
              localField: "postdetail.created_by",
              foreignField: "unique_id",
              as: "posterdetail"
            }},
          { "$unwind": "$saverdetail" }
        ])
         
    res.send(userData)
}