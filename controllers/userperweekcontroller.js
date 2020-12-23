// //user per week
// exports.userperweek = async (req, res) => {
//     const db = require('monk')('localhost/gpexcommunity');
  
//       const oneDay = 1000 * 60 * 60 * 24;
//       const  oneWeek = oneDay * 7;
//       const oneMonth = oneDay *30
//       const d = Date.now();
//       const lastDay  = d - ( d % oneDay ) + oneDay;
//       const firstDay = lastDay - oneMonth;
//       //console.log(lastDay);
//       //console.log(firstDay);
  
//        pipeline = [
//       {
//           $match: {
//               timeStamp: {$gt: Date(firstDay)},
//           }
//       },
//       {
//           $group: {
//               _id: {$week: '$timeStamp'},
//               documentCount: {$sum: 1}
//           }
//       }
//   ];
  
  
//       let community_logs= await db.get('community_logs');
//       // let data = await community_logs.find({"module" : "login",'created_at': {'$gte':firstDay,'$lte':lastDay}});
  
//      let data = await community_logs.aggregate(pipeline);
//      //console.log(data)
//       try{
//           res.json({
//             community_logs: community_logs, 
//             data: data, 
//               message: `data fetched .. done`
//           })
//       } catch(err){
//           //console.log(err)
//       }
//    }