'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus, Trash } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { invoiceService } from '@/lib/services/invoice';

interface InvoiceFormProps {
  hostEmployerId: string;
  onSuccess?: () => void;
}

interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  tax_rate: number;
  total: number;
}

export function InvoiceForm({ hostEmployerId, onSuccess }: InvoiceFormProps) {
  const [dueDate, setDueDate] = useState<Date>();
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    {
      description: '',
      quantity: 1,
      unit_price: 0,
      tax_rate: 10,
      total: 0,
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      {
        description: '',
        quantity: 1,
        unit_price: 0,
        tax_rate: 10,
        total: 0,
      },
    ]);
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: string, value: string | number) => {
    const newItems = [...lineItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value,
    };
    setLineItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dueDate) {
      toast({
        title: 'Error',
        description: 'Please select a due date',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      await invoiceService.createInvoice({
        org_id: '', // TODO: Get from context
        host_employer_id: hostEmployerId,
        invoice_number: reference,
        due_date: dueDate,
        issue_date: new Date(),
        line_items: lineItems,
      });

      toast({
        title: 'Success',
        description: 'Invoice created successfully',
      });

      onSuccess?.();
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast({
        title: 'Error',
        description: 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className='space-y-6'
    >
      <div className='grid grid-cols-2 gap-4'>
        <div className='space-y-2'>
          <Label>Due Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                className={!dueDate ? 'text-muted-foreground' : ''}
              >
                <CalendarIcon className='mr-2 h-4 w-4' />
                {dueDate ? format(dueDate, 'PPP') : 'Select date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-auto p-0'>
              <Calendar
                mode='single'
                selected={dueDate}
                onSelect={setDueDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className='space-y-2'>
          <Label>Reference Number</Label>
          <Input
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder='Optional reference'
          />
        </div>
      </div>

      <div className='space-y-2'>
        <Label>Notes</Label>
        <Input
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder='Optional notes'
        />
      </div>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h3 className='text-lg font-medium'>Line Items</h3>
          <Button
            type='button'
            onClick={addLineItem}
            variant='outline'
          >
            <Plus className='mr-2 h-4 w-4' />
            Add Item
          </Button>
        </div>

        {lineItems.map((item, index) => (
          <div
            key={index}
            className='grid grid-cols-12 items-end gap-4'
          >
            <div className='col-span-5 space-y-2'>
              <Label>Description</Label>
              <Input
                value={item.description}
                onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                placeholder='Item description'
              />
            </div>
            <div className='col-span-2 space-y-2'>
              <Label>Quantity</Label>
              <Input
                type='number'
                value={item.quantity}
                onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value))}
                min='0'
                step='0.01'
              />
            </div>
            <div className='col-span-2 space-y-2'>
              <Label>Unit Price</Label>
              <Input
                type='number'
                value={item.unit_price}
                onChange={(e) => updateLineItem(index, 'unit_price', parseFloat(e.target.value))}
                min='0'
                step='0.01'
              />
            </div>
            <div className='col-span-2 space-y-2'>
              <Label>Tax Rate %</Label>
              <Input
                type='number'
                value={item.tax_rate}
                onChange={(e) => updateLineItem(index, 'tax_rate', parseFloat(e.target.value))}
                min='0'
                step='0.1'
              />
            </div>
            <div className='col-span-1'>
              <Button
                type='button'
                variant='ghost'
                size='icon'
                onClick={() => removeLineItem(index)}
                disabled={lineItems.length === 1}
              >
                <Trash className='h-4 w-4' />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type='submit'
        disabled={isLoading}
      >
        Create Invoice
      </Button>
    </form>
  );
}
