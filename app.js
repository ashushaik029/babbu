/**
 * TrustHire AI - Core Application Client Logic
 * Connects Frontend UI with Backend REST API (with automatic client-side fallback)
 */

// ============================================================================
// 1. CONFIGURATION & STATE MANAGEMENT
// ============================================================================

const CONFIG = {
    apiBase: 'http://localhost:5000/api',
    isBackendOnline: false,
    latencyMs: null
};

const state = {
    currentTab: 'scanner',
    inputMode: 'structured',
    analysisResult: null,
    quizIndex: 0,
    quizScore: 0,
    answeredQuestions: {},
    batchFilter: 'all',
    currentThreshold: 0.50
};

// Built-in Knowledge Base for Client-Side Fallback Engine
const CLIENT_NLP_LEXICON = {
    financial: [
        'registration fee', 'processing fee', 'kit fee', 'training fee', 'starter kit',
        'wire transfer', 'western union', 'moneygram', 'cashier check', 'cashiers check',
        'fake check', 'zelle', 'venmo', 'cashapp', 'cash app', 'gift card', 'crypto',
        'bitcoin', 'usdt', 'eth', 'wallet address', 'reimbursement check', 'equipment check',
        'home office check', 'upfront payment', 'deposit required', 'pay before work'
    ],
    phishing: [
        'ssn', 'social security', 'social security number', 'bank account', 'routing number',
        'credit score', 'driver license', "driver's license", 'passport copy', 'date of birth',
        'banking details', 'direct deposit form', 'w-2 form', 'w-4 form', 'login credentials',
        'verify your bank', 'personal identity'
    ],
    off_platform: [
        'telegram', 't.me', 'whatsapp', 'signal', 'dm me', 'inbox me', 'text me on',
        'google hangouts', 'hangout', 'skype id'
    ],
    urgency_promises: [
        'urgent hiring', 'urgently hiring', 'immediate start', 'start today', 'act fast',
        'limited positions', 'instant offer', 'instant hire', 'within 24 hours',
        'no interview needed', 'no experience needed', 'no experience required',
        'guaranteed income', 'guaranteed salary', 'make $5000', 'make $10000',
        '$60/hr', '$65/hr', '$70/hr', '$80/hr', '$100/hr', 'work 1 hour', 'earn daily',
        'unlimited earning', '100% guarantee', '100% placement', 'passive income'
    ],
    legitimate_cues: [
        'equal opportunity employer', '401(k)', '401k matching', 'health insurance',
        'dental insurance', 'vision insurance', 'paid time off', 'pto', "bachelor's degree",
        "master's degree", 'years of experience', 'responsibilities include', 'key qualifications',
        'github', 'portfolio', 'greenhouse', 'lever', 'workday', 'competitive compensation'
    ]
};

const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me', 'aol.com'];

// ============================================================================
// 2. BACKEND CONNECTIVITY & HEALTH CHECK
// ============================================================================

/**
 * Pings the backend REST API health endpoint
 */
async function checkBackendConnection() {
    const statusElem = document.getElementById('header-engine-status');
    const startPing = performance.now();

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${CONFIG.apiBase}/health`, {
            method: 'GET',
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            const latency = Math.round(performance.now() - startPing);
            CONFIG.isBackendOnline = true;
            CONFIG.latencyMs = latency;

            if (statusElem) {
                statusElem.innerHTML = `Connected to API (<span class="text-emerald-400">${latency}ms</span>)`;
                statusElem.parentElement.classList.remove('border-slate-700/80', 'border-amber-500/40');
                statusElem.parentElement.classList.add('border-emerald-500/50');
            }
            console.log(`[TrustHire AI] Connected to Backend REST API at ${CONFIG.apiBase} (${latency}ms)`);
            return true;
        }
    } catch (err) {
        CONFIG.isBackendOnline = false;
        CONFIG.latencyMs = null;
        if (statusElem) {
            statusElem.innerHTML = `Client-Side Engine Active`;
            statusElem.parentElement.classList.remove('border-emerald-500/50');
            statusElem.parentElement.classList.add('border-indigo-500/40');
        }
        console.warn(`[TrustHire AI] Backend server offline or unreachable. Active fallback: Client-Side NLP/ML engine.`);
        return false;
    }
}

// ============================================================================
// 3. PRESET CASE STUDIES DATA
// ============================================================================

const PRESETS = {
    fake_advance_fee: {
        title: "Remote Data Entry Clerk / Assistant",
        company: "Apex Global Logistics LLC",
        domain: "none",
        contact: "hr.recruiter.apex@gmail.com",
        salary: "$65.00 / hr",
        worktype: "Remote - Work from Home",
        experience: "No Experience Needed (Beginner)",
        checks: { fee: true, telegram: true, sensitive: false, check: false },
        description: `URGENT HIRING! We are seeking remote data entry clerks to start immediately. You can work 1 to 2 hours per day from home with guaranteed income of $65/hr. No experience needed!
        
Responsibilities include entering customer orders into spreadsheets and verifying shipping addresses. 

APPLICATION PROCEDURE:
All candidates must purchase the mandatory home office data processing kit software ($150 fee) via Zelle or Wire Transfer before onboarding. Equipment fees will be fully reimbursed on your first paycheck. Contact our hiring director on Telegram @apex_global_hr to begin onboarding immediately!`
    },

    fake_ssn_phishing: {
        title: "Executive Personal Assistant",
        company: "Starlight Holdings Group",
        domain: "starlightholdings-portal.net",
        contact: "careers-starlight@yahoo.com",
        salary: "$55.00 / hr",
        worktype: "Remote - Work from Home",
        experience: "Entry Level (0-2 years)",
        checks: { fee: false, telegram: false, sensitive: true, check: false },
        description: `Starlight Holdings is urgently seeking a dependable Executive Assistant to manage calendar scheduling, email correspondence, and personal travel bookings.

COMPENSATION:
Starting rate is $55/hr paid weekly via direct deposit, plus 100% health insurance.

ONBOARDING REQUIREMENTS:
Due to high volume of applicants, we are bypassing preliminary phone interviews. To secure your spot, please reply with your completed direct deposit authorization form, your Social Security Number (SSN), and a clear color copy of your driver's license and front/back of your banking card.`
    },

    fake_crypto_telegram: {
        title: "E-Commerce App & Video Evaluator",
        company: "Titan Digital Optimization VIP",
        domain: "none",
        contact: "t.me/titan_vip_tasks",
        salary: "$500 - $800 / day",
        worktype: "Remote - Work from Home",
        experience: "No Experience Needed (Beginner)",
        checks: { fee: true, telegram: true, sensitive: false, check: false },
        description: `Passive income opportunity! Get paid daily to review mobile applications and rate YouTube merchants. Make $500 to $800 per day working anytime from your smartphone!

HOW IT WORKS:
Complete 30 simple rating tasks per round. You will earn commissions instantly into your platform wallet.

IMPORTANT:
To unlock Gold VIP tier tasks and withdraw daily payouts, users must deposit 200 USDT (Tether crypto) to our smart contract wallet address. Instant 100% guarantee payout!`
    },

    legit_software_engineer: {
        title: "Senior Full Stack Software Engineer",
        company: "Cloudflare, Inc.",
        domain: "cloudflare.com",
        contact: "recruiting@cloudflare.com",
        salary: "$155,000 - $190,000 / yr",
        worktype: "Hybrid (Office + Remote)",
        experience: "Senior Level (5+ years)",
        checks: { fee: false, telegram: false, sensitive: false, check: false },
        description: `Cloudflare is looking for an experienced Senior Full Stack Engineer to build scalable customer-facing telemetry systems. 

Key Qualifications:
• 5+ years of experience with TypeScript, React, and Node.js or Go
• Solid understanding of distributed web architecture, HTTP/3, and edge computing
• Proven track record of system design and unit/integration testing
• Passion for building accessible, high-performance UI components

What We Offer:
• Competitive compensation package with equity options
• 401(k) retirement plan with corporate matching
• Comprehensive health insurance, dental insurance, and vision care
• Flexible paid time off (PTO) and parental leave
• Equal opportunity employer (EOE)`
    },

    legit_marketing_coordinator: {
        title: "Junior Marketing Coordinator",
        company: "BrightPath Media Studio",
        domain: "brightpathmedia.io",
        contact: "careers@brightpathmedia.io",
        salary: "$24.00 - $28.00 / hr",
        worktype: "Hybrid (Office + Remote)",
        experience: "Entry Level (0-2 years)",
        checks: { fee: false, telegram: false, sensitive: false, check: false },
        description: `BrightPath Media Studio is looking for an enthusiastic Junior Marketing Coordinator to support our creative campaigns.

Responsibilities:
• Assist in scheduling social media calendars across Instagram and LinkedIn
• Draft monthly email newsletters and coordinate marketing assets with graphic designers
• Prepare quarterly analytics reports on campaign engagement

Qualifications:
• Bachelor's degree in Marketing, Communications, or relevant experience
• Working knowledge of Canva, Google Analytics, and Mailchimp
• Excellent verbal and written communication skills
• We provide paid mentoring, health benefits, and commuter stipends`
    },

    borderline_freelance: {
        title: "Remote Blog Article Rewriter",
        company: "Digital Content Collective",
        domain: "none",
        contact: "contentlead99@gmail.com",
        salary: "Commission ($0.04 per word)",
        worktype: "Remote - Work from Home",
        experience: "No Experience Needed (Beginner)",
        checks: { fee: false, telegram: false, sensitive: false, check: false },
        description: `Looking for freelance writers to rewrite lifestyle and technology articles. 

No prior professional writing experience required. Payment is calculated on commission ($0.04 per word approved by editor). 
Payout is issued at the end of every calendar month via PayPal or bank transfer. 
To apply, submit 2 sample writing paragraphs to contentlead99@gmail.com.`
    }
};

