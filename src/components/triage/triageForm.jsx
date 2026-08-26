import { useState } from 'react';

const initialFormData = {
  breathing: true,
  pulseRate: 80,
  avpu: 'ALERT',
  oxygenSaturation: 98,
  systolicBP: 120,
  painScore: 2,
  temperature: 37,
  age: 30,
  hazardPresent: false,
  symptoms: ''
};

const numericFields = new Set([
  'pulseRate',
  'oxygenSaturation',
  'systolicBP',
  'painScore',
  'temperature',
  'age'
]);

function buildAssessmentData(formData) {
  return {
    breathing: formData.breathing,
    pulseRate: Number(formData.pulseRate),
    avpu: formData.avpu,
    oxygenSaturation: Number(formData.oxygenSaturation),
    systolicBP: Number(formData.systolicBP),
    painScore: Number(formData.painScore),
    temperature: Number(formData.temperature),
    age: Number(formData.age),
    hazardPresent: formData.hazardPresent,
    symptoms: formData.symptoms
      .split(',')
      .map((symptom) => symptom.trim())
      .filter(Boolean)
  };
}

function NumberField({ label, name, value, unit, min, max, step = 1, onChange }) {
  return (
    <label className="fieldGroup">
      <span className="fieldLabel">{label}</span>
      <span className="inputWithUnit">
        <input
          name={name}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={onChange}
          required
        />
        {unit && <span className="fieldUnit">{unit}</span>}
      </span>
    </label>
  );
}

export default function TriageForm({ isSubmitting, onSubmit }) {
  const [formData, setFormData] = useState(initialFormData);

  function handleChange(event) {
    const { checked, name, type, value } = event.target;
    const nextValue = type === 'checkbox' ? checked : value;

    setFormData((currentData) => ({
      ...currentData,
      [name]: numericFields.has(name) && nextValue === '' ? '' : nextValue
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(buildAssessmentData(formData));
  }

  return (
    <form className="triageForm" onSubmit={handleSubmit}>
      <div className="sectionHeading">
        <div>
          <span className="sectionIndex">01</span>
          <h2>Patient assessment</h2>
        </div>
        <span className="requiredNote">All clinical fields required</span>
      </div>

      <div className="toggleGrid">
        <label className={`toggleCard ${formData.breathing ? 'isPositive' : 'isCritical'}`}>
          <span>
            <strong>Breathing</strong>
            <small>{formData.breathing ? 'Spontaneous' : 'Not breathing'}</small>
          </span>
          <input
            name="breathing"
            type="checkbox"
            checked={formData.breathing}
            onChange={handleChange}
          />
          <span className="toggleSwitch" aria-hidden="true" />
        </label>

        <label className={`toggleCard ${formData.hazardPresent ? 'isCritical' : ''}`}>
          <span>
            <strong>Scene hazard</strong>
            <small>{formData.hazardPresent ? 'Hazard present' : 'Scene secure'}</small>
          </span>
          <input
            name="hazardPresent"
            type="checkbox"
            checked={formData.hazardPresent}
            onChange={handleChange}
          />
          <span className="toggleSwitch" aria-hidden="true" />
        </label>
      </div>

      <div className="fieldGrid">
        <NumberField
          label="Pulse rate"
          name="pulseRate"
          value={formData.pulseRate}
          unit="bpm"
          min="0"
          max="300"
          onChange={handleChange}
        />
        <NumberField
          label="Oxygen saturation"
          name="oxygenSaturation"
          value={formData.oxygenSaturation}
          unit="%"
          min="0"
          max="100"
          onChange={handleChange}
        />
        <NumberField
          label="Systolic pressure"
          name="systolicBP"
          value={formData.systolicBP}
          unit="mmHg"
          min="0"
          max="300"
          onChange={handleChange}
        />
        <NumberField
          label="Temperature"
          name="temperature"
          value={formData.temperature}
          unit="°C"
          min="20"
          max="45"
          step="0.1"
          onChange={handleChange}
        />
        <NumberField
          label="Pain score"
          name="painScore"
          value={formData.painScore}
          unit="/ 10"
          min="0"
          max="10"
          onChange={handleChange}
        />
        <NumberField
          label="Patient age"
          name="age"
          value={formData.age}
          unit="years"
          min="0"
          max="130"
          onChange={handleChange}
        />

        <label className="fieldGroup fieldWide">
          <span className="fieldLabel">Consciousness level (AVPU)</span>
          <select name="avpu" value={formData.avpu} onChange={handleChange}>
            <option value="ALERT">Alert</option>
            <option value="VOICE">Responds to voice</option>
            <option value="PAIN">Responds to pain</option>
            <option value="UNRESPONSIVE">Unresponsive</option>
          </select>
        </label>

        <label className="fieldGroup fieldWide">
          <span className="fieldLabel">Symptoms</span>
          <textarea
            name="symptoms"
            value={formData.symptoms}
            onChange={handleChange}
            rows="3"
            placeholder="Chest pain, shortness of breath, dizziness"
          />
          <small className="fieldHint">Separate multiple symptoms with commas.</small>
        </label>
      </div>

      <button className="evaluateButton" type="submit" disabled={isSubmitting}>
        <span>{isSubmitting ? 'Evaluating patient…' : 'Evaluate and prioritize'}</span>
        <span aria-hidden="true">→</span>
      </button>
    </form>
  );
}
