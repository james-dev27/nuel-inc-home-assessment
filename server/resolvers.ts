import { warehouses, products, kpiData7d, kpiData14d, kpiData30d } from './data';
import type { Product } from './data';

// In-memory data store (in production, this would be a database)
let productsData = [...products];

export const resolvers = {
  Query: {
    warehouses: () => warehouses,
    
    products: (_: any, { search, status, warehouse }: { search?: string; status?: string; warehouse?: string }) => {
      let filteredProducts = productsData;

      // Filter by warehouse
      if (warehouse && warehouse !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.warehouse === warehouse);
      }

      // Filter by search (name, SKU, or ID)
      if (search) {
        const searchLower = search.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(searchLower) ||
          p.sku.toLowerCase().includes(searchLower) ||
          p.id.toLowerCase().includes(searchLower)
        );
      }

      // Filter by status
      if (status && status !== 'all') {
        filteredProducts = filteredProducts.filter(p => {
          const productStatus = p.stock > p.demand ? 'healthy' : 
                               p.stock === p.demand ? 'low' : 'critical';
          return productStatus === status.toLowerCase();
        });
      }

      return filteredProducts;
    },

    kpis: (_: any, { range }: { range: string }) => {
      switch (range) {
        case '7d':
          return kpiData7d;
        case '14d':
          return kpiData14d;
        case '30d':
          return kpiData30d;
        default:
          return kpiData7d;
      }
    }
  },

  Mutation: {
    updateDemand: (_: any, { id, demand }: { id: string; demand: number }) => {
      const productIndex = productsData.findIndex(p => p.id === id);
      if (productIndex === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }

      productsData[productIndex] = {
        ...productsData[productIndex],
        demand
      };

      return productsData[productIndex];
    },

    transferStock: (_: any, { id, from, to, qty }: { id: string; from: string; to: string; qty: number }) => {
      const productIndex = productsData.findIndex(p => p.id === id);
      if (productIndex === -1) {
        throw new Error(`Product with ID ${id} not found`);
      }

      const product = productsData[productIndex];
      if (product.warehouse !== from) {
        throw new Error(`Product is not in warehouse ${from}`);
      }

      if (product.stock < qty) {
        throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${qty}`);
      }

      // Update the current product's stock
      productsData[productIndex] = {
        ...product,
        stock: product.stock - qty
      };

      // In a real implementation, you would create a new product entry in the destination warehouse
      // or update an existing one. For this demo, we'll just reduce the stock from the source.

      return productsData[productIndex];
    }
  }
};