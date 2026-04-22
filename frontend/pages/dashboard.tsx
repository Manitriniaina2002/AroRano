'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'sonner';
import { Layout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { translations } from '@/lib/i18n';
import { api, ESP32Reading, ESP32Stats } from '@/lib/api';
import { websocket } from '@/lib/websocket';
import {
  FiAlertCircle,
  FiActivity,
  FiCheckCircle,
  FiCloud,
  FiDroplet,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiTool,
  FiThermometer,
  FiTrendingUp,
  FiUsers,
  FiWind,
  FiZap,
} from 'react-icons/fi';

export const dynamic = 'force-dynamic';

interface DeviceSnapshot {
  deviceId: string;
  latest: ESP32Reading | null;
  stats: ESP32Stats | null;
}

interface DeviceCommandSnapshot {
  id: string;
  deviceId: string;
  commandType: string;
  status: string;
  parameters: Record<string, any> | null;
  notes: string | null;
  acknowledgedAt: string | null;
  executedAt: string | null;
  errorMessage: string | null;
  requestedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

function formatTime(value?: string | Date | null) {
  if (!value) return 'n/a';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? 'n/a' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(value?: string | Date | null) {
  if (!value) return 'n/a';
  const date = typeof value === 'string' ? new Date(value) : value;
  return Number.isNaN(date.getTime()) ? 'n/a' : date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function alertTone(alert?: string | null) {
  const normalized = alert?.toUpperCase() ?? 'NO_DATA';

  if (normalized === 'CRITICAL') return 'bg-red-50 border-red-200 text-red-700';
  if (normalized === 'WARNING') return 'bg-amber-50 border-amber-200 text-amber-700';
  if (normalized === 'NORMAL') return 'bg-emerald-50 border-emerald-200 text-emerald-700';
  return 'bg-slate-50 border-slate-200 text-slate-700';
}

function alertBadgeVariant(alert?: string | null): 'success' | 'warning' | 'destructive' | 'default' {
  const normalized = alert?.toUpperCase() ?? 'NO_DATA';

  if (normalized === 'CRITICAL') return 'destructive';
  if (normalized === 'WARNING') return 'warning';
  if (normalized === 'NORMAL') return 'success';
  return 'default';
}

function clampPercent(value?: number | null) {
  return Math.min(Math.max(value ?? 0, 0), 100);
}

function reservoirState(percent: number) {
  if (percent >= 80) return { levelKey: 'optimal', tone: 'text-emerald-700', chip: 'bg-emerald-100 text-emerald-800' };
  if (percent >= 40) return { levelKey: 'normal', tone: 'text-cyan-700', chip: 'bg-cyan-100 text-cyan-800' };
  return { levelKey: 'low', tone: 'text-amber-700', chip: 'bg-amber-100 text-amber-800' };
}

function commandStatusLabel(status: string, t: any) {
  const normalized = status.toLowerCase();
  if (normalized === 'pending') return t.dashboard.commandPending;
  if (normalized === 'acknowledged') return t.dashboard.commandAcknowledged;
  if (normalized === 'executed') return t.dashboard.commandExecuted;
  if (normalized === 'failed') return t.dashboard.commandFailedStatus;
  return status;
}

function commandBadgeVariant(status: string): 'success' | 'warning' | 'destructive' | 'default' {
  const normalized = status.toLowerCase();
  if (normalized === 'executed') return 'success';
  if (normalized === 'acknowledged' || normalized === 'pending') return 'warning';
  if (normalized === 'failed') return 'destructive';
  return 'default';
}

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  const stateLabels: Record<string, string> = {
    optimal: t.dashboard.reservoirOptimal,
    normal: t.dashboard.reservoirNormal,
    low: t.dashboard.reservoirLow,
  };

  const [deviceIds, setDeviceIds] = useState<string[]>([]);
  const [snapshots, setSnapshots] = useState<DeviceSnapshot[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [selectedLatest, setSelectedLatest] = useState<ESP32Reading | null>(null);
  const [selectedStats, setSelectedStats] = useState<ESP32Stats | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<ESP32Reading[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<DeviceCommandSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sendingFillCommand, setSendingFillCommand] = useState(false);
  const [sendingStartCommand, setSendingStartCommand] = useState(false);
  const [sendingStopCommand, setSendingStopCommand] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSelectedDevice = async (deviceId: string, showSpinner = false) => {
    if (showSpinner) {
      setRefreshing(true);
    }

    try {
      const [latest, stats, history, latestCommand] = await Promise.all([
        api.esp32.getLatestReading(deviceId),
        api.esp32.getStats(deviceId).catch(() => null),
        api.esp32.getReadings(deviceId, 12, 0).catch(() => ({ data: [] as ESP32Reading[], total: 0 })),
        api.esp32.getLatestCommand(deviceId).catch(() => null),
      ]);

      setSelectedDeviceId(deviceId);
      setSelectedLatest(latest ?? null);
      setSelectedStats(stats);
      setSelectedHistory(history.data);
      setSelectedCommand(latestCommand ?? null);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : t.dashboard.unableToLoadDeviceData;
      setError(message);
      toast.error(message);
    } finally {
      if (showSpinner) {
        setRefreshing(false);
      }
    }
  };

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const { devices } = await api.esp32.getDevices();
      const nextDeviceIds = devices;
      setDeviceIds(nextDeviceIds);

      if (nextDeviceIds.length === 0) {
        setSnapshots([]);
        setSelectedDeviceId('');
        setSelectedLatest(null);
        setSelectedStats(null);
        setSelectedHistory([]);
        setSelectedCommand(null);
        return;
      }

      const nextSnapshots = await Promise.all(
        nextDeviceIds.map(async (deviceId) => {
          const [latest, stats] = await Promise.all([
            api.esp32.getLatestReading(deviceId),
            api.esp32.getStats(deviceId).catch(() => null),
          ]);

          return {
            deviceId,
            latest,
            stats,
          };
        }),
      );

      setSnapshots(nextSnapshots);

      const preferredDevice = nextDeviceIds.includes(selectedDeviceId) ? selectedDeviceId : nextDeviceIds[0];
      await loadSelectedDevice(preferredDevice);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : t.dashboard.unableToLoadMonitoringData;
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    websocket.connect().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!selectedDeviceId) return;

    websocket.subscribeToDevice(selectedDeviceId);

    const handleSensorReading = (event: { deviceId: string }) => {
      if (event.deviceId === selectedDeviceId) {
        loadSelectedDevice(selectedDeviceId);
      }
    };

    const handleCommand = (event: { deviceId: string; command: DeviceCommandSnapshot }) => {
      if (event.deviceId === selectedDeviceId) {
        setSelectedCommand(event.command);
        toast.info(`${t.dashboard.latestCommand}: ${commandStatusLabel(event.command.status, t)}`);
      }
    };

    websocket.onSensorReading(handleSensorReading);
    websocket.onESP32Command(handleCommand);

    return () => {
      websocket.unsubscribeFromDevice(selectedDeviceId);
      websocket.off('sensorReading');
      websocket.off('esp32Command');
    };
  }, [selectedDeviceId]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (selectedDeviceId) {
        loadSelectedDevice(selectedDeviceId);
      }
    }, 30000);

    return () => window.clearInterval(interval);
  }, [selectedDeviceId]);

  const activeSnapshot = snapshots.find((snapshot) => snapshot.deviceId === selectedDeviceId) ?? null;
  const latestReading = selectedLatest ?? activeSnapshot?.latest ?? null;
  const latestPercent = latestReading?.waterLevelPercent ?? 0;
  const clampedLatestPercent = clampPercent(latestPercent);
  const levelState = reservoirState(clampedLatestPercent);
  const totalReadings = selectedStats?.totalReadings ?? selectedHistory.length;
  const connectedDevices = snapshots.filter((snapshot) => snapshot.latest).length;
  const criticalDevices = snapshots.filter((snapshot) => snapshot.latest?.alert?.toUpperCase() === 'CRITICAL').length;
  const warningDevices = snapshots.filter((snapshot) => snapshot.latest?.alert?.toUpperCase() === 'WARNING').length;
  const pumpStatus = latestReading?.pumpStatus ?? selectedStats?.latestPumpStatus ?? 'NO_DATA';

  const selectedDeviceCards = [
    {
      label: t.dashboard.waterLevelLabel,
      value: `${Math.round(latestPercent)}%`,
      icon: FiDroplet,
      tone: 'text-cyan-700',
      background: 'bg-cyan-50',
    },
    {
      label: t.dashboard.temperature,
      value: latestReading?.temperature != null ? `${latestReading.temperature.toFixed(1)} °C` : 'n/a',
      icon: FiThermometer,
      tone: 'text-orange-700',
      background: 'bg-orange-50',
    },
    {
      label: t.dashboard.humidity,
      value: latestReading?.humidity != null ? `${latestReading.humidity}%` : 'n/a',
      icon: FiWind,
      tone: 'text-teal-700',
      background: 'bg-teal-50',
    },
    {
      label: t.dashboard.metricReadings,
      value: `${totalReadings}`,
      icon: FiTrendingUp,
      tone: 'text-violet-700',
      background: 'bg-violet-50',
    },
  ];

  const handleFillReservoir = async () => {
    if (!selectedDeviceId) return;

    try {
      setSendingFillCommand(true);
      const command = await api.esp32.fillReservoir(selectedDeviceId, {
        durationSeconds: 60,
        notes: t.dashboard.fillReservoir,
        requestedBy: user?.email ?? undefined,
      });
      setSelectedCommand(command);
      toast.success(t.dashboard.commandSent);
      await loadSelectedDevice(selectedDeviceId, true);
    } catch (fillError) {
      const message = fillError instanceof Error ? fillError.message : t.dashboard.commandFailed;
      toast.error(message);
    } finally {
      setSendingFillCommand(false);
    }
  };

  const handleStartPump = async () => {
    if (!selectedDeviceId) return;

    try {
      setSendingStartCommand(true);
      const command = await api.esp32.startPump(selectedDeviceId, {
        notes: t.dashboard.startPump,
        requestedBy: user?.email ?? undefined,
      });
      setSelectedCommand(command);
      toast.success(t.dashboard.commandSentStart);
      await loadSelectedDevice(selectedDeviceId, true);
    } catch (startError) {
      const message = startError instanceof Error ? startError.message : t.dashboard.commandFailedStart;
      toast.error(message);
    } finally {
      setSendingStartCommand(false);
    }
  };

  const handleStopPump = async () => {
    if (!selectedDeviceId) return;

    try {
      setSendingStopCommand(true);
      const command = await api.esp32.stopPump(selectedDeviceId, {
        notes: t.dashboard.stopPump,
        requestedBy: user?.email ?? undefined,
      });
      setSelectedCommand(command);
      toast.success(t.dashboard.commandSentStop);
      await loadSelectedDevice(selectedDeviceId, true);
    } catch (stopError) {
      const message = stopError instanceof Error ? stopError.message : t.dashboard.commandFailedStop;
      toast.error(message);
    } finally {
      setSendingStopCommand(false);
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
      <main className="relative min-h-screen overflow-x-hidden px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="mx-auto max-w-7xl space-y-5 sm:space-y-6 md:space-y-8">
          <section className="grid gap-4 lg:grid-cols-[1.5fr_0.9fr]">
            <Card className="relative overflow-hidden border-0 bg-slate-950 text-white shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,211,238,0.35),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(59,130,246,0.25),_transparent_35%),linear-gradient(135deg,_rgba(15,23,42,0.98),_rgba(8,47,73,0.94))]" />
              <CardContent className="relative space-y-5 p-6 sm:p-8 md:p-10">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-cyan-200/80">
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{t.dashboard.iotControlRoom}</span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">{t.dashboard.liveTelemetry}</span>
                </div>

                <div className="space-y-3 max-w-3xl">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                    {t.dashboard.waterIntelligenceTitle}
                  </h1>
                  <p className="max-w-2xl text-sm leading-6 text-slate-200/85 sm:text-base">
                    {t.dashboard.waterIntelligenceSubtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success" className="bg-emerald-500/15 text-emerald-100 border-emerald-400/30">
                    <FiCheckCircle className="mr-1 h-3.5 w-3.5" />
                    {connectedDevices > 0 ? `${connectedDevices} ${t.common.connected.toLowerCase()}` : t.dashboard.noDevices}
                  </Badge>
                  <Badge variant={alertBadgeVariant(latestReading?.alert)} className="border-white/10 bg-white/10 text-white">
                    <FiAlertCircle className="mr-1 h-3.5 w-3.5" />
                    {latestReading?.alert ?? 'NO_DATA'}
                  </Badge>
                  <Badge variant="default" className="border-white/10 bg-white/10 text-white">
                    <FiMapPin className="mr-1 h-3.5 w-3.5" />
                    {selectedDeviceId || t.dashboard.noDeviceSelected}
                  </Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {selectedDeviceCards.map((card) => {
                    const Icon = card.icon;
                    return (
                      <div key={card.label} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.background}`}>
                            <Icon className={`h-5 w-5 ${card.tone}`} />
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-300">{card.label}</p>
                            <p className="mt-1 text-xl font-semibold text-white">{card.value}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                  <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">{t.dashboard.reservoirLevel}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${levelState.chip}`}>{stateLabels[levelState.levelKey]}</span>
                      </div>
                      <p className="mt-2 text-5xl font-semibold text-white">{Math.round(clampedLatestPercent)}%</p>
                      <div className="mt-3 text-sm text-slate-300">
                        <p>{selectedLatest?.waterLevelCm?.toFixed(1) ?? latestReading?.waterLevelCm?.toFixed(1) ?? 'n/a'} cm</p>
                        <p>{latestReading?.rainDetected ? t.dashboard.rainDetected : t.dashboard.dryConditions}</p>
                      </div>

                      <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/20">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 transition-all duration-500"
                          style={{ width: `${clampedLatestPercent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mx-auto sm:mx-0">
                      <div className="relative h-48 w-28 overflow-hidden rounded-t-[2.2rem] rounded-b-2xl border-4 border-white/30 bg-white/10 shadow-inner">
                        <div
                          className="absolute bottom-0 left-0 right-0 overflow-hidden bg-gradient-to-t from-cyan-400 via-cyan-400 to-blue-300 transition-all duration-700"
                          style={{ height: `${Math.max(clampedLatestPercent, 6)}%` }}
                        >
                          <div className="reservoir-wave reservoir-wave-1 absolute -left-4 right-[-20%] top-[-8px] h-5 bg-white/45" />
                          <div className="reservoir-wave reservoir-wave-2 absolute -left-6 right-[-18%] top-[-10px] h-6 bg-white/35" />
                        </div>
                        <div className="absolute inset-y-2 left-2 w-[2px] rounded bg-white/40" />
                      </div>
                      <p className={`mt-2 text-center text-xs font-semibold uppercase tracking-[0.14em] text-cyan-200`}>{t.dashboard.waterReservoir}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                <CardContent className="space-y-4 p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t.dashboard.systemHealth}</p>
                      <h2 className="mt-1 text-lg font-semibold text-slate-900">{t.dashboard.operationalSummary}</h2>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadSelectedDevice(selectedDeviceId, true)}
                      disabled={loading || refreshing || !selectedDeviceId}
                      className="gap-2"
                    >
                      <FiRefreshCw className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
                      {t.dashboard.refresh}
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-cyan-50 p-4">
                      <p className="text-xs font-medium text-cyan-700">{t.dashboard.deviceCountLabel}</p>
                      <p className="mt-2 text-2xl font-semibold text-cyan-950">{deviceIds.length}</p>
                    </div>
                    <div className="rounded-2xl bg-amber-50 p-4">
                      <p className="text-xs font-medium text-amber-700">{t.dashboard.warnings}</p>
                      <p className="mt-2 text-2xl font-semibold text-amber-950">{warningDevices}</p>
                    </div>
                    <div className="rounded-2xl bg-emerald-50 p-4">
                      <p className="text-xs font-medium text-emerald-700">{t.dashboard.healthy}</p>
                      <p className="mt-2 text-2xl font-semibold text-emerald-950">{Math.max(connectedDevices - criticalDevices - warningDevices, 0)}</p>
                    </div>
                    <div className="rounded-2xl bg-slate-100 p-4">
                      <p className="text-xs font-medium text-slate-600">Pump</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{pumpStatus}</p>
                    </div>
                  </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Button
                        onClick={handleStartPump}
                        disabled={!selectedDeviceId || loading || refreshing || sendingStartCommand || sendingStopCommand || sendingFillCommand}
                        className="h-11 rounded-2xl gap-2"
                      >
                        <FiZap className={sendingStartCommand ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
                        {sendingStartCommand ? t.dashboard.startingPump : t.dashboard.startPump}
                      </Button>
                      <Button
                        onClick={handleStopPump}
                        disabled={!selectedDeviceId || loading || refreshing || sendingStopCommand || sendingStartCommand || sendingFillCommand}
                        variant="destructive"
                        className="h-11 rounded-2xl gap-2"
                      >
                        <FiZap className={sendingStopCommand ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
                        {sendingStopCommand ? t.dashboard.stoppingPump : t.dashboard.stopPump}
                      </Button>
                      <Button
                        onClick={handleFillReservoir}
                        disabled={!selectedDeviceId || loading || refreshing || sendingFillCommand || sendingStartCommand || sendingStopCommand}
                        className="h-11 rounded-2xl gap-2"
                      >
                        <FiTool className={sendingFillCommand ? 'h-4 w-4 animate-pulse' : 'h-4 w-4'} />
                        {sendingFillCommand ? t.dashboard.fillingReservoir : t.dashboard.fillReservoir}
                      </Button>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">{t.dashboard.latestCommand}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={commandBadgeVariant(selectedCommand?.status ?? 'default')}>
                            {selectedCommand ? commandStatusLabel(selectedCommand.status, t) : t.dashboard.commandNoData}
                          </Badge>
                          {selectedCommand?.parameters?.durationSeconds ? (
                            <span className="text-xs text-slate-500">
                              {t.dashboard.commandDuration}: {selectedCommand.parameters.durationSeconds}s
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>

                  {user?.role === 'admin' && (
                    <button
                      onClick={() => router.push('/users')}
                      className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left transition-colors hover:border-slate-300 hover:bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <FiUsers className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{t.dashboard.userManagement}</p>
                          <p className="text-xs text-slate-500">{t.dashboard.manageOperatorsAccess}</p>
                        </div>
                      </div>
                      <FiShield className="h-5 w-5 text-slate-400" />
                    </button>
                  )}
                </CardContent>
              </Card>

              <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
                <CardContent className="p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t.dashboard.selectedDevice}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{selectedDeviceId || t.dashboard.noDeviceSelected}</h2>
                      <p className="mt-1 text-sm text-slate-600">{t.dashboard.updated} {formatTime(latestReading?.timestamp ?? selectedHistory[0]?.timestamp)}</p>
                    </div>
                    <FiDroplet className="h-9 w-9 text-cyan-500" />
                  </div>

                  <div className="mt-4 space-y-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">{t.dashboard.currentState}</p>
                      <p className="mt-2 text-2xl font-semibold text-slate-900">{pumpStatus}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-medium text-slate-500">{t.dashboard.latestCommand}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant={commandBadgeVariant(selectedCommand?.status ?? 'default')}>
                          {selectedCommand ? commandStatusLabel(selectedCommand.status, t) : t.dashboard.commandNoData}
                        </Badge>
                        {selectedCommand?.parameters?.durationSeconds ? (
                          <span className="text-xs text-slate-500">
                            {t.dashboard.commandDuration}: {selectedCommand.parameters.durationSeconds}s
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.1fr_1.4fr]">
            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Devices</p>
                    <CardTitle className="mt-1 text-xl text-slate-900">{t.dashboard.connectedTelemetrySources}</CardTitle>
                  </div>
                  <FiActivity className="h-5 w-5 text-cyan-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : snapshots.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-600">
                    {t.dashboard.noEsp32DataYet}
                  </div>
                ) : (
                  snapshots.map((snapshot) => {
                    const isSelected = snapshot.deviceId === selectedDeviceId;
                    const snapshotAlert = snapshot.latest?.alert?.toUpperCase() ?? 'NO_DATA';

                    return (
                      <button
                        key={snapshot.deviceId}
                        onClick={() => loadSelectedDevice(snapshot.deviceId, true)}
                        className={`w-full rounded-2xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-50 shadow-md'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">{snapshot.deviceId}</h3>
                              <Badge variant={alertBadgeVariant(snapshotAlert)}>{snapshotAlert}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">
                              {snapshot.latest ? `${t.dashboard.updated} ${formatTime(snapshot.latest.timestamp)}` : t.dashboard.waitingForData}
                            </p>
                          </div>
                          <div className="text-right text-xs text-slate-500">
                            <p>{snapshot.stats?.totalReadings ?? 0} readings</p>
                            <p>{snapshot.latest?.pumpStatus ?? 'n/a'}</p>
                          </div>
                        </div>

                        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-slate-600">
                          <div className="rounded-xl bg-slate-100 px-3 py-2">
                            <p className="font-medium text-slate-500">{t.dashboard.levelShort}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{snapshot.latest ? `${snapshot.latest.waterLevelPercent}%` : 'n/a'}</p>
                          </div>
                          <div className="rounded-xl bg-slate-100 px-3 py-2">
                            <p className="font-medium text-slate-500">{t.dashboard.tempShort}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{snapshot.latest ? `${snapshot.latest.temperature.toFixed(1)}°C` : 'n/a'}</p>
                          </div>
                          <div className="rounded-xl bg-slate-100 px-3 py-2">
                            <p className="font-medium text-slate-500">{t.dashboard.humidity}</p>
                            <p className="mt-1 text-sm font-semibold text-slate-900">{snapshot.latest ? `${snapshot.latest.humidity}%` : 'n/a'}</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t.dashboard.liveDetails}</p>
                    <CardTitle className="mt-1 text-xl text-slate-900">{selectedDeviceId || t.dashboard.noDeviceSelected}</CardTitle>
                  </div>
                  <Badge variant={alertBadgeVariant(latestReading?.alert)}>{latestReading?.alert ?? 'NO DATA'}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <FiAlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {!error && loading && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                    {t.dashboard.loadingTelemetry}
                  </div>
                )}

                {!error && !loading && (
                  <>
                    <div className={`rounded-3xl border p-4 ${alertTone(latestReading?.alert)}`}>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em]">{t.dashboard.currentState}</p>
                          <p className="mt-1 text-2xl font-semibold">{pumpStatus}</p>
                        </div>
                        <FiZap className="h-8 w-8" />
                      </div>
                      <p className="mt-3 text-sm">
                        {selectedStats?.latestAlert ?? latestReading?.alert ?? 'NO_DATA'} {t.dashboard.alertLabel}, {t.dashboard.lastUpdated} {formatDate(latestReading?.timestamp)} {t.dashboard.at} {formatTime(latestReading?.timestamp)}.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">{t.dashboard.averageWaterLevel}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedStats ? `${selectedStats.avgWaterLevelPercent}%` : 'n/a'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">{t.dashboard.averageTemperature}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedStats ? `${selectedStats.avgTemperature.toFixed(1)}°C` : 'n/a'}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">{t.dashboard.rainDetections}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedStats?.rainDetectedCount ?? 0}</p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-medium text-slate-500">{t.dashboard.latestPumpStatus}</p>
                        <p className="mt-2 text-2xl font-semibold text-slate-900">{selectedStats?.latestPumpStatus ?? 'n/a'}</p>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{t.dashboard.recentTrend}</p>
                          <p className="mt-1 text-sm text-slate-600">{t.dashboard.last12Readings}</p>
                        </div>
                        <FiCloud className="h-5 w-5 text-slate-400" />
                      </div>

                      {selectedHistory.length === 0 ? (
                        <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
                          {t.dashboard.noRecentReadings}
                        </div>
                      ) : (
                        <div className="mt-5 flex items-end gap-2 overflow-x-auto pb-2">
                          {selectedHistory.slice().reverse().map((reading) => (
                            <div key={reading.id} className="flex min-w-[42px] flex-1 flex-col items-center gap-2">
                              <div className="flex h-36 w-full items-end rounded-t-2xl bg-white px-2 pt-2 shadow-sm">
                                <div
                                  className="w-full rounded-t-xl bg-gradient-to-t from-cyan-500 to-blue-500 transition-all"
                                  style={{ height: `${Math.min(Math.max(reading.waterLevelPercent, 8), 100)}%` }}
                                />
                              </div>
                              <p className="text-[11px] text-slate-500">{formatTime(reading.timestamp)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      </Layout>
    </ProtectedRoute>
  );
}
