import * as Apollo from '@apollo/client';
const { gql } = Apollo;

export const GET_PRODUCTS = gql`
  query GetProducts($search: String, $status: String, $warehouse: String) {
    products(search: $search, status: $status, warehouse: $warehouse) {
      id
      name
      sku
      warehouse
      stock
      demand
    }
  }
`;

export const GET_WAREHOUSES = gql`
  query GetWarehouses {
    warehouses {
      code
      name
      city
      country
    }
  }
`;

export const GET_KPIS = gql`
  query GetKPIs($range: String!) {
    kpis(range: $range) {
      date
      stock
      demand
    }
  }
`;

export const UPDATE_DEMAND = gql`
  mutation UpdateDemand($id: ID!, $demand: Int!) {
    updateDemand(id: $id, demand: $demand) {
      id
      name
      sku
      warehouse
      stock
      demand
    }
  }
`;

export const TRANSFER_STOCK = gql`
  mutation TransferStock($id: ID!, $from: String!, $to: String!, $qty: Int!) {
    transferStock(id: $id, from: $from, to: $to, qty: $qty) {
      id
      name
      sku
      warehouse
      stock
      demand
    }
  }
`;