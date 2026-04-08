import jwt from "jsonwebtoken";
export const authMiddleware = (req, res, next) => {
    try {
        if (req.isAuthenticated && req.isAuthenticated()) {
            const googleUser = req.user;
            req.user = {
                userId: googleUser.userId, // using userId from transformed user
                email: googleUser.email,
                name: googleUser.name,
            };
            return next();
        }
        const token = req.cookies?.token;
        if (!token) {
            return res
                .status(401)
                .json({ success: false, message: "Not authenticated" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res
            .status(401)
            .json({ success: false, message: "Invalid or expired token" });
    }
};
