// pages/index.js
// CHANGED: hero layout, scanner overlay, features section and smooth scroll handling
import { useEffect } from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";

export default function Home() {
  useEffect(() => {
    // Ensure anchor smooth scroll works in browsers that may need JS fallback
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(a => {
      a.addEventListener('click', function (e) {
        const href = (this.getAttribute('href') || '').trim();
        if (!href || href === '#') return;
        const el = document.querySelector(href);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
    return () => anchors.forEach(a => a.removeEventListener('click', ()=>{}));
  }, []);

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          {/* left: content */}
          <div className={styles.heroContent}>
            <div className={styles.brand}>Velora.ai</div>
            <div className={styles.heroTag}>Science-backed, personalized skincare routines</div>
            <h1 className={styles.heroHeadline}>Personalized skin care powered by AI</h1>
            <p className={styles.heroSub}>
              Velora.ai analyzes lifestyle and skin history to generate a safe, practical
              routine — formulations, product matches, and actionable steps you can follow.
            </p>

            <div className={styles.heroCTAs}>
              <Link href="/test" className={styles.ctaPrimary}>Take the Test</Link>
              <a href="#steps" className={styles.learnMoreBtn}>Learn more</a>
            </div>

            {/* promo rating (small) */}
            <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
              <div style={{ padding: '8px 12px', background: 'white', borderRadius: 12, boxShadow: '0 6px 18px rgba(0,0,0,0.06)', fontWeight:700 }}>⭐ 4.6</div>
              <div style={{ color: 'var(--muted)' }}>Trusted by 8,700+ users</div>
            </div>
          </div>

          {/* right visual / promo */}
          <div className={styles.heroVisual}>
            <div className={styles.promoCard} aria-hidden="false">
              <div style={{ padding: 14, flex: 1 }}>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Velora.ai</div>
                <div style={{ color: "#6B7280", marginBottom: 12 }}>AI-driven analysis • Tailored routines • Product matches</div>
                <div className={styles.rating}>⭐ 4.6 • 8,700+ reviews</div>
              </div>

              <div className={styles.promoImageWrap}>
                {/* CHANGED: use /hero-face.png if present else show placeholder initials */}
                <img src="/hero-face.png" alt="Portrait representing diverse Indian skin tones" className={styles.promoImage} onError={(e)=>{ e.currentTarget.style.display='none'; }} />

                {/* ADDED: subtle scanner overlay */}
                <div className={styles.scannerOverlay} aria-hidden="true"></div>

                {/* If image fails to load, a visible placeholder initials will be shown by CSS background */}
                <noscript>
                  <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontFamily: 'Playfair Display, serif', fontSize: 42, color: 'rgba(216,91,132,0.18)' }}>V</div>
                </noscript>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* short about block */}
      <section id="about" style={{ padding: "28px 20px", textAlign: "center" }}>
        <div className="container-wide">
          <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: 28, margin: 0 }}>What is Velora.ai?</h2>
          <p style={{ maxWidth: 900, margin: "12px auto 0 auto", color: "var(--muted)", fontSize: 16 }}>
            Velora.ai is a smart skincare assistant that uses your lifestyle inputs and current routine to recommend a simple, evidence-based skincare program. We focus on safe ingredient matches, practical formulating tips, and product suggestions you can buy.
          </p>
        </div>
      </section>

      {/* Features: 3-step */}
      {/*<section id="features" className={styles.featuresSection} aria-label="Three step features">
        <div className="container-wide">
          <h2 className="h2" style={{ marginBottom: 6 }}>How it works</h2>
          <p className="p-muted">A simple 3-step flow to discover your skin profile and get a tailored routine.</p>

          <div className={styles.featuresGrid}>
            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>1</div>
              <div className="featureContent">
                <h3>Discover</h3>
                <p>Answer a few quick questions to assess your skin profile.</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>2</div>
              <div className="featureContent">
                <h3>Personalize</h3>
                <p>AI-generated routine with ingredient-safe recommendations.</p>
              </div>
            </div>

            <div className={styles.featureItem}>
              <div className={styles.featureIcon}>3</div>
              <div className="featureContent">
                <h3>Follow</h3>
                <p>Actionable steps, product matches, and monitoring tips.</p>
              </div>
            </div>
          </div>
        </div>
  </section>*/}
      <section id="steps" className={styles.stepsSection}>
  <h2 className={styles.stepsTitle}>Your Personal Skin Analysis in Three Easy Steps</h2>

  <div className={styles.stepsGrid}>
    {/* Step 1 */}
    <div className={styles.step}>
      <div className={styles.number}>1</div>
      <img src="/Photo1.png" alt="Step 1" className={styles.stepImage} />
      <h3 className={styles.stepHeading}>Upload or Take a Selfie</h3>
      <p className={styles.stepText}>
        Complete your profile in less than a minute and let AI define your skincare priorities.
      </p>
    </div>

    {/* Step 2 */}
    <div className={styles.step}>
      <div className={styles.number}>2</div>
      <img src="/Photo2.png" alt="Step 2" className={styles.stepImage} />
      <h3 className={styles.stepHeading}>Complete Your Analysis</h3>
      <p className={styles.stepText}>
        Our analysis technology scans your photo to reveal your skin’s strengths and target areas.
      </p>
    </div>

    {/* Step 3 */}
    <div className={styles.step}>
      <div className={styles.number}>3</div>
      <img src="/Photo3.png" alt="Step 3" className={styles.stepImage} />
      <h3 className={styles.stepHeading}>Discover Your Routine</h3>
      <p className={styles.stepText}>
        Receive a personalized skincare routine designed for your unique skin profile.
      </p>
    </div>
  </div>
</section>
    </>
  );
}