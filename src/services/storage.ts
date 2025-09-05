import * as FileSystem from 'expo-file-system';
import { STORAGE_KEYS } from '../utils/constants';

const SHARED_DIRECTORY = FileSystem.documentDirectory + 'shared/';

export class StorageService {
  private static instance: StorageService;
  
  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  async ensureSharedDirectory(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(SHARED_DIRECTORY);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(SHARED_DIRECTORY, { intermediates: true });
    }
  }

  async saveCounterValue(value: number): Promise<void> {
    try {
      await this.ensureSharedDirectory();
      const data = {
        value,
        lastUpdated: Date.now()
      };
      
      await FileSystem.writeAsStringAsync(
        SHARED_DIRECTORY + 'counter.json',
        JSON.stringify(data)
      );
      
      // Notify widgets about the update
      this.notifyWidgets();
    } catch (error) {
      console.error('Error saving counter value:', error);
    }
  }

  async getCounterValue(): Promise<number> {
    try {
      await this.ensureSharedDirectory();
      const fileUri = SHARED_DIRECTORY + 'counter.json';
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      if (fileInfo.exists) {
        const content = await FileSystem.readAsStringAsync(fileUri);
        const data = JSON.parse(content);
        return data.value || 0;
      }
    } catch (error) {
      console.error('Error reading counter value:', error);
    }
    return 0;
  }

  private notifyWidgets(): void {
    // This would trigger widget updates on native platforms
    // Implementation depends on native bridge setup
  }
}
