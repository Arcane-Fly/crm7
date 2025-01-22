'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/context'
import { useBankIntegration } from '@/lib/hooks/use-bank-integration'

const bankAccountSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  routing_number: z.string().min(9, 'Routing number must be 9 digits'),
  bank_name: z.string().min(1, 'Bank name is required'),
})

type BankAccountFormValues = z.infer<typeof bankAccountSchema>

interface BankAccountFormProps {
  onSuccess?: () => void
}

export function BankAccountForm({ onSuccess }: BankAccountFormProps) {
  const { user } = useAuth()
  const { createBankAccount, isCreatingBankAccount } = useBankIntegration()

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      account_name: '',
      account_number: '',
      routing_number: '',
      bank_name: '',
    },
  })

  const onSubmit = async (values: BankAccountFormValues) => {
    if (!user) return

    createBankAccount({
      ...values,
      org_id: user.org_id,
      is_active: true,
      bsb: values.routing_number // Using routing number as BSB for Australian banking
    })

    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='account_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='account_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Number</FormLabel>
              <FormControl>
                <Input {...field} type='password' />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='routing_number'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Routing Number</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bank_name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit' disabled={isCreatingBankAccount}>
          {isCreatingBankAccount ? 'Adding...' : 'Add Bank Account'}
        </Button>
      </form>
    </Form>
  )
}
