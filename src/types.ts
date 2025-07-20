// Define a Rating object with rate and count properties
export interface Rating {
  rate: number;    
  count: number;   
}

// Define the Product object structure with key properties and optional fields
export interface Product {
  id: string;               
  title: string;            
  price: number;            
  description?: string;    
  category: string;         
  image: string;           
  rating?: Rating;          
  createdBy?: string;      
  averageRating?: number;   
  reviewCount?: number;     
}