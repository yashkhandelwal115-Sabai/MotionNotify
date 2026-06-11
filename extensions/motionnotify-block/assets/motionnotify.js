(function () {
  const root = document.getElementById("motionnotify-root");
  if (!root) return;

  const shop = root.getAttribute("data-shop");
  const country = root.getAttribute("data-country") || "";
  const device = window.innerWidth <= 768 ? "mobile" : "desktop";

  const scriptTag = document.getElementById("motionnotify-script");
  let appProxyUrl = "/apps/motionnotify";
  
  if (scriptTag && scriptTag.src) {
    try {
      const scriptUrl = new URL(scriptTag.src);
      if (!scriptUrl.hostname.includes("cdn.shopify.com") && !scriptUrl.hostname.includes("cdn.shopifycloud.com")) {
        appProxyUrl = scriptUrl.origin;
      }
    } catch(e) {}
  }
  
  console.log(`[MotionNotify] Initializing storefront script for shop: ${shop}`);
  console.log(`[MotionNotify] Fetching campaigns from: ${appProxyUrl}`);

  // Fetch campaign
  fetch(`${appProxyUrl}/api/announcements?shop=${shop}&country=${country}&device=${device}`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then((data) => {
      activeCampaign = data.campaign;
      if (!activeCampaign) {
        root.style.display = "none";
        return;
      }

      renderCampaign(activeCampaign);
      trackEvent("IMPRESSION", activeCampaign.id);
    })
    .catch((err) => {
      console.error("Error loading MotionNotify:", err);
      root.style.display = "none";
    });

  let activeCampaign = null;

  let productId = root.getAttribute("data-product-id") || "N/A";
  let variantId = root.getAttribute("data-variant-id") || "N/A";
  let inventory = null;
  let discountPct = "0%";

  function updateDataFromElement(el) {
    if (!el) return;
    productId = el.getAttribute("data-product-id") || "N/A";
    variantId = el.getAttribute("data-variant-id") || "N/A";
    
    const inventoryRaw = el.getAttribute("data-product-inventory");
    inventory = inventoryRaw && inventoryRaw !== "" ? parseInt(inventoryRaw, 10) : null;
    
    const priceRaw = el.getAttribute("data-product-price") || "";
    const price = priceRaw ? (parseInt(priceRaw, 10) / 100) : 0;
    const comparePriceRaw = el.getAttribute("data-product-compare-price") || "";
    const comparePrice = comparePriceRaw ? (parseInt(comparePriceRaw, 10) / 100) : 0;
    
    discountPct = "0%";
    if (comparePrice > price && price > 0) {
      discountPct = `${Math.round(((comparePrice - price) / comparePrice) * 100)}%`;
    }
  }

  // Initial load
  updateDataFromElement(root);
  
  console.log(`[MotionNotify] Product ID: ${productId}`);
  console.log(`[MotionNotify] Variant ID: ${variantId}`);
  console.log(`[MotionNotify] Inventory quantity received: ${inventory !== null ? inventory : "Not tracked"}`);

  function processText(str) {
    if (!str) return str;
    
    // Check if the backend provided global target values for this campaign
    let activeInventory = inventory;
    let activeDiscountPct = discountPct;
    
    if (activeCampaign) {
      if (activeCampaign.isTargetDeleted) {
        // Fallback gracefully if target product was deleted
        if (str.includes("{inventory}") || str.includes("{discount}")) {
          return "Special Offer Available Now!";
        }
      }
      
      if (activeCampaign.targetInventory !== undefined) {
        activeInventory = activeCampaign.targetInventory;
      }
      
      if (activeCampaign.targetPrice !== undefined) {
        const tPrice = activeCampaign.targetPrice;
        const tCompare = activeCampaign.targetCompareAtPrice;
        activeDiscountPct = "0%";
        if (tCompare > tPrice && tPrice > 0) {
          activeDiscountPct = `${Math.round(((tCompare - tPrice) / tCompare) * 100)}%`;
        }
      }
    }
    
    // Fallback for non-product pages or untracked targets where inventory/price are unavailable
    if (activeInventory === null) {
      if (str.includes("{inventory}") || str.includes("{discount}")) {
        return "Special Offer Available Now!";
      }
      return str;
    }

    let invText = activeInventory.toLocaleString();
    if (activeInventory === 0) {
      // If inventory is exactly 0, replace entire string with "Out of Stock" if it contains {inventory}
      if (str.includes("{inventory}")) {
        return "Out of Stock";
      }
    }
    return str.replace(/{inventory}/g, invText).replace(/{discount}/g, activeDiscountPct);
  }

  function renderCampaign(cfg) {
    if (!root) return;
    root.innerHTML = "";
    
    const container = document.createElement("div");
    container.className = `motionnotify-container mn-design-${cfg.designType.toLowerCase()}`;
    
    // Apply responsive visibility classes
    if (!cfg.mobileVisible) container.classList.add("mn-hide-mobile");
    if (!cfg.desktopVisible) container.classList.add("mn-hide-desktop");

    // Apply inline style custom properties
    container.style.setProperty("--bg", cfg.bgColor);
    container.style.setProperty("--text", cfg.fontColor);
    container.style.setProperty("--gc1", cfg.gradientColor1);
    container.style.setProperty("--gc2", cfg.gradientColor2);

    const inner = document.createElement("div");
    inner.className = "mn-bar-inner";
    inner.style.backgroundColor = (cfg.designType !== "GRADIENT" && cfg.designType !== "GLASSMORPHISM") ? cfg.bgColor : "transparent";
    inner.style.color = cfg.fontColor;
    inner.style.borderRadius = `${cfg.borderRadius}px`;

    // 1. Badge Label
    if (cfg.badgeLabel) {
      const badge = document.createElement("span");
      badge.className = "mn-badge";
      badge.style.color = cfg.fontColor;
      badge.style.borderColor = cfg.fontColor;
      badge.innerText = processText(cfg.badgeLabel);
      inner.appendChild(badge);
    }

    // 2. Icon
    if (cfg.icon) {
      const icon = document.createElement("span");
      icon.className = "mn-icon";
      icon.style.fontSize = "16px";
      icon.style.display = "inline-flex";
      icon.style.alignSelf = "center";
      icon.innerText = cfg.icon;
      inner.appendChild(icon);
    }

    // 3. Main content based on design type
    const contentWrapper = document.createElement("div");
    contentWrapper.className = "mn-text-content";

    let parsedCards = [];
    try {
      parsedCards = typeof cfg.cards === "string" ? JSON.parse(cfg.cards) : cfg.cards;
    } catch (e) {
      parsedCards = [];
    }

    if (cfg.designType === "SLIDING") {
      const slidingContainer = document.createElement("div");
      slidingContainer.className = "mn-sliding-cards-container";

      if (parsedCards.length > 0) {
        parsedCards.forEach((card, idx) => {
          const cardEl = document.createElement("div");
          cardEl.className = `mn-sliding-card ${idx === 0 ? "active" : ""}`;
          cardEl.innerHTML = `
            <div class="mn-text-content">
              ${card.heading ? `<span class="mn-heading">${processText(card.heading)}</span>` : ""}
              <span>${processText(card.text)}</span>
              ${card.subheading ? `<span class="mn-subheading">${processText(card.subheading)}</span>` : ""}
            </div>
          `;
          slidingContainer.appendChild(cardEl);
        });

        // Set up card rotation
        let currentIdx = 0;
        if (cfg.animationEnabled && parsedCards.length > 1) {
          setInterval(() => {
            const cards = slidingContainer.querySelectorAll(".mn-sliding-card");
            cards[currentIdx].classList.remove("active");
            currentIdx = (currentIdx + 1) % cards.length;
            cards[currentIdx].classList.add("active");
          }, cfg.rotationTiming * 1000);
        }
      } else {
        slidingContainer.innerHTML = `<span class="mn-text-content">${processText(cfg.text)}</span>`;
      }
      inner.appendChild(slidingContainer);

    } else if (cfg.designType === "CAROUSEL") {
      const carouselWrapper = document.createElement("div");
      carouselWrapper.className = "mn-carousel-wrapper";

      const carouselInner = document.createElement("div");
      carouselInner.className = "mn-carousel-inner";

      if (parsedCards.length > 0) {
        parsedCards.forEach((card, idx) => {
          const cardEl = document.createElement("div");
          cardEl.className = `mn-carousel-card ${idx === 0 ? "active" : ""}`;
          cardEl.innerHTML = `
            <div class="mn-text-content">
              ${card.heading ? `<span class="mn-heading">${processText(card.heading)}</span>` : ""}
              <span>${processText(card.text)}</span>
              ${card.subheading ? `<span class="mn-subheading">${processText(card.subheading)}</span>` : ""}
            </div>
          `;
          carouselInner.appendChild(cardEl);
        });

        carouselWrapper.appendChild(carouselInner);

        // Set up carousel rotation
        let currentIdx = 0;
        if (cfg.animationEnabled && parsedCards.length > 1) {
          setInterval(() => {
            const cards = carouselInner.querySelectorAll(".mn-carousel-card");
            cards[currentIdx].classList.remove("active");
            currentIdx = (currentIdx + 1) % cards.length;
            cards[currentIdx].classList.add("active");
          }, cfg.rotationTiming * 1000);
        }
      } else {
        carouselInner.innerHTML = `<span class="mn-text-content">${processText(cfg.text)}</span>`;
        carouselWrapper.appendChild(carouselInner);
      }
      inner.appendChild(carouselWrapper);

    } else if (cfg.designType === "DYNAMIC") {
      const dynamicWrapper = document.createElement("div");
      dynamicWrapper.style.display = "flex";
      dynamicWrapper.style.alignItems = "center";
      dynamicWrapper.style.justifyContent = "center";
      dynamicWrapper.style.flexWrap = "wrap";
      dynamicWrapper.style.gap = "16px";

      const ticker = document.createElement("div");
      ticker.className = "mn-text-content mn-dynamic-ticker";

      const simulatedMsgs = [
        `✨ Limited Time Offer!`,
        `☀️ Summer Sale Now Live`,
        `🎉 Shop New Arrivals`
      ];

      ticker.innerText = processText(simulatedMsgs[0]);
      dynamicWrapper.appendChild(ticker);

      let msgIndex = 0;
      setInterval(() => {
        msgIndex = (msgIndex + 1) % simulatedMsgs.length;
        ticker.style.opacity = 0;
        setTimeout(() => {
          ticker.innerText = processText(simulatedMsgs[msgIndex]);
          ticker.style.opacity = 1;
        }, 200);
      }, 6000);

      // Countdown in Dynamic
      if (cfg.countdownDate) {
        const countdownEl = document.createElement("div");
        countdownEl.className = "mn-countdown-wrapper";
        countdownEl.style.opacity = 0.9;
        dynamicWrapper.appendChild(countdownEl);
        initCountdown(cfg.countdownDate, countdownEl, cfg.gradientColor1);
      }

      inner.appendChild(dynamicWrapper);

    } else if (cfg.designType === "INTERACTIVE") {
      const interactiveWrapper = document.createElement("div");
      interactiveWrapper.style.display = "flex";
      interactiveWrapper.style.alignItems = "center";
      interactiveWrapper.style.justifyContent = "center";
      interactiveWrapper.style.flexWrap = "wrap";
      interactiveWrapper.style.gap = "16px";

      contentWrapper.innerHTML = `
        ${cfg.heading ? `<span class="mn-heading">${processText(cfg.heading)}</span>` : ""}
        <span>${processText(cfg.text)}</span>
      `;
      interactiveWrapper.appendChild(contentWrapper);

      if (cfg.countdownDate) {
        const countdownEl = document.createElement("div");
        countdownEl.className = "mn-countdown-wrapper";
        interactiveWrapper.appendChild(countdownEl);
        initCountdown(cfg.countdownDate, countdownEl);
      }

      inner.appendChild(interactiveWrapper);

    } else {
      // Standard static content designs (FREE, GRADIENT, GLASSMORPHISM, LUXURY)
      contentWrapper.innerHTML = `
        ${cfg.heading ? `<span class="mn-heading">${processText(cfg.heading)}</span>` : ""}
        <span>${processText(cfg.text)}</span>
        ${cfg.subheading ? `<span class="mn-subheading">${processText(cfg.subheading)}</span>` : ""}
      `;
      inner.appendChild(contentWrapper);
    }

    // 4. CTA Button
    if (cfg.buttonText && cfg.buttonUrl) {
      const btn = document.createElement("a");
      btn.href = cfg.buttonUrl;
      btn.className = `mn-cta-btn mn-btn-${cfg.buttonStyle}`;
      btn.innerText = processText(cfg.buttonText);
      btn.style.color = cfg.buttonStyle === "solid" ? cfg.bgColor : cfg.fontColor;
      btn.style.backgroundColor = cfg.buttonStyle === "solid" ? cfg.fontColor : "transparent";
      btn.style.borderColor = cfg.fontColor;
      btn.style.borderRadius = `${cfg.borderRadius}px`;

      // Track CTA clicks
      btn.addEventListener("click", () => {
        trackEvent("CLICK", cfg.id);
      });

      inner.appendChild(btn);
    }

    // 5. Luxury outline borders wrapping
    if (cfg.designType === "LUXURY") {
      const wrapperEl = document.createElement("div");
      wrapperEl.className = "mn-design-luxury-outline";
      wrapperEl.appendChild(inner);
      container.appendChild(wrapperEl);
    } else {
      container.appendChild(inner);
    }

    root.appendChild(container);
  }

  function initCountdown(targetDate, containerEl, badgeBg) {
    const end = new Date(targetDate).getTime();
    if (isNaN(end)) return;

    function update() {
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        containerEl.style.display = "none";
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const hStr = String(hours).padStart(2, "0");
      const mStr = String(minutes).padStart(2, "0");
      const sStr = String(seconds).padStart(2, "0");

      const styleBadge = badgeBg ? `style="background: ${badgeBg};"` : "";

      containerEl.innerHTML = `
        <span>Ends in:</span>
        <span class="mn-countdown-unit" ${styleBadge}>${hStr}h</span>
        <span>:</span>
        <span class="mn-countdown-unit" ${styleBadge}>${mStr}m</span>
        <span>:</span>
        <span class="mn-countdown-unit" ${styleBadge}>${sStr}s</span>
      `;
    }

    update();
    const interval = setInterval(update, 1000);
  }

  function trackEvent(eventType, configId) {
    const payload = {
      shop,
      configId,
      eventType,
      deviceType: device,
      country
    };

    navigator.sendBeacon(
      `${appProxyUrl}/api/analytics`,
      JSON.stringify(payload)
    );
  }

  // Handle Shopify Variant Switching without page reload
  let lastUrl = window.location.href;
  
  function handleVariantChange() {
    const currentUrl = window.location.href;
    if (currentUrl === lastUrl) return;
    lastUrl = currentUrl;
    
    if (currentUrl.includes("variant=") && activeCampaign && root) {
      console.log("[MotionNotify] Variant change detected. Fetching new variant data...");
      
      fetch(currentUrl)
        .then(res => res.text())
        .then(html => {
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, "text/html");
          const newRoot = doc.getElementById("motionnotify-root");
          
          if (newRoot) {
            updateDataFromElement(newRoot);
            console.log(`[MotionNotify] Variant updated. New inventory: ${inventory}, Price: ${discountPct}`);
            renderCampaign(activeCampaign);
          }
        })
        .catch(err => console.error("[MotionNotify] Error updating variant data:", err));
    }
  }

  // Intercept History API
  const originalPushState = history.pushState;
  history.pushState = function() {
    originalPushState.apply(this, arguments);
    handleVariantChange();
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = function() {
    originalReplaceState.apply(this, arguments);
    handleVariantChange();
  };

  window.addEventListener("popstate", handleVariantChange);

})();
