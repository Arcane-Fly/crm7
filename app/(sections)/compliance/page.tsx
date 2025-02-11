import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Compliance | CRM7',
  description: 'Compliance management and reporting',
};

export default function CompliancePage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Compliance Management</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage compliance requirements and reports.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Track recent compliance-related activities and updates.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Document Storage & Versioning</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage and store compliance-related documents with version control.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Continuously monitor compliance requirements and statuses.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alert System</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Generate alerts for compliance issues, such as missing or expiring certifications.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Maintain a detailed log of compliance-related activities and changes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Regulatory Reporting</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Generate reports to meet regulatory requirements.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
