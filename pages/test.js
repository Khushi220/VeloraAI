// pages/test.js
import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import styles from '../styles/Test.module.css'; // keep your module filename

const OPTIONS = {
  gender: ['Female','Male','Non-binary','Prefer not to say'],
  ageBrackets: ['<18','18-25','26-35','36-45','46+'],
  skinTypes: ['Oily','Dry','Combination','Normal','Sensitive'],
  skinConcerns: ['Acne','Pigmentation','Dullness','Wrinkles/Fine lines','Redness','Uneven tone','Dark circles','Pores','Dry patches','Sensitivity'],
  sleep: ['<4 hours','4-6 hours','6-8 hours','8+ hours'],
  water: ['<1L','1-2L','2-3L','3L+'],
  stress: ['Low','Moderate','High'],
  smoking: ['Non-smoker','Occasional','Regular'],
  alcohol: ['Never','Sometimes','Frequent'],
};

export default function TestPage() {
  const steps = ['About You', 'Skin', 'Lifestyle'];
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(''); // result from API

  const [form, setForm] = useState({
    name: '',
    gender: '',
    ageBracket: '',
    skinType: '',
    skinConcerns: [],
    sleep: '',
    water: '',
    stress: '',
    smoking: '',
    alcohol: '',
    cleanse: '',
    exfoliate: '',
  });

  const trackKeys = [
    'name','gender','ageBracket','skinType','skinConcerns',
    'sleep','water','stress','smoking','cleanse','exfoliate'
  ];

  const [committed, setCommitted] = useState([]);

  function updateField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
    commitIfFilled(key, value);
  }

  function toggleArray(key, value) {
    setForm(prev => {
      const arr = Array.isArray(prev[key]) ? [...prev[key]] : [];
      const idx = arr.indexOf(value);
      if (idx > -1) arr.splice(idx, 1);
      else arr.push(value);
      const next = { ...prev, [key]: arr };
      commitIfFilled(key, arr);
      return next;
    });
  }

  function commitIfFilled(key, v) {
    const val = v === undefined ? form[key] : v;
    const filled = Array.isArray(val) ? val.length > 0 : (val !== null && val !== undefined && String(val).trim() !== '');
    if (filled) {
      setCommitted(prev => (prev.includes(key) ? prev : [...prev, key]));
    } else {
      setCommitted(prev => prev.filter(x => x !== key));
    }
  }

  useEffect(() => {
    // keep committed in sync with form values
    trackKeys.forEach(k => commitIfFilled(k));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form]);

  const percent = useMemo(() => {
    const total = trackKeys.length;
    let count = 0;
    trackKeys.forEach(k => {
      if (!committed.includes(k)) return;
      const v = form[k];
      const filled = Array.isArray(v) ? v.length > 0 : (v !== null && v !== undefined && String(v).trim() !== '');
      if (filled) count += 1;
    });
    return total > 0 ? Math.round((count / total) * 100) : 0;
  }, [committed, form]);

  const stepFields = {
    0: ['name', 'gender', 'ageBracket'],
    1: ['skinType', 'skinConcerns'],
    2: ['sleep', 'water', 'stress', 'smoking', 'cleanse', 'exfoliate'],
  };

  function next() {
    (stepFields[stepIndex] || []).forEach(k => commitIfFilled(k));
    if (stepIndex < steps.length - 1) setStepIndex(i => i + 1);
  }

  function prev() {
    if (stepIndex > 0) setStepIndex(i => i - 1);
  }
