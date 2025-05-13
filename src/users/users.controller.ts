import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  NotFoundException,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UsersService } from './users.service';
import { UserDto } from './dtos/user.dto';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { AuthGuard } from 'src/guards/auth.guard';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Controller('auth')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private authService: AuthService,
  ) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto) {
    const user = await this.authService.signup(
      body.email,
      body.password,
      body.username,
    );
    const token = await this.authService.generateJwt(user);
    return { user, token };
  }

  @Post('/signin')
  async signIn(@Body() body: any) {
    const user = await this.authService.signin(body.email, body.password);
    const token = await this.authService.generateJwt(user);
    return { user, token };
  }

  @Post('/signout')
  signOut() {
    // No-op for JWT, client should just delete the token
    return { message: 'Signed out' };
  }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  @Serialize(UserDto)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Get('/google')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuth() {
    // Redirects to Google
  }

  @Get('/google/callback')
  @UseGuards(PassportAuthGuard('google'))
  async googleAuthRedirect(@Req() req, @Res() res) {
    const token = await this.authService.generateJwt(req.user);
    console.log('gay');
    // For SPA: you may want to redirect with token in query, or just return JSON
    return res.json({ user: req.user, token });
  }

  @Get('/:id')
  @Serialize(UserDto)
  async findUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return user;
  }

  @Get()
  @Serialize(UserDto)
  findAllUsers(@Query('email') email: string) {
    return this.usersService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.usersService.remove(parseInt(id));
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.usersService.update(parseInt(id), body);
  }

  @Patch('/:id/role')
  async makeAdmin(@Param('id') id: string, @Body() body: UpdateRoleDto) {
    return this.usersService.update(parseInt(id), body);
  }
}
