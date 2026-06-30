import { useState, useEffect } from "react";
import { useLoaderData, useFetcher, useNavigate, useSearchParams } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import db from "../db.server";
import { authenticate } from "../shopify.server";
import { PLANS, isDesignUnlocked, getRequiredPlanForDesign, isPlanUpgrade } from "../utils/billing";
import AnnouncementRenderer from "../components/AnnouncementRenderer";
import "../styles/dashboard.css";

// Direct imports of standard icons or simple emoji representations for premium minimal UI
const ICONS = {
  dashboard: "📊",
  campaigns: "📢",
  studio: "🎨",
  billing: "💳",
  guide: "⚙️",
  lock: "🔒",
  desktop: "💻",
  mobile: "📱",
  check: "✓",
  trash: "🗑️",
  plus: "＋",
  up: "↑",
  down: "↓"
};

const TEMPLATE_DESIGNS = [
  { type: "FREE", name: "Classic Clean", tier: "FREE", desc: "Minimalist elegant announcement bar.", thumbIcon: "➖", previewConfig: { designType: "FREE", text: "🛍️ Sale is Live Now", bgColor: "#181922", fontColor: "#ffffff" } },
  { type: "GRADIENT", name: "Gradient Flow", tier: "STARTER", desc: "Background shifting color flows.", thumbIcon: "🌈", previewConfig: { designType: "GRADIENT", text: "🛍️ Sale is Live Now", gradientColor1: "#6366f1", gradientColor2: "#ec4899", fontColor: "#ffffff" } },
  { type: "SLIDING", name: "Promo Cards", tier: "STARTER", desc: "Auto-rotating sliding card banners.", thumbIcon: "🔁", previewConfig: { designType: "SLIDING", cards: [{ text: "🛍️ Sale is Live Now" }, { text: "🛍️ Sale is Live Now" }], bgColor: "#181922", fontColor: "#ffffff", rotationTiming: 3 } },
  { type: "GLASSMORPHISM", name: "Glassmorphism", tier: "GROWTH", desc: "Translucent frosted blur banner.", thumbIcon: "🧊", previewConfig: { designType: "GLASSMORPHISM", text: "🛍️ Sale is Live Now", fontColor: "#ffffff" } },
  { type: "CAROUSEL", name: "Stacked Carousel", tier: "GROWTH", desc: "Overlay card stack transitions.", thumbIcon: "📚", previewConfig: { designType: "CAROUSEL", cards: [{ text: "🛍️ Sale is Live Now" }, { text: "🛍️ Sale is Live Now" }], bgColor: "#181922", fontColor: "#ffffff" } },
  { type: "LUXURY", name: "Luxury Motion", tier: "PREMIUM", desc: "Sleek animated neon border accents.", thumbIcon: "✨", previewConfig: { designType: "LUXURY", text: "🛍️ Sale is Live Now", gradientColor1: "#fbbf24", gradientColor2: "#f59e0b", bgColor: "#000", fontColor: "#ffffff" } },
  { type: "INTERACTIVE", name: "Smart Utility", tier: "PREMIUM", desc: "Urgency countdowns and CTA buttons.", thumbIcon: "⏱️", previewConfig: { designType: "INTERACTIVE", text: "🛍️ Sale is Live Now", buttonText: "Shop Now", gradientColor1: "#ef4444", bgColor: "#181922", fontColor: "#ffffff" } },
  { type: "DYNAMIC", name: "AI Dynamic", tier: "PREMIUM", desc: "Live shopper tickers and tags.", thumbIcon: "🤖", previewConfig: { designType: "DYNAMIC", text: "🛍️ Sale is Live Now", gradientColor1: "#a855f7", gradientColor2: "#6366f1", bgColor: "#12131a", fontColor: "#ffffff" } }
];

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Get or create ShopSettings
  let settings = await db.shopSettings.findUnique({ where: { shop } });
  if (!settings) {
    settings = await db.shopSettings.create({
      data: { shop, plan: PLANS.FREE, status: "ACTIVE" }
    });
  }

  // Fetch configs
  const configs = await db.announcementConfig.findMany({
    where: { shop },
    orderBy: { updatedAt: "desc" },
  });

  // Calculate 30d analytics
  const dateFilter = { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } };
  const events = await db.analyticsEvent.findMany({
    where: { shop, ...dateFilter },
    orderBy: { createdAt: "desc" },
  });

  let impressions = 0;
  let clicks = 0;
  let mobileClicks = 0;
  let desktopClicks = 0;
  let mobileImpressions = 0;
  let desktopImpressions = 0;
  const countryStats = {};
  const configStats = {};

  events.forEach((evt) => {
    const isImp = evt.eventType === "IMPRESSION";
    const isClick = evt.eventType === "CLICK";
    const isMobile = evt.deviceType === "MOBILE";

    if (isImp) {
      impressions++;
      if (isMobile) mobileImpressions++;
      else desktopImpressions++;
    } else if (isClick) {
      clicks++;
      if (isMobile) mobileClicks++;
      else desktopClicks++;
    }

    const cCode = evt.country || "UNKNOWN";
    if (!countryStats[cCode]) {
      countryStats[cCode] = { impressions: 0, clicks: 0 };
    }
    if (isImp) countryStats[cCode].impressions++;
    if (isClick) countryStats[cCode].clicks++;

    const cfgId = evt.configId;
    if (!configStats[cfgId]) {
      configStats[cfgId] = { impressions: 0, clicks: 0 };
    }
    if (isImp) configStats[cfgId].impressions++;
    if (isClick) configStats[cfgId].clicks++;
  });

  const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00";
  const estimatedSales = (clicks * 0.02 * 65).toFixed(2);

  const totalDeviceActions = impressions + clicks;
  const mobileCount = mobileImpressions + mobileClicks;
  const mobilePct = totalDeviceActions > 0 ? Math.round((mobileCount / totalDeviceActions) * 100) : 50;

  const topCountries = Object.keys(countryStats)
    .map((code) => {
      const stats = countryStats[code];
      return {
        country: code,
        impressions: stats.impressions,
        clicks: stats.clicks,
        ctr: stats.impressions > 0 ? parseFloat(((stats.clicks / stats.impressions) * 100).toFixed(2)) : 0,
      };
    })
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 5);

  const configMap = {};
  configs.forEach((c) => {
    configMap[c.id] = { name: c.name, type: c.designType };
  });

  const parsedConfigStats = Object.keys(configStats).map((cfgId) => {
    const stats = configStats[cfgId];
    const details = configMap[cfgId] || { name: "Deleted Campaign", type: "UNKNOWN" };
    return {
      id: cfgId,
      name: details.name,
      type: details.type,
      impressions: stats.impressions,
      clicks: stats.clicks,
      ctr: stats.impressions > 0 ? parseFloat(((stats.clicks / stats.impressions) * 100).toFixed(2)) : 0,
    };
  });

  return {
    shop,
    settings,
    configs,
    analytics: {
      summary: { impressions, clicks, ctr: parseFloat(ctr), estimatedSales: parseFloat(estimatedSales), deviceSplit: { mobile: mobilePct, desktop: 100 - mobilePct } },
      campaignStats: parsedConfigStats,
      topCountries,
      recentEvents: events.slice(0, 10).map((e) => ({
        id: e.id,
        configName: configMap[e.configId]?.name || "Announcement Bar",
        eventType: e.eventType,
        deviceType: e.deviceType,
        country: e.country,
        createdAt: e.createdAt,
      })),
    }
  };
};

