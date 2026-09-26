import pool from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";

export const registerUser = async (name, email, password) => {

    // Check if email already exists
    const existingUser = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (existingUser.rows.length > 0) {
        throw new AppError("Email already exists", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const result = await pool.query(
        `INSERT INTO users(name, email, password)
         VALUES($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name, email, hashedPassword]
    );

    return result.rows[0];
};

export const loginUser = async (email, password) => {

    // Check if user exists
    const result = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
    );

    if (result.rows.length === 0) {
        throw new AppError("Invalid email or password", 401);
    }

    const user = result.rows[0];

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "7d"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    };
};

export const getCurrentUserService = async (
    userId
) => {

    const result = await pool.query(
        `
        SELECT

            id,
            name,
            email,
            created_at

        FROM users

        WHERE id = $1
        `,
        [userId]
    );

    if (result.rows.length === 0) {

        throw new AppError(
            "User not found",
            404
        );

    }

    return result.rows[0];

};