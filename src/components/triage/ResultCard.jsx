import { categoryDetails } from '../categoryDetails.js';

export default function ResultCard({ result }) {
  if (!result) {
    return (
      <section className="resultCard resultEmpty" aria-live="polite">
        <span className="resultPulse" aria-hidden="true" />
        <div>
          <p>Decision engine ready</p>
          <span>Submit an assessment to calculate its MTS category and queue position.</span>
        </div>
      </section>
    );
  }

  const details = categoryDetails[result.category];

  return (
    <section
      className="resultCard"
      aria-live="polite"
      style={{ '--categoryColor': details?.color ?? '#55a8ff' }}
    >
      <div className="resultCategory">
        <span className="resultLabel">Latest decision</span>
        <strong>{result.category}</strong>
        <span>{details?.label}</span>
      </div>
      <div className="resultMetric">
        <span>Queue position</span>
        <strong>#{result.queuePosition}</strong>
      </div>
      <div className="resultMetric">
        <span>Priority score</span>
        <strong>{result.score.toFixed(1)}</strong>
      </div>
      <div className="resultMetric">
        <span>Target response</span>
        <strong>{details?.responseTime}</strong>
      </div>
    </section>
  );
}
