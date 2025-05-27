import express from "express";
import homeRouter from "./routes/homeRoute";
import cors from 'cors';
import authRoutes from "./routes/auth.Route";

const app = express();

app.use(cors({origin: "http://localhost:5173" , credentials: true}));
app.use(express.json());



app.use('/auth', authRoutes);


app.use("/api/v1/", homeRouter);
app.listen(5000);