// src/components/WinnersView.ts
import { WinnersAPI } from '../api/winners';
import { Winner } from '../types';
import { CarService } from '../services/carService';
import { Car } from '../services/carService';

// Тип для событий с деталями
interface CarDeletedEventDetail {
  carId: number;
}

interface WinnerAddedEventDetail {
  carId: number;
  time: number;
}

export class WinnersView {
  private currentPage: number = 1;
  private itemsPerPage: number = 10;
  private winnersAPI: WinnersAPI;
  private sortBy: 'wins' | 'time' = 'wins';
  private sortOrder: 'ASC' | 'DESC' = 'DESC';
  private container: HTMLElement | null = null;
  private allWinners: Winner[] = [];

  constructor() {
    this.winnersAPI = WinnersAPI.getInstance();
    this.setupEventListeners();
    this.addStyles();
  }

  private addStyles(): void {
    const style: HTMLStyleElement = document.createElement('style');
    style.textContent = `
      /* Общие стили */
      .winners-view {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        min-height: 100vh;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      /* Заголовок */
      .winner-info-page {
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        color: #fff;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        margin-bottom: 25px;
        position: relative;
      }
      .winner-info-page span:first-child {
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(90deg, #ffd700, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      }
      .winner-info-page span:last-child {
        font-size: 18px;
        color: #888;
        background: rgba(255,255,255,0.05);
        padding: 5px 15px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
      }

      /* Контролы сортировки */
      .controls {
        display: flex;
        justify-content: flex-start;
        gap: 15px;
        padding: 20px;
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 25px;
        flex-wrap: wrap;
      }
      .sort-controls {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .sort-controls button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: white;
      }
      #sort-wins {
        background: ${this.sortBy === 'wins' ? 'linear-gradient(135deg, #ffd700, #f39c12)' : 'linear-gradient(135deg, #636e72, #2d3436)'};
        box-shadow: ${this.sortBy === 'wins' ? '0 4px 20px rgba(255, 215, 0, 0.3)' : 'none'};
      }
      #sort-wins:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(255, 215, 0, 0.4);
      }
      #sort-time {
        background: ${this.sortBy === 'time' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'linear-gradient(135deg, #636e72, #2d3436)'};
        box-shadow: ${this.sortBy === 'time' ? '0 4px 20px rgba(76, 175, 80, 0.3)' : 'none'};
      }
      #sort-time:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(76, 175, 80, 0.4);
      }

      /* Таблица */
      .winners-table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.05);
      }
      .winners-table thead {
        background: linear-gradient(135deg, #1a1a2e, #2d2d44);
      }
      .winners-table th {
        padding: 15px 12px;
        text-align: center;
        color: #fff;
        font-weight: 600;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 1px;
        border-bottom: 2px solid rgba(255, 215, 0, 0.2);
      }
      .winners-table td {
        padding: 12px;
        text-align: center;
        color: #fff;
        border-bottom: 1px solid rgba(255,255,255,0.05);
        transition: background 0.3s ease;
      }
      .winners-table tbody tr {
        transition: all 0.3s ease;
      }
      .winners-table tbody tr:hover {
        background: rgba(255,255,255,0.05);
        transform: scale(1.01);
      }
      .winners-table tbody tr:last-child td {
        border-bottom: none;
      }

      /* Номер */
      .winners-table td:first-child {
        color: #888;
        font-weight: 700;
        font-size: 16px;
      }

      /* Имя машины */
      .winners-table td:nth-child(3) {
        color: #ffcc41;
        font-weight: 600;
        font-size: 16px;
        text-align: left;
        padding-left: 20px;
      }

      /* Победы */
      .winners-table td:nth-child(4) {
        color: #ffd700;
        font-weight: 700;
        font-size: 18px;
      }

      /* Время */
      .winners-table td:last-child {
        color: #4caf50;
        font-weight: 700;
        font-size: 16px;
        font-family: 'Courier New', monospace;
      }

      /* Машина-иконка */
      .car-icon {
        display: inline-block;
        width: 44px;
        height: 44px;
        border-radius: 8px;
        transition: all 0.3s ease;
        filter: drop-shadow(0 2px 10px rgba(255, 215, 0, 0.2));
      }
      .car-icon:hover {
        transform: scale(1.15) rotate(-5deg);
        filter: drop-shadow(0 4px 20px rgba(255, 215, 0, 0.4));
      }

      /* Пагинация */
      .pagination {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        padding: 25px 0;
        color: #fff;
      }
      .pagination button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, #636e72, #2d3436);
        color: white;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .pagination button:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.4);
        background: linear-gradient(135deg, #ffd700, #f39c12);
      }
      .pagination button:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
      .pagination span {
        font-size: 16px;
        padding: 8px 20px;
        background: rgba(255,255,255,0.05);
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.05);
        color: #888;
      }

      /* Пустое состояние */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #555;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        border: 2px dashed rgba(255,255,255,0.05);
      }
      .empty-state .icon {
        font-size: 64px;
        display: block;
        margin-bottom: 15px;
      }
      .empty-state .title {
        font-size: 24px;
        font-weight: 600;
        color: #666;
        margin-bottom: 10px;
      }
      .empty-state .subtitle {
        font-size: 16px;
        color: #444;
      }

      /* Анимация появления строк */
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .winners-table tbody tr {
        animation: fadeInUp 0.3s ease forwards;
      }
      .winners-table tbody tr:nth-child(1) { animation-delay: 0.05s; }
      .winners-table tbody tr:nth-child(2) { animation-delay: 0.10s; }
      .winners-table tbody tr:nth-child(3) { animation-delay: 0.15s; }
      .winners-table tbody tr:nth-child(4) { animation-delay: 0.20s; }
      .winners-table tbody tr:nth-child(5) { animation-delay: 0.25s; }
      .winners-table tbody tr:nth-child(6) { animation-delay: 0.30s; }
      .winners-table tbody tr:nth-child(7) { animation-delay: 0.35s; }
      .winners-table tbody tr:nth-child(8) { animation-delay: 0.40s; }
      .winners-table tbody tr:nth-child(9) { animation-delay: 0.45s; }
      .winners-table tbody tr:nth-child(10) { animation-delay: 0.50s; }
    `;
    document.head.appendChild(style);
  }

