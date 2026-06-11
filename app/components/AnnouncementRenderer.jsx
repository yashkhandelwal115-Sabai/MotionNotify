import React, { useState, useEffect, useRef } from "react";

export default function AnnouncementRenderer({ config }) {
  const {
    designType = "FREE",
    text = "Special Announcement!",
    heading = "",
    subheading = "",
    fontColor = "#FFFFFF",
    bgColor = "#000000",
    gradientColor1 = "#ff7e5f",
    gradientColor2 = "#feb47b",
    buttonText = "",
    buttonUrl = "",
    buttonStyle = "solid",
    countdownDate = "",
    cards = "[]",
    borderRadius = 8,
    animationEnabled = true,
    rotationTiming = 5,
    badgeLabel = "",
    icon = "",
  } = config || {};

  // Parse cards
  let parsedCards = [];
  try {
    parsedCards = typeof cards === "string" ? JSON.parse(cards) : cards;
  } catch (e) {
    parsedCards = [];
  }

  // Sliding card states
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const totalCards = parsedCards.length;

  useEffect(() => {
    if (totalCards > 1 && animationEnabled) {
      const interval = setInterval(() => {
        setActiveCardIndex((prev) => (prev + 1) % totalCards);
      }, rotationTiming * 1000);
      return () => clearInterval(interval);
    }
  }, [totalCards, animationEnabled, rotationTiming]);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [countdownFinished, setCountdownFinished] = useState(false);

  useEffect(() => {
    if (!countdownDate) return;

    const calculateTimeLeft = () => {
      const difference = +new Date(countdownDate) - +new Date();
      let newTimeLeft = { hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        newTimeLeft = {
          hours: Math.floor(difference / (1000 * 60 * 60)),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
        setTimeLeft(newTimeLeft);
        setCountdownFinished(false);
      } else {
        setCountdownFinished(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [countdownDate]);

  // Dynamic AI-style Banner simulated state
  const [simulatedMsgIndex, setSimulatedMsgIndex] = useState(0);
  const simulatedMsgs = [
    `✨ Limited Time Offer!`,
    `☀️ Summer Sale Now Live`,
    `🎉 Shop New Arrivals`,
  ];

  const processText = (str) => {
    if (!str) return str;
    const inv = config?.targetInventory != null ? config.targetInventory : 29616;
    return str.replace(/{inventory}/g, inv.toLocaleString());
  };

  useEffect(() => {
    if (designType === "DYNAMIC") {
      const interval = setInterval(() => {
        setSimulatedMsgIndex((prev) => (prev + 1) % simulatedMsgs.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [designType]);

  // Rendering Helpers
  const getButtonClass = () => {
    switch (buttonStyle) {
      case "outline":
        return "mn-btn-outline";
      case "glass":
        return "mn-btn-glass";
      case "solid":
      default:
        return "mn-btn-solid";
    }
  };

  const buttonStyleInline = {
    color: buttonStyle === "solid" ? bgColor : fontColor,
    backgroundColor: buttonStyle === "solid" ? fontColor : "transparent",
    borderColor: fontColor,
    borderRadius: `${borderRadius}px`,
  };

  return (
    <div className={`mn-preview-container mn-design-${designType.toLowerCase()}`}>
      <style dangerouslySetInnerHTML={{ __html: `
        .mn-preview-container {
          width: 100%;
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          box-sizing: border-box;
          transition: all 0.3s ease;
          overflow: hidden;
        }
        
        /* Base styles */
        .mn-bar-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 16px;
          padding: 12px 24px;
          min-height: 48px;
          text-align: center;
          position: relative;
        }

        .mn-text-content {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 14px;
          font-weight: 500;
          line-height: 1.4;
        }

        .mn-heading {
          font-weight: 700;
          font-size: 16px;
        }

        .mn-subheading {
          font-weight: 400;
          font-size: 12px;
          opacity: 0.85;
        }

        /* Button styles */
        .mn-cta-btn {
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          transition: all 0.2s ease-in-out;
          border: 1px solid transparent;
        }
        
        .mn-cta-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
          opacity: 0.95;
        }

        .mn-btn-outline {
          background-color: transparent;
        }

        .mn-btn-glass {
          background-color: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(4px);
        }

        /* Badge styles */
        .mn-badge {
          display: inline-block;
          padding: 2px 8px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          border-radius: 4px;
          background: rgba(255, 255, 255, 0.2);
          letter-spacing: 0.05em;
        }

        /* Countdown timer styles */
        .mn-countdown-wrapper {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
        }

        .mn-countdown-unit {
          background: rgba(0, 0, 0, 0.2);
          padding: 2px 6px;
          border-radius: 4px;
          min-width: 22px;
          display: inline-block;
        }

        /* Design type: GRADIENT */
        .mn-design-gradient .mn-bar-inner {
          background: linear-gradient(-45deg, ${bgColor}, ${gradientColor1}, ${gradientColor2}, ${bgColor});
          background-size: 400% 400%;
          animation: mnGradientShift ${animationEnabled ? "12s" : "0s"} ease infinite;
        }

        @keyframes mnGradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* Design type: SLIDING */
        .mn-sliding-cards-container {
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          position: relative;
          min-height: 48px;
        }

        .mn-sliding-card {
          width: 100%;
          position: absolute;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.5s ease-in-out;
          pointer-events: none;
        }

        .mn-sliding-card.active {
          position: relative;
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }

        /* Design type: GLASSMORPHISM */
        .mn-design-glassmorphism {
          padding: 8px 16px;
        }

        .mn-design-glassmorphism .mn-bar-inner {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
        }

        /* Design type: CAROUSEL */
        .mn-carousel-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 100%;
        }

        .mn-carousel-inner {
          max-width: 600px;
          min-height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .mn-carousel-card {
          display: none;
          animation: mnFadeIn 0.5s ease-in-out forwards;
        }

        .mn-carousel-card.active {
          display: block;
        }

        @keyframes mnFadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        /* Design type: LUXURY */
        .mn-design-luxury {
          position: relative;
          padding: 2px;
        }

        .mn-design-luxury-outline {
          background: linear-gradient(90deg, ${gradientColor1}, ${gradientColor2}, ${gradientColor1});
          background-size: 200% auto;
          animation: mnBorderGlow ${animationEnabled ? "4s" : "0s"} linear infinite;
        }

        .mn-design-luxury .mn-bar-inner {
          background: ${bgColor};
          box-shadow: inset 0 0 15px rgba(255,255,255,0.05);
        }

        @keyframes mnBorderGlow {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        /* Design type: INTERACTIVE */
        .mn-design-interactive .mn-bar-inner {
          background: ${bgColor};
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          border-bottom: 2px solid ${gradientColor1};
        }

        /* Design type: DYNAMIC */
        .mn-design-dynamic .mn-bar-inner {
          background: radial-gradient(circle at 20% 30%, ${bgColor} 0%, rgba(20, 20, 20, 0.95) 100%);
          border-left: 5px solid ${gradientColor2};
        }
        
        .mn-dynamic-ticker {
          font-weight: 600;
          animation: mnTickerSlide 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes mnTickerSlide {
          from { transform: translateY(-8px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      ` }} />

      <div className="mn-design-luxury-outline">
        <div 
          className="mn-bar-inner" 
          style={{
            backgroundColor: designType !== "GRADIENT" && designType !== "GLASSMORPHISM" ? bgColor : undefined,
            color: fontColor,
            borderRadius: `${borderRadius}px`,
          }}
        >
          {/* Badge Label */}
          {badgeLabel && (
            <span className="mn-badge" style={{ color: fontColor, borderColor: fontColor }}>
              {badgeLabel}
            </span>
          )}

          {/* Icon if provided */}
          {icon && (
            <span className="mn-icon" style={{ fontSize: "16px", display: "inline-flex", alignSelf: "center" }}>
              {icon}
            </span>
          )}

          {/* Simple Clean Design */}
          {designType === "FREE" && (
            <div className="mn-text-content">
              {heading && <span className="mn-heading">{heading}</span>}
              <span>{text}</span>
              {subheading && <span className="mn-subheading">{subheading}</span>}
            </div>
          )}

          {/* Gradient Design */}
          {designType === "GRADIENT" && (
            <div className="mn-text-content">
              {heading && <span className="mn-heading">{heading}</span>}
              <span>{text}</span>
              {subheading && <span className="mn-subheading">{subheading}</span>}
            </div>
          )}

          {/* Sliding Cards Design */}
          {designType === "SLIDING" && (
            <div className="mn-sliding-cards-container">
              {totalCards > 0 ? (
                parsedCards.map((card, idx) => (
                  <div 
                    key={idx} 
                    className={`mn-sliding-card ${idx === activeCardIndex ? "active" : ""}`}
                  >
                    <div className="mn-text-content">
                      {card.heading && <span className="mn-heading">{card.heading}</span>}
                      <span>{card.text}</span>
                      {card.subheading && <span className="mn-subheading">{card.subheading}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="mn-text-content">
                  <span>{text}</span>
                </div>
              )}
            </div>
          )}

          {/* Floating Glassmorphism Design */}
          {designType === "GLASSMORPHISM" && (
            <div className="mn-text-content" style={{ color: fontColor }}>
              {heading && <span className="mn-heading">{heading}</span>}
              <span>{text}</span>
              {subheading && <span className="mn-subheading">{subheading}</span>}
            </div>
          )}

          {/* Stacked Carousel Design */}
          {designType === "CAROUSEL" && (
            <div className="mn-carousel-wrapper">
              <div className="mn-carousel-inner">
                {totalCards > 0 ? (
                  parsedCards.map((card, idx) => (
                    <div 
                      key={idx} 
                      className={`mn-carousel-card ${idx === activeCardIndex ? "active" : ""}`}
                    >
                      <div className="mn-text-content">
                        {card.heading && <span className="mn-heading">{card.heading}</span>}
                        <span>{card.text}</span>
                        {card.subheading && <span className="mn-subheading">{card.subheading}</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="mn-text-content">
                    <span>{text}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Luxury Motion Design */}
          {designType === "LUXURY" && (
            <div className="mn-text-content" style={{ letterSpacing: "0.03em" }}>
              {heading && <span className="mn-heading" style={{ textShadow: `0 0 8px ${gradientColor1}80` }}>{heading}</span>}
              <span style={{ fontWeight: 600 }}>{text}</span>
              {subheading && <span className="mn-subheading">{subheading}</span>}
            </div>
          )}

          {/* Interactive Premium Announcement System */}
          {designType === "INTERACTIVE" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "16px" }}>
              <div className="mn-text-content">
                {heading && <span className="mn-heading">{heading}</span>}
                <span>{text}</span>
              </div>
              
              {/* Live Countdown */}
              {countdownDate && !countdownFinished && (
                <div className="mn-countdown-wrapper">
                  <span>Ends in:</span>
                  <span className="mn-countdown-unit">{String(timeLeft.hours).padStart(2, "0")}h</span>
                  <span>:</span>
                  <span className="mn-countdown-unit">{String(timeLeft.minutes).padStart(2, "0")}m</span>
                  <span>:</span>
                  <span className="mn-countdown-unit">{String(timeLeft.seconds).padStart(2, "0")}s</span>
                </div>
              )}
            </div>
          )}

          {/* AI Smart Dynamic Design */}
          {designType === "DYNAMIC" && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "16px" }}>
              <div className="mn-text-content mn-dynamic-ticker" key={simulatedMsgIndex}>
                <span>{processText(simulatedMsgs[simulatedMsgIndex])}</span>
              </div>
              {countdownDate && !countdownFinished && (
                <div className="mn-countdown-wrapper" style={{ opacity: 0.9 }}>
                  <span className="mn-countdown-unit" style={{ background: gradientColor1 }}>{String(timeLeft.hours).padStart(2, "0")}</span>
                  <span>:</span>
                  <span className="mn-countdown-unit" style={{ background: gradientColor1 }}>{String(timeLeft.minutes).padStart(2, "0")}</span>
                  <span>:</span>
                  <span className="mn-countdown-unit" style={{ background: gradientColor1 }}>{String(timeLeft.seconds).padStart(2, "0")}</span>
                </div>
              )}
            </div>
          )}

          {/* Button CTA */}
          {buttonText && buttonUrl && (
            <a 
              href={buttonUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={`mn-cta-btn ${getButtonClass()}`}
              style={buttonStyleInline}
              onClick={(e) => {
                // If in iframe preview, block clicking
                if (window.self !== window.top) {
                  e.preventDefault();
                }
              }}
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
