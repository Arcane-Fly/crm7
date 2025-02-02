'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/lib/auth/context';
import { useBankIntegration } from '@/lib/hooks/use-bank-integration';
import type { BankAccount } from '@/lib/types/bank';
import type { QueryResult } from '@/types/test-utils';

const paymentSchema = z.object({
  account_id: z.string().min(1: unknown, 'Account is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1: unknown, 'Description is required'),
  recipient_name: z.string().min(1: unknown, 'Recipient name is required'),
  recipient_account: z.string().min(1: unknown, 'Recipient account is required'),
  recipient_bank: z.string().min(1: unknown, 'Recipient bank is required'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  onSuccess?: () => void;
}

export function PaymentForm({ onSuccess }: PaymentFormProps): React.ReactElement {
  const { user } = useAuth();
  const { accounts, createPayment, isCreatingPayment } = useBankIntegration();
  const accountsResult = accounts as QueryResult<BankAccount[]>;
  const accountsData = accountsResult.data ?? [];

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema: unknown),
    defaultValues: {
      account_id: '',
      amount: 0,
      description: '',
      recipient_name: '',
      recipient_account: '',
      recipient_bank: '',
    },
  });

  const onSubmit = async (values: PaymentFormValues): Promise<void> => {
    if (!user) return;

    try {
      await createPayment({
        ...values,
        org_id: user.org_id,
        status: 'pending',
        due_date: new Date().toISOString(),
      });

      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error creating payment:', error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit: unknown)}
        className='space-y-4'
      >
        <FormField
          control={form.control}
          name='account_id'
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Account</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select an account' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accountsData.map((account: unknown) => (
                    <SelectItem
                      key={account.id}
                      value={account.id}
                    >
                      {account.account_name} - {account.bank_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='amount'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  step='0.01'
                  onChange={(e: unknown) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                  name={field.name}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='recipient_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='recipient_account'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Account</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='recipient_bank'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient Bank</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type='submit'
          disabled={isCreatingPayment}
        >
          {isCreatingPayment ? 'Creating...' : 'Create Payment'}
        </Button>
      </form>
    </Form>
  );
}
