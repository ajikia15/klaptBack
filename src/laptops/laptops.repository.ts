import { Injectable } from '@nestjs/common';
import { readFile, writeFile } from 'fs/promises';
import { LaptopT } from './dtos/LaptopT';
import { updateLaptopDto } from './dtos/update-laptop.dto';
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

  async remove(id: number) {
    const contents = await readFile('laptops.json', 'utf8');
    const laptops = JSON.parse(contents);
    delete laptops[id];
    await writeFile('laptops.json', JSON.stringify(laptops));
  }

  async update(id: number, body: updateLaptopDto) {
    const contents = await readFile('laptops.json', 'utf8');
    const laptops = JSON.parse(contents);

    laptops[id] = { ...laptops[id], ...body };

    await writeFile('laptops.json', JSON.stringify(laptops));
  }
}
