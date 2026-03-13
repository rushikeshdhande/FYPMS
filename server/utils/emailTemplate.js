export function generateForgetPasswordEmailTemplate(resetPasswordUrl) {
  return `
    <h1>Password Reset Request</h1>

    <p>You have requested to reset your password. Please click the link below to reset your password:</p>

    <a href="${resetPasswordUrl}" 
       style="display:inline-block;padding:10px 20px;font-size:16px;color:#fff;background:#007bff;text-decoration:none;border-radius:5px;">
       Reset Password
    </a>

    <p>This link will expire in <b>15 minutes.</b></p>

    <p>If you did not request this, please ignore this email.</p>

    <p>If the button above does not work, copy paste the following link into your browser:</p>

    <p>${resetPasswordUrl}</p>

    <div style="text-align:center; margin-top:20px;">
        <p>Thank you,</p>
        <p>Rushikesh Dhande</p>
    </div>
  `;
}