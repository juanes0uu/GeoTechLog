const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`HTTP ${res.status}: ${txt}`);
  }
  return res.json();
}

export const api = {
  getUsuarios: () => request("/usuarios"),
  getLugares: () => request("/lugares"),

  getRutas: async () => {
    const res = await request<any>("/rutas");
    return Array.isArray(res) ? res : res.data || [];
  },

  getRutaDetalle: async (idRuta: number) => {
    const res = await request<any>(`/ruta-detalle/${idRuta}`);
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res.detalle)) return res.detalle;
    if (Array.isArray(res.rutaDetalle)) return res.rutaDetalle;
    return [];
  },

  postUbicacion: (data: unknown) =>
    request("/ubicaciones", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  postRuta: (data: { IdUsuario: number; Nombre?: string }) =>
    request("/rutas", { method: "POST", body: JSON.stringify(data) }),

  postRutaDetalle: (data: { IdRuta: number; Latitud: number; Longitud: number; Orden: number }) =>
    request("/ruta-detalle", { method: "POST", body: JSON.stringify(data) }),

  postLugar: (data: { IdUsuario: number; Nombre: string; Descripcion?: string; Latitud: number; Longitud: number }) =>
    request("/lugares", { method: "POST", body: JSON.stringify(data) }),


  

};
