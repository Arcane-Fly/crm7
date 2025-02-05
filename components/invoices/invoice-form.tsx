import { useState } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { type LineItem } from '@/lib/types';

interface InvoiceFormData {
  dueDate: Date;
  items: Array<{
    description: string;
    amount: number;
  }>;
}

interface InvoiceFormProps {
  onSubmit: (data: InvoiceFormData) => void;
  initialData?: InvoiceFormData;
}

export function InvoiceForm({ onSubmit }: InvoiceFormProps): React.ReactElement {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [issueDate, setIssueDate] = useState<Date>(new Date());
  const [_dueDate, _setDueDate] = useState<Date>(new Date());

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number): void => {
    const newItems = [...lineItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setLineItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    try {
      setIsLoading(true);
      // Form submission logic
      await onSubmit({ dueDate: _dueDate, items: lineItems } as InvoiceFormData);
    } catch (error) {
      console.error('Failed to submit invoice:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label>Due Date</label>
            <div>{_dueDate ? format(_dueDate, 'PPP') : 'Select date'}</div>
          </div>

          <div className="space-y-4">
            {lineItems.map((item, index) => (
              <div key={index} className="grid gap-4 grid-cols-3">
                <input
                  type="text"
                  value={item.description}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateLineItem(index, 'description', e.target.value)
                  }
                  placeholder="Description"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateLineItem(index, 'quantity', parseFloat(e.target.value))
                  }
                  placeholder="Quantity"
                />
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>): void =>
                    updateLineItem(index, 'unit_price', parseFloat(e.target.value))
                  }
                  placeholder="Unit Price"
                />
              </div>
            ))}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </div>
  );
}
