export interface FilterOptions {
  brands: { value: string; disabled: boolean }[];
  gpuModels: { value: string; disabled: boolean }[];
  processorModels: { value: string; disabled: boolean }[];
  ramTypes: { value: string; disabled: boolean }[];
  ram: { value: string; disabled: boolean }[];
  storageTypes: { value: string; disabled: boolean }[];
  storageCapacity: { value: string; disabled: boolean }[];
  stockStatuses: { value: string; disabled: boolean }[];
  screenSizes: { value: string; disabled: boolean }[];
  screenResolutions: { value: string; disabled: boolean }[];
  processorBrands: { value: string; disabled: boolean }[];
  gpuBrands: { value: string; disabled: boolean }[];
  graphicsTypes: { value: string; disabled: boolean }[];
  backlightTypes: { value: string; disabled: boolean }[];
  refreshRates: { value: string; disabled: boolean }[];
  conditions: { value: string; disabled: boolean }[];
  tags: { value: string; disabled: boolean }[];
  vram: { value: string; disabled: boolean }[];
  years: { value: string; disabled: boolean }[];
  models: { value: string; disabled: boolean }[];
  priceRange: {
    min: number;
    max: number;
  };
}
