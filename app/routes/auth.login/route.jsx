import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

export const action = async ({ request }) => {
  const errors = loginErrorMessage(await login(request));
  return { errors };
};

/* ── Inline SVG Icons ── */

function LogoIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

/* ── Styles (embedded inline for Shopify App Bridge context) ── */

const pageStyles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "linear-gradient(135deg, #09090b 0%, #0c0015 50%, #09090b 100%)",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
  bgBlob1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(139, 92, 246, 0.12)",
    filter: "blur(120px)",
    top: "-200px",
    left: "-150px",
    animation: "blobDrift 20s ease-in-out infinite alternate",
  },
  bgBlob2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(236, 72, 153, 0.1)",
    filter: "blur(100px)",
    bottom: "-150px",
    right: "-100px",
    animation: "blobDrift 15s ease-in-out infinite alternate-reverse",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "24px",
    padding: "2.5rem 2rem",
    boxShadow: "0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.03), inset 0 1px 0 rgba(255,255,255,0.06)",
    position: "relative",
    zIndex: 1,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    marginBottom: "1.75rem",
  },
  logoIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 0 20px rgba(139,92,246,0.3)",
    color: "white",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    letterSpacing: "-0.02em",
    color: "#fafafa",
  },
  title: {
    fontSize: "1.375rem",
    fontWeight: "700",
    textAlign: "center",
    margin: "0 0 0.5rem 0",
    letterSpacing: "-0.02em",
    color: "#fafafa",
  },
  subtitle: {
    fontSize: "0.875rem",
    textAlign: "center",
    color: "rgba(255,255,255,0.45)",
    margin: "0 0 2rem 0",
    lineHeight: "1.5",
  },
  label: {
    fontSize: "0.813rem",
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "6px",
    display: "block",
  },
  inputWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    marginBottom: "4px",
  },
  inputIcon: {
    position: "absolute",
    left: "14px",
    color: "rgba(255,255,255,0.3)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  input: {
    width: "100%",
    padding: "14px 14px 14px 44px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    fontSize: "0.938rem",
    color: "#fafafa",
    fontFamily: "'Inter', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.25s ease",
  },
  inputError: {
    borderColor: "rgba(239,68,68,0.5)",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
  },
  errorText: {
    fontSize: "0.75rem",
    color: "#f87171",
    marginTop: "4px",
  },
  button: {
    width: "100%",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)",
    color: "white",
    fontSize: "0.938rem",
    fontWeight: "600",
    fontFamily: "'Inter', sans-serif",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 4px 16px rgba(139,92,246,0.3)",
    marginTop: "1rem",
    transition: "all 0.3s ease",
  },
  tagline: {
    textAlign: "center",
    fontSize: "0.688rem",
    color: "rgba(255,255,255,0.2)",
    letterSpacing: "0.15em",
    textTransform: "uppercase",
    fontWeight: "500",
    marginTop: "2rem",
  },
};

const animationCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  @keyframes blobDrift {
    0% { transform: translate(0, 0) scale(1); }
    100% { transform: translate(30px, -20px) scale(1.05); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(16px); }
    to { opacity: 1; transform: translateY(0); }
  }
  body { margin: 0; background: #09090b; }
`;

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;
  const isSubmitting = navigation.state === "submitting";
  const hasError = errors?.shop;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animationCSS }} />
      <div style={pageStyles.wrapper}>
        {/* Background blobs */}
        <div style={pageStyles.bgBlob1} />
        <div style={pageStyles.bgBlob2} />

        {/* Card */}
        <div style={{ ...pageStyles.card, animation: "fadeIn 0.6s ease-out" }}>
          {/* Logo */}
          <div style={pageStyles.logo}>
            <div style={pageStyles.logoIcon}>
              <LogoIcon />
            </div>
            <span style={pageStyles.logoText}>MotionNotify</span>
          </div>

          {/* Title */}
          <h2 style={pageStyles.title}>Connect Your Shopify Store</h2>
          <p style={pageStyles.subtitle}>
            Enter your store domain to continue to your dashboard.
          </p>

          {/* Form */}
          <Form method="post">
            <label style={pageStyles.label} htmlFor="auth-shop">
              Store domain
            </label>
            <div style={pageStyles.inputWrapper}>
              <span style={pageStyles.inputIcon}>
                <ShopIcon />
              </span>
              <input
                id="auth-shop"
                style={{
                  ...pageStyles.input,
                  ...(hasError ? pageStyles.inputError : {}),
                }}
                name="shop"
                value={shop}
                onChange={(e) => setShop(e.currentTarget.value)}
                placeholder="your-store.myshopify.com"
                autoComplete="on"
                autoFocus
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(139,92,246,0.5)";
                  e.target.style.background = "rgba(255,255,255,0.06)";
                  e.target.style.boxShadow = "0 0 0 3px rgba(139,92,246,0.1)";
                }}
                onBlur={(e) => {
                  if (!hasError) {
                    e.target.style.borderColor = "rgba(255,255,255,0.1)";
                    e.target.style.background = "rgba(255,255,255,0.04)";
                    e.target.style.boxShadow = "none";
                  }
                }}
              />
            </div>
            {hasError && <div style={pageStyles.errorText}>{errors.shop}</div>}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                ...pageStyles.button,
                ...(isSubmitting ? { opacity: 0.8, pointerEvents: "none" } : {}),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(139,92,246,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(139,92,246,0.3)";
              }}
            >
              {isSubmitting ? "Connecting…" : "Continue with Shopify"}
              {!isSubmitting && <ArrowIcon />}
            </button>
          </Form>

          {/* Tagline */}
          <div style={pageStyles.tagline}>Announce · Engage · Convert</div>
        </div>
      </div>
    </>
  );
}
