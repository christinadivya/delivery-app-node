import config from '../../../config/config';
import responseCode from '../../../config/responseCode';
import responseMsg from '../../../config/message';
import Tokens from '../../server/models/tokens.model'

function create(req, callback) {  
  console.log(req.user.id )
  Tokens.where({user_id: req.user.id }).fetch().then((user_exists) => {
    if(user_exists) {
      user_exists.destroy().then((updatedUser) => {
        console.log("User updated");
      })
    }
    Tokens.where({ token: req.body.token }).fetch()
    .then ((token_exists) =>{
      if(token_exists) {
        token_exists.destroy().then((updated) => {
          
          Tokens
          .forge({token: req.body.token, user_id: req.user.id})
          .save()
          .then((fcm_token) =>{
            callback(null,{data:{ message: responseMsg.messages.tokenUpdated }, code: responseCode.ok })
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	
        })
      }
        else{
          Tokens
          .forge({token: req.body.token, user_id: req.user.id})
          .save()
          .then((fcm_token) =>{
            callback(null, { code: responseCode.ok, data:{ message: responseMsg.messages.tokenCreated, data: fcm_token }});
          }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	    
        }
    }).catch(e => callback({ message: e, code: responseCode.badRequest }, null));	
  })
    
        
}

export default { create }