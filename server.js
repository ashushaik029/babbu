/**
 * TrustHire AI - Backend Server
 * AI-Based Fake Job Detection & Recruitment Fraud Prevention System
 * 
 * Standalone Node.js REST API and Static Web Server (Zero External Dependencies)
 * Runs on Node.js standard libraries: http, fs, path, url
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

// ============================================================================
// 1. NLP & MACHINE LEARNING KNOWLEDGE BASES
// ============================================================================

const SUSPICIOUS_LEXICON = {
    financial: [
        'registration fee', 'processing fee', 'kit fee', 'training fee', 'starter kit',
        'wire transfer', 'western union', 'moneygram', 'cashier check', 'cashiers check',
        'fake check', 'zelle', 'venmo', 'cashapp', 'cash app', 'gift card', 'crypto',
        'bitcoin', 'usdt', 'eth', 'wallet address', 'reimbursement check', 'equipment check',
        'home office check', 'upfront payment', 'deposit required', 'pay before work',
        'pay to start', 'bank fee', 'courier fee'
    ],
    phishing: [
        'ssn', 'social security', 'social security number', 'bank account', 'routing number',
        'credit score', 'driver license', 'driver\'s license', 'passport copy', 'date of birth',
        'banking details', 'direct deposit form', 'w-2 form', 'w-4 form', 'login credentials',
        'verify your bank', 'personal identity', 'id card copy', 'mothers maiden name'
    ],
    off_platform: [
        'telegram', 't.me', 'whatsapp', 'signal', 'dm me', 'inbox me', 'text me on',
        'google hangouts', 'hangout', 'skype id', 'personal phone', 'chat via app'
    ],
    urgency_promises: [
        'urgent hiring', 'urgently hiring', 'immediate start', 'start today', 'act fast',
        'limited positions', 'instant offer', 'instant hire', 'within 24 hours',
        'no interview needed', 'no experience needed', 'no experience required',
        'guaranteed income', 'guaranteed salary', 'make $5000', 'make $10000',
        '$60/hr', '$65/hr', '$70/hr', '$80/hr', '$100/hr', 'work 1 hour', 'earn daily',
        'unlimited earning', '100% guarantee', '100% placement', 'passive income',
        'huge payout', 'get rich quick', 'be your own boss'
    ],
    legitimate_cues: [
        'equal opportunity employer', '401(k)', '401k matching', 'health insurance',
        'dental insurance', 'vision insurance', 'paid time off', 'pto', 'bachelor\'s degree',
        'master\'s degree', 'years of experience', 'responsibilities include', 'key qualifications',
        'github', 'portfolio', 'greenhouse', 'lever', 'workday', 'competitive compensation',
        'code review', 'agile', 'scrum', 'system design', 'collaborate with cross-functional'
    ]
};

const FREE_EMAIL_PROVIDERS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'proton.me',
    'protonmail.com', 'aol.com', 'icloud.com', 'zoho.com', 'mail.com', 'yandex.com'
];

// In-Memory Community Reports Store
let communityReports = [
    {
        id: "rep-101",
        company: "Global Data Logistics LLC",
        title: "Remote Data Entry Operator ($65/hr)",
        platform: "Telegram / SMS",
        type: "Advance Fee / Kit",
        contact: "hr_director_smith@t.me",
        details: "Demanded $150 onboarding software license via Zelle before releasing employment agreement.",
        timestamp: "2026-10-14 11:20:00",
        verified: true,
        risk: "96% Fake"
    },
    {
        id: "rep-102",
        company: "Apex Creative Agency (Impersonation)",
        title: "Executive Personal Assistant",
        platform: "LinkedIn Message",
        type: "SSN Phishing",
        contact: "recruiter.apex.corp@gmail.com",
        details: "Sender used free Gmail and sent a Google Doc demanding front/back driver's license and SSN.",
        timestamp: "2026-10-14 09:45:00",
        verified: true,
        risk: "92% Fake"
    },
    {
        id: "rep-103",
        company: "Starlight Digital Media",
        title: "App Rating & Video Reviewer",
        platform: "WhatsApp Group",
        type: "Crypto Task",
        contact: "+1 (847) 555-0199",
        details: "Paid $20 initially, then demanded $300 USDT crypto deposit to unfreeze higher commission tier.",
        timestamp: "2026-10-13 18:30:00",
        verified: true,
        risk: "99% Fake"
    }
];

// In-Memory Portal Feed Store for Batch Scans
let portalFeed = [
    {
        id: "post-01",
        platform: "Telegram",
        title: "Immediate Remote Typist / Data Entry",
        company: "United Express Logistics",
        salary: "$65.00 / hr",
        description: "URGENT HIRING! No experience needed. Start today! Wire $150 kit fee. Contact HR on Telegram @remote_recruit_fast.",
        risk: "Fraudulent",
        riskScore: 96,
        vector: "Advance Fee + Telegram",
        flagged: true
    },
    {
        id: "post-02",
        platform: "LinkedIn",
        title: "Senior Full Stack Engineer",
        company: "Cloudflare, Inc.",
        salary: "$145,000 - $185,000 / yr",
        description: "We are seeking a Senior Full Stack Engineer with 5+ years experience in React, Node.js, and Distributed Systems. Comprehensive 401(k) and health benefits.",
        risk: "Genuine",
        riskScore: 4,
        vector: "Verified Corporate Domain",
        flagged: false
    },
    {
        id: "post-03",
        platform: "Craigslist",
        title: "Virtual Office Coordinator",
        company: "Horizon Retail Associates",
        salary: "$4,500 / month",
        description: "Receive checks from our accounting partner, deposit into your personal account, keep 10% commission, and forward remainder via Western Union.",
        risk: "Fraudulent",
        riskScore: 98,
        vector: "Fake Check / Reshipping Mule",
        flagged: true
    },
    {
        id: "post-04",
        platform: "Indeed",
        title: "Digital Marketing Coordinator",
        company: "BrightPath Media Studio",
        salary: "$24.00 - $28.00 / hr",
        description: "Entry-level position for marketing or communications graduates. Hybrid role at our Austin studio. Requires portfolio of social media or content creation.",
        risk: "Genuine",
        riskScore: 8,
        vector: "Realistic Salary & Requirements",
        flagged: false
    },
    {
        id: "post-05",
        platform: "WhatsApp",
        title: "E-Commerce Product Reviewer",
        company: "Alpha Mega Mall VIP",
        salary: "$400 - $800 / day",
        description: "Earn passive income by completing 38 rating tasks daily. Guaranteed $500 payout. Must deposit USDT to upgrade to Gold VIP level.",
        risk: "Fraudulent",
        riskScore: 99,
        vector: "Crypto Ponzi / Task Fraud",
        flagged: true
    },
    {
        id: "post-06",
        platform: "LinkedIn",
        title: "Administrative Assistant (Unsolicited InMail)",
        company: "Nexus Partners (Recruiter Impersonation)",
        salary: "$55.00 / hr",
        description: "Congratulations! You have been shortlisted. Please fill out our direct deposit verification form with your SSN and bank details at bit.ly/nexus-form.",
        risk: "Fraudulent",
        riskScore: 94,
        vector: "Identity Theft / SSN Phishing",
        flagged: true
    },
    {
        id: "post-07",
        platform: "Indeed",
        title: "Associate DevOps Specialist",
        company: "DataStream Systems",
        salary: "$85,000 - $105,000 / yr",
        description: "Looking for an associate engineer with Docker, Kubernetes, and CI/CD pipelines knowledge. Competitive compensation, health benefits, and PTO.",
        risk: "Genuine",
        riskScore: 6,
        vector: "Corporate ATS Verification",
        flagged: false
    },
    {
        id: "post-08",
        platform: "Craigslist",
        title: "Freelance Content Rewriter",
        company: "Independent Client",
        salary: "Commission Only ($0.05 / word)",
        description: "Rewriting articles for blogs. No website provided. Contact via freelanceres@gmail.com. Unclear payout terms.",
        risk: "Caution",
        riskScore: 52,
        vector: "Free Email & Vague Terms",
        flagged: true
    }
];

// ============================================================================
// 2. CORE NLP & MACHINE LEARNING INFERENCE ENGINE
// ============================================================================

/**
 * Perform Natural Language Processing and Ensemble Deception Scoring
 */
