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

/* ── SVG Icons ── */

function TemplateIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="9" y1="21" x2="9" y2="9" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ExtensionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17l6-6-6-6" />
      <line x1="12" y1="19" x2="20" y2="19" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function MobileIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
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

function ShopifyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.021-.117-.144-.2-.247-.2s-2.106-.153-2.106-.153-1.394-1.386-1.55-1.542c-.156-.156-.461-.109-.58-.073-.003.001-.323.099-.823.254-.489-1.415-1.352-2.715-2.867-2.715-.042 0-.085.002-.127.005-.393-.52-.879-.748-1.295-.748C7.287-.484 5.483 3.119 4.898 5.312l-2.505.777c-.78.244-.804.268-.906.999C1.38 7.727 0 18.44 0 18.44l12.313 2.153 3.024 3.386zm-3.296-19.53c0 .083-.008.166-.022.248-.651-2.065-1.889-2.758-2.868-2.868.765-.926 1.556-1.203 2.05-1.203.352 0 .602.154.84.454v3.369z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

/* ── Features Data ── */

const FEATURES = [
  {
    icon: TemplateIcon,
    title: "Premium Announcement Templates",
    desc: "Beautiful, conversion-focused templates",
  },
  {
    icon: TimerIcon,
    title: "Countdown Timers & Scheduling",
    desc: "Schedule announcements with timers",
  },
  {
    icon: ExtensionIcon,
    title: "Shopify Theme App Extension",
    desc: "Seamless integration with your theme",
  },
  {
    icon: ChartIcon,
    title: "Analytics & Conversion Tracking",
    desc: "Track performance and increase ROI",
  },
  {
    icon: MobileIcon,
    title: "Mobile Optimized Designs",
    desc: "Perfect on every device, every time",
  },
];

/* ── Component ── */

