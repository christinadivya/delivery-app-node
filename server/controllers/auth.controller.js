import AuthManager from '../managers/auth.manager';

module.exports = {
  create: create,
  login: login,
  checkPhoneNumber: checkPhoneNumber,
  checkEmail: checkEmail,
  verifyOtp: verifyOtp,
  forgotPassword: forgotPassword,
  socialLogin: socialLogin,  
  resetPassword: resetPassword,
  guestLogin: guestLogin,
  verifyPassOtp: verifyPassOtp,
  resendOtp: resendOtp,
  adminforgotPassword: adminforgotPassword,
  adminresetPassword: adminresetPassword,
  adminresendOtp: adminresendOtp,
  Login: Login,
  chat_notification: chat_notification
  // verifyToken: verifyToken,
  // logout: logout 

};

function create(req, res, next) {    
  AuthManager.create(req,function(err, data) {
    console.log(data)
      handler(err, data, res, next)
  });
}

function chat_notification(req, res, next) {    
    AuthManager.chat_notification(req,function(err, data) {
      console.log(data)
        handler(err, data, res, next)
    });
  }

function login(req, res, next) {    
  AuthManager.login(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function Login(req, res, next) {    
    AuthManager.Login(req,function(err, data) {
        handler(err, data, res, next)
    });
  }

function checkPhoneNumber(req, res, next) {    
  AuthManager.checkPhoneNumber(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function checkEmail(req, res, next) {    
  AuthManager.checkEmail(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function verifyOtp(req, res, next) {    
  AuthManager.verifyOtp(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function verifyPassOtp(req, res, next) {    
  AuthManager.verifyPassOtp(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function socialLogin(req, res, next) {    
  AuthManager.socialLogin(req,function(err, data) {
      handler(err, data, res, next)
  });
}

function guestLogin(req, res, next) {    
  AuthManager.guestLogin(req,function(err, data) {
      handler(err, data, res, next)
  });
}

// function logout(req, res, next) {    
//     AuthManager.logout(req,function(err, data) {
//         handler(err, data, res, next)
//     });
// }

function forgotPassword(req, res, next) {
    AuthManager.forgotPassword(req,function(err, data) {
        handler(err, data, res, next)
    });
}


function adminforgotPassword(req, res, next) {
    AuthManager.adminforgotPassword(req,function(err, data) {
        handler(err, data, res, next)
    });
}

// function verifyToken(req, res, next) {    
//     AuthManager.verifyToken(req,function(err, data) {
//         handler(err, data, res, next)
//     });
// }

function resetPassword(req, res, next) {    
    AuthManager.resetPassword(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function adminresetPassword(req, res, next) {    
    AuthManager.adminresetPassword(req, function(err, data) {
        handler(err, data, res, next)
    });
}

function resendOtp(req, res, next) {
    AuthManager.resendOtp(req,function(err, data) {
        handler(err, data, res, next)
    });
}

function adminresendOtp(req, res, next) {
    AuthManager.adminresendOtp(req,function(err, data) {
        handler(err, data, res, next)
    });
}

function handler(err, data, res, next) {
  console.log(err)
  if (err) { 
  return next({message: err.message, status: err.code})
  }
  return res.status(data.code).json({data: data.data});
}
