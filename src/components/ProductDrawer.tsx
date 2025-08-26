
import React, { useState } from 'react';
import * as Apollo from '@apollo/client';
const { useMutation, useQuery } = Apollo;
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, ArrowRightLeft, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { UPDATE_DEMAND, TRANSFER_STOCK, GET_WAREHOUSES } from '@/graphql/queries';

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

interface ProductDrawerProps {
  product: Product | null;
  onClose: () => void;
  onProductUpdate?: () => void;
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

export const ProductDrawer: React.FC<ProductDrawerProps> = ({ product, onClose, onProductUpdate }) => {
  const [newDemand, setNewDemand] = useState('');
  const [transferQuantity, setTransferQuantity] = useState('');
  const [targetWarehouse, setTargetWarehouse] = useState('');
  const { toast } = useToast();

  // GraphQL queries and mutations
  const { data: warehousesData } = useQuery(GET_WAREHOUSES);
  const [updateDemandMutation, { loading: updateDemandLoading }] = useMutation(UPDATE_DEMAND);
  const [transferStockMutation, { loading: transferStockLoading }] = useMutation(TRANSFER_STOCK);

  const warehouses: Warehouse[] = warehousesData?.warehouses || [];

  React.useEffect(() => {
    if (product) {
      setNewDemand(product.demand.toString());
      setTransferQuantity('');
      setTargetWarehouse('');
    }
  }, [product]);

  if (!product) return null;

  const status = getProductStatus(product);
  const currentWarehouse = warehouses.find(w => w.code === product.warehouse);
  const availableWarehouses = warehouses.filter(w => w.code !== product.warehouse);

  const handleUpdateDemand = async () => {
    const demand = parseInt(newDemand);
    if (isNaN(demand) || demand < 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid demand value.",
        variant: "destructive"
      });
      return;
    }

    try {
      await updateDemandMutation({
        variables: {
          id: product.id,
          demand: demand
        }
      });

      toast({
        title: "Demand Updated",
        description: `Demand for ${product.name} updated to ${demand} units.`,
      });
      
      onProductUpdate?.();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update demand. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTransferStock = async () => {
    const quantity = parseInt(transferQuantity);
    if (isNaN(quantity) || quantity <= 0 || quantity > product.stock) {
      toast({
        title: "Invalid Transfer",
        description: "Please enter a valid transfer quantity within available stock.",
        variant: "destructive"
      });
      return;
    }

    if (!targetWarehouse) {
      toast({
        title: "Select Warehouse",
        description: "Please select a target warehouse for the transfer.",
        variant: "destructive"
      });
      return;
    }

    try {
      await transferStockMutation({
        variables: {
          id: product.id,
          from: product.warehouse,
          to: targetWarehouse,
          qty: quantity
        }
      });

      toast({
        title: "Stock Transferred",
        description: `${quantity} units transferred from ${product.warehouse} to ${targetWarehouse}.`,
      });

      setTransferQuantity('');
      setTargetWarehouse('');
      onProductUpdate?.();
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: "Failed to transfer stock. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Sheet open={!!product} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg bg-card">
        <SheetHeader className="space-y-4">
          <SheetTitle className="flex items-center gap-3 text-xl">
            <Package className="h-6 w-6 text-primary" />
            Product Details
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Product Information */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{product.name}</h3>
              <p className="text-sm text-muted-foreground">{product.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">SKU</Label>
                <p className="font-mono mt-1">{product.sku}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge className={`${getStatusColor(status)} border`}>
                    {status}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Warehouse</Label>
              <p className="mt-1">{currentWarehouse?.name} ({product.warehouse})</p>
              <p className="text-sm text-muted-foreground">{currentWarehouse?.city}, {currentWarehouse?.country}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-muted-foreground">Current Stock</Label>
                </div>
                <p className="text-2xl font-bold text-foreground">{product.stock.toLocaleString()}</p>
              </div>
              <div className="bg-muted/20 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-muted-foreground">Current Demand</Label>
                </div>
                <p className="text-2xl font-bold text-foreground">{product.demand.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Update Demand Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Update Demand
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="demand">New Demand Forecast</Label>
                <Input
                  id="demand"
                  type="number"
                  value={newDemand}
                  onChange={(e) => setNewDemand(e.target.value)}
                  placeholder="Enter new demand"
                  min="0"
                  className="mt-1"
                />
              </div>
              <Button 
                onClick={handleUpdateDemand} 
                className="w-full"
                disabled={updateDemandLoading}
              >
                {updateDemandLoading ? 'Updating...' : 'Update Demand'}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Transfer Stock Form */}
          <div className="space-y-4">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4" />
              Transfer Stock
            </h4>
            <div className="space-y-3">
              <div>
                <Label htmlFor="quantity">Transfer Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  value={transferQuantity}
                  onChange={(e) => setTransferQuantity(e.target.value)}
                  placeholder="Enter quantity to transfer"
                  min="1"
                  max={product.stock}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Available: {product.stock.toLocaleString()} units
                </p>
              </div>
              <div>
                <Label htmlFor="warehouse">Target Warehouse</Label>
                <Select value={targetWarehouse} onValueChange={setTargetWarehouse}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select target warehouse" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWarehouses.map((warehouse) => (
                      <SelectItem key={warehouse.code} value={warehouse.code}>
                        {warehouse.name} ({warehouse.city})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleTransferStock} 
                variant="outline" 
                className="w-full"
                disabled={!transferQuantity || !targetWarehouse || transferStockLoading}
              >
                {transferStockLoading ? 'Transferring...' : 'Transfer Stock'}
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
