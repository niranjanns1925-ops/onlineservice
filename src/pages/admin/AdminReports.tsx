import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Application } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Label } from '../../components/ui/label';
import { DownloadCloud, FileSpreadsheet, FileIcon as FilePdf } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function AdminReports() {
  const [apps, setApps] = useState<Application[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [month, setMonth] = useState<string>('all');

  useEffect(() => {
    async function fetchApps() {
      try {
        const querySnapshot = await getDocs(collection(db, 'applications'));
        const appsList = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Application[];
        setApps(appsList);
      } catch (error) {
        console.error("Error fetching applications: ", error);
      }
    }
    fetchApps();
  }, []);

  const getFilteredData = () => {
    return apps.filter(app => {
      const matchStatus = filterStatus === 'all' || app.status === filterStatus;
      const appMonth = new Date(app.appliedAt).getMonth().toString();
      const matchMonth = month === 'all' || appMonth === month;
      return matchStatus && matchMonth;
    });
  };

  const exportExcel = () => {
    const data = getFilteredData().map(a => ({
      ID: a.id,
      Applicant: a.userName,
      Service: a.serviceName,
      Status: a.status.toUpperCase(),
      Applied_Date: new Date(a.appliedAt).toLocaleDateString(),
      Updated_Date: new Date(a.updatedAt).toLocaleDateString(),
      Rejection_Reason: a.rejectionReason || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Applications");
    XLSX.writeFile(wb, "Esevai_Report.xlsx");
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Lakshmi E-Sevai Maiyam - Applications Report", 14, 15);
    
    const data = getFilteredData().map(a => [
      a.userName,
      a.serviceName,
      a.status.toUpperCase(),
      new Date(a.appliedAt).toLocaleDateString()
    ]);

    (doc as any).autoTable({
      head: [['Applicant', 'Service', 'Status', 'Date']],
      body: data,
      startY: 20,
    });

    doc.save("Esevai_Report.pdf");
  };

  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-3">Reports & Downloads</h1>
          <p className="text-muted-foreground mt-1 pl-3 font-medium">Export application data for record keeping.</p>
        </div>
      </div>

      <Card className="card-container border-none shadow-sm">
        <CardHeader className="bg-accent/40 pb-6 border-b border-primary/5">
          <CardTitle className="text-primary font-bold">Filter Data</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Select filters before downloading the report.</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Application Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="rounded-xl border-primary/20 bg-background text-foreground font-medium">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent className="card-container border-none shadow-xl">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="rounded-xl border-primary/20 bg-background text-foreground font-medium">
                  <SelectValue placeholder="All Months" />
                </SelectTrigger>
                <SelectContent className="card-container border-none shadow-xl">
                  <SelectItem value="all">All Months</SelectItem>
                  <SelectItem value={currentMonth.toString()}>Current Month</SelectItem>
                  <SelectItem value={(currentMonth - 1).toString()}>Last Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="pt-6 flex gap-4 border-t border-primary/5">
            <Button onClick={exportExcel} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 px-6 gap-2 flex-1 md:flex-none">
              <FileSpreadsheet className="w-4 h-4" /> Export as Excel
            </Button>
            <Button onClick={exportPDF} variant="outline" className="border-primary/20 text-primary hover:bg-accent hover:border-primary/40 font-bold rounded-xl h-11 px-6 gap-2 flex-1 md:flex-none">
              <FilePdf className="w-4 h-4" /> Export as PDF
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="card-container border-none p-6">
         <h3 className="font-bold text-[10px] tracking-wider uppercase text-muted-foreground mb-1">Summary</h3>
         <p className="text-foreground font-medium">Total matching records: <span className="font-bold text-primary pl-1 text-lg">{getFilteredData().length}</span></p>
      </div>
    </div>
  );
}
