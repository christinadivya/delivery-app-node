import Joi from 'joi';

export default {

  // POST /api/users
  createUser: {
    body: {
      name: Joi.string().required().label('Name'),
      username: Joi.string().required().label('UserName'),
      email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
      .label('Email'),
      mobile: Joi.string().required().label('Mobile Number'),
      // country_code: Joi.string().required().label('Choose country Code'),
      address:Joi.string().required().label('Address'),
      email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
      .label('Email'),
      // password: Joi.string().required().regex( /^[a-zA-Z0-9!-\/:-@\[-{-~]{6,30}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      // .label('Password'),
    },
    options: { abortEarly: true },
  },
  
  // POST /api/auth/login
  login: {
    body: {
      username: Joi.string().required().label('Username'),
      password: Joi.string().required().label('Password')
    }
  },

  // POST /api/auth/Login
  adminLogin: {
    body: {
      email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
      .label('Email'),
      password: Joi.string().required().label('Password')
    }
  },

  //POST /api/user/changepassword
  changePassword: {
    body: {
      old_password: Joi.string().required().regex( /^[a-zA-Z0-9!-\/:-@\[-{-~]{6,30}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('Old Password'),
      new_password: Joi.string().required().regex( /^[a-zA-Z0-9!-\/:-@\[-{-~]{6,30}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('New Password'),
      confirm_password: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'must match new_password' }, label: 'Password Confirmation' } })
    }
  },

   //GET /api/auth/forgotPassword
   forgotPassword: {
    query: {
      mobile: Joi.string().required().label("Enter the valid mobile number"),
    }
  },

  adminforgotPassword: {
    query: {
    email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
    }
  },

  //POST /api/user/resetpassword
  resetPassword: {
    body: {
      otp_code: Joi.number().required().label("Enter OTP code"),
      new_password: Joi.string().required().regex( /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('Password'),
      confirm_password: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'New Password and Confirm password must be same' }, label: 'Password Confirmation' } })
    }
  },

  adminresetPassword: {
    body: {
      otp_code: Joi.number().required().label("Enter OTP code"),
      new_password: Joi.string().required().regex( /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('Password'),
      confirm_password: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'New Password and Confirm password must be same' }, label: 'Password Confirmation' } })
    }
  },

  changeMobile: {
    body: {
      mobile: Joi.number().required().label('Mobile Number'),
      confirm_mobile: Joi.number().valid(Joi.ref('mobile')).required().options({ language: { any: { allowOnly: 'must match mobile' }, label: 'Mobile confirmation' } })
    }
  },

  verifyOtpMobile: {
    body: {
      otp_code: Joi.number().required().label('Enter Otp code'),
    }
  },


   //POST /api/shipment/sender_create
  senderShipment: {
    body: {
      shipment_name: Joi.string().required().label('Shipment Name'),
      shipment_value: Joi.number().required().label('Shipment Value'),
      pick_up_location: Joi.string().required().label('Enter the pick up location'),
      drop_off_location: Joi.string().required().label('Enter the drop off location'),
      pick_up_date: Joi.string().required().label('Enter the pick up date'),
      drop_off_date: Joi.string().required().label('Enter the drop off date'),
      total_pieces: Joi.number().required().label('Enter how many pieces'),
      total_weight: Joi.number().required().label('Enter the total weight'),
      package: Joi.array().items(Joi.object().required()).required().label('Image required'),
      weight_details_id: Joi.number().required().label('Enter unit Id'),
      total_container: Joi.number().required().label('Enter the total container'),
      // container_details_id: Joi.array().items(Joi.number().required()).required().label('Container size required'),
      recipient_name: Joi.string().required().label('Enter the Receiver name'),
      recipient_phone: Joi.string().required().label('Enter Receiver Mobile Number'),
      role: Joi.string().required().label("Enter the role")
    }
  },

  //POST /api/shipment/upload_package

