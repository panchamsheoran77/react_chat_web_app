 
 const Notification = (userName,userMsg,channelId,userId,seenBy,noti_type,channelName=null,chat_id)=>
 {
    var message;
    var group_id = channelId;
    
    if(noti_type=="channel")
    {
      channelId = channelId.split("/")[0];
      channelId = `/topics/${channelId}`;
       message = { 
        to: channelId, 
        data:{
          title: channelName,
          body: userName+"  "+userMsg, 
          user_id:userId,
          seenBy:seenBy,
          noti_type:noti_type,
          channel_id:group_id,
          chat_id:chat_id
        } 
         
      }; 
      console.log("sent to : "+chat_id);
    }
    else
    {
      message = { 
        registration_ids: channelId, 
        data:{
          title: userName,
          body: userMsg, 
          user_id:userId, 
          noti_type:noti_type,
          channel_id:group_id,
          chat_id:chat_id
        } 
         
      };
      console.log("sent to : "+chat_id); 
    }
   
      
  sendNotification(message);
    
 }

 var sendNotification = function(data) {
    var headers = {
      "Content-Type": "application/json",
      "Authorization": "key=AAAAxxKV7qQ:APA91bExodH860zY0bpfK6uTuUNhTD_BNQ7gXO_xGWULCFbdUOt4lyQvscukRxPWHYwrBD4y7AhDWZmh8QB_KFROnOIuoGjK97oD3CZv8Ma3fJmv6pBFUbKRQpBW1aW1tuytGkod50hW"
    };
    var options = {
      host: "fcm.googleapis.com", 
      path: "/fcm/send",
      method: "POST",
      headers: headers
    };
    
    var https = require('https');
    var req = https.request(options, function(res) {  
      res.on('data', function(data) {
        console.log("Response:");
        console.log(JSON.parse(data));
      });
    });
    
    req.on('error', function(e) {
      console.log("ERROR:");
      console.log(e);
    });
    
    req.write(JSON.stringify(data));
    req.end();
  };
  
  
export default Notification;