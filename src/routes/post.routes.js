import express from "express";
import { create, getposts, getpost } from "../controllers/post.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

const router = express.Router();

router.post("/create", verifyToken, create);
router.get("/getposts", getposts);
router.get("/getpost/:id", getpost);

export default router;
