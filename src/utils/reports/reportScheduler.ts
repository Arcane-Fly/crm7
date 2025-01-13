import { supabase } from '../../lib/supabase';
import { generateReport } from './reportGenerator';
import { sendEmail } from '../email';

interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  options: {
    fields: string[];
    filters?: Record<string, any>;
    groupBy?: string;
    sortBy?: string;
    format: 'pdf' | 'csv' | 'excel';
  };
  schedule: {
    frequency: 'daily' | 'weekly' | 'monthly';
    day?: number;
    time: string;
    email: string;
  };
  lastRun?: string;
  nextRun: string;
}

export async function scheduleReport(report: Omit<ScheduledReport, 'id' | 'nextRun'>) {
  const nextRun = calculateNextRun(report.schedule);

  const { data, error } = await supabase
    .from('scheduled_reports')
    .insert({
      ...report,
      next_run: nextRun,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function processScheduledReports() {
  const now = new Date();

  // Get reports due to run
  const { data: reports, error } = await supabase
    .from('scheduled_reports')
    .select('*')
    .lte('next_run', now.toISOString());

  if (error) throw error;

  for (const report of reports) {
    try {
      // Generate report
      const reportData = await fetchReportData(report.options);
      const blob = await generateReport(reportData, {
        title: report.name,
        description: report.description,
        ...report.options,
      });

      // Send email
      await sendEmail({
        to: report.schedule.email,
        subject: `Scheduled Report: ${report.name}`,
        text: `Your scheduled report "${report.name}" is attached.`,
        attachments: [{
          filename: `${report.name.toLowerCase().replace(/\s+/g, '-')}.${report.options.format}`,
          content: blob,
        }],
      });

      // Update next run time
      const nextRun = calculateNextRun(report.schedule);
      await supabase
        .from('scheduled_reports')
        .update({
          last_run: now.toISOString(),
          next_run: nextRun,
        })
        .eq('id', report.id);

    } catch (error) {
      console.error(`Failed to process scheduled report ${report.id}:`, error);
      // Log error and continue with next report
    }
  }
}

function calculateNextRun(schedule: ScheduledReport['schedule']): string {
  const now = new Date();
  const [hours, minutes] = schedule.time.split(':').map(Number);
  const next = new Date(now);

  next.setHours(hours, minutes, 0, 0);

  if (next <= now) {
    next.setDate(next.getDate() + 1);
  }

  switch (schedule.schedule.frequency) {
    case 'daily':
      // Already set for next day if needed
      break;

    case 'weekly':
      while (next.getDay() !== (schedule.day || 1)) {
        next.setDate(next.getDate() + 1);
      }
      break;

    case 'monthly':
      next.setDate(schedule.day || 1);
      if (next <= now) {
        next.setMonth(next.getMonth() + 1);
      }
      break;
  }

  return next.toISOString();
}

async function fetchReportData(options: ScheduledReport['options']) {
  // Implement data fetching based on report options
  const { data, error } = await supabase
    .from('report_data_view')
    .select(options.fields.join(','))
    .order(options.sortBy || 'created_at', { ascending: true });

  if (error) throw error;
  return data;
}