import rateLimit, {RateLimitRequestHandler} from "express-rate-limit";
import config from "../config/config";

const WINDOW_MINUTES = config.RATE_LIMIT_WINDOW_MINUTES;
const MAX_REQUESTS = config.RATE_LIMIT_MAX_REQUESTS;

const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: WINDOW_MINUTES * 60 * 1000,
    limit: MAX_REQUESTS,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (request, response) => response.locals.user?.email || request.ip,
    handler: (req, res) => {
        res.status(429).json({
            status: "fail",
            message: `Too many requests. Limit: ${MAX_REQUESTS} per ${WINDOW_MINUTES} minutes.`,
        });
    },
});

export default limiter;