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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

const paymentSchema = z.object({
  account_id: z.string().min(1, 'Account is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  description: z.string().min(1, 'Description is required'),
  recipient_name: z.string().min(1, 'Recipient name is required'),
  recipient_account: z.string().min(1, 'Recipient account is required'),
  recipient_bank: z.string().min(1, 'Recipient bank is required'),
})

type PaymentFormValues = z.infer<typeof paymentSchema>

interface PaymentFormProps {
  onSuccess?: () => void
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const { user } = useAuth()
  const { accounts, createPayment, isCreatingPayment } = useBankIntegration()

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      account_id: '',
      amount: 0,
      description: '',
      recipient_name: '',
      recipient_account: '',
      recipient_bank: '',
    },
  })

  const onSubmit = async (values: PaymentFormValues) => {
    if (!user) return

    createPayment({
      data: {
        ...values,
        org_id: user.org_id,
        status: 'pending',
      },
    })

    onSuccess?.()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="account_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>From Account</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an account" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {accounts.data?.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
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
          name="amount"
          render={({ field: { onChange, ...field } }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  onChange={(e) => onChange(parseFloat(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
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
          name="recipient_name"
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
          name="recipient_account"
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
          name="recipient_bank"
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
        <Button type="submit" disabled={isCreatingPayment}>
          {isCreatingPayment ? 'Creating...' : 'Create Payment'}
        </Button>
      </form>
    </Form>
  )
}
