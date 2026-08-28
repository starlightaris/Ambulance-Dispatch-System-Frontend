import React, { useEffect, useState } from 'react';
import { runSchedule, compareSchedule, fetchScheduleDefaults, fetchRoster } from '../../api/scheduling.api.js';
import FitnessScorecard from './FitnessScorecard.jsx';
import ConvergenceChart from './ConvergenceChart.jsx';
import EmptyState from '../common/EmptyState.jsx';
import { mondayFromWeekValue, currentWeekValue } from './dateUtils.js';

const GA_FIELDS = [
  ['populationSize', 'Population Size'], ['maxGenerations', 'Max Generations'],
  ['crossoverRate', 'Crossover Rate'], ['mutationRate', 'Mutation Rate'],
  ['elitismCount', 'Elitism Count'], ['tournamentSize', 'Tournament Size'],
  ['convergenceThreshold', 'Convergence Threshold'], ['convergenceWindow', 'Convergence Window'],
];
const FITNESS_FIELDS = [
  ['understaffedPenalty', 'Understaffed Penalty'], ['overtimePenaltyPerHour', 'Overtime Penalty/hr'],
  ['restViolationPenalty', 'Rest Violation Penalty'], ['fairnessWeight', 'Fairness Weight'],
  ['minRestHours', 'Min Rest Hours'],
];
const emptyOverride = (fields) => Object.fromEntries(fields.map(([f]) => [f, '']));

function cleanOverride(override) {
  const result = {};
  for (const [key, value] of Object.entries(override)) {
    if (value !== '') result[key] = parseFloat(value);
  }
  return Object.keys(result).length > 0 ? result : null;
}

