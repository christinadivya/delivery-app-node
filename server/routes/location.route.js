import express from 'express';
import locationCtrl from '../controllers/location.controller';
import paramValidation from '../../config/param-validation';
import validate from 'express-validation';


const router = express.Router();

router.route('/').post(locationCtrl.location);
router.route('/get-location').get(validate(paramValidation.location),locationCtrl.getLocation);


export default router;
