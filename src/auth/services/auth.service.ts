import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import * as bcryptjs from 'bcryptjs';

import { LoginDto, RegisterUserDto, CreateUserDto, UpdateAuthDto } from '../dto';


import { User } from '../entities/user.entity';

import { JwtPayload } from '../interfaces/jwt-payload';
import { LoginResponse } from '../interfaces/login-response';

@Injectable()
export class AuthService {

  constructor(
    @InjectModel(User.name) 
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) 
  {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {
      const {password, ...userData} = createUserDto;
      const newUser = new this.userModel({
        password: bcryptjs.hashSync(password, 10),
        ...userData
      });

      await newUser.save();
      //Mandar el User sin ver la password
      const {password:_, ...user} = newUser.toJSON();

      return user;

    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error) {
        const mongoError = error as { code: number };
        console.log(mongoError.code);
    
        if (mongoError.code === 11000) {
          throw new BadRequestException(`${createUserDto.email} ya existe!`);
        }
      }
    
      throw new InternalServerErrorException('Algo terrible sucedió!');
    }
  }

  async register(registerUserDto: RegisterUserDto): Promise<LoginResponse> {

    const user = await this.create(registerUserDto);

    return{
      user: user,
      token: this.getJwtToken({id: user._id})
    } 
  }

  async login(loginDto: LoginDto):Promise<LoginResponse> {
    //Regresa usurario y el token de acceso
    console.log({loginDto})
    const {email, password} = loginDto;
    const user = await this.userModel.findOne({email});
    if(!user){
      throw new UnauthorizedException('Credenciales inválidas - email')
    }
    if(!bcryptjs.compareSync(password, user.password)){
      throw new UnauthorizedException('Credenciales inválidas - contraseña')
    }

    user.isConnected = true;
    await user.save();

    const {password:_, ...rest} = user.toJSON();

    return {
      user: rest,
      token: this.getJwtToken({id: user.id}),
    }
  }

  async disconnect(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new Error('Usuario no encontrado');
    }
    user.isConnected = false;
    return await user.save();
  }

  findAll(): Promise<User[]> {
    return this.userModel.find();
  }

  async findAllEmails(): Promise<string[]> {
    const users = await this.userModel.find().select('email');  
    return users.map(user => user.email);  
  }

  async findUserById(id: string){
    const user = await this.userModel.findById(id);
    const { password, ...rest} = user.toJSON();
    return rest;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  getJwtToken(payload: JwtPayload){
    const token = this.jwtService.sign(payload);
    return token;
  }

  async getUsersByConnectionStatus(): Promise<{ connected: User[]; disconnected: User[] }> {
    // Obtener todos los usuarios que están conectados (isConnected: true)
    const connectedUsers = await this.userModel.find({ isConnected: true }).exec();

    // Obtener todos los usuarios que están desconectados (isConnected: false)
    const disconnectedUsers = await this.userModel.find({ isConnected: false }).exec();

    return {
      connected: connectedUsers,
      disconnected: disconnectedUsers,
    };
  }

  async disconnectAllUsers(): Promise<any> {
    return this.userModel.updateMany({}, { $set: { isConnected: false } });
  }
}