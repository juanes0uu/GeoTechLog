import { Application } from "https://deno.land/x/oak@v11.1.0/mod.ts";
import { oakCors } from "https://deno.land/x/cors@v1.2.2/mod.ts";
import authRouter from "./routes/auth.ts";

const app = new Application();

// 🔥 1. CORS primero — acepta *cualquier puerto localhost*
app.use(
  oakCors({
    origin: /^http:\/\/localhost:\d+$/,  // puerto dinámico de Vite
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 🔥 2. Manejar OPTIONS globalmente
app.use(async (ctx, next) => {
  if (ctx.request.method === "OPTIONS") {
    ctx.response.status = 200;
    return;
  }
  await next();
});

// 🔥 3. Rutas
app.use(authRouter.routes());
app.use(authRouter.allowedMethods());

console.log("Servidor escuchando en http://localhost:8080");
await app.listen({ port: 8080 });
