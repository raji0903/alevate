import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Handshake,
  MessageSquare,
  Users,
  Check
} from 'lucide-react';
import api from '../../api/client';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.notifications) setNotifications(res.notifications);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'session_scheduled': return Calendar;
      case 'mentorship_request':
      case 'mentorship_accepted': return Users;
      case 'referral_request':
      case 'referral_status': return Handshake;
      case 'message': return MessageSquare;
      default: return Bell;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            Activity & Updates
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Real-time updates regarding your sessions, referrals, and mentor responses.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Mark all read</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden divide-y divide-slate-100">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications at this time.
          </div>
        ) : (
          notifications.map((n) => {
            const Icon = getIcon(n.type);
            return (
              <div
                key={n._id || n.id}
                onClick={() => { if (n.link) navigate(n.link); }}
                className={`p-5 flex items-start gap-4 cursor-pointer hover:bg-slate-50 transition-colors ${
                  !n.read ? 'bg-blue-50/30' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900">{n.title}</h4>
                    <span className="text-[10px] text-slate-400">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{n.message}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
