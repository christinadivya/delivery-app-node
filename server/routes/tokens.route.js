import express from 'express';
import validate from 'express-validation';
import passport from 'passport';
import paramValidation from '../../config/param-validation';
import tokenCtrl from '../controllers/tokens.controller';

const router = express.Router();

router.route('/')
  .post(tokenCtrl.create);

export default router;