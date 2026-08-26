import { useCallback, useEffect, useState } from 'react';
import QueuePanel from './components/queuePanel.jsx';
import ResultCard from './components/resultCard.jsx';
import TriageForm from './components/triageForm.jsx';
import { evaluateTriage, fetchActiveQueue, resolveAssessment } from './triageApi.js';

export default function App() {
  const [activeQueue, setActiveQueue] = useState([]);
  const [latestResult, setLatestResult] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resolvingId, setResolvingId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadQueue = useCallback(async ({ showLoader = true } = {}) => {
    if (showLoader) {
      setIsLoading(true);
    }

    try {
      const queueData = await fetchActiveQueue();
      setActiveQueue(queueData);
      setIsConnected(true);
      setErrorMessage('');
      setLastUpdated(
        new Intl.DateTimeFormat('en', {
          hour: '2-digit',
          minute: '2-digit'
        }).format(new Date())
      );
    } catch (error) {
      setIsConnected(false);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();

    const refreshInterval = window.setInterval(() => {
      loadQueue({ showLoader: false });
    }, 15000);

    return () => window.clearInterval(refreshInterval);
  }, [loadQueue]);

  async function handleEvaluate(assessmentData) {
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const result = await evaluateTriage(assessmentData);
      setLatestResult(result);
      await loadQueue({ showLoader: false });
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResolve(assessment) {
    const shouldResolve = window.confirm(
      `Mark queue position #${assessment.queuePosition} as resolved?`
    );

    if (!shouldResolve) {
      return;
    }

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
    <main className="appShell">
      <header className="topBar">
        <div className="brandBlock">
          <span className="brandMark" aria-hidden="true">+</span>
          <div>
            <span className="eyebrow">Ambulance dispatch system · Task 04</span>
            <h1>Triage command</h1>
          </div>
        </div>
        <div className="connectionStatus">
          <span className={isConnected ? 'statusDot isOnline' : 'statusDot'} />
          <div>
            <strong>{isConnected ? 'Decision engine online' : 'Backend unavailable'}</strong>
            <span>Manchester triage priority service</span>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div className="errorBanner" role="alert">
          <span aria-hidden="true">!</span>
          <p>{errorMessage}</p>
          <button className="retryButton" type="button" onClick={() => loadQueue()}>
            Retry connection
          </button>
          <button type="button" onClick={() => setErrorMessage('')} aria-label="Dismiss error">
            ×
          </button>
        </div>
      )}

      <div className="dashboardGrid">
        <section className="assessmentPanel">
          <TriageForm isSubmitting={isSubmitting} onSubmit={handleEvaluate} />
          <ResultCard result={latestResult} />
        </section>

        <QueuePanel
          activeQueue={activeQueue}
          isLoading={isLoading}
          resolvingId={resolvingId}
          lastUpdated={lastUpdated}
          isConnected={isConnected}
          onRefresh={() => loadQueue()}
          onResolve={handleResolve}
        />
      </div>
    </main>
  );
}
