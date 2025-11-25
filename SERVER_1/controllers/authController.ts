import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { compare, hash } from "https://deno.land/x/bcrypt@v0.4.0/mod.ts";
import { SignJWT } from "https://deno.land/x/jose@v4.14.4/index.ts";
import * as userService from "../services/usersServices.ts"; 

// Correcto: JOSE usa Uint8Array como clave
const JWT_SECRET = new TextEncoder().encode(Deno.env.get("JWT_SECRET") || "12345");


// Registro
export const register = async (ctx: Context) => {
    const body = await ctx.request.body().value;
    const { Nombre, Email, Documento, Password, Rol } = body;

    if (!Nombre || !Email || !Password) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Faltan datos obligatorios." };
        return;
    }

    const existing = await userService.findUserByEmail(Email);

    if (existing) {
        ctx.response.status = 409;
        ctx.response.body = { message: "El email ya está registrado." };
        return;
    }

    const hashedPassword = await hash(Password);

    const newUser = await userService.createUser({
        Nombre,
        Email,
        Documento,
        Password: hashedPassword,
        Rol: Rol || "user"
    });

    ctx.response.status = 201;
    ctx.response.body = { 
        message: "Usuario registrado exitosamente.",
        user: newUser
    };
};


// LOGIN

export const login = async (ctx: Context) => {
    const body = await ctx.request.body().value;
    console.log("📥 Datos recibidos en /login:", body);

    const { Email, Password } = body;

    if (!Email || !Password) {
        ctx.response.status = 400;
        ctx.response.body = { message: "Email y password son obligatorios." };
        return;
    }

    const user = await userService.findUserByEmail(Email);

    if (!user) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Credenciales inválidas." };
        return;
    }

    const validPassword = await compare(Password, user.Password);

    if (!validPassword) {
        ctx.response.status = 401;
        ctx.response.body = { message: "Credenciales inválidas." };
        return;
    }

    // --- CREAR JWT correctamente ---
    const payload = {
        userId: user.IdUsuario,
        email: user.Email,
        rol: user.Rol,
    };

    const secretKey = new TextEncoder().encode(JWT_SECRET);

    const token = await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime("24h")
        .sign(secretKey);

    ctx.response.status = 200;
    ctx.response.body = {
        message: "Login exitoso",
        token,
        user: {
            id: user.IdUsuario,
            nombre: user.Nombre,
            email: user.Email,
            rol: user.Rol
        }
    };
};
