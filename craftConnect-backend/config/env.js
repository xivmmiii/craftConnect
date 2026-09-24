const MIN_JWT_SECRET_LENGTH = 32;
const MIN_ADMIN_KEY_LENGTH = 16;

const validateEnv = () => {
    const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
    if (missing.length)
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH)
        throw new Error(
            `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters. Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`,
        );
    // A guessable key would let anyone create an admin account.
    if (process.env.ADMIN_SIGNUP_KEY && process.env.ADMIN_SIGNUP_KEY.length < MIN_ADMIN_KEY_LENGTH)
        throw new Error(
            `ADMIN_SIGNUP_KEY must be at least ${MIN_ADMIN_KEY_LENGTH} characters, or left unset to turn admin sign-up off.`,
        );
    if (!process.env.SMTP_HOST)
        console.warn(
            "SMTP_HOST is not set: password reset emails will not be delivered.",
        );
};

export default validateEnv;
