// Dateline (any page with #today)
const todayEl = document.getElementById("today");
if (todayEl) {
  todayEl.textContent = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Headline ticker (landing page collage section) — flashes behind the intro copy
const tickerTrack = document.getElementById("tickerTrack");
if (tickerTrack) {
  const headlineEls = document.querySelectorAll(".collage .paper h3");
  let headlines = Array.prototype.map.call(headlineEls, (el) =>
    el.textContent.trim(),
  );
  if (headlines.length === 0) {
    headlines = [
      "Flash desk online",
      "Verify before you share",
      "Live verification running",
    ];
  }
  // Duplicate the list once so translateX(-50%) loops seamlessly
  tickerTrack.innerHTML = headlines
    .concat(headlines)
    .map((h) => `<span>${h}</span>`)
    .join("");
}

// Article / URL / Image toggle (verify page)
document.querySelectorAll(".toggle-group button").forEach((btn) => {
  btn.addEventListener("click", () => {
    const group = btn.closest(".toggle-group");
    group
      .querySelectorAll("button")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const input = document.getElementById("verifyInput");
    const imageSec = document.querySelector(".verify-image");
    const mode = btn.dataset.mode;

    if (mode === "image") {
      if (input) input.style.display = "none";
      if (imageSec) imageSec.style.display = "block";
    } else {
      if (input) {
        input.style.display = "block";
        input.placeholder =
          mode === "url"
            ? "Paste the article URL here…"
            : "Paste the article text here…";
      }
      if (imageSec) imageSec.style.display = "none";
    }
  });
});

// Image evidence selection (verify page)
const verifyImageInput = document.getElementById("verifyImageInput");
const verifyImageDrop = document.getElementById("verifyImageDrop");
const verifyImagePreviewWrap = document.getElementById("verifyImagePreviewWrap");
const verifyImagePreview = document.getElementById("verifyImagePreview");
const verifyImageFilename = document.getElementById("verifyImageFilename");
const verifyImageRemove = document.getElementById("verifyImageRemove");
const verifyImageError = document.getElementById("verifyImageError");
const verifyImageBox = document.getElementById("verifyImageBox");

let selectedImageFile = null;
let currentPreviewUrl = null;

function clearImageSelection() {
  selectedImageFile = null;
  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = null;
  }
  if (verifyImageInput) {
    verifyImageInput.value = "";
  }
  if (verifyImagePreview) {
    verifyImagePreview.src = "";
  }
  if (verifyImageFilename) {
    verifyImageFilename.textContent = "";
  }
  if (verifyImagePreviewWrap) {
    verifyImagePreviewWrap.style.display = "none";
  }
  if (verifyImageDrop) {
    verifyImageDrop.style.display = "flex";
  }
}

function showImageError(msg) {
  if (verifyImageError) {
    verifyImageError.textContent = msg;
    verifyImageError.style.display = "block";
  }
}

function clearImageError() {
  if (verifyImageError) {
    verifyImageError.textContent = "";
    verifyImageError.style.display = "none";
  }
}

function handleFileSelection(file) {
  clearImageError();

  if (!file) return;

  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  if (!validTypes.includes(file.type.toLowerCase())) {
    showImageError("Invalid file format. Please select a JPG, JPEG, PNG, or WEBP image.");
    clearImageSelection();
    return;
  }

  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB limit
  if (file.size > maxSizeInBytes) {
    showImageError("File is too large. Maximum allowed size is 10 MB.");
    clearImageSelection();
    return;
  }

  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = null;
  }

  selectedImageFile = file;
  currentPreviewUrl = URL.createObjectURL(file);

  if (verifyImagePreview) {
    verifyImagePreview.src = currentPreviewUrl;
    verifyImagePreview.alt = "Preview of " + file.name;
  }
  if (verifyImageFilename) {
    verifyImageFilename.textContent = file.name;
  }
  if (verifyImageDrop) {
    verifyImageDrop.style.display = "none";
  }
  if (verifyImagePreviewWrap) {
    verifyImagePreviewWrap.style.display = "flex";
  }
}

if (verifyImageInput) {
  verifyImageInput.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      handleFileSelection(file);
    }
  });
}

if (verifyImageRemove) {
  verifyImageRemove.addEventListener("click", (e) => {
    e.preventDefault();
    clearImageSelection();
    clearImageError();
  });
}

if (verifyImageBox) {
  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    verifyImageBox.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });
  verifyImageBox.addEventListener("drop", (e) => {
    const dt = e.dataTransfer;
    if (dt && dt.files && dt.files.length > 0) {
      handleFileSelection(dt.files[0]);
    }
  });
}

