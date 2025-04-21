import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LaptopsModule } from './laptops/laptops.module';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Laptop } from './laptops/laptop.entity';
import { User } from './users/user.entity';
import { CurrentUserMiddleware } from './users/middlewares/current-user.middleware';
import { FavoritesModule } from './favorites/favorites.module';
import { Favorite } from './favorites/favorite.entity';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    LaptopsModule,
    UsersModule,
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db.sqlite',
      entities: [Laptop, User, Favorite],
      synchronize: true,
      // logging: true,
    }),
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cookieSession({
          keys: ['asdfasdf'],
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        }),
      )
      .forRoutes('*');
  }
}
