import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

import * as session from 'express-session';

import { join } from 'path';

import { AuthService } from './auth/services/auth.service';

import { AppModule } from './app.module';

async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /*
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    })
  );

  await app.listen(3000);
  */
 
  console.log(`
    :::   :::           :::        :::::::::::       ::::    :::            :::::::::::       ::::::::
  :+:+: :+:+:        :+: :+:          :+:           :+:+:   :+:                :+:          :+:    :+:
+:+ +:+:+ +:+      +:+   +:+         +:+           :+:+:+  +:+                +:+          +:+
+#+  +:+  +#+     +#++:++#++:        +#+           +#+ +:+ +#+                +#+          +#++:++#++
+#+       +#+     +#+     +#+        +#+           +#+  +#+#+#                +#+                 +#+
#+#       #+#     #+#     #+#        #+#           #+#   #+#+#       #+#      #+#          #+#    #+#
###       ###     ###     ###    ###########       ###    ####       ###      ###           ########
`);

  const authService = app.get(AuthService);
  try {
    await authService.disconnectAllUsers();
    console.log('Todos los usuarios han sido desconectados');

    const users = await authService.findAllEmails();
    console.log("USUARIOS:");
    console.log(users);

  } catch (error) {
    console.error('Error al obtener los usuarios:', error);
  }

  app.use(
    session({
      secret: 'my-secret',
      resave: false,
      saveUninitialized: false,
    }),
  );
  
  // Aquí configuras la carpeta pública
  app.useStaticAssets(join(__dirname, '..', 'publicHtml'));
  
  await app.listen(3000);
}
bootstrap();
