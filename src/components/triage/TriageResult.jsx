import { categoryDetails } from './categoryDetails.js';

export default function TriageResult({ result }) {
  if (!result) {
    return <section className="triage-result triage-result-empty"><strong>Decision engine ready</strong><span>Submit an assessment to calculate its MTS category and queue position.</span></section>;
  }

  const details = categoryDetails[result.category];
  return (
    <section className="triage-result" style={{ '--triage-category': details?.color ?? '#2563eb' }} aria-live="polite">
      <div><span>Latest decision</span><strong>{result.category}</strong><small>{details?.label}</small></div>
      <div><span>Queue position</span><strong>#{result.queuePosition}</strong></div>
      <div><span>Priority score</span><strong>{Number(result.score).toFixed(1)}</strong></div>
      <div><span>Target response</span><strong>{details?.responseTime}</strong></div>
    </section>
  );
}
