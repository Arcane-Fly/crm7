'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useBankIntegration } from '@/lib/hooks/use-bank-integration'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2 } from 'lucide-react'

const bankAccountSchema = z.object({
  bank_name: z.string().min(1, 'Bank name is required'),
  account_name: z.string().min(1, 'Account name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  bsb: z.string().length(6, 'BSB must be 6 digits'),
  is_default: z.boolean().default(false),
})

type BankAccountFormValues = z.infer<typeof bankAccountSchema>

interface BankAccountFormProps {
  onSuccess?: () => void
}

export function BankAccountForm({ onSuccess }: BankAccountFormProps) {
  const { user } = useAuth()
  const { actions } = useBankIntegration()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountSchema),
    defaultValues: {
      bank_name: '',
      account_name: '',
      account_number: '',
      bsb: '',
      is_default: false,
    },
  })

  const onSubmit = async (values: BankAccountFormValues) => {
    if (!user) return

    try {
      setIsSubmitting(true)
      await actions.addBankAccount({
        ...values,
        org_id: user.org_id,
      })
      form.reset()
      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="bank_name"
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

          <FormField
            control={form.control}
            name="account_name"
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
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Number</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="bsb"
            render={({ field }) => (
              <FormItem>
                <FormLabel>BSB</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={6} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_default"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Set as default account</FormLabel>
                </div>
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Bank Account
          </Button>
        </form>
      </Form>
    </Card>
  )
}
