// src/routes/auth.ts

import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import * as authController from "../controllers/authController.ts"; 

const router = new Router();

//  Endpoint para el registro de nuevos usuarios
router.post("/register", authController.register);

//  Endpoint para el inicio de sesión y obtención de token
router.post("/login", authController.login);

export default router;