import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Service } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '../../components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [procedure, setProcedure] = useState('');
  const [fee, setFee] = useState('');
  const [reqDocs, setReqDocs] = useState('');

  const fetchServices = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'services'));
      const servicesList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Service[];
      setServices(servicesList);
    } catch (error) {
      console.error("Error fetching services: ", error);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenDialog = (service?: Service) => {
    if (service) {
      setEditingService(service);
      setName(service.name);
      setDescription(service.description);
      setProcedure(service.procedure);
      setFee(service.fee.toString());
      setReqDocs(service.requiredDocuments.join(', '));
    } else {
      setEditingService(null);
      setName('');
      setDescription('');
      setProcedure('');
      setFee('');
      setReqDocs('');
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const serviceData = {
      name,
      description,
      procedure,
      fee: Number(fee),
      requiredDocuments: reqDocs.split(',').map(d => d.trim()).filter(Boolean),
    };
    
    try {
      if (editingService) {
        await setDoc(doc(db, 'services', editingService.id), serviceData);
      } else {
        await addDoc(collection(db, 'services'), serviceData);
      }
      await fetchServices();
      setIsDialogOpen(false);
      toast.success(editingService ? 'Service updated' : 'Service created');
    } catch (error) {
      console.error("Error saving service: ", error);
      toast.error("Failed to save service");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
        await fetchServices();
        toast.success('Service removed');
      } catch (error) {
        console.error("Error deleting service: ", error);
        toast.error("Failed to delete service");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-3">Manage Services</h1>
          <p className="text-muted-foreground mt-1 pl-3 font-medium">Add or edit services provided by the Maiyam.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 px-6">
              <Plus className="w-4 h-4 mr-2" /> Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto card-container border-none shadow-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-primary">{editingService ? 'Edit Service' : 'Add New Service'}</DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium">Configure the requirements, fees and procedures below.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Service Name</Label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Income Certificate" className="rounded-xl border-primary/20 focus-visible:ring-primary bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                <Textarea required value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl border-primary/20 focus-visible:ring-primary bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Procedure Details</Label>
                <Textarea required value={procedure} onChange={e => setProcedure(e.target.value)} className="h-32 rounded-xl border-primary/20 focus-visible:ring-primary bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Fee (₹)</Label>
                <Input required type="number" min="0" value={fee} onChange={e => setFee(e.target.value)} className="rounded-xl border-primary/20 focus-visible:ring-primary bg-background" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Required Documents (comma separated)</Label>
                <Input required value={reqDocs} onChange={e => setReqDocs(e.target.value)} placeholder="Aadhaar, Ration Card, Passport Photo" className="rounded-xl border-primary/20 focus-visible:ring-primary bg-background" />
              </div>
              <div className="flex justify-end pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-8 h-10">Save Service</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-container border-none overflow-hidden">
        <Table>
          <TableHeader className="bg-accent/50 border-b border-primary/10">
            <TableRow>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider py-4">Service Name</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider py-4">Fee</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider py-4">Documents</TableHead>
              <TableHead className="font-bold text-xs uppercase text-muted-foreground tracking-wider text-right py-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services.map(s => (
              <TableRow key={s.id} className="border-b border-primary/5 hover:bg-accent/20">
                <TableCell className="font-bold text-sm text-foreground py-4">{s.name}</TableCell>
                <TableCell className="font-medium text-sm text-muted-foreground py-4">₹{s.fee}</TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {s.requiredDocuments.map(d => (
                      <span key={d} className="px-2.5 py-1 bg-accent text-primary text-[10px] font-bold tracking-wider uppercase rounded-full border border-primary/10">{d}</span>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right py-4">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(s)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg h-8 w-8 p-0">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg ml-2 h-8 w-8 p-0">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {services.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground font-medium bg-accent/30">No services added yet.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
