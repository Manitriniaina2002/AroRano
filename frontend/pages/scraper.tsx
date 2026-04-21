'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { api, CreateScrapingJobInput, DatasetEntry, ScrapingJob } from '@/lib/api';
import { FiActivity, FiDownload, FiExternalLink, FiFileText, FiPlus, FiPlay, FiRefreshCw, FiSave, FiTrash2 } from 'react-icons/fi';

type ScraperTab = 'jobs' | 'dataset' | 'manual';

const emptyJobForm: CreateScrapingJobInput = {
  sourceUrl: '',
  targetUrl: '',
  sourceLanguage: 'en',
  targetLanguage: 'mg',
  title: '',
  mode: 'wikipedia-bilingual',
};

const emptyManualForm = {
  sourceUrl: '',
  targetUrl: '',
  sourceLanguage: 'en',
  targetLanguage: 'mg',
  sourceTitle: '',
  targetTitle: '',
  sourceText: '',
  targetText: '',
  notes: '',
  sectionTitle: '',
};

function badgeVariant(status: string): 'success' | 'warning' | 'destructive' | 'default' {
  const normalized = status.toLowerCase();
  if (normalized === 'completed' || normalized === 'translated' || normalized === 'reviewed') return 'success';
  if (normalized === 'running' || normalized === 'pending') return 'warning';
  if (normalized === 'failed' || normalized === 'rejected') return 'destructive';
  return 'default';
}

function formatTimestamp(value?: string | null) {
  if (!value) return 'n/a';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'n/a' : date.toLocaleString();
}

