import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Service } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { FileText, IndianRupee, ArrowRight, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function UserServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feeRange, setFeeRange] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchServices() {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const servicesList = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Service[];
        setServices(servicesList);
      } catch (error) {
        console.error("Error fetching services: ", error);
      } finally {
        setLoading(false);
      }
    }
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           s.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      let matchesFee = true;
      if (feeRange === 'free') matchesFee = s.fee === 0;
      else if (feeRange === 'low') matchesFee = s.fee > 0 && s.fee <= 100;
      else if (feeRange === 'medium') matchesFee = s.fee > 100 && s.fee <= 500;
      else if (feeRange === 'high') matchesFee = s.fee > 500;

      return matchesSearch && matchesFee;
    });
  }, [services, searchQuery, feeRange]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-3">Available Services</h1>
          <p className="text-muted-foreground pl-3 font-medium">Browse and apply for certificates and government services.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search services (e.g. Income Tax, Birth Certificate)..." 
              className="pl-11 rounded-xl h-12 bg-white/50 border-primary/10 focus-visible:ring-primary shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[200px]">
             <Select value={feeRange} onValueChange={setFeeRange}>
                <SelectTrigger className="rounded-xl h-12 bg-white/50 border-primary/10 focus:ring-primary shadow-sm">
                  <SelectValue placeholder="Filter by Fee" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/10">
                  <SelectItem value="all">All Fees</SelectItem>
                  <SelectItem value="free">Free Services</SelectItem>
                  <SelectItem value="low">Under ₹100</SelectItem>
                  <SelectItem value="medium">₹100 - ₹500</SelectItem>
                  <SelectItem value="high">Over ₹500</SelectItem>
                </SelectContent>
             </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((s, idx) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="card-container h-full flex flex-col border-none p-0 overflow-hidden">
              <CardHeader className="bg-accent/40 pb-4 border-b border-primary/5">
                <CardTitle className="text-xl text-primary font-bold line-clamp-1">{s.name}</CardTitle>
                <CardDescription className="line-clamp-2 h-10 font-medium text-muted-foreground">{s.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 flex-1 space-y-4">
                <div className="flex items-center text-sm text-foreground font-bold bg-accent/50 p-3 rounded-xl border border-primary/5">
                  <IndianRupee className="w-4 h-4 mr-2 text-primary" />
                  <span className="text-muted-foreground text-[10px] tracking-wider uppercase mr-2">Processing Fee</span> ₹{s.fee}
                </div>
                <div>
                  <div className="flex items-center text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-3">
                    <FileText className="w-4 h-4 mr-2 text-primary" />
                    Required Documents
                  </div>
                  <ul className="text-sm text-foreground font-medium list-disc pl-5 space-y-1.5">
                    {s.requiredDocuments.slice(0, 3).map(d => (
                      <li key={d} className="line-clamp-1">{d}</li>
                    ))}
                    {s.requiredDocuments.length > 3 && (
                      <li className="text-primary text-xs font-bold mt-2">+{s.requiredDocuments.length - 3} more required</li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-6 px-6">
                <Button 
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-11 group"
                  onClick={() => navigate(`/user/apply/${s.id}`)}
                >
                  Apply Now <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
        {services.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground font-medium bg-accent/30 rounded-2xl border border-dashed border-primary/20">
            No services are currently available. Check back later.
          </div>
        )}
      </div>
    </div>
  );
}
