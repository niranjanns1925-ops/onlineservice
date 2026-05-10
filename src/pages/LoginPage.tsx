import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { Button } from '../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/services');
      } else {
        navigate('/user/services');
      }
    }
  }, [user, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <Card className="w-full max-w-md card-container border-none p-0 overflow-hidden shadow-2xl">
        <CardHeader className="space-y-1 bg-accent mb-4 border-b border-primary/10 pb-8 pt-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground font-bold text-3xl shadow-sm">L</div>
          </div>
          <CardTitle className="text-2xl text-center text-primary font-bold">Lakshmi E-sevai</CardTitle>
          <CardDescription className="text-center text-muted-foreground font-medium">
            Authorized Digital Service Portal
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-12">
            <Button 
              type="button" 
              variant="default" 
              onClick={() => loginWithGoogle()}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl h-14 transition-all flex items-center justify-center gap-3 text-lg"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Sign in with Google
            </Button>
            
            <div className="flex items-center justify-center gap-2 pt-4 border-t border-primary/5">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] text-muted-foreground font-bold tracking-wider uppercase">Secure Biometric-Grade Authentication</span>
            </div>
          </CardContent>
      </Card>
    </div>
  );
}