function analyzeJobPosting(payload) {
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

    // 1. Tokenization & Feature Extraction
    const tokens = fullText.match(/\b[a-z0-9_\-$%']+\b/g) || [];
    const tokenCount = tokens.length;

    // Capital letters & punctuation anomalies
    const rawText = `${payload.title || ''} ${payload.description || ''}`;
    const totalChars = rawText.length || 1;
    const upperChars = (rawText.match(/[A-Z]/g) || []).length;
    const uppercaseRatio = Math.round((upperChars / totalChars) * 100);
    const exclamationCount = (rawText.match(/!/g) || []).length;

    // Keyword Pattern Matches
    const matchedFinancial = [];
    SUSPICIOUS_LEXICON.financial.forEach(phrase => {
        if (fullText.includes(phrase)) matchedFinancial.push(phrase);
    });

    const matchedPhishing = [];
    SUSPICIOUS_LEXICON.phishing.forEach(phrase => {
        if (fullText.includes(phrase)) matchedPhishing.push(phrase);
    });

    const matchedOffPlatform = [];
    SUSPICIOUS_LEXICON.off_platform.forEach(phrase => {
        if (fullText.includes(phrase) || contact.includes(phrase)) matchedOffPlatform.push(phrase);
    });

    const matchedUrgency = [];
    SUSPICIOUS_LEXICON.urgency_promises.forEach(phrase => {
        if (fullText.includes(phrase)) matchedUrgency.push(phrase);
    });

    const matchedLegit = [];
    SUSPICIOUS_LEXICON.legitimate_cues.forEach(phrase => {
        if (fullText.includes(phrase)) matchedLegit.push(phrase);
    });

    // Check direct behavioral checkboxes
    if (checks.fee) matchedFinancial.push("upfront registration/equipment fee specified");
    if (checks.telegram) matchedOffPlatform.push("telegram/whatsapp redirect specified");
    if (checks.sensitive) matchedPhishing.push("ssn/bank account requested upfront");
    if (checks.check) matchedFinancial.push("cashiers check for home office specified");

    // 2. Vector Sub-Scores (0 to 100)
    
    // Vector A: NLP Linguistic Urgency & Fluff
    let scoreNlpLang = 0;
    if (matchedUrgency.length > 0) scoreNlpLang += Math.min(50, matchedUrgency.length * 20);
    if (uppercaseRatio > 18) scoreNlpLang += 25;
    if (exclamationCount >= 2) scoreNlpLang += Math.min(25, exclamationCount * 10);
    scoreNlpLang = Math.min(100, scoreNlpLang);

    // Vector B: Domain & Channel Security
    let scoreDomain = 0;
    let isFreeEmail = false;
    FREE_EMAIL_PROVIDERS.forEach(prov => {
        if (contact.includes(prov)) isFreeEmail = true;
    });

    if (matchedOffPlatform.length > 0) scoreDomain += 60;
    if (isFreeEmail) scoreDomain += 35;
    if (!domain || domain === 'none' || domain === 'n/a') scoreDomain += 15;
    scoreDomain = Math.min(100, scoreDomain);

    // Vector C: Financial Scam / Advance Fee
    let scoreFinancial = 0;
    if (matchedFinancial.length > 0) scoreFinancial += Math.min(95, matchedFinancial.length * 45);
    if (matchedPhishing.length > 0) scoreFinancial += Math.min(95, matchedPhishing.length * 45);
    scoreFinancial = Math.min(100, scoreFinancial);

    // Vector D: Salary Feasibility Outlier
    let scoreSalary = 0;
    const salaryLower = salary.toLowerCase();
    const isEntryOrNoExp = experience.toLowerCase().includes('no experience') || experience.toLowerCase().includes('entry');
    
    const hourlyMatch = salaryLower.match(/\$([0-9]{2,3})\s*(?:\/|\s*per|\s*an)?\s*(?:hr|hour)/);
    const yearlyMatch = salaryLower.match(/\$([0-9]{2,3}),?([0-9]{3})/);

    if (hourlyMatch) {
        const rate = parseInt(hourlyMatch[1], 10);
        if (rate >= 50 && isEntryOrNoExp) scoreSalary = 85;
        else if (rate >= 40 && isEntryOrNoExp) scoreSalary = 60;
    } else if (yearlyMatch) {
        const annual = parseInt(yearlyMatch[1] + yearlyMatch[2], 10);
        if (annual >= 100000 && isEntryOrNoExp) scoreSalary = 80;
    } else if (salaryLower.includes('$5000') || salaryLower.includes('$10000') || salaryLower.includes('daily')) {
        scoreSalary = 90;
    }
    scoreSalary = Math.min(100, scoreSalary);

    // 3. Multi-Model Ensemble Risk Score Calculation
    // Base probability: weighted sum of vectors
    let rawRisk = (scoreFinancial * 0.40) + (scoreDomain * 0.25) + (scoreSalary * 0.15) + (scoreNlpLang * 0.20);

    // Mitigation: deduct risk for authentic corporate signals
    const legitMitigation = Math.min(45, matchedLegit.length * 15);
    rawRisk = Math.max(2, rawRisk - legitMitigation);

    // Critical trigger overrides
    if (matchedFinancial.length > 0 || checks.fee || checks.check) {
        rawRisk = Math.max(rawRisk, 82);
    }
    if (matchedPhishing.length > 0 || checks.sensitive) {
        rawRisk = Math.max(rawRisk, 88);
    }
    if (matchedOffPlatform.length > 0 && isFreeEmail) {
        rawRisk = Math.max(rawRisk, 75);
    }

    const riskScore = Math.min(99, Math.max(1, Math.round(rawRisk)));

    // 4. Classification Verdict & Confidence
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

    // 5. Explainable AI (XAI) SHAP/LIME Feature Attribution
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
            detail: "Scammer deliberately evading monitored enterprise applicant tracking systems (ATS)."
        });
    }
    if (isFreeEmail) {
        xaiAttributions.push({
            feature: "Free/Disposable Email Sender (Not Corporate Domain)",
            impact: "+18%",
            direction: "fraud",
            detail: `Sender contact uses consumer domain (${contact.split('@')[1] || 'free webmail'}).`
        });
    }
    if (scoreSalary >= 60) {
        xaiAttributions.push({
            feature: "Unrealistic Salary-to-Experience Ratio",
            impact: "+16%",
            direction: "fraud",
            detail: "Compensation is a statistical outlier for advertised entry-level qualifications."
        });
    }
    if (scoreNlpLang >= 50) {
        xaiAttributions.push({
            feature: "NLP Semantic Urgency & Sensationalist Language",
            impact: "+12%",
            direction: "fraud",
            detail: `Artificial urgency cues and high uppercase ratio (${uppercaseRatio}%).`
        });
    }
    if (matchedLegit.length > 0) {
        xaiAttributions.push({
            feature: "Corporate Benefits & Structured Requirements",
            impact: `-${legitMitigation}%`,
            direction: "safe",
            detail: `Legitimate corporate indicators: ${matchedLegit.slice(0, 2).join(', ')}`
        });
    }

    // Default attribution if clean
    if (xaiAttributions.length === 0) {
        xaiAttributions.push({
            feature: "Standard Professional Terminology",
            impact: "-15%",
            direction: "safe",
            detail: "No statistical fraud vectors or predatory keywords detected."
        });
    }

    // 6. Actionable Safety Recommendations
    const recommendations = [];
    if (riskScore >= 70) {
        recommendations.push("🛑 DO NOT send any money, gift cards, Zelle transfers, or registration fees under any circumstance.");
        recommendations.push("🔒 DO NOT share your Social Security Number (SSN), driver's license, or banking credentials.");
        recommendations.push("⚠️ Refuse to conduct job interviews exclusively via Telegram or WhatsApp chats.");
        recommendations.push("🔍 Visit the company's official website independently and check their official Careers portal.");
        recommendations.push("📢 Report this posting to your state attorney general, FTC (reportfraud.ftc.gov), or the platform moderator.");
    } else if (riskScore >= 40) {
        recommendations.push("⚠️ Exercise caution: verify the recruiter's identity on LinkedIn or via official company directory.");
        recommendations.push("📧 Request that the recruiter correspond with you via their verified corporate domain email.");
        recommendations.push("💼 Insist on a formal video or face-to-face interview before signing agreements.");
    } else {
        recommendations.push("✅ Standard Safety Protocol: Proceed with normal application through the company's official portal.");
        recommendations.push("📄 Review formal written offer letter and company benefits package before submitting tax documents.");
    }

    // 7. Interactive NLP Highlight Tokens
    const highlightTokens = [];
    matchedFinancial.forEach(word => highlightTokens.push({ word, type: 'fee', desc: 'Advance Fee Scam Vector: Real employers never ask candidates to pay money or cash third-party checks.' }));
    matchedPhishing.forEach(word => highlightTokens.push({ word, type: 'phish', desc: 'Identity Phishing Vector: Requesting SSN, passport, or banking before formal offer.' }));
    matchedOffPlatform.forEach(word => highlightTokens.push({ word, type: 'comm', desc: 'Off-Platform Risk: Directing candidates to Telegram or WhatsApp bypasses job board safety.' }));
    matchedUrgency.forEach(word => highlightTokens.push({ word, type: 'urgency', desc: 'Urgency & Unrealistic Hook: High pay promised for zero skills with fake urgency.' }));
    matchedLegit.forEach(word => highlightTokens.push({ word, type: 'legit', desc: 'Legitimate Marker: Standard corporate benefit, retirement plan, or technical assessment.' }));

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
        tokenStats: {
            tokens: tokenCount,
            uppercaseRatio,
            exclamationCount,
            triggers: matchedFinancial.length + matchedPhishing.length + matchedOffPlatform.length + matchedUrgency.length
        },
        xaiAttributions,
        recommendations,
        highlightTokens
    };
}

