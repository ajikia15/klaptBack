import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaptopsModule } from './laptops/laptops.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laptop } from './laptops/laptop.entity';
import { User } from './users/user.entity';
import { CurrentUserMiddleware } from './users/middlewares/current-user.middleware';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    LaptopsModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Laptop, User],
      synchronize: true,
      // logging: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(cookieSession({ keys: ['asdfasdf'] })).forRoutes('*');
  }
}
