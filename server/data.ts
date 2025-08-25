// Data types
export interface Warehouse {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  warehouse: string;
  stock: number;
  demand: number;
}

export interface KPI {
  date: string;
  stock: number;
  demand: number;
}

// Mock data
export const warehouses: Warehouse[] = [
  { code: "BLR-A", name: "Bangalore Warehouse A", city: "Bangalore", country: "India" },
  { code: "PNQ-C", name: "Pune Warehouse C", city: "Pune", country: "India" },
  { code: "DEL-B", name: "Delhi Warehouse B", city: "Delhi", country: "India" },
  { code: "MUM-D", name: "Mumbai Warehouse D", city: "Mumbai", country: "India" },
];

export const products: Product[] = [
  { id: "P-1001", name: "12mm Hex Bolt", sku: "HEX-12-100", warehouse: "BLR-A", stock: 180, demand: 120 },
  { id: "P-1002", name: "Steel Washer", sku: "WSR-08-500", warehouse: "BLR-A", stock: 50, demand: 80 },
  { id: "P-1003", name: "M8 Nut", sku: "NUT-08-200", warehouse: "PNQ-C", stock: 80, demand: 80 },
  { id: "P-1004", name: "Bearing 608ZZ", sku: "BRG-608-50", warehouse: "DEL-B", stock: 24, demand: 120 },
  { id: "P-1005", name: "Allen Key 6mm", sku: "ALN-06-25", warehouse: "MUM-D", stock: 200, demand: 150 },
  { id: "P-1006", name: "Spring Steel Strip", sku: "SPR-12-100", warehouse: "BLR-A", stock: 30, demand: 45 },
  { id: "P-1007", name: "O-Ring 25mm", sku: "ORG-25-200", warehouse: "PNQ-C", stock: 150, demand: 100 },
  { id: "P-1008", name: "Copper Wire 2.5mm", sku: "CWR-25-500", warehouse: "DEL-B", stock: 75, demand: 90 },
  { id: "P-1009", name: "Rubber Gasket", sku: "RGS-40-150", warehouse: "MUM-D", stock: 100, demand: 100 },
  { id: "P-1010", name: "Stainless Bolt M10", sku: "SSB-10-200", warehouse: "BLR-A", stock: 45, demand: 200 },
];

// Generate KPI data for different time ranges
const generateKPIData = (days: number): KPI[] => {
  const data: KPI[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate varying stock and demand over time
    const baseStock = 850;
    const baseDemand = 700;
    const variation = Math.sin(i / 5) * 100;
    const randomFactor = (Math.random() - 0.5) * 50;
    
    data.push({
      date: date.toISOString().split('T')[0],
      stock: Math.round(baseStock + variation + randomFactor),
      demand: Math.round(baseDemand + variation * 0.8 + randomFactor * 0.7)
    });
  }
  
  return data;
};

export const kpiData7d = generateKPIData(7);
export const kpiData14d = generateKPIData(14);
export const kpiData30d = generateKPIData(30);