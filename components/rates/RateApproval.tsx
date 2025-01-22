import { useState, useEffect } from 'react'
import { ratesService } from '@/lib/services/rates'
import type { RateTemplate } from '@/lib/types/rates'

interface ApprovalHistory {
  id: string
  template_id: string
  action: 'approve' | 'reject'
  notes: string
  approver_id: string
  created_at: string
}

export const RateApproval = ({ templateId }: { templateId: string }) => {
  const [template, setTemplate] = useState<RateTemplate | null>(null)
  const [history, setHistory] = useState<ApprovalHistory[]>([])
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const template = await ratesService.getTemplate(templateId)
        if (template) {
          setTemplate(template)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load template')
      }
    }

    loadTemplate()
  }, [templateId])

  const handleApprove = async () => {
    if (!template) return

    try {
      // Save template with approval notes
      const updatedTemplate = await ratesService.saveTemplate({
        ...template,
        status: 'approved',
        is_approved: true,
      }, notes)
      setTemplate(updatedTemplate)

      // Refresh history after approval
      const updatedHistory = await ratesService.getTemplateHistory(templateId)
      setHistory(updatedHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve template')
    }
  }

  const handleReject = async () => {
    if (!template) return

    try {
      // Save template with rejection notes
      const updatedTemplate = await ratesService.saveTemplate({
        ...template,
        status: 'rejected',
        is_approved: false,
      }, notes)
      setTemplate(updatedTemplate)

      // Refresh history after rejection
      const updatedHistory = await ratesService.getTemplateHistory(templateId)
      setHistory(updatedHistory)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject template')
    }
  }

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await ratesService.getTemplateHistory(templateId)
        setHistory(history)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load history')
      }
    }

    if (templateId) {
      loadHistory()
    }
  }, [templateId])

  if (!template) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Rate Template Approval</h2>

      {error && (
        <div className="text-red-600 mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <h3>Template Details</h3>
        <p>Name: {template.template_name}</p>
        <p>Type: {template.template_type}</p>
        <p>Base Rate: ${template.base_rate}</p>
        <p>Status: {template.status}</p>
      </div>

      <div className="mb-4">
        <label className="block mb-2">
          Notes:
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="block w-full mt-1"
          />
        </label>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleApprove}
          disabled={template.status === 'approved'}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Approve
        </button>
        <button
          onClick={handleReject}
          disabled={template.status === 'rejected'}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Reject
        </button>
      </div>

      <div className="mt-8">
        <h3>Approval History</h3>
        {history.map((entry) => (
          <div key={entry.id} className="border-t py-2">
            <p>
              {entry.action === 'approve' ? 'Approved' : 'Rejected'} on{' '}
              {new Date(entry.created_at).toLocaleDateString()}
            </p>
            {entry.notes && <p>Notes: {entry.notes}</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
