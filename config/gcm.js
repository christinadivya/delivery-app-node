const Tokens = require('../server/models/tokens.model');
const Notifications = require( '../server/models/notifications.model');
const async = require('async');
const gcm = require('node-gcm');
const sender = new gcm.Sender('AAAA3Es3SX8:APA91bFUfYNi2ZOoniy-vVICdnr2smSbNZrNB4OD6HJfDf81YZKGjnY3xXMJaa-SV-Lojkkxs2YfUQs3xH_2A9qLUlv_ZRQa3CX9cBpV8Y-cdS35WDiJ7sOahfsUZa0wLK2UfsA720xW');


module.exports.sendNotification = function(req, callback){
  // console.log("%%^^&&*(")
  // console.log(req)
  let notification_type= req.notification_type;
  let notification_message = req.message;
  let userIds = req.to_user_id;
  let status_id = req.status_id;
  let role = req.role_id;
  let registrationIds = [];
  console.log(userIds[0])
  // Create GCM message
  let message, Ids =[]; 
  // = new gcm.Message(
  //  { notification: {
  //   title: 'FETCH39',
  //   body: notification_message,
  //   data: {
  //     "id": 2,
  //     request_id: 46,
  //     notification_type: {
  //       id: req.notification_type,
  //     },
  //     "title": "client12",
  //     message: notification_message
  //   },
  //   sound: true
  //  }
  //  }
  // )   
    async.waterfall([
     
  function(done) 
  {
      for(var i = 0; i < userIds.length; i++) {
        console.log(userIds[i])
        Notifications.forge({ message: notification_message, to_user_id: userIds[i], user_id: req.user_id, shipment_details_id: req.shipment_details_id, carrier_details_id: req.carrier_details_id, request_id: req.request_id[i], notification_type: notification_type, sender_id: req.sender_id, carrier_id: req.carrier_id, receiver_id: req.receiver_id, role_id: role, otp: req.otp, comments: req.comments, status_id: status_id }).save()
            .then((notification) => {
                console.log(i)
                console.log('Notifications saved');
                Notifications.where({ id: notification.id}).fetch({ withRelated: ['notification_type', 'from'] }).then((notifications) => {
                  let jsonString = JSON.stringify(notifications);
                  let finalObject = JSON.parse(jsonString);
                   Tokens.where('user_id','IN', userIds).fetchAll().then ((tokens) => {
                    let jsonString = JSON.stringify(tokens);
                        let finalValue = JSON.parse(jsonString);
                        finalValue.forEach(function(value){
                          Ids.push(value.token);
                            // console.log(Ids)
                        })
                     message = new gcm.Message(
                     { 
                     notification: {},
                     data: {
                       id: notification.id,
                       request_id: req.request_id[0],
                       status_id: status_id,
                       role_id: role,
                       notification_type_id: req.notification_type,     
                       title: finalObject.from.username,
                       message: notification_message
                     },
                     sound: true
                    }
                   )   
                   console.log(message);
                   sender.send(message, { registrationTokens: Ids }, function (err, response) {
                    if (err) console.error(err);
                    else console.log(response);
                });
                
                })
              }) 
          }).catch(e => console.log(e))
        }
        done()
      },
      // function(done){
      //   let Ids = []
      //   Tokens.where('user_id', 'IN', userIds ).fetchAll().then ((tokens) => {
      //     console.log("Registeration ID's");
      //     let jsonString = JSON.stringify(tokens);
      //     let finalValue = JSON.parse(jsonString);
      //     finalValue.forEach(function(value){
      //       Ids.push(value.token);
      //       if(Ids.length == userIds.length) {
      //             console.log(Ids)
      //             done(null,Ids)
      //       }
      //    })
         
      //   })
        
      // },
       
    ],function(err,done) {
      if(err) {
        console.log(err)
      }
      else {
        console.log(done)
        // sender.send(message, { registrationTokens: done }, function (err, response) {
        //   if (err) console.error(err);
        //   else console.log(response);
      // });
      }
    })
  }

  module.exports.generalNotification = function(req, callback){
    console.log("%%^^&&*(")
    console.log(req)
    let notification_type= req.notification_type;
    let notification_message = req.comments;
    let userIds = req.to_user_id;
    //Create GCM message
    let message;
    
        userIds.forEach(element => {
          Notifications.forge({ message: req.message, to_user_id: element, user_id: req.user_id, role_id: req.role_id, notification_type: notification_type, comments: req.comments, request_id: [0] }).save()
              .then((notification) => {
                  console.log('Notifications saved');
                  console.log(element);
                  Tokens.where( { user_id : element }).fetch().then((token) => {
                  if(token.attributes.token) {
                    message =  new gcm.Message(
                      { 
                      notification: {},
                      data: {
                        id: notification.id,
                        role_id: req.role_id,
                        request_id: 0,
                        status_id: 0,
                        notification_type_id: req.notification_type,     
                        title: req.message,
                        message: notification_message
                      },
                      sound: true
                     }
                    ) 
                    console.log(message);  
                    sender.send(message, { registrationTokens: [token.attributes.token] }, function (err, response) {
                       if (err) console.error(err);
                       else console.log(response);
        });
                  }
                  else {
                    console.log("Logout user");
                  }
           
                  })
            }).catch(e => console.log(e))
          })
      
    }

    module.exports.chatNotification = function(req, callback){
      console.log("%%^^&&*(")
      console.log(req.body)
      let notification_type= req.body.notification_type;
      let notification_message = req.body.message;
      let userIds = req.body.receiver_id;
      let registrationIds = [];
      console.log(userIds)
      //Create GCM message
      let message;
      message = new gcm.Message(
        { 
        notification: {},
        body: notification_message,
        data: {         
          notification_type_id: notification_type,     
          title: req.body.sender_name,
          room_id: req.body.room_id,
          receiver_id: req.body.receiver_id,
          sender_id: req.body.sender,
          request_id: req.body.request_id,
          message: notification_message
        },
        sound: true
       }
      )     
        async.waterfall([
          function(done){
            Tokens.where({ user_id: userIds }).fetch().then ((tokens) => {
              console.log("Registeration ID's");
                      done(null,tokens.attributes.token)
             })
            
          },
           
        ],function(err,done) {
          if(err) {
            console.log(err)
          }
          else {
            console.log(done)
            sender.send(message, { registrationTokens: [done] }, function (err, response) {
              if (err) callback(false,null);
              else {
                console.log(response);
                callback(null,true);
              }
          });
          }
        })
      }
