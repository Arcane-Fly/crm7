import { type TableSchema } from '../types/schema-component';

export interface SchemaHistoryEntry {
  schema: TableSchema[];
  timestamp: string;
  description: string;
}

export class SchemaHistory {
  private history: SchemaHistoryEntry[] = [];
  private currentIndex = -1;
  private maxHistory = 50;

  push(schema: TableSchema[], description: string): void {
    // Remove any future history if we're not at the latest state
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push({
      schema: JSON.parse(JSON.stringify(schema)), // Deep clone
      timestamp: new Date().toISOString(),
      description,
    });

    // Maintain history size limit
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(this.history.length - this.maxHistory);
    }

    this.currentIndex = this.history.length - 1;
  }

  undo(): SchemaHistoryEntry | null {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo(): SchemaHistoryEntry | null {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  canUndo(): boolean {
    return this.currentIndex > 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }

  getCurrentState(): SchemaHistoryEntry | null {
    return this.currentIndex >= 0 ? this.history[this.currentIndex] : null;
  }

  getHistory(): SchemaHistoryEntry[] {
    return this.history;
  }

  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }
}
