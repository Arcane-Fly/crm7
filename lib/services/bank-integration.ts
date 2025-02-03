import { type SupabaseClient } from '@supabase/supabase-js';
import { type Database } from '@/types/supabase';
import { logger } from '@/lib/logger';

interface BankAccount {
  id: string;
  accountNumber: string;
  bsb: string;
  name: string;
  isActive: boolean;
}

interface BankTransaction {
  id: string;
  accountId: string;
  type: 'credit' | 'debit';
  amount: number;
  reference: string;
  date: string;
}

export class BankIntegrationService {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async createBankAccount(account: Omit<BankAccount, 'id'>): Promise<BankAccount> {
    try {
      const { data, error } = await this.supabase
        .from('bank_accounts')
        .insert(account)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to create bank account:', error);
      throw error;
    }
  }

  async getBankAccount(id: string): Promise<BankAccount | null> {
    try {
      const { data, error } = await this.supabase
        .from('bank_accounts')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get bank account:', error);
      throw error;
    }
  }

  async updateBankAccount(id: string, updates: Partial<BankAccount>): Promise<BankAccount> {
    try {
      const { data, error } = await this.supabase
        .from('bank_accounts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to update bank account:', error);
      throw error;
    }
  }

  async deleteBankAccount(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      logger.error('Failed to delete bank account:', error);
      throw error;
    }
  }

  async createTransaction(transaction: Omit<BankTransaction, 'id'>): Promise<BankTransaction> {
    try {
      const { data, error } = await this.supabase
        .from('bank_transactions')
        .insert(transaction)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to create transaction:', error);
      throw error;
    }
  }

  async getTransaction(id: string): Promise<BankTransaction | null> {
    try {
      const { data, error } = await this.supabase
        .from('bank_transactions')
        .select()
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get transaction:', error);
      throw error;
    }
  }

  async getTransactions(accountId: string): Promise<BankTransaction[]> {
    try {
      const { data, error } = await this.supabase
        .from('bank_transactions')
        .select()
        .eq('accountId', accountId)
        .order('date', { ascending: false });

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      logger.error('Failed to get transactions:', error);
      throw error;
    }
  }
}