async function handleSubmit(e) {
  if (e && typeof e.preventDefault === "function") e.preventDefault();

  // commit fields etc...
  trackKeys.forEach(k => commitIfFilled(k));
  if (percent < 100) {
    setResult("Please complete all sections before submitting.");
    return;
  }

  setSubmitted(true);
  setResult("Loading your personalized recommendations...");

  try {
    const response = await fetch("/api/recommend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ formData: form }),
    });

    // try to read JSON body for detailed error info
    const body = await response.json().catch(() => null);

    if (!response.ok) {
      // show server-provided error message if available
      const msg = (body && (body.error || body.detail)) || `Server returned ${response.status}`;
      setResult(`Error: ${msg}`);
      return;
    }

    if (body && body.recommendation) {
      setResult(body.recommendation);
    } else {
      setResult("Sorry, unexpected response format from server.");
    }
  } catch (err) {
    console.error("Client submit error:", err);
    setResult("Network or client error. Check console for details.");
    setSubmitted(false);
  }
}
  // stepper click / key handlers (prevent jumping forwards)
  function handleStepClick(i) {
    if (i <= stepIndex) setStepIndex(i);
  }
  function handleStepKeyDown(e, i) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (i <= stepIndex) setStepIndex(i);
    }
  }

  return (
    <main className={styles.testGridCentered}>
      <section className={styles.formCard} aria-labelledby="test-heading">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 id="test-heading" style={{ margin: 0, fontFamily: 'Playfair Display, serif' }}>Velora.ai — Skin Test</h2>
          <Link href="/" legacyBehavior>
            <a style={{ color: 'var(--muted)' }}>Back to Home</a>
          </Link>
        </div>

        {/* Stepper */}
        <div className={styles.stepper} role="tablist" aria-label="Form steps">
          {steps.map((s, i) => {
            const locked = i > stepIndex;
            return (
              <div
                key={s}
                className={[
                  styles.step,
                  i === stepIndex ? styles.active : '',
                  locked ? styles.stepLocked : ''
                ].join(' ')}
                aria-current={i === stepIndex ? 'step' : undefined}
                role="tab"
                tabIndex={i <= stepIndex ? 0 : -1}
                onClick={() => handleStepClick(i)}
                onKeyDown={(e) => handleStepKeyDown(e, i)}
                aria-disabled={locked}
              >
                <div className={styles.stepIndex}>{i + 1}</div>
                <div className={styles.stepLabel}>{s}</div>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className={styles.progressWrap} style={{ marginBottom: 16 }}>
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Form completion"
          >
            <div className={styles.progressFill} style={{ width: `${percent}%` }} />
          </div>
          <div className={styles.percentLabel}>{percent}%</div>
        </div>

        {/* Step content */}
        <div className={styles.stepContent}>
          {stepIndex === 0 && (
            <div>
              <div className={styles.field}>
                <label className={styles.labelText}>Name</label>
                <input
                  className={styles.input}
                  value={form.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  placeholder="Your name"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.field}>
                  <label className={styles.labelText}>Gender</label>
                  <select
                    className={styles.select}
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                  >
                    <option value="">Choose</option>
                    {OPTIONS.gender.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.labelText}>Age bracket</label>
                  <select
                    className={styles.select}
                    value={form.ageBracket}
                    onChange={(e) => updateField('ageBracket', e.target.value)}
                  >
                    <option value="">Choose</option>
                    {OPTIONS.ageBrackets.map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {stepIndex === 1 && (
            <div>
              <div className={styles.field}>
                <label className={styles.labelText}>Skin type</label>
                <select
                  className={styles.select}
                  value={form.skinType}
                  onChange={(e) => updateField('skinType', e.target.value)}
                >
                  <option value="">Choose</option>
                  {OPTIONS.skinTypes.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.labelText}>Skin concerns (select all that apply)</label>
                <div className={styles.checkboxGroup}>
                  {OPTIONS.skinConcerns.map((c) => (
                    <label className={styles.checkboxItem} key={c} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={form.skinConcerns.includes(c)}
                        onChange={() => toggleArray('skinConcerns', c)}
                      />
                      <span className={styles.checkboxLabel}>{c}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {stepIndex === 2 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className={styles.field}>
                  <label className={styles.labelText}>Hours of sleep</label>
                  <select
                    className={styles.select}
                    value={form.sleep}
                    onChange={(e) => updateField('sleep', e.target.value)}
                  >
                    <option value="">Choose</option>
                    {OPTIONS.sleep.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.labelText}>Water intake / day</label>
                  <select
                    className={styles.select}
                    value={form.water}
                    onChange={(e) => updateField('water', e.target.value)}
                  >
                    <option value="">Choose</option>
                    {OPTIONS.water.map((w) => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.labelText}>Stress level</label>
                  <select
                    className={styles.select}
                    value={form.stress}
                    onChange={(e) => updateField('stress', e.target.value)}
                  >
                    <option value="">Choose</option>
                    {OPTIONS.stress.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.labelText}>Smoking habit</label>
                  <select
                    className={styles.select}
                    value={form.smoking}
                    onChange={(e) => updateField('smoking', e.target.value)}
                  >
                    <option value="">Choose</option>
                    {OPTIONS.smoking.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <div className={styles.field}>
                  <label className={styles.labelText}>Do you cleanse?</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['Yes', 'No'].map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name="cleanse"
                          checked={form.cleanse === opt}
                          onChange={() => updateField('cleanse', opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.labelText}>Do you exfoliate?</label>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {['Yes', 'No'].map((opt) => (
                      <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="radio"
                          name="exfoliate"
                          checked={form.exfoliate === opt}
                          onChange={() => updateField('exfoliate', opt)}
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className={styles.controls} style={{ display: 'flex', gap: 12, marginTop: 18, justifyContent: 'flex-end' }}>
          <button type="button" className={styles.btnSecondary} onClick={prev} disabled={stepIndex === 0 || submitted}>Previous</button>

          {stepIndex < steps.length - 1 ? (
            <button type="button" className={styles.btnPrimary} onClick={next} disabled={submitted}>Next</button>
          ) : (
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={handleSubmit}
              disabled={submitted || percent < 100}
            >
              {submitted ? 'Submitted' : 'Submit'}
            </button>
          )}
        </div>

        {/* Result area (shown after submit or when there's a message) */}
        {result && (
          <div
            className={styles.result}
            style={{
              marginTop: "30px",
              padding: "20px",
              backgroundColor: "#ffe9f3",
              borderRadius: "12px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.1)"
            }}
          >
            <h3 style={{ color: "#b83280", fontFamily: "Playfair Display, serif", marginBottom: 12 }}>
              💡 Personalized Recommendations
            </h3>
            <p style={{ whiteSpace: "pre-line", lineHeight: "1.6", margin: 0 }}>
              {result}
            </p>
          </div>
        )}

      </section>
    </main>
  );
}