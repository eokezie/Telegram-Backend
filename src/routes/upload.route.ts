import express, { Router } from "express";

import { upload } from "../controllers/upload.controller";

const router: Router = express.Router();

router.route("/").post(upload);

export default router;
