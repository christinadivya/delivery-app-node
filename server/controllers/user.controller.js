import UserManager from '../managers/user.manager';

module.exports = {  
  get: get,
  changePassword: changePassword,
  verifyPhone: verifyPhone,
  verifyEmail: verifyEmail,
  validateNumber: validateNumber,
  validateEmail: validateEmail,
  editProfile: editProfile,
  getProfile: getProfile,
  changeMobile: changeMobile,
  verifyOtpMobileChange: verifyOtpMobileChange,
  generateOtp: generateOtp,
  selectRole: selectRole,
  receiverAccept: receiverAccept,
  verifyPickupCode: verifyPickupCode,
  verifyDeliverCode: verifyDeliverCode,
  cardDetails: cardDetails,
  logout: logout,
  resendOtp: resendOtp,
  payment: payment,
  remove: remove
};

function payment(req, res, next) {    
  UserManager.payment(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function remove(req, res, next) {    
  UserManager.remove(req,function(err, data) {
      handler(err, data, res, next)
  });
}


function resendOtp(req, res, next) {    
  UserManager.resendOtp(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function get(req, res, next) {    
  UserManager.get(req,res);
}

function changePassword(req, res, next) {    
  UserManager.changePassword(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function verifyPhone(req, res, next) {    
  UserManager.verifyPhone(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function verifyEmail(req, res, next) {    
  UserManager.verifyEmail(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function validateNumber(req, res, next) {    
  UserManager.validateNumber(req,function(err, data) {
      handler(err, data, res, next)
  });
}
function validateEmail(req, res, next) {    
  UserManager.validateEmail(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function editProfile(req, res, next) {    
  UserManager.editProfile(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function getProfile(req, res, next) {    
  UserManager.getProfile(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function changeMobile(req, res, next) {  
  UserManager.changeMobile(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function verifyOtpMobileChange(req, res, next) {  
  UserManager.verifyOtpMobileChange(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function generateOtp(req, res, next) {  
  UserManager.generateOtp(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function selectRole(req, res, next) {    
  UserManager.selectRole(req,function(err, data) {
      handler(err, data, res, next)
  });
}


function receiverAccept(req, res, next) {    
  UserManager.receiverAccept(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function verifyPickupCode(req, res, next) {    
  UserManager.verifyPickupCode(req,function(err, data) {
    handler(err, data, res, next)
});
}

function verifyDeliverCode(req, res, next) {    
  UserManager.verifyDeliverCode(req,function(err, data) {
    handler(err, data, res, next)
});
}

function cardDetails(req, res, next) {    
  UserManager.cardDetails(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function logout(req, res, next) {    
  UserManager.logout(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function handler(err, data, res, next){
  if (err) { 
  return next({message: err.message, status: err.code})
  }
  res.status(data.code).json({data: data.data});
}

