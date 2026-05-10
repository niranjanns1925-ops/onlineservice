import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc, orderBy, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { AdminNotification } from '../types';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { Button } from './ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';
import { ScrollArea } from './ui/scroll-area';
import { Link } from 'react-router-dom';

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const q = query(
      collection(db, 'admin_notifications'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as AdminNotification[];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'admin_notifications', id), { read: true });
    } catch (e) {
      console.error("Error marking notification as read:", e);
    }
  };

  const markAllRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => updateDoc(doc(db, 'admin_notifications', n.id), { read: true })));
    } catch (e) {
      console.error("Error marking all as read:", e);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-secondary">
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-background">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 rounded-2xl border-primary/10 shadow-2xl" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b border-primary/5 bg-accent/20">
          <h4 className="text-xs font-black uppercase tracking-widest text-primary">Notifications</h4>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-[10px] font-bold text-primary hover:underline"
            >
              Mark all as read
            </button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-20 text-muted-foreground">
              <Bell className="h-8 w-8 mb-2 opacity-20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-primary/5">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`p-4 transition-colors flex gap-3 ${notif.read ? 'bg-white' : 'bg-primary/5'}`}
                >
                  <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${notif.read ? 'bg-transparent' : 'bg-primary'}`} />
                  <div className="space-y-1.5 flex-1">
                    <p className="text-xs font-medium text-foreground leading-snug">
                      <span className="font-bold">{notif.userName}</span> 
                      {notif.type === 'new_application' ? ' submitted a new application for ' : ' uploaded additional documents for '}
                      <span className="text-primary font-bold">{notif.serviceName}</span>
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-2">
                        {!notif.read && (
                          <button 
                            onClick={() => markAsRead(notif.id)}
                            className="text-[10px] font-black text-primary hover:bg-primary/10 p-1 px-1.5 rounded-lg transition-colors border border-primary/10"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </button>
                        )}
                        <Link 
                          to="/admin/applications" 
                          onClick={() => !notif.read && markAsRead(notif.id)}
                          className="text-[10px] font-black text-primary hover:bg-primary/10 p-1 px-1.5 rounded-lg transition-colors border border-primary/10"
                        >
                           <ExternalLink className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
