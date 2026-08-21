export type Product = {
  name: string;
  asset: string;
  accent: string;
  category: string;
};

export type PriceCard = {
  product: string;
  country: 'Croatia' | 'Serbia' | 'Slovenia';
  flag: string;
  price: string;
  unit: string;
  source: string;
  period: string;
  asset: string;
  accent: string;
};

export const products: Product[] = [
  {
    name: 'Potatoes',
    asset: 'live/product-potato.png',
    accent: '#E7D3A6',
    category: 'Root vegetables',
  },
  {
    name: 'Tomatoes',
    asset: 'live/product-tomato.png',
    accent: '#F2A58E',
    category: 'Fruiting vegetables',
  },
  {
    name: 'Cucumbers',
    asset: 'live/product-cucumber.png',
    accent: '#A9CE9D',
    category: 'Cucurbit vegetables',
  },
  {
    name: 'Raw cow milk',
    asset: 'live/product-raw-cow-milk.png',
    accent: '#C9D8E5',
    category: 'Fluid milk',
  },
];

export const priceCards: PriceCard[] = [
  {
    product: 'Potatoes',
    country: 'Croatia',
    flag: '🇭🇷',
    price: 'EUR 0.34',
    unit: '/ 1 kg',
    source: 'DZS Agricultural Prices',
    period: 'Latest published · 2025',
    asset: 'live/product-potato.png',
    accent: '#E7D3A6',
  },
  {
    product: 'Tomatoes',
    country: 'Serbia',
    flag: '🇷🇸',
    price: 'RSD 139.99',
    unit: '/ 1 kg',
    source: 'SORS CN30 retail prices',
    period: 'Latest through Jul 21, 2026',
    asset: 'live/product-tomato.png',
    accent: '#F2A58E',
  },
  {
    product: 'Tomatoes',
    country: 'Slovenia',
    flag: '🇸🇮',
    price: 'EUR 2.65',
    unit: '/ 1 kg',
    source: 'SURS SiStat',
    period: 'Latest published · 2025',
    asset: 'live/product-tomato.png',
    accent: '#F2A58E',
  },
  {
    product: 'Cucumbers',
    country: 'Croatia',
    flag: '🇭🇷',
    price: 'EUR 0.67',
    unit: '/ 1 kg',
    source: 'DZS Agricultural Prices',
    period: 'Latest published · 2025',
    asset: 'live/product-cucumber.png',
    accent: '#A9CE9D',
  },
  {
    product: 'Cucumbers',
    country: 'Serbia',
    flag: '🇷🇸',
    price: 'RSD 100.00',
    unit: '/ 1 kg',
    source: 'SORS CN30 retail prices',
    period: 'Latest through Jul 21, 2026',
    asset: 'live/product-cucumber.png',
    accent: '#A9CE9D',
  },
  {
    product: 'Raw cow milk',
    country: 'Slovenia',
    flag: '🇸🇮',
    price: 'EUR 0.50',
    unit: '/ 1 l',
    source: 'SURS SiStat',
    period: 'Latest published · 2025',
    asset: 'live/product-raw-cow-milk.png',
    accent: '#C9D8E5',
  },
];

export const sourceCards = [
  {
    flag: '🇭🇷',
    country: 'Croatia',
    abbreviation: 'DZS',
    fullName: 'Croatian Bureau of Statistics',
    dataset: 'DZS Agricultural Prices',
  },
  {
    flag: '🇷🇸',
    country: 'Serbia',
    abbreviation: 'SORS',
    fullName: 'Statistical Office of the Republic of Serbia',
    dataset: 'SORS CN30 retail prices',
  },
  {
    flag: '🇸🇮',
    country: 'Slovenia',
    abbreviation: 'SURS',
    fullName: 'Statistical Office of the Republic of Slovenia',
    dataset: 'SURS SiStat',
  },
] as const;
