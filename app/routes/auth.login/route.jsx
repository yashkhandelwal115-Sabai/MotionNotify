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

/* ── Inline Styles ── */

const S = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    background: "#07070e",
    padding: "2rem",
    position: "relative",
    overflow: "hidden",
  },
  bgBlob1: {
    position: "absolute",
    width: "500px",
    height: "500px",
    borderRadius: "50%",
    background: "rgba(139, 92, 246, 0.1)",
    filter: "blur(120px)",
    top: "-200px",
    left: "-150px",
  },
  bgBlob2: {
    position: "absolute",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "rgba(168, 85, 247, 0.08)",
    filter: "blur(100px)",
    bottom: "-150px",
    right: "-100px",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    background: "rgba(12, 12, 20, 0.8)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "24px",
    padding: "3rem 2.5rem",
    position: "relative",
    zIndex: 1,
    textAlign: "center",
    animation: "fadeIn 0.6s ease-out",
  },
  bigM: {
    width: "72px",
    height: "72px",
    margin: "0 auto 12px",
  },
  brandName: {
    fontSize: "1.75rem",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    color: "#fafafa",
    marginBottom: "32px",
  },
  brandAccent: {
    background: "linear-gradient(135deg, #a855f7, #8b5cf6)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#fafafa",
    marginBottom: "10px",
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.4)",
    lineHeight: "1.6",
    marginBottom: "32px",
  },
  form: {
    textAlign: "left",
  },
  label: {
    fontSize: "0.813rem",
    fontWeight: "500",
    color: "rgba(255,255,255,0.6)",
    marginBottom: "8px",
    display: "block",
  },
  inputWrap: {
    position: "relative",
    marginBottom: "12px",
  },
  inputIcon: {
    position: "absolute",
    left: "16px",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
    zIndex: 1,
  },
  shopifyBadge: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #96bf48, #5c8c1f)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  input: {
    width: "100%",
    padding: "16px 16px 16px 56px",
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
  inputErr: {
    borderColor: "rgba(239,68,68,0.5)",
    boxShadow: "0 0 0 3px rgba(239,68,68,0.1)",
  },
  errText: {
    fontSize: "0.75rem",
    color: "#f87171",
    marginBottom: "8px",
  },
  createLink: {
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.4)",
    marginBottom: "24px",
    textAlign: "center",
  },
  link: {
    color: "#a78bfa",
    textDecoration: "none",
    fontWeight: "500",
  },
  btn: {
    width: "100%",
    padding: "16px 24px",
    background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 40%, #6d28d9 100%)",
    color: "white",
    fontSize: "1rem",
    fontWeight: "700",
    fontFamily: "'Inter', sans-serif",
    border: "none",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
    transition: "all 0.3s ease",
  },
  btnIcon: {
    width: "22px",
    height: "22px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  },
  spinner: {
    width: "20px",
    height: "20px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "white",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite",
  },
  secure: {
    marginTop: "20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "6px",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.3)",
  },
};

const animCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  body { margin: 0; background: #07070e; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
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
      <style dangerouslySetInnerHTML={{ __html: animCSS }} />
      <div style={S.wrapper}>
        <div style={S.bgBlob1} />
        <div style={S.bgBlob2} />

        <div style={S.card}>
          {/* Big M Logo */}
          <div style={S.bigM}>
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
              <defs>
                <linearGradient id="mG" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="50%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path d="M12 56V20L24 44L36 20L48 44L60 20V56" stroke="url(#mG)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="36" cy="14" r="4" fill="url(#mG)" opacity="0.6" />
            </svg>
          </div>

          <div style={S.brandName}>
            Motion<span style={S.brandAccent}>Notify</span>
          </div>

          <h2 style={S.title}>Connect Your Shopify Store</h2>
          <p style={S.subtitle}>
            Enter your Shopify store domain to access your MotionNotify dashboard.
          </p>

          <Form method="post" style={S.form}>
            <label style={S.label} htmlFor="auth-shop">Shopify store domain</label>
            <div style={S.inputWrap}>
              <span style={S.inputIcon}>
                <span style={S.shopifyBadge}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.021-.117-.144-.2-.247-.2s-2.106-.153-2.106-.153-1.394-1.386-1.55-1.542c-.156-.156-.461-.109-.58-.073-.003.001-.323.099-.823.254-.489-1.415-1.352-2.715-2.867-2.715-.042 0-.085.002-.127.005-.393-.52-.879-.748-1.295-.748C7.287-.484 5.483 3.119 4.898 5.312l-2.505.777c-.78.244-.804.268-.906.999C1.38 7.727 0 18.44 0 18.44l12.313 2.153 3.024 3.386zm-3.296-19.53c0 .083-.008.166-.022.248-.651-2.065-1.889-2.758-2.868-2.868.765-.926 1.556-1.203 2.05-1.203.352 0 .602.154.84.454v3.369z" />
                  </svg>
                </span>
              </span>
              <input
                id="auth-shop"
                style={{ ...S.input, ...(hasError ? S.inputErr : {}) }}
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
            {hasError && <div style={S.errText}>{errors.shop}</div>}

            <div style={S.createLink}>
              Don&apos;t have a store?{" "}
              <a style={S.link} href="https://www.shopify.com/free-trial" target="_blank" rel="noopener noreferrer">
                Create one on Shopify ↗
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{ ...S.btn, ...(isSubmitting ? { opacity: 0.8, pointerEvents: "none" } : {}) }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(139,92,246,0.45)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.35)";
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={S.spinner} />
                  Connecting…
                </>
              ) : (
                <>
                  <span style={S.btnIcon}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M15.337 23.979l7.216-1.561s-2.604-17.613-2.625-17.73c-.021-.117-.144-.2-.247-.2s-2.106-.153-2.106-.153-1.394-1.386-1.55-1.542c-.156-.156-.461-.109-.58-.073-.003.001-.323.099-.823.254-.489-1.415-1.352-2.715-2.867-2.715-.042 0-.085.002-.127.005-.393-.52-.879-.748-1.295-.748C7.287-.484 5.483 3.119 4.898 5.312l-2.505.777c-.78.244-.804.268-.906.999C1.38 7.727 0 18.44 0 18.44l12.313 2.153 3.024 3.386zm-3.296-19.53c0 .083-.008.166-.022.248-.651-2.065-1.889-2.758-2.868-2.868.765-.926 1.556-1.203 2.05-1.203.352 0 .602.154.84.454v3.369z" />
                    </svg>
                  </span>
                  Continue with Shopify →
                </>
              )}
            </button>
          </Form>

          <div style={S.secure}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Secure authentication via Shopify
          </div>
        </div>
      </div>
    </>
  );
}
