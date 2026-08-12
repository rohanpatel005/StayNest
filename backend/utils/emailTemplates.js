const resetPasswordEmailTemplate = (userName, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
      <h2 style="color: #ff385c; text-align: center;">StayNest</h2>
      <p>Hello ${userName},</p>
      <p>We received a request to reset your StayNest password.</p>
      <p>Your OTP is:</p>
      <div style="background-color: #f7f7f7; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
        <h1 style="letter-spacing: 5px; color: #333; margin: 0;">${otp}</h1>
      </div>
      <p>This OTP will expire in 10 minutes.</p>
      <p style="color: #777; font-size: 12px; margin-top: 30px;">
        If you did not request a password reset, you can safely ignore this email.
      </p>
      <p>Regards,<br>StayNest Team</p>
    </div>
  `;
};

module.exports = { resetPasswordEmailTemplate };
