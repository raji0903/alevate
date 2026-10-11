import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Search,
  Briefcase,
  Building,
  MapPin,
  CheckCircle,
  Bookmark,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';


// =====================================================
// USD TO INR CONVERSION
// =====================================================

const USD_TO_INR = 96.25;


// Format a number into Indian currency format
const formatIndianCurrency = (amount) => {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  }

  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  }

  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
};


// Convert a salary string containing USD into INR
const convertSalaryToINR = (salary) => {
  if (!salary) return salary;

  // Already INR
  if (salary.includes('₹')) {
    return salary;
  }

  // No dollar sign
  if (!salary.includes('$')) {
    return salary;
  }

  let result = salary;

  // -----------------------------------------------------
  // Convert values like:
  // $52
  // $58
  // $145,000
  // $175,000
  // $120k
  // $160k
  // -----------------------------------------------------

  result = result.replace(
    /\$(\d+(?:,\d{3})*(?:\.\d+)?)(k|K|m|M)?/g,
    (match, number, suffix) => {
      let value = parseFloat(number.replace(/,/g, ''));

      if (suffix === 'k' || suffix === 'K') {
        value *= 1000;
      }

      if (suffix === 'm' || suffix === 'M') {
        value *= 1000000;
      }

      const converted = value * USD_TO_INR;

      return formatIndianCurrency(converted);
    }
  );

  return result;
};


