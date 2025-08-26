
import React, { useState, useMemo } from 'react';
import * as Apollo from '@apollo/client';
const { useQuery } = Apollo;
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, Search, TrendingUp, AlertTriangle } from 'lucide-react';
import { GET_PRODUCTS, GET_WAREHOUSES, GET_KPIS } from '@/graphql/queries';
import { ProductDrawer } from './ProductDrawer';

type DateRange = '7d' | '14d' | '30d';
type ProductStatus = 'All' | 'Healthy' | 'Low' | 'Critical';

interface Product {
  id: string;
  name: string;
  sku: string;
  warehouse: string;
  stock: number;
  demand: number;
}

interface Warehouse {
  code: string;
  name: string;
  city: string;
  country: string;
}

interface KPI {
  date: string;
  stock: number;
  demand: number;
}

const getProductStatus = (product: Product): 'Healthy' | 'Low' | 'Critical' => {
  if (product.stock > product.demand) return 'Healthy';
  if (product.stock === product.demand) return 'Low';
  return 'Critical';
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Healthy': return 'bg-status-healthy-bg text-status-healthy border-status-healthy/20';
    case 'Low': return 'bg-status-low-bg text-status-low border-status-low/20';
    case 'Critical': return 'bg-status-critical-bg text-status-critical border-status-critical/20';
    default: return 'bg-muted text-muted-foreground';
  }
};

export const SupplySightDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const itemsPerPage = 10;

  // GraphQL queries
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery(GET_PRODUCTS, {
    variables: {
      search: searchQuery || undefined,
      status: selectedStatus === 'All' ? undefined : selectedStatus.toLowerCase(),
      warehouse: selectedWarehouse === 'all' ? undefined : selectedWarehouse,
    },
  });

  const { data: warehousesData } = useQuery(GET_WAREHOUSES);
  const { data: kpisData } = useQuery(GET_KPIS, {
    variables: { range: dateRange },
  });

  const products: Product[] = productsData?.products || [];
  const warehouses: Warehouse[] = warehousesData?.warehouses || [];
  const kpiData: KPI[] = kpisData?.kpis || [];

  // Filter products for status (client-side filtering since GraphQL handles other filters)
  const filteredProducts = useMemo(() => {
    if (selectedStatus === 'All') return products;
    
    return products.filter(product => {
      const status = getProductStatus(product);
      return status === selectedStatus;
    });
  }, [products, selectedStatus]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
    const totalDemand = products.reduce((sum, p) => sum + p.demand, 0);
    const totalFulfilled = products.reduce((sum, p) => sum + Math.min(p.stock, p.demand), 0);
    const fillRate = totalDemand > 0 ? (totalFulfilled / totalDemand) * 100 : 0;

    return {
      totalStock,
      totalDemand,
      fillRate: Math.round(fillRate * 10) / 10
    };
  }, [products]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-dashboard">
      {/* Top Bar */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">SupplySight</h1>
          </div>
          <div className="flex gap-2">
            {(['7d', '14d', '30d'] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(range)}
                className="font-medium"
              >
                {range}
              </Button>
            ))}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-kpi-card border-kpi-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Stock</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpis.totalStock.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Units across all warehouses</p>
            </CardContent>
          </Card>

          <Card className="bg-kpi-card border-kpi-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Demand</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpis.totalDemand.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">Current demand forecast</p>
            </CardContent>
          </Card>

          <Card className="bg-kpi-card border-kpi-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Fill Rate</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{kpis.fillRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Demand fulfillment rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Stock vs Demand Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpiData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                    formatter={(value: number, name: string) => [value.toLocaleString(), name === 'stock' ? 'Stock' : 'Demand']}
                  />
                  <Line type="monotone" dataKey="stock" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="demand" stroke="hsl(var(--accent))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-foreground">Inventory Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search by name, SKU, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <Select value={selectedWarehouse} onValueChange={setSelectedWarehouse}>
                <SelectTrigger className="w-full sm:w-48 bg-background">
                  <SelectValue placeholder="Select warehouse" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Warehouses</SelectItem>
                  {warehouses.map((warehouse) => (
                    <SelectItem key={warehouse.code} value={warehouse.code}>
                      {warehouse.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ProductStatus)}>
                <SelectTrigger className="w-full sm:w-40 bg-background">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Healthy">Healthy</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Products Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="text-left p-4 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">SKU</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Warehouse</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Stock</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Demand</th>
                      <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productsLoading ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-muted-foreground">
                          Loading products...
                        </td>
                      </tr>
                    ) : (
                      paginatedProducts.map((product) => {
                        const status = getProductStatus(product);
                        const isCritical = status === 'Critical';
                        return (
                          <tr
                            key={product.id}
                            className={`border-t border-border hover:bg-muted/20 cursor-pointer transition-colors ${
                              isCritical ? 'bg-status-critical-row' : 'bg-background'
                            }`}
                            onClick={() => handleProductClick(product)}
                          >
                            <td className="p-4">
                              <div>
                                <div className="font-medium text-foreground">{product.name}</div>
                                <div className="text-sm text-muted-foreground">{product.id}</div>
                              </div>
                            </td>
                            <td className="p-4 text-foreground font-mono text-sm">{product.sku}</td>
                            <td className="p-4 text-foreground">{product.warehouse}</td>
                            <td className="p-4 text-foreground font-medium">{product.stock.toLocaleString()}</td>
                            <td className="p-4 text-foreground font-medium">{product.demand.toLocaleString()}</td>
                            <td className="p-4">
                              <Badge className={`${getStatusColor(status)} border`}>
                                {status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      {/* Product Drawer */}
      <ProductDrawer
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProductUpdate={() => {
          refetchProducts();
          setSelectedProduct(null);
        }}
      />
    </div>
  );
};