  private setupEventListeners(): void {
    document.addEventListener('carDeleted', (event: Event): void => {
      const customEvent: CustomEvent<CarDeletedEventDetail> = event as CustomEvent<CarDeletedEventDetail>;
      console.log('📥 CarDeleted event received in WinnersView', customEvent.detail);
      
      if (this.container !== null && this.container.isConnected) {
        console.log('🔄 Refreshing winners table after car deletion');
        this.render(this.container);
      } else {
        console.log('ℹ️ Winners view is not visible, skipping refresh');
      }
    });

    document.addEventListener('winnerAdded', (event: Event): void => {
      const customEvent: CustomEvent<WinnerAddedEventDetail> = event as CustomEvent<WinnerAddedEventDetail>;
      console.log('📥 WinnerAdded event received in WinnersView', customEvent.detail);
      
      if (this.container !== null && this.container.isConnected) {
        console.log('🔄 Refreshing winners table after new winner');
        this.currentPage = 1;
        this.render(this.container);
      }
    });
  }

  public async render(container: HTMLElement): Promise<void> {
    this.container = container;

    try {
      const allWinnersData: Winner[] = await this.winnersAPI.getAllWinners();
      this.allWinners = allWinnersData;
      
      const allCars: Car[] = await CarService.getCars();
      const carMap: Map<number, Car> = new Map<number, Car>(
        allCars.map((car: Car): [number, Car] => [car.id, car])
      );

      const validWinners: Winner[] = this.allWinners.filter(
        (winner: Winner): boolean => carMap.has(winner.id)
      );
      const validTotal: number = validWinners.length;

      const sortedWinners: Winner[] = this.sortWinners(validWinners);

      const startIndex: number = (this.currentPage - 1) * this.itemsPerPage;
      const endIndex: number = startIndex + this.itemsPerPage;
      const pageWinners: Winner[] = sortedWinners.slice(startIndex, endIndex);

      let tableRows: string = '';
      
      if (pageWinners.length === 0) {
        tableRows = `
          <tr>
            <td colspan="5">
              <div class="empty-state">
                <span class="icon">🏁</span>
                <div class="title">No Winners Yet</div>
                <div class="subtitle">Start a race to see results here!</div>
              </div>
            </td>
          </tr>
        `;
      } else {
        pageWinners.forEach((winner: Winner, index: number): void => {
          const car: Car | undefined = carMap.get(winner.id);
          const displayNumber: number = startIndex + index + 1;
          const carColor: string = car?.color ?? '#ffffff';
          const carName: string = car?.name ?? `Car #${winner.id}`;
          const medal: string = displayNumber === 1 ? '🥇' : displayNumber === 2 ? '🥈' : displayNumber === 3 ? '🥉' : '';
          
          tableRows += `
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
              <td style="padding: 12px; color: ${displayNumber <= 3 ? '#ffd700' : '#888'}; text-align: center; font-weight: 700; font-size: ${displayNumber <= 3 ? '20px' : '16px'};">
                ${medal || displayNumber}
              </td>
              <td style="padding: 12px; text-align: center;">
                <div class="car-icon" style="background-color: ${carColor}; mask: url('/car.svg') center/contain no-repeat; -webkit-mask: url('/car.svg') center/contain no-repeat;"></div>
              </td>
              <td style="padding: 12px; color: #ffcc41; text-align: left; padding-left: 20px; font-weight: 600; font-size: 16px;">
                ${carName}
              </td>
              <td style="padding: 12px; color: #ffd700; text-align: center; font-weight: 700; font-size: 18px;">
                ${winner.wins} 🏆
              </td>
              <td style="padding: 12px; color: #4caf50; text-align: center; font-weight: 700; font-size: 16px; font-family: 'Courier New', monospace;">
                ${winner.time.toFixed(2)}s
              </td>
            </tr>
          `;
        });
      }

      const totalPages: number = Math.ceil(validTotal / this.itemsPerPage);

      container.innerHTML = `
        <div class="winners-view">
          <div class="winner-info-page">
            <span>WINNERS (${validTotal})</span>
            <span>PAGE #${this.currentPage}</span>
          </div>
          
          <div class="controls">
            <div class="sort-controls">
              <button id="sort-wins" style="background: ${this.sortBy === 'wins' ? 'linear-gradient(135deg, #ffd700, #f39c12)' : 'linear-gradient(135deg, #636e72, #2d3436)'};">
                Sort by Wins ${this.sortBy === 'wins' ? (this.sortOrder === 'DESC' ? '↓' : '↑') : ''}
              </button>
              <button id="sort-time" style="background: ${this.sortBy === 'time' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'linear-gradient(135deg, #636e72, #2d3436)'};">
                Sort by Time ${this.sortBy === 'time' ? (this.sortOrder === 'DESC' ? '↓' : '↑') : ''}
              </button>
            </div>
          </div>

          <table class="winners-table">
            <thead>
              <tr>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">#</th>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">Car</th>
                <th style="padding: 15px 12px; text-align: left; padding-left: 20px; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">Name</th>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">🏆 Wins</th>
                <th style="padding: 15px 12px; text-align: center; color: #fff; font-weight: 600; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid rgba(255, 215, 0, 0.2);">⏱ Best Time</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>

          <div class="pagination">
            <button ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page">◀ Prev</button>
            <span>Page ${this.currentPage} of ${totalPages || 1}</span>
            <button ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} id="next-page">Next ▶</button>
          </div>
        </div>
      `;

      this.setupSortListeners(container);
      this.setupPaginationListeners(container);

    } catch (error: unknown) {
      console.error('Error rendering winners:', error);
      container.innerHTML = `
        <div class="winners-view" style="padding: 40px; text-align: center; color: #ff1744;">
          <div style="font-size: 64px; margin-bottom: 20px;">💥</div>
          <div style="font-size: 24px; font-weight: 700; margin-bottom: 10px;">Error Loading Winners</div>
          <div style="color: #888;">Please try again later</div>
        </div>
      `;
    }
  }

