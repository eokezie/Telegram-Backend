import express, { Router } from "express";

import { login, register } from "../controllers/auth.controller";

const router: Router = express.Router();

router.post("/login", login);
router.post("/register", register);

export default router;
