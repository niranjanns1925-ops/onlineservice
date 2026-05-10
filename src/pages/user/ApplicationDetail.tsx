import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Application } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { CheckCircle2, XCircle, Clock, AlertCircle, FileUp, ArrowLeft, Loader2, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchApp() {
      if (!id) return;
      try {
        const docRef = doc(db, 'applications', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setApp({ ...docSnap.data(), id: docSnap.id } as Application);
        } else {
          toast.error("Application not found");
          navigate('/user/applications');
        }
      } catch (error) {
        console.error("Error fetching application:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchApp();
  }, [id, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => ({ ...prev, [docName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAdditional = async () => {
    if (!id || !app) return;
    if (Object.keys(files).length === 0) {
      toast.error("Please upload at least one document");
      return;
    }

    setSubmitting(true);
    try {
      const docRef = doc(db, 'applications', id);
      await updateDoc(docRef, {
        additionalDocuments: {
          ...(app.additionalDocuments || {}),
          ...files
        },
        status: 'pending', // Revert to pending for admin to review
        updatedAt: new Date().toISOString()
      });

      // Notify Admin
      try {
        await addDoc(collection(db, 'admin_notifications'), {
          type: 'doc_uploaded',
          userId: app.userId,
          userName: app.userName,
          applicationId: id,
          serviceName: app.serviceName,
          timestamp: new Date().toISOString(),
          read: false
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
      toast.success("Additional documents submitted successfully");
      navigate('/user/applications');
    } catch (error) {
      console.error("Error submitting documents:", error);
      toast.error("Failed to submit documents");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!app) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate('/user/applications')} 
        className="rounded-xl font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Applications
      </Button>

      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{app.serviceName}</h1>
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mt-1">
              Application ID: <span className="text-primary">{app.id}</span>
            </p>
          </div>
          <Badge className="px-5 py-2 text-xs font-black uppercase tracking-widest rounded-full border-none shadow-sm h-fit">
            {app.status.replace('_', ' ')}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {['pending', 'processing', 'info_requested'].includes(app.status) && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${app.status === 'info_requested' ? 'bg-amber-50 border-amber-200' : 'bg-primary/5 border-primary/10'} border rounded-[24px] p-8 space-y-4 shadow-sm`}
            >
              <div className={`flex items-center gap-3 ${app.status === 'info_requested' ? 'text-amber-900' : 'text-primary'} mb-2`}>
                {app.status === 'info_requested' ? <AlertCircle className="w-6 h-6" /> : <FileUp className="w-6 h-6" />}
                <h2 className="text-xl font-extrabold tracking-tight">
                  {app.status === 'info_requested' ? 'Action Required' : 'Add More Documents'}
                </h2>
              </div>
              <div className="space-y-4">
                  <div className={`p-4 ${app.status === 'info_requested' ? 'bg-white/50 border-amber-100 text-amber-800' : 'bg-white/80 border-primary/5 text-muted-foreground'} rounded-xl border italic font-medium leading-relaxed`}>
                     {app.status === 'info_requested' 
                       ? `"${app.infoRequestedDetails || "The administrator has requested additional documentation for verification."}"`
                       : "If you forgot to upload a document or want to provide additional proof, you can add them here."}
                  </div>
                  
                  <div className="space-y-6 pt-4">
                     <div className="space-y-4">
                        <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Upload Files</Label>
                        <div className="grid gap-4">
                           <div className="space-y-2">
                              <Input 
                                type="file" 
                                className={`h-12 rounded-xl bg-white focus-visible:ring-primary border-muted-foreground/20`}
                                onChange={(e) => handleFileChange(e, 'user_addition_' + Date.now())}
                              />
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Supports PDF, JPG, PNG (Max 5MB)</p>
                           </div>
                        </div>
                     </div>

                     <Button 
                       onClick={handleSubmitAdditional}
                       disabled={submitting || Object.keys(files).length === 0}
                       className={`w-full ${app.status === 'info_requested' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-primary hover:bg-primary/90 shadow-primary/20'} text-white rounded-2xl h-14 font-black uppercase tracking-widest flex gap-2 shadow-lg`}
                     >
                       {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileUp className="w-5 h-5" />}
                       Submit Additional Documents
                     </Button>
                  </div>
              </div>
            </motion.div>
          )}

          <Card className="card-container border-none p-0 overflow-hidden shadow-sm">
            <CardHeader className="bg-accent/30 border-b border-primary/5 pb-6">
              <CardTitle className="text-xl font-bold tracking-tight">Application Summary</CardTitle>
              <CardDescription className="font-medium">Details of your submitted request</CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Submission Date</Label>
                  <p className="text-foreground font-bold">{new Date(app.appliedAt).toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Last Updated</Label>
                  <p className="text-foreground font-bold">{new Date(app.updatedAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Uploaded Documents</Label>
                <div className="grid gap-3">
                  {Object.entries(app.uploadedDocuments).map(([name, url]) => (
                    <div key={name} className="flex items-center justify-between p-4 bg-accent/30 rounded-xl border border-primary/5 group">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-primary" />
                        <span className="text-sm font-bold text-foreground">{name.replace(/_/g, ' ')}</span>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 font-bold uppercase tracking-widest text-[10px] rounded-lg">View doc</Button>
                      </a>
                    </div>
                  ))}
                  {app.additionalDocuments && Object.entries(app.additionalDocuments).map(([name, url]) => (
                    <div key={name} className="flex items-center justify-between p-4 bg-amber-50/50 rounded-xl border border-amber-100 group">
                      <div className="flex items-center gap-3">
                        <FileUp className="w-5 h-5 text-amber-600" />
                        <span className="text-sm font-bold text-amber-900">Additional Doc: {name.replace(/additional_doc_/, '')}</span>
                      </div>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700 hover:bg-amber-100 font-bold uppercase tracking-widest text-[10px] rounded-lg">View doc</Button>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
           <Card className="card-container border-none p-0 overflow-hidden shadow-sm">
             <CardHeader className="bg-primary/5 border-b border-primary/5">
                <CardTitle className="text-lg font-bold tracking-tight text-primary">Process Timeline</CardTitle>
             </CardHeader>
             <CardContent className="p-6">
                <div className="space-y-6 relative border-l-2 border-primary/20 ml-3 pl-6 py-2">
                   {[
                     { label: 'Application Received', date: app.appliedAt, active: true },
                     { label: 'Verification Started', date: app.status !== 'pending' ? app.updatedAt : null, active: app.status !== 'pending' },
                     { label: 'Final Decision', date: ['accepted', 'rejected'].includes(app.status) ? app.updatedAt : null, active: ['accepted', 'rejected'].includes(app.status) }
                   ].map((step, idx) => (
                     <div key={idx} className="relative">
                        <div className={`absolute -left-[30px] top-1 w-2 h-2 rounded-full ring-4 ring-background ${step.active ? 'bg-primary' : 'bg-muted-foreground/30'}`}></div>
                        <p className={`text-sm font-bold ${step.active ? 'text-foreground' : 'text-muted-foreground'}`}>{step.label}</p>
                        {step.date && <p className="text-[10px] font-medium text-muted-foreground mt-0.5">{new Date(step.date).toLocaleDateString()}</p>}
                     </div>
                   ))}
                </div>
             </CardContent>
           </Card>

           <Card className="card-container border-none p-0 overflow-hidden shadow-sm bg-accent/20">
             <CardContent className="p-6">
                <div className="flex items-start gap-4">
                   <AlertCircle className="w-6 h-6 text-primary shrink-0" />
                   <div className="space-y-1">
                      <p className="text-sm font-black uppercase tracking-tight text-primary">Need Help?</p>
                      <p className="text-xs font-medium text-muted-foreground leading-relaxed">If you face any issues with document upload, contact our support team at support@lakshmiesevai.com</p>
                   </div>
                </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
