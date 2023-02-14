import express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import paramValidation from '../../config/param-validation';
import adminCtrl from '../controllers/admin.controller';
import directionalCtrl from '../controllers/directional_content.controller';

const router = express.Router(); // eslint-disable-line new-cap

router.route('/view-users').get(adminCtrl.viewUsers);
router.route('/create-users').post(validate(paramValidation.createUsers),adminCtrl.createUsers);
router.route('/active-users').post(validate(paramValidation.activeUsers),adminCtrl.activateUsers);
router.route('/delete-users').delete(validate(paramValidation.deleteUser),adminCtrl.deleteUser);
router.route('/edit-users').post(validate(paramValidation.editUser),adminCtrl.editUser);
router.route('/verify-users').post(validate(paramValidation.verifyUser),adminCtrl.verifyUser);
router.route('/get-user').get(validate(paramValidation.getUser),adminCtrl.getUser);
router.route('/view-report').get(adminCtrl.viewReport);
router.route('/review-report').post(validate(paramValidation.reviewReport),adminCtrl.reviewReport);
router.route('/reject-list').get(adminCtrl.viewReject);
router.route('/view-shipment').get(adminCtrl.viewShipment);
router.route('/label').get(adminCtrl.label);
router.route('/get-shipment').get(validate(paramValidation.detailView),adminCtrl.getShipment);
router.route('/create').post(validate(paramValidation.create),directionalCtrl.create);
router.route('/get').get(directionalCtrl.get);
router.route('/edit').post(validate(paramValidation.edit),directionalCtrl.edit);
router.route('/delete').post(validate(paramValidation.deleteContent),directionalCtrl.deleteContent);
router.route('/commission').post(validate(paramValidation.commission),adminCtrl.createCommission);
router.route('/get-commission').get(adminCtrl.getCommission);
router.route('/notification').get(adminCtrl.notifyStatus);
router.route('/change-password').post(validate(paramValidation.password),adminCtrl.changePassword);
router.route('/edit-commission').post(validate(paramValidation.editCommission),adminCtrl.editCommission);
router.route('/announcement').post(validate(paramValidation.announcement),adminCtrl.announcement);
router.route('/count').get(adminCtrl.count);
router.route('/edit-profile').post(adminCtrl.editProfile);
router.route('/get-profile').get(adminCtrl.getProfile);
router.route('/update-status')
  .post(validate(paramValidation.updateStatus),adminCtrl.updateStatus);
router.route('/get-transaction').get(adminCtrl.getTransaction);
router.route('/get-container').get(adminCtrl.containerDetails);
router.route('/edit-transaction').post(validate(paramValidation.transaction),adminCtrl.editTransaction);
  
  


export default router;