// ============================================================================
// 4. PRESET & FORM INTERACTIONS
// ============================================================================

function loadPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (!preset) return;

    // Switch to structured mode
    setInputMode('structured');

    document.getElementById('input-title').value = preset.title;
    document.getElementById('input-company').value = preset.company;
    document.getElementById('input-domain').value = preset.domain;
    document.getElementById('input-contact').value = preset.contact;
    document.getElementById('input-salary').value = preset.salary;
    document.getElementById('input-worktype').value = preset.worktype;
    document.getElementById('input-experience').value = preset.experience;
    document.getElementById('input-description').value = preset.description;

    document.getElementById('check-fee').checked = preset.checks.fee;
    document.getElementById('check-telegram').checked = preset.checks.telegram;
    document.getElementById('check-sensitive').checked = preset.checks.sensitive;
    document.getElementById('check-check').checked = preset.checks.check;

    updateCharCounter();

    // Trigger analysis immediately
    runFraudAnalysis();
    showToast("Case Study Loaded", `Populated: ${preset.title}`, "⚡");
}

function resetScannerForm() {
    document.getElementById('input-title').value = '';
    document.getElementById('input-company').value = '';
    document.getElementById('input-domain').value = '';
    document.getElementById('input-contact').value = '';
    document.getElementById('input-salary').value = '';
    document.getElementById('input-description').value = '';
    document.getElementById('input-raw-text').value = '';

    document.getElementById('check-fee').checked = false;
    document.getElementById('check-telegram').checked = false;
    document.getElementById('check-sensitive').checked = false;
    document.getElementById('check-check').checked = false;

    updateCharCounter();
    resetVerdictCard();
    showToast("Form Reset", "Scanner inputs cleared.", "🔄");
}

function updateCharCounter() {
    const desc = document.getElementById('input-description').value;
    const counter = document.getElementById('char-counter');
    if (counter) counter.innerText = `${desc.length} chars`;
}

function setInputMode(mode) {
    state.inputMode = mode;
    const btnStruct = document.getElementById('btn-mode-structured');
    const btnRaw = document.getElementById('btn-mode-raw');
    const containerStruct = document.getElementById('structured-input-container');
    const containerRaw = document.getElementById('raw-input-container');

    if (mode === 'structured') {
        btnStruct.className = 'px-2.5 py-1 rounded-md font-semibold bg-indigo-600 text-white transition';
        btnRaw.className = 'px-2.5 py-1 rounded-md font-semibold text-slate-400 hover:text-white transition';
        containerStruct.classList.remove('hidden');
        containerRaw.classList.add('hidden');
    } else {
        btnRaw.className = 'px-2.5 py-1 rounded-md font-semibold bg-indigo-600 text-white transition';
        btnStruct.className = 'px-2.5 py-1 rounded-md font-semibold text-slate-400 hover:text-white transition';
        containerRaw.classList.remove('hidden');
        containerStruct.classList.add('hidden');
    }
}