uploadImage:{
  body: {
    shipment_id: Joi.number().required().label('Shipment Id'),
    package: Joi.array().items(Joi.object().required()).required().label('Image required'),
  }
},

 //POST /api/shipment/upload_package

 uploadDocument:{
  body: {
    shipment_id: Joi.number().required().label('Shipment Id'),
  }
},

  //GET /api/shipment/get_shipment
  getShipment: {
    query: {
      shipment_id: Joi.number().required().label("Enter Shipment ID"),
    }
  },
 
    
  //GET /api/auth/resend-otp
  
  resendOtp: {
    query: {
      mobile: Joi.string().required().label("Give the valid mobile number"),
    }
  },

  adminresendOtp: {
    query: {
     email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
    }
  },
   //GET /api/auth/verify-otp
  
   verifyOtp: {
    query: {
      otp_code: Joi.string().required().label("Enter the OTP"),
      flag: Joi.number().required().label("Set the flag as 1: Signup or 2: Forgot password")
    }
  },


  //POST /api/shipment/edit_shipment
  editShipment: {
    body: {
      shipment_id: Joi.number().required().label("Enter the Shipment ID"),
    }
  },

   //PUT /api/shipment/update_package
   updatePackage: {
    body: {
      id: Joi.number().required().label("Enter the Package ID"),
      shipment_detail_id: Joi.number().required().label("Enter the Shipment ID"),
    }
  },

   //POST /api/shipment/add_package
   addPackage: {
    body: {
      shipment_id: Joi.number().required().label("Enter the Shipment ID"),
      package: Joi.array().items(Joi.object().required()).required().label('Image required'),    }
  },

   //POST /api/shipment/delete_package
   deletePackage: {
    body: {
      package_id: Joi.number().required().label("Enter the Package ID"),
      shipment_id: Joi.number().required().label("Enter the Shipment ID"),
    }
  },

   //POST /api/carrier/create
   carrierCreate: {
    body: {
      source_location: Joi.string().required().label("Enter the source location"),
      destination: Joi.string().required().label("Enter the destination"),
      time_of_pick_up: Joi.string().required().label("Enter the pick up time"),
      pick_up_date: Joi.string().required().label("Enter the pick up date"),
      kg_to_carry: Joi.string().required().label("Enter the weight you will carry"),
      // weight_details_id: Joi.number().required().label('Enter unit Id'),
      rate: Joi.string().required().label("Enter the rate"),
      extra_charge: Joi.string().required().label("Enter the extra charge"),
      role: Joi.string().required().label("Enter the role")

    }
  },

    //GET /api/carrier/get_carrier
    getCarrier: {
      query: {
        post_id: Joi.number().required().label("Enter the Post ID"),

      }
    },

    //GET /api/carrier/get_carrier
    carrierStatus: {
      query: {
        request_id: Joi.number().required().label("Enter the request ID"),
        role_id: Joi.number().required().label("Enter the role"),
      }
    },



    pickupLocation: {
      query: {
        shipment_id: Joi.number().required().label("Enter the Shipment ID"),
        flag:  Joi.number().required().label("Enter the flag 1: nearby carrier or 2: serach by username")
      }
    },

    pickupSender: {
      query: {
        carrier_id: Joi.number().required().label("Enter the Carrier ID"),
        flag:  Joi.number().required().label("Enter the flag 1: nearby sender or 2: serach by username")
      }
    },

    editCarrier: {
      body: {
        id: Joi.number().required().label("Carrier ID required"),
      }
    },

    getSenderDetail: {
      query: {
        shipment_id: Joi.number().required().label("Shipment ID required"),
      }
    },
    
    
    requestCarrier: {
      body: {
        shipment_id: Joi.number().required().label("Shipment ID required"),
        carrier_id: Joi.array().items(Joi.number().required()).required().label('Carrier ID required'),
        status_id: Joi.number().required().label("Enter the status"),
        role_id: Joi.number().required().label("Enter the role"),

      }
    },

    requestSender: {
      body: {
        carrier_post_id: Joi.number().required().label("Carrier Post ID required"),
        shipment_id: Joi.array().items(Joi.number().required()).required().label('Shipment ID required'),
        status_id: Joi.number().required().label("Enter the status"),
        role_id: Joi.number().required().label("Enter the role"),

      }
    },
    
    senderAccept: {
      body: {
        request_id: Joi.number().required().label("Requset ID required"),
        flag: Joi.number().required().label("Enter the flag (1: Accepted/ 2: Rejected)"),
      }
    },

    create: {
      body: {
        directional_content: Joi.string().required().label("Add content"),
        role_id: Joi.number().required().label("Enter Role ID"),
      }
    },

    edit: {
      body: {
        directional_content: Joi.string().required().label("Update content"),
        content_id: Joi.number().required().label("Enter ID"),
      }
    },

    deleteContent: {
     body: {
        content_id: Joi.number().required().label("Enter ID"),
      }
    },

    carrierAccept: {
      body: {
        request_id: Joi.number().required().label("Request ID required"),
        flag: Joi.number().required().label("Enter the flag (1: Accepted/ 2: Rejected)"),
      }

    },

    receiverAccept: {
      body: {
        request_id: Joi.number().required().label("Request ID required"),
        flag: Joi.number().required().label("Enter the flag (1: Accepted/ 2: Rejected)"),
      }
    },

    filterSenderRequest: {
      query: {
        role_id: Joi.number().required().label("Role ID required"),
        carrier_post_id: Joi.number().required().label("Carrier Post ID required"),
      },
    },

    detailView: {
      query: {
        request_id: Joi.number().required().label("Request ID required"),
      }
    },

    feedbackList: {
      query: {
        role_id: Joi.number().required().label("Role ID required"),
      }
    },

    verifyCode: {
      body: {
        otp_code: Joi.number().required().label("Enter OTP code"),
      }
    },

    invite: {
      body: {
        email: Joi.array().items(Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'Please enter the valid Email Id' } } } })).required().label('Email ID'),
      }
    },

    contact: {
      body: {
        fromEmail: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
        .label('Email'),
        name: Joi.string().required().label("Name required"),
        message: Joi.string().required().label("Message required"),
       }
      },
   
    reviewReport: {
        body: {
          report_id: Joi.number().required().label("Report Id"),
         }
    },


    selectRole: {
      body: {
        role_id: Joi.number().required().label("Role ID required"),
      }
    },
    
    cardDetails: {
      body: {
        card_id: Joi.string().required().label("Card ID required"),
        card_type: Joi.string().required().label("Please mention the card type"),
      }
    },


  // POST /api/admin
  createUsers: {
    body: {
      name: Joi.string().required().label('Name'),
      username: Joi.string().required().label('UserName'),
      email: Joi.string().regex(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required().options({ language: { string: { regex: { base: 'must be valid' } } } })
      .label('Email'),
      mobile: Joi.string().required().label('Mobile Number'),
      // country_code: Joi.string().required().label('Choose country Code'),
      address:Joi.string().required().label('Address'),
      password: Joi.string().required().regex( /^[a-zA-Z0-9!-\/:-@\[-{-~]{6,30}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters' } } } })
      .label('Password'),
    },
    options: { abortEarly: true },
  },
  
  // POST /api/admin
  activeUsers: {
    body: {
      user_id: Joi.number().required().label("User ID required"),
      block: Joi.number().required().label('Active or Deactive'),
    }
  },

  deleteUser: {
    body: {
      user_id: Joi.number().required().label("User ID required"),
    }
  },

  editUser: {
    body: {
      id: Joi.number().required().label("User ID required"),
    }
  },

  getUser: {
    query: {
      user_id: Joi.number().required().label("User ID required"),
    }
  },

  verifyUser: {
    body: {
      id: Joi.number().required().label("ID required"),
      verify: Joi.number().required().label('Send verification code'),
    }
  },

  updateStatus: {
    body: {
      notification_id: Joi.number().required().label("Notification ID required"),
      status: Joi.string().required().label("Status required"),
    }
  },

  getDetail:{
    query: {
      notification_id: Joi.number().required().label("Notification ID required"),
    }
  },

  location: {
    query: {
      request_id: Joi.number().required().label(" Request ID required"),
    }
  },

  commission: {
    body: {
      country_id: Joi.number().required().label(" Country ID required"),
      commission: Joi.number().required().label(" Commission required")
    }
  },
  
  editCommission: {
    body: {
      id: Joi.number().required().label(" Commission ID required")
    }
  },

  announcement: {
    body: {
      message: Joi.string().required().label("Enter some text")
    }
  },

  latest: {
    query: {
      request_id: Joi.number().required().label(" Request ID required")

    }
  },

  password: {
    body: {
      old_password: Joi.string().required().label("Enter Old password"),
      new_password: Joi.string().required().regex( /^(?=.*?[A-Za-z])(?=.*?[0-9])(?=.*?[^\w\s]).{8,}$/).options({ language: { string: { regex:{ base: 'must be more than 6 characters and alphanumeric' } } } })
      .label('Password'),
      confirm_password: Joi.any().valid(Joi.ref('new_password')).required().options({ language: { any: { allowOnly: 'New Password and Confirm password must be same' }, label: 'Password Confirmation' } })
    }
  },

  pay : {
    body: {

      request_id: Joi.number().required().label(" Shipment ID required"),
      cvv: Joi.string().required().label("Enter cvv")
        }
  },

  transaction: {
    body: {
      transaction_id: Joi.number().required().label(" Transaction ID required"),
        }
  }
};


