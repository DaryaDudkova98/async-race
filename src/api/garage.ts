import { Car } from '../types';

const BASE_URL: string = 'http://127.0.0.1:3000';

// Тип для ответа с пагинацией
interface CarsResponse {
  data: Car[];
  total: number;
}

export class GarageAPI {
  private static instance: GarageAPI | null = null;
  
  private constructor() {}
  
  public static getInstance(): GarageAPI {
    if (GarageAPI.instance === null) {
      GarageAPI.instance = new GarageAPI();
    }
    return GarageAPI.instance;
  }
  
  public async getCars(page: number = 1): Promise<CarsResponse> {
    const response: Response = await fetch(`${BASE_URL}/garage?_page=${page}&_limit=7`);
    
    const totalHeader: string | null = response.headers.get('X-Total-Count');
    const total: number = totalHeader !== null ? Number(totalHeader) : 0;
    
    const data: Car[] = await response.json();
    return { data, total };
  }
  
  public async createCar(name: string, color: string): Promise<Car> {
    const response: Response = await fetch(`${BASE_URL}/garage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });
    const data: Car = await response.json();
    return data;
  }
  
  public async updateCar(id: number, name: string, color: string): Promise<Car> {
    const response: Response = await fetch(`${BASE_URL}/garage/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color })
    });
    const data: Car = await response.json();
    return data;
  }
  
  public async deleteCar(id: number): Promise<void> {
    const response: Response = await fetch(`${BASE_URL}/garage/${id}`, { 
      method: 'DELETE' 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete car with id ${id}: ${response.status}`);
    }
  }
}