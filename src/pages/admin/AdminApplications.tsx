import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Application } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { CheckCircle2, XCircle, Eye, Download, FileText, Lock, Monitor, Clock, AlertCircle } from 'lucide-react';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { decryptDocument } from '../../lib/encryption';

export default function AdminApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [decryptedDocs, setDecryptedDocs] = useState<Record<string, string>>({});
  const [rejectReason, setRejectReason] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'applications'), orderBy('appliedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const appsList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Application[];
      setApps(appsList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      handleDecryptAll(selectedApp);
    } else {
      setDecryptedDocs({});
    }
  }, [selectedApp]);

  const handleDecryptAll = async (app: Application) => {
    setIsDecrypting(true);
    const results: Record<string, string> = {};
    const secret = `${app.userId}_SECRET_VAULT`;
    
    try {
      for (const [name, encrypted] of Object.entries(app.uploadedDocuments)) {
        if (encrypted.startsWith('data:')) {
          results[name] = encrypted;
        } else {
          results[name] = await decryptDocument(encrypted, secret);
        }
      }
      
      // Decrypt additional docs if any
      if (app.additionalDocuments) {
        for (const [name, encrypted] of Object.entries(app.additionalDocuments)) {
          if (encrypted.startsWith('data:')) {
            results[name] = encrypted;
          } else {
            results[name] = await decryptDocument(encrypted, secret);
          }
        }
      }
      
      setDecryptedDocs(results);
    } catch (e) {
      console.error(e);
      toast.error("Failed to decrypt some documents. Unauthorized access block?");
    } finally {
      setIsDecrypting(false);
    }
  };

  const [adminNote, setAdminNote] = useState('');
  const [infoRequestedDetails, setInfoRequestedDetails] = useState('');

  const handleStatusUpdate = async (app: Application, status: 'accepted' | 'rejected' | 'processing' | 'info_requested', reason?: string) => {
    try {
      await updateDoc(doc(db, 'applications', app.id), {
        status,
        rejectionReason: status === 'rejected' ? (reason || null) : null,
        adminNote: status === 'accepted' ? (adminNote || null) : null,
        infoRequestedDetails: status === 'info_requested' ? (infoRequestedDetails || null) : null,
        updatedAt: new Date().toISOString()
      });
      setSelectedApp(null);
      setRejectReason('');
      setAdminNote('');
      setInfoRequestedDetails('');
      toast.success(`Application updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error("Error updating status: ", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted': return <Badge className="bg-primary/20 text-primary border-primary/30 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Accepted</Badge>;
      case 'rejected': return <Badge variant="destructive" className="shadow-none"><XCircle className="w-3 h-3 mr-1" /> Rejected</Badge>;
      case 'processing': return <Badge className="bg-blue-50 text-blue-700 border-blue-200 shadow-none"><Clock className="w-3 h-3 mr-1" /> Processing</Badge>;
      case 'info_requested': return <Badge className="bg-amber-50 text-amber-900 border-amber-200 shadow-none"><Lock className="w-3 h-3 mr-1" /> Info Requested</Badge>;
      default: return <Badge variant="secondary" className="bg-slate-100 text-slate-800 border-slate-200 shadow-none">Pending</Badge>;
    }
  };

  const downloadDocument = (docName: string, dataUrl: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${selectedApp?.userName}_${docName}`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-3">Applications Queue</h1>
          <p className="text-muted-foreground mt-1 pl-3 font-medium">Review and process user applications securely.</p>
        </div>
      </div>

      <Card className="card-container border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-accent/50 border-b border-primary/10">
            <TableRow>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider py-4">Applicant</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider py-4">Service</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider py-4">Date Applied</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider py-4">Status</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider text-right py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apps.map(app => (
              <TableRow key={app.id} className="border-b border-primary/5 hover:bg-accent/20">
                <TableCell className="font-bold text-sm text-foreground py-4">{app.userName}</TableCell>
                <TableCell className="font-medium text-sm text-muted-foreground py-4">{app.serviceName}</TableCell>
                <TableCell className="font-medium text-sm text-muted-foreground py-4">{new Date(app.appliedAt).toLocaleDateString()}</TableCell>
                <TableCell className="py-4">{getStatusBadge(app.status)}</TableCell>
                <TableCell className="text-right py-4">
                  <Button variant="outline" size="sm" onClick={() => setSelectedApp(app)} className="gap-2 border-primary/20 text-primary hover:bg-accent hover:border-primary/40 rounded-xl font-bold">
                    <Eye className="w-4 h-4" /> View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {apps.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-medium bg-accent/30">No applications found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-3xl card-container border-none shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-primary flex items-center gap-2">
               Application Details
               <Badge variant="outline" className="border-primary/20 text-primary flex items-center gap-1 font-bold text-[10px]">
                 <Lock className="w-3 h-3" /> E2EE Secure
               </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedApp && (
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm bg-accent/50 p-6 rounded-2xl border border-primary/10">
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Applicant Name</p>
                  <p className="font-bold text-foreground text-base mt-1">{selectedApp.userName}</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Service Required</p>
                  <p className="font-bold text-foreground text-base mt-1">{selectedApp.serviceName}</p>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Status</p>
                  <div>{getStatusBadge(selectedApp.status)}</div>
                </div>
                <div>
                  <p className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Submitted On</p>
                  <p className="font-bold text-foreground text-base mt-1">{new Date(selectedApp.appliedAt).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-sm tracking-wider uppercase text-muted-foreground">Uploaded Documents</h3>
                  {isDecrypting && <span className="text-[10px] text-primary font-bold animate-pulse">Decrypting...</span>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(decryptedDocs).map(([docName, dataUrl]) => {
                    const url = dataUrl as string;
                    return (
                      <Card key={docName} className="flex flex-col shadow-none border max-w-sm rounded-2xl bg-white border-primary/10 overflow-hidden">
                        <CardHeader className="py-3 px-4 border-b border-primary/5 bg-accent/30">
                          <CardTitle className="text-sm font-bold text-primary">{docName}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2 px-4 flex-1 flex items-center justify-center bg-transparent mt-4 mb-2 overflow-hidden">
                           {url.startsWith('data:image') ? (
                             <img src={url} alt={docName} className="max-h-32 object-contain rounded-xl border border-primary/10 shadow-sm" />
                           ) : (
                             <div className="flex flex-col items-center gap-2">
                               <FileText className="w-12 h-12 text-primary/30" />
                               <span className="text-[10px] font-bold text-muted-foreground">PDF / Document</span>
                             </div>
                           )}
                        </CardContent>
                        <div className="p-4 pt-0 mt-auto flex justify-end">
                           <Button size="sm" variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-accent rounded-lg font-bold" onClick={() => downloadDocument(docName, url)}>
                             <Download className="w-4 h-4" /> Download
                           </Button>
                        </div>
                      </Card>
                    );
                  })}
                  {/* Highlight Additional Documents */}
                  {selectedApp.additionalDocuments && Object.keys(selectedApp.additionalDocuments).length > 0 && (
                    <div className="col-span-full mt-4">
                       <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2 flex items-center gap-2">
                         <AlertCircle className="w-3 h-3" /> User Provided Additional Documents
                       </h4>
                    </div>
                  )}
                  {!isDecrypting && Object.keys(decryptedDocs).length === 0 && (
                    <div className="col-span-full py-8 text-center bg-red-50 rounded-2xl border border-red-100 text-red-800 text-xs font-bold">
                       CRITICAL: Data decryption failed. Key mismatch.
                    </div>
                  )}
                </div>
              </div>

              {['pending', 'processing', 'info_requested'].includes(selectedApp.status) && (
                <div className="pt-6 border-t border-primary/10 space-y-6">
                  <h3 className="font-bold text-sm tracking-wider uppercase text-muted-foreground flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-primary" /> Update Application State
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 bg-accent/20 rounded-2xl border border-primary/5">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Positive Actions</Label>
                       <div className="space-y-3">
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-muted-foreground ml-1">Admin Approval Note</Label>
                            <Textarea 
                              placeholder="Note for user (e.g. Pickup date)" 
                              value={adminNote}
                              onChange={(e) => setAdminNote(e.target.value)}
                              className="rounded-xl border-primary/10 bg-white h-20 text-xs"
                            />
                         </div>
                         <div className="flex flex-col gap-2">
                           <Button onClick={() => handleStatusUpdate(selectedApp, 'accepted')} className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl h-10 w-full text-xs">
                             <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                           </Button>
                           <Button onClick={() => handleStatusUpdate(selectedApp, 'processing')} variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 font-bold rounded-xl h-10 w-full text-xs">
                             <Clock className="w-4 h-4 mr-2" /> Mark as Processing
                           </Button>
                         </div>
                       </div>
                    </div>

                    <div className="space-y-4 p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-amber-900">Corrective Actions</Label>
                       <div className="space-y-3">
                         <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold text-amber-700 ml-1">Details Requested / Rejection Reason</Label>
                            <Textarea 
                              placeholder="Be specific about what is missing..." 
                              value={infoRequestedDetails || rejectReason}
                              onChange={(e) => {
                                setInfoRequestedDetails(e.target.value);
                                setRejectReason(e.target.value);
                              }}
                              className="rounded-xl border-amber-200 bg-white h-20 text-xs"
                            />
                         </div>
                         <div className="flex flex-col gap-2">
                           <Button onClick={() => handleStatusUpdate(selectedApp, 'info_requested')} className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl h-10 w-full text-xs">
                             <AlertCircle className="w-4 h-4 mr-2" /> Request More Info
                           </Button>
                           <Button onClick={() => handleStatusUpdate(selectedApp, 'rejected', rejectReason)} variant="destructive" className="font-bold rounded-xl h-10 w-full text-xs">
                             <XCircle className="w-4 h-4 mr-2" /> Reject Application
                           </Button>
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
              {selectedApp.status === 'rejected' && selectedApp.rejectionReason && (
                 <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-200">
                    <p className="font-bold uppercase tracking-wider text-[10px] mb-1">Rejection Reason</p>
                    <p className="font-medium">{selectedApp.rejectionReason}</p>
                 </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
