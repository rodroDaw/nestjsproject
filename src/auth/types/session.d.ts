// src/types/session.d.ts
import 'express-session';

declare module 'express-session' {
  interface SessionData {
    nombreUsuario?: string;
    emailUsuario?: string;
  }
}
