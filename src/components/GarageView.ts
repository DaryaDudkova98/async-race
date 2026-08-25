import { CarService, Car } from '../services/carService';
import { WinnersAPI } from '../api/winners';

export class GarageView {
  private carService: CarService;
  private currentPage: number = 1;
  private carsPerPage: number = 7;
  private animationFrames: Map<number, number> = new Map();
  private carStates: Map<number, { isRunning: boolean; isFinished: boolean }> = new Map();
  private exhaustIntervals: Map<number, number> = new Map();
  private smokeIntervals: Map<number, number> = new Map();
  private fireworkIntervals: Map<number, number> = new Map();
  private winnersAPI: WinnersAPI;
  
  private createColor: string = '#ffffff';
  private createName: string = '';
  private updateName: string = '';
  private updateColor: string = '#ffffff';
  private selectedCarId: number | null = null;

  // Хранилище для обработчиков ресайза
  private resizeHandlers: Map<number, () => void> = new Map();
  
  // Хранилище данных о движении каждой машины
  private carProgressData: Map<number, { 
    startTime: number; 
    duration: number; 
    endPosition: number;
    progress: number;
  }> = new Map();

  constructor() {
    this.carService = new CarService();
    this.winnersAPI = WinnersAPI.getInstance();
    this.addStyles();
  }

  private addStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
      /* Общие стили */
      .garage-view {
        background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
        min-height: 100vh;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }

