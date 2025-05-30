import express, {Express} from 'express';
import helmet from "helmet";
import cors from "cors";
import hpp from "hpp";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import postRoutes from "./routes/post.routes";
import profileRoutes from "./routes/profile.routes";
import commentRoutes from "./routes/comment.routes";
import {errorHandler} from "./middlewares/error.middleware";
import {AppError} from "./utils/AppError";
import config from "./config/config";
import limiter from "./middlewares/limiter.middleware";
import swaggerUi from "swagger-ui-express";
import {swaggerOptions} from "./swaggerdocs/swagger";

const app: Express = express();

// Use helmet for setting security headers
app.use(
    helmet({
        contentSecurityPolicy: false,
    })
);

// Configure the allowed origins for this backend API
const ALLOWED_ORIGINS = config.ALLOWED_ORIGINS.split(",") || [];
app.use(
    cors({
        origin: ALLOWED_ORIGINS,
        credentials: true,
    })
);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(
    hpp({
        whitelist: [
            "paginated",
            "page",
            "limit",
            "status",
            "isActive",
        ],
    })
);

app.use("/", limiter);
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/categories", categoryRoutes)
app.use("/api/v1/posts", postRoutes)
app.use("/api/v1/profiles", profileRoutes)
app.use("/api/v1/comments", commentRoutes)
app.use("/api/v1/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerOptions))

app.all("/{*splat}", (req, res, next) => {
    next(new AppError(`EntityNotFound`, "Can't find the ${req.originalUrl} on the server"));
});
app.use(errorHandler)

export default app;