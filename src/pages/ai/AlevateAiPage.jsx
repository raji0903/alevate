import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  User,
  Bot,
  FileText,
  Briefcase,
  Code,
  RotateCcw,
  Copy,
  Check,
  Users,
  Target,
  UploadCloud,
  LoaderCircle,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function AlevateAiPage() {
  const { user } = useAuth();

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name || 'there'}! 👋 I am Alevate AI, your personal Career & Mentorship Companion.

I can help you with:

• Resume optimization and project presentation
• Alumni mentorship and referral messages
• Technical interviews and coding roadmaps
• Career planning and skill development
• Job application preparation

How can I help advance your career today?`,
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const [mentorMatches, setMentorMatches] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);
  const [recommendationError, setRecommendationError] = useState('');
  const [mentorLoading, setMentorLoading] = useState(false);
  const [jobLoading, setJobLoading] = useState(false);

  const [resumeFile, setResumeFile] = useState(null);
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [resumeAnalysis, setResumeAnalysis] = useState('');
  const [resumeSkills, setResumeSkills] = useState([]);
  const [resumeJobMatches, setResumeJobMatches] = useState([]);
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Supports clients that return either Axios responses or response data.
  const getResponseData = (response) => {
    if (
      response &&
      typeof response === 'object' &&
      'data' in response
    ) {
      return response.data;
    }

    return response;
  };

  // ========================================
  // CHATBOT
  // ========================================
  const handleSend = async (messageText = input) => {
    const text = messageText.trim();

    if (!text || loading) return;

    const previousMessages = messages;

    setMessages((previous) => [
      ...previous,
      { role: 'user', content: text },
    ]);

    setInput('');
    setLoading(true);

    try {
      const response = await api.post('/ai/chat', {
        message: text,
        conversationHistory: previousMessages
          .filter((message) =>
            ['user', 'assistant'].includes(message.role)
          )
          .slice(-10)
          .map((message) => ({
            role: message.role,
            content: message.content,
          })),
      });

      const data = getResponseData(response);
      const reply = data?.reply;

      if (
        !data?.success ||
        typeof reply !== 'string' ||
        !reply.trim()
      ) {
        throw new Error(
          data?.message || 'The AI returned an empty response.'
        );
      }

      setMessages((previous) => [
        ...previous,
        { role: 'assistant', content: reply.trim() },
      ]);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Please try again.';

      setMessages((previous) => [
        ...previous,
        {
          role: 'assistant',
          content: `Sorry, Alevate AI encountered an issue: ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          'Chat session reset! What career goal or interview topic shall we tackle next?',
      },
    ]);
    setInput('');
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIdx(index);

      setTimeout(() => setCopiedIdx(null), 1500);
    } catch {
      console.error('Unable to copy message.');
    }
  };

  // ========================================
  // MENTOR RECOMMENDATIONS
  // ========================================
  const loadMentorMatches = async () => {
    setMentorLoading(true);
    setRecommendationError('');

    try {
      const response = await api.get('/ai/recommend-mentors');
      const data = getResponseData(response);

      setMentorMatches(
        Array.isArray(data?.recommendations)
          ? data.recommendations
          : []
      );
    } catch (error) {
      setRecommendationError(
        error?.response?.data?.message ||
          error?.message ||
          'Could not load mentor recommendations.'
      );
    } finally {
      setMentorLoading(false);
    }
  };

  // ========================================
  // JOB RECOMMENDATIONS
  // ========================================
  const loadJobMatches = async () => {
    setJobLoading(true);
    setRecommendationError('');

    try {
      const response = await api.get('/ai/recommend-jobs');
      const data = getResponseData(response);

      setJobMatches(
        Array.isArray(data?.recommendations)
          ? data.recommendations
          : []
      );
    } catch (error) {
      setRecommendationError(
        error?.response?.data?.message ||
          error?.message ||
          'Could not load job recommendations.'
      );
    } finally {
      setJobLoading(false);
    }
  };

  // ========================================
  // RESUME ANALYSIS
  // ========================================
  const analyzeResume = async (event) => {
    event.preventDefault();

    setResumeError('');
    setResumeAnalysis('');
    setResumeSkills([]);
    setResumeJobMatches([]);

    if (!resumeFile) {
      setResumeError('Choose a PDF or TXT resume first.');
      return;
    }

    if (resumeFile.size > 8 * 1024 * 1024) {
      setResumeError('Please choose a file smaller than 8 MB.');
      return;
    }

    const extension = resumeFile.name
      .split('.')
      .pop()
      .toLowerCase();

    if (!['pdf', 'txt'].includes(extension)) {
      setResumeError(
        'AI analysis currently supports PDF and TXT files.'
      );
      return;
    }

    setResumeLoading(true);

    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result);
        reader.onerror = () =>
          reject(new Error('Could not read the selected file.'));

        reader.readAsDataURL(resumeFile);
      });

      const response = await api.post('/ai/analyze-resume', {
        resumeDataUrl: dataUrl,
        fileName: resumeFile.name,
        targetRole,
      });

      const data = getResponseData(response);

      if (data?.success === false) {
        throw new Error(
          data.message || 'Resume analysis failed.'
        );
      }

      setResumeAnalysis(
        data?.analysis || 'No analysis was returned.'
      );

      setResumeSkills(
        Array.isArray(data?.extractedSkills)
          ? data.extractedSkills
          : []
      );

      setResumeJobMatches(
        Array.isArray(data?.jobRecommendations)
          ? data.jobRecommendations
          : []
      );
    } catch (error) {
      setResumeError(
        error?.response?.data?.message ||
          error?.message ||
          'Resume analysis failed.'
      );
    } finally {
      setResumeLoading(false);
    }
  };

  // ========================================
  // SUGGESTED PROMPTS
  // ========================================
  const suggestionPrompts = [
    {
      label: 'Optimize Resume for Google',
      icon: FileText,
      prompt:
        'How should I optimize my resume bullet points for a Google Software Engineering Internship?',
    },
    {
      label: 'Alumni Referral Template',
      icon: Briefcase,
      prompt:
        'Draft a polite and effective message asking an alumni at Stripe for a job referral.',
    },
    {
      label: 'LeetCode & Coding Roadmap',
      icon: Code,
      prompt:
        'What are the top 10 algorithmic patterns I must master for technical interviews?',
    },
  ];

  // ========================================
  // UI
  // ========================================
  return (
    <div className="mx-auto max-w-4xl space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-violet-800/40 bg-gradient-to-r from-violet-900 via-slate-900 to-indigo-950 p-5 text-white shadow-xl sm:rounded-3xl sm:p-7 md:p-8">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/20 px-3 py-1 text-xs font-bold text-violet-300">
            <Sparkles className="h-3.5 w-3.5" />
            Alevate AI Assistant
          </div>

          <h1 className="text-xl font-extrabold tracking-tight sm:text-2xl md:text-3xl">
            Your Career Companion
          </h1>

          <p className="text-xs text-slate-300 sm:text-sm">
            Personalized career guidance and mentorship powered by AI.
          </p>
        </div>

        <button
          type="button"
          onClick={resetConversation}
          className="shrink-0 rounded-xl bg-white/10 p-2.5 text-slate-300 transition-colors hover:bg-white/20 hover:text-white"
          title="Reset conversation"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>

      {/* Suggested Prompts */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-3">
        {suggestionPrompts.map((suggestion) => {
          const Icon = suggestion.icon;

          return (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => handleSend(suggestion.prompt)}
              disabled={loading}
              className="group flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:border-violet-300 hover:bg-violet-50/50 disabled:opacity-50 sm:rounded-2xl"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 transition-colors group-hover:bg-violet-600 group-hover:text-white">
                <Icon className="h-4 w-4" />
              </div>

              <span className="line-clamp-2 text-xs font-bold text-slate-800">
                {suggestion.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Chat Window */}
      <div className="flex h-[500px] min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:h-[540px] sm:rounded-3xl">

        {/* Messages: scroll manually, no automatic page movement */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {messages.map((message, index) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={`${index}-${message.role}`}
                className={`flex gap-3 ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`relative max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-6 sm:max-w-[80%] ${
                    isUser
                      ? 'rounded-br-sm bg-blue-600 text-white'
                      : 'rounded-bl-sm border border-slate-200 bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="pr-5 font-sans text-sm leading-6 break-words">
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{message.content}</div>
                    ) : (
                      <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="text-lg font-bold mt-3 mb-2">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-base font-bold mt-3 mb-2">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-sm font-bold mt-3 mb-1">{children}</h3>
        ),
        p: ({ children }) => (
          <p className="mb-3 last:mb-0">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
        ),
        li: ({ children }) => <li>{children}</li>,
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-violet-400 pl-3 my-3 text-slate-600">
            {children}
          </blockquote>
        ),
        strong: ({ children }) => (
          <strong className="font-bold">{children}</strong>
        ),
        code: ({ children, className }) => {
          const isBlock = Boolean(className);

          return isBlock ? (
            <code className="block overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-white">
              {children}
            </code>
          ) : (
            <code className="rounded bg-violet-100 px-1 py-0.5 text-violet-800">
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="overflow-x-auto mb-3 rounded-lg bg-slate-900">
            {children}
          </pre>
        ),
        hr: () => <hr className="my-4 border-slate-200" />,
      }}
    >
      {message.content}
    </ReactMarkdown>
  )}
</div>

                  {!isUser && (
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(message.content, index)
                      }
                      className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-slate-700"
                      title="Copy response"
                    >
                      {copiedIdx === index ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white">
                <Sparkles className="h-4 w-4 animate-pulse" />
              </div>

              <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Alevate AI is preparing your response...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
          className="flex shrink-0 items-center gap-2 border-t border-slate-200 bg-slate-50/60 p-3 sm:gap-3 sm:p-4"
        >
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about resumes, interviews or career planning..."
            className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-2xl bg-violet-600 px-4 py-3 text-xs font-bold text-white shadow-md transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5"
          >
            <span>Ask AI</span>
            <Send className="h-3.5 w-3.5" />
          </button>
        </form>
      </div>

      {/* AI Recommendations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-violet-600" />
          <h2 className="text-lg font-extrabold text-slate-900">
            Personalized AI Recommendations
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          Discover mentors and opportunities that align with your career goals.
        </p>

        {recommendationError && (
          <p
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
          >
            {recommendationError}
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

          {/* Mentor Matches */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-violet-600" />
              <h3 className="font-bold text-slate-900">
                AI Mentor Matches
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Find alumni whose skills and experience align with your goals.
            </p>

            <button
              type="button"
              onClick={loadMentorMatches}
              disabled={mentorLoading}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {mentorLoading ? 'Finding mentors...' : 'Find matching mentors'}
            </button>

            {mentorMatches.map((mentor, index) => (
              <div
                key={mentor.profileId || mentor.id || mentor.mentorId || index}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {mentor.name || 'Mentor'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {mentor.jobTitle || mentor.title || ''}
                      {mentor.company ? ` at ${mentor.company}` : ''}
                    </p>
                  </div>

                  {(mentor.matchScore ?? mentor.score) != null && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                      {mentor.matchScore ?? mentor.score}%
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-600">
                  {mentor.reason || ''}
                </p>
              </div>
            ))}

            {!mentorLoading && mentorMatches.length === 0 && (
              <p className="text-xs text-slate-400">
                Select Find matching mentors to load recommendations.
              </p>
            )}
          </div>

          {/* Job Matches */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-violet-600" />
              <h3 className="font-bold text-slate-900">
                AI Job Matches
              </h3>
            </div>

            <p className="text-xs text-slate-500">
              Discover jobs and internships that match your skills.
            </p>

            <button
              type="button"
              onClick={loadJobMatches}
              disabled={jobLoading}
              className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {jobLoading ? 'Matching jobs...' : 'Find matching jobs'}
            </button>

            {jobMatches.map((job, index) => (
              <div
                key={job.id || job.jobId || index}
                className="rounded-xl border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {job.title || 'Job opportunity'}
                    </p>
                    <p className="text-xs text-slate-600">
                      {job.company || ''}
                      {job.type ? ` · ${job.type}` : ''}
                    </p>
                  </div>

                  {(job.matchScore ?? job.score) != null && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                      {job.matchScore ?? job.score}%
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs text-slate-600">
                  {job.reason || ''}
                </p>

                {job.missingSkills?.length > 0 && (
                  <p className="mt-1 text-xs text-amber-700">
                    Skills to build: {job.missingSkills.slice(0, 4).join(', ')}
                  </p>
                )}
              </div>
            ))}

            {!jobLoading && jobMatches.length === 0 && (
              <p className="text-xs text-slate-400">
                Select Find matching jobs to load recommendations.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Resume Analysis */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-violet-600" />
          <h2 className="text-lg font-extrabold text-slate-900">
            AI Resume Analysis
          </h2>
        </div>

        <p className="text-sm text-slate-500">
          Upload a PDF or TXT resume to receive feedback for your target role.
          Your backend must support the selected file format.
        </p>

        <form
          onSubmit={analyzeResume}
          className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_1fr_auto]"
        >
          <label className="block text-xs font-bold text-slate-700">
            Resume file (PDF/TXT)

            <input
              type="file"
              accept=".pdf,.txt,application/pdf,text/plain"
              onChange={(event) =>
                setResumeFile(event.target.files?.[0] || null)
              }
              className="mt-2 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:font-bold file:text-violet-700"
            />

            {resumeFile && (
              <span className="mt-1 block font-normal text-slate-500">
                {resumeFile.name}
              </span>
            )}
          </label>

          <label className="block text-xs font-bold text-slate-700">
            Target role

            <input
              value={targetRole}
              onChange={(event) => setTargetRole(event.target.value)}
              maxLength={150}
              className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-normal focus:outline-none focus:ring-2 focus:ring-violet-500"
              placeholder="e.g. Java Developer"
            />
          </label>

          <button
            type="submit"
            disabled={resumeLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
          >
            {resumeLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}

            {resumeLoading ? 'Analyzing...' : 'Analyze resume'}
          </button>
        </form>

        {resumeError && (
          <p
            role="alert"
            className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700"
          >
            {resumeError}
          </p>
        )}

        {resumeAnalysis && (
          <div className="whitespace-pre-wrap break-words rounded-xl border border-violet-100 bg-violet-50/50 p-4 text-sm leading-6 text-slate-800">
            <div className="mb-2 font-bold text-violet-900">
              Your resume feedback
            </div>

            {resumeAnalysis}
          </div>
        )}

        {resumeSkills.length > 0 && (
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">
              Skills extracted from your resume
            </h3>

            <div className="flex flex-wrap gap-2">
              {resumeSkills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {resumeAnalysis && (
          <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-bold text-slate-900">
              Jobs matched against your resume
            </h3>

            <p className="text-xs text-slate-500">
              Match scores are estimates, not hiring guarantees.
            </p>

            {resumeJobMatches.length > 0 ? (
              resumeJobMatches.map((job, index) => (
                <div
                  key={job.id || job.jobId || index}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {job.title}
                      </p>
                      <p className="text-xs text-slate-600">
                        {job.company || ''}
                        {job.location ? ` · ${job.location}` : ''}
                      </p>
                    </div>

                    {(job.matchScore ?? job.score) != null && (
                      <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">
                        {job.matchScore ?? job.score}% match
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-slate-600">
                    {job.reason || ''}
                  </p>

                  {job.missingSkills?.length > 0 && (
                    <p className="mt-1 text-xs text-amber-700">
                      Skills to develop: {job.missingSkills.slice(0, 5).join(', ')}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">
                No resume-based job recommendations were returned.
                Ensure your backend implements resume extraction and matching.
              </p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