export default function Index() {
  const { shop, settings, configs, analytics } = useLoaderData();
  const shopify = useAppBridge();
  const navigate = useNavigate();
  
  // Navigation Tabs State
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "dashboard";

  const setActiveTab = (tab) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", tab);
    setSearchParams(newParams, { preventScrollReset: true });
  };

  // Campaign configurations CRUD fetchers
  const configSaveFetcher = useFetcher();
  const toggleFetcher = useFetcher();
  const billingFetcher = useFetcher();

  // Current active plan
  const [currentPlan, setCurrentPlan] = useState(settings.plan || PLANS.FREE);

  // Edit / Create Studio State
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewViewport, setPreviewViewport] = useState("desktop");

  // Handle ESC key for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && previewTemplate) {
        setPreviewTemplate(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewTemplate]);

  const initialFormState = {
    id: "",
    name: "New Campaign",
    designType: "FREE",
    isActive: false,
    text: "🛍️ Sale is Live Now",
    heading: "",
    subheading: "",
    fontColor: "#FFFFFF",
    bgColor: "#090b11",
    gradientColor1: "#6366f1",
    gradientColor2: "#ec4899",
    buttonText: "Shop Now",
    buttonUrl: "/collections/all",
    buttonStyle: "solid",
    countdownDate: "",
    cards: [],
    borderRadius: 8,
    animationEnabled: true,
    mobileVisible: true,
    desktopVisible: true,
    rotationTiming: 4,
    badgeLabel: "",
    icon: "🔥",
    scheduledStart: "",
    scheduledEnd: "",
    targetCountries: "",
    priority: 0,
    targetProductId: "",
    targetVariantId: "",
  };

  const [formConfig, setFormConfig] = useState(initialFormState);
  const [editorCards, setEditorCards] = useState([]);
  const [viewportMode, setViewportMode] = useState("desktop");
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  const variantInfoFetcher = useFetcher();

  // Load configuration into studio editor
  const editCampaign = (cfg) => {
    let parsedCards = [];
    try {
      parsedCards = typeof cfg.cards === "string" ? JSON.parse(cfg.cards) : cfg.cards;
    } catch (e) {
      parsedCards = [];
    }

    setFormConfig({
      ...cfg,
      cards: parsedCards,
    });
    setEditorCards(parsedCards);
    setActiveTab("studio");
  };

  // Sync cards changes
  useEffect(() => {
    setFormConfig(prev => ({ ...prev, cards: editorCards }));
  }, [editorCards]);

  // Fetch variant info when targetVariantId changes
  useEffect(() => {
    if (formConfig.targetVariantId) {
      variantInfoFetcher.load(`/api/admin/variant-info?variantId=${encodeURIComponent(formConfig.targetVariantId)}`);
    } else {
      setSelectedProductInfo(null);
    }
  }, [formConfig.targetVariantId]);

  // Update selectedProductInfo when fetcher returns
  useEffect(() => {
    if (variantInfoFetcher.data && !variantInfoFetcher.data.error) {
      setSelectedProductInfo(variantInfoFetcher.data);
      setFormConfig((prev) => ({
        ...prev,
        targetInventory: variantInfoFetcher.data.inventoryQuantity
      }));
    } else if (variantInfoFetcher.data?.error) {
      shopify.toast.show(`Error: ${variantInfoFetcher.data.details || variantInfoFetcher.data.error}`);
      setSelectedProductInfo(null);
    }
  }, [variantInfoFetcher.data]);

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    setFormConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const hasRestrictedWords = (text) => {
    if (!text) return false;
    const restrictedRegex = /free shipping|visitors|purchased|viewing now|only.*left/i;
    return restrictedRegex.test(text);
  };

  const showFactualWarning = hasRestrictedWords(formConfig.text) || 
    (formConfig.cards && formConfig.cards.some(c => hasRestrictedWords(c.text) || hasRestrictedWords(c.heading) || hasRestrictedWords(c.subheading)));

  // Card Management
  const addEditorCard = () => {
    setEditorCards((prev) => [
      ...prev,
      { heading: "", text: "🛍️ Sale is Live Now", subheading: "" }
    ]);
  };

  const removeEditorCard = (idx) => {
    setEditorCards((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCardFieldChange = (idx, field, val) => {
    setEditorCards((prev) => prev.map((card, i) => i === idx ? { ...card, [field]: val } : card));
  };

  // Save/Submit Campaign
  const saveCampaign = () => {
    const isUnlocked = isDesignUnlocked(currentPlan, formConfig.designType);
    if (!isUnlocked) {
      shopify.toast.show(`Design is locked. Please upgrade to use the ${formConfig.designType} layout.`);
      setActiveTab("billing");
      return;
    }

    configSaveFetcher.submit(
      {
        ...formConfig,
        cards: JSON.stringify(formConfig.cards),
      },
      {
        method: "POST",
        action: "/api/admin/announcements",
        encType: "application/json"
      }
    );
  };

  // Toast Notification on Save Success
  useEffect(() => {
    if (configSaveFetcher.data?.success) {
      shopify.toast.show("Campaign configuration saved successfully!");
      // Reload is automatic due to React Router revalidation
      // Reset form or stay on editor
    } else if (configSaveFetcher.data?.error) {
      shopify.toast.show(`Error: ${configSaveFetcher.data.error}`);
    }
  }, [configSaveFetcher.data]);

  // Handle billing redirection or errors returned by the billing action
  useEffect(() => {
    if (billingFetcher.data?.redirectUrl) {
      const url = billingFetcher.data.redirectUrl;
      if (url.includes("plan_cancelled=true")) {
        shopify.toast.show("Successfully downgraded to Free Plan.");
        setCurrentPlan(PLANS.FREE);
        // Refresh page to sync remaining state from loader
        navigate("/app", { replace: true });
      } else if (url.startsWith("http://") || url.startsWith("https://")) {
        window.open(url, "_top");
      } else {
        navigate(url);
      }
    } else if (billingFetcher.data?.error) {
      shopify.toast.show(`Billing failed: ${billingFetcher.data.error}`);
    }
  }, [billingFetcher.data, navigate, shopify]);

  // Dedicated toggle handler to prevent conflicts with save operations
  useEffect(() => {
    if (toggleFetcher.data?.success) {
      if (toggleFetcher.data.action === "activated") {
        shopify.toast.show("Campaign activated — now live!");
        console.log("[MotionNotify] Toggle success — campaign is now ACTIVE");
      } else {
        shopify.toast.show("Campaign paused.");
        console.log("[MotionNotify] Toggle success — campaign PAUSED");
      }
    } else if (toggleFetcher.data?.error) {
      shopify.toast.show(`Failed to toggle: ${toggleFetcher.data.error}`);
      console.error("[MotionNotify] Toggle failed", toggleFetcher.data.error);
    }
  }, [toggleFetcher.data]);

  // Activate/Deactivate directly from Table
  const toggleCampaignActive = (cfg) => {
    const newStatus = !cfg.isActive;
    console.log(`[MotionNotify] Toggling campaign: ${cfg.id} → ${newStatus ? 'ACTIVE' : 'PAUSED'}`);
    
    toggleFetcher.submit(
      {
        id: cfg.id,
        isActive: newStatus,
      },
      {
        method: "POST",
        action: "/api/admin/announcements?action=toggle",
        encType: "application/json"
      }
    );
  };

  // Delete Campaign
  const deleteCampaign = (id) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      const formData = new FormData();
      formData.append("id", id);
      configSaveFetcher.submit(formData, {
        method: "POST",
        action: "/api/admin/announcements?action=delete"
      });
    }
  };

  // Billing submit handler
  const handleUpgrade = (plan) => {
    const formData = new FormData();
    formData.append("plan", plan);
    billingFetcher.submit(formData, {
      method: "POST",
      action: "/api/admin/billing",
    });
  };

  const isSelectedDesignLocked = !isDesignUnlocked(currentPlan, formConfig.designType);
  const requiredPlanForSelection = getRequiredPlanForDesign(formConfig.designType);

  return (
    <div className="mn-dashboard-wrapper">
      {/* Sidebar Navigation */}
      <aside className="mn-sidebar">
        <div className="mn-logo-area">
          <div className="mn-logo-icon">M</div>
          <span className="mn-logo-text">MotionNotify</span>
        </div>

        <nav>
          <ul className="mn-nav-list">
            <li className={`mn-nav-item ${activeTab === "dashboard" ? "active" : ""}`}>
              <button onClick={() => setActiveTab("dashboard")}>
                <span>{ICONS.dashboard}</span> Dashboard
              </button>
            </li>
            <li className={`mn-nav-item ${activeTab === "campaigns" ? "active" : ""}`}>
              <button onClick={() => setActiveTab("campaigns")}>
                <span>{ICONS.campaigns}</span> Campaigns
              </button>
            </li>
            <li className={`mn-nav-item ${activeTab === "studio" ? "active" : ""}`}>
              <button onClick={() => {
                setFormConfig(initialFormState);
                setEditorCards([]);
                setActiveTab("studio");
              }}>
                <span>{ICONS.studio}</span> Design Studio
              </button>
            </li>
            <li className={`mn-nav-item ${activeTab === "billing" ? "active" : ""}`}>
              <button onClick={() => setActiveTab("billing")}>
                <span>{ICONS.billing}</span> Subscriptions
              </button>
            </li>
            <li className={`mn-nav-item ${activeTab === "guide" ? "active" : ""}`}>
              <button onClick={() => setActiveTab("guide")}>
                <span>{ICONS.guide}</span> Setup Guide
              </button>
            </li>
          </ul>
        </nav>

        <div className="mn-sidebar-footer">
          <div className="mn-shop-badge" title={shop}>{shop}</div>
          <div className="mn-plan-pill">{currentPlan} Plan</div>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="mn-main-content">
        {/* TAB: DASHBOARD OVERVIEW */}
        <div className={`mn-tab-content ${activeTab === "dashboard" ? "active" : ""}`}>
          <div className="mn-page-header">
            <h1 className="mn-page-title">Welcome to MotionNotify</h1>
            <p className="mn-page-subtitle">Track your storefront conversion and active campaign performance metrics.</p>
          </div>

          {/* Stats Summary */}
          <div className="mn-stats-grid">
            <div className="mn-stat-card stat-impressions">
              <div className="mn-stat-label">Storefront Views</div>
              <div className="mn-stat-value">{analytics.summary.impressions.toLocaleString()}</div>
              <div className="mn-stat-change">↑ Active tracking</div>
            </div>
            <div className="mn-stat-card stat-clicks">
              <div className="mn-stat-label">CTA Clicks</div>
              <div className="mn-stat-value">{analytics.summary.clicks.toLocaleString()}</div>
              <div className="mn-stat-change">↑ User interactions</div>
            </div>
            <div className="mn-stat-card stat-ctr">
              <div className="mn-stat-label">Click-through Rate</div>
              <div className="mn-stat-value">{analytics.summary.ctr}%</div>
              <div className="mn-stat-change">Conversion efficiency</div>
            </div>
            <div className="mn-stat-card stat-revenue">
              <div className="mn-stat-label">Sales Influence Est.</div>
              <div className="mn-stat-value">${analytics.summary.estimatedSales.toLocaleString()}</div>
              <div className="mn-stat-change">2% Click conversion</div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: "24px" }}>
            {/* Active campaigns list */}
            <div>
              <div className="mn-page-header" style={{ marginBottom: "16px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700 }}>Quick Campaigns Status</h2>
              </div>
              
              {configs.length > 0 ? (
                <div className="mn-table-wrapper">
                  <table className="mn-table">
                    <thead>
                      <tr>
                        <th>Campaign Name</th>
                        <th>Design</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configs.slice(0, 3).map((cfg) => (
                        <tr key={cfg.id}>
                          <td><strong>{cfg.name}</strong></td>
                          <td><span className="mn-plan-pill" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-primary)" }}>{cfg.designType}</span></td>
                          <td>
                            <span className={`mn-status-tag ${cfg.isActive ? "active" : "inactive"}`}>
                              {cfg.isActive ? "Live" : "Paused"}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="mn-action-btn" 
                              style={{ padding: "6px 12px", fontSize: "11px", background: cfg.isActive ? "transparent" : undefined, border: cfg.isActive ? "1px solid var(--border-color)" : undefined, color: cfg.isActive ? "var(--text-secondary)" : undefined }}
                              onClick={() => toggleCampaignActive(cfg)}
                            >
                              {cfg.isActive ? "Pause" : "Go Live"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="mn-empty-state">
                  <div className="mn-empty-icon">📢</div>
                  <h3 className="mn-empty-title">No campaigns yet</h3>
                  <p className="mn-empty-subtitle">Launch your first premium announcement campaign today!</p>
                  <button className="mn-action-btn" onClick={() => setActiveTab("studio")}>Create Campaign</button>
                </div>
              )}
            </div>

            {/* Mobile / Desktop split & Top countries */}
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              <div className="mn-stat-card" style={{ padding: "20px" }}>
                <div className="mn-stat-label">Device Interaction Split</div>
                <div style={{ display: "flex", gap: "10px", margin: "16px 0", height: "12px", borderRadius: "6px", overflow: "hidden" }}>
                  <div style={{ width: `${analytics.summary.deviceSplit.mobile}%`, background: "var(--accent-color)" }} />
                  <div style={{ width: `${analytics.summary.deviceSplit.desktop}%`, background: "#10b981" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)" }}>
                  <span>📱 Mobile ({analytics.summary.deviceSplit.mobile}%)</span>
                  <span>💻 Desktop ({analytics.summary.deviceSplit.desktop}%)</span>
                </div>
              </div>

              <div className="mn-stat-card" style={{ padding: "20px" }}>
                <div className="mn-stat-label">Top conversion locations</div>
                {analytics.topCountries.length > 0 ? (
                  <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0 0", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                    {analytics.topCountries.map((c, i) => (
                      <li key={i} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border-color)", paddingBottom: "4px" }}>
                        <span>📍 {c.country}</span>
                        <strong>{c.clicks} clicks ({c.ctr}%)</strong>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "12px" }}>No geo-tracking details available yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TAB: CAMPAIGNS MANAGER LIST */}
        <div className={`mn-tab-content ${activeTab === "campaigns" ? "active" : ""}`}>
          <div className="mn-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 className="mn-page-title">Your Campaigns</h1>
              <p className="mn-page-subtitle">Manage, duplicate, or delete your existing announcement campaigns.</p>
            </div>
            <button className="mn-action-btn" onClick={() => {
              setFormConfig(initialFormState);
              setEditorCards([]);
              setActiveTab("studio");
            }}>
              Create Campaign
            </button>
          </div>

          {configs.length > 0 ? (
            <div className="mn-table-wrapper">
              <table className="mn-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Type</th>
                    <th>Visibility</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {configs.map((cfg) => (
                    <tr key={cfg.id}>
                      <td>
                        <strong>{cfg.name}</strong>
                      </td>
                      <td>
                        <span className="mn-plan-pill" style={{ background: "rgba(255,255,255,0.06)", color: "var(--text-primary)" }}>{cfg.designType}</span>
                      </td>
                      <td>
                        {cfg.desktopVisible && "💻"} {cfg.mobileVisible && "📱"}
                      </td>
                      <td>{cfg.priority}</td>
                      <td>
                        <span className={`mn-status-tag ${cfg.isActive ? "active" : "inactive"}`}>
                          {cfg.isActive ? "Live" : "Paused"}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button 
                            className="mn-action-btn" 
                            style={{ padding: "6px 12px", fontSize: "12px", background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                            onClick={() => editCampaign(cfg)}
                          >
                            Edit
                          </button>
                          <button 
                            className="mn-action-btn" 
                            style={{ padding: "6px 12px", fontSize: "12px", background: cfg.isActive ? "transparent" : undefined, border: cfg.isActive ? "1px solid var(--border-color)" : undefined, color: cfg.isActive ? "var(--text-secondary)" : undefined }}
                            onClick={() => toggleCampaignActive(cfg)}
                          >
                            {cfg.isActive ? "Pause" : "Activate"}
                          </button>
                          <button 
                            className="mn-action-btn" 
                            style={{ padding: "6px 12px", fontSize: "12px", background: "rgba(239, 68, 68, 0.1)", border: "none", color: "#ef4444" }}
                            onClick={() => deleteCampaign(cfg.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mn-empty-state">
              <div className="mn-empty-icon">📢</div>
              <h3 className="mn-empty-title">No campaigns configured</h3>
              <p className="mn-empty-subtitle">Setup campaigns to boost storefront engagement and visual alerts.</p>
              <button className="mn-action-btn" onClick={() => setActiveTab("studio")}>Create Campaign</button>
            </div>
          )}
        </div>

        {/* TAB: DESIGN STUDIO (EDITOR) */}
        <div className={`mn-tab-content ${activeTab === "studio" ? "active" : ""}`}>
          <div className="mn-page-header">
            <h1 className="mn-page-title">{formConfig.id ? "Edit Campaign" : "Design Studio"}</h1>
            <p className="mn-page-subtitle">Configure beautiful custom rotating banners and urgency countdown timers.</p>
          </div>

          <div className="mn-studio-grid">
            {/* Editor Input Controls */}
            <div className="mn-editor-panel">
              <div className="mn-form-group">
                <label className="mn-form-label">Campaign Reference Name (UPDATED)</label>
                <input 
                  type="text" 
                  className="mn-input-text" 
                  value={formConfig.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g. Black Friday Sale" 
                />
              </div>

              {/* Design Type Template Selection */}
              <div className="mn-form-group">
                <label className="mn-form-label">Select Announcement Template</label>
                <div className="mn-templates-grid">
                  {TEMPLATE_DESIGNS.map((tmpl) => {
                    const isLocked = !isDesignUnlocked(currentPlan, tmpl.type);
                    return (
                      <div 
                        key={tmpl.type} 
                        className={`mn-template-select-card ${formConfig.designType === tmpl.type ? "active" : ""}`}
                        onClick={() => handleInputChange("designType", tmpl.type)}
                      >
                        <div className="mn-template-thumb">
                           {tmpl.thumbIcon && <div style={{ fontSize: "24px", textAlign: "center", lineHeight: "48px" }}>{tmpl.thumbIcon}</div>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div className="mn-template-name">{tmpl.name}</div>
                            <span className={`mn-template-tier-badge ${tmpl.tier.toLowerCase()}`}>{tmpl.tier}</span>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>{tmpl.desc}</div>
                        </div>
                        <div className="mn-template-actions">
                          <button 
                            type="button"
                            className="mn-btn-preview" 
                            onClick={(e) => { e.stopPropagation(); setPreviewTemplate(tmpl); }}
                          >
                            👁 Preview
                          </button>
                          {isLocked ? (
                            <button 
                              type="button"
                              className="mn-btn-upgrade" 
                              onClick={(e) => { e.stopPropagation(); setActiveTab("billing"); }}
                            >
                              🔒 Upgrade
                            </button>
                          ) : (
                            <button 
                              type="button"
                              className="mn-btn-use" 
                              onClick={(e) => { e.stopPropagation(); handleInputChange("designType", tmpl.type); }}
                            >
                              Use Template
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr style={{ borderColor: "var(--border-color)", margin: "24px 0" }} />

              {/* ─── PRODUCT TARGETING (INVENTORY & DISCOUNT) ─── */}
              <div className="mn-form-group" style={{ 
                background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(168,85,247,0.08))", 
                border: "1px solid rgba(99,102,241,0.2)", 
                borderRadius: "12px", 
                padding: "20px" 
              }}>
                <label className="mn-form-label" style={{ fontSize: "14px", fontWeight: "700", marginBottom: "6px" }}>
                  📦 Product Inventory Targeting
                </label>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "0 0 16px 0", lineHeight: "1.5" }}>
                  Link a product to this campaign. Use <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{`{inventory}`}</code> and <code style={{ background: "rgba(255,255,255,0.1)", padding: "2px 6px", borderRadius: "4px" }}>{`{discount}`}</code> in your text above to display live values on <strong>any page</strong>.
                </p>

                <div style={{ display: "flex", gap: "12px", alignItems: "flex-start", flexWrap: "wrap" }}>
                  <button 
                    type="button" 
                    className="mn-action-btn"
                    style={{ 
                      background: "linear-gradient(135deg, #6366f1, #a855f7)", 
                      border: "none", 
                      padding: "10px 20px", 
                      fontWeight: "600",
                      fontSize: "13px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      color: "#fff"
                    }}
                    onClick={async () => {
                      try {
                        const selected = await shopify.resourcePicker({
                          type: 'product',
                          action: 'select',
                          multiple: false,
                          filter: { variants: true }
                        });
                        
                        if (selected && selected.length > 0) {
                          const product = selected[0];
                          const variant = product.variants[0];
                          
                          setFormConfig(prev => ({
                            ...prev,
                            targetProductId: product.id,
                            targetVariantId: variant.id,
                            targetInventory: variant.inventoryQuantity
                          }));
                          
                          setSelectedProductInfo({
                            productTitle: product.title,
                            variantTitle: variant.title,
                            price: variant.price,
                            imageUrl: (product.images && product.images[0]?.originalSrc) || null,
                            inventoryQuantity: variant.inventoryQuantity,
                            inventoryTracked: true
                          });
                          
                          shopify.toast.show(`Linked: ${product.title} — ${variant.title}`);
                        }
                      } catch(e) {
                        console.error("Resource picker cancelled or failed:", e);
                      }
                    }}
                  >
                    🎯 Select Product
                  </button>

                  {formConfig.targetVariantId && (
                    <button 
                      type="button" 
                      className="mn-action-btn"
                      style={{ background: "transparent", color: "#ef4444", border: "1px solid rgba(239,68,68,0.4)", padding: "10px 16px", fontSize: "12px", borderRadius: "8px" }}
                      onClick={() => {
                        setFormConfig(prev => ({ ...prev, targetProductId: "", targetVariantId: "" }));
                        setSelectedProductInfo(null);
                      }}
                    >
                      ✕ Remove Link
                    </button>
                  )}
                </div>

                {/* Selected Product Info Card */}
                {(selectedProductInfo || formConfig.targetVariantId) && (
                  <div style={{ 
                    marginTop: "16px", 
                    background: "rgba(0,0,0,0.2)", 
                    border: "1px solid var(--border-color)", 
                    borderRadius: "10px", 
                    padding: "16px",
                    display: "flex",
                    gap: "16px",
                    alignItems: "center"
                  }}>
                    {/* Product Image */}
                    <div style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "rgba(255,255,255,0.05)",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {selectedProductInfo?.imageUrl ? (
                        <img src={selectedProductInfo.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <span style={{ fontSize: "28px" }}>📦</span>
                      )}
                    </div>

                    {/* Product Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: "700", fontSize: "14px", color: "var(--text-primary)", marginBottom: "4px" }}>
                        {selectedProductInfo?.productTitle || "Product"}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                        Variant: {selectedProductInfo?.variantTitle || "Default"}
                        {selectedProductInfo?.price && ` · $${selectedProductInfo.price}`}
                      </div>
                      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {/* Inventory Badge */}
                        <div style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          fontWeight: "600",
                          background: selectedProductInfo?.inventoryTracked === false 
                            ? "rgba(245,158,11,0.15)" 
                            : selectedProductInfo?.inventoryQuantity !== null && selectedProductInfo?.inventoryQuantity !== undefined
                              ? selectedProductInfo.inventoryQuantity > 10 
                                ? "rgba(16,185,129,0.15)" 
                                : selectedProductInfo.inventoryQuantity > 0 
                                  ? "rgba(245,158,11,0.15)" 
                                  : "rgba(239,68,68,0.15)"
                              : "rgba(99,102,241,0.15)",
                          color: selectedProductInfo?.inventoryTracked === false
                            ? "#f59e0b"
                            : selectedProductInfo?.inventoryQuantity !== null && selectedProductInfo?.inventoryQuantity !== undefined
                              ? selectedProductInfo.inventoryQuantity > 10 
                                ? "#10b981" 
                                : selectedProductInfo.inventoryQuantity > 0 
                                  ? "#f59e0b" 
                                  : "#ef4444"
                              : "#6366f1"
                        }}>
                          {selectedProductInfo?.inventoryTracked === false 
                            ? "⚠️ Tracking Disabled"
                            : selectedProductInfo?.inventoryQuantity !== null && selectedProductInfo?.inventoryQuantity !== undefined
                              ? `📊 Inventory: ${selectedProductInfo.inventoryQuantity}`
                              : variantInfoFetcher.data?.error 
                                ? "⚠️ Error fetching inventory"
                                : variantInfoFetcher.state === "loading"
                                  ? "⏳ Loading..."
                                  : "📊 Inventory Unavailable"
                          }
                        </div>

                        {/* Discount Badge */}
                        {selectedProductInfo?.compareAtPrice && selectedProductInfo?.price && 
                          parseFloat(selectedProductInfo.compareAtPrice) > parseFloat(selectedProductInfo.price) && (
                          <div style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "4px 10px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "600",
                            background: "rgba(168,85,247,0.15)",
                            color: "#a855f7"
                          }}>
                            🏷️ {Math.round(((parseFloat(selectedProductInfo.compareAtPrice) - parseFloat(selectedProductInfo.price)) / parseFloat(selectedProductInfo.compareAtPrice)) * 100)}% OFF
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {!formConfig.targetVariantId && (
                  <div style={{ 
                    marginTop: "12px", 
                    padding: "16px", 
                    border: "1px dashed rgba(99,102,241,0.3)", 
                    borderRadius: "10px", 
                    textAlign: "center", 
                    color: "var(--text-secondary)", 
                    fontSize: "13px" 
                  }}>
                    No product linked. Campaign will show on all pages without inventory data.
                  </div>
                )}
              </div>

              <hr style={{ borderColor: "var(--border-color)", margin: "24px 0" }} />

              <div className="mn-form-group" style={{ marginBottom: "20px", padding: "12px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.4)", borderRadius: "8px", color: "var(--text-primary)", fontSize: "13px" }}>
                <strong>⚠️ Compliance Note:</strong> Only display factual information. Do not use announcements that claim free shipping, discounts, inventory levels, purchases, or visitor counts unless they are backed by actual store data.
              </div>

              {showFactualWarning && (
                <div className="mn-form-group" style={{ marginBottom: "20px", padding: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "8px", color: "#ef4444", fontSize: "13px" }}>
                  This announcement contains factual claims. Ensure the information is accurate and supported by your store data.
                </div>
              )}

              {/* Text, Heading and Subheading controls */}
              {formConfig.designType !== "SLIDING" && formConfig.designType !== "CAROUSEL" ? (
                <>
                  <div className="mn-form-group">
                    <label className="mn-form-label">Banner Alert Text</label>
                    <input 
                      type="text" 
                      className="mn-input-text" 
                      value={formConfig.text}
                      onChange={(e) => handleInputChange("text", e.target.value)}
                    />
                  </div>
                  <div className="mn-form-group">
                    <div className="mn-row-grid">
                      <div>
                        <label className="mn-form-label">Heading (Optional)</label>
                        <input 
                          type="text" 
                          className="mn-input-text" 
                          value={formConfig.heading}
                          onChange={(e) => handleInputChange("heading", e.target.value)}
                          placeholder="e.g. FLASH SALE"
                        />
                      </div>
                      <div>
                        <label className="mn-form-label">Subheading (Optional)</label>
                        <input 
                          type="text" 
                          className="mn-input-text" 
                          value={formConfig.subheading}
                          onChange={(e) => handleInputChange("subheading", e.target.value)}
                          placeholder="e.g. Limited stock"
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* Card List Multi Manager for rotating sliding views */
                <div className="mn-form-group">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <label className="mn-form-label" style={{ margin: 0 }}>Configure Sliding/Carousel Cards</label>
                    <button className="mn-action-btn" style={{ padding: "6px 12px", fontSize: "11px" }} onClick={addEditorCard}>
                      {ICONS.plus} Add Card
                    </button>
                  </div>
                  
                  {editorCards.length > 0 ? (
                    editorCards.map((card, idx) => (
                      <div key={idx} className="mn-card-manager-item">
                        <button className="mn-card-manager-delete" onClick={() => removeEditorCard(idx)}>Remove</button>
                        <div style={{ fontSize: "11px", fontWeight: "bold", color: "var(--accent-color)" }}>CARD #{idx + 1}</div>
                        <input 
                          type="text" 
                          className="mn-input-text" 
                          style={{ padding: "6px 10px" }}
                          value={card.heading || ""} 
                          onChange={(e) => handleCardFieldChange(idx, "heading", e.target.value)}
                          placeholder="Card Heading (e.g. NEW RELEASE)"
                        />
                        <input 
                          type="text" 
                          className="mn-input-text" 
                          style={{ padding: "6px 10px" }}
                          value={card.text || ""} 
                          onChange={(e) => handleCardFieldChange(idx, "text", e.target.value)}
                          placeholder="Card Main Text Alert"
                          required
                        />
                        <input 
                          type="text" 
                          className="mn-input-text" 
                          style={{ padding: "6px 10px" }}
                          value={card.subheading || ""} 
                          onChange={(e) => handleCardFieldChange(idx, "subheading", e.target.value)}
                          placeholder="Card Subheading (Optional)"
                        />
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: "13px", color: "var(--text-secondary)", textAlign: "center", padding: "16px", border: "1px dashed var(--border-color)", borderRadius: "8px" }}>
                      No cards created. Click "+ Add Card" to add slides to rotation.
                    </div>
                  )}

                  <div className="mn-form-group" style={{ marginTop: "16px" }}>
                    <label className="mn-form-label">Auto Rotation Delay (seconds)</label>
                    <input 
                      type="number" 
                      className="mn-input-text" 
                      min="2" 
                      max="15"
                      value={formConfig.rotationTiming}
                      onChange={(e) => handleInputChange("rotationTiming", e.target.value)}
                    />
                  </div>
                </div>
              )}



              <hr style={{ borderColor: "var(--border-color)", margin: "24px 0" }} />

              {/* Theme custom colors */}
              <div className="mn-form-group">
                <div className="mn-row-grid">
                  <div>
                    <label className="mn-form-label">Font / Text Color</label>
                    <div className="mn-color-picker-wrapper">
                      <div className="mn-color-dot" style={{ backgroundColor: formConfig.fontColor }}>
                        <input 
                          type="color" 
                          value={formConfig.fontColor} 
                          onChange={(e) => handleInputChange("fontColor", e.target.value)} 
                        />
                      </div>
                      <span style={{ fontSize: "13px" }}>{formConfig.fontColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="mn-form-label">Background Color</label>
                    <div className="mn-color-picker-wrapper">
                      <div className="mn-color-dot" style={{ backgroundColor: formConfig.bgColor }}>
                        <input 
                          type="color" 
                          value={formConfig.bgColor} 
                          onChange={(e) => handleInputChange("bgColor", e.target.value)} 
                        />
                      </div>
                      <span style={{ fontSize: "13px" }}>{formConfig.bgColor}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gradient colors (visible for gradient banner, luxury or dynamic) */}
              {(formConfig.designType === "GRADIENT" || formConfig.designType === "LUXURY" || formConfig.designType === "DYNAMIC") && (
                <div className="mn-form-group">
                  <div className="mn-row-grid">
                    <div>
                      <label className="mn-form-label">Gradient Flow Color 1</label>
                      <div className="mn-color-picker-wrapper">
                        <div className="mn-color-dot" style={{ backgroundColor: formConfig.gradientColor1 }}>
                          <input 
                            type="color" 
                            value={formConfig.gradientColor1} 
                            onChange={(e) => handleInputChange("gradientColor1", e.target.value)} 
                          />
                        </div>
                        <span style={{ fontSize: "13px" }}>{formConfig.gradientColor1}</span>
                      </div>
                    </div>
                    <div>
                      <label className="mn-form-label">Gradient Flow Color 2</label>
                      <div className="mn-color-picker-wrapper">
                        <div className="mn-color-dot" style={{ backgroundColor: formConfig.gradientColor2 }}>
                          <input 
                            type="color" 
                            value={formConfig.gradientColor2} 
                            onChange={(e) => handleInputChange("gradientColor2", e.target.value)} 
                          />
                        </div>
                        <span style={{ fontSize: "13px" }}>{formConfig.gradientColor2}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button configurations */}
              <div className="mn-form-group">
                <div className="mn-row-grid">
                  <div>
                    <label className="mn-form-label">Button CTA Text</label>
                    <input 
                      type="text" 
                      className="mn-input-text" 
                      value={formConfig.buttonText}
                      onChange={(e) => handleInputChange("buttonText", e.target.value)}
                      placeholder="e.g. GET OFFER"
                    />
                  </div>
                  <div>
                    <label className="mn-form-label">Button Target Link URL</label>
                    <input 
                      type="text" 
                      className="mn-input-text" 
                      value={formConfig.buttonUrl}
                      onChange={(e) => handleInputChange("buttonUrl", e.target.value)}
                      placeholder="e.g. /collections/clearance"
                    />
                  </div>
                </div>
              </div>

              {formConfig.buttonText && (
                <div className="mn-form-group">
                  <label className="mn-form-label">CTA Button Style</label>
                  <select 
                    className="mn-input-text"
                    value={formConfig.buttonStyle}
                    onChange={(e) => handleInputChange("buttonStyle", e.target.value)}
                  >
                    <option value="solid">Solid (Inverted Theme Color)</option>
                    <option value="outline">Outline Border</option>
                    <option value="glass">Glass Translucent</option>
                  </select>
                </div>
              )}

              <hr style={{ borderColor: "var(--border-color)", margin: "24px 0" }} />

              {/* Urgency countdown timer date (Interactive or Dynamic) */}
              {(formConfig.designType === "INTERACTIVE" || formConfig.designType === "DYNAMIC") && (
                <div className="mn-form-group">
                  <label className="mn-form-label">Countdown Expiry Date &amp; Time (ISO/Local String)</label>
                  <input 
                    type="datetime-local" 
                    className="mn-input-text"
                    value={formConfig.countdownDate}
                    onChange={(e) => handleInputChange("countdownDate", e.target.value)}
                  />
                  <small style={{ color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
                    Leaves blank to disable countdown clock.
                  </small>
                </div>
              )}

              {/* Campaign target schedule */}
              <div className="mn-form-group">
                <div className="mn-row-grid">
                  <div>
                    <label className="mn-form-label">Scheduled Start Date &amp; Time</label>
                    <input 
                      type="datetime-local" 
                      className="mn-input-text"
                      value={formConfig.scheduledStart}
                      onChange={(e) => handleInputChange("scheduledStart", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="mn-form-label">Scheduled End Date &amp; Time</label>
                    <input 
                      type="datetime-local" 
                      className="mn-input-text"
                      value={formConfig.scheduledEnd}
                      onChange={(e) => handleInputChange("scheduledEnd", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Target countries, badges and priority */}
              <div className="mn-form-group">
                <div className="mn-row-grid">
                  <div>
                    <label className="mn-form-label">Country Target (comma-separated, ISO codes)</label>
                    <input 
                      type="text" 
                      className="mn-input-text"
                      value={formConfig.targetCountries}
                      onChange={(e) => handleInputChange("targetCountries", e.target.value)}
                      placeholder="e.g. US, CA, GB"
                    />
                  </div>
                  <div>
                    <label className="mn-form-label">Campaign Priority Score</label>
                    <input 
                      type="number" 
                      className="mn-input-text"
                      value={formConfig.priority}
                      onChange={(e) => handleInputChange("priority", e.target.value)}
                      placeholder="Higher value renders first"
                    />
                  </div>
                </div>
              </div>

              {/* Badge & Icon */}
              <div className="mn-form-group">
                <div className="mn-row-grid">
                  <div>
                    <label className="mn-form-label">Badge Label Text (Optional)</label>
                    <input 
                      type="text" 
                      className="mn-input-text"
                      value={formConfig.badgeLabel}
                      onChange={(e) => handleInputChange("badgeLabel", e.target.value)}
                      placeholder="e.g. NEW"
                    />
                  </div>
                  <div>
                    <label className="mn-form-label">Prefix Emoji Icon (Optional)</label>
                    <input 
                      type="text" 
                      className="mn-input-text"
                      value={formConfig.icon}
                      onChange={(e) => handleInputChange("icon", e.target.value)}
                      placeholder="e.g. 🔥"
                    />
                  </div>
                </div>
              </div>

              {/* Device Visibility Rules */}
              <div className="mn-form-group">
                <label className="mn-form-label">Device Visibility</label>
                <div style={{ display: "flex", gap: "20px" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={formConfig.desktopVisible}
                      onChange={(e) => handleInputChange("desktopVisible", e.target.checked)} 
                    />
                    Show on Desktop 💻
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={formConfig.mobileVisible}
                      onChange={(e) => handleInputChange("mobileVisible", e.target.checked)} 
                    />
                    Show on Mobile 📱
                  </label>
                </div>
              </div>

              {/* Border Radius */}
              <div className="mn-form-group">
                <label className="mn-form-label">Border Corner Radius ({formConfig.borderRadius}px)</label>
                <input 
                  type="range" 
                  min="0" 
                  max="24"
                  className="mn-input-text"
                  style={{ padding: 0 }}
                  value={formConfig.borderRadius}
                  onChange={(e) => handleInputChange("borderRadius", e.target.value)}
                />
              </div>

              {/* Active Toggle */}
              <div className="mn-form-group">
                <label style={{ display: "inline-flex", alignItems: "center", gap: "10px", fontSize: "14px", fontWeight: "bold", cursor: "pointer" }}>
                  <input 
                    type="checkbox" 
                    checked={formConfig.isActive}
                    onChange={(e) => handleInputChange("isActive", e.target.checked)} 
                  />
                  Set this Campaign Live immediately on save
                </label>
              </div>

              {/* Save Controls */}
              <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
                <button 
                  className="mn-action-btn" 
                  style={{ flexGrow: 1 }}
                  onClick={saveCampaign}
                  disabled={configSaveFetcher.state === "submitting"}
                >
                  {configSaveFetcher.state === "submitting" ? "Saving..." : "Save Campaign Configuration"}
                </button>
                <button 
                  className="mn-action-btn" 
                  style={{ background: "transparent", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}
                  onClick={() => setActiveTab("campaigns")}
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Live Editor Side Preview Frame */}
            <div className="mn-preview-panel">
              <div className="mn-preview-controls">
                <span style={{ fontSize: "14px", fontWeight: "bold" }}>Real-time Live Preview</span>
                
                <div className="mn-viewport-switchers">
                  <button 
                    className={`mn-viewport-btn ${viewportMode === "desktop" ? "active" : ""}`}
                    onClick={() => setViewportMode("desktop")}
                  >
                    {ICONS.desktop} Desktop
                  </button>
                  <button 
                    className={`mn-viewport-btn ${viewportMode === "mobile" ? "active" : ""}`}
                    onClick={() => setViewportMode("mobile")}
                  >
                    {ICONS.mobile} Mobile
                  </button>
                </div>
              </div>

              <div className={`mn-preview-frame-wrapper ${viewportMode === "mobile" ? "mobile-view" : ""}`}>
                {/* Locked overlay screen */}
                {isSelectedDesignLocked && (
                  <div className="mn-locked-overlay">
                    <div className="mn-locked-card">
                      <div style={{ fontSize: "28px", marginBottom: "12px" }}>{ICONS.lock}</div>
                      <div className="mn-locked-title">Locked Template</div>
                      <div className="mn-locked-text">
                        The <strong>{formConfig.designType}</strong> style requires the <strong>{requiredPlanForSelection}</strong> subscription.
                      </div>
                      <button className="mn-action-btn mn-pricing-cta" onClick={() => setActiveTab("billing")}>
                        Upgrade to Unlock
                      </button>
                    </div>
                  </div>
                )}
                
                <AnnouncementRenderer config={formConfig} />
              </div>

              <div style={{ marginTop: "16px", fontSize: "12px", color: "var(--text-secondary)", textAlign: "center" }}>
                Interactive components like carousels and ticking logs animate continuously inside preview.
              </div>
            </div>
          </div>
        </div>

        {/* TAB: PRICING & SUBSCRIPTIONS */}
        <div className={`mn-tab-content ${activeTab === "billing" ? "active" : ""}`}>
          <div className="mn-page-header">
            <h1 className="mn-page-title">SaaS Pricing Subscriptions</h1>
            <p className="mn-page-subtitle">Upgrade to unlock dynamic animations, glassmorphism templates, and countdown tools.</p>
          </div>

          <div className="mn-pricing-grid">
            {/* FREE Plan Card */}
            <div className={`mn-pricing-card ${currentPlan === PLANS.FREE ? "current" : ""}`}>
              <div className="mn-pricing-name">Free Tier</div>
              <div className="mn-pricing-price">$0<span>/month</span></div>
              <ul className="mn-pricing-features">
                <li>1 Classic Clean Banner Design</li>
                <li>Custom font and backgrounds</li>
                <li>Storefront priority ordering</li>
                <li>Basic impressions tracking</li>
              </ul>
              <button 
                className="mn-action-btn mn-pricing-cta" 
                style={{ background: currentPlan === PLANS.FREE ? "#4b5563" : "transparent", border: "1px solid var(--border-color)", color: currentPlan === PLANS.FREE ? "#9ca3af" : "#fff" }}
                disabled={currentPlan === PLANS.FREE || billingFetcher.state === "submitting"}
                onClick={() => handleUpgrade(PLANS.FREE)}
              >
                {currentPlan === PLANS.FREE ? "Active Plan" : billingFetcher.state === "submitting" ? "Processing..." : "Downgrade to Free"}
              </button>
            </div>

            {/* STARTER Plan Card */}
            <div className={`mn-pricing-card ${currentPlan === PLANS.STARTER ? "current" : ""}`}>
              <div className="mn-pricing-name">Starter Tier</div>
              <div className="mn-pricing-price">$50<span>/month</span></div>
              <ul className="mn-pricing-features">
                <li>Includes all Free designs</li>
                <li><strong>2 Premium Designs</strong>:</li>
                <li>Animated Gradient Flows</li>
                <li>Sliding Promotional Cards</li>
                <li>Unlimited Active Impressions</li>
              </ul>
              <button 
                className="mn-action-btn mn-pricing-cta"
                disabled={currentPlan === PLANS.STARTER || billingFetcher.state === "submitting"}
                onClick={() => handleUpgrade(PLANS.STARTER)}
              >
                {currentPlan === PLANS.STARTER ? "Active Plan" : billingFetcher.state === "submitting" ? "Processing..." : isPlanUpgrade(currentPlan, PLANS.STARTER) ? "Upgrade to Starter" : "Downgrade to Starter"}
              </button>
            </div>

            {/* GROWTH Plan Card */}
            <div className={`mn-pricing-card ${currentPlan === PLANS.GROWTH ? "current" : "popular"}`}>
              <div className="mn-pricing-name">Growth Tier</div>
              <div className="mn-pricing-price">$70<span>/month</span></div>
              <ul className="mn-pricing-features">
                <li>Includes Starter features</li>
                <li><strong>2 More Premium Designs</strong>:</li>
                <li>Floating Glassmorphism</li>
                <li>Stacked Multi-Card Carousel</li>
                <li>Advanced Country Geo targeting</li>
              </ul>
              <button 
                className="mn-action-btn mn-pricing-cta"
                disabled={currentPlan === PLANS.GROWTH || billingFetcher.state === "submitting"}
                onClick={() => handleUpgrade(PLANS.GROWTH)}
              >
                {currentPlan === PLANS.GROWTH ? "Active Plan" : billingFetcher.state === "submitting" ? "Processing..." : isPlanUpgrade(currentPlan, PLANS.GROWTH) ? "Upgrade to Growth" : "Downgrade to Growth"}
              </button>
            </div>

            {/* PREMIUM Plan Card */}
            <div className={`mn-pricing-card ${currentPlan === PLANS.PREMIUM ? "current" : ""}`}>
              <div className="mn-pricing-name">Enterprise Premium</div>
              <div className="mn-pricing-price">$100<span>/month</span></div>
              <ul className="mn-pricing-features">
                <li>Includes all designs (7 total)</li>
                <li><strong>Final 2 Luxury Designs + Bonus</strong>:</li>
                <li>Luxury Glowing Border Motion</li>
                <li>Urgency Countdown Banners</li>
                <li>AI Ticker Dynamic Banner</li>
                <li>Unlimited tracking options</li>
              </ul>
              <button 
                className="mn-action-btn mn-pricing-cta"
                disabled={currentPlan === PLANS.PREMIUM || billingFetcher.state === "submitting"}
                onClick={() => handleUpgrade(PLANS.PREMIUM)}
              >
                {currentPlan === PLANS.PREMIUM ? "Active Plan" : billingFetcher.state === "submitting" ? "Processing..." : "Upgrade to Premium"}
              </button>
            </div>
          </div>
        </div>

        {/* TAB: SETUP GUIDE */}
        <div className={`mn-tab-content ${activeTab === "guide" ? "active" : ""}`}>
          <div className="mn-page-header">
            <h1 className="mn-page-title">Storefront Setup Instructions</h1>
            <p className="mn-page-subtitle">Add the announcement app blocks directly into your Shopify 2.0 Theme Editor.</p>
          </div>

          <div style={{ maxWidth: "700px" }}>
            <div className="mn-guide-step">
              <div className="mn-guide-number">1</div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Enable Theme Extension Block</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>
                  Go to your Shopify Admin, click on **Online Store** &gt; **Themes**. 
                  Open your active theme editor by clicking the **Customize** button on Dawn or your 2.0 theme.
                </p>
              </div>
            </div>

            <div className="mn-guide-step">
              <div className="mn-guide-number">2</div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Add App Block to Header/Section</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>
                  In the side navigation panel, click **Add Block** or **Add Section**, select the **Apps** tab, 
                  and choose **MotionNotify Banner**.
                </p>
              </div>
            </div>

            <div className="mn-guide-step">
              <div className="mn-guide-number">3</div>
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px" }}>Position and Customize</h3>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", lineHeight: 1.5 }}>
                  Drag and position the **MotionNotify Banner** block at the very top of your header or above your storefront slides. 
                  Save the changes in your Theme Editor to launch campaigns instantly.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal Overlay */}
      {previewTemplate && (
        <div className="mn-preview-modal-overlay" onClick={() => setPreviewTemplate(null)}>
          <div className="mn-preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mn-preview-modal-header">
              <div className="mn-preview-modal-title">
                {previewTemplate.name}
                <span className={`mn-template-tier-badge ${previewTemplate.tier.toLowerCase()}`} style={{ margin: 0 }}>
                  {previewTemplate.tier}
                </span>
              </div>
              <div className="mn-viewport-switchers">
                <button 
                  className={`mn-viewport-btn ${previewViewport === "desktop" ? "active" : ""}`}
                  onClick={() => setPreviewViewport("desktop")}
                >
                  {ICONS.desktop} Desktop
                </button>
                <button 
                  className={`mn-viewport-btn ${previewViewport === "mobile" ? "active" : ""}`}
                  onClick={() => setPreviewViewport("mobile")}
                >
                  {ICONS.mobile} Mobile
                </button>
              </div>
            </div>

            <div className="mn-preview-modal-body">
              {!isDesignUnlocked(currentPlan, previewTemplate.type) && (
                <div className="mn-preview-locked-badge">
                  🔒 {previewTemplate.tier === "PREMIUM" ? "Premium" : previewTemplate.tier === "GROWTH" ? "Growth" : "Starter"} Feature
                </div>
              )}
              <div className={`mn-preview-frame-wrapper ${previewViewport === "mobile" ? "mobile-view" : ""}`} style={{ width: "100%", height: "100%", padding: "40px" }}>
                <AnnouncementRenderer config={previewTemplate.previewConfig} />
              </div>
            </div>

            <div className="mn-preview-modal-footer">
              <button 
                className="mn-action-btn"
                style={{ background: "transparent", color: "var(--text-primary)", border: "1px solid var(--border-color)" }}
                onClick={() => setPreviewTemplate(null)}
              >
                Close Preview
              </button>
              {!isDesignUnlocked(currentPlan, previewTemplate.type) ? (
                <button 
                  className="mn-action-btn"
                  onClick={() => {
                    setPreviewTemplate(null);
                    setActiveTab("billing");
                  }}
                >
                  Upgrade to {previewTemplate.tier === "PREMIUM" ? "Premium" : previewTemplate.tier === "GROWTH" ? "Growth" : "Starter"}
                </button>
              ) : (
                <button 
                  className="mn-action-btn"
                  onClick={() => {
                    handleInputChange("designType", previewTemplate.type);
                    setPreviewTemplate(null);
                  }}
                >
                  Use {previewTemplate.name} Template
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// HMR trigger 20260608112828
