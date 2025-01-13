import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { useUser } from '@/lib/hooks/use-user'
import { ratesService, RateTemplate } from '@/lib/services/rates'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { ActivityList } from '@/components/ui/activity-list'

export interface RateApprovalProps {
  templateId: string
  onApproved?: () => void
}

export function RateApproval({ templateId, onApproved }: RateApprovalProps) {
  const { toast } = useToast()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [template, setTemplate] = useState<RateTemplate | null>(null)
  const [approvalHistory, setApprovalHistory] = useState<any[]>([])
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (user?.org_id && templateId) {
      loadTemplate()
      loadApprovalHistory()
    }
  }, [user?.org_id, templateId])

  const loadTemplate = async () => {
    try {
      const data = await ratesService.getRateTemplates({
        org_id: user!.org_id,
        id: templateId
      })
      if (data.length > 0) {
        setTemplate(data[0])
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive'
      })
    }
  }

  const loadApprovalHistory = async () => {
    try {
      const { data } = await ratesService.supabase
        .from('rate_template_approvals')
        .select(`
          *,
          requested_by:requested_by(name),
          approved_by:approved_by(name)
        `)
        .eq('template_id', templateId)
        .order('requested_at', { ascending: false })

      setApprovalHistory(data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load approval history',
        variant: 'destructive'
      })
    }
  }

  const handleApprove = async () => {
    try {
      setLoading(true)

      const { data, error } = await ratesService.supabase
        .from('rate_template_approvals')
        .update({
          status: 'approved',
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
          notes
        })
        .eq('template_id', templateId)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error

      await ratesService.supabase
        .from('rate_templates')
        .update({ is_approved: true })
        .eq('id', templateId)

      toast({
        title: 'Success',
        description: 'Rate template approved successfully'
      })

      onApproved?.()
      loadApprovalHistory()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    try {
      setLoading(true)

      const { data, error } = await ratesService.supabase
        .from('rate_template_approvals')
        .update({
          status: 'rejected',
          approved_by: user!.id,
          approved_at: new Date().toISOString(),
          notes
        })
        .eq('template_id', templateId)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error

      toast({
        title: 'Success',
        description: 'Rate template rejected'
      })

      loadApprovalHistory()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject template',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const pendingApproval = approvalHistory.find(a => a.status === 'pending')

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Template Approval</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {template && (
            <div className="space-y-2">
              <h3 className="font-semibold">{template.template_name}</h3>
              <p className="text-sm text-muted-foreground">
                Type: {template.template_type}
              </p>
              <p className="text-sm text-muted-foreground">
                Effective: {formatDate(template.effective_from)} - {template.effective_to ? formatDate(template.effective_to) : 'Ongoing'}
              </p>
              <Badge variant={template.is_approved ? 'success' : 'warning'}>
                {template.is_approved ? 'Approved' : 'Pending Approval'}
              </Badge>
            </div>
          )}

          {pendingApproval && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Approval Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about your decision..."
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={handleApprove}
                  disabled={loading}
                  variant="default"
                >
                  {loading ? 'Processing...' : 'Approve'}
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={loading}
                  variant="destructive"
                >
                  {loading ? 'Processing...' : 'Reject'}
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="font-semibold">Approval History</h3>
            <ActivityList
              items={approvalHistory.map(approval => ({
                id: approval.id,
                title: `Rate Template ${approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}`,
                description: approval.notes || 'No notes provided',
                date: new Date(approval.requested_at),
                icon: approval.status === 'approved' ? 'check' : approval.status === 'rejected' ? 'x' : 'clock',
                iconColor: approval.status === 'approved' ? 'text-green-500' : approval.status === 'rejected' ? 'text-red-500' : 'text-yellow-500',
                metadata: [
                  { label: 'Requested By', value: approval.requested_by?.name || 'Unknown' },
                  { label: 'Status', value: approval.status },
                  approval.approved_by && { label: 'Approved By', value: approval.approved_by?.name }
                ].filter(Boolean)
              }))}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
