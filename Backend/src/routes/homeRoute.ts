import express  from "express"
import { homePageController } from "../controllers/homePageController";

const homeRouter= express.Router();

homeRouter.get("/", homePageController)
export default homeRouter;