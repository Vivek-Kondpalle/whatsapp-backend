import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { searchContact, getContactsForDMList, getAllContacts } from "../controllers/ContactController.js";

const contactsRoutes = Router()

contactsRoutes.post('/search', verifyToken, searchContact)
contactsRoutes.get('/get-contacts-for-dm', verifyToken, getContactsForDMList)
contactsRoutes.get('/get-all-contacts', verifyToken, getAllContacts)

export default contactsRoutes