  private setupSortListeners(container: HTMLElement): void {
    const sortWinsBtn: HTMLButtonElement | null = container.querySelector('#sort-wins');
    const sortTimeBtn: HTMLButtonElement | null = container.querySelector('#sort-time');
    
    if (sortWinsBtn !== null) {
      sortWinsBtn.addEventListener('click', (): void => {
        if (this.sortBy === 'wins') {
          this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
        } else {
          this.sortBy = 'wins';
          this.sortOrder = 'DESC';
        }
        this.render(container);
      });
    }

    if (sortTimeBtn !== null) {
      sortTimeBtn.addEventListener('click', (): void => {
        if (this.sortBy === 'time') {
          this.sortOrder = this.sortOrder === 'DESC' ? 'ASC' : 'DESC';
        } else {
          this.sortBy = 'time';
          this.sortOrder = 'DESC';
        }
        this.render(container);
      });
    }
  }

  private setupPaginationListeners(container: HTMLElement): void {
    const prevBtn: HTMLButtonElement | null = container.querySelector('#prev-page');
    const nextBtn: HTMLButtonElement | null = container.querySelector('#next-page');

    if (prevBtn !== null) {
      prevBtn.addEventListener('click', async (): Promise<void> => {
        if (this.currentPage > 1) {
          this.currentPage--;
          await this.render(container);
        }
      });
    }

    if (nextBtn !== null) {
      nextBtn.addEventListener('click', async (): Promise<void> => {
        const allCars: Car[] = await CarService.getCars();
        const carMap: Map<number, Car> = new Map<number, Car>(
          allCars.map((car: Car): [number, Car] => [car.id, car])
        );
        const validWinners: Winner[] = this.allWinners.filter(
          (w: Winner): boolean => carMap.has(w.id)
        );
        const totalPages: number = Math.ceil(validWinners.length / this.itemsPerPage);
        
        if (this.currentPage < totalPages) {
          this.currentPage++;
          await this.render(container);
        }
      });
    }
  }

  private sortWinners(winners: Winner[]): Winner[] {
    const sorted: Winner[] = [...winners];
    
    sorted.sort((a: Winner, b: Winner): number => {
      let comparison: number = 0;
      
      if (this.sortBy === 'wins') {
        comparison = a.wins - b.wins;
      } else if (this.sortBy === 'time') {
        comparison = a.time - b.time;
      }
      
      return this.sortOrder === 'DESC' ? -comparison : comparison;
    });
    
    return sorted;
  }
}