import './styles/main.css';
import { GarageAPI } from './api/garage';
import { Car } from './types';

// Тип для ответа от API
interface CarsResponse {
  data: Car[];
  total: number;
}

const app: HTMLDivElement | null = document.querySelector<HTMLDivElement>('#app');

async function init(): Promise<void> {
  if (app === null) return;
  
  app.innerHTML = `
    <h1>🚗 Async Race</h1>
    <p>Loading cars...</p>
  `;
  
  try {
    const carsResponse: CarsResponse = await GarageAPI.getInstance().getCars();
    
    app.innerHTML = `
      <h1>🚗 Async Race</h1>
      <p>Total cars: ${carsResponse.total}</p>
      <ul>
        ${carsResponse.data.map((car: Car): string => `<li style="color: ${car.color}">${car.name}</li>`).join('')}
      </ul>
    `;
  } catch (error: unknown) {
    console.error('Error loading cars:', error);
    
    app.innerHTML = `
      <h1>🚗 Async Race</h1>
      <p style="color: red;">⚠️ Server not running. Start the API server first.</p>
      <p>Run: cd async-race-api && npm start</p>
    `;
  }
}

document.addEventListener('DOMContentLoaded', (): void => {
  init();
});