import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  ExternalLink,
  CheckCircle,
  XCircle,
  Plus,
  Send,
  Video,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function MentorshipSessionsPage() {
  const { user } = useAuth();
  const isAlumni = user?.role === 'alumni';

  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  // Schedule modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [title, setTitle] = useState('');
  const [partnerId, setPartnerId] = useState('');
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('5:00 PM EST');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/alevate-session');
  const [notes, setNotes] = useState('');
  const [scheduling, setScheduling] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const reqEndpoint = isAlumni ? '/mentorship/requests/alumni' : '/mentorship/requests/student';
      const [sessRes, reqRes, mentorRes] = await Promise.all([
        api.get('/mentorship/sessions'),
        api.get(reqEndpoint),
        api.get('/mentorship/mentors')
      ]);

      if (sessRes.sessions) setSessions(sessRes.sessions);
      if (reqRes.requests) setRequests(reqRes.requests);
      if (mentorRes.mentors) {
        setMentors(mentorRes.mentors);
        if (!partnerId && mentorRes.mentors[0]) {
          setPartnerId(mentorRes.mentors[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    setScheduling(true);
    try {
      await api.post('/mentorship/sessions', {
        title: title || 'System Design & 1-on-1 Mentorship',
        date,
        time,
        meetingLink,
        notes,
        [isAlumni ? 'studentId' : 'alumniId']: partnerId
      });
      setShowScheduleModal(false);
      setTitle('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to schedule session');
    } finally {
      setScheduling(false);
    }
  };

  const handleRespondRequest = async (requestId, status) => {
    try {
      await api.put(`/mentorship/requests/${requestId}/respond`, { status });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update request');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-2">
            <Calendar className="w-3.5 h-3.5" />
            Mentorship Scheduling & Sessions
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Mentorship Sessions
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Conduct 1-on-1 video mentorship sessions, track pending requests, and manage meeting notes.
          </p>
        </div>

        <button
          onClick={() => setShowScheduleModal(true)}
          className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Session</span>
        </button>
      </div>

      {/* Pending Requests Section (If Alumni or Student) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isAlumni ? 'Pending Mentorship Requests from Students' : 'Your Sent Mentorship Requests'}
        </h2>

        {requests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-400 text-xs">
            No pending requests at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requests.map((req) => (
              <div
                key={req._id || req.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md">
                      {req.topic}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      req.status === 'accepted' ? 'bg-emerald-50 text-emerald-700' :
                      req.status === 'rejected' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                    }`}>
                      {req.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium">
                    {isAlumni ? `Student: ${req.student?.name || 'Alex Rivera'}` : `Alumni Mentor: ${req.alumni?.name || 'Priya Sharma'}`}
                  </p>

                  <p className="text-xs text-slate-600 my-2 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    &ldquo;{req.message}&rdquo;
                  </p>
                </div>

                {isAlumni && req.status === 'pending' && (
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => handleRespondRequest(req._id || req.id, 'rejected')}
                      className="flex-1 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleRespondRequest(req._id || req.id, 'accepted')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scheduled Sessions Calendar List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Upcoming Scheduled Sessions</h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            No scheduled sessions found. Use the Schedule button above to set up a meeting!
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((sess) => (
              <div
                key={sess._id || sess.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Video className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{sess.title}</h3>
                      <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200/60 uppercase">
                        Confirmed
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-3">
                      <span className="font-bold text-indigo-600 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {sess.date}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {sess.time} ({sess.durationMinutes || 45} mins)
                      </span>
                      <span>&bull;</span>
                      <span>
                        With {isAlumni ? (sess.student?.name || 'Student Mentee') : (sess.alumni?.name || 'Alumni Mentor')}
                      </span>
                    </p>

                    {sess.notes && (
                      <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2">
                        <strong>Session Focus:</strong> {sess.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <a
                    href={sess.meetingLink || "https://meet.google.com"}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full md:w-auto justify-center px-5 py-2.5 rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Google Meet</span>
                    <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowScheduleModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-bold text-slate-900 text-lg">Schedule Mentorship Session</h3>
              <p className="text-xs text-slate-500 mt-1">Set date, time, and video conference link for 1-on-1 guidance.</p>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. System Design & Distributed Caching Prep"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {isAlumni ? 'Mentee Student' : 'Alumni Mentor'}
                </label>
                <select
                  value={partnerId}
                  onChange={(e) => setPartnerId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                >
                  {mentors.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} &mdash; {m.jobTitle} @ {m.company}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="text"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. Tomorrow or Oct 12"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="e.g. 5:00 PM EST"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Meeting Link (Google Meet / Zoom)</label>
                <input
                  type="text"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/xyz"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Session Goals / Notes</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Items to prepare, questions to discuss, or project links..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={scheduling}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50"
                >
                  {scheduling ? 'Saving...' : 'Confirm Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
