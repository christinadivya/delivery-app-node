import express from 'express';
import shipmentCtrl from '../controllers/shipment.controller';
import paramValidation from '../../config/param-validation';
import validate from 'express-validation';

const router = express.Router();
// CREATING SHIPMENT
router.route('/sender_create').post(validate(paramValidation.senderShipment),shipmentCtrl.senderShipment);

router.route('/upload_package').post(validate(paramValidation.uploadImage),shipmentCtrl.uploadImage);

router.route('/upload_document').post(validate(paramValidation.uploadDocument),shipmentCtrl.uploadDocument);

// GET SPECIFIC SHIPMENT
router.route('/get_shipment').get(validate(paramValidation.getShipment),shipmentCtrl.getShipment);
// GET DEFAULT ALL SHIPMENT ALSO CAN GIVE STATUS AS WELL
router.route('/getAll_shipment').get(shipmentCtrl.getAllShipment);
// EDIT SHIPMENT DETAILS
router.route('/edit_shipment').post(validate(paramValidation.editShipment),shipmentCtrl.editShipment);

// UPDATING SINGLE PACKAGE
router.route('/update_package').put(validate(paramValidation.updatePackage),shipmentCtrl.updatePackage);
// ADD MULTIPLE PACKAGE
router.route('/add_package').post(validate(paramValidation.addPackage),shipmentCtrl.addPackage);
//DELETE PACKAGE
router.route('/delete_package').post(validate(paramValidation.deletePackage),shipmentCtrl.deletePackage);
// GET NEAR BY LOCATION OF BOTH CARRIER
router.route('/near_by_location').get(validate(paramValidation.pickupLocation),shipmentCtrl.pickupLocation);
// MULTIPLE REQUEST TO CARRIER
router.route('/requesting_carrier').post(validate(paramValidation.requestCarrier),shipmentCtrl.requestCarrier);
// SENDER ACCEPTING CARRIER REQUEST
router.route('/acceptance').post(validate(paramValidation.senderAccept),shipmentCtrl.senderAccept);


export default router;
