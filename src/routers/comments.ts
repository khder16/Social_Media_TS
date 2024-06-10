import express, { Router } from 'express';
import { createComment, getOneComment, updateComment, deleteComment, toggleCommentLike } from '../controllers/comments';

const router: Router = express.Router();

router.route('/:postId').post(createComment);

export default router;