import {
    registerUser,
    loginUser,
    getCurrentUserService
} from "../services/authService.js";

export const signup = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const user = await registerUser(name, email, password);

        res.status(201).json({
            success: true,
            message: "User created successfully",
            user
        });

    } catch (err) {
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const { token, user } = await loginUser(email, password);

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user
        });

    } catch (err) {
        next(err);
    }
};

export const getCurrentUser = async (
    req,
    res,
    next
) => {

    try {

        const user =
            await getCurrentUserService(
                req.user.id
            );

        res.status(200).json({
            success: true,
            user
        });

    }
    catch (err) {

        next(err);

    }

};