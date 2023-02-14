import express from 'express';
import validate from 'express-validation';
import paramValidation from '../../config/param-validation';
import userCtrl from '../controllers/user.controller';

const router = express.Router();
console.log("****");
router.route('/change-password').put(userCtrl.changePassword);
router.route('/generate-otp').post(userCtrl.generateOtp);
router.route('/').post(validate(paramValidation.selectRole), userCtrl.selectRole);
router.route('/verify-number').get(userCtrl.verifyPhone);
router.route('/verify-email').get(userCtrl.verifyEmail);
router.route('/validate-number').get(userCtrl.validateNumber);
router.route('/validate-email').get(userCtrl.validateEmail);
router.route('/edit-profile').post(userCtrl.editProfile);
router.route('/profile').get(userCtrl.getProfile);
router.route('/change-mobile').post(validate(paramValidation.changeMobile),userCtrl.changeMobile);
router.route('/verify-otpmobile').post(validate(paramValidation.verifyOtpMobile),userCtrl.verifyOtpMobileChange);
router.route('/receiver-accept').post(validate(paramValidation.carrierAccept),userCtrl.receiverAccept);
router.route('/verify-pickup-code').post(validate(paramValidation.verifyCode),userCtrl.verifyPickupCode);
router.route('/verify-deliver-code').post(validate(paramValidation.verifyCode),userCtrl.verifyDeliverCode);
router.route('/cardetails').post(validate(paramValidation.cardDetails),userCtrl.cardDetails);
router.route('/logout').post(userCtrl.logout);
router.route('/resend-otp').get(validate(paramValidation.resendOtp),userCtrl.resendOtp);
router.route('/delete').post(userCtrl.remove);


router.route('/').get(userCtrl.payment);
  /** GET /api/users/:userId - Get user *
  .get(userCtrl.get);

//   /** PUT /api/users/:userId - Update user */
//   .post(validate(paramValidation.updateUser), userCtrl.update)

//   /** DELETE /api/users/:userId - Delete user */
//   .delete(userCtrl.remove);

// /** Load user when API with userId route parameter is hit */

export default router;
