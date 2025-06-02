import express from "express";
import cors from 'cors';
import authRoutes from "./routes/auth.route";
import otpRoutes from "./routes/otp.route";
import canteenRoutes from "./routes/canteen.route"; 
import itemRoutes from "./routes/item.route";
import imageUploadRoutes from "./routes/imageUpload.route";


const app = express();

app.use(cors({origin: "http://localhost:5173" , credentials: true}));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/otp', otpRoutes);
app.use('/api/v1/canteen', canteenRoutes );
app.use("/api/v1/item", itemRoutes);
app.use("/api/v1/images", imageUploadRoutes);


app.listen(5000);