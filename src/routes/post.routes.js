import express from "express";
import { create, getposts, getpost, updatepost, deletepost } from "../controllers/post.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, create);

router.put('/update/:postId', verifyToken, updatepost)

router.get("/getposts", getposts);
router.delete('/delete/:postId', verifyToken, deletepost)
router.get("/getpost/:id", getpost);

export default router;