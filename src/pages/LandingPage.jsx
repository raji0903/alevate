import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  ChevronRight,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import Avatar from "../components/common/Avatar";
import AlevateLogo from "../components/common/AlevateLogo";
import { useAuth } from "../context/AuthContext";

export default function LandingPage() {
  const {
    user,
    login,
    register,
    loginWithGoogle,
    loginWithGithub,
  } = useAuth();

  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authRole, setAuthRole] = useState("student");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [experience, setExperience] = useState(3);
  const [skills, setSkills] = useState("");
  const [bio, setBio] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    setErrorMsg("");
    setInfoMsg("");
    setLoading(true);

    try {
      if (authMode === "login") {
        const res = await login(email, password);

        setShowAuthModal(false);

        if (res.user?.role === "alumni") {
          navigate("/alumni/dashboard");
        } else if (res.user?.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      } else {
        const payload = {
          name,
          email,
          password,
          role: authRole,
          ...(authRole === "alumni"
            ? {
                company,
                jobTitle,
                experience: Number(experience),
                skills,
                bio,
              }
            : {
                college,
                department,
              }),
        };

        await register(payload);

        setShowAuthModal(false);

        if (authRole === "alumni") {
          navigate("/alumni/dashboard");
        } else {
          navigate("/student/dashboard");
        }
      }
    } catch (err) {
      setErrorMsg(
        err.message ||
          "Authentication failed. Please verify credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMentorshipClick = (mentorName = "") => {
    if (user) {
      if (user.role === "student") {
        navigate(
          `/mentors${
            mentorName
              ? `?search=${encodeURIComponent(mentorName)}`
              : ""
          }`
        );
      } else {
        navigate("/dashboard");
      }
    } else {
      setAuthMode("login");
      setErrorMsg("");

      setInfoMsg(
        mentorName
          ? `Please sign in to your student account to request mentorship with ${mentorName}.`
          : "Please sign in to your student account to request mentorship."
      );

      setShowAuthModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-purple-500 selection:text-white">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="h-16 sm:h-20 bg-[#080808]/95 backdrop-blur-md border-b border-[#262626] sticky top-0 z-40 px-4 sm:px-8 md:px-12 flex items-center justify-between">

        <AlevateLogo
          size="md"
          showText={true}
          subtitle="Mentorship & Careers"
        />

        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#a3a3a3]">

          <a
            href="#how-it-works"
            className="hover:text-[#C084FC] transition-colors"
          >
            How It Works
          </a>

          <a
            href="#mentors"
            className="hover:text-[#C084FC] transition-colors"
          >
            Find Mentors
          </a>

          <a
            href="#approval-policy"
            className="hover:text-[#C084FC] transition-colors"
          >
            Alumni Verification
          </a>

        </nav>

        <div className="flex items-center gap-2 sm:gap-3">

          <button
            onClick={() => {
              setAuthMode("login");
              setErrorMsg("");
              setInfoMsg("");
              setShowAuthModal(true);
            }}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold text-[#d4d4d4] hover:text-white hover:bg-[#171717] rounded-xl"
          >
            Sign In
          </button>

          <button
            onClick={() => {
              setAuthMode("register");
              setAuthRole("student");
              setErrorMsg("");
              setInfoMsg("");
              setShowAuthModal(true);
            }}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl bg-[#A855F7] hover:bg-[#9333EA] text-white text-xs sm:text-sm font-bold shadow-lg shadow-purple-500/20"
          >
            Create Account
          </button>

        </div>
      </header>


      {/* =====================================================
          HERO SECTION
      ===================================================== */}

      <section className="relative pt-12 pb-20 px-6 sm:px-12 max-w-7xl mx-auto">

        <div className="text-center max-w-3xl mx-auto">

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[#C084FC] text-xs font-bold mb-6">

            <span className="w-2 h-2 rounded-full bg-[#A855F7] animate-pulse"></span>

            Integrated Alumni-Student Mentorship & Job Portal

          </div>


          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.15] mb-6">

            Connect. Learn.{" "}

            <span className="bg-gradient-to-r from-[#A855F7] via-[#C084FC] to-[#9333EA] bg-clip-text text-transparent">
              Elevate.
            </span>

          </h1>


          <p className="text-base sm:text-lg text-[#a3a3a3] font-normal leading-relaxed mb-8">

            Empowering students with 1-on-1 mentorship, career navigation,
            and verified company referrals. Anyone can register as alumni,
            with administrator verification of experience and skills ensuring
            mentorship quality.

          </p>


          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">

            <button
              onClick={() => {
                setAuthMode("register");
                setAuthRole("student");
                setErrorMsg("");
                setInfoMsg("");
                setShowAuthModal(true);
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
            >

              <Users className="w-4 h-4" />

              <span>Join as Student (Instant Access)</span>

            </button>


            <button
              onClick={() => {
                setAuthMode("register");
                setAuthRole("alumni");
                setErrorMsg("");
                setInfoMsg("");
                setShowAuthModal(true);
              }}
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#0D0D0D] hover:bg-[#161616] text-white font-bold text-sm border border-[#3a3a3a] hover:border-purple-500/60 flex items-center justify-center gap-2"
            >

              <GraduationCap className="w-4 h-4 text-[#C084FC]" />

              <span>Register as Alumni Mentor</span>

            </button>

          </div>

        </div>


        {/* =====================================================
            APPROVAL POLICY
        ===================================================== */}

        <div
          id="approval-policy"
          className="mt-14 rounded-3xl bg-[#0D0D0D] border border-[#292929] p-6 sm:p-10 shadow-2xl"
        >

          <div className="max-w-3xl">

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 text-[#C084FC] text-xs font-bold mb-3 border border-purple-500/30">

              <ShieldCheck className="w-3.5 h-3.5 text-[#A855F7]" />

              Quality & Trust Framework

            </div>


            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">

              Alumni Verification & Admin Approval

            </h2>


            <p className="text-[#a3a3a3] text-sm mt-2 leading-relaxed">

              To ensure collegiate mentees receive top-tier, trustworthy
              career advice and valid company referrals, Alevate enforces
              role-specific onboarding:

            </p>


            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

              <div className="p-4 rounded-2xl bg-[#111111] border border-purple-500/20">

                <div className="flex items-center gap-2 text-[#C084FC] font-bold text-sm mb-1.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7]" />

                  <span>Student Access (Immediate)</span>

                </div>

                <p className="text-xs text-[#929292] leading-relaxed">

                  Any student can register with their university email and
                  immediately access mentor directories, AI career tools,
                  and internship postings.

                </p>

              </div>


              <div className="p-4 rounded-2xl bg-[#111111] border border-purple-500/20">

                <div className="flex items-center gap-2 text-[#C084FC] font-bold text-sm mb-1.5">

                  <Clock className="w-4 h-4 text-[#A855F7]" />

                  <span>Alumni Access (Admin Review)</span>

                </div>

                <p className="text-xs text-[#929292] leading-relaxed">

                  Any alumni can register for the alumni role. The
                  administrator reviews their company, job title, years of
                  experience, and skills before approving their mentor
                  profile.

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section id="how-it-works" className="mt-16">

          <div className="text-center max-w-2xl mx-auto mb-10">

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">

              How Alevate Works

            </h2>

            <p className="text-[#737373] text-xs sm:text-sm mt-1">

              A balanced ecosystem connecting ambitious students with
              experienced industry leaders.

            </p>

          </div>


          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#292929] shadow-xl space-y-4 hover:border-purple-500/30">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-[#C084FC] text-xs font-bold border border-purple-500/20">

                <Users className="w-3.5 h-3.5" />

                For Students

              </div>


              <h3 className="text-lg font-bold text-white">

                Accelerate Your Career

              </h3>


              <ul className="space-y-3 text-xs sm:text-sm text-[#a3a3a3]">

                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      Verified Mentors:
                    </strong>{" "}

                    Connect with alumni filtered by dream companies, skills,
                    and experience.

                  </span>

                </li>


                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      1-on-1 Sessions:
                    </strong>{" "}

                    Schedule mock interviews, resume critiques, and system
                    design roadmaps.

                  </span>

                </li>


                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      Direct Referrals:
                    </strong>{" "}

                    Request internal employee referrals for active tech
                    openings.

                  </span>

                </li>


                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      Alevate AI Companion:
                    </strong>{" "}

                    Receive real-time career guidance, skill gap analysis,
                    and tailored outreach drafts.

                  </span>

                </li>

              </ul>

            </div>


            <div className="p-6 sm:p-8 rounded-3xl bg-[#0D0D0D] border border-[#292929] shadow-xl space-y-4 hover:border-purple-500/30">

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-purple-500/10 text-[#C084FC] text-xs font-bold border border-purple-500/20">

                <GraduationCap className="w-3.5 h-3.5" />

                For Alumni Mentors

              </div>


              <h3 className="text-lg font-bold text-white">

                Give Back on Your Terms

              </h3>


              <ul className="space-y-3 text-xs sm:text-sm text-[#a3a3a3]">

                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      Simple Registration:
                    </strong>{" "}

                    Enter your company, skills, and experience; admin reviews
                    and activates your mentor badge.

                  </span>

                </li>


                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      Post Openings:
                    </strong>{" "}

                    Help your organization hire top collegiate talent through
                    direct job posts.

                  </span>

                </li>


                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      Accept Requests:
                    </strong>{" "}

                    Choose topics you love and set your availability.

                  </span>

                </li>


                <li className="flex items-start gap-2.5">

                  <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0 mt-0.5" />

                  <span>

                    <strong className="text-white">
                      Referral Pipeline:
                    </strong>{" "}

                    Review student resumes and submit internal employee
                    referrals easily.

                  </span>

                </li>

              </ul>

            </div>

          </div>

        </section>


        {/* =====================================================
            FEATURED MENTORS
        ===================================================== */}

        <section id="mentors" className="mt-16">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">

            <div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">

                Featured Alumni Mentors

              </h2>

              <p className="text-xs sm:text-sm text-[#737373] mt-1">

                Verified industry leaders ready to guide your trajectory.

              </p>

            </div>


            <button
              onClick={() => {
                if (user) {
                  navigate("/mentors");
                } else {
                  setAuthMode("login");
                  setErrorMsg("");
                  setInfoMsg(
                    "Please sign in to your student account to explore and connect with all alumni mentors."
                  );
                  setShowAuthModal(true);
                }
              }}
              className="mt-3 sm:mt-0 text-xs sm:text-sm font-bold text-[#C084FC] hover:text-[#A855F7] flex items-center gap-1"
            >

              <span>Explore All Mentors</span>

              <ChevronRight className="w-4 h-4" />

            </button>

          </div>


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {/* Priya */}

            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#292929] shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between">

              <div>

                <div className="flex items-start justify-between gap-3 mb-4">

                  <div className="flex items-center gap-3">

                    <Avatar name="Priya Sharma" size="lg" />

                    <div>

                      <h4 className="font-bold text-white text-sm">
                        Priya Sharma
                      </h4>

                      <p className="text-xs text-[#737373]">

                        Senior SWE @{" "}

                        <span className="font-bold text-[#C084FC]">
                          Google
                        </span>

                      </p>

                    </div>

                  </div>


                  <span className="bg-purple-500/10 text-[#C084FC] text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-500/30">
                    Verified
                  </span>

                </div>


                <p className="text-xs text-[#929292] mb-3 line-clamp-2">

                  Alumni class of 2019. Passionate about helping ambitious
                  students break into big tech and build scalable distributed
                  systems.

                </p>


                <div className="flex flex-wrap gap-1.5 mb-4">

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    System Design
                  </span>

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    Go
                  </span>

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    Kubernetes
                  </span>

                </div>

              </div>


              <button
                onClick={() =>
                  handleRequestMentorshipClick("Priya Sharma")
                }
                className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#C084FC] border border-purple-500/20 text-xs font-bold"
              >
                Request Mentorship
              </button>

            </div>


            {/* Marcus */}

            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#292929] shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between">

              <div>

                <div className="flex items-start justify-between gap-3 mb-4">

                  <div className="flex items-center gap-3">

                    <Avatar name="Marcus Vance" size="lg" />

                    <div>

                      <h4 className="font-bold text-white text-sm">
                        Marcus Vance
                      </h4>

                      <p className="text-xs text-[#737373]">

                        Principal Lead @{" "}

                        <span className="font-bold text-[#C084FC]">
                          Microsoft
                        </span>

                      </p>

                    </div>

                  </div>


                  <span className="bg-purple-500/10 text-[#C084FC] text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-500/30">
                    Verified
                  </span>

                </div>


                <p className="text-xs text-[#929292] mb-3 line-clamp-2">

                  Former startup founder turned Microsoft product leader.
                  Mentoring the next generation of product thinkers and AI
                  builders.

                </p>


                <div className="flex flex-wrap gap-1.5 mb-4">

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    Product Strategy
                  </span>

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    AI / ML
                  </span>

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    Leadership
                  </span>

                </div>

              </div>


              <button
                onClick={() =>
                  handleRequestMentorshipClick("Marcus Vance")
                }
                className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#C084FC] border border-purple-500/20 text-xs font-bold"
              >
                Request Mentorship
              </button>

            </div>


            {/* Aisha */}

            <div className="p-6 rounded-3xl bg-[#0D0D0D] border border-[#292929] shadow-xl hover:border-purple-500/40 transition-all flex flex-col justify-between">

              <div>

                <div className="flex items-start justify-between gap-3 mb-4">

                  <div className="flex items-center gap-3">

                    <Avatar name="Aisha Patel" size="lg" />

                    <div>

                      <h4 className="font-bold text-white text-sm">
                        Aisha Patel
                      </h4>

                      <p className="text-xs text-[#737373]">

                        Staff Frontend @{" "}

                        <span className="font-bold text-[#C084FC]">
                          Stripe
                        </span>

                      </p>

                    </div>

                  </div>


                  <span className="bg-purple-500/10 text-[#C084FC] text-[10px] font-bold px-2 py-0.5 rounded-md border border-purple-500/30">
                    Verified
                  </span>

                </div>


                <p className="text-xs text-[#929292] mb-3 line-clamp-2">

                  Specializing in high-reliability financial interfaces.
                  Happy to conduct mock coding interviews and portfolio
                  reviews.

                </p>


                <div className="flex flex-wrap gap-1.5 mb-4">

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    React
                  </span>

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    TypeScript
                  </span>

                  <span className="text-[11px] bg-purple-500/10 text-[#C084FC] font-medium px-2 py-0.5 rounded-md">
                    UI Systems
                  </span>

                </div>

              </div>


              <button
                onClick={() =>
                  handleRequestMentorshipClick("Aisha Patel")
                }
                className="w-full py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-[#C084FC] border border-purple-500/20 text-xs font-bold"
              >
                Request Mentorship
              </button>

            </div>

          </div>

        </section>

      </section>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="py-10 bg-[#080808] border-t border-[#292929] px-6 sm:px-12 text-center text-xs text-[#737373]">

        <div className="flex items-center justify-center mb-3">

          <AlevateLogo
            size="sm"
            showText={true}
            subtitle="Mentorship & Careers"
          />

        </div>


        <p className="text-[#a3a3a3] font-medium">

          Empowering students through verified alumni guidance, job
          opportunities, and referrals.

        </p>


        <p className="text-[#555555] text-[11px] mt-1">

          &copy; {new Date().getFullYear()} ALEVATE. All rights reserved.

        </p>

      </footer>


      {/* =====================================================
          AUTH MODAL
      ===================================================== */}

      {showAuthModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">

          <div className="w-full max-w-lg bg-[#0D0D0D] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#333333] relative max-h-[92vh] overflow-y-auto">

            {/* CLOSE */}

            <button
              onClick={() => {
                setShowAuthModal(false);
                setErrorMsg("");
                setInfoMsg("");
              }}
              className="absolute top-5 right-5 text-[#737373] hover:text-white"
            >

              <X className="w-5 h-5" />

            </button>


            {/* TITLE */}

            <div className="mb-5">

              <h3 className="text-xl font-bold text-white">

                {authMode === "login"
                  ? "Sign in to Alevate"
                  : "Create an Account"}

              </h3>


              <p className="text-xs text-[#737373] mt-1">

                {authMode === "login"
                  ? "Sign in to access your mentorship sessions, opportunities, and dashboard"
                  : "Join as a student (instant access) or as an alumni mentor (admin verified)"}

              </p>

            </div>


            {/* INFO */}

            {infoMsg && (

              <div className="p-3 mb-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-[#C084FC] text-xs font-semibold flex items-center gap-2">

                <CheckCircle className="w-4 h-4 text-[#A855F7] shrink-0" />

                <span>{infoMsg}</span>

              </div>

            )}


            {/* ERROR */}

            {errorMsg && (

              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-2">

                <AlertCircle className="w-4 h-4 shrink-0" />

                <span>{errorMsg}</span>

              </div>

            )}


            {/* SOCIAL LOGIN */}

            {authMode === "login" && (

              <div className="mb-4">

                {/* GOOGLE */}

                <button
                  type="button"
                  onClick={loginWithGoogle}
                  className="w-full py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-sm"
                  style={{
                    backgroundColor: "#ffffff",
                    color: "#111111",
                    border: "1px solid #e5e7eb",
                  }}
                >

                  {/* Google Logo */}

                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >

                    <path
                      fill="#4285F4"
                      d="M21.35 12.27c0-.79-.07-1.55-.23-2.27H12v4.3h5.22a4.46 4.46 0 0 1-1.94 2.93v2.44h3.14c1.84-1.69 2.93-4.18 2.93-7.4z"
                    />

                    <path
                      fill="#34A853"
                      d="M12 21.6c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.93-3.31.93-2.54 0-4.7-1.72-5.47-4.04H3.29v2.52A9.75 9.75 0 0 0 12 21.6z"
                    />

                    <path
                      fill="#FBBC05"
                      d="M6.53 13.69A5.86 5.86 0 0 1 6.22 12c0-.59.1-1.16.31-1.69V7.79H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.06 1.04 4.21l3.24-2.52z"
                    />

                    <path
                      fill="#EA4335"
                      d="M12 6.27c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.84 3.36 14.63 2.4 12 2.4a9.75 9.75 0 0 0-8.71 5.39l3.24 2.52C7.3 7.99 9.46 6.27 12 6.27z"
                    />

                  </svg>

                  Continue with Google

                </button>


                {/* GITHUB */}

                <button
                  type="button"
                  onClick={loginWithGithub}
                  className="w-full mt-3 py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-sm"
                  style={{
                    backgroundColor: "#111111",
                    color: "#ffffff",
                    border: "1px solid #333333",
                  }}
                >

                  {/* GitHub Logo */}

                  <svg
                    width="23"
                    height="23"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >

                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.483 0-.237-.009-.866-.013-1.7-2.782.604-3.369-1.342-3.369-1.342-.455-1.155-1.11-1.463-1.11-1.463-.908-.62.069-.607.069-.607 1.004.071 1.532 1.032 1.532 1.032.892 1.529 2.341 1.087 2.91.831.091-.646.349-1.087.635-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0 1 12 6.844a9.6 9.6 0 0 1 2.504.337c1.909-1.294 2.748-1.025 2.748-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .268.18.58.688.482A10.001 10.001 0 0 0 22 12C22 6.477 17.523 2 12 2z" />

                  </svg>

                  Continue with GitHub

                </button>


                {/* DIVIDER */}

                <div className="flex items-center gap-3 my-4">

                  <div className="flex-1 h-px bg-[#292929]" />

                  <span className="text-[10px] font-bold text-[#737373] uppercase">

                    Or continue with email

                  </span>

                  <div className="flex-1 h-px bg-[#292929]" />

                </div>

              </div>

            )}


            {/* AUTH FORM */}

            <form
              onSubmit={handleAuthSubmit}
              className="space-y-3.5"
            >

              {/* REGISTER */}

              {authMode === "register" && (

                <>

                  <div>

                    <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                      Select Your Role

                    </label>


                    <div className="grid grid-cols-2 gap-2">

                      {/* STUDENT */}

                      <button
                        type="button"
                        onClick={() => setAuthRole("student")}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          authRole === "student"
                            ? "bg-purple-500/15 border-[#A855F7] text-[#C084FC] ring-2 ring-purple-500/20"
                            : "bg-[#111111] border-[#333333] text-[#a3a3a3] hover:bg-[#171717]"
                        }`}
                      >

                        <span className="block font-bold text-xs">
                          🎓 Student
                        </span>

                        <span className="text-[10px] text-[#737373] block mt-0.5">
                          Instant Access
                        </span>

                      </button>


                      {/* ALUMNI */}

                      <button
                        type="button"
                        onClick={() => setAuthRole("alumni")}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          authRole === "alumni"
                            ? "bg-purple-500/15 border-[#A855F7] text-[#C084FC] ring-2 ring-purple-500/20"
                            : "bg-[#111111] border-[#333333] text-[#a3a3a3] hover:bg-[#171717]"
                        }`}
                      >

                        <span className="block font-bold text-xs">
                          💼 Alumni Mentor
                        </span>

                        <span className="text-[10px] text-[#737373] block mt-0.5">
                          Admin Verified
                        </span>

                      </button>

                    </div>

                  </div>


                  {/* ALUMNI NOTICE */}

                  {authRole === "alumni" ? (

                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-[#C084FC] space-y-1">

                      <p className="font-bold flex items-center gap-1.5 text-[#e9d5ff]">

                        <ShieldCheck className="w-4 h-4 text-[#A855F7]" />

                        <span>
                          Alumni Administrator Approval Required
                        </span>

                      </p>


                      <p className="text-[11px] leading-relaxed text-[#a3a3a3]">

                        Anyone can register as an alumni. The administrator
                        will review your experience and skills before granting
                        mentor access to ensure student safety.

                      </p>

                    </div>

                  ) : (

                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl text-xs text-[#C084FC]">

                      <p className="font-bold flex items-center gap-1.5 text-[#e9d5ff]">

                        <CheckCircle className="w-4 h-4 text-[#A855F7]" />

                        <span>
                          Instant Student Registration
                        </span>

                      </p>


                      <p className="text-[11px] text-[#a3a3a3] leading-relaxed">

                        Any student can register and access all mentorship,
                        jobs, and referral request tools immediately.

                      </p>

                    </div>

                  )}


                  {/* NAME */}

                  <div>

                    <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                      Full Name

                    </label>


                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Rivera or Priya Sharma"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />

                  </div>


                  {/* ALUMNI DETAILS */}

                  {authRole === "alumni" && (

                    <>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <div>

                          <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                            Current Company

                          </label>


                          <input
                            type="text"
                            required
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="e.g. Google, Databricks, Stripe"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />

                        </div>


                        <div>

                          <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                            Job Designation

                          </label>


                          <input
                            type="text"
                            required
                            value={jobTitle}
                            onChange={(e) => setJobTitle(e.target.value)}
                            placeholder="e.g. Senior Software Engineer"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />

                        </div>

                      </div>


                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        <div>

                          <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                            Years of Experience

                          </label>


                          <input
                            type="number"
                            min="0"
                            max="40"
                            required
                            value={experience}
                            onChange={(e) => setExperience(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />

                        </div>


                        <div>

                          <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                            Technical Skills

                          </label>


                          <input
                            type="text"
                            required
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="System Design, Go, React, AI"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          />

                        </div>

                      </div>


                      <div>

                        <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                          Brief Bio & Mentorship Topics

                        </label>


                        <textarea
                          rows={2}
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Briefly state your industry experience and what topics you can mentor students on..."
                          className="w-full px-3.5 py-2 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />

                      </div>

                    </>

                  )}


                  {/* STUDENT DETAILS */}

                  {authRole === "student" && (

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      <div>

                        <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                          University / College

                        </label>


                        <input
                          type="text"
                          value={college}
                          onChange={(e) => setCollege(e.target.value)}
                          placeholder="e.g. State University"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />

                      </div>


                      <div>

                        <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                          Department / Major

                        </label>


                        <input
                          type="text"
                          value={department}
                          onChange={(e) =>
                            setDepartment(e.target.value)
                          }
                          placeholder="Computer Science"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        />

                      </div>

                    </div>

                  )}

                </>

              )}


              {/* EMAIL */}

              <div>

                <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                  Email Address

                </label>


                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com or name@university.edu"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />

              </div>


              {/* PASSWORD */}

              <div>

                <label className="block text-xs font-bold text-[#d4d4d4] mb-1">

                  Password

                </label>


                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#111111] border border-[#333333] text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />

              </div>


              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-[#A855F7] hover:bg-[#9333EA] text-white font-bold text-sm shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 mt-2"
              >

                {loading
                  ? "Processing..."
                  : authMode === "login"
                  ? "Sign In to Account"
                  : authRole === "alumni"
                  ? "Submit Alumni Registration for Review"
                  : "Register & Access Portal"}

              </button>

            </form>


            {/* SWITCH LOGIN/REGISTER */}

            <div className="mt-4 pt-3 border-t border-[#292929] text-center">

              {authMode === "login" ? (

                <p className="text-xs text-[#737373]">

                  Don't have an account?{" "}

                  <button
                    onClick={() => {
                      setAuthMode("register");
                      setAuthRole("student");
                      setErrorMsg("");
                      setInfoMsg("");
                    }}
                    className="font-bold text-[#C084FC] hover:text-[#A855F7] hover:underline"
                  >

                    Register here

                  </button>

                </p>

              ) : (

                <p className="text-xs text-[#737373]">

                  Already registered?{" "}

                  <button
                    onClick={() => {
                      setAuthMode("login");
                      setErrorMsg("");
                      setInfoMsg("");
                    }}
                    className="font-bold text-[#C084FC] hover:text-[#A855F7] hover:underline"
                  >

                    Sign in here

                  </button>

                </p>

              )}

            </div>

          </div>

        </div>

      )}

    </div>
  );
}