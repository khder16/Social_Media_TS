import express, { Router } from 'express';
import {
    getUser,
    getSuggestedConnections,
    updateUser,
    addRemoveConnection,
    getAllUsers,
    getUserConnections,
    uploadImage,
    addStory
} from '../controllers/user';
import { verifyToken } from '../middleware/verifyToken';
import multerUploads from '../middleware/multer';

const router: Router = express.Router();

router.route('/:userId').get(verifyToken, getUser);
router.route('/getall').get(verifyToken, getAllUsers);
router.route('/addremoveconnections').patch(verifyToken, addRemoveConnection);
router.route('/getUserConn/:userId').get(verifyToken, getUserConnections);
router.route('/getSugges').post(verifyToken, getSuggestedConnections);
router.route('/updateUser').put(verifyToken, updateUser);
router.route('/upload').post(uploadImage);
router.route('/addStory/:userId').post(addStory)
export default router;