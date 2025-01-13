import { supabase } from '../../../lib/supabase';

interface EmailVariables {
  [key: string]: string | number;
}

interface EmailTemplate {
  id: string;
  type: string;
  subject: string;
  body: string;
  is_active: boolean;
}

interface EmailNotification {
  organization_id: string;
  template_id: string;
  recipient_email: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'failed';
  attachments?: Array<{
    filename: string;
    content: Blob;
  }>;
}

export async function sendTemplatedEmail(
  templateType: string,
  recipientEmail: string,
  variables: EmailVariables,
  attachments?: Array<{ filename: string; content: Blob }>
) {
  try {
    // Get email template
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('*')
      .eq('type', templateType)
      .eq('is_active', true)
      .single();

    if (templateError) throw templateError;

    // Replace variables in template
    const { subject, body } = replaceTemplateVariables(template, variables);

    // Create email notification
    const { error: notificationError } = await supabase
      .from('email_notifications')
      .insert({
        organization_id: getCurrentOrganizationId(),
        template_id: template.id,
        recipient_email: recipientEmail,
        subject,
        body,
        status: 'pending',
        attachments
      });

    if (notificationError) throw notificationError;

    // In production, this would trigger your email sending service
    // For now, we'll just log it
    console.log('Email notification created:', {
      to: recipientEmail,
      subject,
      body,
      attachments: attachments?.map(a => a.filename)
    });

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

function replaceTemplateVariables(
  template: EmailTemplate,
  variables: EmailVariables
): { subject: string; body: string } {
  let subject = template.subject;
  let body = template.body;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    subject = subject.replace(regex, String(value));
    body = body.replace(regex, String(value));
  });

  return { subject, body };
}

function getCurrentOrganizationId(): string {
  // This would be implemented based on your auth context
  return 'default-org-id';
}

export async function sendQuoteEmail(
  quoteId: string,
  type: 'quote_sent' | 'quote_accepted' | 'quote_rejected',
  variables: EmailVariables
) {
  try {
    // Get quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        *,
        employer:employer_id(
          email:contact_email
        )
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError) throw quoteError;

    await sendTemplatedEmail(
      type,
      quote.employer.email,
      {
        ...variables,
        quote_id: quoteId,
        quote_amount: quote.amount,
        quote_date: quote.created_at
      }
    );

  } catch (error) {
    console.error('Error sending quote email:', error);
    throw error;
  }
}
