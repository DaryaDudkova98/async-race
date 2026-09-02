// services/carService.ts

const BASE_URL = 'http://localhost:3000';

export interface Car {
    id: number;
    number: number;
    name: string;
    color: string;
    img: string;
    wins: number[];
    bestTime: number[];
}

export interface EngineResponse {
  velocity: number;
  distance: number;
}

export interface DriveResponse {
  success: boolean;
}

export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export class CarService {

    static async getCars(): Promise<Car[]> {
        try {
            const response = await fetch(`${BASE_URL}/garage`);
            if (!response.ok) throw new Error('Error of loading...');
            return await response.json();
        } catch (error) {
            console.error('Error getCars:', error);
            return [];
        }
    }

    static async createCar(name: string, color: string): Promise<Car | null> {
        try {
            const response = await fetch(`${BASE_URL}/garage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color })
            });

            if (!response.ok) throw new Error('Ошибка создания');
            return await response.json();
        } catch (error) {
            console.error('Error createCar:', error);
            return null;
        }
    }

    static async deleteCar(id: number): Promise<boolean> {
        try {
            const response = await fetch(`${BASE_URL}/garage/${id}`, {
                method: 'DELETE'
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleteCar:', error);
            return false;
        }
    }

    static async updateCar(id: number, name: string, color: string): Promise<Car | null> {
        try {
            const response = await fetch(`${BASE_URL}/garage/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, color })
            });

            if (!response.ok) throw new Error('Ошибка обновления');
            return await response.json();
        } catch (error) {
            console.error('Ошибка updateCar:', error);
            return null;
        }
    }

    // ========== НОВЫЕ МЕТОДЫ ДЛЯ ДВИГАТЕЛЯ ==========

    /**
     * Запускает или останавливает двигатель машины
     */
    static async controlEngine(id: number, status: 'started' | 'stopped'): Promise<EngineResponse | null> {
        try {
            const response = await fetch(
                `${BASE_URL}/engine?id=${id}&status=${status}`,
                { method: 'PATCH' }
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error(`Car ${id} not found`);
                }
                throw new Error(`Failed to ${status} engine for car ${id}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error ${status} engine:`, error);
            return null;
        }
    }

    /**
     * Переключает двигатель в режим движения (может вернуть 500 ошибку)
     */
    static async driveMode(id: number): Promise<DriveResponse> {
        const response = await fetch(
            `${BASE_URL}/engine?id=${id}&status=drive`,
            { method: 'PATCH' }
        );

        if (!response.ok) {
            if (response.status === 500) {
                // Машина сломалась - это ожидаемое поведение
                throw new Error('ENGINE_BROKEN');
            }
            if (response.status === 429) {
                throw new Error('RACE_IN_PROGRESS');
            }
            if (response.status === 404) {
                throw new Error('CAR_NOT_FOUND');
            }
            throw new Error(`Failed to switch to drive mode for car ${id}`);
        }

        return response.json();
    }

    /**
     * Полный процесс гонки для одной машины
     * Возвращает время гонки или null в случае ошибки
     */
    static async raceCar(id: number): Promise<number | null> {
        try {
            // 1. Запускаем двигатель
            const engineData = await this.controlEngine(id, 'started');
            
            if (!engineData) {
                throw new Error('Failed to start engine');
            }

            // 2. Рассчитываем время на основе скорости и дистанции
            const time = engineData.distance / engineData.velocity / 1000; // в секундах

            // 3. Пытаемся переключиться в режим движения
            await this.driveMode(id);

            // 4. Возвращаем время гонки
            return time;

        } catch (error) {
            if (error instanceof Error && error.message === 'ENGINE_BROKEN') {
                // Машина сломалась - это не критично, просто возвращаем null
                console.log(`Car ${id} broke down during race`);
                return null;
            }
            console.error(`Car ${id} race failed:`, error);
            return null;
        }
    }

    // ========== МЕТОДЫ ДЛЯ ПОБЕДИТЕЛЕЙ ==========

    static async getWinners(): Promise<Winner[]> {
        try {
            const response = await fetch(`${BASE_URL}/winners`);
            if (!response.ok) throw new Error('Error loading winners');
            return await response.json();
        } catch (error) {
            console.error('Error getWinners:', error);
            return [];
        }
    }

    static async getWinner(id: number): Promise<Winner | null> {
        try {
            const response = await fetch(`${BASE_URL}/winners/${id}`);
            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Error loading winner');
            }
            return await response.json();
        } catch (error) {
            console.error('Error getWinner:', error);
            return null;
        }
    }

    static async createWinner(id: number, wins: number, time: number): Promise<Winner | null> {
        try {
            const response = await fetch(`${BASE_URL}/winners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, wins, time })
            });

            if (!response.ok) {
                if (response.status === 500) {
                    // Возможно, победитель уже существует
                    console.log('Winner already exists');
                    return null;
                }
                throw new Error('Error creating winner');
            }
            return await response.json();
        } catch (error) {
            console.error('Error createWinner:', error);
            return null;
        }
    }

    static async updateWinner(id: number, wins: number, time: number): Promise<Winner | null> {
        try {
            const response = await fetch(`${BASE_URL}/winners/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ wins, time })
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Error updating winner');
            }
            return await response.json();
        } catch (error) {
            console.error('Error updateWinner:', error);
            return null;
        }
    }

    /**
     * Обновляет или создает запись победителя
     * Увеличивает количество побед, обновляет лучшее время
     */
    static async saveWinner(carId: number, raceTime: number): Promise<void> {
        try {
            // Проверяем, существует ли уже победитель
            const existingWinner = await this.getWinner(carId);

            if (existingWinner) {
                // Обновляем существующего победителя
                const newWins = existingWinner.wins + 1;
                const bestTime = Math.min(existingWinner.time, raceTime);
                
                await this.updateWinner(carId, newWins, bestTime);
                console.log(`✅ Winner ${carId} updated: ${newWins} wins, best time: ${bestTime}s`);
            } else {
                // Создаем нового победителя
                await this.createWinner(carId, 1, raceTime);
                console.log(`✅ New winner ${carId} created with time ${raceTime}s`);
            }
        } catch (error) {
            console.error('Error saving winner:', error);
        }
    }
}