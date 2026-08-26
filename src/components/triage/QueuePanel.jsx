import { categoryDetails, categoryNames } from '../categoryDetails.js';

function formatTimestamp(timestamp) {
  if (!timestamp) {
    return 'Time unavailable';
  }

  return new Intl.DateTimeFormat('en', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(timestamp));
}

export default function QueuePanel({
  activeQueue,
  isLoading,
  isConnected,
  resolvingId,
  lastUpdated,
  onRefresh,
  onResolve
}) {
  const categoryCounts = categoryNames.reduce((counts, categoryName) => {
    counts[categoryName] = activeQueue.filter(
      (assessment) => assessment.category === categoryName
    ).length;
    return counts;
  }, {});

  return (
    <section className="queuePanel" aria-busy={isLoading}>
      <div className="queueHeader">
        <div>
          <span className="sectionIndex">02</span>
          <h2>Active dispatch queue</h2>
          <p>Highest clinical priority appears first.</p>
        </div>
        <div className="queueControls">
          <span className={isConnected ? 'liveBadge isLive' : 'liveBadge'}>
            <span aria-hidden="true" />
            {isConnected ? 'Live · 15s refresh' : 'Updates paused'}
          </span>
          <button className="refreshButton" type="button" onClick={onRefresh} disabled={isLoading}>
            <span className={isLoading ? 'refreshIcon isSpinning' : 'refreshIcon'}>↻</span>
            {isLoading ? 'Refreshing' : 'Refresh now'}
          </button>
        </div>
      </div>

      <div className="queueSummary">
        <div className="totalCard">
          <span>Waiting</span>
          <strong>{activeQueue.length}</strong>
          <small aria-live="polite">
            {lastUpdated ? `Updated ${lastUpdated}` : 'Awaiting connection'}
          </small>
        </div>
        <div className="categoryCounts">
          {categoryNames.map((categoryName) => (
            <div className="categoryCount" key={categoryName}>
              <span
                className="categoryDot"
                style={{ backgroundColor: categoryDetails[categoryName].color }}
              />
              <span>{categoryName}</span>
              <strong>{categoryCounts[categoryName]}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="queueList">
        {isLoading && activeQueue.length === 0 && (
          <div className="queueEmpty">
            <span className="loadingRing" aria-hidden="true" />
            <p>Loading active assessments…</p>
          </div>
        )}

        {!isLoading && activeQueue.length === 0 && (
          <div className="queueEmpty">
            <span className="emptyCheck" aria-hidden="true">✓</span>
            <p>No patients are currently waiting.</p>
            <small>New assessments will appear here automatically.</small>
          </div>
        )}

        {activeQueue.map((assessment) => {
          const details = categoryDetails[assessment.category];
          const isResolving = resolvingId === assessment.id;

          return (
            <article
              className="queueRow"
              key={assessment.id ?? `${assessment.timestamp}-${assessment.queuePosition}`}
              style={{ '--categoryColor': details?.color ?? '#55a8ff' }}
            >
              <div className="queuePosition">{String(assessment.queuePosition).padStart(2, '0')}</div>
              <div className="queueCategory">
                <strong>{assessment.category}</strong>
                <span>{details?.label}</span>
              </div>
              <div className="queueData queueScore">
                <span>Score</span>
                <strong>{assessment.score.toFixed(1)}</strong>
              </div>
              <div className="queueData queueTime">
                <span>Assessed</span>
                <strong>{formatTimestamp(assessment.timestamp)}</strong>
              </div>
              <button
                className="resolveButton"
                type="button"
                disabled={!assessment.id || isResolving}
                onClick={() => onResolve(assessment)}
              >
                {isResolving ? 'Resolving…' : 'Mark resolved'}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
