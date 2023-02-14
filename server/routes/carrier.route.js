import express from 'express';
import carrierCtrl from '../controllers/carrier.controller';
import paramValidation from '../../config/param-validation';
import validate from 'express-validation';


const router = express.Router();

router.route('/create').post(validate(paramValidation.carrierCreate),carrierCtrl.carrierCreate);
router.route('/get_carrier_post').get(validate(paramValidation.getCarrier),carrierCtrl.getCarrier);
router.route('/edit_carrier').post(validate(paramValidation.editCarrier),carrierCtrl.editCarrier);
router.route('/sender_detailed_view').get(validate(paramValidation.getSenderDetail),carrierCtrl.getSenderDetail);
router.route('/requesting_sender').post(validate(paramValidation.requestSender),carrierCtrl.requestSender);
router.route('/near_by_location').get(validate(paramValidation.pickupSender),carrierCtrl.pickupLocation);
router.route('/getAll_carrier').get(carrierCtrl.getAllCarrier);
router.route('/status').get(validate(paramValidation.carrierStatus),carrierCtrl.carrierStatus);
router.route('/acceptance').post(validate(paramValidation.carrierAccept),carrierCtrl.carrierAccept);


export default router;
