import express from 'express';
import feedbackCtrl from '../controllers/feedback.controller';

const router = express.Router();

router.route('/rating').post(feedbackCtrl.create);
router.route('/report').post(feedbackCtrl.createReport);


export default router;


