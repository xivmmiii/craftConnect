const MIN_JWT_SECRET_LENGTH = 32;

const validateEnv = () => {
    const missing = ["MONGO_URI", "JWT_SECRET"].filter((key) => !process.env[key]);
    if (missing.length)
        throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH)
        throw new Error(
            `JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters. Generate one with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`,
        );
    if (!process.env.SMTP_HOST)
        console.warn(
            "SMTP_HOST is not set: password reset emails will not be delivered.",
        );
};

export default validateEnv;
