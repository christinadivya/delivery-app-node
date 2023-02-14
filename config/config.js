const config = {
  env: 'production',
  port: 9001,
  jwtSecret: '0a6b944d-d2fb-46fc-a85e-0295c986cd9f',
  twilio: {
    api_key: 'AC012b60f2c75e67b297231b4643148edf',
    secret_key: '268c3f0b3a22c89ca478cffc630e9f37'
  },
  admin_id: 1,
  options: {
    provider: 'google',
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyCIa2cGqwUTIR1orGcerdNqBG3A2XbjhSA', // for Mapquest, OpenCage, Google Premier
  formatter: null 
  },
  mail: {
    username: 'shilpakannan',
    password: 'optisol123',
    from: 'info@fetch39.com',
    preheader: 'Fetch39',
    invite: {
      subject: 'Welcome Email'
    },
    recover: {
      subject: 'Forgot Password'
    },
    customerId: {
      subject: 'Customer Id'
    },
    activeMail: {
      subject: 'Email Verification Code'
    },
    otpMail: {
      subject: 'Your Otp'
    },
    codeMail: {
      subject: 'Your Shipment Pickup Otp'
    },
    receiveMail: {
      subject: 'Your Shipment Deliver Otp'
    },
    inviteMail: {
      subject: 'You have an invite from FETCH39'
    },
    senderAccept: {
      subject: 'Acceptance from sender FETCH39'
    },
    carrierAccept: {
      subject: 'You have accepted the sender request FETCH39'

    },
    userMail: {
      subject: 'You have mail from FETCH39 user'
    },
    edit: {
      subject: 'You have mail from FETCH39 admin'
    },
    verify: {
      subject: 'You have verification mail from FETCH39 admin'
    },
    userInvite: {
      subject: 'You have an invite mail from FETCH39 admin'
    },
    activeUser: {
      subject: 'You have an mail from FETCH39 admin'

    }
  }
};

exports.config = config;
