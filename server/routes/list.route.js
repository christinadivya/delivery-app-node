import express from 'express';
import listCtrl from '../controllers/list.controller';
import paramValidation from '../../config/param-validation';
import validate from 'express-validation';


const router = express.Router();

router.route('/weight_details').get(listCtrl.weightDetails);
router.route('/container_details').get(listCtrl.containerDetails);
router.route('/status_details').get(listCtrl.statusDetails);
router.route('/terms').get(listCtrl.termsCondition);
router.route('/roles').get(listCtrl.roles);
router.route('/feedback').get(validate(paramValidation.feedbackList),listCtrl.feedbackList);
router.route('/rejectList').get(validate(paramValidation.feedbackList),listCtrl.rejectList);
router.route('/rejectListALL').get(listCtrl.rejectListALL);
router.route('/faq').get(listCtrl.faqList);
router.route('/about-us').get(listCtrl.aboutUs);
router.route('/country_codes').get(listCtrl.countryCode);
router.route('/notification_type').get(listCtrl.notificationType);
router.route('/content').get(validate(paramValidation.feedbackList),listCtrl.DirectionalContent);



export default router;
