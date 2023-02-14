import fs from 'fs';
import handlebars from 'handlebars'
import env_const from '../../config/config.js';
import path from 'path';
import nodemailer from 'nodemailer';
import sgTransport from 'nodemailer-sendgrid-transport';

// env_const.config = env_const.config.config;

const options = {
  auth: {
    api_user: env_const.config.mail.username,
    api_key: env_const.config.mail.password
  }
}
const transporter = nodemailer.createTransport(sgTransport(options));

function sendMail1(userInput,callback){
 
  fs.readFile(path.join(process.cwd()+'/template'+userInput.path), {encoding: 'utf-8'}, function (err, html) {
  if (err) {
  console.log(err);
  throw err;
  // callback(err);
  }
  else {
  console.log(userInput.email)
  var template = handlebars.compile(html);
  var replacements = {
  otp: userInput.otp,
  username: userInput.name,
  deal: userInput.deal
  };
  var htmlToSend = template(replacements);
  // console.log(htmlToSend);
  const mailOptions = {
  from: env_const.config.mail.from,
  to: userInput.email,
  subject: env_const.config.mail[userInput.templateName].subject,
  // preheader: env_const.config.mail.preheader,
  html:htmlToSend
   };

   transporter.sendMail(mailOptions, (error, info) => {    
    console.log(error)

      console.log(`Message sent: ${info}`);
      callback(error, info)
  });
 }
 })
}
   

export default {
  sendMail,
  sendMail1,
  getHtml
};

function sendMail(userInput, templateName, callback) {
  console.log(userInput)
    var html = getHtml(templateName, userInput)    
    const mailOptions = {
        from: env_const.config.mail.from,  
        to: userInput.email,
        subject: env_const.config.mail[templateName].subject,
        preheader: env_const.config.mail.preheader,
        html       
    };
 
    transporter.sendMail(mailOptions, (error, info) => {    
      console.log(error)

        console.log(`Message sent: ${info}`);
        callback(error, info)
    });
}

function getHtml(templateName, data) { 
   // const templatePath = path.join(__dirname,`${templateName}.js`)   
   // var templateContent = fs.readFileSync(templatePath, 'utf8');
   
   switch(templateName) {
    case 'invite':
       return "<h4>Hi,"+data.name+"</h4><span> Thanks for signup<span>"
        break;
    case 'userInvite':
        return "<h4>Hi,"+data.name+"</h4><span>Welcome to Fetch39<span><br><h4>Please use this credentials</h4><br><label>Your Username:</label><span>"+data.username+"</span><br><br><label>Your password:</label><span>"+data.password+"</span><br><span>please click here to login into the app: <a target =_blank href=http://52.45.171.205:9000 </a><span>Click Me</span>"
         break;
    case 'recover':    
         return "<label>Your OTP for:</label><span>"+data.new_password+"</span><br><span>Expired in 8 hours</span><br><span>please click here to reset the password: <a target =_blank href=http://52.45.171.205:9000/#/reset-password/"+data.new_password+">click me</a>"
        break;
    case 'customerId':    
         return "<label>Your Customer Id:</label><span>"+data.customer_id+"</span><br>"
        break;
    case 'activeMail':    
         return "<label>Your Email Verification Code:</label><span>"+data.email_otp_code+"</span><br>"
        break;
    case 'userMail':
         return "<label>You have mail from </label><span>"+data.name+"</span><br><label>User Email is: </label><span>"+data.fromEmail+"</span><br><label>User Message: </label><span>"+data.message+"</span><br>"
         break;
    case 'otpMail':
         return "<label>Your OTP Verification Code for reset password is :</label><span>"+data.otp_code+"</span><br>"
         break;
    case 'codeMail':
         return "<label>Your OTP Verification Code for shipment pickup is :</label><span>"+data.otp_code+"</span><br>"
         break;
    case 'receiveMail':
         return "<label>Your OTP Verification Code for shipment deliver is :</label><span>"+data.otp_code+"</span><br>"
         break;
    case 'senderAccept': 
         return "<label>Your Post is accepted by Sender :</label><span>"+"</span><br>"
         break;
    case 'carrierAccept': 
         return "<label>You have accepted the sender request :</label><span>"+"</span><br>"
         break;
    case 'inviteMail':
         return "<label>Please visit the FETCH39 for best logistics</label><span></span><br><br><span>please click here to sign up into the app: <a target =_blank href=http://52.45.171.205:9000 </a><span>Click Me</span>"
         break;
    case 'edit':
         return "<label>Your profile has been updated by admin</label><span></span><br>"
         break;
    case 'activeUser':
         return "<label>"+data.message+"</label><span></span><br>"
         break;
    case 'verify':
         return "<label>"+data.message+"</label><span></span><br>"
         break;
    default:
        templateContent
  }
   
   // return  templateContent  
}
// });