// Predict (verify page)
const predictBtn = document.getElementById("predictBtn");
if (predictBtn) {
  predictBtn.addEventListener("click", () => {
    const activeBtn = document.querySelector(".toggle-group button.active");
    const mode = activeBtn ? activeBtn.dataset.mode : "article";
    const text = document.getElementById("verifyInput").value.trim();

    if (mode === "image" || (!text && selectedImageFile)) {
      if (selectedImageFile) {
        const stamp = document.getElementById("stampEl");
        const fill = document.getElementById("meterFill");
        const pct = document.getElementById("meterPct");
        const note = document.getElementById("resultNote");
        const leftLabel = document.getElementById("meterLeftLabel");

        stamp.textContent = "NOTICE";
        stamp.className = "stamp";
        stamp.style.color = "var(--ink)";
        stamp.style.borderColor = "var(--ink)";
        fill.className = "meter-fill";
        fill.style.width = "0%";
        pct.textContent = "--";
        leftLabel.textContent = "Image evidence logged";
        note.textContent =
          "Image selected (" +
          selectedImageFile.name +
          "). Image verification will be available when image analysis is connected.";

        document.getElementById("result").classList.add("show");
        return;
      } else {
        if (verifyImageInput) {
          verifyImageInput.click();
        }
        return;
      }
    }

    if (!text) {
      document.getElementById("verifyInput").focus();
      return;
    }
    const flags = [
      "shocking",
      "miracle",
      "you won't believe",
      "secret",
      "banned",
      "doctors hate",
      "100% cure",
      "exposed",
      "they don't want you to know",
    ];
    const lower = text.toLowerCase();
    let score = 20;
    flags.forEach((f) => {
      if (lower.includes(f)) score += 14;
    });
    if (text.length < 60) score += 10;
    if ((text.match(/!/g) || []).length > 2) score += 8;
    score += Math.floor(Math.random() * 15);
    score = Math.min(97, Math.max(4, score));

    const isFake = score >= 50;
    const stamp = document.getElementById("stampEl");
    const fill = document.getElementById("meterFill");
    const pct = document.getElementById("meterPct");
    const note = document.getElementById("resultNote");
    const leftLabel = document.getElementById("meterLeftLabel");

    stamp.textContent = isFake ? "FAKE" : "REAL";
    stamp.className = "stamp " + (isFake ? "fake" : "real");
    stamp.style.color = "";
    stamp.style.borderColor = "";
    fill.className = "meter-fill " + (isFake ? "" : "real");
    const shown = isFake ? score : 100 - score;
    fill.style.width = shown + "%";
    pct.textContent = shown + "%";
    leftLabel.textContent = isFake ? "Fake likelihood" : "Real likelihood";
    note.textContent = isFake
      ? "Language patterns and claim structure resemble known misinformation. Cross-check with a primary source before sharing."
      : "Claim structure and tone are consistent with verified reporting. Sourcing still worth a second look for high-stakes claims.";

    document.getElementById("result").classList.add("show");
  });
}

// Summarize (summarize page)
const summarizeBtn = document.getElementById("summarizeBtn");
if (summarizeBtn) {
  summarizeBtn.addEventListener("click", () => {
    const text = document.getElementById("summaryInput").value.trim();
    const list = document.getElementById("summaryList");
    list.innerHTML = "";
    if (!text) {
      document.getElementById("summaryInput").focus();
      return;
    }
    let sentences = text
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 12);
    if (sentences.length === 0) sentences = [text];
    const picks = sentences.slice(0, Math.min(3, sentences.length));
    while (picks.length < 3) {
      picks.push("No further distinct claim found in the passage.");
    }
    picks.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s.trim();
      list.appendChild(li);
    });
    document.getElementById("summaryOut").classList.add("show");
  });
}

// Classify (classify page)
const classifyBtn = document.getElementById("classifyBtn");
if (classifyBtn) {
  const catWords = {
    politics: [
      "election",
      "minister",
      "parliament",
      "government",
      "policy",
      "president",
      "vote",
      "senate",
    ],
    sports: [
      "match",
      "tournament",
      "goal",
      "team",
      "championship",
      "league",
      "player",
      "coach",
    ],
    entertainment: [
      "movie",
      "actor",
      "film",
      "celebrity",
      "album",
      "concert",
      "music",
      "show",
    ],
    technology: [
      "app",
      "software",
      "ai",
      "startup",
      "device",
      "robot",
      "tech",
      "computer",
    ],
    business: [
      "market",
      "stock",
      "company",
      "revenue",
      "economy",
      "trade",
      "bank",
      "startup",
    ],
    health: [
      "hospital",
      "disease",
      "vaccine",
      "doctor",
      "patient",
      "virus",
      "treatment",
      "medicine",
    ],
  };
  classifyBtn.addEventListener("click", () => {
    const text = document
      .getElementById("classifyInput")
      .value.trim()
      .toLowerCase();
    const resultEl = document.getElementById("classifyResult");
    if (!text) {
      document.getElementById("classifyInput").focus();
      return;
    }
    let scores = {};
    Object.keys(catWords).forEach((cat) => {
      scores[cat] = catWords[cat].reduce(
        (acc, w) => acc + (text.includes(w) ? 1 : 0),
        0,
      );
    });
    let best = Object.keys(scores).reduce(
      (a, b) => (scores[b] > scores[a] ? b : a),
      "politics",
    );
    if (scores[best] === 0) {
      const keys = Object.keys(catWords);
      best = keys[Math.floor(Math.random() * keys.length)];
    }
    document.querySelectorAll(".chip").forEach((c) => {
      c.classList.toggle("active", c.dataset.cat === best);
    });
    resultEl.innerHTML =
      "Sorted to the <b>" +
      best.charAt(0).toUpperCase() +
      best.slice(1) +
      "</b> desk.";
    resultEl.classList.add("show");
  });
}

// Trending tabs (trending page)
document.querySelectorAll(".trend-tabs button").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".trend-tabs button").forEach((b) => {
      b.classList.remove("active", "fake-active", "real-active");
    });
    const filter = btn.dataset.filter;
    btn.classList.add(
      "active",
      filter === "fake" ? "fake-active" : "real-active",
    );
    document.querySelectorAll(".clip-item").forEach((item) => {
      item.classList.toggle("hidden-clip", item.dataset.cat !== filter);
    });
  });
});
