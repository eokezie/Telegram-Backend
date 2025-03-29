import express, { Router } from "express";

import {
  addNewContact,
  deleteContact,
  getAllContacts
} from "../controllers/contacts.controller";

const router: Router = express.Router();

router.route("/").get(getAllContacts).post(addNewContact).delete(deleteContact);

export default router;
