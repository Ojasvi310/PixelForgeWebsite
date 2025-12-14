import express from "express";
import { createPreview } from "./api/preview.js";

const app = express();
app.use(express.json({ limit: "10mb" }));

app.post("/api/preview", createPreview);

app.listen(3001, () => {
  console.log("Backend running on 3001");
});
