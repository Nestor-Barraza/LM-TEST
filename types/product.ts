export interface ProductInstallments {
  quantity: number;
  amount: number;
  rate?: number;
  currency_id: string;
}

export interface ProductShipping {
  free_shipping: boolean;
  mode?: string;
  logistic_type?: string;
  store_pick_up?: boolean;
}

export interface ProductReviews {
  rating_average: number;
  total: number;
}

export interface ProductPicture {
  id: string;
  url: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  value_name: string;
}

export interface ProductSellerAddress {
  city: {
    name: string;
  };
  state: {
    name: string;
  };
}

export interface ProductDescription {
  plain_text: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  original_price?: number;
  currency_id: string;
  condition: 'new' | 'used';
  thumbnail?: string;
  category?: string;
  installments?: ProductInstallments;
  shipping?: ProductShipping;
  reviews?: ProductReviews;
}

export interface ProductDetail extends Product {
  available_quantity?: number;
  sold_quantity?: number;
  permalink?: string;
  pictures?: ProductPicture[];
  seller_address?: ProductSellerAddress;
  attributes?: ProductAttribute[];
  warranty?: string;
  description?: ProductDescription;
}

export interface SearchPaging {
  total: number;
  offset: number;
  limit: number;
}

export interface SearchResponse {
  query: string;
  paging: SearchPaging;
  results: Product[];
}
