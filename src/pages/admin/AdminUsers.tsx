import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { User, useAuth } from '../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { User as UserIcon, ShieldAlert, ShieldCheck, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const q = query(collection(db, 'users'), orderBy('email'));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as User[];
      setUsers(usersList);
    } catch (error) {
      console.error("Error fetching users: ", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (targetUser: User) => {
    // Prevent self-demotion for safety - wait, there's only one super admin usually
    // But let's verify if user wants to prevent demoting the super admin.
    if (targetUser.email === 'niranjanns1925@gmail.com') {
      toast.error("Super Admin role cannot be changed.");
      return;
    }

    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      await updateDoc(doc(db, 'users', targetUser.id), {
        role: newRole
      });

      // Log the action for audit
      await addDoc(collection(db, 'audit_logs'), {
        action: 'ROLE_CHANGE',
        actingAdminId: currentUser?.id,
        actingAdminName: currentUser?.name,
        targetUserId: targetUser.id,
        targetUserName: targetUser.name,
        oldRole: targetUser.role,
        newRole: newRole,
        timestamp: serverTimestamp()
      });

      toast.success(`User ${targetUser.name} is now a ${newRole}`);
      await fetchUsers();
    } catch (error) {
      console.error("Error updating role: ", error);
      toast.error("Failed to update user role");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground border-l-4 border-primary pl-3 text-red-500">User & Admin Management</h1>
        <p className="text-muted-foreground mt-1 pl-3 font-medium">Promote users to admin or manage access levels.</p>
      </div>

      <Card className="card-container border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-accent/40 border-b border-primary/5 pb-6">
          <CardTitle className="text-primary font-bold">Authorized Personnel</CardTitle>
          <CardDescription className="text-muted-foreground font-medium">Manage who can access the administration queue and reports.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-4 px-6">User Information</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-4">Role</TableHead>
                <TableHead className="font-bold text-xs uppercase tracking-wider text-muted-foreground py-4 text-right px-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-b border-primary/5 hover:bg-accent/20 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-xs ${u.role === 'admin' ? 'bg-primary' : 'bg-slate-400'}`}>
                        {u.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">{u.name}</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    {u.role === 'admin' ? (
                      <Badge className="bg-primary/20 text-primary border-primary/30 shadow-none hover:bg-primary/20">
                        <ShieldCheck className="w-3 h-3 mr-1" /> Administrator
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200 shadow-none">
                        <UserIcon className="w-3 h-3 mr-1" /> Standard User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Button 
                      variant={u.role === 'admin' ? "outline" : "default"} 
                      size="sm" 
                      onClick={() => toggleRole(u)}
                      disabled={u.email === 'niranjanns1925@gmail.com'}
                      className={`rounded-xl font-bold h-9 px-4 transition-all ${
                        u.role === 'admin' 
                        ? 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300' 
                        : 'bg-primary hover:bg-primary/90 text-white'
                      }`}
                    >
                      {u.role === 'admin' ? (
                        <>Demote to User</>
                      ) : (
                        <><ShieldAlert className="w-4 h-4 mr-2" /> Promote to Admin</>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200">
         <h4 className="flex items-center gap-2 text-amber-900 font-bold text-sm mb-2">
           <ShieldAlert className="w-4 h-4" /> Security Notice
         </h4>
         <p className="text-amber-800 text-xs leading-relaxed font-medium">
           Granting Administrative privileges allows a user to approve/reject applications, view private user documents, and manage service listings. Only promote trusted personnel to these roles.
         </p>
      </div>
    </div>
  );
}
