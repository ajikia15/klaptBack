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
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    LaptopsModule,
    UsersModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'sqlite',
        database: config.get<string>('DB_NAME'),
        synchronize: true,
        entities: [Laptop, User, Favorite],
        // logging: true,
      }),
    }),
    // TypeOrmModule.forRoot({
    //   type: 'sqlite',
    //   database: 'db.sqlite',
    //   entities: [Laptop, User, Favorite],
    //   synchronize: true,
    //   // logging: true,
    // }),
    FavoritesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {}
}
