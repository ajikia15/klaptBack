import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-core';

@Injectable()
export class ScrapService {
  async getCompetitorPrices() {
    const competitor = {
      name: 'alta',
      link: 'https://alta.ge/computers-and-office/pcs-notebooks-tablets/notebooks/msi-cyborg-15-9s7-15k111-1250-black.html',
    };

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.goto(competitor.link, { waitUntil: 'networkidle2' });

    // Extract the price using the exact class
    const price = await page.evaluate(() => {
      const priceElement = document.querySelector('.ty-price-num');
      return priceElement ? priceElement.textContent?.trim() : null;
    });

    await browser.close();
    return {
      name: competitor.name,
      price,
    };
  }
}
