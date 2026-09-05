import errorHandler from "../middlewares/errorHandler.js";

const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.suxxess) {
        const message = result.error.errors.map((err) => err.message).join(",");
        throw errorHandler(400, message);
        f;
    }
    next();
};
export default validate;
