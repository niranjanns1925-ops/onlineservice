import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { Service } from '../../types';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { FileText, IndianRupee, ArrowRight, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

export default function UserServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [feeRange, setFeeRange] = useState('all');
  const [category, setCategory] = useState('all');
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
        handleFirestoreError(error, OperationType.LIST, 'services');
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

      const matchesCategory = category === 'all' || s.category === category;

      return matchesSearch && matchesFee && matchesCategory;
    });
  }, [services, searchQuery, feeRange, category]);

  const categories = useMemo(() => {
    const cats = new Set(services.map(s => s.category).filter(Boolean));
    return Array.from(cats);
  }, [services]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-3">Available Services</h1>
          <p className="text-muted-foreground pl-3 font-medium">Browse and apply for certificates and government services.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full md:max-w-3xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Search services..." 
              className="pl-11 rounded-xl h-12 bg-white/50 border-primary/10 focus-visible:ring-primary shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-[180px]">
             <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl h-12 bg-white/50 border-primary/10 focus:ring-primary shadow-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-primary/10">
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
             </Select>
          </div>
          <div className="w-full sm:w-[150px]">
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
            whileHover={{ y: -5 }}
            className="flex h-full"
          >
            <Card className="card-container flex flex-col w-full border-none hover:shadow-xl transition-all duration-300 group overflow-hidden">
              <CardHeader className="pb-4 relative bg-accent/40 border-b border-primary/5">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] border-primary/20 text-primary bg-white/50">
                    {s.category || 'General'}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold tracking-tight line-clamp-1 text-primary">{s.name}</CardTitle>
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