      /* Заголовок */
      .car-info-page {
        display: flex;
        justify-content: space-between;
        padding: 15px 0;
        color: #fff;
        border-bottom: 2px solid rgba(255, 215, 0, 0.3);
        margin-bottom: 25px;
        position: relative;
      }
      .car-info-page .car-name {
        font-size: 28px;
        font-weight: 700;
        background: linear-gradient(90deg, #ffd700, #ff6b6b);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
      }
      .car-info-page .page-name {
        font-size: 18px;
        color: #888;
        background: rgba(255,255,255,0.05);
        padding: 5px 15px;
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
      }

      /* Карточка машины */
      .car-card {
        background: linear-gradient(135deg, #1a1a2e, #16213e);
        border-radius: 16px;
        padding: 15px 20px;
        margin-bottom: 15px;
        border: 1px solid rgba(255,255,255,0.05);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .car-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
        transition: left 0.5s ease;
      }
      .car-card:hover::before {
        left: 100%;
      }
      .car-card:hover {
        transform: translateX(5px);
        border-color: rgba(255, 215, 0, 0.2);
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      }

      /* Кнопки */
      .car-actions button {
        padding: 6px 16px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .select-btn {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
      }
      .select-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
      }
      .remove-btn {
        background: linear-gradient(135deg, #f093fb, #f5576c);
        color: white;
      }
      .remove-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 20px rgba(245, 87, 108, 0.4);
      }

      /* Кнопки двигателя */
      .car-engine button {
        width: 36px;
        height: 36px;
        border: none;
        border-radius: 50%;
        font-size: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .start-btn {
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white;
        box-shadow: 0 2px 10px rgba(0, 206, 201, 0.3);
      }
      .start-btn:hover:not(:disabled) {
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(0, 206, 201, 0.5);
      }
      .start-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .stop-btn {
        background: linear-gradient(135deg, #fd79a8, #e17055);
        color: white;
        box-shadow: 0 2px 10px rgba(225, 112, 85, 0.3);
      }
      .stop-btn:hover:not(:disabled) {
        transform: scale(1.1);
        box-shadow: 0 4px 20px rgba(225, 112, 85, 0.5);
      }
      .stop-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Имя машины */
      .car-name {
        font-size: 18px;
        font-weight: 600;
        color: #ffcc41;
        text-shadow: 0 0 20px rgba(255, 204, 65, 0.2);
      }

      /* Трек */
      .car-track {
        background: linear-gradient(180deg, #1a1a2e 0%, #2d2d2d 100%) !important;
        border-radius: 12px !important;
        overflow: hidden !important;
        height: 120px !important;
        position: relative;
        box-shadow: inset 0 2px 20px rgba(0,0,0,0.5);
      }
      .car-track::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 20px, transparent 20px, transparent 40px);
      }

      /* Флаг финиша */
      .flag {
        filter: drop-shadow(0 0 10px rgba(255, 0, 0, 0.5));
        animation: flagWave 1s ease-in-out infinite;
      }
      @keyframes flagWave {
        0%, 100% { transform: translateY(-50%) rotate(0deg); }
        50% { transform: translateY(-50%) rotate(5deg); }
      }

      /* Контролы */
      .controls {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
        padding: 20px;
        background: rgba(255,255,255,0.03);
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.05);
        margin-bottom: 25px;
      }
      .wrapper {
        display: flex;
        gap: 10px;
        align-items: center;
        flex-wrap: wrap;
      }
      .wrapper input[type="text"] {
        padding: 10px 16px;
        border-radius: 10px;
        border: 1px solid rgba(255,255,255,0.1);
        background: rgba(255,255,255,0.05);
        color: #fff;
        font-size: 14px;
        transition: all 0.3s ease;
        min-width: 150px;
      }
      .wrapper input[type="text"]:focus {
        outline: none;
        border-color: #ffd700;
        box-shadow: 0 0 20px rgba(255, 215, 0, 0.1);
      }
      .wrapper input[type="color"] {
        width: 44px;
        height: 44px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        background: none;
        padding: 0;
      }
      .wrapper input[type="color"]::-webkit-color-swatch-wrapper {
        padding: 2px;
      }
      .wrapper input[type="color"]::-webkit-color-swatch {
        border: 2px solid rgba(255,255,255,0.1);
        border-radius: 8px;
      }
      .wrapper button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #create-car {
        background: linear-gradient(135deg, #00b894, #00cec9);
        color: white;
      }
      #create-car:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(0, 206, 201, 0.4);
      }
      .update-btn {
        background: linear-gradient(135deg, #fdcb6e, #f39c12);
        color: white;
      }
      .update-btn:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(243, 156, 18, 0.4);
      }
      .update-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      /* Кнопки гонки */
      .race-controls {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
      }
      .race-controls button {
        padding: 10px 24px;
        border: none;
        border-radius: 10px;
        font-weight: 600;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      #race-btn {
        background: linear-gradient(135deg, #ff6b6b, #ee5a24);
        color: white;
        box-shadow: 0 4px 15px rgba(238, 90, 36, 0.3);
      }
      #race-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(238, 90, 36, 0.5);
      }
      #reset-btn {
        background: linear-gradient(135deg, #a29bfe, #6c5ce7);
        color: white;
        box-shadow: 0 4px 15px rgba(108, 92, 231, 0.3);
      }
      #reset-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(108, 92, 231, 0.5);
      }
      #generate-btn {
        background: linear-gradient(135deg, #fd79a8, #e17055);
        color: white;
        box-shadow: 0 4px 15px rgba(225, 112, 85, 0.3);
      }
      #generate-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 25px rgba(225, 112, 85, 0.5);
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
      }

      /* Анимация машины */
      .car-image {
        filter: drop-shadow(0 4px 15px rgba(255, 215, 0, 0.2));
        transition: transform 0.3s ease;
      }
      .car-image-wrapper {
        position: relative;
      }

      /* Speedometer */
      .car-speed {
        font-family: 'Courier New', monospace;
        font-weight: 700;
        padding: 2px 10px;
        background: rgba(0,0,0,0.5);
        border-radius: 6px;
        border: 1px solid rgba(76, 175, 80, 0.3);
      }

      /* Race time */
      .race-time {
        font-family: 'Courier New', monospace;
        font-weight: 700;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.1);
      }

      /* Empty message */
      .empty-message {
        text-align: center;
        padding: 60px 20px;
        font-size: 24px;
        color: #555;
        background: rgba(255,255,255,0.02);
        border-radius: 16px;
        border: 2px dashed rgba(255,255,255,0.05);
      }

      /* Анимации для сообщения */
      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.8);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      @keyframes bounce {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.1); }
      }
    `;
    document.head.appendChild(style);
  }

  private renderCars(cars: Car[]): string {
    if (cars.length === 0) {
      return '<div class="empty-message">🚗 No cars in the garage</div>';
    }

    const sortedCars = [...cars].sort((a, b) => a.id - b.id);

    return sortedCars.map((car, index) => {
      const displayNumber = index + 1;
      return `
        <div class="car-card" data-car-id="${car.id}">
          <div class="car-actions">
            <button class="select-btn" data-id="${car.id}">SELECT</button>
            <button class="remove-btn" data-id="${car.id}" data-number="${displayNumber}">REMOVE</button>
          </div>
          <div class="car-info">
            <div class="car-engine">
              <button class="start-btn" data-id="${car.id}">▶</button>
              <button class="stop-btn" data-id="${car.id}" disabled>⏹</button>
            </div>
            <span class="car-name" style="color: #ffcc41">${car.name}</span>
            <div class="car-speed" id="speed-${car.id}" style="display: none; color: #4caf50; font-size: 12px; margin-left: 10px;">0 km/h</div>
          </div>
          <div class="car-track" style="position: relative; background: linear-gradient(180deg, #2d2d2d 0%, #3d3d3d 100%); border-radius: 10px; overflow: hidden; height: 120px;">
            <div style="position: absolute; bottom: 0; width: 100%; height: 100%;">
              <div style="position: absolute; bottom: 20px; width: 100%; height: 2px; background: repeating-linear-gradient(90deg, #fff 0px, #fff 20px, transparent 20px, transparent 40px); opacity: 0.3;"></div>
              <div style="position: absolute; bottom: 60px; width: 100%; height: 1px; background: repeating-linear-gradient(90deg, rgba(255,255,255,0.1) 0px, rgba(255,255,255,0.1) 10px, transparent 10px, transparent 20px);"></div>
            </div>
            
            <div class="car-image-wrapper" style="position: relative; height: 100%;">
              <div class="car-image" id="car-${car.id}" style="background-color: ${car.color}; width: 140px; height: 100px; mask: url('/car.svg') center/contain no-repeat; -webkit-mask: url('/car.svg') center/contain no-repeat; transition: none; position: relative; z-index: 2; transform: translateX(0px);">
                <div class="exhaust" id="exhaust-${car.id}" style="position: absolute; right: -30px; top: 35px; width: 40px; height: 25px; background: radial-gradient(ellipse, rgba(200,200,200,0.7) 0%, transparent 70%); border-radius: 50%; display: none; filter: blur(5px); z-index: 1;"></div>
                <div class="exhaust-flame" id="flame-${car.id}" style="position: absolute; right: -25px; top: 45px; width: 15px; height: 10px; background: radial-gradient(ellipse, rgba(255,200,50,0.8) 0%, transparent 70%); border-radius: 50%; display: none; filter: blur(3px); z-index: 1;"></div>
              </div>
              
              <div class="flag" style="background-color: #ff0000; width: 40px; height: 40px; position: absolute; right: 20px; top: 50%; transform: translateY(-50%); mask: url('/flag.svg') center/contain no-repeat; -webkit-mask: url('/flag.svg') center/contain no-repeat; z-index: 1;"></div>
              
              <div class="race-time" id="time-${car.id}" style="position: absolute; right: 80px; top: 15px; color: #fff; font-weight: bold; display: none; font-size: 14px; z-index: 3; background: rgba(0,0,0,0.7); padding: 2px 8px; border-radius: 4px;"></div>
              
              <div class="fireworks-container" id="fireworks-${car.id}" style="position: absolute; right: 0px; top: 0px; width: 200px; height: 120px; pointer-events: none; display: none; z-index: 4; overflow: visible;"></div>
              
              <div class="smoke-container" id="smoke-${car.id}" style="position: absolute; left: 0px; top: 0px; width: 100%; height: 100%; pointer-events: none; display: none; z-index: 3; overflow: visible;"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ========== МЕТОД ДЛЯ ПОЛУЧЕНИЯ ПОЗИЦИИ ФИНИША ==========
  private getFinishPosition(carElement: HTMLElement): number {
    const track = carElement.closest('.car-track');
    if (!track) return 700;
    
    const trackWidth = track.clientWidth;
    // 160 - ширина машинки + отступы, 60 - отступ для флага справа
    const carWidth = 160;
    const flagOffset = 60;
    return Math.max(trackWidth - carWidth - flagOffset, 100);
  }

  public async render(container: HTMLElement): Promise<void> {
    const allCars = await CarService.getCars();
    const totalCars = allCars.length;

    const totalPages = Math.ceil(totalCars / this.carsPerPage);

    const startIndex = (this.currentPage - 1) * this.carsPerPage;
    const endIndex = startIndex + this.carsPerPage;
    const pageCars = allCars.slice(startIndex, endIndex);

    const carsHtml = this.renderCars(pageCars);

    container.innerHTML = `
      <div class="garage-view">
        <div class="controls">
          <div class="create-controls">
            <div class="wrapper">
              <input type="text" id="create-name" placeholder="Car name" value="${this.createName}">
              <input type="color" id="create-color" value="${this.createColor}">
              <button id="create-car">Create</button>
            </div>
            
            <div class="wrapper">
              <input type="text" id="update-name" disabled value="${this.updateName}">
              <input type="color" id="update-color" value="${this.updateColor}" disabled>
              <button id="update-btn" class="update-btn" disabled>Update</button>
            </div>
          </div>

          <div class="race-controls">
            <button id="race-btn">Race</button>
            <button id="reset-btn">Reset</button>
            <button id="generate-btn">Generate Cars</button>
          </div>
        </div>

        <div class="car-info-page">
          <span class="car-name">🚗 GARAGE (${totalCars})</span>
          <span class="page-name">PAGE #${this.currentPage}</span>
        </div>

        <div id="cars-list">
          ${carsHtml}
        </div>

        <div class="pagination">
          <button ${this.currentPage === 1 ? 'disabled' : ''} id="prev-page">◀ Prev</button>
          <span>Page ${this.currentPage} of ${totalPages || 1}</span>
          <button ${this.currentPage === totalPages || totalPages === 0 ? 'disabled' : ''} id="next-page">Next ▶</button>
        </div>
      </div>
    `;

    this.setupCreateListener(container);
    this.setupUpdateListener(container);
    this.setupGenerateListener(container);
    this.setupDeleteListener(container);
    this.setupPaginationListeners(container);
    this.setupRaceListeners(container);
    this.setupRaceControls(container);
  }

  // ========== ВИЗУАЛЬНЫЕ ЭФФЕКТЫ ==========

  private createFirework(carId: number, container: HTMLElement): void {
    const fireworksContainer = container.querySelector(`#fireworks-${carId}`) as HTMLElement;
    if (!fireworksContainer) return;

    fireworksContainer.style.display = 'block';
    fireworksContainer.innerHTML = '';

    const colors = ['#ff0000', '#ff8800', '#ffff00', '#00ff00', '#0088ff', '#ff00ff', '#ff44aa'];
    const emojis = ['🎆', '🎇', '✨', '⭐', '🌟', '💫'];

    for (let explosion = 0; explosion < 5; explosion++) {
      setTimeout(() => {
        const centerX = 100 + Math.random() * 100;
        const centerY = 20 + Math.random() * 80;
        const particleCount = 20 + Math.floor(Math.random() * 20);

        for (let i = 0; i < particleCount; i++) {
          const particle = document.createElement('div');
          const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
          const distance = 30 + Math.random() * 80;
          const size = 6 + Math.random() * 10;
          const color = colors[Math.floor(Math.random() * colors.length)];
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];

          particle.textContent = emoji;
          particle.style.cssText = `
            position: absolute;
            left: ${centerX}px;
            top: ${centerY}px;
            font-size: ${size}px;
            color: ${color};
            pointer-events: none;
            transform: translate(0, 0) scale(1);
            opacity: 1;
            transition: all ${0.5 + Math.random() * 0.5}s cubic-bezier(0.2, 0.8, 0.2, 1);
            z-index: 5;
            text-shadow: 0 0 10px ${color};
          `;

          fireworksContainer.appendChild(particle);

          requestAnimationFrame(() => {
            const x = Math.cos(angle) * distance;
            const y = Math.sin(angle) * distance;
            particle.style.transform = `translate(${x}px, ${y}px) scale(1.5)`;
            particle.style.opacity = '0';
          });

          setTimeout(() => {
            if (particle.parentNode) {
              particle.remove();
            }
          }, 1500);
        }
      }, explosion * 300);
    }

    setTimeout(() => {
      if (fireworksContainer) {
        fireworksContainer.style.display = 'none';
        fireworksContainer.innerHTML = '';
      }
    }, 3000);
  }

  private createSmokeEffect(carId: number, container: HTMLElement): void {
    const smokeContainer = container.querySelector(`#smoke-${carId}`) as HTMLElement;
    if (!smokeContainer) return;

    smokeContainer.style.display = 'block';
    smokeContainer.innerHTML = '';

    const smokeCount = 15;
    const particles: HTMLElement[] = [];

    for (let i = 0; i < smokeCount; i++) {
      const smoke = document.createElement('div');
      const size = 30 + Math.random() * 60;
      const x = 40 + Math.random() * 60;
      const y = 20 + Math.random() * 60;

      smoke.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        width: ${size}px;
        height: ${size}px;
        background: radial-gradient(ellipse, rgba(100,100,100,0.6) 0%, rgba(50,50,50,0.3) 40%, transparent 70%);
        border-radius: 50%;
        filter: blur(10px);
        pointer-events: none;
        opacity: 0;
        transform: scale(0.5);
        transition: all ${1 + Math.random() * 2}s cubic-bezier(0.1, 0.8, 0.3, 1);
        z-index: 5;
      `;

      smokeContainer.appendChild(smoke);
      particles.push(smoke);

      setTimeout(() => {
        smoke.style.opacity = '0.8';
        smoke.style.transform = `scale(${1 + Math.random() * 1.5}) translate(${-20 + Math.random() * 40}px, ${-30 - Math.random() * 50}px)`;
        smoke.style.filter = `blur(${15 + Math.random() * 20}px)`;
      }, i * 100);
    }

    setTimeout(() => {
      particles.forEach((p, index) => {
        setTimeout(() => {
          p.style.opacity = '0';
          p.style.transform = `scale(2) translate(${-30 + Math.random() * 60}px, ${-50 - Math.random() * 80}px)`;
        }, index * 50);
      });

      setTimeout(() => {
        if (smokeContainer) {
          smokeContainer.style.display = 'none';
          smokeContainer.innerHTML = '';
        }
      }, 3000);
    }, 2000);
  }

  private animateExhaust(carId: number, container: HTMLElement): void {
    const exhaustElement = container.querySelector(`#exhaust-${carId}`) as HTMLElement;
    const flameElement = container.querySelector(`#flame-${carId}`) as HTMLElement;
    
    if (!exhaustElement) return;

    exhaustElement.style.display = 'block';
    if (flameElement) flameElement.style.display = 'block';

    const interval = setInterval(() => {
      if (!exhaustElement.parentElement) {
        clearInterval(interval);
        return;
      }

      const opacity = 0.3 + Math.random() * 0.5;
      const scale = 0.8 + Math.random() * 0.8;
      const width = 30 + Math.random() * 30;

      exhaustElement.style.opacity = opacity.toString();
      exhaustElement.style.transform = `scaleX(${scale}) scaleY(${0.7 + Math.random() * 0.6})`;
      exhaustElement.style.width = `${width}px`;
      exhaustElement.style.left = `${-width / 2}px`;

      if (flameElement) {
        const flameOpacity = 0.3 + Math.random() * 0.5;
        const flameSize = 8 + Math.random() * 15;
        flameElement.style.opacity = flameOpacity.toString();
        flameElement.style.width = `${flameSize}px`;
        flameElement.style.height = `${flameSize / 2}px`;
        flameElement.style.transform = `scaleX(${0.5 + Math.random() * 0.8})`;
        flameElement.style.filter = `blur(${2 + Math.random() * 3}px)`;
      }
    }, 80);

    this.exhaustIntervals.set(carId, interval);
  }

  private stopExhaust(carId: number, container: HTMLElement): void {
    const interval = this.exhaustIntervals.get(carId);
    if (interval) {
      clearInterval(interval);
      this.exhaustIntervals.delete(carId);
    }

    const exhaustElement = container.querySelector(`#exhaust-${carId}`) as HTMLElement;
    const flameElement = container.querySelector(`#flame-${carId}`) as HTMLElement;
    
    if (exhaustElement) exhaustElement.style.display = 'none';
    if (flameElement) flameElement.style.display = 'none';
  }

  // ========== МЕТОДЫ ДЛЯ УПРАВЛЕНИЯ ДВИГАТЕЛЕМ ==========

  private setupRaceListeners(container: HTMLElement): void {
    const startBtns = container.querySelectorAll('.start-btn');
    const stopBtns = container.querySelectorAll('.stop-btn');
    
    startBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.currentTarget as HTMLButtonElement;
        const carId = Number(button.dataset.id);
        
        if (this.animationFrames.has(carId)) {
          console.log(`Car ${carId} is already running`);
          return;
        }
        
        button.disabled = true;
        button.textContent = '⏳';
        
        const stopBtn = container.querySelector(`.stop-btn[data-id="${carId}"]`) as HTMLButtonElement;
        if (stopBtn) stopBtn.disabled = false;
        
        const speedElement = container.querySelector(`#speed-${carId}`) as HTMLElement;
        if (speedElement) speedElement.style.display = 'inline';
        
        this.animateExhaust(carId, container);
        
        await this.startCarRace(carId, container);
      });
    });
    
    stopBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const button = e.currentTarget as HTMLButtonElement;
        const carId = Number(button.dataset.id);
        
        button.disabled = true;
        button.textContent = '⏳';
        
        await this.stopCar(carId, container);
        
        button.disabled = true;
        button.textContent = '⏹';
      });
    });
  }

  private setupRaceControls(container: HTMLElement): void {
    const raceBtn = container.querySelector('#race-btn');
    const resetBtn = container.querySelector('#reset-btn');
    
    raceBtn?.addEventListener('click', () => {
      this.startRace(container);
    });
    
    resetBtn?.addEventListener('click', () => {
      this.resetRace(container);
    });
  }

  // ========== ОБНОВЛЕННЫЙ МЕТОД startCarRace ==========
  private async startCarRace(carId: number, container: HTMLElement): Promise<void> {
    const carElement = container.querySelector(`#car-${carId}`) as HTMLElement;
    const timeElement = container.querySelector(`#time-${carId}`) as HTMLElement;
    const speedElement = container.querySelector(`#speed-${carId}`) as HTMLElement;
    const startBtn = container.querySelector(`.start-btn[data-id="${carId}"]`) as HTMLButtonElement;
    
    if (!carElement) return;

    try {
      const engineData = await CarService.controlEngine(carId, 'started');
      
      if (!engineData) {
        throw new Error('Failed to start engine');
      }

      const duration = engineData.distance / engineData.velocity / 1000;
      const startTime = Date.now();

      // Получаем актуальную позицию финиша
      const getFinishPos = () => this.getFinishPosition(carElement);
      let endPosition = getFinishPos();

      carElement.style.transition = 'none';
      carElement.style.transform = 'translateX(0px)';
      void carElement.offsetHeight;

      if (timeElement) {
        timeElement.style.display = 'block';
        timeElement.textContent = '⏳';
        timeElement.style.color = '#fff';
      }

      const smokeContainer = container.querySelector(`#smoke-${carId}`) as HTMLElement;
      if (smokeContainer) {
        smokeContainer.style.display = 'none';
        smokeContainer.innerHTML = '';
      }

      let animationFrame: number | null = null;
      let isStopped = false;

      // Сохраняем данные о движении
      this.carProgressData.set(carId, {
        startTime: Date.now(),
        duration: duration,
        endPosition: endPosition,
        progress: 0
      });

      // Функция обновления позиции при ресайзе
      const updatePositionOnResize = () => {
        if (isStopped || !this.animationFrames.has(carId)) return;
        
        const data = this.carProgressData.get(carId);
        if (!data) return;
        
        const newEndPos = getFinishPos();
        if (Math.abs(newEndPos - data.endPosition) > 1) {
          // Вычисляем текущий прогресс на основе времени
          const elapsed = (Date.now() - data.startTime) / 1000;
          const progress = Math.min(elapsed / data.duration, 1);
          
          // Обновляем данные
          data.endPosition = newEndPos;
          data.progress = progress;
          
          // Пересчитываем позицию
          const easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          const newX = newEndPos * easedProgress;
          carElement.style.transform = `translateX(${Math.min(newX, newEndPos)}px)`;
        }
      };

      // Создаем и сохраняем обработчик ресайза
      const resizeHandler = () => updatePositionOnResize();
      this.resizeHandlers.set(carId, resizeHandler);
      window.addEventListener('resize', resizeHandler);

      const animationPromise = new Promise<void>((resolve, reject) => {
        const animate = (timestamp: number) => {
          if (!this.animationFrames.has(carId) || isStopped) {
            window.removeEventListener('resize', resizeHandler);
            this.resizeHandlers.delete(carId);
            this.carProgressData.delete(carId);
            reject(new Error('Animation stopped'));
            return;
          }
          
          const data = this.carProgressData.get(carId);
          if (!data) {
            reject(new Error('No data'));
            return;
          }
          
          // Обновляем позицию финиша каждый кадр
          const currentEndPos = getFinishPos();
          if (Math.abs(currentEndPos - data.endPosition) > 1) {
            data.endPosition = currentEndPos;
          }
          
          // Вычисляем прогресс на основе времени
          const elapsed = (Date.now() - data.startTime) / 1000;
          const progress = Math.min(elapsed / data.duration, 1);
          data.progress = progress;
          
          const easedProgress = progress < 0.5 
            ? 2 * progress * progress 
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          
          const currentPosition = data.endPosition * easedProgress;
          carElement.style.transform = `translateX(${Math.min(currentPosition, data.endPosition)}px)`;
          
          if (speedElement && progress < 1) {
            const currentSpeed = Math.round((engineData.velocity / 1000) * (1 - Math.abs(progress - 0.5) * 0.6) * 3.6);
            speedElement.textContent = `${currentSpeed} km/h`;
          }
          
          if (progress >= 1) {
            const elapsedTime = ((Date.now() - data.startTime) / 1000);
            if (timeElement) {
              timeElement.textContent = `${elapsedTime.toFixed(2)}s`;
              timeElement.style.color = '#4caf50';
              timeElement.style.background = 'rgba(0,0,0,0.8)';
            }
            
            if (speedElement) {
              speedElement.textContent = '🏁';
              speedElement.style.color = '#ffd700';
            }
            
            this.createFirework(carId, container);
            this.stopExhaust(carId, container);
            
            (carElement as any).raceTime = elapsedTime;
            (carElement as any).raceSuccess = true;
            
            window.removeEventListener('resize', resizeHandler);
            this.resizeHandlers.delete(carId);
            this.carProgressData.delete(carId);
            resolve();
            return;
          }
          
          animationFrame = requestAnimationFrame(animate);
        };
        
        animationFrame = requestAnimationFrame(animate);
        this.animationFrames.set(carId, animationFrame);
      });

      try {
        await CarService.driveMode(carId);
        console.log(`✅ Car ${carId} drive mode activated`);
      } catch (driveError: any) {
        const is500Error = driveError?.message?.includes('500') || 
                          driveError?.status === 500 ||
                          driveError?.toString()?.includes('500');
        
        if (is500Error) {
          console.log(`💥 Car ${carId} engine broken! (500 error)`);
          
          if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            this.animationFrames.delete(carId);
          }
          isStopped = true;
          
          window.removeEventListener('resize', resizeHandler);
          this.resizeHandlers.delete(carId);
          this.carProgressData.delete(carId);
          
          if (timeElement) {
            timeElement.textContent = '💥 BROKEN';
            timeElement.style.color = '#ff1744';
            timeElement.style.display = 'block';
            timeElement.style.background = 'rgba(0,0,0,0.8)';
          }
          
          if (speedElement) {
            speedElement.textContent = '💥';
            speedElement.style.color = '#ff1744';
          }
          
          this.createSmokeEffect(carId, container);
          this.stopExhaust(carId, container);
          
          (carElement as any).raceSuccess = false;
          
          if (startBtn) {
            startBtn.textContent = '💥';
            startBtn.disabled = true;
          }
          
          return;
        } else {
          throw driveError;
        }
      }

      await animationPromise;
      
      console.log(`✅ Car ${carId} finished race!`);
      
      if (startBtn) {
        startBtn.textContent = '🏁';
        startBtn.disabled = true;
      }

    } catch (error) {
      console.error(`❌ Failed to start car ${carId}:`, error);
      
      const frameId = this.animationFrames.get(carId);
      if (frameId) {
        cancelAnimationFrame(frameId);
        this.animationFrames.delete(carId);
      }
      
      const handler = this.resizeHandlers.get(carId);
      if (handler) {
        window.removeEventListener('resize', handler);
        this.resizeHandlers.delete(carId);
      }
      
      this.carProgressData.delete(carId);
      
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = '▶';
      }
      
      const stopBtn = container.querySelector(`.stop-btn[data-id="${carId}"]`) as HTMLButtonElement;
      if (stopBtn) stopBtn.disabled = true;
      
      this.stopExhaust(carId, container);
    }
  }

  private async stopCar(carId: number, container: HTMLElement): Promise<void> {
    const startBtn = container.querySelector(`.start-btn[data-id="${carId}"]`) as HTMLButtonElement;
    const stopBtn = container.querySelector(`.stop-btn[data-id="${carId}"]`) as HTMLButtonElement;
    
    if (startBtn) {
      startBtn.disabled = true;
      startBtn.textContent = '⏳';
    }
    if (stopBtn) {
      stopBtn.disabled = true;
      stopBtn.textContent = '⏳';
    }
    
    const frameId = this.animationFrames.get(carId);
    if (frameId) {
      cancelAnimationFrame(frameId);
      this.animationFrames.delete(carId);
      console.log(`Animation stopped for car ${carId}`);
    }
    
    // Удаляем обработчик ресайза
    const handler = this.resizeHandlers.get(carId);
    if (handler) {
      window.removeEventListener('resize', handler);
      this.resizeHandlers.delete(carId);
    }
    
    // Удаляем данные
    this.carProgressData.delete(carId);
    
    this.stopExhaust(carId, container);
    
    const carElement = container.querySelector(`#car-${carId}`) as HTMLElement;
    if (carElement) {
      carElement.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
      carElement.style.transform = 'translateX(0px)';
      
      setTimeout(() => {
        if (carElement) {
          carElement.style.transition = 'none';
          carElement.style.transform = 'translateX(0px)';
        }
      }, 500);
      
      carElement.style.border = 'none';
      carElement.style.boxShadow = 'none';
      (carElement as any).raceSuccess = false;
      (carElement as any).raceTime = null;
    }
    
    const timeElement = container.querySelector(`#time-${carId}`) as HTMLElement;
    if (timeElement) {
      timeElement.style.display = 'none';
      timeElement.textContent = '';
      timeElement.style.color = '#fff';
      timeElement.style.background = 'none';
    }
    
    const speedElement = container.querySelector(`#speed-${carId}`) as HTMLElement;
    if (speedElement) {
      speedElement.style.display = 'none';
      speedElement.textContent = '0 km/h';
      speedElement.style.color = '#4caf50';
    }
    
    const smokeContainer = container.querySelector(`#smoke-${carId}`) as HTMLElement;
    if (smokeContainer) {
      smokeContainer.style.display = 'none';
      smokeContainer.innerHTML = '';
    }
    
    const fireworksContainer = container.querySelector(`#fireworks-${carId}`) as HTMLElement;
    if (fireworksContainer) {
      fireworksContainer.style.display = 'none';
      fireworksContainer.innerHTML = '';
    }
    
    fetch(`http://127.0.0.1:3000/engine?id=${carId}&status=stopped`, {
      method: 'PATCH',
    })
      .then(response => {
        console.log(`Stop response for car ${carId}: ${response.status}`);
        if (response.ok) {
          console.log(`✅ Car ${carId} stopped successfully (200 OK)`);
        }
      })
      .catch(error => {
        console.error(`Failed to stop car ${carId} on server:`, error);
      });
    
    setTimeout(() => {
      if (startBtn) {
        startBtn.disabled = false;
        startBtn.textContent = '▶';
      }
      if (stopBtn) {
        stopBtn.disabled = true;
        stopBtn.textContent = '⏹';
      }
    }, 500);
  }

  // ========== МЕТОДЫ ДЛЯ ГОНКИ ==========

  private async startRace(container: HTMLElement): Promise<void> {
    const carCards = container.querySelectorAll('.car-card');
    const racePromises: Promise<{ id: number; time: number }>[] = [];
    
    carCards.forEach((card) => {
      const htmlCard = card as HTMLElement;
      const carId = Number(htmlCard.dataset.carId);
      const startBtn = card.querySelector('.start-btn') as HTMLButtonElement;
      
      if (startBtn && !startBtn.disabled) {
        startBtn.click();
        
        const promise = new Promise<{ id: number; time: number }>((resolve, reject) => {
          const checkInterval = setInterval(() => {
            const carElement = container.querySelector(`#car-${carId}`) as HTMLElement;
            if ((carElement as any).raceSuccess !== undefined) {
              clearInterval(checkInterval);
              if ((carElement as any).raceSuccess) {
                const time = (carElement as any).raceTime || Infinity;
                resolve({ id: carId, time });
              } else {
                reject(new Error(`Car ${carId} failed`));
              }
            }
          }, 100);
        });
        
        racePromises.push(promise);
      }
    });
    
    if (racePromises.length === 0) {
      alert('No cars to race!');
      return;
    }
    
    try {
      const winner = await Promise.race(racePromises);
      console.log(`🏆 WINNER: Car ${winner.id} with time ${winner.time.toFixed(2)}s`);
      
      const allCars = await CarService.getCars();
      const winnerCar = allCars.find(c => c.id === winner.id);
      
      setTimeout(() => {
        this.createFirework(winner.id, container);
        setTimeout(() => {
          this.createFirework(winner.id, container);
        }, 800);
      }, 500);
      
      this.showWinnerMessage(container, winnerCar?.name || 'Unknown', winner.time);
      
      await this.saveWinner(winner.id, winner.time);
      
      const event = new CustomEvent('winnerAdded', { 
        detail: { carId: winner.id, time: winner.time } 
      });
      document.dispatchEvent(event);
      
      const winnerElement = container.querySelector(`#car-${winner.id}`);
      if (winnerElement) {
        (winnerElement as HTMLElement).style.border = '3px solid gold';
        (winnerElement as HTMLElement).style.boxShadow = '0 0 30px gold';
        
        let pulse = 0;
        const pulseInterval = setInterval(() => {
          if (!winnerElement.parentElement) {
            clearInterval(pulseInterval);
            return;
          }
          pulse = (pulse + 1) % 20;
          const intensity = Math.abs(pulse - 10) / 10;
          (winnerElement as HTMLElement).style.boxShadow = `0 0 ${20 + intensity * 30}px gold`;
        }, 100);
      }
      
    } catch (error) {
      console.log('All cars failed or no cars finished');
      this.showWinnerMessage(container, 'No cars finished the race!', 0);
    }
  }

  private showWinnerMessage(container: HTMLElement, carName: string, time: number): void {
    const oldMessage = container.querySelector('.winner-message');
    if (oldMessage) {
      oldMessage.remove();
    }
    
    const messageContainer = document.createElement('div');
    messageContainer.className = 'winner-message';
    
    if (time === 0) {
      messageContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e, #2d1b1b);
        padding: 40px 60px;
        border-radius: 20px;
        box-shadow: 0 0 80px rgba(255, 0, 0, 0.3);
        border: 2px solid #ff1744;
        z-index: 1000;
        text-align: center;
        max-width: 400px;
        animation: slideIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
      `;
      messageContainer.innerHTML = `
        <div style="font-size: 64px; margin-bottom: 10px;">😢</div>
        <div style="color: #ff1744; font-size: 24px; font-weight: 700;">
          No cars finished!
        </div>
        <div style="color: #888; margin-top: 10px; font-size: 14px;">
          All cars broke down or crashed
        </div>
      `;
    } else {
      messageContainer.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #1a1a2e, #1a2e1a);
        padding: 50px 70px;
        border-radius: 24px;
        box-shadow: 0 0 80px rgba(255, 215, 0, 0.4), inset 0 0 60px rgba(255, 215, 0, 0.05);
        border: 2px solid gold;
        z-index: 1000;
        text-align: center;
        max-width: 500px;
        animation: slideIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
      `;
      messageContainer.innerHTML = `
        <div style="font-size: 80px; margin-bottom: 5px; animation: bounce 1s ease infinite;">🏆</div>
        <div style="color: #ffd700; font-size: 36px; font-weight: 800; margin-bottom: 5px; text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);">
          WINNER!
        </div>
        <div style="color: #fff; font-size: 28px; margin-bottom: 5px; font-weight: 600; text-shadow: 0 0 20px rgba(255,255,255,0.1);">
          ${carName}
        </div>
        <div style="color: #4caf50; font-size: 22px; margin-bottom: 25px; font-weight: 500;">
          ⏱ <span style="font-size: 28px; font-weight: 700;">${time.toFixed(2)}s</span>
        </div>
        <button id="close-winner-message" style="
          padding: 14px 50px;
          background: linear-gradient(135deg, #ffd700, #f39c12);
          color: #1a1a2e;
          border: none;
          border-radius: 12px;
          font-size: 18px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(255, 215, 0, 0.3);
        "
        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 30px rgba(255,215,0,0.5)';"
        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 20px rgba(255,215,0,0.3)';">
          🎉 Awesome!
        </button>
      `;
    }
    
    document.body.appendChild(messageContainer);
    
    const closeBtn = messageContainer.querySelector('#close-winner-message');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        messageContainer.remove();
      });
    }
    
    messageContainer.addEventListener('click', (e) => {
      if (e.target === messageContainer) {
        messageContainer.remove();
      }
    });
    
    setTimeout(() => {
      if (messageContainer.parentNode) {
        messageContainer.remove();
      }
    }, 6000);
  }

  private async saveWinner(carId: number, raceTime: number): Promise<void> {
    try {
      const allWinners = await this.winnersAPI.getAllWinners();
      const existingWinner = allWinners.find(w => w.id === carId);
      
      if (existingWinner) {
        const newWins = existingWinner.wins + 1;
        const bestTime = Math.min(existingWinner.time, raceTime);
        await this.winnersAPI.updateWinner(carId, newWins, bestTime);
        console.log(`✅ Winner ${carId} updated: ${newWins} wins, best time: ${bestTime}s`);
      } else {
        await this.winnersAPI.addWinner(carId, 1, raceTime);
        console.log(`✅ New winner ${carId} created with time ${raceTime}s`);
      }
    } catch (error) {
      console.error('Error saving winner:', error);
    }
  }

  private async resetRace(container: HTMLElement): Promise<void> {
    const carCards = container.querySelectorAll('.car-card');
    
    for (const card of carCards) {
      const htmlCard = card as HTMLElement;
      const carId = Number(htmlCard.dataset.carId);
      await this.stopCar(carId, container);
      
      const carElement = container.querySelector(`#car-${carId}`) as HTMLElement;
      if (carElement) {
        carElement.style.border = 'none';
        carElement.style.boxShadow = 'none';
      }
    }
    
    console.log('🔄 Race reset completed');
  }

  // ========== МЕТОДЫ ДЛЯ РАБОТЫ С ФОРМАМИ ==========

  private setupCreateListener(container: HTMLElement): void {
    const createBtn = container.querySelector('#create-car');
    const nameInput = container.querySelector('#create-name') as HTMLInputElement;
    const colorInput = container.querySelector('#create-color') as HTMLInputElement;

    nameInput.value = this.createName;
    colorInput.value = this.createColor;

    nameInput.addEventListener('input', () => {
      this.createName = nameInput.value;
    });
    
    colorInput.addEventListener('input', () => {
      this.createColor = colorInput.value;
    });

    createBtn?.addEventListener('click', async () => {
      const name = nameInput.value;
      const color = colorInput.value;

      if (name) {
        const newCar = await CarService.createCar(name, color);

        if (newCar) {
          console.log('✅ Car created on server:', newCar);
          this.createName = '';
          await this.render(container);
        } else {
          console.error('❌ Creation error');
        }
      } else {
        this.createName = '';
        nameInput.value = '';
      }
    });
  }

  private setupUpdateListener(container: HTMLElement): void {
    const selectBtns = container.querySelectorAll('.select-btn');
    const updateBtn = container.querySelector('#update-btn') as HTMLButtonElement;
    const updateNameInput = container.querySelector('#update-name') as HTMLInputElement;
    const updateColorInput = container.querySelector('#update-color') as HTMLInputElement;

    if (this.selectedCarId !== null) {
      updateNameInput.value = this.updateName;
      updateColorInput.value = this.updateColor;
      updateNameInput.disabled = false;
      updateColorInput.disabled = false;
      updateBtn.disabled = false;
    }

    selectBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const htmlBtn = btn as HTMLButtonElement;
        const carId = Number(htmlBtn.dataset.id);
        this.selectedCarId = carId;

        const carCard = btn.closest('.car-card');
        const carNameElement = carCard?.querySelector('.car-name');
        const carName = carNameElement?.textContent?.trim() || '';

        this.updateName = carName;
        
        const carImage = carCard?.querySelector('.car-image') as HTMLElement;
        if (carImage) {
          this.updateColor = carImage.style.backgroundColor || '#ffffff';
        }

        updateNameInput.value = this.updateName;
        updateNameInput.disabled = false;
        updateColorInput.value = this.updateColor;
        updateColorInput.disabled = false;
        updateBtn.disabled = false;

        console.log(`🔍 Selected car #${carId} for update`);
      });
    });

    updateBtn?.addEventListener('click', async () => {
      if (this.selectedCarId === null) {
        alert('Please select a car first (SELECT button)');
        return;
      }

      const newName = updateNameInput.value.trim();
      const newColor = updateColorInput.value;

      if (!newName) {
        alert('Please enter car name');
        return;
      }

      const updatedCar = await CarService.updateCar(this.selectedCarId, newName, newColor);

      if (updatedCar) {
        console.log(`✅ Car #${this.selectedCarId} updated:`, updatedCar);
        
        this.selectedCarId = null;
        this.updateName = '';
        this.updateColor = '#ffffff';
        
        await this.render(container);
      } else {
        console.error(`❌ Update error for car #${this.selectedCarId}`);
        alert('Failed to update car');
      }
    });
  }

  private setupGenerateListener(container: HTMLElement): void {
    const generateBtn = container.querySelector('#generate-btn') as HTMLButtonElement;

    generateBtn?.addEventListener('click', async () => {
      const carMakes = [
        'Tesla', 'BMW', 'Mercedes', 'Audi', 'Toyota',
        'Honda', 'Ford', 'Chevrolet', 'Nissan', 'Volkswagen',
        'Porsche', 'Ferrari', 'Lamborghini', 'Maserati', 'Lexus',
        'Volvo', 'Hyundai', 'Kia', 'Mazda', 'Subaru'
      ];

      const carModels = [
        'Model S', 'Model 3', 'Model X', 'Model Y', 'Roadster',
        'X5', 'X3', 'X7', 'M3', 'M5',
        'E-Class', 'S-Class', 'C-Class', 'G-Class', 'A-Class',
        'A4', 'A6', 'Q5', 'Q7', 'R8',
        'Camry', 'Corolla', 'Supra', 'RAV4', 'Land Cruiser',
        'Accord', 'Civic', 'CR-V', 'Pilot', 'Odyssey',
        'Mustang', 'F-150', 'Explorer', 'Escape', 'Bronco',
        'Corvette', 'Malibu', 'Impala', 'Equinox', 'Traverse',
        'GT-R', 'Qashqai', 'Juke', 'Patrol', '370Z',
        'Golf', 'Passat', 'Tiguan', 'Touareg', 'Polo',
        'XC90', 'S60', 'V60', 'XC60', 'C40',
        'Tucson', 'Santa Fe', 'Kona', 'Elantra', 'Sonata'
      ];

      generateBtn.disabled = true;
      generateBtn.textContent = '⏳ Generating...';

      try {
        for (let i = 0; i < 100; i++) {
          const randomMake = carMakes[Math.floor(Math.random() * carMakes.length)];
          const randomModel = carModels[Math.floor(Math.random() * carModels.length)];
          const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

          const carName = `${randomMake} ${randomModel}`;

          await CarService.createCar(carName, randomColor);

          if ((i + 1) % 10 === 0) {
            console.log(`✅ Generated ${i + 1}/100 cars...`);
            generateBtn.textContent = `⏳ ${i + 1}/100`;
          }
        }

        console.log('🎉 100 cars generated successfully!');
        generateBtn.textContent = '✅ Done!';
        
        await this.render(container);
        
        document.dispatchEvent(new CustomEvent('carsGenerated'));

      } catch (error) {
        console.error('❌ Error generating cars:', error);
        alert('Error generating cars. Please try again.');
      } finally {
        setTimeout(() => {
          generateBtn.disabled = false;
          generateBtn.textContent = '🎲 Generate Cars';
        }, 1000);
      }
    });
  }

  private setupDeleteListener(container: HTMLElement): void {
    const removeBtns = container.querySelectorAll('.remove-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const target = e.currentTarget as HTMLButtonElement;
        const carId = Number(target.dataset.id);
        const displayNumber = target.dataset.number;

        const allCars = await CarService.getCars();
        const car = allCars.find(c => c.id === carId);
        const carName = car?.name || 'Unknown';

        if (!confirm(`Delete car #${displayNumber} (${carName})?`)) {
          return;
        }

        try {
          const deleteSuccess = await CarService.deleteCar(carId);
          if (!deleteSuccess) {
            alert(`Failed to delete car #${displayNumber}`);
            return;
          }

          console.log(`✅ Car #${displayNumber} (${carName}) deleted`);

          try {
            await this.winnersAPI.deleteWinner(carId);
            console.log(`✅ Winner ${carId} deleted`);
          } catch (err) {
            console.log(`ℹ️ Winner ${carId} not found`);
          }

          await this.render(container);

          const event = new CustomEvent('carDeleted', { 
            detail: { carId } 
          });
          document.dispatchEvent(event);
          console.log('📤 CarDeleted event dispatched');

        } catch (error) {
          console.error('Delete error:', error);
          alert('Error deleting car');
        }
      });
    });
  }

  private setupPaginationListeners(container: HTMLElement): void {
    const prevBtn = container.querySelector('#prev-page');
    const nextBtn = container.querySelector('#next-page');

    const colorInput = container.querySelector('#create-color') as HTMLInputElement;
    if (colorInput) {
      this.createColor = colorInput.value;
    }
    
    const nameInput = container.querySelector('#create-name') as HTMLInputElement;
    if (nameInput) {
      this.createName = nameInput.value;
    }

    prevBtn?.addEventListener('click', async () => {
      if (this.currentPage > 1) {
        const currentColorInput = container.querySelector('#create-color') as HTMLInputElement;
        if (currentColorInput) {
          this.createColor = currentColorInput.value;
        }
        const currentNameInput = container.querySelector('#create-name') as HTMLInputElement;
        if (currentNameInput) {
          this.createName = currentNameInput.value;
        }
        this.currentPage--;
        await this.render(container);
      }
    });

    nextBtn?.addEventListener('click', async () => {
      const allCars = await CarService.getCars();
      const totalPages = Math.ceil(allCars.length / this.carsPerPage);

      if (this.currentPage < totalPages) {
        const currentColorInput = container.querySelector('#create-color') as HTMLInputElement;
        if (currentColorInput) {
          this.createColor = currentColorInput.value;
        }
        const currentNameInput = container.querySelector('#create-name') as HTMLInputElement;
        if (currentNameInput) {
          this.createName = currentNameInput.value;
        }
        this.currentPage++;
        await this.render(container);
      }
    });
  }
}