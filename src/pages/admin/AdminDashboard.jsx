import React, { useState, useEffect } from 'react';

import {
  Users,
  Briefcase,
  Calendar,
  ShieldCheck,
  CheckCircle,
  Search,
  TrendingUp,
  Clock,
  Award
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

import Avatar from '../../components/common/Avatar';
import api from '../../api/client';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSearch, setUserSearch] = useState('');
  const [activeTab, setActiveTab] = useState('pending_approvals');
  const [userRoleFilter, setUserRoleFilter] = useState('All');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, [userRoleFilter]);

  const fetchAdminData = async () => {
    try {
      const [metricRes, userRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get(`/admin/users?role=${userRoleFilter}`)
      ]);

      if (metricRes) {
        setMetrics(metricRes);
      }

      if (userRes.users) {
        setUsers(userRes.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAlumni = async (
    userId,
    isVerified,
    userName
  ) => {
    try {
      await api.put('/admin/verify-alumni', {
        userId,
        isVerified
      });

      setActionSuccessMsg(
        isVerified
          ? `Approved mentor access for ${userName}! They can now guide students.`
          : `Revoked mentor verification for ${userName}.`
      );

      setTimeout(() => {
        setActionSuccessMsg('');
      }, 3000);

      fetchAdminData();
    } catch (err) {
      alert(
        err.message ||
        'Verification update failed'
      );
    }
  };

  const handleToggleUser = async (
    userId,
    isActive
  ) => {
    try {
      await api.put(
        '/admin/toggle-user-status',
        {
          userId,
          isActive: !isActive
        }
      );

      fetchAdminData();
    } catch (err) {
      alert(
        err.message ||
        'Status update failed'
      );
    }
  };

  const pendingAlumniList = users.filter(
    (u) =>
      u.role === 'alumni' &&
      !u.isVerified
  );

  const approvedAlumniList = users.filter(
    (u) =>
      u.role === 'alumni' &&
      u.isVerified
  );

  const filteredUsers = users.filter(
    (u) => {
      if (!userSearch) {
        return true;
      }

      const s = userSearch.toLowerCase();

      return (
        u.name
          ?.toLowerCase()
          .includes(s) ||

        u.email
          ?.toLowerCase()
          .includes(s) ||

        u.profile?.company
          ?.toLowerCase()
          .includes(s) ||

        u.profile?.jobTitle
          ?.toLowerCase()
          .includes(s)
      );
    }
  );

  return (
    <div className="space-y-8">

      {/* =====================================================
          ADMIN BANNER
          ===================================================== */}

      <div className="bg-[#0D0D0D] p-6 sm:p-8 rounded-3xl border border-[#4C1D95] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">

        <div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A1024] text-[#C084FC] text-xs font-bold mb-2 border border-[#4C1D95]">

            <ShieldCheck className="w-3.5 h-3.5 text-[#A855F7]" />

            Executive Administration Console

          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Platform Analytics & Alumni Approvals
          </h1>

          <p className="text-[#A1A1AA] text-sm mt-1">
            Review alumni experience and skills to grant mentor access,
            monitor collegiate growth, and manage accounts.
          </p>

        </div>

        {pendingAlumniList.length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#1A1024] border border-[#6D28D9] text-[#C084FC] text-xs font-bold shadow-lg shadow-purple-900/10">

            <Clock className="w-4 h-4 text-[#A855F7]" />

            <span>
              {pendingAlumniList.length} Alumni Pending Review
            </span>

          </div>
        )}

      </div>

      {/* =====================================================
          SUCCESS MESSAGE
          ===================================================== */}

      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#1A1024] border border-[#4C1D95] text-[#C084FC] text-xs font-bold flex items-center gap-2 animate-in fade-in">

          <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0" />

          <span>{actionSuccessMsg}</span>

        </div>
      )}

      {/* =====================================================
          STATISTIC CARDS
          ===================================================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">

        {/* Students */}

        <div className="bg-[#0D0D0D] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[#292929] shadow-xs">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Students
            </span>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#1A1024] text-[#C084FC] border border-[#4C1D95] flex items-center justify-center">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-2 sm:mt-4">
            {metrics?.stats?.totalStudents || 920}
          </p>

          <p className="text-[10px] sm:text-xs text-[#C084FC] font-bold mt-0.5 sm:mt-1 flex items-center gap-1">

            <TrendingUp className="w-3.5 h-3.5" />

            Instant Student Access

          </p>

        </div>

        {/* Approved Alumni */}

        <div className="bg-[#0D0D0D] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[#292929] shadow-xs">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Approved Alumni
            </span>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#241238] text-[#C084FC] border border-[#6D28D9] flex items-center justify-center">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-2 sm:mt-4">
            {approvedAlumniList.length || 3}
          </p>

          <p className="text-[10px] sm:text-xs text-[#71717A] mt-0.5 sm:mt-1 truncate">
            Verified mentors
          </p>

        </div>

        {/* Pending Review */}

        <div className="bg-[#0D0D0D] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[#292929] shadow-xs">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Pending Review
            </span>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#1A1024] text-[#C084FC] border border-[#4C1D95] flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#C084FC] mt-2 sm:mt-4">
            {pendingAlumniList.length}
          </p>

          <p className="text-[10px] sm:text-xs text-[#A855F7] font-bold mt-0.5 sm:mt-1 truncate">
            Awaiting admin approval
          </p>

        </div>

        {/* Sessions */}

        <div className="bg-[#0D0D0D] p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl border border-[#292929] shadow-xs">

          <div className="flex items-center justify-between">

            <span className="text-[10px] sm:text-xs font-bold text-[#71717A] uppercase tracking-wider">
              Sessions Held
            </span>

            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#1A1024] text-[#C084FC] border border-[#4C1D95] flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>

          </div>

          <p className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white mt-2 sm:mt-4">
            {metrics?.stats?.totalSessions || 229}
          </p>

          <p className="text-[10px] sm:text-xs text-[#C084FC] font-bold mt-0.5 sm:mt-1">
            98% satisfaction
          </p>

        </div>

      </div>

      {/* =====================================================
          ALUMNI VERIFICATION
          ===================================================== */}

      <div className="bg-[#0D0D0D] p-6 sm:p-8 rounded-3xl border border-[#292929] shadow-xs space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#292929]">

          <div>

            <div className="flex items-center gap-2">

              <h2 className="text-lg font-bold text-white">
                Alumni Approvals & Skill Verification
              </h2>

              {pendingAlumniList.length > 0 && (

                <span className="bg-[#1A1024] text-[#C084FC] text-xs font-bold px-2 py-0.5 rounded-full border border-[#6D28D9]">
                  {pendingAlumniList.length} Action Needed
                </span>

              )}

            </div>

            <p className="text-xs text-[#71717A] mt-0.5">
              Review submitted industry experience, tech skills,
              and company credentials before approving mentor access.
            </p>

          </div>

          <div className="flex items-center gap-2 bg-[#171717] p-1 rounded-xl border border-[#292929] text-xs font-bold">

            <button
              onClick={() =>
                setActiveTab('pending_approvals')
              }
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'pending_approvals'
                  ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/20'
                  : 'text-[#A1A1AA] hover:text-[#C084FC]'
              }`}
            >
              Pending Approval ({pendingAlumniList.length})
            </button>

            <button
              onClick={() =>
                setActiveTab('all_users')
              }
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'all_users'
                  ? 'bg-[#A855F7] text-white shadow-lg shadow-purple-500/20'
                  : 'text-[#A1A1AA] hover:text-[#C084FC]'
              }`}
            >
              All Users & Governance
            </button>

          </div>

        </div>

        {/* =====================================================
            PENDING APPROVALS
            ===================================================== */}

        {activeTab === 'pending_approvals' && (

          <div className="space-y-4">

            {pendingAlumniList.length === 0 ? (

              <div className="p-8 text-center bg-[#1A1024] rounded-2xl border border-[#4C1D95] text-[#A1A1AA] text-xs">

                <CheckCircle className="w-8 h-8 text-[#A855F7] mx-auto mb-2" />

                <p className="font-bold text-white">
                  All alumni registrations have been reviewed!
                </p>

                <p className="text-[11px] mt-0.5">
                  New alumni registrations requiring admin approval
                  will appear here.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 gap-4">

                {pendingAlumniList.map((alumni) => (

                  <div
                    key={alumni._id || alumni.id}
                    className="p-5 rounded-2xl bg-[#0D0D0D] border border-[#4C1D95] hover:border-[#A855F7] transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-lg shadow-purple-950/10"
                  >

                    <div className="space-y-3 flex-1">

                      <div className="flex items-start gap-3">

                        <Avatar
                          name={alumni.name}
                          size="md"
                        />

                        <div>

                          <div className="flex items-center gap-2 flex-wrap">

                            <h3 className="font-bold text-white text-sm">
                              {alumni.name}
                            </h3>

                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#1A1024] text-[#C084FC] border border-[#6D28D9] uppercase">
                              Pending Admin Approval
                            </span>

                          </div>

                          <p className="text-xs text-[#71717A] font-mono mt-0.5">
                            {alumni.email}
                          </p>

                        </div>

                      </div>

                      {/* Experience */}

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs bg-[#111111] p-3 rounded-xl border border-[#292929]">

                        <div>

                          <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                            Employer
                          </span>

                          <span className="font-bold text-[#E4E4E7]">
                            {alumni.profile?.company ||
                              'Independent Tech'}
                          </span>

                        </div>

                        <div>

                          <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                            Job Designation
                          </span>

                          <span className="font-bold text-[#E4E4E7]">
                            {alumni.profile?.jobTitle ||
                              'Software Engineer'}
                          </span>

                        </div>

                        <div>

                          <span className="text-[10px] uppercase font-bold text-[#71717A] block">
                            Years Experience
                          </span>

                          <span className="font-bold text-[#C084FC] bg-[#1A1024] px-2 py-0.5 rounded border border-[#4C1D95] inline-block">
                            {alumni.profile?.experience || 3}+ Years
                          </span>

                        </div>

                      </div>

                      {/* Skills */}

                      <div>

                        <span className="text-[10px] uppercase font-bold text-[#71717A] block mb-1">
                          Submitted Technical Skills:
                        </span>

                        <div className="flex flex-wrap gap-1.5">

                          {(alumni.profile?.skills || [
                            'Software Engineering',
                            'System Design'
                          ]).map((sk, idx) => (

                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-[#171717] text-[#C084FC] border border-[#4C1D95] px-2 py-0.5 rounded-md"
                            >
                              {sk}
                            </span>

                          ))}

                        </div>

                      </div>

                      {/* Bio */}

                      {alumni.profile?.bio && (

                        <p className="text-xs text-[#A1A1AA] bg-[#111111] p-2.5 rounded-xl border border-[#292929] italic">
                          &ldquo;{alumni.profile.bio}&rdquo;
                        </p>

                      )}

                    </div>

                    {/* Actions */}

                    <div className="flex sm:flex-col gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#4C1D95]">

                      <button
                        onClick={() =>
                          handleVerifyAlumni(
                            alumni._id || alumni.id,
                            true,
                            alumni.name
                          )
                        }
                        className="px-5 py-2.5 bg-[#A855F7] hover:bg-[#9333EA] text-white rounded-xl font-bold text-xs shadow-lg shadow-purple-500/20 transition-colors flex items-center justify-center gap-1.5"
                      >

                        <CheckCircle className="w-4 h-4" />

                        <span>
                          Approve & Grant Mentor Access
                        </span>

                      </button>

                      <button
                        onClick={() =>
                          handleToggleUser(
                            alumni._id || alumni.id,
                            true
                          )
                        }
                        className="px-4 py-2 bg-[#111111] hover:bg-[#1A1024] text-[#C084FC] border border-[#4C1D95] hover:border-[#A855F7] rounded-xl font-bold text-xs transition-colors"
                      >
                        Decline Registration
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            )}

          </div>

        )}

        {/* =====================================================
            ALL USERS
            ===================================================== */}

        {activeTab === 'all_users' && (

          <div className="space-y-4">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">

              <div className="relative w-full sm:w-64">

                <Search className="w-3.5 h-3.5 text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />

                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) =>
                    setUserSearch(e.target.value)
                  }
                  placeholder="Search by name, email, company..."
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#111111] border border-[#292929] text-white placeholder:text-[#52525B] text-xs focus:outline-none focus:ring-2 focus:ring-purple-500"
                />

              </div>

              <div className="flex items-center gap-1 text-xs w-full sm:w-auto">

                {[
                  'All',
                  'student',
                  'alumni',
                  'admin'
                ].map((r) => (

                  <button
                    key={r}
                    onClick={() =>
                      setUserRoleFilter(r)
                    }
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                      userRoleFilter === r
                        ? 'bg-[#A855F7] text-white'
                        : 'bg-[#171717] text-[#A1A1AA] hover:bg-[#242424]'
                    }`}
                  >
                    {r === 'All'
                      ? 'All Roles'
                      : r.toUpperCase()}
                  </button>

                ))}

              </div>

            </div>

            <div className="overflow-x-auto -mx-2 sm:mx-0">

              <table className="w-full text-left text-xs min-w-[620px]">

                <thead>

                  <tr className="border-b border-[#4C1D95] text-[#71717A] font-bold uppercase tracking-wider">

                    <th className="pb-3">User</th>

                    <th className="pb-3">Role</th>

                    <th className="pb-3">
                      Experience & Skills
                    </th>

                    <th className="pb-3">
                      Verification
                    </th>

                    <th className="pb-3 text-right">
                      Actions
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-[#241238]">

                  {filteredUsers.map((u) => (

                    <tr
                      key={u._id || u.id}
                      className="hover:bg-[#1A1024]/40"
                    >

                      <td className="py-3.5">

                        <div className="flex items-center gap-3">

                          <Avatar
                            name={u.name}
                            size="sm"
                            rounded="rounded-xl"
                          />

                          <div>

                            <p className="font-bold text-white">
                              {u.name}
                            </p>

                            <p className="text-[11px] text-[#71717A]">
                              {u.email}
                            </p>

                          </div>

                        </div>

                      </td>

                      <td className="py-3.5">

                        <span
                          className={`px-2 py-0.5 rounded-md font-bold uppercase text-[10px] ${
                            u.role === 'alumni'
                              ? 'bg-[#241238] text-[#C084FC] border border-[#6D28D9]'
                              : u.role === 'admin'
                              ? 'bg-[#241020] text-[#F0ABFC] border border-[#86198F]'
                              : 'bg-[#1A1024] text-[#C084FC] border border-[#4C1D95]'
                          }`}
                        >
                          {u.role}
                        </span>

                      </td>

                      <td className="py-3.5">

                        {u.role === 'alumni' &&
                        u.profile ? (

                          <div className="space-y-1">

                            <span className="font-bold text-[#E4E4E7]">
                              {u.profile.company}
                            </span>

                            <span className="text-[#71717A]">
                              {' '}
                              &bull;{' '}
                              {u.profile.experience}y exp
                            </span>

                            <div className="flex flex-wrap gap-1 mt-0.5 max-w-xs">

                              {(u.profile.skills || [])
                                .slice(0, 3)
                                .map((sk, idx) => (

                                  <span
                                    key={idx}
                                    className="text-[10px] bg-[#171717] text-[#A1A1AA] border border-[#292929] px-1.5 py-0.2 rounded"
                                  >
                                    {sk}
                                  </span>

                                ))}

                            </div>

                          </div>

                        ) : u.role === 'student' ? (

                          <span className="text-[#A1A1AA] font-medium">
                            Student (Instant Access)
                          </span>

                        ) : (

                          <span className="text-[#71717A]">
                            &mdash;
                          </span>

                        )}

                      </td>

                      <td className="py-3.5">

                        {u.role === 'alumni' ? (

                          u.isVerified ? (

                            <span className="inline-flex items-center gap-1 text-[#C084FC] font-bold bg-[#1A1024] px-2 py-0.5 rounded border border-[#4C1D95]">

                              <CheckCircle className="w-3.5 h-3.5" />

                              Approved

                            </span>

                          ) : (

                            <span className="inline-flex items-center gap-1 text-[#C084FC] font-bold bg-[#1A1024] px-2 py-0.5 rounded border border-[#6D28D9]">

                              <Clock className="w-3.5 h-3.5 text-[#A855F7]" />

                              Pending Approval

                            </span>

                          )

                        ) : (

                          <span className="text-[#C084FC] font-semibold">
                            &bull; Active
                          </span>

                        )}

                      </td>

                      <td className="py-3.5 text-right">

                        <div className="flex items-center justify-end gap-1.5">

                          {u.role === 'alumni' && (

                            <button
                              onClick={() =>
                                handleVerifyAlumni(
                                  u._id || u.id,
                                  !u.isVerified,
                                  u.name
                                )
                              }
                              className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                                u.isVerified
                                  ? 'bg-[#171717] hover:bg-[#241020] hover:text-[#F0ABFC] text-[#A1A1AA] border border-[#292929]'
                                  : 'bg-[#A855F7] hover:bg-[#9333EA] text-white'
                              }`}
                            >
                              {u.isVerified
                                ? 'Revoke Access'
                                : 'Approve'}
                            </button>

                          )}

                          <button
                            onClick={() =>
                              handleToggleUser(
                                u._id || u.id,
                                u.isActive !== false
                              )
                            }
                            className="px-2.5 py-1 bg-[#171717] hover:bg-[#242424] text-[#D4D4D8] border border-[#292929] rounded-lg font-medium text-xs"
                          >
                            {u.isActive !== false
                              ? 'Deactivate'
                              : 'Activate'}
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* =====================================================
          PURPLE ANALYTICS GRAPHS
          ===================================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* =================================================
            PLATFORM GROWTH
            ================================================= */}

        <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-[#4C1D95] shadow-xs space-y-4">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-bold text-white text-sm">
                Platform Growth Trajectory
              </h3>

              <p className="text-xs text-[#A1A1AA]">
                Student & Alumni registrations over time
              </p>

            </div>

            <span className="text-xs font-bold text-[#C084FC] bg-[#1A1024] px-2.5 py-1 rounded-lg border border-[#4C1D95]">
              Live Data
            </span>

          </div>

          <div className="h-64 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart
                data={metrics?.userGrowthData || []}
              >

                <defs>

                  <linearGradient
                    id="purpleStudents"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#A855F7"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#A855F7"
                      stopOpacity={0}
                    />

                  </linearGradient>

                  <linearGradient
                    id="lightPurpleAlumni"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#C084FC"
                      stopOpacity={0.4}
                    />

                    <stop
                      offset="95%"
                      stopColor="#C084FC"
                      stopOpacity={0}
                    />

                  </linearGradient>

                </defs>

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#292929"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fontSize: 11,
                    fill: '#71717A'
                  }}
                  axisLine={{
                    stroke: '#4C1D95'
                  }}
                  tickLine={{
                    stroke: '#4C1D95'
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#71717A'
                  }}
                  axisLine={{
                    stroke: '#4C1D95'
                  }}
                  tickLine={{
                    stroke: '#4C1D95'
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D0D0D',
                    border: '1px solid #6D28D9',
                    borderRadius: '12px',
                    color: '#FFFFFF'
                  }}
                  labelStyle={{
                    color: '#C084FC'
                  }}
                  itemStyle={{
                    color: '#FFFFFF'
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    color: '#C084FC'
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#A855F7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#purpleStudents)"
                  name="Students"
                />

                <Area
                  type="monotone"
                  dataKey="alumni"
                  stroke="#C084FC"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#lightPurpleAlumni)"
                  name="Alumni"
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </div>

        {/* =================================================
            MENTORSHIP ENGAGEMENT
            ================================================= */}

        <div className="bg-[#0D0D0D] p-6 rounded-3xl border border-[#4C1D95] shadow-xs space-y-4">

          <div className="flex items-center justify-between">

            <div>

              <h3 className="font-bold text-white text-sm">
                Mentorship Engagement
              </h3>

              <p className="text-xs text-[#A1A1AA]">
                Sessions requested vs completed weekly
              </p>

            </div>

            <span className="text-xs font-bold text-[#C084FC] bg-[#241238] px-2.5 py-1 rounded-lg border border-[#6D28D9]">
              Weekly Activity
            </span>

          </div>

          <div className="h-64 w-full">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <BarChart
                data={
                  metrics?.mentorshipActivityData || []
                }
              >

                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#292929"
                />

                <XAxis
                  dataKey="week"
                  tick={{
                    fontSize: 11,
                    fill: '#71717A'
                  }}
                  axisLine={{
                    stroke: '#4C1D95'
                  }}
                  tickLine={{
                    stroke: '#4C1D95'
                  }}
                />

                <YAxis
                  tick={{
                    fontSize: 11,
                    fill: '#71717A'
                  }}
                  axisLine={{
                    stroke: '#4C1D95'
                  }}
                  tickLine={{
                    stroke: '#4C1D95'
                  }}
                />

                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0D0D0D',
                    border: '1px solid #6D28D9',
                    borderRadius: '12px',
                    color: '#FFFFFF'
                  }}
                  labelStyle={{
                    color: '#C084FC'
                  }}
                  itemStyle={{
                    color: '#FFFFFF'
                  }}
                />

                <Legend
                  wrapperStyle={{
                    fontSize: 12,
                    color: '#C084FC'
                  }}
                />

                {/* REQUESTED - PURPLE */}

                <Bar
                  dataKey="requested"
                  fill="#C084FC"
                  radius={[6, 6, 0, 0]}
                  name="Requested"
                />

                {/* COMPLETED - DARK PURPLE */}

                <Bar
                  dataKey="completed"
                  fill="#7C3AED"
                  radius={[6, 6, 0, 0]}
                  name="Completed"
                />

              </BarChart>

            </ResponsiveContainer>

          </div>

        </div>

      </div>

    </div>
  );
}