import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private repo: Repository<User>) {}

  create(email: string, username: string, password: string) {
    const user = this.repo.create({ email, username, password });

    return this.repo.save(user);
  }

  findOne(id: number) {
    if (!id) {
      return null;
    }
    return this.repo.findOneBy({ id });
  }

  find(email: string) {
    return this.repo.find({ where: { email } });
  }

  async update(id: number, attrs: Partial<User>) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    Object.assign(user, attrs);
    return this.repo.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return this.repo.remove(user);
  }

  async findOrCreateGoogleUser(profile: any) {
    const email = profile.emails[0].value;
    let user = (await this.repo.find({ where: { email } }))[0];
    if (!user) {
      user = this.repo.create({
        email,
        username: profile.displayName || email,
        password: '', // No password for Google users
      });
      user = await this.repo.save(user);
    }
    return user;
  }
}
