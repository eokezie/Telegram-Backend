import express, { Router } from "express";

import {
  getSelfProfile,
  updateSelfProfile
} from "../controllers/profile.controller";

const router: Router = express.Router();

router.route("/").get(getSelfProfile).patch(updateSelfProfile);

export default router;
