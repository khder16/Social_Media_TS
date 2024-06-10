import express, { Router } from 'express';
import { verifyToken } from '../middleware/verifyToken'
import {
    register,
    login,
    checkVerifyEmail,
    logout,
    forgotPasswordToken,
    resetPassword,
    allUsers,
    OneUser
} from '../controllers/auth';

const router: Router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/verify/:id/:token').patch(checkVerifyEmail);
router.route('/logout').get(verifyToken, logout);
router.route('/forgotpass').post(forgotPasswordToken);
router.route('/resetpass/:token').post(resetPassword);
router.route('/allusers').get(allUsers);
router.route('/oneUser').get(OneUser);


export default router;