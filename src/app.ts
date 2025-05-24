import express from 'express';
import userRoutes from "./routes/user.routes";
import categoryRoutes from "./routes/category.routes";
import {errorHandler} from "./middlewares/error.middleware";

const app = express();

app.use(express.json());
app.use("/api/v1/users", userRoutes)
app.use("/api/v1/categories", categoryRoutes)
app.use(errorHandler)

export default app;