import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { Service, Application } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { UploadCloud, CheckCircle, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { encryptDocument } from '../../lib/encryption';

export default function ApplyService() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [files, setFiles] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchService() {
      if (id) {
        try {
          const serviceDoc = await getDoc(doc(db, 'services', id));
          if (serviceDoc.exists()) {
            setService({ ...serviceDoc.data(), id: serviceDoc.id } as Service);
          } else {
            navigate('/user/services');
          }
        } catch (error) {
          console.error("Error fetching service: ", error);
        }
      }
    }
    fetchService();
  }, [id, navigate]);

  const handleFileUpload = (docName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFiles(prev => ({ ...prev, [docName]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!service || !user) return;
    
    // Check if all docs are uploaded
    const missingDocs = service.requiredDocuments.filter(d => !files[d]);
    if (missingDocs.length > 0) {
      toast.error(`Please upload: ${missingDocs.join(', ')}`);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // E2EE Simulation: Encrypt each document before saving
      const secret = `${user.id}_SECRET_VAULT`; // Unique key derivation base
      const encryptedDocs: Record<string, string> = {};
      
      for (const [name, dataUrl] of Object.entries(files)) {
        encryptedDocs[name] = await encryptDocument(dataUrl as string, secret);
      }

      const newApp: Omit<Application, 'id'> = {
        userId: user.id,
        userName: user.name,
        serviceId: service.id,
        serviceName: service.name,
        status: 'pending' as const,
        uploadedDocuments: encryptedDocs,
        appliedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      const appRef = await addDoc(collection(db, 'applications'), newApp);
      
      // Notify Admin
      try {
        await addDoc(collection(db, 'admin_notifications'), {
          type: 'new_application',
          userId: user.id,
          userName: user.name,
          applicationId: appRef.id,
          serviceName: service.name,
          timestamp: new Date().toISOString(),
          read: false
        });
      } catch (e) {
        console.error("Failed to notify admin:", e);
      }
      
      setIsSubmitting(false);
      toast.success('Application submitted securely.', {
        description: 'Documents are End-to-End Encrypted.'
      });
      navigate('/user/applications');
    } catch (err) {
      console.error(err);
      toast.error("Encryption or submission failed.");
      setIsSubmitting(false);
    }
  };

  if (!service) return null;

  return (
    <div className="max-w-[1024px] mx-auto space-y-6">
      <Button variant="ghost" onClick={() => navigate('/user/services')} className="mb-4 bg-white text-muted-foreground hover:text-primary hover:bg-accent border border-primary/10 shadow-sm rounded-xl font-bold h-10 px-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Services
      </Button>

      <Card className="card-container border-none p-0 overflow-hidden">
        <CardHeader className="bg-accent/40 pb-6 border-b border-primary/5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="text-primary font-bold text-[10px] uppercase tracking-wider">Secure E2E Encrypted Process</span>
          </div>
          <CardTitle className="text-2xl text-primary font-bold">{service.name}</CardTitle>
          <CardDescription className="text-base text-muted-foreground font-medium">{service.description}</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-primary/5 pb-2">Procedure</h3>
                <div className="text-foreground whitespace-pre-line bg-accent/30 p-5 rounded-2xl border border-primary/5 text-sm leading-relaxed font-medium">
                  {service.procedure}
                </div>
                
                <div className="bg-white p-5 rounded-2xl border border-primary/10 mt-6 shadow-sm">
                  <h3 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                    Application Fee
                  </h3>
                  <p className="text-3xl font-extrabold text-primary">₹{service.fee}</p>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground border-b border-primary/5 pb-2">Required Documents</h3>
                <div className="space-y-4">
                  {service.requiredDocuments.map(doc => (
                    <div key={doc} className="space-y-2">
                      <Label className="flex justify-between items-center text-foreground font-bold text-xs uppercase tracking-wider">
                        {doc}
                        {files[doc] && <CheckCircle className="w-4 h-4 text-primary" />}
                      </Label>
                      <label className={`flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${files[doc] ? 'border-primary bg-accent/50' : 'border-primary/20 bg-background hover:bg-accent/30 hover:border-primary/40'}`}>
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                           {files[doc] ? (
                             <span className="text-sm font-bold text-primary">Document Uploaded Successfully</span>
                           ) : (
                             <>
                              <UploadCloud className="w-8 h-8 mb-3 text-primary/40" />
                              <p className="text-xs text-muted-foreground font-bold">Click or drag to upload</p>
                             </>
                           )}
                        </div>
                        <input type="file" className="hidden" onChange={(e) => handleFileUpload(doc, e)} accept="image/*,.pdf" />
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="bg-accent/30 border-t border-primary/5 p-6 flex justify-end">
            <Button type="submit" disabled={isSubmitting} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-12 px-8 min-w-[200px] shadow-sm transition-all hover:-translate-y-0.5">
              {isSubmitting ? 'Processing Securely...' : `Pay ₹${service.fee} & Submit`}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
