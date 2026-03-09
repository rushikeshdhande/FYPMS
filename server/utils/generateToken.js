export const generateToken = (user, statusCode, message, res) => {
    const token = user.getJwtToken();

    res.status(statusCode).cookie("token",token,{
        expires: new Date(Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true,

    }).json({
        success:true,
        user,
        token,
        message,
        
    })
}