export default function RunCompareTab() {
  const [weekValue, setWeekValue] = useState(currentWeekValue());
  const [mode, setMode] = useState('run');
  const [algorithm, setAlgorithm] = useState('GENETIC_ALGORITHM');
  const [persist, setPersist] = useState(true);
  const [randomSeed, setRandomSeed] = useState('');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [gaOverride, setGaOverride] = useState(emptyOverride(GA_FIELDS));
  const [fitnessOverride, setFitnessOverride] = useState(emptyOverride(FITNESS_FIELDS));
  const [defaults, setDefaults] = useState(null);
  const [existingRosterCount, setExistingRosterCount] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  useEffect(() => {
    fetchScheduleDefaults().then(setDefaults).catch((err) => console.error(err));
  }, []);

  const weekStarting = weekValue ? mondayFromWeekValue(weekValue) : null;

  useEffect(() => {
    if (!weekStarting) return;
    fetchRoster(weekStarting)
      .then((shifts) => setExistingRosterCount(shifts.length))
      .catch((err) => { console.error(err); setExistingRosterCount(null); });
  }, [weekStarting]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (mode === 'run' && persist && existingRosterCount > 0) {
      const ok = window.confirm(
        `This will overwrite the existing schedule for this week (${existingRosterCount} shifts currently assigned). Continue?`
      );
      if (!ok) return;
    }

    setRunning(true);
    setError(null);
    try {
      const request = {
        weekStarting,
        algorithm: mode === 'run' ? algorithm : undefined,
        randomSeed: randomSeed === '' ? undefined : parseInt(randomSeed, 10),
        gaParameters: cleanOverride(gaOverride),
        fitnessWeights: cleanOverride(fitnessOverride),
        persist: mode === 'run' ? persist : false,
      };
      const response = mode === 'run' ? await runSchedule(request) : await compareSchedule(request);
      setResult(response);
      if (mode === 'run' && persist) {
        setExistingRosterCount((await fetchRoster(weekStarting)).length);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Scheduling run failed.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="run-compare-tab">
      <form className="entity-form" onSubmit={handleSubmit}>
        <fieldset disabled={running} className="fieldset-plain">
          <div className="form-row">
            <label>
              Week
              <input type="week" required value={weekValue} onChange={(e) => setWeekValue(e.target.value)} />
            </label>

            <div className="mode-toggle">
              <button type="button" className={`mode-btn${mode === 'run' ? ' active' : ''}`} onClick={() => setMode('run')}>Run</button>
              <button type="button" className={`mode-btn${mode === 'compare' ? ' active' : ''}`} onClick={() => setMode('compare')}>Compare</button>
            </div>

            {mode === 'run' && (
              <label>
                Algorithm
                <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
                  <option value="GENETIC_ALGORITHM">Genetic Algorithm</option>
                  <option value="GREEDY">Greedy</option>
                </select>
              </label>
            )}

            {mode === 'run' && (
              <label className="checkbox-item">
                <input type="checkbox" checked={persist} onChange={(e) => setPersist(e.target.checked)} />
                Save this roster
              </label>
            )}
          </div>

          {weekStarting && existingRosterCount !== null && (
            <EmptyState>
              {existingRosterCount > 0
                ? `Existing roster for this week: ${existingRosterCount} shifts assigned.`
                : 'No roster saved for this week yet.'}
            </EmptyState>
          )}

          <button type="button" className="btn-link" onClick={() => setAdvancedOpen((o) => !o)}>
            {advancedOpen ? 'Hide' : 'Show'} advanced parameters
          </button>

          {advancedOpen && (
            <div className="advanced-panel">
              <div className="advanced-panel-section">
                <span className="form-label">GA Parameters (blank = default)</span>
                <div className="form-row">
                  {GA_FIELDS.map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input type="number" step="any"
                        placeholder={defaults ? String(defaults.gaParameters[field]) : ''}
                        value={gaOverride[field]}
                        onChange={(e) => setGaOverride((o) => ({ ...o, [field]: e.target.value }))} />
                    </label>
                  ))}
                </div>
              </div>

              <div className="advanced-panel-section">
                <span className="form-label">Fitness Weights (blank = default)</span>
                <div className="form-row">
                  {FITNESS_FIELDS.map(([field, label]) => (
                    <label key={field}>
                      {label}
                      <input type="number" step="any"
                        placeholder={defaults ? String(defaults.fitnessWeights[field]) : ''}
                        value={fitnessOverride[field]}
                        onChange={(e) => setFitnessOverride((o) => ({ ...o, [field]: e.target.value }))} />
                    </label>
                  ))}
                </div>
              </div>

              <label>
                Random Seed (optional, for reproducible runs)
                <input type="number" value={randomSeed} onChange={(e) => setRandomSeed(e.target.value)} />
              </label>
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={!weekStarting}>
              {running ? 'Running…' : mode === 'run' ? 'Run Schedule' : 'Compare Algorithms'}
            </button>
          </div>
        </fieldset>
      </form>

      {result && mode === 'run' && (
        <div className="run-results">
          <FitnessScorecard
            result={result.fitnessResult}
            algorithmName={result.algorithmName}
            executionTimeMillis={result.executionTimeMillis}
            generationsRun={result.generationsRun}
          />
          <ConvergenceChart series={[{ name: result.algorithmName, color: '#4f46e5', data: result.bestFitnessHistory }]} />
        </div>
      )}

      {result && mode === 'compare' && (
        <div className="compare-results">
          <div className="compare-scorecards">
            <FitnessScorecard
              result={result.geneticAlgorithm.fitnessResult}
              algorithmName={result.geneticAlgorithm.algorithmName}
              executionTimeMillis={result.geneticAlgorithm.executionTimeMillis}
              generationsRun={result.geneticAlgorithm.generationsRun}
            />
            <FitnessScorecard
              result={result.greedy.fitnessResult}
              algorithmName={result.greedy.algorithmName}
              executionTimeMillis={result.greedy.executionTimeMillis}
              generationsRun={result.greedy.generationsRun}
            />
          </div>
          <ConvergenceChart series={[
            { name: result.geneticAlgorithm.algorithmName, color: '#4f46e5', data: result.geneticAlgorithm.bestFitnessHistory },
            { name: result.greedy.algorithmName, color: '#d97706', data: result.greedy.bestFitnessHistory },
          ]} />
        </div>
      )}
    </div>
  );
}