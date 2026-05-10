import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from './ui/button';
import { LogOut, Monitor, User, FileText, Database, ShieldCheck, Bell } from 'lucide-react';
import AdminNotifications from './AdminNotifications';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col">
      <header className="py-6 transition-all">
        <div className="max-w-[1024px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-2xl shadow-sm">L</div>
            <div>
              <h1 className="text-xl font-bold leading-none text-foreground tracking-tight">Lakshmi E-sevai Maiyam</h1>
              <p className="text-xs text-muted-foreground mt-1 font-medium">Authorized Government Service Hub (Private)</p>
            </div>
          </Link>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <div className="flex bg-secondary p-1 rounded-xl items-center">
                  {user.role === 'admin' ? (
                    <>
                      <Link to="/admin/services"><Button variant="ghost" className="text-sm font-bold bg-white text-primary shadow-sm hover:bg-white/90 rounded-lg px-4 h-8"><Database className="h-4 w-4 mr-2" />Services</Button></Link>
                      <Link to="/admin/applications"><Button variant="ghost" className="text-sm font-semibold text-primary hover:bg-white/50 rounded-lg px-4 h-8"><FileText className="h-4 w-4 mr-2" />Queue</Button></Link>
                      <Link to="/admin/reports"><Button variant="ghost" className="text-sm font-semibold text-primary hover:bg-white/50 rounded-lg px-4 h-8"><Monitor className="h-4 w-4 mr-2" />Reports</Button></Link>
                      <Link to="/admin/users"><Button variant="ghost" className="text-sm font-semibold text-primary hover:bg-white/50 rounded-lg px-4 h-8"><User className="h-4 w-4 mr-2" />Users</Button></Link>
                    </>
                  ) : (
                    <>
                      <Link to="/user/services"><Button variant="ghost" className="text-sm font-bold bg-white text-primary shadow-sm hover:bg-white/90 rounded-lg px-4 h-8"><Database className="h-4 w-4 mr-2" />Apply Services</Button></Link>
                      <Link to="/user/applications"><Button variant="ghost" className="text-sm font-semibold text-primary hover:bg-white/50 rounded-lg px-4 h-8"><FileText className="h-4 w-4 mr-2" />My Applications</Button></Link>
                    </>
                  )}
                </div>
                
                <div className="flex items-center ml-2 gap-4">
                  {user.role === 'admin' && <AdminNotifications />}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-white shadow-sm">
                     <ShieldCheck className="w-4 h-4 text-primary" />
                     <span className="text-[10px] text-primary font-bold tracking-wide uppercase">End-to-End Encrypted</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-bold uppercase">
                      {user.name.substring(0,2)}
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-primary hover:bg-secondary rounded-full w-8 h-8" title="Logout">
                      <LogOut className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-primary/20 bg-white shadow-sm">
                   <ShieldCheck className="w-4 h-4 text-primary" />
                   <span className="text-[10px] text-primary font-bold tracking-wide uppercase">End-to-End Encrypted</span>
                </div>
                <Link to="/login">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl px-6">
                    Login / Register
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-[1024px] mx-auto px-6 py-6 w-full flex flex-col min-h-0">
        <Outlet />
      </main>

      <footer className="mt-auto py-6 max-w-[1024px] mx-auto w-full px-6 flex justify-between items-center text-[10px] text-muted-foreground font-medium">
        <div>&copy; {new Date().getFullYear()} Lakshmi E-sevai Maiyam. Private Limited.</div>
        <div className="flex gap-4 items-center">
          <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
          <span className="text-primary font-bold flex items-center gap-1">
             <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block"></span> Server Status: Operational
          </span>
        </div>
      </footer>
    </div>
  );
}
