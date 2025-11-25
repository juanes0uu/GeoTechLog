// src/routes/users.ts

import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import * as usersController from "../controllers/usersController.ts"; 

const router = new Router();

// RUTA DE REGISTRO (FALTABA)
// router.post("/usuarios/register", usersController.registerUser);

// Otras rutas
// router.get("/users/:id", usersController.getUserById);
// router.get("/users", usersController.getAllUsers);

export default router;
