import { type Product } from "../types"; // Import the Product type from the types file

// Define CartItem interface extending Product by adding a quantity field
export interface CartItem extends Product {
  quantity: number;  
}