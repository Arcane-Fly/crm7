import { createClient } from '@/lib/supabase/client'
import { RatesCalculator } from './rates-calc'

interface InvoiceLineItem {
  description: string
  quantity: number
  unitPrice: number
  taxRate: number
  timesheetId?: string
  placementId?: string
}

interface InvoiceCreate {
  orgId: string
  hostEmployerId: string
  dueDate: Date
  referenceNumber?: string
  notes?: string
  lineItems: InvoiceLineItem[]
}

interface Payment {
  amount: number
  paymentMethod: string
  reference?: string
  notes?: string
}

export class InvoiceService {
  private supabase = createClient()
  private calculator = new RatesCalculator()

  async createInvoice(data: InvoiceCreate) {
    const { data: invoice, error: invoiceError } = await this.supabase
      .from('invoices')
      .insert({
        org_id: data.orgId,
        host_employer_id: data.hostEmployerId,
        invoice_date: new Date(),
        due_date: data.dueDate,
        reference_number: data.referenceNumber,
        notes: data.notes,
        status: 'unpaid'
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create line items
    const lineItems = data.lineItems.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      tax_rate: item.taxRate,
      line_subtotal: item.quantity * item.unitPrice,
      line_tax_amount: (item.quantity * item.unitPrice) * (item.taxRate / 100),
      line_total: (item.quantity * item.unitPrice) * (1 + item.taxRate / 100),
      timesheet_id: item.timesheetId,
      placement_id: item.placementId
    }))

    const { error: lineItemError } = await this.supabase
      .from('invoice_line_items')
      .insert(lineItems)

    if (lineItemError) throw lineItemError

    return invoice
  }

  async createFromTimesheets(timesheetIds: string[]) {
    // Fetch timesheets with employee and job details
    const { data: timesheets, error: timesheetError } = await this.supabase
      .from('timesheets')
      .select(`
        *,
        employees (
          id,
          first_name,
          last_name
        ),
        jobs (
          id,
          title,
          host_employer_id
        )
      `)
      .in('id', timesheetIds)

    if (timesheetError) throw timesheetError

    // Group timesheets by host employer
    const byEmployer = timesheets.reduce((acc, timesheet) => {
      const employerId = timesheet.jobs.host_employer_id
      if (!acc[employerId]) acc[employerId] = []
      acc[employerId].push(timesheet)
      return acc
    }, {})

    // Create invoice for each host employer
    const invoices = []
    for (const [employerId, sheets] of Object.entries(byEmployer)) {
      const lineItems = sheets.map(timesheet => {
        const calculation = this.calculator.calculateChargeRate(
          timesheet.pay_rate,
          [] // Add any additional components
        )

        return {
          description: `${timesheet.employees.first_name} ${timesheet.employees.last_name} - ${timesheet.jobs.title}`,
          quantity: timesheet.total_hours,
          unitPrice: calculation.total,
          taxRate: 10, // 10% GST
          timesheetId: timesheet.id
        }
      })

      const invoice = await this.createInvoice({
        orgId: sheets[0].organization_id,
        hostEmployerId: employerId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        lineItems
      })

      invoices.push(invoice)
    }

    return invoices
  }

  async recordPayment(invoiceId: string, payment: Payment) {
    const { error } = await this.supabase
      .from('payments')
      .insert({
        invoice_id: invoiceId,
        payment_date: new Date(),
        amount: payment.amount,
        payment_method: payment.paymentMethod,
        reference: payment.reference,
        notes: payment.notes
      })

    if (error) throw error
  }

  async createCreditNote(invoiceId: string, amount: number, reason: string) {
    const { error } = await this.supabase
      .from('credit_notes')
      .insert({
        invoice_id: invoiceId,
        credit_date: new Date(),
        amount,
        reason
      })

    if (error) throw error
  }

  async getInvoiceWithDetails(invoiceId: string) {
    const { data, error } = await this.supabase
      .from('invoices')
      .select(`
        *,
        invoice_line_items (*),
        payments (*),
        credit_notes (*),
        organizations!host_employer_id (
          id,
          name,
          abn,
          address
        )
      `)
      .eq('id', invoiceId)
      .single()

    if (error) throw error
    return data
  }

  async getOverdueInvoices() {
    const { data, error } = await this.supabase
      .from('invoices')
      .select('*')
      .lt('due_date', new Date().toISOString())
      .in('status', ['unpaid', 'partially_paid'])

    if (error) throw error
    return data
  }
}
