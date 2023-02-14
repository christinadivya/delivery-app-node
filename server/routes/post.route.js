import express from 'express';
import postCtrl from '../controllers/post.controller';
import paramValidation from '../../config/param-validation';
import validate from 'express-validation';


const router = express.Router();

router.route('/sender').get(postCtrl.asSender);
router.route('/carrier').get(postCtrl.asCarrier);
router.route('/receiver').get(postCtrl.asReceiver);
router.route('/view_sender').get(postCtrl.senderRequest);
router.route('/view_carrier').get(postCtrl.carrierRequest);
router.route('/view_detail').get(validate(paramValidation.detailView),postCtrl.detailView);
// fILTER SENDER REQUEST
router.route('/filter_sender_request').get(validate(paramValidation.filterSenderRequest),postCtrl.filterSenderRequest);
router.route('/invite').post(validate(paramValidation.invite),postCtrl.invite);
router.route('/contact').post(validate(paramValidation.contact),postCtrl.contactUs);


export default router;