export default function JobsPage() {
  const { user } = useAuth();


  // =====================================================
  // JOB STATE
  // =====================================================

  const [jobs, setJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('recommended');


  // =====================================================
  // FILTERS
  // =====================================================

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');


  // =====================================================
  // APPLY MODAL
  // =====================================================

  const [applyingJob, setApplyingJob] = useState(null);
  const [applyNotes, setApplyNotes] = useState('');
  const [submittingApply, setSubmittingApply] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);


  // =====================================================
  // POST JOB MODAL
  // =====================================================

  const [showPostJobModal, setShowPostJobModal] = useState(false);

  const [postTitle, setPostTitle] = useState('');
  const [postCompany, setPostCompany] = useState('');

  const [postLocation, setPostLocation] = useState(
    'Chennai, India or Remote'
  );

  const [postType, setPostType] = useState('Full-time');
  const [postIndustry, setPostIndustry] = useState('Technology');

  // Default salary is now INR
  const [postSalary, setPostSalary] = useState('₹12 L - ₹16 L');

  const [postSkills, setPostSkills] = useState(
    'React, TypeScript, Node.js'
  );

  const [postDescription, setPostDescription] = useState('');
  const [postLoading, setPostLoading] = useState(false);


  // =====================================================
  // FETCH JOBS
  // =====================================================

  useEffect(() => {
    fetchJobs();

    if (user?.role === 'student') {
      fetchApplications();
    }
  }, [selectedType, selectedIndustry]);


  const fetchJobs = async () => {
    setLoading(true);

    try {
      let query = `?type=${selectedType}&industry=${selectedIndustry}`;

      if (search) {
        query += `&search=${encodeURIComponent(search)}`;
      }

      const res = await api.get(`/jobs${query}`);

      if (res.jobs) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // FETCH APPLICATIONS
  // =====================================================

  const fetchApplications = async () => {
    try {
      const res = await api.get('/jobs/my-applications');

      if (res.appliedJobs) {
        setAppliedJobs(res.appliedJobs);
      }
    } catch (err) {
      console.error(err);
    }
  };


  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };


  // =====================================================
  // SAVE JOB
  // =====================================================

  const toggleSaveJob = (jobId) => {
    setSavedJobIds((prev) => {
      const next = new Set(prev);

      if (next.has(jobId)) {
        next.delete(jobId);
      } else {
        next.add(jobId);
      }

      return next;
    });
  };


  // =====================================================
  // APPLY TO JOB
  // =====================================================

  const handleApply = async (e) => {
    e.preventDefault();

    if (!applyingJob) return;

    setSubmittingApply(true);

    try {
      await api.post(
        `/jobs/${applyingJob._id || applyingJob.id}/apply`,
        {
          notes:
            applyNotes ||
            'Experienced with React and Node.js. Excited about this opening!'
        }
      );

      setApplySuccess(true);

      fetchApplications();

      setTimeout(() => {
        setApplySuccess(false);
        setApplyingJob(null);
        setApplyNotes('');
      }, 1500);

    } catch (err) {
      alert(err.message || 'Application failed');

    } finally {
      setSubmittingApply(false);
    }
  };


  // =====================================================
  // CREATE JOB
  // =====================================================

  const handleCreateJob = async (e) => {
    e.preventDefault();

    setPostLoading(true);

    try {
      await api.post('/jobs', {
        title: postTitle,
        company: postCompany,
        location: postLocation,
        type: postType,
        industry: postIndustry,
        salary: postSalary,
        skillsRequired: postSkills
          .split(',')
          .map((s) => s.trim()),
        description: postDescription,
        referralAvailable: true
      });

      setShowPostJobModal(false);

      setPostTitle('');
      setPostCompany('');
      setPostDescription('');

      fetchJobs();

    } catch (err) {
      alert(err.message || 'Failed to post job');

    } finally {
      setPostLoading(false);
    }
  };


  // =====================================================
  // DISPLAYED JOBS
  // =====================================================

  let displayedJobs = jobs;

  if (activeTab === 'saved') {
    displayedJobs = jobs.filter((j) =>
      savedJobIds.has(j._id || j.id)
    );
  } else if (activeTab === 'applied') {
    displayedJobs = appliedJobs.map((a) => a.job);
  }


  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="space-y-8">


      {/* =====================================================
          TOP BANNER
          ===================================================== */}

      <div className="bg-[#0D0D0D] p-6 sm:p-8 rounded-3xl border border-[#292929] shadow-xs space-y-6">


        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1024] text-[#C084FC] text-xs font-bold mb-2 border border-[#4C1D95]">

              <Briefcase className="w-3.5 h-3.5" />

              Career & Internship Portal

            </div>


            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Find Your Next Opportunity
            </h1>


            <p className="text-[#A1A1AA] text-sm mt-1">
              Curated roles with direct alumni referrals at Google,
              Stripe, Microsoft, and high-growth startups.
            </p>

          </div>


          {(user?.role === 'alumni' || user?.role === 'admin') && (

            <button
              onClick={() => setShowPostJobModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all flex items-center gap-1.5 shrink-0"
            >

              <Plus className="w-4 h-4" />

              <span>Post Opportunity</span>

            </button>

          )}

        </div>


        {/* =====================================================
            SEARCH BAR
            ===================================================== */}

        <form
          onSubmit={handleSearchSubmit}
          className="flex flex-col sm:flex-row gap-3"
        >

          <div className="relative flex-1">

            <Search className="w-4 h-4 text-[#71717A] absolute left-3.5 top-1/2 -translate-y-1/2" />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company, skills (e.g. Google, Frontend, Python)..."
              className="w-full pl-10 pr-4 py-3 bg-[#111111] border border-[#292929] rounded-2xl text-sm text-white placeholder:text-[#52525B] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />

          </div>


          <button
            type="submit"
            className="px-6 py-3 rounded-2xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-sm shadow-md shadow-purple-500/20 transition-all"
          >
            Search Jobs
          </button>

        </form>


        {/* =====================================================
            TABS & FILTERS
            ===================================================== */}

        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4 pt-3 border-t border-[#242424]">


          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1.5 sm:pb-0">


            <button
              onClick={() => setActiveTab('recommended')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'recommended'
                  ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#171717] hover:bg-[#242424] text-[#D4D4D8]'
              }`}
            >
              Recommended ({jobs.length})
            </button>


            <button
              onClick={() => setActiveTab('applied')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'applied'
                  ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#171717] hover:bg-[#242424] text-[#D4D4D8]'
              }`}
            >
              Applied ({appliedJobs.length})
            </button>


            <button
              onClick={() => setActiveTab('saved')}
              className={`px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'saved'
                  ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/20'
                  : 'bg-[#171717] hover:bg-[#242424] text-[#D4D4D8]'
              }`}
            >
              Saved ({savedJobIds.size})
            </button>

          </div>


          <div className="flex items-center gap-1.5 sm:gap-2 text-xs flex-wrap">

            <span className="text-[#71717A] font-semibold text-[11px]">
              Type:
            </span>


            {['All', 'Full-time', 'Internship', 'Remote'].map((t) => (

              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all ${
                  selectedType === t
                    ? 'bg-[#A855F7] text-white'
                    : 'bg-[#171717] hover:bg-[#242424] text-[#A1A1AA]'
                }`}
              >
                {t}
              </button>

            ))}

          </div>

        </div>

      </div>


      {/* =====================================================
          JOBS LIST
          ===================================================== */}

      <div className="space-y-4">

        {loading ? (

          <div className="py-12 text-center text-[#71717A]">
            Loading opportunities...
          </div>

        ) : displayedJobs.length === 0 ? (

          <div className="p-12 text-center bg-[#0D0D0D] rounded-3xl border border-[#292929] text-[#A1A1AA] text-sm">
            No opportunities found in this category.
          </div>

        ) : (

          displayedJobs.map((job) => {

            const isSaved = savedJobIds.has(
              job._id || job.id
            );


            const isApplied = appliedJobs.some(
              (a) =>
                a.job?._id === job._id ||
                a.job?.id === job.id
            );


            return (

              <div
                key={job._id || job.id}
                className="bg-[#0D0D0D] p-6 rounded-3xl border border-[#292929] shadow-xs hover:border-[#4C1D95] hover:shadow-purple-500/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >


                <div className="flex items-start gap-4">


                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1A1024] to-[#241238] border border-[#4C1D95] text-[#C084FC] flex items-center justify-center shrink-0 font-bold">

                    <Building className="w-7 h-7" />

                  </div>


                  <div className="space-y-1.5">


                    <div className="flex items-center gap-2.5 flex-wrap">

                      <h3 className="font-bold text-white text-base">
                        {job.title}
                      </h3>


                      <span className="bg-[#171717] text-[#D4D4D8] text-[11px] font-bold px-2 py-0.5 rounded-md border border-[#292929]">
                        {job.type}
                      </span>


                      {job.referralAvailable && (

                        <span className="bg-[#1A1024] text-[#C084FC] text-[11px] font-bold px-2 py-0.5 rounded-md border border-[#4C1D95]">
                          Alumni Referral Available
                        </span>

                      )}

                    </div>


                    <p className="text-xs text-[#A1A1AA] flex items-center gap-3 flex-wrap">


                      <span className="font-bold text-[#E4E4E7]">
                        {job.company}
                      </span>


                      <span>&bull;</span>


                      <span className="flex items-center gap-1">

                        <MapPin className="w-3.5 h-3.5 text-[#71717A]" />

                        {job.location}

                      </span>


                      <span>&bull;</span>


                      <span className="text-[#C084FC] font-semibold">

                        {convertSalaryToINR(job.salary)}

                      </span>


                    </p>


                    <p className="text-xs text-[#A1A1AA] line-clamp-2 mt-1">
                      {job.description}
                    </p>


                    <div className="flex items-center gap-3 pt-1 flex-wrap">


                      <div className="flex flex-wrap gap-1.5">

                        {(job.skillsRequired || [
                          'React',
                          'Node.js',
                          'DSA'
                        ]).map((sk, idx) => (

                          <span
                            key={idx}
                            className="text-[11px] bg-[#171717] text-[#A1A1AA] border border-[#292929] font-medium px-2 py-0.5 rounded-md"
                          >
                            {sk}
                          </span>

                        ))}

                      </div>


                      <span className="text-xs font-bold text-[#C084FC] ml-auto md:ml-2">
                        87% Skill Match
                      </span>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    ACTION BUTTONS
                    ================================================= */}

                <div className="flex items-center md:flex-col gap-2 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-[#292929]">


                  {isApplied ? (

                    <span className="px-5 py-2.5 rounded-xl bg-[#1A1024] text-[#C084FC] font-bold text-xs border border-[#4C1D95] text-center flex items-center gap-1">

                      <CheckCircle className="w-3.5 h-3.5" />

                      Applied

                    </span>

                  ) : (

                    <button
                      onClick={() => setApplyingJob(job)}
                      className="flex-1 md:w-36 py-2.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs font-bold transition-all shadow-lg shadow-purple-500/20"
                    >
                      Apply Now
                    </button>

                  )}


                  <NavLink
                    to={`/referrals?jobId=${job._id || job.id}`}
                    className="flex-1 md:w-36 py-2.5 rounded-xl bg-[#1A1024] hover:bg-[#241238] text-[#C084FC] text-xs font-bold text-center border border-[#4C1D95] transition-colors"
                  >
                    Request Referral
                  </NavLink>


                  <button
                    onClick={() =>
                      toggleSaveJob(job._id || job.id)
                    }
                    className={`p-2.5 rounded-xl border transition-colors ${
                      isSaved
                        ? 'bg-[#1A1024] border-[#A855F7] text-[#C084FC]'
                        : 'bg-[#171717] border-[#292929] text-[#71717A] hover:text-[#C084FC] hover:border-[#4C1D95]'
                    }`}
                    title={isSaved ? 'Saved' : 'Save Job'}
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>


                </div>

              </div>

            );

          })

        )}

      </div>


      {/* =====================================================
          APPLY TO JOB MODAL
          ===================================================== */}

      {applyingJob && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">


          <div className="w-full max-w-lg bg-[#0D0D0D] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-[#292929] relative max-h-[92vh] overflow-y-auto">


            <button
              onClick={() => setApplyingJob(null)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#71717A] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>


            <div className="mb-6">

              <span className="text-[11px] font-bold text-[#C084FC] uppercase tracking-wide">
                {applyingJob.company}
              </span>


              <h3 className="font-bold text-white text-lg">
                {applyingJob.title}
              </h3>


              <p className="text-xs text-[#71717A] mt-1">

                {applyingJob.location}

                &bull;

                {applyingJob.type}

                &bull;

                {convertSalaryToINR(applyingJob.salary)}

              </p>

            </div>


            {applySuccess ? (

              <div className="py-8 text-center space-y-2">

                <CheckCircle className="w-12 h-12 text-[#A855F7] mx-auto" />

                <h4 className="font-bold text-white">
                  Application Submitted!
                </h4>

                <p className="text-xs text-[#71717A]">
                  Your profile and application have been recorded.
                </p>

              </div>

            ) : (

              <form
                onSubmit={handleApply}
                className="space-y-4"
              >


                <div>

                  <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                    Attached Resume
                  </label>


                  <div className="p-3 rounded-xl bg-[#171717] border border-[#292929] flex items-center justify-between text-xs">

                    <span className="font-semibold text-[#D4D4D8]">
                      Alex_Rivera_Resume_2026.pdf
                    </span>

                    <span className="text-[11px] text-[#C084FC] font-bold">
                      Uploaded
                    </span>

                  </div>

                </div>


                <div>

                  <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                    Application Note / Cover Note
                  </label>


                  <textarea
                    rows={4}
                    value={applyNotes}
                    onChange={(e) => setApplyNotes(e.target.value)}
                    placeholder="Briefly state why you're passionate about this role and relevant projects you have built..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>


                <div className="flex items-center justify-end gap-3 pt-2">


                  <button
                    type="button"
                    onClick={() => setApplyingJob(null)}
                    className="px-4 py-2 text-xs font-bold text-[#A1A1AA] hover:text-white"
                  >
                    Cancel
                  </button>


                  <button
                    type="submit"
                    disabled={submittingApply}
                    className="px-5 py-2.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
                  >
                    {submittingApply
                      ? 'Submitting...'
                      : 'Submit Application'}
                  </button>


                </div>

              </form>

            )}

          </div>

        </div>

      )}


      {/* =====================================================
          POST OPPORTUNITY MODAL
          ===================================================== */}

      {showPostJobModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">


          <div className="w-full max-w-xl bg-[#0D0D0D] rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 shadow-2xl border border-[#292929] relative max-h-[92vh] overflow-y-auto">


            <button
              onClick={() => setShowPostJobModal(false)}
              className="absolute top-4 right-4 sm:top-5 sm:right-5 text-[#71717A] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>


            <div className="mb-6">

              <h3 className="font-bold text-white text-lg">
                Post a New Opportunity
              </h3>

              <p className="text-xs text-[#71717A] mt-1">
                Share open internships or jobs at your organization with students.
              </p>

            </div>


            <form
              onSubmit={handleCreateJob}
              className="space-y-4"
            >


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


                <div>

                  <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                    Job Title
                  </label>

                  <input
                    type="text"
                    required
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="e.g. Software Engineer Intern"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>


                <div>

                  <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                    Company
                  </label>

                  <input
                    type="text"
                    required
                    value={postCompany}
                    onChange={(e) => setPostCompany(e.target.value)}
                    placeholder="e.g. Infosys or TCS"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>


              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">


                <div>

                  <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                    Job Type
                  </label>

                  <select
                    value={postType}
                    onChange={(e) => setPostType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >

                    <option value="Full-time">Full-time</option>

                    <option value="Internship">Internship</option>

                    <option value="Part-time">Part-time</option>

                    <option value="Remote">Remote</option>

                  </select>

                </div>


                <div>

                  <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                    Location
                  </label>

                  <input
                    type="text"
                    value={postLocation}
                    onChange={(e) => setPostLocation(e.target.value)}
                    placeholder="Chennai or Remote"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>


                <div>

                  <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                    Salary Range
                  </label>

                  <input
                    type="text"
                    value={postSalary}
                    onChange={(e) => setPostSalary(e.target.value)}
                    placeholder="₹8 L - ₹15 L"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />

                </div>

              </div>


              <div>

                <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                  Required Skills (Comma separated)
                </label>

                <input
                  type="text"
                  value={postSkills}
                  onChange={(e) => setPostSkills(e.target.value)}
                  placeholder="React, TypeScript, Go, System Design"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              <div>

                <label className="block text-xs font-bold text-[#D4D4D8] mb-1">
                  Description & Requirements
                </label>

                <textarea
                  rows={4}
                  required
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                  placeholder="Describe the responsibilities, tech stack, and ideal candidate profile..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>


              <div className="flex items-center justify-end gap-3 pt-2">


                <button
                  type="button"
                  onClick={() => setShowPostJobModal(false)}
                  className="px-4 py-2 text-xs font-bold text-[#A1A1AA] hover:text-white"
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  disabled={postLoading}
                  className="px-5 py-2.5 rounded-xl bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs font-bold shadow-md shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  {postLoading ? 'Posting...' : 'Publish Job'}
                </button>


              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}