import { db } from "../db/database.ts";

// Buscar usuario por Email
export const findUserByEmail = async (email: string) => {
    const users = await db.query(
        "SELECT IdUsuario, Nombre, Email, Documento, Password, Rol FROM usuario WHERE Email = ? LIMIT 1",
        [email]
    );

    return users[0] || null;
};

// Crear usuario
export const createUser = async (user: {
    Nombre: string;
    Email: string;
    Documento: string;
    Password: string;
    Rol: string;
}) => {
    const result = await db.execute(
        "INSERT INTO usuario (Nombre, Email, Documento, Password, Rol, FechaRegistro) VALUES (?, ?, ?, ?, ?, NOW())",
        [
            user.Nombre,
            user.Email,
            user.Documento,
            user.Password,
            user.Rol,
        ],
    );

    return {
        IdUsuario: result.lastInsertId,
        Nombre: user.Nombre,
        Email: user.Email,
        Documento: user.Documento,
        Rol: user.Rol
    };
};

// Obtener todos los usuarios
export const getAllUsers = async () => {
    return await db.query(
        "SELECT IdUsuario, Nombre, Email, Documento, Rol FROM usuario"
    );
};

// Obtener usuario por ID
export const getUserById = async (id: number) => {
    const users = await db.query(
        "SELECT IdUsuario, Nombre, Email, Documento, Rol FROM usuario WHERE IdUsuario = ?",
        [id]
    );

    return users[0] || null;
};
