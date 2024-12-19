import { Injectable } from '@nestjs/common';
import { LaptopsRepository } from './laptops.repository';
@Injectable()
export class LaptopsService {
  constructor(public laptopsRepo: LaptopsRepository) {}

  findOne(id: string) {
    return this.laptopsRepo.findOne(id);
  }

  findAll() {
    return this.laptopsRepo.findAll();
  }
  create(title: string, price: number) {
    return this.laptopsRepo.create(title, price);
  }

  findByTerm(term: string) {
    return this.laptopsRepo.findByTerm(term);
  }
}
