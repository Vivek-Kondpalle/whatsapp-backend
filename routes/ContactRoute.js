import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { searchContact } from "../controllers/ContactController.js";

const contactsRoutes = Router()

contactsRoutes.post('/search', verifyToken, searchContact)

export default contactsRoutes
