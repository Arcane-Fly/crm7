import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ratesService } from '@/lib/services/rates'
import { useToast } from '@/components/ui/use-toast'

interface RateApprovalProps {
  _orgId: string
  templateId: string
}

export function RateApproval({ _orgId, templateId }: RateApprovalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [template, setTemplate] = useState<any>(null)
  const [approvalHistory, setApprovalHistory] = useState<any[]>([])
  const [notes, setNotes] = useState('')
  const { toast } = useToast()

  const loadTemplate = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: templateData, error: templateError } =
        await ratesService.getTemplate(templateId)
      if (templateError) throw templateError
      setTemplate(templateData)
    } catch (err) {
      setError(err as Error)
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [templateId, toast])

  const loadApprovalHistory = useCallback(async () => {
    try {
      setIsLoading(true)
      const { data: historyData, error: historyError } =
        await ratesService.getApprovalHistory(templateId)
      if (historyError) throw historyError
      setApprovalHistory(historyData)
    } catch (err) {
      setError(err as Error)
      toast({
        title: 'Error',
        description: 'Failed to load approval history',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }, [templateId, toast])

  useEffect(() => {
    Promise.all([loadTemplate(), loadApprovalHistory()])
  }, [loadTemplate, loadApprovalHistory])

  const handleApprove = async () => {
    try {
      setIsLoading(true)
      await ratesService.approveTemplate(templateId, { notes })
      toast({
        title: 'Success',
        description: 'Template approved successfully',
      })
      await loadApprovalHistory()
    } catch (err) {
      setError(err as Error)
      toast({
        title: 'Error',
        description: 'Failed to approve template',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setIsLoading(true)
      await ratesService.rejectTemplate(templateId, { notes })
      toast({
        title: 'Success',
        description: 'Template rejected successfully',
      })
      await loadApprovalHistory()
    } catch (err) {
      setError(err as Error)
      toast({
        title: 'Error',
        description: 'Failed to reject template',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className='text-red-500'>{error.message}</div>
  }

  if (!template) {
    return <div>No template found</div>
  }

  return (
    <div className='grid gap-6'>
      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Template Details</h3>
        <div className='space-y-4'>
          <div>
            <Label>Name</Label>
            <Input value={template.name} readOnly />
          </div>
          <div>
            <Label>Status</Label>
            <Input value={template.status} readOnly />
          </div>
          <div>
            <Label>Notes</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add approval/rejection notes...'
            />
          </div>
          <div className='flex gap-4'>
            <Button onClick={handleApprove} disabled={isLoading}>
              Approve
            </Button>
            <Button onClick={handleReject} disabled={isLoading} variant='destructive'>
              Reject
            </Button>
          </div>
        </div>
      </Card>

      <Card className='p-6'>
        <h3 className='mb-4 text-lg font-semibold'>Approval History</h3>
        <div className='space-y-4'>
          {approvalHistory.map((item, index) => (
            <div key={index} className='border-b pb-4'>
              <div className='flex justify-between'>
                <span className='font-medium'>{item.status}</span>
                <span className='text-gray-500'>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
              {item.notes && <p className='mt-2 text-gray-600'>{item.notes}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