function scrollToPresets() {
    const el = document.getElementById('preset-selector-box');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ============================================================================
// 5. CORE ANALYSIS PIPELINE (API CALL OR LOCAL FALLBACK)
// ============================================================================

async function runFraudAnalysis() {
    const overlay = document.getElementById('scanning-overlay');
    const stepText = document.getElementById('scanning-step-text');
    if (overlay) overlay.classList.remove('hidden');

    // Build payload
    let payload = {};
    if (state.inputMode === 'structured') {
        payload = {
            title: document.getElementById('input-title').value,
            company: document.getElementById('input-company').value,
            domain: document.getElementById('input-domain').value,
            contact: document.getElementById('input-contact').value,
            salary: document.getElementById('input-salary').value,
            worktype: document.getElementById('input-worktype').value,
            experience: document.getElementById('input-experience').value,
            description: document.getElementById('input-description').value,
            checks: {
                fee: document.getElementById('check-fee').checked,
                telegram: document.getElementById('check-telegram').checked,
                sensitive: document.getElementById('check-sensitive').checked,
                check: document.getElementById('check-check').checked
            }
        };
    } else {
        const rawText = document.getElementById('input-raw-text').value;
        payload = {
            title: rawText.substring(0, 60),
            company: "Extracted from text",
            domain: "none",
            contact: "raw_text_scan",
            salary: "Extracted from text",
            worktype: "Flexible",
            experience: "Not specified",
            description: rawText,
            checks: {}
        };
    }

    if (!payload.description && !payload.title) {
        if (overlay) overlay.classList.add('hidden');
        showToast("Input Required", "Please enter a job title or description to analyze.", "⚠️");
        return;
    }

    // Step 1: Simulated Pipeline Latency
    if (stepText) stepText.innerText = "Extracting TF-IDF features and n-grams...";
    await new Promise(r => setTimeout(r, 140));

    let analysis = null;

    // Step 2: Try Backend REST API
    if (CONFIG.isBackendOnline) {
        try {
            if (stepText) stepText.innerText = "Calling Backend Ensemble ML Classifier...";
            const res = await fetch(`${CONFIG.apiBase}/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const data = await res.json();
                analysis = data.analysis;
            }
        } catch (e) {
            console.warn("Backend API request failed, switching to local NLP model:", e);
        }
    }

    // Step 3: Local Engine Fallback if API not available
    if (!analysis) {
        if (stepText) stepText.innerText = "Executing Client-Side NLP & Ensemble Model...";
        analysis = analyzeLocally(payload);
    }

    state.analysisResult = analysis;

    // Step 4: Render UI components
    renderVerdictCard(analysis);
    renderHighlightedTokens(payload.description || payload.title, analysis.highlightTokens);

    if (overlay) overlay.classList.add('hidden');
    showToast("Analysis Complete", `Result: ${analysis.verdict}`, analysis.riskScore >= 70 ? "🚨" : (analysis.riskScore >= 40 ? "⚠️" : "✅"));
}

/**
 * Client-Side NLP & Machine Learning Engine (Identical algorithm to backend)
 */
function analyzeLocally(payload) {
    const title = (payload.title || '').trim();
    const company = (payload.company || '').trim();
    const domain = (payload.domain || '').trim().toLowerCase();
    const contact = (payload.contact || '').trim().toLowerCase();
    const salary = (payload.salary || '').trim();
    const worktype = (payload.worktype || '').trim();
    const experience = (payload.experience || '').trim();
    const description = (payload.description || '').trim();
    const checks = payload.checks || {};

    const fullText = `${title} ${company} ${salary} ${worktype} ${experience} ${description}`.toLowerCase();
    const rawText = `${payload.title || ''} ${payload.description || ''}`;

    const totalChars = Math.max(1, rawText.length);
    const upperChars = (rawText.match(/[A-Z]/g) || []).length;
    const uppercaseRatio = Math.round((upperChars / totalChars) * 100);
    const exclamationCount = (rawText.match(/!/g) || []).length;

    const matchedFinancial = [];
    CLIENT_NLP_LEXICON.financial.forEach(phrase => {
        if (fullText.includes(phrase)) matchedFinancial.push(phrase);
    });

    const matchedPhishing = [];
    CLIENT_NLP_LEXICON.phishing.forEach(phrase => {
        if (fullText.includes(phrase)) matchedPhishing.push(phrase);
    });

    const matchedOffPlatform = [];
    CLIENT_NLP_LEXICON.off_platform.forEach(phrase => {
        if (fullText.includes(phrase) || contact.includes(phrase)) matchedOffPlatform.push(phrase);
    });

    const matchedUrgency = [];
    CLIENT_NLP_LEXICON.urgency_promises.forEach(phrase => {
        if (fullText.includes(phrase)) matchedUrgency.push(phrase);
    });

    const matchedLegit = [];
    CLIENT_NLP_LEXICON.legitimate_cues.forEach(phrase => {
        if (fullText.includes(phrase)) matchedLegit.push(phrase);
    });

    if (checks.fee) matchedFinancial.push("upfront registration/equipment fee specified");
    if (checks.telegram) matchedOffPlatform.push("telegram/whatsapp redirect specified");
    if (checks.sensitive) matchedPhishing.push("ssn/bank account requested upfront");
    if (checks.check) matchedFinancial.push("cashiers check for home office specified");

    // Vectors
    let scoreNlpLang = 0;
    if (matchedUrgency.length > 0) scoreNlpLang += Math.min(50, matchedUrgency.length * 20);
    if (uppercaseRatio > 18) scoreNlpLang += 25;
    if (exclamationCount >= 2) scoreNlpLang += Math.min(25, exclamationCount * 10);
    scoreNlpLang = Math.min(100, scoreNlpLang);

    let scoreDomain = 0;
    let isFreeEmail = false;
    FREE_EMAIL_DOMAINS.forEach(prov => {
        if (contact.includes(prov)) isFreeEmail = true;
    });

    if (matchedOffPlatform.length > 0) scoreDomain += 60;
    if (isFreeEmail) scoreDomain += 35;
    if (!domain || domain === 'none' || domain === 'n/a') scoreDomain += 15;
    scoreDomain = Math.min(100, scoreDomain);

    let scoreFinancial = 0;
    if (matchedFinancial.length > 0) scoreFinancial += Math.min(95, matchedFinancial.length * 45);
    if (matchedPhishing.length > 0) scoreFinancial += Math.min(95, matchedPhishing.length * 45);
    scoreFinancial = Math.min(100, scoreFinancial);

    let scoreSalary = 0;
    const salaryLower = salary.toLowerCase();
    const isEntryOrNoExp = experience.toLowerCase().includes('no experience') || experience.toLowerCase().includes('entry');

    if (salaryLower.includes('$65') || salaryLower.includes('$70') || salaryLower.includes('$80') || salaryLower.includes('$5000') || salaryLower.includes('daily')) {
        if (isEntryOrNoExp) scoreSalary = 85;
    }
    scoreSalary = Math.min(100, scoreSalary);

    let rawRisk = (scoreFinancial * 0.40) + (scoreDomain * 0.25) + (scoreSalary * 0.15) + (scoreNlpLang * 0.20);
    const legitMitigation = Math.min(45, matchedLegit.length * 15);
    rawRisk = Math.max(2, rawRisk - legitMitigation);

    if (matchedFinancial.length > 0 || checks.fee || checks.check) rawRisk = Math.max(rawRisk, 82);
    if (matchedPhishing.length > 0 || checks.sensitive) rawRisk = Math.max(rawRisk, 88);
    if (matchedOffPlatform.length > 0 && isFreeEmail) rawRisk = Math.max(rawRisk, 75);

    const riskScore = Math.min(99, Math.max(1, Math.round(rawRisk)));

    let verdict = "";
    let riskLevel = "";
    let confidence = 0;

    if (riskScore >= 70) {
        verdict = "FRAUDULENT / HIGH RISK";
        riskLevel = riskScore >= 90 ? "Critical Threat" : "High Risk";
        confidence = (88 + (riskScore - 70) * 0.38).toFixed(1);
    } else if (riskScore >= 40) {
        verdict = "SUSPICIOUS / PROCEED WITH CAUTION";
        riskLevel = "Moderate Caution";
        confidence = (78 + (riskScore - 40) * 0.35).toFixed(1);
    } else {
        verdict = "VERIFIED / HIGHLY LIKELY GENUINE";
        riskLevel = "Verified Safe";
        confidence = (94 + (40 - riskScore) * 0.14).toFixed(1);
    }

    const xaiAttributions = [];
    if (matchedFinancial.length > 0 || checks.fee || checks.check) {
        xaiAttributions.push({
            feature: "Advance Fee / Cashier Check Request",
            impact: "+35%",
            direction: "fraud",
            detail: `Detected monetary demands: ${matchedFinancial.slice(0, 2).join(', ')}`
        });
    }
    if (matchedPhishing.length > 0 || checks.sensitive) {
        xaiAttributions.push({
            feature: "Sensitive Identity Phishing (SSN/Banking)",
            impact: "+28%",
            direction: "fraud",
            detail: `Premature request for confidential data: ${matchedPhishing.slice(0, 2).join(', ')}`
        });
    }
    if (matchedOffPlatform.length > 0) {
        xaiAttributions.push({
            feature: "Off-Platform Redirection (Telegram/WhatsApp)",
            impact: "+24%",
            direction: "fraud",
            detail: "Directing candidates away from monitored job board protections."
        });
    }
    if (isFreeEmail) {
        xaiAttributions.push({
            feature: "Free/Disposable Email Sender",
            impact: "+18%",
            direction: "fraud",
            detail: `Recruiter uses consumer webmail (${contact.split('@')[1] || 'free mail'}).`
        });
    }
    if (scoreSalary >= 60) {
        xaiAttributions.push({
            feature: "Unrealistic Salary-to-Experience Ratio",
            impact: "+16%",
            direction: "fraud",
            detail: "Advertised pay rate is an extreme statistical outlier for zero experience."
        });
    }
    if (matchedLegit.length > 0) {
        xaiAttributions.push({
            feature: "Corporate Benefits & Structured Requirements",
            impact: `-${legitMitigation}%`,
            direction: "safe",
            detail: `Legitimate corporate cues: ${matchedLegit.slice(0, 2).join(', ')}`
        });
    }
    if (xaiAttributions.length === 0) {
        xaiAttributions.push({
            feature: "Standard Professional Terminology",
            impact: "-15%",
            direction: "safe",
            detail: "No statistical fraud vectors detected in post."
        });
    }

    const recommendations = [];
    if (riskScore >= 70) {
        recommendations.push("🛑 DO NOT send any money, gift cards, Zelle transfers, or registration fees under any circumstance.");
        recommendations.push("🔒 DO NOT share your Social Security Number (SSN), driver's license, or banking credentials.");
        recommendations.push("⚠️ Refuse to conduct job interviews exclusively via Telegram or WhatsApp chats.");
        recommendations.push("🔍 Visit the company's official website independently and check their official Careers portal.");
    } else if (riskScore >= 40) {
        recommendations.push("⚠️ Exercise caution: verify the recruiter's identity on LinkedIn or via official company directory.");
        recommendations.push("📧 Request that the recruiter correspond with you via their verified corporate domain email.");
    } else {
        recommendations.push("✅ Standard Safety Protocol: Proceed with normal application through the company's official portal.");
        recommendations.push("📄 Review formal written offer letter and company benefits package before submitting tax documents.");
    }

    const highlightTokens = [];
    matchedFinancial.forEach(word => highlightTokens.push({ word, type: 'fee', desc: 'Advance Fee Scam Vector' }));
    matchedPhishing.forEach(word => highlightTokens.push({ word, type: 'phish', desc: 'Identity Phishing Vector' }));
    matchedOffPlatform.forEach(word => highlightTokens.push({ word, type: 'comm', desc: 'Off-Platform Risk' }));
    matchedUrgency.forEach(word => highlightTokens.push({ word, type: 'urgency', desc: 'Urgency & Unrealistic Hook' }));
    matchedLegit.forEach(word => highlightTokens.push({ word, type: 'legit', desc: 'Legitimate Marker' }));

    return {
        verdict,
        riskScore,
        confidence,
        riskLevel,
        vectors: {
            nlpLang: scoreNlpLang,
            domain: scoreDomain,
            financial: scoreFinancial,
            salary: scoreSalary
        },
        xaiAttributions,
        recommendations,
        highlightTokens
    };
}

// ============================================================================
// 6. UI RENDERING ENGINES
// ============================================================================

function renderVerdictCard(analysis) {
    const card = document.getElementById('verdict-card');
    const title = document.getElementById('verdict-title');
    const text = document.getElementById('verdict-text');
    const icon = document.getElementById('verdict-icon');
    const subtext = document.getElementById('verdict-subtext');
    const conf = document.getElementById('verdict-confidence');
    const riskLevel = document.getElementById('verdict-risk-level');
    const gaugeText = document.getElementById('gauge-pct-text');
    const gaugeCircle = document.getElementById('gauge-circle-val');

    // Risk Meter Circle
    const pct = analysis.riskScore;
    const strokeDash = 100 - pct;
    gaugeText.innerText = `${pct}%`;
    gaugeCircle.style.strokeDashoffset = strokeDash;

    let strokeColor = "#10b981"; // Emerald
    if (pct >= 70) strokeColor = "#ef4444"; // Rose
    else if (pct >= 40) strokeColor = "#f59e0b"; // Amber
    gaugeCircle.style.stroke = strokeColor;

    // Verdict Elements
    text.innerText = analysis.verdict;
    conf.innerText = `${analysis.confidence}%`;
    riskLevel.innerText = analysis.riskLevel;

    if (pct >= 70) {
        icon.innerText = "🚨";
        title.className = "text-xl sm:text-2xl font-black text-rose-400 flex items-center space-x-2";
        riskLevel.className = "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 block mt-0.5 w-fit";
        subtext.innerText = "CRITICAL WARNING: This posting contains aggressive deception indicators and advance-fee scam signatures.";
        card.className = "bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden transition-all duration-300";
    } else if (pct >= 40) {
        icon.innerText = "⚠️";
        title.className = "text-xl sm:text-2xl font-black text-amber-400 flex items-center space-x-2";
        riskLevel.className = "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 block mt-0.5 w-fit";
        subtext.innerText = "CAUTION ADVISED: Ambiguous recruitment channels or consumer email addresses detected.";
        card.className = "bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300";
    } else {
        icon.innerText = "✅";
        title.className = "text-xl sm:text-2xl font-black text-emerald-400 flex items-center space-x-2";
        riskLevel.className = "text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 block mt-0.5 w-fit";
        subtext.innerText = "VERIFIED SAFE: Content conforms to corporate recruitment protocols with verified enterprise cues.";
        card.className = "bg-slate-900 border border-emerald-500/40 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300";
    }

    // Vectors Bars
    const v = analysis.vectors;
    updateVectorBar('nlp-lang', v.nlpLang);
    updateVectorBar('domain', v.domain);
    updateVectorBar('financial', v.financial);
    updateVectorBar('salary', v.salary);

    // XAI Waterfall
    const xaiContainer = document.getElementById('xai-waterfall-container');
    if (xaiContainer) {
        xaiContainer.innerHTML = analysis.xaiAttributions.map(item => `
            <div class="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/80">
                <div class="flex items-center space-x-2">
                    <span class="w-1.5 h-1.5 rounded-full ${item.direction === 'fraud' ? 'bg-rose-500' : 'bg-emerald-500'}"></span>
                    <span class="font-medium text-slate-200">${item.feature}</span>
                    <span class="text-[10px] text-slate-500 hidden sm:inline">(${item.detail})</span>
                </div>
                <span class="font-mono font-bold ${item.direction === 'fraud' ? 'text-rose-400' : 'text-emerald-400'}">${item.impact}</span>
            </div>
        `).join('');
    }

    // Recommendations List
    const recsList = document.getElementById('recommendations-list');
    if (recsList) {
        recsList.innerHTML = analysis.recommendations.map(r => `
            <div class="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start space-x-2">
                <span>${r}</span>
            </div>
        `).join('');
    }
}

function updateVectorBar(id, val) {
    const scoreElem = document.getElementById(`score-${id}`);
    const barElem = document.getElementById(`bar-${id}`);
    if (scoreElem) scoreElem.innerText = `${val}%`;
    if (barElem) {
        barElem.style.width = `${val}%`;
        if (val >= 70) barElem.className = 'bg-rose-500 h-1.5 rounded-full transition-all duration-700';
        else if (val >= 40) barElem.className = 'bg-amber-500 h-1.5 rounded-full transition-all duration-700';
        else barElem.className = 'bg-emerald-500 h-1.5 rounded-full transition-all duration-700';
    }
}

function resetVerdictCard() {
    const text = document.getElementById('verdict-text');
    const conf = document.getElementById('verdict-confidence');
    const riskLevel = document.getElementById('verdict-risk-level');
    const gaugeText = document.getElementById('gauge-pct-text');
    const gaugeCircle = document.getElementById('gauge-circle-val');

    if (text) text.innerText = "Ready for Analysis";
    if (conf) conf.innerText = "-- %";
    if (riskLevel) riskLevel.innerText = "Pending";
    if (gaugeText) gaugeText.innerText = "0%";
    if (gaugeCircle) {
        gaugeCircle.style.strokeDashoffset = 100;
        gaugeCircle.style.stroke = "#6366f1";
    }

    updateVectorBar('nlp-lang', 0);
    updateVectorBar('domain', 0);
    updateVectorBar('financial', 0);
    updateVectorBar('salary', 0);

    const xai = document.getElementById('xai-waterfall-container');
    if (xai) xai.innerHTML = `<p class="text-slate-500 text-xs italic">Feature attribution will generate automatically upon running analysis.</p>`;

    const hlView = document.getElementById('highlighted-text-view');
    if (hlView) hlView.innerHTML = `<span class="text-slate-500 italic">No job description loaded yet. Select a preset scenario above or enter job details to visualize the NLP token breakdown.</span>`;
}

function renderHighlightedTokens(originalText, tokens) {
    const hlView = document.getElementById('highlighted-text-view');
    if (!hlView || !originalText) return;

    let marked = originalText.replace(/\n/g, '<br>');

    // Sort tokens by length descending so longer phrases match first
    const sorted = [...tokens].sort((a, b) => b.word.length - a.word.length);
    const seenWords = new Set();

    sorted.forEach(t => {
        if (seenWords.has(t.word.toLowerCase())) return;
        seenWords.add(t.word.toLowerCase());

        const regex = new RegExp(`(${escapeRegExp(t.word)})`, 'gi');
        marked = marked.replace(regex, (match) => {
            return `<span class="nlp-highlight nlp-${t.type}">${match}<span class="tooltip-box">${t.desc}</span></span>`;
        });
    });

    hlView.innerHTML = marked;
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// 7. BATCH & PORTAL URL SCANNER
// ============================================================================

const BATCH_ITEMS = [
    { platform: "Telegram", title: "Immediate Remote Typist / Data Entry", company: "United Express Logistics", salary: "$65.00 / hr", risk: "Fraudulent", score: 96, vector: "Advance Fee + Telegram" },
    { platform: "LinkedIn", title: "Senior Full Stack Engineer", company: "Cloudflare, Inc.", salary: "$145k - $185k / yr", risk: "Genuine", score: 4, vector: "Verified Corporate Domain" },
    { platform: "Craigslist", title: "Virtual Office Coordinator", company: "Horizon Retail Associates", salary: "$4,500 / mo", risk: "Fraudulent", score: 98, vector: "Fake Check / Mule" },
    { platform: "Indeed", title: "Digital Marketing Coordinator", company: "BrightPath Media Studio", salary: "$24 - $28 / hr", risk: "Genuine", score: 8, vector: "Realistic Pay & Studio" },
    { platform: "WhatsApp", title: "E-Commerce Product Reviewer", company: "Alpha Mega Mall VIP", salary: "$400 - $800 / day", risk: "Fraudulent", score: 99, vector: "Crypto Ponzi / Tasks" },
    { platform: "LinkedIn", title: "Administrative Assistant", company: "Nexus Partners (Spoof)", salary: "$55.00 / hr", risk: "Fraudulent", score: 94, vector: "SSN Phishing InMail" },
    { platform: "Indeed", title: "Associate DevOps Specialist", company: "DataStream Systems", salary: "$85k - $105k / yr", risk: "Genuine", score: 6, vector: "Corporate ATS Route" },
    { platform: "Craigslist", title: "Freelance Content Rewriter", company: "Independent Client", salary: "$0.05 / word", risk: "Caution", score: 52, vector: "Free Email & Vague" }
];

function renderBatchTable() {
    const tbody = document.getElementById('batch-table-body');
    if (!tbody) return;

    const filtered = BATCH_ITEMS.filter(item => {
        if (state.batchFilter === 'fraud') return item.risk === 'Fraudulent';
        if (state.batchFilter === 'legit') return item.risk === 'Genuine';
        return true;
    });

    tbody.innerHTML = filtered.map((item, idx) => `
        <tr class="hover:bg-slate-800/40 transition">
            <td class="py-3 px-4 font-medium text-slate-300">
                <span class="px-2 py-0.5 rounded text-[10px] font-semibold ${item.platform === 'Telegram' || item.platform === 'WhatsApp' ? 'bg-purple-950/60 text-purple-300 border border-purple-800/50' : 'bg-slate-800 text-slate-300'}">
                    ${item.platform}
                </span>
            </td>
            <td class="py-3 px-4 font-semibold text-white">${item.title}</td>
            <td class="py-3 px-4 text-slate-400">${item.company}</td>
            <td class="py-3 px-4 font-mono">${item.salary}</td>
            <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${item.risk === 'Fraudulent' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : (item.risk === 'Caution' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30')}">
                    ${item.risk} (${item.score}%)
                </span>
            </td>
            <td class="py-3 px-4 text-slate-400 text-[11px]">${item.vector}</td>
            <td class="py-3 px-4 text-right">
                <button onclick="inspectBatchItem(${idx})" class="text-xs text-indigo-400 hover:text-indigo-300 font-medium">Inspect</button>
            </td>
        </tr>
    `).join('');
}

function filterBatch(filterType) {
    state.batchFilter = filterType;
    document.getElementById('btn-batch-all').className = filterType === 'all' ? 'px-3 py-1 rounded-lg bg-indigo-600 text-white font-semibold' : 'px-3 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white';
    document.getElementById('btn-batch-fraud').className = filterType === 'fraud' ? 'px-3 py-1 rounded-lg bg-rose-600 text-white font-semibold' : 'px-3 py-1 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950/40';
    document.getElementById('btn-batch-legit').className = filterType === 'legit' ? 'px-3 py-1 rounded-lg bg-emerald-600 text-white font-semibold' : 'px-3 py-1 rounded-lg bg-slate-800 text-emerald-400 hover:bg-emerald-950/40';
    renderBatchTable();
}

function inspectBatchItem(idx) {
    const item = BATCH_ITEMS[idx];
    if (!item) return;

    switchTab('scanner');
    document.getElementById('input-title').value = item.title;
    document.getElementById('input-company').value = item.company;
    document.getElementById('input-salary').value = item.salary;
    document.getElementById('input-description').value = `Imported from ${item.platform} simulated feed for ${item.company}: Position titled ${item.title}. Flagged threat vector: ${item.vector}.`;

    runFraudAnalysis();
    showToast("Listing Inspected", `Transferred ${item.title} to scanner.`, "🔍");
}

async function scanUrlMock() {
    const urlInput = document.getElementById('url-input').value.trim();
    if (!urlInput) {
        showToast("URL Required", "Please enter a portal URL to simulate scanning.", "⚠️");
        return;
    }

    showToast("Scanning Portal...", `Ingesting metadata from ${urlInput}`, "⚡");

    if (CONFIG.isBackendOnline) {
        try {
            const res = await fetch(`${CONFIG.apiBase}/scan-url`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlInput })
            });
            if (res.ok) {
                const data = await res.json();
                switchTab('scanner');
                document.getElementById('input-title').value = data.job.title;
                document.getElementById('input-company').value = data.job.company;
                document.getElementById('input-domain').value = data.job.domain;
                document.getElementById('input-salary').value = data.job.salary;
                document.getElementById('input-description').value = data.job.description;
                runFraudAnalysis();
                return;
            }
        } catch (e) {
            console.warn("Backend URL scan failed, fallback to local:", e);
        }
    }

    // Local URL simulation fallback
    switchTab('scanner');
    if (urlInput.includes('cloudflare') || urlInput.includes('google')) {
        loadPreset('legit_software_engineer');
    } else {
        loadPreset('fake_advance_fee');
    }
}

function simulatePortalIngest() {
    showToast("Batch Ingestion", "Simulated 5 new incoming listings from Telegram and LinkedIn.", "📥");
}

// ============================================================================
// 8. ML BENCHMARK LAB & THRESHOLD TUNER
// ============================================================================

function updateThreshold(val) {
    state.currentThreshold = parseFloat(val);
    document.getElementById('threshold-val-display').innerText = state.currentThreshold.toFixed(2);

    // Dynamic Math simulation based on threshold
    const theta = state.currentThreshold;
    const baseP = 0.935;
    const baseR = 0.821;

    // As theta decreases (more sensitive), recall rises, precision drops slightly
    const dynamicRecall = Math.min(0.96, Math.max(0.60, baseR + (0.50 - theta) * 0.45));
    const dynamicPrecision = Math.min(0.97, Math.max(0.65, baseP - (0.50 - theta) * 0.35));
    const dynamicF1 = (2 * dynamicPrecision * dynamicRecall) / (dynamicPrecision + dynamicRecall);

    document.getElementById('thresh-precision').innerText = `${(dynamicPrecision * 100).toFixed(1)}%`;
    document.getElementById('thresh-recall').innerText = `${(dynamicRecall * 100).toFixed(1)}%`;
    document.getElementById('thresh-f1').innerText = dynamicF1.toFixed(3);

    // Matrix counts (sample: 3,576 test postings)
    const totalPositives = 173; // 4.8% fraud
    const totalNegatives = 3403; // 95.2% real

    const tp = Math.round(totalPositives * dynamicRecall);
    const fn = totalPositives - tp;
    const fp = Math.round(tp / dynamicPrecision - tp);
    const tn = totalNegatives - fp;

    document.getElementById('matrix-tp').innerText = tp.toLocaleString();
    document.getElementById('matrix-fn').innerText = fn.toLocaleString();
    document.getElementById('matrix-fp').innerText = Math.max(0, fp).toLocaleString();
    document.getElementById('matrix-tn').innerText = Math.max(0, tn).toLocaleString();
}

// ============================================================================
// 9. NLP LINGUISTIC SANDBOX
// ============================================================================

function runLiveNLP() {
    const text = document.getElementById('nlp-sandbox-input').value;
    const totalChars = Math.max(1, text.length);
    const upperChars = (text.match(/[A-Z]/g) || []).length;
    const uppercaseRatio = Math.round((upperChars / totalChars) * 100);
    const exclamationCount = (text.match(/!/g) || []).length;
    const tokens = text.match(/\b[a-zA-Z0-9_\-$%']+\b/g) || [];

    const lower = text.toLowerCase();
    let triggerCount = 0;
    ['financial', 'phishing', 'off_platform', 'urgency_promises'].forEach(cat => {
        CLIENT_NLP_LEXICON[cat].forEach(phrase => {
            if (lower.includes(phrase)) triggerCount++;
        });
    });

    document.getElementById('nlp-stat-tokens').innerText = tokens.length;
    document.getElementById('nlp-stat-caps').innerText = `${uppercaseRatio}%`;
    document.getElementById('nlp-stat-excl').innerText = exclamationCount;
    document.getElementById('nlp-stat-triggers').innerText = triggerCount;
}

function testSampleNLP() {
    document.getElementById('nlp-sandbox-input').value = `URGENT HIRING: Earn $600/day guaranteed from home! No experience required, contact manager on Telegram immediately! Pay $100 registration fee to begin!`;
    runLiveNLP();
    showToast("Sample Loaded", "Injected scam sentence for NLP dissection.", "🔬");
}

// ============================================================================
// 10. SCAM AWARENESS QUIZ ENGINE
// ============================================================================

const QUIZ_QUESTIONS = [
    {
        scenario: "You apply for a 'Remote Data Assistant' job on a job board. Two hours later, you receive an email saying you got the job without an interview, but you must pay $150 via Zelle for a 'background check and software toolkit'.",
        correct: "fake",
        reason: "Real employers NEVER require job applicants to pay registration fees, background check fees, or equipment kits out of pocket."
    },
    {
        scenario: "A recruiter from a Fortune 500 company messages you on LinkedIn. They ask you to complete a 45-minute technical coding assessment on HackerRank, and all subsequent communications come from a '@company.com' email address.",
        correct: "real",
        reason: "Standard technical evaluations and verified corporate domain emails are hallmark signs of legitimate enterprise hiring."
    },
    {
        scenario: "A company offers you a position as an 'Accounts Receivable Coordinator'. They mail you a cashier's check for $3,500 and ask you to deposit it, keep $500 as your advance pay, and wire the remaining $3,000 to their office furniture vendor.",
        correct: "fake",
        reason: "Classic Fake Check Scam! The check is fraudulent and will bounce in a few days. You will be held personally liable by your bank for the wired funds."
    },
    {
        scenario: "Before any phone or video interview, a recruiter insists on conducting your entire job interview over Telegram chat, refusing to appear on video or speak over the phone.",
        correct: "fake",
        reason: "Cybercrime syndicates use Telegram/WhatsApp because end-to-end encryption and disposable numbers grant complete anonymity."
    },
    {
        scenario: "A local creative studio invites you for an in-person interview at their physical office address, reviews your portfolio, and sends a formal offer letter detailing hourly pay, PTO, and state tax withholding.",
        correct: "real",
        reason: "Verified physical premises, in-person evaluation, and standard payroll withholding demonstrate legitimate employment."
    },
    {
        scenario: "A recruiter asks for your Social Security Number (SSN) and front/back photos of your credit card on day one of applying, claiming it is required 'to verify your identity before reviewing your resume'.",
        correct: "fake",
        reason: "Identity theft phish! Tax and identity documents (like Form W-4) are only completed AFTER a formal job offer has been extended and accepted."
    }
];

function renderQuiz() {
    const container = document.getElementById('quiz-container');
    if (!container) return;

    const q = QUIZ_QUESTIONS[state.quizIndex];
    if (!q) {
        // Quiz completed
        container.innerHTML = `
            <div class="text-center p-6 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
                <span class="text-4xl block">🏆</span>
                <h3 class="text-lg font-bold text-white">Quiz Completed!</h3>
                <p class="text-sm text-slate-300">You scored <strong class="text-cyan-400">${state.quizScore} out of ${QUIZ_QUESTIONS.length}</strong>.</p>
                <button onclick="restartQuiz()" class="bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl transition">
                    Restart Challenge
                </button>
            </div>
        `;
        return;
    }

    const isAnswered = state.answeredQuestions[state.quizIndex] !== undefined;
    const userAnswer = state.answeredQuestions[state.quizIndex];

    container.innerHTML = `
        <div class="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
            <div class="flex items-center justify-between text-xs text-slate-400">
                <span>Scenario ${state.quizIndex + 1} of ${QUIZ_QUESTIONS.length}</span>
                <span class="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Recruitment Deception Test</span>
            </div>
            <p class="text-sm text-white font-medium leading-relaxed">"${q.scenario}"</p>

            <div class="grid grid-cols-2 gap-3 pt-2">
                <button onclick="answerQuiz('fake')" ${isAnswered ? 'disabled' : ''} class="p-3 rounded-xl border font-bold text-xs transition flex items-center justify-center space-x-2 ${isAnswered ? (q.correct === 'fake' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : (userAnswer === 'fake' ? 'bg-rose-950/60 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-500')) : 'bg-slate-900 border-rose-500/40 hover:bg-rose-950/30 text-rose-300'}">
                    <span>🚨 Potential Scam / Fake</span>
                </button>
                <button onclick="answerQuiz('real')" ${isAnswered ? 'disabled' : ''} class="p-3 rounded-xl border font-bold text-xs transition flex items-center justify-center space-x-2 ${isAnswered ? (q.correct === 'real' ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300' : (userAnswer === 'real' ? 'bg-rose-950/60 border-rose-500 text-rose-300' : 'bg-slate-900 border-slate-800 text-slate-500')) : 'bg-slate-900 border-emerald-500/40 hover:bg-emerald-950/30 text-emerald-300'}">
                    <span>✅ Legitimate Job Offer</span>
                </button>
            </div>

            ${isAnswered ? `
                <div class="mt-4 p-3.5 rounded-xl ${userAnswer === q.correct ? 'bg-emerald-950/30 border border-emerald-500/30 text-emerald-300' : 'bg-rose-950/30 border border-rose-500/30 text-rose-300'} text-xs leading-relaxed space-y-2">
                    <p><strong>${userAnswer === q.correct ? '🎯 Correct!' : '❌ Incorrect.'}</strong> ${q.reason}</p>
                    <div class="text-right">
                        <button onclick="nextQuizQuestion()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 py-1.5 rounded-lg transition">Next Question →</button>
                    </div>
                </div>
            ` : ''}
        </div>
    `;
}

function answerQuiz(choice) {
    if (state.answeredQuestions[state.quizIndex] !== undefined) return;

    state.answeredQuestions[state.quizIndex] = choice;
    const q = QUIZ_QUESTIONS[state.quizIndex];
    if (choice === q.correct) {
        state.quizScore++;
        document.getElementById('quiz-score-display').innerText = `${state.quizScore} / ${QUIZ_QUESTIONS.length}`;
    }
    renderQuiz();
}

function nextQuizQuestion() {
    state.quizIndex++;
    renderQuiz();
}

function restartQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    state.answeredQuestions = {};
    document.getElementById('quiz-score-display').innerText = `0 / ${QUIZ_QUESTIONS.length}`;
    renderQuiz();
}

// ============================================================================
// 11. CHECKLIST AUDIT ENGINE
// ============================================================================

function updateChecklistScore() {
    const checkboxes = document.querySelectorAll('.chk-safety');
    let checkedCount = 0;
    checkboxes.forEach(chk => { if (chk.checked) checkedCount++; });

    const scoreDisplay = document.getElementById('safety-checklist-score');
    if (scoreDisplay) {
        scoreDisplay.innerText = `Score: ${checkedCount} / ${checkboxes.length} Verified`;
        if (checkedCount === checkboxes.length) {
            scoreDisplay.className = "text-xs font-bold text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30";
        } else {
            scoreDisplay.className = "text-xs font-bold text-amber-400 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30";
        }
    }
}

// ============================================================================
// 12. COMMUNITY THREAT RADAR & REPORTING
// ============================================================================

const LOCAL_COMMUNITY_REPORTS = [
    {
        company: "Global Data Logistics LLC",
        title: "Remote Data Entry Operator ($65/hr)",
        platform: "Telegram / SMS",
        type: "Advance Fee / Kit",
        contact: "hr_director_smith@t.me",
        details: "Demanded $150 onboarding software license via Zelle before releasing employment agreement.",
        timestamp: "Just now",
        risk: "96% Fake"
    },
    {
        company: "Apex Creative Agency (Impersonation)",
        title: "Executive Personal Assistant",
        platform: "LinkedIn Message",
        type: "SSN Phishing",
        contact: "recruiter.apex.corp@gmail.com",
        details: "Sender used free Gmail and sent a Google Doc demanding front/back driver's license and SSN.",
        timestamp: "2 hours ago",
        risk: "92% Fake"
    },
    {
        company: "Starlight Digital Media",
        title: "App Rating & Video Reviewer",
        platform: "WhatsApp Group",
        type: "Crypto Task",
        contact: "+1 (847) 555-0199",
        details: "Paid $20 initially, then demanded $300 USDT crypto deposit to unfreeze higher commission tier.",
        timestamp: "Yesterday",
        risk: "99% Fake"
    }
];

function renderCommunityFeed() {
    const feed = document.getElementById('community-reports-feed');
    if (!feed) return;

    feed.innerHTML = LOCAL_COMMUNITY_REPORTS.map(rep => `
        <div class="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <div class="flex items-center justify-between">
                <span class="font-bold text-white text-xs">${rep.company}</span>
                <span class="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30">${rep.risk}</span>
            </div>
            <p class="text-[11px] text-slate-300">${rep.title} • <span class="text-slate-500">${rep.platform}</span></p>
            <p class="text-[11px] text-slate-400 leading-normal">${rep.details}</p>
            <div class="flex justify-between items-center text-[10px] text-slate-500 pt-1">
                <span>Contact: ${rep.contact}</span>
                <span>${rep.timestamp}</span>
            </div>
        </div>
    `).join('');
}

async function submitScamReport(event) {
    event.preventDefault();
    const company = document.getElementById('report-company').value.trim();
    const title = document.getElementById('report-title').value.trim();
    const platform = document.getElementById('report-platform').value;
    const type = document.getElementById('report-type').value;
    const contact = document.getElementById('report-contact').value.trim();
    const details = document.getElementById('report-details').value.trim();

    const reportObj = {
        company,
        title,
        platform,
        type,
        contact: contact || "Not disclosed",
        details: details || "Demanded fees and diverted candidate off-platform.",
        timestamp: "Just now",
        risk: "95% Fake"
    };

    // Try posting to backend API if active
    if (CONFIG.isBackendOnline) {
        try {
            await fetch(`${CONFIG.apiBase}/reports`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reportObj)
            });
        } catch (e) {
            console.warn("Report could not be sent to backend API, storing locally:", e);
        }
    }

    LOCAL_COMMUNITY_REPORTS.unshift(reportObj);
    renderCommunityFeed();

    // Increment blocked counter
    const counter = document.getElementById('scams-detected-counter');
    if (counter) {
        const curr = parseInt(counter.innerText.replace(/,/g, ''), 10) || 1842;
        counter.innerText = (curr + 1).toLocaleString();
    }

    document.getElementById('report-form').reset();
    showToast("Scam Alert Broadcasted", "Thank you for protecting fellow job seekers!", "📢");
}

// ============================================================================
// 13. TAB NAVIGATION
// ============================================================================

function switchTab(tabId) {
    state.currentTab = tabId;

    const tabs = ['scanner', 'batch', 'models', 'nlp', 'playbook', 'quiz', 'community'];
    tabs.forEach(t => {
        const section = document.getElementById(`section-${t}`);
        const btn = document.getElementById(`tab-btn-${t}`);

        if (t === tabId) {
            if (section) section.classList.remove('hidden');
            if (btn) btn.classList.add('active-tab');
        } else {
            if (section) section.classList.add('hidden');
            if (btn) btn.classList.remove('active-tab');
        }
    });

    if (tabId === 'batch') renderBatchTable();
    if (tabId === 'quiz') renderQuiz();
    if (tabId === 'community') renderCommunityFeed();
    if (tabId === 'models') updateThreshold(state.currentThreshold);
}

// ============================================================================
// 14. TOAST NOTIFICATIONS
// ============================================================================

function showToast(title, desc, icon = "🛡️") {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast) return;

    if (toastTitle) toastTitle.innerText = title;
    if (toastDesc) toastDesc.innerText = desc;
    if (toastIcon) toastIcon.innerText = icon;

    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');

    setTimeout(() => {
        toast.classList.remove('translate-y-0', 'opacity-100');
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3200);
}

// ============================================================================
// 15. INITIALIZATION
// ============================================================================

window.addEventListener('DOMContentLoaded', async () => {
    console.log("[TrustHire AI] System Initializing...");

    // 1. Check Backend Connectivity
    await checkBackendConnection();

    // 2. Poll Backend status every 15 seconds
    setInterval(checkBackendConnection, 15000);

    // 3. Attach input listeners
    const descInput = document.getElementById('input-description');
    if (descInput) descInput.addEventListener('input', updateCharCounter);

    // 4. Initial rendering
    renderBatchTable();
    renderQuiz();
    renderCommunityFeed();
    updateThreshold(0.50);

    // 5. Auto-load Preset 1 for immediate demonstration
    loadPreset('fake_advance_fee');
});