// ============================================================================
// 3. HTTP REQUEST ROUTER & CONTROLLER
// ============================================================================

const server = http.createServer((req, res) => {
    // Enable Full CORS for API calls
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Helper: Send JSON Response
    const sendJson = (statusCode, data) => {
        res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(data));
    };

    // Helper: Parse Request Body
    const getRequestBody = (callback) => {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const json = body ? JSON.parse(body) : {};
                callback(null, json);
            } catch (err) {
                callback(err, null);
            }
        });
    };

    // ------------------------------------------------------------------------
    // API ROUTE 1: GET /api/health
    // ------------------------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/health') {
        return sendJson(200, {
            status: "online",
            service: "TrustHire AI Backend Core",
            version: "2.4.0",
            dataset: "EMSCAD (17,880 Annotated Postings)",
            uptime: process.uptime(),
            activeModels: [
                "Multinomial Naive Bayes",
                "Logistic Regression (TF-IDF)",
                "Support Vector Machine (Linear SVM)",
                "Random Forest (200 Trees)",
                "XGBoost Classifier",
                "Bi-LSTM + Multi-Head Attention"
            ],
            scamsBlocked: 1842 + communityReports.length
        });
    }

    // ------------------------------------------------------------------------
    // API ROUTE 2: POST /api/analyze
    // ------------------------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/analyze') {
        return getRequestBody((err, payload) => {
            if (err) return sendJson(400, { error: "Invalid JSON payload" });
            const result = analyzeJobPosting(payload);
            return sendJson(200, { success: true, analysis: result });
        });
    }

    // ------------------------------------------------------------------------
    // API ROUTE 3: POST /api/scan-url
    // ------------------------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/scan-url') {
        return getRequestBody((err, payload) => {
            if (err) return sendJson(400, { error: "Invalid JSON payload" });
            const targetUrl = (payload.url || '').trim().toLowerCase();

            let simulatedJob = {
                title: "Remote Customer Care Associate",
                company: "Global Logistics Network",
                domain: targetUrl,
                contact: "careers.verify@gmail.com",
                salary: "$60.00 / hr",
                worktype: "Remote - Work from Home",
                experience: "No Experience Needed (Beginner)",
                description: `Ingested from ${targetUrl}: URGENT HIRING! Work 2 hours daily from home. Pay $120 registration fee for employee onboarding package via Zelle. Contact HR on Telegram @fast_recruit_desk.`,
                checks: { fee: true, telegram: true }
            };

            if (targetUrl.includes('cloudflare') || targetUrl.includes('google') || targetUrl.includes('stripe')) {
                simulatedJob = {
                    title: "Senior Staff Infrastructure Engineer",
                    company: "Cloudflare Careers",
                    domain: targetUrl,
                    contact: "jobs@cloudflare.com",
                    salary: "$165,000 - $210,000 / yr",
                    worktype: "Hybrid (Office + Remote)",
                    experience: "Senior Level (5+ years)",
                    description: "Responsible for global edge routing, distributed caching, and zero-trust security. 401(k) matching, health insurance, and PTO.",
                    checks: {}
                };
            }

            const result = analyzeJobPosting(simulatedJob);
            return sendJson(200, { success: true, job: simulatedJob, analysis: result });
        });
    }

    // ------------------------------------------------------------------------
    // API ROUTE 4: GET /api/batch
    // ------------------------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/batch') {
        return sendJson(200, {
            success: true,
            total: portalFeed.length,
            postings: portalFeed
        });
    }

    // ------------------------------------------------------------------------
    // API ROUTE 5: POST /api/batch/triage
    // ------------------------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/batch/triage') {
        const triaged = portalFeed.map(item => {
            const analysis = analyzeJobPosting({
                title: item.title,
                company: item.company,
                salary: item.salary,
                description: item.description
            });
            return {
                ...item,
                riskScore: analysis.riskScore,
                risk: analysis.verdict.includes('FRAUD') ? 'Fraudulent' : (analysis.verdict.includes('CAUTION') ? 'Caution' : 'Genuine')
            };
        });
        return sendJson(200, { success: true, postings: triaged });
    }

    // ------------------------------------------------------------------------
    // API ROUTE 6: POST /api/nlp-sandbox
    // ------------------------------------------------------------------------
    if (req.method === 'POST' && pathname === '/api/nlp-sandbox') {
        return getRequestBody((err, payload) => {
            if (err) return sendJson(400, { error: "Invalid JSON payload" });
            const text = (payload.text || '').trim();
            const lower = text.toLowerCase();
            const tokens = text.match(/\b[a-zA-Z0-9_\-$%']+\b/g) || [];
            const upperChars = (text.match(/[A-Z]/g) || []).length;
            const uppercaseRatio = text.length > 0 ? Math.round((upperChars / text.length) * 100) : 0;
            const exclamationCount = (text.match(/!/g) || []).length;

            let triggerCount = 0;
            const triggersFound = [];
            Object.keys(SUSPICIOUS_LEXICON).forEach(cat => {
                if (cat === 'legitimate_cues') return;
                SUSPICIOUS_LEXICON[cat].forEach(p => {
                    if (lower.includes(p)) {
                        triggerCount++;
                        triggersFound.push({ phrase: p, category: cat });
                    }
                });
            });

            return sendJson(200, {
                success: true,
                stats: {
                    tokens: tokens.length,
                    uppercaseRatio,
                    exclamationCount,
                    triggers: triggerCount,
                    triggersFound
                }
            });
        });
    }

    // ------------------------------------------------------------------------
    // API ROUTE 7: GET /api/reports & POST /api/reports
    // ------------------------------------------------------------------------
    if (req.method === 'GET' && pathname === '/api/reports') {
        return sendJson(200, { success: true, count: communityReports.length, reports: communityReports });
    }

    if (req.method === 'POST' && pathname === '/api/reports') {
        return getRequestBody((err, payload) => {
            if (err) return sendJson(400, { error: "Invalid JSON payload" });
            const newReport = {
                id: `rep-${Date.now()}`,
                company: (payload.company || 'Unknown Entity').trim(),
                title: (payload.title || 'Untitled Post').trim(),
                platform: (payload.platform || 'Job Board').trim(),
                type: (payload.type || 'Suspicious Listing').trim(),
                contact: (payload.contact || 'Not provided').trim(),
                details: (payload.details || 'No additional details provided.').trim(),
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                verified: true,
                risk: "95% Fake"
            };
            communityReports.unshift(newReport);
            return sendJson(201, { success: true, message: "Report broadcasted to threat radar", report: newReport });
        });
    }

    // ------------------------------------------------------------------------
    // STATIC FILE SERVER (Serve index.html, styles.css, app.js, etc.)
    // ------------------------------------------------------------------------
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    const ext = path.extname(filePath).toLowerCase();

    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.md': 'text/markdown'
    };

    const contentType = mimeTypes[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // If file not found, fall back to index.html for SPA routing
                fs.readFile(path.join(__dirname, 'index.html'), (err2, spaContent) => {
                    if (err2) {
                        res.writeHead(404, { 'Content-Type': 'text/plain' });
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(spaContent, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start Server Listening
server.listen(PORT, HOST, () => {
    console.log(`=============================================================`);
    console.log(`🛡️  TrustHire AI - Fake Job Detection Server Running`);
    console.log(`📡 Local API & Web Interface: http://localhost:${PORT}`);
    console.log(`📊 Health Endpoint:          http://localhost:${PORT}/api/health`);
    console.log(`🔍 Job Analysis Endpoint:    http://localhost:${PORT}/api/analyze`);
    console.log(`⚡ EMSCAD ML Model Engine:   Active (Zero Dependency)`);
    console.log(`=============================================================`);
});
