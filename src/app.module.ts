import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import * as session from 'express-session';

import { AuthModule } from './auth/auth.module'; 

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    AuthModule
    
  ],
  controllers: [],
  providers: [],
})
  export class AppModule implements NestModule {
    constructor(){
    }
    configure(consumer: MiddlewareConsumer) {
      consumer
        .apply(
          session({
            secret: 'mySecretKey',  // Cambia esta clave por algo más seguro
            resave: false,
            saveUninitialized: false,
            cookie: { secure: false }, // Si estás en HTTPS, usa secure: true
          })
        )
        .forRoutes('*');  // Aplica este middleware a todas las rutas
    }
}
