import express from 'express';
import passport from 'passport';
import userRoutes from './user.route';
import authRoutes from './auth.route';
import listRoutes from './list.route';
import feedbackRoutes from './feedback.route';
import tokenRoutes from './tokens.route';
import notificationRoutes from './notification.route';
import shipmentRoutes from './shipment.route';
import carrierRoutes from './carrier.route';
import postRoutes from './post.route';
import adminRoutes from './admin.route';
import LocationRoutes from './location.route';
import Oauth from '../models/oauth_token.model';
import User from '../models/user.model';


// import role from '../../config/check.js';

const isAuthenticated = passport.authenticate('jwt', { session: false });
const router = express.Router(); // eslint-disable-line new-cap

function checkValidUser(req, res, next) {
    if(true){
        console.log("Checking middleware");
        console.log(req.headers.authorization);
        let token_array = req.headers.authorization.split(' ');
        Oauth.where({ token: token_array[1], user_id: req.user.id, isLogin: 1 }).fetch().then((updateUser) => {
            if(updateUser) {
                User.where({ id: req.user.id, block: 0 }).fetch().then((users) => {
                    if(users) 
                       next();
                    else
                       res.status(440).send({status: 440, error: 'You have been blocked. Contact customer support'});
               })
            }
            else 
                res.status(440).send({status: 440, error: 'Session Expired'});
            
        })
    }
}
// const senderRole = role.senderRole(req,done);

router.use('/user', isAuthenticated, checkValidUser, userRoutes);
router.use('/auth', authRoutes);
router.use('/list', listRoutes);
router.use('/feedback', isAuthenticated, checkValidUser,feedbackRoutes);
router.use('/token',isAuthenticated, checkValidUser, tokenRoutes);
router.use('/notifications', isAuthenticated, checkValidUser, notificationRoutes);
router.use('/shipment', isAuthenticated, checkValidUser,  shipmentRoutes);
router.use('/carrier', isAuthenticated, checkValidUser, carrierRoutes);
router.use('/post', isAuthenticated, checkValidUser, postRoutes);
router.use('/admin', isAuthenticated, adminRoutes);
router.use('/location', isAuthenticated, checkValidUser, LocationRoutes);



export default router;
