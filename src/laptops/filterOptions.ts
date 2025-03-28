export interface FilterOptions {
  brands: string[];
  gpuModels: string[];
  processorModels: string[];
  ramTypes: string[];
  ram: string[];
  storageTypes: string[];
  storageCapacity: string[];
  stockStatuses: string[];
  screenSizes: string[];
  screenResolutions: string[];
  priceRange: {
    min: number;
    max: number;
  };
}
