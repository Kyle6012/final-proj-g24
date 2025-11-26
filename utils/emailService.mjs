// Email service disabled by user request
export const sendVerificationEmail = async (email, token) => {
    console.log(`[Email Disabled] Verification email would have been sent to ${email} with token ${token}`);
    return true;
};

export const sendResetPasswordEmail = async (email, token) => {
    console.log(`[Email Disabled] Reset password email would have been sent to ${email} with token ${token}`);
    return true;
};

export const sendEmail = async (to, subject, html) => {
    console.log(`[Email Disabled] Generic email would have been sent to ${to} with subject "${subject}"`);
    return true;
};

export const sendCustomEmail = async (to, subject, html) => {
    console.log(`[Email Disabled] Custom email would have been sent to ${to} with subject "${subject}"`);
    return true;
};

export const sendPasswordResetEmail = async (email, token) => {
    console.log(`[Email Disabled] Password reset email would have been sent to ${email} with token ${token}`);
    return true;
};