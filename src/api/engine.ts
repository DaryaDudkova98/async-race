import { EngineStatus } from '../types';

const BASE_URL: string = 'http://127.0.0.1:3000';

// Тип для ответа drive
interface DriveResponse {
  success: boolean;
}

export class EngineAPI {
  private static instance: EngineAPI | null = null;
  
  private constructor() {}
  
  public static getInstance(): EngineAPI {
    if (EngineAPI.instance === null) {
      EngineAPI.instance = new EngineAPI();
    }
    return EngineAPI.instance;
  }
  
  public async startEngine(id: number): Promise<EngineStatus> {
    const response: Response = await fetch(`${BASE_URL}/engine?id=${id}&status=started`, {
      method: 'PATCH'
    });
    const data: EngineStatus = await response.json();
    return data;
  }
  
  public async stopEngine(id: number): Promise<EngineStatus> {
    const response: Response = await fetch(`${BASE_URL}/engine?id=${id}&status=stopped`, {
      method: 'PATCH'
    });
    const data: EngineStatus = await response.json();
    return data;
  }
  
  public async drive(id: number): Promise<DriveResponse> {
    try {
      const response: Response = await fetch(`${BASE_URL}/engine?id=${id}&status=drive`, {
        method: 'PATCH'
      });
      
      if (response.status === 500) {
        return { success: false };
      }
      
      return { success: true };
    } catch (error: unknown) {
      console.error(`Drive error for car ${id}:`, error);
      return { success: false };
    }
  }
}