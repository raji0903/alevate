import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Users,
  Calendar,
  Briefcase,
  Handshake,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Building,
  Video,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function AlumniDashboard() {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [myJobs, setMyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const isVerified = user?.isVerified !== false;

  useEffect(() => {
    const fetchAlumniData = async () => {
      try {
        const [reqRes, sessRes, refRes, jobRes] = await Promise.all([
          api.get('/mentorship/requests/alumni'),
          api.get('/mentorship/sessions'),
          api.get('/referrals/alumni'),
          api.get('/jobs')
        ]);

        if (reqRes.requests) setRequests(reqRes.requests);
        if (sessRes.sessions) setSessions(sessRes.sessions);
        if (refRes.referrals) setReferrals(refRes.referrals);
        if (jobRes.jobs) setMyJobs(jobRes.jobs.slice(0, 2));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlumniData();
  }, []);

  const handleRespond = async (id, status) => {
    try {
      await api.put(`/mentorship/requests/${id}/respond`, { status });
      const reqRes = await api.get('/mentorship/requests/alumni');
      if (reqRes.requests) setRequests(reqRes.requests);
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-8">
      {/* Pending Admin Approval Banner (Shown if alumni is unverified) */}
      {!isVerified && (
        <div className="p-5 sm:p-6 rounded-3xl bg-amber-50 border border-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="font-bold text-amber-950 text-sm sm:text-base">
                Your Alumni Mentor Registration is Pending Administrator Review
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Thank you for signing up to give back! An administrator is reviewing your industry experience, current organization, and technical skills. You will receive full mentor privileges once approved.
              </p>
            </div>
          </div>
          <div className="text-xs font-bold text-amber-900 bg-amber-200/60 px-3 py-1.5 rounded-xl border border-amber-300/80 shrink-0">
            Status: Under Review
          </div>
        </div>
      )}

      {/* Welcome Hero Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-8 sm:p-10 text-white relative overflow-hidden shadow-md shadow-emerald-500/10">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            Alevate Alumni Mentor Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.name || 'Priya'} 👋
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base mt-2 font-normal leading-relaxed">
            {isVerified
              ? "Thank you for empowering collegiate mentees! Review student applications, schedule 1-on-1 sessions, and post employee referrals."
              : "Welcome to Alevate! Explore the mentor portal while your account experience and skills verification is being finalized."}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <NavLink
              to="/sessions"
              className="px-5 py-2.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>Schedule Session</span>
            </NavLink>
            <NavLink
              to="/jobs"
              className="px-5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/20 text-white text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1.5"
            >
              <Briefcase className="w-4 h-4 text-emerald-200" />
              <span>Post Opportunities</span>
            </NavLink>
          </div>
        </div>
      </div>

      {/* Top 4 Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mentorship Requests</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">{requests.length}</p>
          <p className="text-xs text-slate-500 mt-1">Pending review</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Mentees</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Handshake className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">8</p>
          <p className="text-xs text-slate-500 mt-1">College juniors & seniors</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Upcoming Sessions</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">{sessions.length}</p>
          <p className="text-xs text-slate-500 mt-1">Confirmed sessions</p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-emerald-100 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Referral Inquiries</span>
            <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-4">{referrals.length || 3}</p>
          <p className="text-xs text-slate-500 mt-1">Direct company inquiries</p>
        </div>
      </div>

      {/* Grid: Pending Mentorship Requests & Sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Mentorship Requests */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Student Mentorship Inquiries</h2>
              <p className="text-xs text-slate-500">Students requesting your mentorship, code reviews, and mock interviews</p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {requests.length} Requests
            </span>
          </div>

          <div className="space-y-4">
            {requests.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-emerald-100 text-slate-400 text-xs">
                No new pending requests right now.
              </div>
            ) : (
              requests.map((r) => (
                <div
                  key={r._id || r.id}
                  className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                        {r.topic}
                      </span>
                      <span className="text-xs text-slate-400">&bull;</span>
                      <span className="text-xs font-semibold text-slate-700">{r.student?.name || 'Alex Rivera'}</span>
                    </div>

                    <p className="text-xs text-slate-600 bg-emerald-50/30 p-3 rounded-2xl border border-emerald-100 italic">
                      &ldquo;{r.message}&rdquo;
                    </p>

                    <span className="text-[11px] text-slate-400 block">
                      Submitted: {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {r.status === 'pending' ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRespond(r._id || r.id, 'rejected')}
                        className="px-4 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleRespond(r._id || r.id, 'accepted')}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Accept Request
                      </button>
                    </div>
                  ) : (
                    <span className="text-xs font-bold uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-xl">
                      {r.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Col: Upcoming Sessions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Mentorship Sessions</h3>
              <NavLink to="/sessions" className="text-xs text-emerald-700 font-bold hover:underline">
                View All
              </NavLink>
            </div>

            <div className="space-y-3">
              {sessions.map((sess) => (
                <div key={sess._id || sess.id} className="p-4 rounded-2xl bg-[#F4FBF7] border border-emerald-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{sess.date}</span>
                    <span className="text-[11px] text-slate-500">{sess.time}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{sess.title}</p>
                  <a
                    href={sess.meetingLink || "https://meet.google.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-1"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Google Meet</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
