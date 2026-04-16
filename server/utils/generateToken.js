 
import jwt from "jsonwebtoken";

export const generateToken = (user, statusCode, message, res) => {
  const token = jwt.sign(
    { 
      id: user._id, 
      role: user.role  
    }, 
    process.env.JWT_SECRET, 
    {
      expiresIn: process.env.JWT_EXPIRE || "7d",
    }
  );
 
  user.password = undefined;

  const cookieOptions = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRE || 7) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  };

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    message,
    user,
    token,
    role: user.role,  
  });
};