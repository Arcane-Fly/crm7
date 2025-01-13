'use client'

import { useState } from 'react'
import { InvoiceService } from '@/lib/services/invoice'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, Plus, Trash } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface InvoiceFormProps {
  hostEmployerId: string
  onSuccess?: () => void
}

export function InvoiceForm({ hostEmployerId, onSuccess }: InvoiceFormProps) {
  const [dueDate, setDueDate] = useState<Date>()
  const [reference, setReference] = useState('')
  const [notes, setNotes] = useState('')
  const [lineItems, setLineItems] = useState([{
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 10
  }])
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const invoiceService = new InvoiceService()

  const addLineItem = () => {
    setLineItems([...lineItems, {
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 10
    }])
  }

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index))
  }

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const newItems = [...lineItems]
    newItems[index] = {
      ...newItems[index],
      [field]: value
    }
    setLineItems(newItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!dueDate) {
      toast({
        title: 'Error',
        description: 'Please select a due date',
        variant: 'destructive'
      })
      return
    }

    try {
      setIsLoading(true)
      await invoiceService.createInvoice({
        orgId: '', // TODO: Get from context
        hostEmployerId,
        dueDate,
        referenceNumber: reference,
        notes,
        lineItems
      })

      toast({
        title: 'Success',
        description: 'Invoice created successfully'
      })

      onSuccess?.()
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={!dueDate ? 'text-muted-foreground' : ''}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dueDate ? format(dueDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Reference Number</Label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="Optional reference"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Notes</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes"
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Line Items</h3>
          <Button type="button" onClick={addLineItem} variant="outline">
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>

        {lineItems.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-end">
            <div className="col-span-5 space-y-2">
              <Label>Description</Label>
              <Input
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                placeholder="Item description"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Unit Price</Label>
              <Input
                type="number"
                value={item.unitPrice}
                onChange={(e) => updateLineItem(index, 'unitPrice', parseFloat(e.target.value))}
                min="0"
                step="0.01"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Tax Rate %</Label>
              <Input
                type="number"
                value={item.taxRate}
                onChange={(e) => updateLineItem(index, 'taxRate', parseFloat(e.target.value))}
                min="0"
                step="0.1"
              />
            </div>
            <div className="col-span-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeLineItem(index)}
                disabled={lineItems.length === 1}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="submit" disabled={isLoading}>
        Create Invoice
      </Button>
    </form>
  )
}
