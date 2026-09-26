import express from "express";
import { uploadFile, getProjectFiles, getFileById, deleteFile, getTaskFiles } from "../controllers/fileController.js";
import {authenticate} from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();


router.post(
    "/",
    authenticate,
    upload.single("file"),
    uploadFile
);
router.get(
    "/projects/:projectId",
    authenticate,
    getProjectFiles
);
router.get(
    "/:fileId",
    authenticate,
    getFileById
);
router.delete(
    "/:fileId",
    authenticate,
    deleteFile
);
router.get(
    "/tasks/:taskId",
    authenticate,
    getTaskFiles
);

export default router;