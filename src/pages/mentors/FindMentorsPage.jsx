import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Users,
  Filter,
  Star,
  MapPin,
  Clock,
  Sparkles,
  Building,
  CheckCircle,
  ExternalLink,
  Send,
  X
} from 'lucide-react';
import Avatar from '../../components/common/Avatar';
import api from '../../api/client';

export default function FindMentorsPage() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedExp, setSelectedExp] = useState('All');

  // Request modal
  const [activeMentor, setActiveMentor] = useState(null);
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchMentors();
  }, [selectedCompany, selectedIndustry, selectedExp]);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      let query = `?company=${selectedCompany}&industry=${selectedIndustry}&experience=${selectedExp}`;
      if (searchTerm) query += `&search=${encodeURIComponent(searchTerm)}`;
      const res = await api.get(`/mentorship/mentors${query}`);
      if (res.mentors) {
        setMentors(res.mentors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchMentors();
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!activeMentor) return;
    setSending(true);
    try {
      await api.post('/mentorship/request', {
        alumniId: activeMentor.id,
        topic: topic || 'Resume & Career Coaching',
        message: message || `Hi ${activeMentor.name}, I would love to connect for 1-on-1 mentorship regarding your work at ${activeMentor.company}!`
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setActiveMentor(null);
        setTopic('');
        setMessage('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit mentorship request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Search */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-emerald-100 shadow-xs space-y-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200/60">
            <Users className="w-3.5 h-3.5 text-emerald-600" />
            Alumni Mentorship Network
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Find Your Mentor
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Connect with verified alumni for mock interviews, career guidance, and internal company referrals.
          </p>
        </div>

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by skills, role, company (Google, Stripe, React, System Design)..."
              className="w-full pl-10 pr-4 py-3 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
          >
            Search
          </button>
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-1 text-slate-400 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Company:</span>
          </div>
          {['All', 'Google', 'Microsoft', 'Stripe', 'Databricks'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCompany(c)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedCompany === c
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800'
              }`}
            >
              {c}
            </button>
          ))}

          <div className="flex items-center gap-1 text-slate-400 font-semibold ml-2 mr-1">
            <span>Experience:</span>
          </div>
          {['All', '3', '5'].map((exp) => (
            <button
              key={exp}
              onClick={() => setSelectedExp(exp)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                selectedExp === exp
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-800'
              }`}
            >
              {exp === 'All' ? 'Any Exp' : `${exp}+ Years`}
            </button>
          ))}
        </div>
      </div>

      {/* Recommended For You Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Recommended For You</h2>
            <p className="text-xs text-slate-500">Ranked by intelligent profile matching algorithms</p>
          </div>
          <span className="text-xs font-bold text-slate-400">{mentors.length} Verified Mentors</span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            Loading alumni mentors...
          </div>
        ) : mentors.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            No alumni mentors matched your filter. Try clearing filters or searching for "Google" or "Stripe".
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id || mentor._id}
                className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Header info */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={mentor.name} size="xl" />
                      <div>
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-slate-900 text-base">{mentor.name}</h3>
                          {mentor.isVerified && (
                            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Alumni" />
                          )}
                        </div>
                        <p className="text-xs font-semibold text-slate-700">{mentor.jobTitle}</p>
                        <p className="text-xs text-emerald-700 font-bold">{mentor.company}</p>
                      </div>
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-lg border border-emerald-200/60 shrink-0">
                      {mentor.matchPercentage || 92}% Match
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div className="flex flex-wrap gap-1.5 my-3">
                    {(mentor.skills || []).slice(0, 4).map((sk, idx) => (
                      <span key={idx} className="text-[11px] bg-emerald-50/70 text-emerald-800 font-medium px-2 py-0.5 rounded-md">
                        {sk}
                      </span>
                    ))}
                  </div>

                  {/* Mentorship Areas */}
                  <div className="my-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Mentorship Areas</span>
                    <p className="text-xs text-slate-700 font-medium line-clamp-1">
                      {(mentor.expertise || []).join(" • ") || "Resume Review • System Design • Mock Interview"}
                    </p>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                    <Clock className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{mentor.availability || 'Weekends & Evenings'}</span>
                  </div>
                </div>

                {/* Bottom Action buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                  <NavLink
                    to={`/alumni/${mentor.id}`}
                    className="flex-1 text-center py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition-colors"
                  >
                    View Profile
                  </NavLink>
                  <button
                    onClick={() => setActiveMentor(mentor)}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Request Mentorship
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mentorship Request Modal */}
      {activeMentor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-emerald-100 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveMentor(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">
              <Avatar name={activeMentor.name} size="xl" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Request Mentorship with {activeMentor.name}</h3>
                <p className="text-xs text-slate-500">{activeMentor.jobTitle} @ {activeMentor.company}</p>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900">Request Sent Successfully!</h4>
                <p className="text-xs text-slate-500">{activeMentor.name} will receive your note and calendar availability.</p>
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveMentor(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sending}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
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
