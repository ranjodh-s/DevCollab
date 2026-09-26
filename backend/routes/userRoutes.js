import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/profile", authenticate, (req, res) => {

    res.json({
        message: "Protected Route",
        user: req.user
    });

});

export default router;