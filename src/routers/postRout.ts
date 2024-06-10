import express, { Router } from 'express';
import {
    toggleLike,
    deletePost,
    getOnePost,
    updatePost,
    createPost,
    getUserPosts,
    addProfilePhoto
} from '../controllers/post';
import { verifyToken } from '../middleware/verifyToken';

const router: Router = express.Router();

router.route('/find/user-posts/:id').get(verifyToken, getUserPosts);

router.route('/find/:id').get(verifyToken, getOnePost);

router.route('/createpost').post(verifyToken, createPost);

router.route('/updatepost/:id').patch(verifyToken, updatePost);

router.route('/toggle-like/:id').patch(verifyToken, toggleLike);

router.route('deletepost/:id').delete(verifyToken, deletePost);

router.route('/addprofilephoto/:id').post(verifyToken, addProfilePhoto);
export default router;