export default function App() {
  const { showForm } = useLoaderData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === "submitting";

  return (
    <div className={styles.loginPage}>
      {/* ═══════ LEFT PANEL ═══════ */}
      <div className={styles.leftPanel}>
        {/* Background effects */}
        <div className={styles.bgEffects}>
          <div className={styles.bgGradient1} />
          <div className={styles.bgGradient2} />
          <div className={styles.bgGradient3} />
          <div className={`${styles.bgDot} ${styles.bgDot1}`} />
          <div className={`${styles.bgDot} ${styles.bgDot2}`} />
          <div className={`${styles.bgDot} ${styles.bgDot3}`} />
          <div className={`${styles.bgDot} ${styles.bgDot4}`} />
          <div className={`${styles.bgDot} ${styles.bgDot5}`} />
        </div>

        <div className={styles.leftContent}>
          {/* Logo */}
          <div className={`${styles.topLogo} ${styles.fadeIn}`}>
            <div className={styles.logoMark}>M</div>
            <div>
              <span className={styles.logoName}>MotionNotify</span>
              <span className={styles.logoTagline}>
                Announce. Engage. Convert.
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className={`${styles.headline} ${styles.fadeInDelay1}`}>
            Create Announcement
            <br />
            Campaigns That{" "}
            <span className={styles.headlineAccent}>Convert.</span>
          </h1>

          <p className={`${styles.subheadline} ${styles.fadeInDelay2}`}>
            Design beautiful announcement banners, countdown campaigns, and
            promotional cards that increase engagement and sales.
          </p>

          {/* Middle area: features + floating cards */}
          <div className={`${styles.middleArea} ${styles.fadeInDelay3}`}>
            {/* Features */}
            <ul className={styles.featureList}>
              {FEATURES.map((f) => (
                <li key={f.title} className={styles.featureItem}>
                  <div className={styles.featureIcon}>
                    <f.icon />
                  </div>
                  <div>
                    <div className={styles.featureTitle}>{f.title}</div>
                    <div className={styles.featureDesc}>{f.desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Floating preview cards */}
            <div className={styles.floatingCards}>
              {/* Card 1: Summer Sale */}
              <div className={`${styles.previewCard} ${styles.card1}`} style={{"--rot": "-2deg"}}>
                <div className={styles.cardClose}>✕</div>
                <div className={styles.card1Inner}>
                  <div className={styles.card1Title}>
                    Summer Sale is Live! 🔥
                  </div>
                  <div className={styles.card1Sub}>
                    Up to 50% OFF on Selected Items
                  </div>
                  <div className={styles.card1Btn}>Shop Now</div>
                  <div className={styles.countdown}>
                    <div className={styles.countdownItem}>
                      <div className={styles.countdownNum}>02</div>
                      <div className={styles.countdownLabel}>Days</div>
                    </div>
                    <div className={styles.countdownSep}>:</div>
                    <div className={styles.countdownItem}>
                      <div className={styles.countdownNum}>14</div>
                      <div className={styles.countdownLabel}>Hours</div>
                    </div>
                    <div className={styles.countdownSep}>:</div>
                    <div className={styles.countdownItem}>
                      <div className={styles.countdownNum}>36</div>
                      <div className={styles.countdownLabel}>Mins</div>
                    </div>
                    <div className={styles.countdownSep}>:</div>
                    <div className={styles.countdownItem}>
                      <div className={styles.countdownNum}>48</div>
                      <div className={styles.countdownLabel}>Secs</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Free Shipping */}
              <div className={`${styles.previewCard} ${styles.card2}`} style={{"--rot": "1deg"}}>
                <div className={styles.cardClose}>✕</div>
                <div className={styles.card2Inner}>
                  <div className={styles.card2Text}>
                    <div className={styles.card2Title}>
                      Free Shipping on Orders $50+
                    </div>
                    <div className={styles.card2Sub}>
                      Limited time offer. Don&apos;t miss out!
                    </div>
                    <div className={styles.card2Btn}>Shop Now</div>
                  </div>
                  <div className={styles.card2Imgs}>
                    <div className={styles.card2Img}>👟</div>
                    <div className={styles.card2Img}>👜</div>
                  </div>
                </div>
              </div>

              {/* Card 3: New Collection */}
              <div className={`${styles.previewCard} ${styles.card3}`} style={{"--rot": "-1deg"}}>
                <div className={styles.cardClose}>✕</div>
                <div className={styles.card3Inner}>
                  <div className={styles.card3Text}>
                    <div className={styles.card3Title}>
                      New Collection Launch ✨
                    </div>
                    <div className={styles.card3Sub}>
                      Check out our latest arrivals
                    </div>
                    <div className={styles.card3Btn}>Explore Now</div>
                  </div>
                  <div className={styles.card3Imgs}>
                    <div className={styles.card3Img}>🎧</div>
                    <div className={styles.card3Img}>🚚</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Bar */}
        <div className={styles.trustBar}>
          <div className={styles.trustTitle}>
            Trusted by modern Shopify merchants
          </div>
          <div className={styles.trustItems}>
            <div className={styles.trustItem}>
              <div className={styles.trustItemIcon}>
                <ShieldIcon />
              </div>
              <div>
                <div className={styles.trustItemTitle}>Secure OAuth</div>
                <div className={styles.trustItemDesc}>Your data is safe</div>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustItemIcon}>
                <VerifiedIcon />
              </div>
              <div>
                <div className={styles.trustItemTitle}>Shopify Verified</div>
                <div className={styles.trustItemDesc}>
                  Officially verified app
                </div>
              </div>
            </div>
            <div className={styles.trustItem}>
              <div className={styles.trustItemIcon}>
                <CreditCardIcon />
              </div>
              <div>
                <div className={styles.trustItemTitle}>No Credit Card</div>
                <div className={styles.trustItemDesc}>
                  Start free, upgrade anytime
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════ RIGHT PANEL ═══════ */}
      <div className={styles.rightPanel}>
        <div className={styles.authContainer}>
          {/* Big M Logo */}
          <div className={styles.authBigLogo}>
            <div className={styles.bigM}>
              <svg className={styles.bigMSvg} viewBox="0 0 72 72" fill="none">
                <defs>
                  <linearGradient id="mGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
                <path
                  d="M12 56V20L24 44L36 20L48 44L60 20V56"
                  stroke="url(#mGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <circle cx="36" cy="14" r="4" fill="url(#mGrad)" opacity="0.6" />
              </svg>
            </div>
          </div>

          {/* Brand Name */}
          <div className={styles.authBrandName}>
            Motion<span className={styles.authBrandAccent}>Notify</span>
          </div>

          {/* Title */}
          <h2 className={styles.authTitle}>Connect Your Shopify Store</h2>
          <p className={styles.authSubtitle}>
            Enter your Shopify store domain to access your MotionNotify
            dashboard.
          </p>

          {/* Login Form */}
          {showForm && (
            <Form
              className={styles.form}
              method="post"
              action="/auth/login"
            >
              <label className={styles.inputLabel} htmlFor="idx-shop">
                Shopify store domain
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconWrap}>
                  <div className={styles.shopifyBadge}>
                    <ShopifyIcon />
                  </div>
                </div>
                <input
                  id="idx-shop"
                  className={styles.input}
                  type="text"
                  name="shop"
                  placeholder="your-store.myshopify.com"
                  autoFocus
                  autoComplete="on"
                />
              </div>

              <div className={styles.createLink}>
                Don&apos;t have a store?{" "}
                <a
                  href="https://www.shopify.com/free-trial"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Create one on Shopify ↗
                </a>
              </div>

              <button
                className={`${styles.submitBtn} ${isSubmitting ? styles.submitBtnLoading : ""}`}
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className={styles.spinner} />
                    Connecting…
                  </>
                ) : (
                  <>
                    <span className={styles.btnShopifyIcon}>
                      <ShopifyIcon />
                    </span>
                    Continue with Shopify →
                  </>
                )}
              </button>
            </Form>
          )}

          {/* Secure text */}
          <div className={styles.secureText}>
            <LockIcon />
            Secure authentication via Shopify
          </div>
        </div>
      </div>
    </div>
  );
}
