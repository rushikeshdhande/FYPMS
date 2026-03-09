export function generateForgetPasswordEmailTemplate(resetPasswordUrl) {
      return `
        <h1>Password Reset Request</h1>
        <p>You have requested to reset your password. Please click the link below to reset your password:</p>
        <a href="${resetPasswordUrl}" style="display: inline-block; padding: 10px 20px; font-size: 16px; color: #fff; background-color: #007bff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
    `;
}