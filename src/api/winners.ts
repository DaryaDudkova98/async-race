import { Winner } from '../types';

const BASE_URL: string = 'http://127.0.0.1:3000';

// Тип для ответа с пагинацией
interface WinnersResponse {
  data: Winner[];
  total: number;
}

export class WinnersAPI {
  private static instance: WinnersAPI | null = null;
  
  private constructor() {}
  
  public static getInstance(): WinnersAPI {
    if (WinnersAPI.instance === null) {
      WinnersAPI.instance = new WinnersAPI();
    }
    return WinnersAPI.instance;
  }
  
  public async getWinners(page: number = 1): Promise<WinnersResponse> {
    const response: Response = await fetch(`${BASE_URL}/winners?_page=${page}&_limit=10`);
    
    const totalHeader: string | null = response.headers.get('X-Total-Count');
    const total: number = totalHeader !== null ? Number(totalHeader) : 0;
    
    const data: Winner[] = await response.json();
    return { data, total };
  }

  public async getAllWinners(): Promise<Winner[]> {
    const response: Response = await fetch(`${BASE_URL}/winners`);
    const data: Winner[] = await response.json();
    return data;
  }
  
  public async addWinner(id: number, wins: number, time: number): Promise<Winner> {
    const response: Response = await fetch(`${BASE_URL}/winners`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, wins, time })
    });
    const data: Winner = await response.json();
    return data;
  }
  
  public async updateWinner(id: number, wins: number, time: number): Promise<Winner> {
    const response: Response = await fetch(`${BASE_URL}/winners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ wins, time })
    });
    const data: Winner = await response.json();
    return data;
  }
  
  public async deleteWinner(id: number): Promise<void> {
    const response: Response = await fetch(`${BASE_URL}/winners/${id}`, { 
      method: 'DELETE' 
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete winner with id ${id}: ${response.status}`);
    }
  }
}