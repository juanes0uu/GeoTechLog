export interface Usuario {
    IdUsuario: number;
    Nombre: string;
    Email: string;
    Documento: string;
}

export interface Lugar {
    IdLugar: number;
    IdUsuario?: number;
    Nombre: string;
    Descripcion?: string;
    Latitud: number;
    Longitud: number;
}

export interface Ruta {
    IdRuta: number;
    IdUsuario: number;
    Nombre: string;
}

export interface RutaDetalle {
    IdRutaDetalle: number;
    IdRuta: number;
    Latitud: number;
    Longitud: number;
    Orden: number;
}

export interface Ubicacion {
    IdUbicacion?: number;
    IdUsuario: number;
    Latitud: number;
    Longitud: number;
    FechaHora?: string;
}


// types.ts
export type UserRole = 'admin' | 'visitante';

export interface User {
  id: string | number;
  nombre: string;
  email: string;
  rol: UserRole;
}

export interface Position {
  lat: number;
  lng: number;
  timestamp: Date;
}

export interface VisitorSession {
  userId: string;
  userName: string;
  email: string;
  positions: Position[];
  connectedAt: Date;
  lastUpdate: Date;
  active: boolean;
}