export default function ScraperPage() {
  const [activeTab, setActiveTab] = useState<ScraperTab>('jobs');
  const [jobs, setJobs] = useState<ScrapingJob[]>([]);
  const [entries, setEntries] = useState<DatasetEntry[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingEntryId, setSavingEntryId] = useState<string | null>(null);
  const [jobForm, setJobForm] = useState<CreateScrapingJobInput>(emptyJobForm);
  const [manualForm, setManualForm] = useState(emptyManualForm);
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'jsonl'>('json');

  const selectedJob = useMemo(() => jobs.find((job) => job.id === selectedJobId) ?? null, [jobs, selectedJobId]);

  const loadJobs = async () => {
    const data = await api.scraper.listJobs();
    setJobs(data);
    if (!selectedJobId && data.length > 0) {
      setSelectedJobId(data[0].id);
    }
  };

  const loadEntries = async (jobId?: string) => {
    const response = await api.scraper.getEntries(jobId || undefined, 200, 0);
    setEntries(response.data);
  };

  const refreshAll = async () => {
    setLoading(true);
    try {
      await loadJobs();
      await loadEntries(selectedJobId || undefined);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load scraper data';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void refreshAll();
    }, 8000);

    return () => window.clearInterval(timer);
  }, [selectedJobId]);

  useEffect(() => {
    if (selectedJobId) {
      void loadEntries(selectedJobId).catch(() => undefined);
    }
  }, [selectedJobId]);

  const runningJobs = jobs.filter((job) => job.status === 'running').length;
  const completedJobs = jobs.filter((job) => job.status === 'completed').length;
  const pendingEntries = entries.filter((entry) => entry.entryStatus === 'pending').length;
  const translatedEntries = entries.filter((entry) => entry.entryStatus === 'translated' || entry.entryStatus === 'reviewed').length;

  const handleCreateJob = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const payload = {
        ...jobForm,
        sourceUrl: jobForm.sourceUrl.trim(),
        targetUrl: jobForm.targetUrl?.trim() || undefined,
        title: jobForm.title?.trim() || undefined,
      };

      const createdJob = await api.scraper.createJob(payload);
      toast.success('Scraping job started');
      setJobs((current) => [createdJob, ...current]);
      setSelectedJobId(createdJob.id);
      setActiveTab('jobs');
      setJobForm(emptyJobForm);
      await loadEntries(createdJob.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create job';
      toast.error(message);
    }
  };

  const handleRunJob = async (jobId: string) => {
    try {
      const updatedJob = await api.scraper.runJob(jobId);
      toast.success('Job rerun started');
      setJobs((current) => current.map((job) => (job.id === updatedJob.id ? updatedJob : job)));
      await refreshAll();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to rerun job';
      toast.error(message);
    }
  };

  const handleSaveEntry = async (entry: DatasetEntry) => {
    try {
      setSavingEntryId(entry.id);
      const updated = await api.scraper.updateEntry(entry.id, {
        targetText: entry.targetText ?? undefined,
        entryStatus: entry.entryStatus as 'pending' | 'translated' | 'reviewed' | 'rejected',
        notes: entry.notes ?? undefined,
        confidence: entry.confidence ?? undefined,
        targetTitle: entry.targetTitle ?? undefined,
        sectionTitle: entry.sectionTitle ?? undefined,
      });
      setEntries((current) => current.map((row) => (row.id === updated.id ? updated : row)));
      toast.success('Entry saved');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save entry';
      toast.error(message);
    } finally {
      setSavingEntryId(null);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await api.scraper.deleteEntry(entryId);
      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      toast.success('Entry deleted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete entry';
      toast.error(message);
    }
  };

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const created = await api.scraper.createEntry({
        jobId: selectedJobId || undefined,
        sourceUrl: manualForm.sourceUrl.trim() || undefined,
        targetUrl: manualForm.targetUrl.trim() || undefined,
        sourceLanguage: manualForm.sourceLanguage,
        targetLanguage: manualForm.targetLanguage,
        sourceTitle: manualForm.sourceTitle.trim() || undefined,
        targetTitle: manualForm.targetTitle.trim() || undefined,
        sourceText: manualForm.sourceText.trim(),
        targetText: manualForm.targetText.trim() || undefined,
        notes: manualForm.notes.trim() || undefined,
        sectionTitle: manualForm.sectionTitle.trim() || undefined,
        entryStatus: manualForm.targetText.trim() ? 'translated' : 'pending',
      });
      toast.success('Manual entry created');
      setEntries((current) => [created, ...current]);
      setActiveTab('dataset');
      setManualForm(emptyManualForm);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create entry';
      toast.error(message);
    }
  };

  const handleExport = async () => {
    try {
      const content = await api.scraper.exportDataset(selectedJobId || undefined, exportFormat);
      const blob = new Blob([content], {
        type: exportFormat === 'csv' ? 'text/csv;charset=utf-8' : exportFormat === 'jsonl' ? 'application/x-ndjson;charset=utf-8' : 'application/json;charset=utf-8',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `arorano-dataset.${exportFormat}`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Export generated');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to export dataset';
      toast.error(message);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        <main className="relative min-h-screen px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6">
            <section className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
              <Card className="overflow-hidden border-0 bg-slate-950 text-white shadow-2xl">
                <CardContent className="relative space-y-5 p-6 sm:p-8 md:p-10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(59,130,246,0.32),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.28),_transparent_32%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(8,47,73,0.92))]" />
                  <div className="relative">
                    <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">Malagasy dataset builder</span>
                      <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">No extra dependencies</span>
                    </div>

                    <div className="mt-5 max-w-3xl space-y-3">
                      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">Web scraping workspace.</h1>
                      <p className="max-w-2xl text-sm leading-6 text-slate-200/85 sm:text-base">
                        Create bilingual scraping jobs, review extracted paragraphs, edit translations inline, and export JSONL for training.
                      </p>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Jobs</p>
                        <p className="mt-2 text-3xl font-semibold">{jobs.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Running</p>
                        <p className="mt-2 text-3xl font-semibold text-cyan-300">{runningJobs}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Entries</p>
                        <p className="mt-2 text-3xl font-semibold text-emerald-300">{entries.length}</p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-300">Translated</p>
                        <p className="mt-2 text-3xl font-semibold text-violet-300">{translatedEntries}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <FiActivity className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Selected job</p>
                        <h2 className="text-lg font-semibold text-slate-900">{selectedJob?.mode ?? 'None selected'}</h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-500">Status</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900 capitalize">{selectedJob?.status ?? 'idle'}</p>
                      </div>
                      <div className="rounded-2xl bg-slate-100 p-4">
                        <p className="text-xs font-medium text-slate-500">Progress</p>
                        <p className="mt-2 text-lg font-semibold text-slate-900">{selectedJob ? `${selectedJob.processedEntries}/${selectedJob.totalEntries}` : '0/0'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                  <CardContent className="space-y-3 p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Export</p>
                        <h2 className="mt-1 text-lg font-semibold text-slate-900">Download dataset</h2>
                      </div>
                      <FiDownload className="h-5 w-5 text-cyan-500" />
                    </div>
                    <div className="flex gap-2">
                      {(['json', 'csv', 'jsonl'] as const).map((format) => (
                        <button
                          key={format}
                          type="button"
                          onClick={() => setExportFormat(format)}
                          className={`rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${exportFormat === format ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                        >
                          {format.toUpperCase()}
                        </button>
                      ))}
                    </div>
                    <Button onClick={handleExport} className="h-11 w-full rounded-2xl gap-2">
                      <FiDownload className="h-4 w-4" /> Export selected data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="flex flex-wrap items-center gap-2 rounded-3xl border border-white/10 bg-white/80 p-2 shadow-xl backdrop-blur-xl">
              {([
                ['jobs', 'Jobs'],
                ['dataset', 'Dataset'],
                ['manual', 'Manual entry'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${activeTab === key ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
                >
                  {label}
                </button>
              ))}
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={refreshAll} className="gap-2">
                  <FiRefreshCw className={loading ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} /> Refresh
                </Button>
              </div>
            </section>

            {activeTab === 'jobs' && (
              <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
                <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl text-slate-900">Create job</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <form className="space-y-4" onSubmit={handleCreateJob}>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Source URL</label>
                        <Input value={jobForm.sourceUrl} onChange={(event) => setJobForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="https://en.wikipedia.org/wiki/Water" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Target URL</label>
                        <Input value={jobForm.targetUrl} onChange={(event) => setJobForm((current) => ({ ...current, targetUrl: event.target.value }))} placeholder="https://mg.wikipedia.org/wiki/Rano" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Mode</label>
                          <select className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none" value={jobForm.mode} onChange={(event) => setJobForm((current) => ({ ...current, mode: event.target.value as CreateScrapingJobInput['mode'] }))}>
                            <option value="wikipedia-bilingual">Wikipedia bilingual</option>
                            <option value="url-pair">URL pair</option>
                            <option value="single-url">Single URL</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Title</label>
                          <Input value={jobForm.title} onChange={(event) => setJobForm((current) => ({ ...current, title: event.target.value }))} placeholder="Water article scrape" />
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Source language</label>
                          <Input value={jobForm.sourceLanguage} onChange={(event) => setJobForm((current) => ({ ...current, sourceLanguage: event.target.value }))} placeholder="en" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-700">Target language</label>
                          <Input value={jobForm.targetLanguage} onChange={(event) => setJobForm((current) => ({ ...current, targetLanguage: event.target.value }))} placeholder="mg" />
                        </div>
                      </div>
                      <Button type="submit" className="h-11 w-full rounded-2xl gap-2">
                        <FiPlus className="h-4 w-4" /> Create and run
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-xl text-slate-900">Scraping jobs</CardTitle>
                      <Badge variant="secondary">{completedJobs} completed</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 p-5 sm:p-6">
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((index) => (
                          <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                        ))}
                      </div>
                    ) : jobs.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
                        No jobs yet. Create one from the form on the left.
                      </div>
                    ) : (
                      jobs.map((job) => {
                        const progress = job.totalEntries > 0 ? Math.round((job.processedEntries / job.totalEntries) * 100) : 0;

                        return (
                          <button
                            key={job.id}
                            type="button"
                            onClick={() => setSelectedJobId(job.id)}
                            className={`w-full rounded-3xl border p-4 text-left transition-colors ${selectedJobId === job.id ? 'border-cyan-300 bg-cyan-50/80' : 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80'}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="truncate text-sm font-semibold text-slate-900">{job.metadata && typeof job.metadata === 'object' && 'title' in job.metadata ? String(job.metadata.title) : job.sourceUrl}</h3>
                                  <Badge variant={badgeVariant(job.status)}>{job.status}</Badge>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">{job.mode}</p>
                              </div>
                              <Button type="button" variant="outline" size="sm" onClick={(event) => { event.stopPropagation(); void handleRunJob(job.id); }} className="gap-2">
                                <FiPlay className="h-3.5 w-3.5" /> Run
                              </Button>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                            <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                              <span>Processed: {job.processedEntries}</span>
                              <span>Updated: {formatTimestamp(job.updatedAt)}</span>
                              <span className="truncate">Source: {job.sourceUrl}</span>
                              <span className="truncate">Target: {job.targetUrl ?? 'auto-detect'}</span>
                            </div>
                            {job.errorMessage && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-xs text-red-700">{job.errorMessage}</p>}
                          </button>
                        );
                      })
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            {activeTab === 'dataset' && (
              <section className="grid gap-4">
                <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Dataset viewer</p>
                        <CardTitle className="mt-1 text-xl text-slate-900">Inline translation editing</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <select className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none" value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)}>
                          <option value="">All jobs</option>
                          {jobs.map((job) => (
                            <option key={job.id} value={job.id}>
                              {job.mode} - {job.status}
                            </option>
                          ))}
                        </select>
                        <Badge variant="secondary">{pendingEntries} pending</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {entries.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">No entries available for the selected job.</div>
                    ) : (
                      <div className="space-y-4 p-4 sm:p-6">
                        {entries.map((entry) => (
                          <div key={entry.id} className="rounded-3xl border border-slate-200 bg-slate-50/90 p-4 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <FiFileText className="h-4 w-4 text-cyan-500" />
                                <Badge variant={badgeVariant(entry.entryStatus)}>{entry.entryStatus}</Badge>
                                <span className="text-xs text-slate-500">{entry.sectionTitle ?? 'No section'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => handleSaveEntry(entry)} disabled={savingEntryId === entry.id} className="gap-2">
                                  <FiSave className="h-4 w-4" /> Save
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => handleDeleteEntry(entry.id)} className="gap-2 text-red-600 hover:text-red-700">
                                  <FiTrash2 className="h-4 w-4" /> Delete
                                </Button>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                              <div className="space-y-3 rounded-2xl bg-white p-4">
                                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                                  <span>Source</span>
                                  {entry.sourceUrl && (
                                    <a className="inline-flex items-center gap-1 text-cyan-600 hover:underline" href={entry.sourceUrl} target="_blank" rel="noreferrer">
                                      Open <FiExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                                <p className="text-sm leading-6 text-slate-800">{entry.sourceText}</p>
                              </div>

                              <div className="space-y-3 rounded-2xl bg-white p-4">
                                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                                  <span>Target translation</span>
                                  <span className="text-slate-400">{entry.targetLanguage}</span>
                                </div>
                                <textarea
                                  value={entry.targetText ?? ''}
                                  onChange={(event) => setEntries((current) => current.map((row) => (row.id === entry.id ? { ...row, targetText: event.target.value } : row)))}
                                  placeholder="Enter or refine the Malagasy translation"
                                  className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none transition-shadow focus:ring-2 focus:ring-cyan-200"
                                />
                                <div className="grid gap-3 sm:grid-cols-2">
                                  <select
                                    value={entry.entryStatus}
                                    onChange={(event) => setEntries((current) => current.map((row) => (row.id === entry.id ? { ...row, entryStatus: event.target.value } : row)))}
                                    className="h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm outline-none"
                                  >
                                    <option value="pending">pending</option>
                                    <option value="translated">translated</option>
                                    <option value="reviewed">reviewed</option>
                                    <option value="rejected">rejected</option>
                                  </select>
                                  <Input
                                    value={entry.notes ?? ''}
                                    onChange={(event) => setEntries((current) => current.map((row) => (row.id === entry.id ? { ...row, notes: event.target.value } : row)))}
                                    placeholder="Notes"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>
            )}

            {activeTab === 'manual' && (
              <section className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-xl">
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-xl text-slate-900">Add manual entry</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <form className="space-y-4" onSubmit={handleManualSubmit}>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input value={manualForm.sourceUrl} onChange={(event) => setManualForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="Source URL" />
                        <Input value={manualForm.targetUrl} onChange={(event) => setManualForm((current) => ({ ...current, targetUrl: event.target.value }))} placeholder="Target URL" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input value={manualForm.sourceTitle} onChange={(event) => setManualForm((current) => ({ ...current, sourceTitle: event.target.value }))} placeholder="Source title" />
                        <Input value={manualForm.targetTitle} onChange={(event) => setManualForm((current) => ({ ...current, targetTitle: event.target.value }))} placeholder="Target title" />
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <Input value={manualForm.sourceLanguage} onChange={(event) => setManualForm((current) => ({ ...current, sourceLanguage: event.target.value }))} placeholder="Source language" />
                        <Input value={manualForm.targetLanguage} onChange={(event) => setManualForm((current) => ({ ...current, targetLanguage: event.target.value }))} placeholder="Target language" />
                      </div>
                      <Input value={manualForm.sectionTitle} onChange={(event) => setManualForm((current) => ({ ...current, sectionTitle: event.target.value }))} placeholder="Section title" />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Source text</label>
                        <textarea value={manualForm.sourceText} onChange={(event) => setManualForm((current) => ({ ...current, sourceText: event.target.value }))} className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200" placeholder="Original paragraph" required />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-700">Target text</label>
                        <textarea value={manualForm.targetText} onChange={(event) => setManualForm((current) => ({ ...current, targetText: event.target.value }))} className="min-h-32 w-full rounded-2xl border border-slate-200 bg-white p-3 text-sm outline-none focus:ring-2 focus:ring-cyan-200" placeholder="Malagasy translation" />
                      </div>
                      <Input value={manualForm.notes} onChange={(event) => setManualForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes" />
                      <Button type="submit" className="h-11 w-full rounded-2xl gap-2">
                        <FiPlus className="h-4 w-4" /> Save manual entry
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-0 bg-white/85 shadow-xl backdrop-blur-xl">
                  <CardContent className="space-y-4 p-5 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-white">
                        <FiFileText className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Selected job</p>
                        <h2 className="text-lg font-semibold text-slate-900">{selectedJob?.mode ?? 'All jobs'}</h2>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-600">
                      Manual entries are useful when you scrape a page now and translate it later. Choose a job first if you want the entry linked to a run.
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </div>
        </main>
      </Layout>
    </ProtectedRoute>
  );
}