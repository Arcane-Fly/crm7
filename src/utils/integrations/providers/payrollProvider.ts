import { supabase } from '../../../lib/supabase';
import type { IntegrationConnection } from '../../../types/integration';
import type { TimeEntry, PayRate } from '../../../types/payroll';

export async function syncPayrollData(connection: IntegrationConnection) {
  try {
    // Fetch timesheet data from our system
    const { data: timeEntries, error: timeError } = await supabase
      .from('time_entries')
      .select('*')
      .eq('status', 'approved')
      .eq('synced', false);

    if (timeError) throw timeError;

    // Transform data according to provider requirements
    const transformedData = transformTimesheetData(timeEntries, connection);

    // Send data to payroll provider
    const response = await sendToPayrollProvider(transformedData, connection);

    // Update sync status
    if (response.success) {
      await supabase
        .from('time_entries')
        .update({ synced: true, sync_date: new Date().toISOString() })
        .in('id', timeEntries.map(entry => entry.id));

      // Log successful sync
      await logSync(connection.id, 'timesheet_sync', 'success', 
        `Successfully synced ${timeEntries.length} timesheet entries`);
    }

    return response;
  } catch (error) {
    // Log sync error
    await logSync(connection.id, 'timesheet_sync', 'error', 
      error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

function transformTimesheetData(
  entries: TimeEntry[], 
  connection: IntegrationConnection
) {
  // Get field mappings for the connection
  const mappings = getFieldMappings(connection.id);
  
  // Transform data according to mappings
  return entries.map(entry => {
    const transformed = {};
    for (const [source, target] of Object.entries(mappings)) {
      transformed[target] = entry[source];
    }
    return transformed;
  });
}

async function sendToPayrollProvider(data: any[], connection: IntegrationConnection) {
  const { credentials, config } = connection;
  
  // Implementation would vary based on provider's API
  // This is a placeholder for the actual API call
  return { success: true };
}

async function logSync(
  connectionId: string,
  eventType: string,
  status: 'success' | 'error' | 'warning',
  message: string,
  details?: Record<string, any>
) {
  await supabase.from('integration_logs').insert({
    connection_id: connectionId,
    event_type: eventType,
    status,
    message,
    details
  });
}

function getFieldMappings(connectionId: string) {
  // Fetch and return field mappings for the connection
  return {
    date: 'work_date',
    startTime: 'start_time',
    endTime: 'end_time',
    breakDuration: 'break_minutes',
    // Add more field mappings as needed
  };
}
