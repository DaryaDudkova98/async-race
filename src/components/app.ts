import { GarageView } from './GarageView.ts';
import { WinnersView } from './WinnersView.ts';

// Тип для представлений
type ViewType = 'garage' | 'winners';

export class App {
  private container: HTMLElement;
  private currentView: ViewType = 'garage';
  private garageView: GarageView;
  private winnersView: WinnersView;
  
  constructor(container: HTMLElement) {
    this.container = container;
    this.garageView = new GarageView();
    this.winnersView = new WinnersView();
  }
  
  public init(): void {
    this.render();
    this.setupNavigation();
    this.showGarage();
  }
  
  private render(): void {
    this.container.innerHTML = `
      <header class="header">
        <nav class="nav">
          <button class="nav-btn active" data-view="garage">To Garage</button>
          <button class="nav-btn" data-view="winners">To Winners</button>
        </nav>
      </header>
      <main id="view-container"></main>
    `;
  }
  
  private setupNavigation(): void {
    const navButtons: NodeListOf<HTMLButtonElement> = this.container.querySelectorAll('.nav-btn');
    
    navButtons.forEach((btn: HTMLButtonElement): void => {
      btn.addEventListener('click', (event: MouseEvent): void => {
        const target: HTMLButtonElement = event.currentTarget as HTMLButtonElement;
        const view: string | undefined = target.dataset.view;
        
        // Удаляем класс active у всех кнопок
        navButtons.forEach((b: HTMLButtonElement): void => {
          b.classList.remove('active');
        });
        
        // Добавляем класс active текущей кнопке
        target.classList.add('active');
        
        // Переключаем представление
        if (view === 'garage') {
          this.showGarage();
        } else if (view === 'winners') {
          this.showWinners();
        }
      });
    });
  }
  
  private showGarage(): void {
    this.currentView = 'garage';
    const container: HTMLElement | null = document.getElementById('view-container');
    if (container !== null) {
      this.garageView.render(container);
    }
  }
  
  private showWinners(): void {
    this.currentView = 'winners';
    const container: HTMLElement | null = document.getElementById('view-container');
    if (container !== null) {
      this.winnersView.render(container);
    }
  }
}