import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { LaptopT } from './dtos/LaptopT';
@Injectable()
export class LaptopsRepository {
  async findOne(id: string) {
    const contents = await readFile('laptops.json', 'utf8');
    const laptops = JSON.parse(contents);

    return laptops[id];
  }
  async findAll() {
    const contents = await readFile('laptops.json', 'utf8');
    const laptops = JSON.parse(contents);
    return laptops;
  }
  async create(title: string, price: number) {
    const contents = await readFile('laptops.json', 'utf8');
    const laptops = JSON.parse(contents);

    // generate random id
    const id = Math.floor(Math.random() * 999);

    laptops[id] = { id, title, price };

    await writeFile('laptops.json', JSON.stringify(laptops));
  }

  async findByTerm(term: string) {
    const contents = await readFile('laptops.json', 'utf8');
    const laptops = JSON.parse(contents);

    const result = Object.values(laptops).filter((laptop: LaptopT) =>
      laptop.title.toLowerCase().includes(term.toLowerCase()),
    );

    return result;
  }
}
