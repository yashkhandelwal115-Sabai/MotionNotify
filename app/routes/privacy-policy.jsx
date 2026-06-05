import styles from "../styles/privacy-policy.css?url";

export function links() {
  return [
    { rel: "stylesheet", href: styles }
  ];
}

export const meta = () => {
  return [
    { title: "Privacy Policy | MotionNotify" },
    { name: "description", content: "Privacy Policy for MotionNotify. Learn how we collect, use, and protect your data." },
  ];
};

export default function PrivacyPolicy() {
  const lastUpdated = "June 5, 2026";

  return (
    <div className="pp-page-wrapper">
      {/* Top Navigation */}
      <nav className="pp-nav">
        <div className="pp-container pp-nav-content">
          <a href="https://motionnotify.worldcrm.online" className="pp-logo">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7B61FF"/>
              <path d="M2 17L12 22L22 17" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Motion<span>Notify</span>
          </a>
          <div className="pp-nav-links">
            <a href="/" className="pp-nav-link">Home</a>
            <a href="/#features" className="pp-nav-link">Features</a>
            <a href="/#pricing" className="pp-nav-link">Pricing</a>
            <a href="mailto:support@motionnotify.worldcrm.online" className="pp-nav-link">Contact</a>
          </div>
          <a href="/" className="pp-btn">Get Started</a>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="pp-hero">
        <div className="pp-hero-bg"></div>
        <div className="pp-container">
          <div className="pp-hero-shield">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1 className="pp-hero-title">Privacy Policy</h1>
          <p className="pp-hero-subtitle">
            We are committed to protecting your privacy. Learn how MotionNotify collects, uses, protects, and manages merchant data when using our Shopify application and services.
          </p>
          <div className="pp-hero-meta">
            <div className="pp-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              Last Updated: {lastUpdated}
            </div>
            <div className="pp-pill" style={{ borderColor: 'var(--pp-accent)', color: 'var(--pp-accent)', backgroundColor: 'var(--pp-accent-light)' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              Shopify Approved
            </div>
          </div>
        </div>
      </header>

      {/* Quick Summary Card */}
      <div className="pp-container">
        <div className="pp-summary-card">
          <div className="pp-summary-item">
            <div className="pp-summary-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
            </div>
            <span className="pp-summary-text">We never sell merchant data</span>
          </div>
          <div className="pp-summary-item">
            <div className="pp-summary-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </div>
            <span className="pp-summary-text">All data is strictly encrypted</span>
          </div>
          <div className="pp-summary-item">
            <div className="pp-summary-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            </div>
            <span className="pp-summary-text">GDPR & CCPA Compliant</span>
          </div>
          <div className="pp-summary-item">
            <div className="pp-summary-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <span className="pp-summary-text">100% Shopify Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="pp-content-wrapper">
        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>}
          title="1. Introduction"
        >
          <p>This Privacy Policy describes how MotionNotify ("we", "our", or "us") collects, uses, and shares your personal information when you install or use the MotionNotify application in connection with your Shopify-supported store.</p>
          <p>By using the App, you agree to the collection and use of information in accordance with this policy. Our primary goal in collecting information is to provide and improve our Services, administer your use of the App, and enable you to enjoy and easily navigate our features.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>}
          title="2. Information We Collect"
        >
          <p>When you install the App, we are automatically able to access certain types of information from your Shopify account:</p>
          <ul>
            <li><strong>Shopify Store Data:</strong> We collect your shop domain, shop ID, store currency, primary locale, and basic store configuration required to render our announcement blocks correctly.</li>
            <li><strong>Merchant Account Information:</strong> We collect your email address for billing and crucial app-related communications.</li>
            <li><strong>Usage Analytics:</strong> We track impression and click events on the announcement banners to provide you with performance metrics in your dashboard. This data is fully anonymized and aggregated.</li>
          </ul>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>}
          title="3. Cookies & Tracking Technologies"
        >
          <p>We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. We do not use these technologies to track individual end-customers across the web.</p>
          <p>Cookies are primarily used to manage merchant authentication sessions via Shopify App Bridge and ensure secure access to your admin dashboard.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>}
          title="4. How We Use Information"
        >
          <p>We use the collected information for various purposes:</p>
          <ul>
            <li>To provide, operate, and maintain the App.</li>
            <li>To manage your billing and subscription plans through Shopify's Billing API.</li>
            <li>To monitor the usage of the App and detect, prevent, and address technical issues.</li>
            <li>To provide customer support and respond to your inquiries.</li>
            <li>To comply with legal obligations and Shopify's API Terms of Service.</li>
          </ul>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>}
          title="5. Data Storage & Security"
        >
          <p>The security of your data is paramount to us. We implement industry-standard security measures including encryption in transit (HTTPS/TLS) and encryption at rest in our secure database infrastructure.</p>
          <p>While we strive to use commercially acceptable means to protect your Personal Information, remember that no method of transmission over the Internet, or method of electronic storage is 100% secure.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>}
          title="6. Third-Party Services & Shopify Integration"
        >
          <p>Our App is deeply integrated with the Shopify platform. We share information with Shopify strictly to the extent necessary to provide the functionality of our App and process billing.</p>
          <p>We do not sell, rent, or trade your personal information or your store's customer data to any third parties for marketing purposes.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>}
          title="7. Data Retention Policy"
        >
          <p>We will retain your Personal Information only for as long as is necessary for the purposes set out in this Privacy Policy. Upon uninstallation of the App, we follow strict data deletion protocols as mandated by Shopify's platform rules.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>}
          title="8. GDPR Compliance"
        >
          <p>If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the GDPR. We aim to take reasonable steps to allow you to correct, amend, delete, or limit the use of your Personal Data.</p>
          <p>We subscribe to mandatory Shopify Webhooks to ensure compliance:</p>
          <ul>
            <li><strong>Customer Data Requests:</strong> Handled via `customers/data_request` webhook.</li>
            <li><strong>Data Deletion Requests:</strong> Handled via `customers/redact` webhook.</li>
            <li><strong>App Uninstall Data Handling:</strong> Handled via `shop/redact` webhook. We automatically purge your configurations 48 hours after uninstallation.</li>
          </ul>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>}
          title="9. International Data Transfers"
        >
          <p>Your information may be transferred to — and maintained on — computers located outside of your state, province, country, or other governmental jurisdiction where the data protection laws may differ from those from your jurisdiction.</p>
          <p>We ensure that any data transfer is protected by appropriate safeguards in compliance with applicable data protection laws.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>}
          title="10. Children's Privacy"
        >
          <p>Our App is not intended for use by children under the age of 18. We do not knowingly collect personally identifiable information from anyone under the age of 18. If you are a parent or guardian and you are aware that your child has provided us with Personal Data, please contact us.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>}
          title="11. Changes To This Privacy Policy"
        >
          <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.</p>
          <p>You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.</p>
        </PolicySection>

        <PolicySection 
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>}
          title="12. Contact Information"
        >
          <p>If you have any questions about this Privacy Policy, your data, or our practices, please contact us:</p>
          <ul>
            <li><strong>By email:</strong> <a href="mailto:support@motionnotify.worldcrm.online" style={{color: "var(--pp-accent)"}}>support@motionnotify.worldcrm.online</a></li>
            <li><strong>Website:</strong> <a href="https://motionnotify.worldcrm.online" style={{color: "var(--pp-accent)"}}>https://motionnotify.worldcrm.online</a></li>
          </ul>
        </PolicySection>
      </main>

      {/* Footer */}
      <footer className="pp-footer">
        <div className="pp-container">
          <div className="pp-footer-grid">
            <div className="pp-footer-brand">
              <a href="https://motionnotify.worldcrm.online" className="pp-logo">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#7B61FF"/>
                  <path d="M2 17L12 22L22 17" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="#7B61FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Motion<span>Notify</span>
              </a>
              <p>Premium announcement banners for modern Shopify stores. Convert more visitors with stunning design.</p>
            </div>
            <div>
              <h4 className="pp-footer-title">Legal</h4>
              <ul className="pp-footer-links">
                <li><a href="/privacy-policy" className="pp-footer-link">Privacy Policy</a></li>
                <li><a href="#" className="pp-footer-link">Terms of Service</a></li>
                <li><a href="#" className="pp-footer-link">Cookie Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="pp-footer-title">Contact</h4>
              <ul className="pp-footer-links">
                <li><a href="mailto:support@motionnotify.worldcrm.online" className="pp-footer-link">support@motionnotify.worldcrm.online</a></li>
              </ul>
            </div>
          </div>
          <div className="pp-footer-bottom">
            <span>&copy; {new Date().getFullYear()} MotionNotify. All rights reserved.</span>
            <span>Made for Shopify</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Reusable component for policy sections
function PolicySection({ icon, title, children }) {
  return (
    <section className="pp-section-card">
      <div className="pp-section-header">
        <div className="pp-section-icon">
          {icon}
        </div>
        <h2 className="pp-section-title">{title}</h2>
      </div>
      <div className="pp-section-body">
        {children}
      </div>
    </section>
  );
}
