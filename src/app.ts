import express, {Express} from 'express';
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import categoryRoutes from "./routes/category.routes";
import postRoutes from "./routes/post.routes";
import profileRoutes from "./routes/profile.routes";
import {errorHandler} from "./middlewares/error.middleware";

const app: Express = express();

app.use(express.json());
app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/categories", categoryRoutes)
app.use("/api/v1/posts", postRoutes)
app.use("/api/v1/profiles", profileRoutes)
app.use(errorHandler)

export default app;