import { redirect, Form, useLoaderData, useNavigation } from "react-router";
import { login } from "../../shopify.server";
import styles from "./styles.module.css";

export const loader = async ({ request }) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

/* ── Inline SVG Icons ─────────────────────────────────── */

function LogoIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function VerifiedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function CreditCardIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
      <line x1="1" y1="10" x2="23" y2="10" />
    </svg>
  );
}

/* ── Features Data ─────────────────────────────────────── */

const FEATURES = [
  "Premium Announcement Templates",
  "Countdown Timers & Scheduling",
  "Shopify Theme App Extension",
  "Analytics & Conversion Tracking",
  "Mobile Optimized Designs",
];

/* ── Component ─────────────────────────────────────────── */

export default function App() {
  const { showForm } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className={styles.loginPage}>
      {/* ── Left Panel: Branding ─── */}
      <div className={styles.leftPanel}>
        <div className={styles.leftPanelBg}>
          <div className={styles.gradientMesh} />
          <div className={`${styles.blob} ${styles.blob1}`} />
          <div className={`${styles.blob} ${styles.blob2}`} />
          <div className={`${styles.blob} ${styles.blob3}`} />
          <div className={styles.gridOverlay} />
        </div>

        <div className={styles.leftContent}>
          {/* Logo */}
          <div className={styles.logo}>
            <div className={styles.logoIcon}>
              <LogoIcon />
            </div>
            <span className={styles.logoText}>MotionNotify</span>
          </div>

          {/* Headline */}
          <h1 className={styles.headline}>
            Create Announcement Campaigns That Convert.
          </h1>
          <p className={styles.subheadline}>
            Design beautiful announcement banners, countdown campaigns, and
            promotional cards that increase engagement and sales.
          </p>

          {/* Feature Bullets */}
          <ul className={styles.features}>
            {FEATURES.map((feature) => (
              <li key={feature} className={styles.featureItem}>
                <span className={styles.featureCheck}>
                  <CheckIcon />
                </span>
                {feature}
              </li>
            ))}
          </ul>

          {/* Floating Preview Cards */}
          <div className={styles.floatingCards}>
            <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
              <div className={styles.cardLabel}>Impressions</div>
              <div className={styles.cardValue}>24.8K</div>
              <div className={styles.cardBar}>
                <div className={`${styles.cardBarFill} ${styles.cardBarFill1}`} />
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
              <div className={styles.cardLabel}>Click Rate</div>
              <div className={styles.cardValue}>12.4%</div>
              <div className={styles.cardBar}>
                <div className={`${styles.cardBarFill} ${styles.cardBarFill2}`} />
              </div>
            </div>
            <div className={`${styles.floatingCard} ${styles.floatingCard3}`}>
              <div className={styles.cardLabel}>Conversions</div>
              <div className={styles.cardValue}>3,217</div>
              <div className={styles.cardBar}>
                <div className={`${styles.cardBarFill} ${styles.cardBarFill3}`} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel: Auth ─── */}
      <div className={styles.rightPanel}>
        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            {/* Auth Logo */}
            <div className={styles.authLogo}>
              <div className={styles.authLogoIcon}>
                <LogoIcon size={20} />
              </div>
              <span className={styles.authLogoText}>MotionNotify</span>
            </div>

            {/* Auth Title */}
            <h2 className={styles.authTitle}>Connect Your Shopify Store</h2>
            <p className={styles.authSubtitle}>
              Enter your store domain to get started with beautiful announcement
              campaigns.
            </p>

            {/* Login Form */}
            {showForm && (
              <Form
                className={styles.form}
                method="post"
                action="/auth/login"
              >
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel} htmlFor="login-shop">
                    Store domain
                  </label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <ShopIcon />
                    </span>
                    <input
                      id="login-shop"
                      className={styles.input}
                      type="text"
                      name="shop"
                      placeholder="your-store.myshopify.com"
                      autoFocus
                      autoComplete="on"
                    />
                  </div>
                </div>

                <button
                  className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`}
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className={styles.spinner} />
                      <span className={styles.submitBtnText}>Connecting…</span>
                    </>
                  ) : (
                    <>
                      <span className={styles.submitBtnText}>
                        Continue with Shopify
                      </span>
                      <ArrowIcon />
                    </>
                  )}
                </button>
              </Form>
            )}
          </div>

          {/* Trust Section */}
          <div className={styles.trustSection}>
            <div className={styles.divider}>
              <span>Trusted by merchants</span>
            </div>
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>
                  <ShieldIcon />
                </span>
                Secure OAuth Authentication
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>
                  <VerifiedIcon />
                </span>
                Shopify Verified Connection
              </div>
              <div className={styles.trustBadge}>
                <span className={styles.trustIcon}>
                  <CreditCardIcon />
                </span>
                No Credit Card Required
              </div>
            </div>
          </div>

          {/* Tagline */}
          <div className={styles.tagline}>Announce · Engage · Convert</div>
        </div>
      </div>
    </div>
  );
}
