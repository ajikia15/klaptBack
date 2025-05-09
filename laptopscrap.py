from pydantic import BaseModel
from typing import List, Callable, Dict
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
import time

class LaptopRequest(BaseModel):
    laptoplink: str
    company: str
    isExactMatch: bool

class LaptopResponse(LaptopRequest):
    price: int

def get_price_alta(driver: webdriver.Chrome) -> int:
    """Extract price from alta.ge product page."""
    try:
        price_elem = driver.find_element(By.CLASS_NAME, "ty-price-num")
        return int(price_elem.text.replace(" ", "").replace(",", ""))
    except Exception:
        return 0

def get_price_zoommer(driver: webdriver.Chrome) -> int:
    """Extract price from zoommer.ge product page."""
    try:
        price_elem = driver.find_element(By.CSS_SELECTOR, "h4.sc-a6289b29-6")
        price_text = ''.join(filter(str.isdigit, price_elem.text))
        return int(price_text) if price_text else 0
    except Exception:
        return 0

def get_price_gaming_laptops(driver: webdriver.Chrome) -> int:
    """Extract price from gaming-laptops.ge product page."""
    try:
        price_elem = driver.find_element(By.CSS_SELECTOR, "span.woocommerce-Price-amount.amount bdi")
        price_text = price_elem.text.split()[0].replace(",", "")  # Remove comma and currency
        return int(price_text)
    except Exception:
        return 0

def get_price_ee(driver: webdriver.Chrome) -> int:
    """Extract price from ee.ge product page."""
    try:
        price_elem = driver.find_element(By.CSS_SELECTOR, "span.realPriceSectione")
        price_text = ''.join(c for c in price_elem.text if c.isdigit() or c == '.')
        return int(float(price_text)) if price_text else 0
    except Exception:
        return 0

def get_price_veli(driver: webdriver.Chrome) -> int:
    """Extract price from veli.store product page."""
    try:
        price_elem = driver.find_element(By.CSS_SELECTOR, "h3.price")
        price_text = ''.join(c for c in price_elem.text if c.isdigit() or c == '.')
        return int(float(price_text)) if price_text else 0
    except Exception:
        return 0

# Map company to extraction function
PRICE_EXTRACTORS: Dict[str, Callable[[webdriver.Chrome], int]] = {
    "alta": get_price_alta,
    "zoommer": get_price_zoommer,
    "gaming-laptops": get_price_gaming_laptops,
    "ee": get_price_ee,
    "veli": get_price_veli,
}

def get_price_from_link(link: str, company: str) -> int:
    """Launch Selenium, open link, and extract price using the company extractor."""
    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--window-size=1920,1080")
    options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36")
    driver = webdriver.Chrome(options=options)
    try:
        driver.get(link)
        time.sleep(5)  # Wait for JS to render
        extractor = PRICE_EXTRACTORS.get(company)
        if extractor:
            return extractor(driver)
        return 0
    except Exception:
        return 0
    finally:
        driver.quit()

def get_prices(laptops: List[LaptopRequest]) -> List[LaptopResponse]:
    """Process a list of LaptopRequest and return LaptopResponse with prices."""
    results = []
    for laptop in laptops:
        price = get_price_from_link(laptop.laptoplink, laptop.company)
        results.append(LaptopResponse(**laptop.model_dump(), price=price))
    return results

if __name__ == "__main__":
    # Example usage for local testing
    laptops = [
        LaptopRequest(
            laptoplink="https://alta.ge/computers-and-office/pcs-notebooks-tablets/notebooks/msi-cyborg-15-9s7-15k111-1250-black.html",
            company="alta",
            isExactMatch=True
        ),
        LaptopRequest(
            laptoplink="https://zoommer.ge/leptopebi/msi-cyborg-9s7-15k111-610-intel-core-i5-13420h-octa-4-6-ghz-nvidia-geforce-rtx-p38050",
            company="zoommer",
            isExactMatch=True
        ),
        LaptopRequest(
            laptoplink="https://ee.ge/kompiuteruli-teqnika/leptopi/leptopi-msi-bravo-15-c7udx-9s7-158n11-075",
            company="ee",
            isExactMatch=True
        ),
        LaptopRequest(
            laptoplink="https://veli.store/details/msi-thin-15-b12uc-alder-lake-i5-12450h-16-gb-512-gb-geforce-rtx-3050-4-gb-156-laptop-black/?sku=4711377277679",
            company="veli",
            isExactMatch=True
        )
    ]
    results = get_prices(laptops)
    for r in results:
        print(r)