import { useCallback, useEffect, useState } from 'react';
import { evaluateTriage, fetchActiveQueue, resolveAssessment } from '../api/triage.api.js';
import TriageForm from '../components/triage/TriageForm.jsx';
import TriageQueue from '../components/triage/TriageQueue.jsx';
import TriageResult from '../components/triage/TriageResult.jsx';
import '../styles/triage.css';

export default function TriagePage() {
  const [activeQueue, setActiveQueue] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  // showLoader doubles as "this call is user-visible" (initial mount, the
  // Retry button, the Refresh now button all pass the default true) vs. the
  // silent 15s background poll and the post-evaluate/post-resolve refresh
  // (both pass false). Only a user-visible call clears errorMessage on
  // success — otherwise a background poll succeeding a few seconds after an
  // unrelated evaluate/resolve failure would silently wipe that error off
  // the screen before the user ever saw it.
  const loadQueue = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) setIsLoading(true);
    try {
      setActiveQueue(await fetchActiveQueue());
      setIsConnected(true);
      if (showLoader) setErrorMessage('');
      setLastUpdated(new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
    } catch (error) {
      setIsConnected(false);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
    const refreshInterval = window.setInterval(() => loadQueue({ showLoader: false }), 15000);
    return () => window.clearInterval(refreshInterval);
  }, [loadQueue]);

  async function handleEvaluate(assessment) {
    setIsSubmitting(true);
    setErrorMessage('');
    try {
      setLatestResult(await evaluateTriage(assessment));
      setLatestAssessment(assessment);
      await loadQueue({ showLoader: false });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResolve(assessment) {
    if (!window.confirm(`Mark queue position #${assessment.queuePosition} as resolved?`)) return;
    setResolvingId(assessment.id);
    setErrorMessage('');
    try {
      await resolveAssessment(assessment.id);
      await loadQueue({ showLoader: false });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <main className="triage-page">
      <header className="triage-header">
        <div><span>TASK 04 · AMBULANCE DISPATCH</span><h1>Triage command</h1></div>
        <p className={isConnected ? 'triage-online' : ''}>● {isConnected ? 'Decision engine online' : 'Backend unavailable'}</p>
      </header>
      {errorMessage && <div className="triage-error" role="alert"><span>{errorMessage}</span><button type="button" onClick={() => loadQueue()}>Retry</button><button type="button" aria-label="Dismiss" onClick={() => setErrorMessage('')}>×</button></div>}
      <div className="triage-dashboard">
        <section><TriageForm isSubmitting={isSubmitting} onSubmit={handleEvaluate} /><TriageResult result={latestResult} assessment={latestAssessment} /></section>
        <TriageQueue activeQueue={activeQueue} isLoading={isLoading} isConnected={isConnected} resolvingId={resolvingId} lastUpdated={lastUpdated} onRefresh={() => loadQueue()} onResolve={handleResolve} />
      </div>
    </main>
  );
}
