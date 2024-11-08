import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res, Req } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { readFileSync } from 'fs';
import { join } from 'path';
import { Response, Request as ReqExpress } from 'express';

import { CreateUserDto, LoginDto, UpdateAuthDto, RegisterUserDto } from './dto';
import { AuthGuard } from './guards/auth.guard';
import { LoginResponse } from './interfaces/login-response';
import { User } from './entities/user.entity';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('/login')
  async login( @Body() loginDto: LoginDto, @Request() req: ReqExpress, @Res() res: Response){
    const loginResponse = await this.authService.login(loginDto);
    
    req.session.nombreUsuario = loginResponse.user.name; 
    req.session.emailUsuario = loginResponse.user.email;
    console.log('Usuario logueado: ' + req.session.nombreUsuario + ' -> ' + req.session.emailUsuario + ' en sesión');

    res.redirect('/auth/profile');

    return loginResponse;
  }

  @Get()
  async getPageLogin(@Res() res: Response) {
    const users = await this.authService.findAll();

    res.sendFile(join(__dirname, '../../', 'publicHtml', 'login.html'));

    let html = readFileSync(join(__dirname, '../../', 'publicHtml', 'login.html'), 'utf8');

    const userListHtml = users.map(user => `<li>${user.name} - ${user.email}</li>`).join('');
    html = html.replace('<!--USER_LIST-->', `<ul class="m-0">${userListHtml}</ul>`);

    res.send(html);
  }

  @Post('register')
  async register(
    @Body() registerUserDto: RegisterUserDto, 
    @Request() req: ReqExpress, 
    @Res() res: Response) {

    const userConnected = {
      ...registerUserDto,
      isConnected: true
    };

    await this.authService.register(userConnected);

    // Guardar el Usuario en Session
    req.session.nombreUsuario = registerUserDto.name;
    req.session.emailUsuario = registerUserDto.email;
    console.log('Usuario registrado: ' + req.session.nombreUsuario + ' -> ' + req.session.emailUsuario + ' en sesión');

    res.redirect('/auth/profile');
  }

  @Get('register')
  async getPageRegister(@Res() res: Response) {
    res.sendFile(join(__dirname, '../../', 'publicHtml', 'register.html'));
  }

  @Get('profile')
  async getPageProfile(@Res() res: Response, @Request() req: ReqExpress) {
    let html = readFileSync(join(__dirname, '../../publicHtml', 'homeUser', 'profile.html'), 'utf8');
   
    const nombreUsuario = req.session.nombreUsuario;
    html = html.replace('<!--USER_NAME-->', `<span class="nombreUsuario">${nombreUsuario}</span>`);

    const { connected, disconnected } = await this.authService.getUsersByConnectionStatus();
    const userConnectedListHtml = connected.map(user => `<li>${user.name} - ${user.email}</li>`).join('');
    const userDisconnectedListHtml = disconnected.map(user => `<li>${user.name} - ${user.email}</li>`).join('');
    html = html.replace('<!--USER_CONNECTED_LIST-->', `<ul class="text-success m-0">${userConnectedListHtml}</ul>`);
    html = html.replace('<!--USER_DISCONNECTED_LIST-->', `<ul class="opacity-25 m-0">${userDisconnectedListHtml}</ul>`);

    res.send(html);
  }

  @Post('/desconectar')
  async disconnectUser(@Request() req: ReqExpress, @Res() res: Response) {
    // 1. Obtener el email del usuario desde la sesión
    const emailUsuario = req.session.emailUsuario;
    if (!emailUsuario) {
      console.log('No se encontró ese email de usuario en sesion');
      return 'No se encontró ese email de usuario en sesion';
    }

    //Desconectar el usuario: Buscar por email y actualizar `isConnected` a `false`
    await this.authService.disconnect(emailUsuario);

    //Limpiar session
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send('No se pudo cerrar la sesión.');
      }
      res.sendFile(join(__dirname, '../../', 'publicHtml', 'index.html'));
    });
  }

  @UseGuards(AuthGuard)
  @Get('all')
  findAll( @Request() req: Request) {
    // const user = req['user'];
    // return user;

    return this.authService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get('check-token')
  checkToken( @Request() req: Request): LoginResponse {
    const user = req['user'] as User;
    return {
      user,
      token: this.authService.getJwtToken({id: user._id})
    }
  }

  /*
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
    */
}
