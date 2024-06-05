import express from 'express';
import foodController from "../controllers/foodController.js";
import { addFood } from '../controllers/foodController.js';
import multer from 'multer';

const foodRouter = express.Router();

// Example route for adding food
foodRouter.post("/add",addFood);

export default foodRouter;
