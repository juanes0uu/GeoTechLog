import { Client } from "https://deno.land/x/mysql/mod.ts";

export const db = await new Client().connect({
  hostname: "localhost",
  username: "root",
  password: "",
  db: "geolocalizacion",
  port: 3306, 
});