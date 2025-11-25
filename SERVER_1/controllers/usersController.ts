// src/controllers/usersController.ts

import { db } from "../db/database.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";

// export const registerUser = async ({ request, response }: any) => {
//   try {
//     const body = await request.body().value;

//     const { Nombre, Email, Documento, Password } = body;

//     if (!Nombre || !Email || !Documento || !Password) {
//       response.status = 400;
//       response.body = { error: "Datos incompletos" };
//       return;
//     }

//     // Encriptar contraseña
//     const hashedPassword = await bcrypt.hash(Password);

//     // Guardar en la BD
//     await db.query(
//       "INSERT INTO usuarios (Nombre, Email, Documento, Password) VALUES (?, ?, ?, ?)",
//       [Nombre, Email, Documento, hashedPassword]
//     );

//     response.status = 201;
//     response.body = { message: "Usuario registrado con éxito" };

//   } catch (error) {
//     console.error(error);
//     response.status = 500;
//     response.body = { error: "Error en el servidor" };
//   }
// };
