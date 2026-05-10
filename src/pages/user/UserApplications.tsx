import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useAuth } from '../../lib/auth';
import { Application } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Progress } from '../../components/ui/progress';

export default function UserApplications() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchApps() {
      if (user) {
        try {
          const q = query(
            collection(db, 'applications'), 
            where('userId', '==', user.id),
            orderBy('appliedAt', 'desc')
          );
          const querySnapshot = await getDocs(q);
          const appsList = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
          })) as Application[];
          setApps(appsList);
        } catch (error) {
          handleFirestoreError(error, OperationType.LIST, 'applications');
        } finally {
          setLoading(false);
        }
      }
    }
    fetchApps();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle2 className="w-5 h-5 text-primary" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-600" />;
      case 'processing': return <Clock className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'info_requested': return <AlertCircle className="w-5 h-5 text-amber-600" />;
      default: return <Clock className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return "bg-primary/10 text-primary border-primary/20";
      case 'rejected': return "bg-red-50 text-red-700 border-red-200";
      case 'processing': return "bg-blue-50 text-blue-700 border-blue-200";
      case 'info_requested': return "bg-amber-50 text-amber-900 border-amber-200";
      default: return "bg-amber-50 text-amber-700 border-amber-200";
    }
  };

  const getProgressValue = (status: string) => {
    switch (status) {
      case 'pending': return 25;
      case 'info_requested': return 40;
      case 'processing': return 65;
      case 'accepted': return 100;
      case 'rejected': return 100;
      default: return 10;
    }
  };

  const getEstimatedDays = (status: string) => {
     switch (status) {
       case 'pending': return "2-3 business days";
       case 'processing': return "1-2 business days";
       case 'info_requested': return "Awaiting your action";
       case 'accepted': return "Completed";
       case 'rejected': return "No longer active";
       default: return "Calculating...";
     }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-3">My Applications</h1>
        <p className="text-muted-foreground mt-1 pl-3 font-medium">Track the status of your requested services.</p>
      </div>

      <div className="grid gap-4">
        {apps.map((app, idx) => (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="card-container border-none p-0 overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className={`p-4 rounded-[16px] shrink-0 ${app.status === 'accepted' ? 'bg-primary/10' : app.status === 'rejected' ? 'bg-red-100' : 'bg-primary/20'}`}>
                    {getStatusIcon(app.status)}
                  </div>
                  
                  <div className="flex-1 space-y-4 w-full">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {app.serviceName}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          Ref: <span className="text-primary">{app.id}</span> • Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-start md:items-end gap-1.5">
                        <Badge className={`px-4 py-1 text-[10px] font-black uppercase tracking-[0.1em] border-none shadow-sm rounded-full ${getStatusColor(app.status)}`}>
                          {app.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                          Est. Completion: <span className="text-primary">{app.estimatedCompletionAt ? new Date(app.estimatedCompletionAt).toLocaleDateString() : getEstimatedDays(app.status)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Overall Progress</span>
                          <span className="text-primary">{getProgressValue(app.status)}%</span>
                       </div>
                       <Progress value={getProgressValue(app.status)} className="h-2 rounded-full" />
                    </div>
                    
                    {app.status === 'rejected' && app.rejectionReason && (
                      <div className="p-3 bg-red-50/50 border border-red-100 rounded-xl text-sm font-medium text-red-800 animate-in fade-in slide-in-from-top-1 duration-500">
                        <strong className="tracking-wider uppercase text-[10px] block mb-1">Reason for Rejection</strong> {app.rejectionReason}
                      </div>
                    )}
                    
                    {app.status === 'info_requested' && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-[16px] space-y-3 animate-in zoom-in-95 duration-500">
                        <div className="flex items-center gap-2 text-amber-900">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase tracking-widest">Additional Documents Required</span>
                        </div>
                        <p className="text-sm font-medium text-amber-800 pl-6">
                          {app.infoRequestedDetails || "The administrator has requested more information or documents to process your application."}
                        </p>
                        <div className="pl-6">
                           <Button 
                             size="sm" 
                             className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold px-6 h-9"
                             onClick={() => window.location.href=`/user/applications/${app.id}`}
                           >
                             Upload Documents
                           </Button>
                        </div>
                      </div>
                    )}

                    {app.status === 'accepted' && (
                      <div className="p-3 bg-primary/5 border border-primary/10 rounded-xl text-sm font-medium text-primary animate-in fade-in slide-in-from-top-1 duration-500">
                        <strong className="tracking-wider uppercase text-[10px] block mb-1">Status Update</strong> {app.adminNote || "Your application has been approved. You can collect your certificate or download it when available."}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {apps.length === 0 && (
          <div className="py-16 bg-accent/30 border border-dashed border-primary/20 rounded-2xl text-center">
            <p className="text-muted-foreground font-medium mb-4">You haven't applied for any services yet.</p>
            <Button variant="outline" onClick={() => window.location.href='/user/services'} className="rounded-xl border-primary/20 text-primary hover:bg-accent font-bold">
              Browse Services
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
