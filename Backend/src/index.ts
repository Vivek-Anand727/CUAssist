// Use prisma client like this
import { prisma } from "./lib/prisma";
import express from "express";
import homeRouter from "./routes/homeRoute";
const app = express();


app.use("/api/v1/", homeRouter);
app.listen(3000);