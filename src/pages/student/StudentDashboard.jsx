import React, { useState, useEffect } from 'react';

import { NavLink, useNavigate } from 'react-router-dom';

import {
  Users,
  Calendar,
  Briefcase,
  Handshake,
  Sparkles,
  ArrowRight,
  ExternalLink,
  Clock,
  MapPin,
  CheckCircle,
  Building,
  Star,
  ChevronRight,
  Send,
  X
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

import Avatar from '../../components/common/Avatar';

import api from '../../api/client';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [mentors, setMentors] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [mentorshipTopic, setMentorshipTopic] = useState('');
  const [mentorshipMsg, setMentorshipMsg] = useState('');
  const [requestSending, setRequestSending] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Job Apply modal
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mentorsRes, jobsRes, sessionsRes, appsRes] = await Promise.all([
          api.get('/mentorship/mentors'),
          api.get('/jobs'),
          api.get('/mentorship/sessions'),
          api.get('/jobs/my-applications')
        ]);

        if (mentorsRes.mentors) {
          setMentors(mentorsRes.mentors.slice(0, 3));
        }

        if (jobsRes.jobs) {
          setJobs(jobsRes.jobs.slice(0, 3));
        }

        if (sessionsRes.sessions) {
          setSessions(sessionsRes.sessions.slice(0, 2));
        }

        if (appsRes.appliedJobs) {
          setApplications(appsRes.appliedJobs);
        }
      } catch (err) {
        console.error("Dashboard data load error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSendMentorshipRequest = async (e) => {
    e.preventDefault();

    if (!selectedMentor) return;

    setRequestSending(true);

    try {
      await api.post('/mentorship/request', {
        alumniId: selectedMentor.id,
        topic: mentorshipTopic || 'Career Guidance & Resume Review',
        message:
          mentorshipMsg ||
          `Hi ${selectedMentor.name}, I would love to connect for career advice and feedback on my projects!`
      });

      setRequestSuccess(true);

      setTimeout(() => {
        setRequestSuccess(false);
        setSelectedMentor(null);
        setMentorshipTopic('');
        setMentorshipMsg('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to send mentorship request');
    } finally {
      setRequestSending(false);
    }
  };

  const handleApplyToJob = async (e) => {
    e.preventDefault();

    if (!selectedJob) return;

    setApplyLoading(true);

    try {
      await api.post(
        `/jobs/${selectedJob._id || selectedJob.id}/apply`,
        {
          notes:
            applyNotes ||
            'Experienced with React and Node.js. Excited about this opportunity!'
        }
      );

      setApplySuccess(true);

      setTimeout(() => {
        setApplySuccess(false);
        setSelectedJob(null);
        setApplyNotes('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Application error');
    } finally {
      setApplyLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* Welcome Banner Card */}

      <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 p-5 sm:p-8 md:p-10 text-white relative overflow-hidden shadow-md shadow-emerald-600/10">

        <div className="max-w-2xl relative z-10">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-white text-xs font-semibold mb-3 sm:mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
            Alevate Student Portal
          </div>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Alex'} 👋
          </h1>

          <p className="text-emerald-100 text-xs sm:text-sm md:text-base mt-1.5 sm:mt-2 font-normal leading-relaxed">
            Build connections. Discover opportunities. Grow your career.
          </p>

          <div className="mt-4 sm:mt-6 flex flex-wrap items-center gap-2.5 sm:gap-3">

            <NavLink
              to="/mentors"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              <span>Explore Mentors</span>
            </NavLink>

            <NavLink
              to="/ai-companion"
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/20 text-white text-xs font-bold transition-all backdrop-blur-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-200" />
              <span>Ask Alevate AI</span>
            </NavLink>

          </div>
        </div>

      </div>

      {/* Top 4 Statistic Cards */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">

        {/* Stat 1 */}

        <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xs hover:shadow-sm transition-all">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Mentors
            </span>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 sm:mt-4">
            18+
          </p>

          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 flex items-center gap-1">
            <span className="text-emerald-700 font-bold">96%</span> match
          </p>

        </div>

        {/* Stat 2 */}

        <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xs hover:shadow-sm transition-all">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Sessions
            </span>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 sm:mt-4">
            {sessions.length}
          </p>

          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
            Next: tomorrow
          </p>

        </div>

        {/* Stat 3 */}

        <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xs hover:shadow-sm transition-all">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Job Matches
            </span>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 sm:mt-4">
            12
          </p>

          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
            4 with referrals
          </p>

        </div>

        {/* Stat 4 */}

        <div className="bg-white p-3.5 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xs hover:shadow-sm transition-all">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
              Applications
            </span>

            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Handshake className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-2 sm:mt-4">
            {applications.length || 2}
          </p>

          <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1 truncate">
            In review
          </p>

        </div>

      </div>      {/* Main Grid: Recommended Mentors + Upcoming Sessions */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left 2 Cols: Recommended Mentors */}

        <div className="lg:col-span-2 space-y-6">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Recommended Mentors
              </h2>

              <p className="text-xs text-slate-500">
                Based on your skills & career goals
              </p>
            </div>

            <NavLink
              to="/mentors"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </NavLink>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {mentors.map((mentor) => (

              <div
                key={mentor.id || mentor._id}
                className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >

                <div>

                  <div className="flex items-start justify-between gap-3 mb-3">

                    <div className="flex items-center gap-3">

                      <Avatar name={mentor.name} size="lg" />

                      <div>

                        <h3 className="font-bold text-slate-900 text-sm">
                          {mentor.name}
                        </h3>

                        <p className="text-xs text-slate-500 font-medium">
                          {mentor.jobTitle} @ {mentor.company}
                        </p>

                      </div>

                    </div>

                    <span className="bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2 py-0.5 rounded-lg border border-emerald-200/60 shrink-0">
                      {mentor.matchPercentage || 92}% Match
                    </span>

                  </div>

                  <div className="flex flex-wrap gap-1.5 my-3">

                    {(mentor.skills || [
                      'React',
                      'System Design',
                      'Go'
                    ])
                      .slice(0, 3)
                      .map((s, idx) => (

                        <span
                          key={idx}
                          className="text-[11px] bg-emerald-50/70 text-emerald-800 font-medium px-2 py-0.5 rounded-md"
                        >
                          {s}
                        </span>

                      ))}

                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {mentor.bio ||
                      `Experienced engineer at ${mentor.company}. Happy to help with mock interviews and resume reviews.`}
                  </p>

                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">

                  <NavLink
                    to={`/alumni/${mentor.id}`}
                    className="flex-1 text-center py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                  >
                    View Profile
                  </NavLink>

                  <button
                    onClick={() => setSelectedMentor(mentor)}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs"
                  >
                    Request Mentorship
                  </button>

                </div>

              </div>

            ))}

          </div>

          {/* Career Opportunities Recommended Section */}

          <div className="pt-4">

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Career Opportunities
                </h2>

                <p className="text-xs text-slate-500">
                  Curated internships & full-time roles with alumni connections
                </p>

              </div>

              <NavLink
                to="/jobs"
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <span>Browse All Jobs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </NavLink>

            </div>

            <div className="space-y-3.5">

              {jobs.map((job) => (

                <div
                  key={job._id || job.id}
                  className="bg-white p-5 rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >

                  <div className="flex items-start gap-4">

                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Building className="w-6 h-6" />
                    </div>

                    <div>

                      <div className="flex items-center gap-2 flex-wrap">

                        <h3 className="font-bold text-slate-900 text-sm">
                          {job.title}
                        </h3>

                        <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {job.type}
                        </span>

                        {job.referralAvailable && (
                          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-md border border-emerald-200/60">
                            Alumni Referral Available
                          </span>
                        )}

                      </div>

                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">

                        <span className="font-semibold text-slate-700">
                          {job.company}
                        </span>

                        <span>&bull;</span>

                        <span>{job.location}</span>

                        <span>&bull;</span>

                        <span className="text-slate-600 font-medium">
                          {job.salary}
                        </span>

                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-2">

                        {(job.skillsRequired || [
                          'React',
                          'TypeScript'
                        ])
                          .slice(0, 4)
                          .map((sk, idx) => (

                            <span
                              key={idx}
                              className="text-[10px] bg-slate-100 text-slate-600 font-medium px-1.5 py-0.5 rounded"
                            >
                              {sk}
                            </span>

                          ))}

                      </div>

                    </div>

                  </div>

                  <div className="flex sm:flex-col gap-2 shrink-0">

                    <button
                      onClick={() => setSelectedJob(job)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      Apply Now
                    </button>

                    <NavLink
                      to={`/referrals?jobId=${job._id || job.id}`}
                      className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold text-center border border-emerald-200 transition-colors"
                    >
                      Request Referral
                    </NavLink>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </div>

        {/* Right Col: Upcoming Sessions + Alevate AI Quick Assistant */}

        <div className="space-y-6">

          {/* Upcoming Sessions Card */}

          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-xs">

            <div className="flex items-center justify-between mb-4">

              <h3 className="font-bold text-slate-900 text-sm">
                Upcoming Mentorship
              </h3>

              <NavLink
                to="/sessions"
                className="text-xs text-emerald-700 font-semibold hover:underline"
              >
                View Calendar
              </NavLink>

            </div>

            <div className="space-y-3">

              {sessions.length === 0 ? (

                <div className="py-6 text-center">

                  <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />

                  <p className="text-xs text-slate-500">
                    No scheduled sessions
                  </p>

                  <NavLink
                    to="/mentors"
                    className="text-xs text-emerald-700 font-bold hover:underline mt-1 block"
                  >
                    Book a mentor &rarr;
                  </NavLink>

                </div>

              ) : (

                sessions.map((sess) => (

                  <div
                    key={sess._id || sess.id}
                    className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2.5"
                  >

                    <div className="flex items-center justify-between">

                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                        {sess.date}
                      </span>

                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {sess.time}
                      </span>

                    </div>

                    <p className="text-xs font-bold text-slate-900">
                      {sess.title}
                    </p>

                    <div className="flex items-center justify-between pt-1">

                      <span className="text-[11px] text-slate-500">
                        With {sess.alumni?.name || 'Priya Sharma'}
                      </span>

                      <a
                        href={
                          sess.meetingLink ||
                          "https://meet.google.com"
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <span>Join</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>

                    </div>

                  </div>

                ))

              )}

            </div>

          </div>

          {/* Alevate AI Career Companion Widget */}

          <div className="p-6 rounded-3xl bg-gradient-to-tr from-violet-950 via-slate-900 to-indigo-950 text-white shadow-lg space-y-4">

            <div className="flex items-center gap-2">

              <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>

              <div>

                <h4 className="font-bold text-sm">
                  Alevate AI Companion
                </h4>

                <p className="text-[11px] text-violet-300">
                  Intelligent career assistant
                </p>

              </div>

            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Ask about optimizing your resume for Google, writing referral requests, or generating interview roadmaps.
            </p>

            <NavLink
              to="/ai-companion"
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-violet-600/20"
            >
              <span>Chat with Alevate AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>

          </div>

        </div>

      </div>      {/* Request Mentorship Modal */}

      {selectedMentor && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">

          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">

            <button
              onClick={() => setSelectedMentor(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-6">

              <Avatar
                name={selectedMentor.name}
                size="xl"
              />

              <div>

                <h3 className="font-bold text-slate-900 text-base">
                  Request Mentorship with {selectedMentor.name}
                </h3>

                <p className="text-xs text-slate-500">
                  {selectedMentor.jobTitle} @ {selectedMentor.company}
                </p>

              </div>

            </div>

            {requestSuccess ? (

              <div className="py-8 text-center space-y-2">

                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />

                <h4 className="font-bold text-slate-900">
                  Request Sent Successfully!
                </h4>

                <p className="text-xs text-slate-500">
                  The alumni will review your note and you'll receive a notification.
                </p>

              </div>

            ) : (

              <form
                onSubmit={handleSendMentorshipRequest}
                className="space-y-4"
              >

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Topic / Focus Area
                  </label>

                  <input
                    type="text"
                    required
                    value={mentorshipTopic}
                    onChange={(e) => setMentorshipTopic(e.target.value)}
                    placeholder="e.g. System Design Mock Interview or Google Summer Internship Advice"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Message for Alumni Mentor
                  </label>

                  <textarea
                    rows={4}
                    required
                    value={mentorshipMsg}
                    onChange={(e) => setMentorshipMsg(e.target.value)}
                    placeholder="Introduce yourself, your academic background, what you've built, and specific questions you have..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                </div>

                <div className="flex items-center justify-end gap-3 pt-2">

                  <button
                    type="button"
                    onClick={() => setSelectedMentor(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={requestSending}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {requestSending ? 'Sending...' : 'Send Request'}
                    </span>
                  </button>

                </div>

              </form>

            )}

          </div>

        </div>

      )}

      {/* Apply to Job Modal */}

      {selectedJob && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">

          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-emerald-100 relative max-h-[92vh] overflow-y-auto">

            <button
              onClick={() => setSelectedJob(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">

              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">
                {selectedJob.company}
              </span>

              <h3 className="font-bold text-slate-900 text-lg">
                {selectedJob.title}
              </h3>

              <p className="text-xs text-slate-500 mt-1">
                {selectedJob.location} &bull; {selectedJob.type} &bull; {selectedJob.salary}
              </p>

            </div>

            {applySuccess ? (

              <div className="py-8 text-center space-y-2">

                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />

                <h4 className="font-bold text-slate-900">
                  Application Submitted!
                </h4>

                <p className="text-xs text-slate-500">
                  Your profile and application have been recorded.
                </p>

              </div>

            ) : (

              <form
                onSubmit={handleApplyToJob}
                className="space-y-4"
              >

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Attached Resume
                  </label>

                  <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-center justify-between text-xs">

                    <span className="font-semibold text-slate-700">
                      Alex_Rivera_Resume_2026.pdf
                    </span>

                    <span className="text-[11px] text-emerald-700 font-bold">
                      Uploaded
                    </span>

                  </div>

                </div>

                <div>

                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Note to Recruiter / Hiring Team
                  </label>

                  <textarea
                    rows={4}
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    placeholder="Highlight your key achievements, projects, or why you are a great fit..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />

                </div>

                <div className="flex items-center justify-end gap-3 pt-2">

                  <button
                    type="button"
                    onClick={() => setSelectedJob(null)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={applyLoading}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
                  >
                    {applyLoading
                      ? 'Submitting...'
                      : 'Submit Application'}
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