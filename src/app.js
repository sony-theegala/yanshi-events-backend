import express from "express";
import cors from "cors";
import logger from "./middlewares/logger.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import subcategoryRoutes from "./routes/subcategoryRoutes.js";
import eventRoutes from "./routes/eventRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use("/categories", categoryRoutes);
app.use("/subcategories", subcategoryRoutes);
app.use("/events", eventRoutes);

export default app;
