// import { Router } from "https://deno.land/x/oak@v11.1.0/mod.ts";

// const router = new Router();

// router.get("/", (ctx) => {

//   const fc = {
//     type: "FeatureCollection",
//     features: [
//       {
//         type: "Feature",
//         properties: { id: 1, name: "Portería Principal", category: "portería" },
//         geometry: { type: "Point", coordinates: [-73.0335, 5.8205] },
//       },
//       {
//         type: "Feature",
//         properties: { id: 2, name: "Bodega A", category: "bodega" },
//         geometry: { type: "Point", coordinates: [-73.031, 5.821] },
//       },
//       {
//         type: "Feature",
//         properties: { id: 3, name: "Parqueadero Norte", category: "parqueadero" },
//         geometry: { type: "Point", coordinates: [-73.035, 5.819] },
//       },
//     ],
//   };

//   ctx.response.headers.set("Content-Type", "application/geo+json");
//   ctx.response.body = fc;
// });

// export default router;
