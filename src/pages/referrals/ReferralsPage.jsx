import React, { useState, useEffect } from 'react';
import { useSearchParams, NavLink } from 'react-router-dom';
import {
  Handshake,
  CheckCircle,
  Clock,
  XCircle,
  Building,
  User,
  ExternalLink,
  Plus,
  Send,
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function ReferralsPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const preselectedJobId = searchParams.get('jobId');

  const [referrals, setReferrals] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [alumniList, setAlumniList] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Request modal
  const [showRequestModal, setShowRequestModal] = useState(!!preselectedJobId);
  const [selectedJob, setSelectedJob] = useState(preselectedJobId || '');
  const [selectedAlumni, setSelectedAlumni] = useState('');
  const [requestNotes, setRequestNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Alumni respond modal
  const [activeRespondRef, setActiveRespondRef] = useState(null);
  const [respondFeedback, setRespondFeedback] = useState('');

  const isAlumni = user?.role === 'alumni';

  useEffect(() => {
    fetchData();
  }, [user?.role]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = isAlumni ? '/referrals/alumni' : '/referrals/student';
      const [refRes, jobRes, mentorRes] = await Promise.all([
        api.get(endpoint),
        api.get('/jobs'),
        api.get('/mentorship/mentors')
      ]);

      if (refRes.referrals) setReferrals(refRes.referrals);
      if (jobRes.jobs) setJobs(jobRes.jobs);
      if (mentorRes.mentors) {
        setAlumniList(mentorRes.mentors);
        if (!selectedAlumni && mentorRes.mentors[0]) {
          setSelectedAlumni(mentorRes.mentors[0].id);
        }
      }
      if (preselectedJobId) {
        setSelectedJob(preselectedJobId);
        setShowRequestModal(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReferral = async (e) => {
    e.preventDefault();
    if (!selectedJob || !selectedAlumni) {
      alert("Please select both a job and an alumni referrer");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/referrals', {
        jobId: selectedJob,
        alumniId: selectedAlumni,
        notes: requestNotes || 'I have reviewed the job description and feel my past projects align well with the team requirements.'
      });
      setSuccess(true);
      fetchData();
      setTimeout(() => {
        setSuccess(false);
        setShowRequestModal(false);
        setRequestNotes('');
      }, 1500);
    } catch (err) {
      alert(err.message || 'Failed to submit referral request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!activeRespondRef) return;
    try {
      await api.put(`/referrals/${activeRespondRef._id || activeRespondRef.id}/status`, {
        status,
        feedback: respondFeedback || (status === 'accepted' ? 'Submitted internal referral through company portal!' : 'Best of luck with your applications.')
      });
      setActiveRespondRef(null);
      setRespondFeedback('');
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update referral');
    }
  };

  const statusBadges = {
    pending: { label: 'Pending Review', color: 'bg-amber-50 text-amber-700 border-amber-200/60', icon: Clock },
    accepted: { label: 'Referral Submitted', color: 'bg-emerald-50 text-emerald-700 border-emerald-200/60', icon: CheckCircle },
    rejected: { label: 'Declined', color: 'bg-slate-100 text-slate-600 border-slate-200', icon: XCircle },
    completed: { label: 'Interview Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200/60', icon: CheckCircle }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
            <Handshake className="w-3.5 h-3.5" />
            Alumni Employee Referrals
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Referrals Network
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isAlumni
              ? "Review and submit company employee referrals requested by high-potential students."
              : "Connect with alumni working at Google, Stripe, Microsoft to request internal candidate referrals."}
          </p>
        </div>

        {!isAlumni && (
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Request Referral</span>
          </button>
        )}
      </div>

      {/* Referrals List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">
          {isAlumni ? 'Incoming Referral Requests' : 'Your Referral Pipeline'}
        </h2>

        {loading ? (
          <div className="py-12 text-center text-slate-400">Loading referrals...</div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 text-sm">
            No referral requests yet. Browse open jobs to request your first alumni referral!
          </div>
        ) : (
          referrals.map((ref) => {
            const statusInfo = statusBadges[ref.status || 'pending'] || statusBadges.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <div
                key={ref._id || ref.id}
                className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Building className="w-6 h-6" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-bold text-slate-900 text-base">{ref.job?.title || 'Software Engineering Position'}</h3>
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md border ${statusInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-700">{ref.job?.company || 'Top Tech Employer'}</span>
                      <span>&bull;</span>
                      <span>{isAlumni ? `Requested by ${ref.student?.name || 'Student'}` : `Referrer: ${ref.alumni?.name || 'Alumni Mentor'}`}</span>
                      <span>&bull;</span>
                      <span>{new Date(ref.createdAt).toLocaleDateString()}</span>
                    </p>

                    <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      &ldquo;{ref.notes}&rdquo;
                    </p>

                    {ref.feedback && (
                      <p className="text-xs text-blue-700 font-medium mt-1 bg-blue-50 p-2.5 rounded-xl border border-blue-100">
                        <strong>Referrer Feedback:</strong> {ref.feedback}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alumni Action controls */}
                {isAlumni && ref.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <button
                      onClick={() => setActiveRespondRef(ref)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                    >
                      Review & Respond
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Request Referral Modal (Student) */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setShowRequestModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-6">
              <h3 className="font-bold text-slate-900 text-lg">Request an Internal Referral</h3>
              <p className="text-xs text-slate-500 mt-1">Select the target job opening and an alumni working at that company.</p>
            </div>

            {success ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-bold text-slate-900">Referral Request Sent!</h4>
                <p className="text-xs text-slate-500">The alumni will review your resume and submit through their company portal.</p>
              </div>
            ) : (
              <form onSubmit={handleCreateReferral} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Job Opportunity</label>
                  <select
                    value={selectedJob}
                    onChange={(e) => setSelectedJob(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  >
                    <option value="">Select an open role...</option>
                    {jobs.map((j) => (
                      <option key={j._id || j.id} value={j._id || j.id}>
                        {j.title} &mdash; {j.company} ({j.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Alumni Referrer</label>
                  <select
                    value={selectedAlumni}
                    onChange={(e) => setSelectedAlumni(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none"
                  >
                    <option value="">Select alumni...</option>
                    {alumniList.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} &mdash; {a.jobTitle} @ {a.company}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Why are you a strong candidate? (Notes for Referrer)</label>
                  <textarea
                    rows={4}
                    required
                    value={requestNotes}
                    onChange={(e) => setRequestNotes(e.target.value)}
                    placeholder="Mention your relevant projects, tech stack experience, and why you are excited to join this team..."
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
                    disabled={submitting}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submitting ? 'Submitting...' : 'Submit Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Alumni Respond Modal */}
      {activeRespondRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-slate-200 relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setActiveRespondRef(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-slate-400 hover:text-slate-700"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-bold text-slate-900 text-lg mb-1">Respond to Referral Request</h3>
            <p className="text-xs text-slate-500 mb-4">
              From {activeRespondRef.student?.name} for {activeRespondRef.job?.title}
            </p>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 mb-4">
              <strong>Student's Pitch:</strong> &ldquo;{activeRespondRef.notes}&rdquo;
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Feedback / Internal Submission Note</label>
              <textarea
                rows={3}
                value={respondFeedback}
                onChange={(e) => setRespondFeedback(e.target.value)}
                placeholder="e.g. Submitted your profile to Google Internal Referral Portal! Good luck with the recruiter interview."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleUpdateStatus('rejected')}
                className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl"
              >
                Decline Request
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStatus('accepted')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
              >
                Accept & Confirm Referral
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
