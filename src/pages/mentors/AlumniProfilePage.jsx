import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, NavLink } from 'react-router-dom';
import {
  MapPin,
  Building,
  GraduationCap,
  Briefcase,
  Calendar,
  MessageSquare,
  CheckCircle,
  ExternalLink,
  Clock,
  Send,
  X,
  ArrowLeft
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import api from '../../api/client';

export default function AlumniProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Request modal
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        const res = await api.get('/mentorship/mentors');
        const found = (res.mentors || []).find(m => m.id === id || m.profileId === id);
        if (found) {
          setMentor(found);
        } else if (res.mentors && res.mentors[0]) {
          setMentor(res.mentors[0]);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMentor();
  }, [id]);

  const handleStartChat = async () => {
    if (!mentor) return;
    try {
      const res = await api.post('/messages/conversations/start', { recipientId: mentor.id });
      navigate(`/messages?conversationId=${res.conversation?._id || res.conversation?.id}`);
    } catch {
      navigate('/messages');
    }
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post('/mentorship/request', {
        alumniId: mentor.id,
        topic: topic || 'Career Guidance & Resume Review',
        message: message || `Hi ${mentor.name}, I would love to connect for 1-on-1 mentorship regarding your work at ${mentor.company}!`
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setShowRequestModal(false);
      }, 1500);
    } catch (err) {
      alert(err.message || 'Error sending request');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="py-12 text-center text-slate-400">Loading profile...</div>;
  }

  if (!mentor) {
    return <div className="py-12 text-center text-slate-500">Alumni profile not found.</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Mentors</span>
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Cover gradient banner */}
        <div className="h-28 sm:h-36 bg-gradient-to-r from-blue-700 via-indigo-600 to-slate-900 relative">
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-white/20 backdrop-blur-md text-white text-[11px] sm:text-xs font-bold px-3 py-1 rounded-full">
            Verified Alumni Mentor
          </div>
        </div>

        {/* Profile Info row */}
        <div className="px-4 sm:px-8 pb-6 sm:pb-8 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-16 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-5">
              <Avatar
                name={mentor.name}
                size="2xl"
                rounded="rounded-3xl"
                className="w-20 h-20 sm:w-28 sm:h-28 ring-4 ring-white shadow-md bg-white shrink-0"
              />
              <div className="pt-1 sm:pt-2">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{mentor.name}</h1>
                  {mentor.isVerified && (
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" title="Verified Alumni" />
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-700">{mentor.jobTitle} @ <span className="text-blue-600 font-bold">{mentor.company}</span></p>
                <div className="flex items-center gap-3 sm:gap-4 text-xs text-slate-500 mt-1 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {mentor.industry || "Cloud & AI"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {mentor.experience} Years Exp
                  </span>
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    Class of 2019
                  </span>
                </div>
              </div>
            </div>

            {/* CTA buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 pt-2 sm:pt-0 w-full sm:w-auto">
              <button
                onClick={handleStartChat}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </button>
              <button
                onClick={() => setShowRequestModal(true)}
                className="flex-1 sm:flex-initial px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-4 h-4" />
                <span>Request Mentorship</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: About, Experience, Mentorship Areas */}
        <div className="md:col-span-2 space-y-6">
          {/* About Section */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">About</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {mentor.bio || `Senior engineer at ${mentor.company}. Specialized in distributed architectures, microservices scaling, and high-performance computing. Highly active in mentoring college students on LeetCode patterns, system design basics, and breaking into FAANG.`}
            </p>
          </div>

          {/* Career Journey & Experience */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">Career Journey & Experience</h3>

            <div className="space-y-5 border-l-2 border-slate-100 pl-4 ml-2">
              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-blue-600 absolute -left-[23px] top-1.5 ring-4 ring-blue-50"></span>
                <p className="text-xs font-bold text-slate-900">{mentor.jobTitle} &bull; {mentor.company}</p>
                <p className="text-[11px] text-slate-500">2021 &ndash; Present &bull; {mentor.experience} yrs</p>
                <p className="text-xs text-slate-600 mt-1">
                  Architecting resilient microservices, leading technical interview panels, and optimizing core production data pipelines.
                </p>
              </div>

              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-slate-300 absolute -left-[23px] top-1.5"></span>
                <p className="text-xs font-bold text-slate-900">Software Engineer &bull; Tech Innovation Labs</p>
                <p className="text-[11px] text-slate-500">2019 &ndash; 2021 &bull; 2 yrs</p>
                <p className="text-xs text-slate-600 mt-1">
                  Built modern full-stack web applications, REST APIs, and automated CI/CD deployment workflows.
                </p>
              </div>
            </div>
          </div>

          {/* Mentorship Focus Areas */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Mentorship Focus Areas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {(mentor.expertise?.length ? mentor.expertise : ['System Design Architecture', 'Mock Coding Interviews', 'FAANG Resume Optimization', 'Career Transition Guidance']).map((area, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                  <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">{area}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Skills, Availability, Socials */}
        <div className="space-y-6">
          {/* Skills */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(mentor.skills || ['React', 'System Design', 'Go', 'Distributed Systems', 'Java', 'Algorithms']).map((sk, idx) => (
                <span key={idx} className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-xs font-medium">
                  {sk}
                </span>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Session Availability</h3>
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">{mentor.availability || 'Weekends & Evenings (5 slots/wk)'}</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Sessions are hosted via Google Meet (45 mins). Schedule directly after mentorship request approval.
            </p>
          </div>

          {/* Social Links */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-900 text-sm">Verified Links</h3>
            <div className="space-y-2">
              <a
                href={mentor.socialLinks?.linkedin || "https://linkedin.com"}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-700 fill-current" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.64 1.64 0 1 0 0-3.28 1.64 1.64 0 0 0 0 3.28m1.4 9.74V10.13H5.06v8.37z"/></svg>
                  <span>LinkedIn Profile</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>

              <a
                href={mentor.socialLinks?.github || "https://github.com"}
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-slate-900 fill-current" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/></svg>
                  <span>GitHub Profile</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Mentorship Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <Avatar name={mentor.name} size="xl" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Request Mentorship with {mentor.name}</h3>
                <p className="text-xs text-slate-500">{mentor.jobTitle} @ {mentor.company}</p>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900">Request Sent Successfully!</h4>
                <p className="text-xs text-slate-500">{mentor.name} will receive your note and notification.</p>
              </div>
            ) : (
              <form onSubmit={handleSendRequest} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Focus Area</label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. System Design Mock Interview or Google Summer Internship Advice"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Personal Note</label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Introduce yourself and outline your top 2 questions for this session..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sending ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
