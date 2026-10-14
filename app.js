/**
 * EcoClean - Smart Waste Management & Pollution Control System
 * Core Application Logic & Interactive Engines
 */

// ============================================================================
// 1. GLOBAL STATE & DATASETS
// ============================================================================

const state = {
    userPoints: 340,
    currentTab: 'dashboard',
    lastScannedItem: null,
    
    // IoT Smart Bins deployed across city sectors
    bins: [
        { id: 101, name: "City Market Sector A", type: "Biodegradable", fill: 88, gasPpm: 420, battery: 96, x: 120, y: 160, status: "Critical" },
        { id: 102, name: "Lakeview Promenade", type: "Recyclable", fill: 42, gasPpm: 110, battery: 98, x: 260, y: 80, status: "Normal" },
        { id: 103, name: "Industrial Zone 4", type: "Hazardous", fill: 94, gasPpm: 680, battery: 89, x: 440, y: 140, status: "Critical" },
        { id: 104, name: "Metro Terminal West", type: "Recyclable", fill: 82, gasPpm: 190, battery: 92, x: 150, y: 280, status: "Critical" },
        { id: 105, name: "Green Park North", type: "Biodegradable", fill: 35, gasPpm: 95, battery: 99, x: 380, y: 240, status: "Normal" },
        { id: 106, name: "High Street Junction", type: "Recyclable", fill: 76, gasPpm: 310, battery: 91, x: 310, y: 300, status: "Warning" }
    ],

    depot: { name: "Central Municipal Fleet Depot", x: 60, y: 60 },

    // AI Classification Knowledge Base
    wasteCatalog: [
        {
            name: "Fruit & Vegetable Peels",
            icon: "🍌",
            category: "Biodegradable",
            color: "emerald",
            binName: "Green Bin (Organic / Wet)",
            confidence: "99.4%",
            instruction: "Deposit into the green bin for aerobic composting. Do NOT enclose in plastic bags.",
            impact: "Prevents toxic methane emissions at landfills and converts to nutrient-rich compost."
        },
        {
            name: "PET Soda Water Bottle",
            icon: "🍾",
            category: "Recyclable",
            color: "blue",
            binName: "Blue Bin (Dry / Recyclable)",
            confidence: "98.8%",
            instruction: "Empty residual liquid, rinse lightly, crush to save space, and place in dry bin.",
            impact: "Recycled into high-grade polyester yarn and new consumer packaging."
        },
        {
            name: "Dead Alkaline / Li-ion Battery",
            icon: "🔋",
            category: "Hazardous",
            color: "rose",
            binName: "Red Bin (Hazardous / E-Waste)",
            confidence: "99.1%",
            instruction: "Tape terminals with scotch tape. Hand over to certified e-waste drop-off points.",
            impact: "Prevents cadmium and lead from leaching into drinking water aquifers."
        },
        {
            name: "Cardboard Packaging Box",
            icon: "📦",
            category: "Recyclable",
            color: "blue",
            binName: "Blue Bin (Dry / Recyclable)",
            confidence: "97.5%",
            instruction: "Flatten cardboard, remove plastic tape if possible, keep dry and unsoiled.",
            impact: "Saves 17 trees per ton of recycled paperboard."
        },
        {
            name: "Pesticide / Weedicide Can",
            icon: "🧪",
            category: "Hazardous",
            color: "rose",
            binName: "Red Bin (Hazardous / Chemical)",
            confidence: "99.6%",
            instruction: "Do not rinse into household drains. Seal tightly and dispose in hazardous toxic bin.",
            impact: "Prevents bio-accumulation of neurotoxins in urban groundwater."
        },
        {
            name: "Soiled Greasy Pizza Box",
            icon: "🍕",
            category: "Biodegradable",
            color: "emerald",
            binName: "Green Bin (Compostable)",
            confidence: "96.2%",
            instruction: "Heavy grease ruins paper pulping recycling. Tear into pieces and compost with brown yard leaves.",
            impact: "Greasy cellulose biodegrades naturally without contaminating clean dry recyclables."
        },
        {
            name: "Used Medical Syringe / Blister Pack",
            icon: "💉",
            category: "Hazardous",
            color: "rose",
            binName: "Red Bin (Bio-Medical Hazardous)",
            confidence: "99.7%",
            instruction: "Cap needle securely or place in puncture-proof sharps box. High temperature autoclave required.",
            impact: "Eliminates needle-stick injuries and transmission of hepatitis/blood-borne pathogens."
        },
        {
            name: "Aluminum Beverage Can",
            icon: "🥫",
            category: "Recyclable",
            color: "blue",
            binName: "Blue Bin (Metal Recyclable)",
            confidence: "98.9%",
            instruction: "Rinse and crush. Aluminum can be recycled infinitely with 95% less energy than raw bauxite mining.",
            impact: "Conserves 14 kWh of electricity per kilogram of recycled metal."
        }
    ],

    // Citizen Grievances / Illegal Dumpsites Log
    complaints: [
        {
            id: "TKT-8021",
            location: "Ward 4, North Canal Bridge",
            category: "Water Body / Drain Clog",
            severity: "High",
            desc: "Heavy single-use plastic bags choking culvert water flow, foul smell spreading.",
            time: "25 mins ago",
            status: "Crew Dispatched",
            statusColor: "amber"
        },
        {
            id: "TKT-8019",
            location: "Sector 7 Market Road",
            category: "Roadside Open Dumping",
            severity: "Medium",
            desc: "Discarded vegetable crates and rotting kitchen waste scattered on pavement.",
            time: "1 hour ago",
            status: "Assigned",
            statusColor: "blue"
        },
        {
            id: "TKT-8015",
            location: "Industrial Bypass KM 12",
            category: "Hazardous Waste Abandoned",
            severity: "High",
            desc: "Barrels of paint residue and battery casings dumped in open storm ditch.",
            time: "3 hours ago",
            status: "Resolved",
            statusColor: "emerald"
        },
        {
            id: "TKT-8010",
            location: "Green Avenue 2nd Cross",
            category: "Open Waste Burning",
            severity: "High",
            desc: "Leaves and plastic packaging set on fire, thick toxic smoke affecting nearby school.",
            time: "Yesterday",
            status: "Resolved",
            statusColor: "emerald"
        }
    ],

    // Municipal Recent Live Action Feed
    feedEvents: [
        "Truck #04 completed dynamic collection in Ward 3. Fuel saved: 3.2L.",
        "Smart Bin #103 reached 94% threshold. Autonomous dispatch alert triggered.",
        "Citizen logged 12kg of home composting in Green Valley Residency.",
        "MRF Facility baled 4.8 tons of sorted PET plastics for recycling plant.",
        "Sanitation Squad cleared blocked culvert at North Canal Bridge."
    ],

    // Upcycling Guides
    upcyclingGuides: [
        {
            title: "Self-Watering Herb Planters from PET Bottles",
            type: "Recyclable / Plastic Upcycling",
            steps: "Cut a 2-liter bottle in half. Invert top funnel with cotton wick into bottom reservoir. Fill top with soil.",
            benefit: "Zero cost indoor garden, saves 80% water and keeps 2 bottles out of the landfill."
        },
        {
            title: "Sheet Mulching (Lasagna Composting) with Cardboard",
            type: "Biodegradable / Soil Regeneration",
            steps: "Lay plain unprinted cardboard over weed-infested garden soil. Soak with water, layer 4 inches of compost on top.",
            benefit: "Naturally smothers weeds, decomposes into fertile humus, and eliminates chemical herbicides."
        },
        {
            title: "Glass Jar Pantry Storage System",
            type: "Dry / Glass Upcycling",
            steps: "Soak glass sauce jars in warm vinegar water to peel labels. Sterilize and use for grains, lentils, and bulk spices.",
            benefit: "Replaces single-use plastic containers, eliminates microplastic shedding, and organizes pantry."
        },
        {
            title: "T-Shirt Reusable Produce Shopping Bags",
            type: "Textile Waste Diversion",
            steps: "Cut sleeves and neck from old cotton shirts. Slit fringe at bottom and tie securely in double knots.",
            benefit: "Stretchy, washable bag replacing hundreds of single-use thin plastic bags annually."
        }
    ],

    // Redeemable Rewards
    rewards: [
        { id: 'rw1', name: "Free City Bus Metro Day Pass", cost: 200, icon: "🚌", desc: "Eco-friendly zero-carbon municipal transit voucher" },
        { id: 'rw2', name: "5 kg Bag of Rich Organic Compost", cost: 150, icon: "🌱", desc: "100% locally aerobically cured bio-fertilizer for plants" },
        { id: 'rw3', name: "10% Municipal Sanitation Tax Credit", cost: 500, icon: "📑", desc: "Rebate on property / municipal solid waste billing" },
        { id: 'rw4', name: "Native Shade Tree Plantation in Your Name", cost: 300, icon: "🌳", desc: "Planted and geotagged in the city green corridor" }
    ],

    // Neighborhood Leaderboard
    leaderboard: [
        { rank: 1, ward: "Ward 12 - Green Valley", score: "94.2% Segregation", points: "14,820 Pts", badge: "🥇 Gold Eco-Ward" },
        { rank: 2, ward: "Ward 04 - Lakeview Sector", score: "88.6% Segregation", points: "12,410 Pts", badge: "🥈 Silver Ward" },
        { rank: 3, ward: "Ward 07 - Tech Corridor", score: "82.1% Segregation", points: "10,950 Pts", badge: "🥉 Bronze Ward" },
        { rank: 4, ward: "Ward 02 - Heritage Town", score: "74.8% Segregation", points: "8,320 Pts", badge: "🎖️ Rising Star" },
        { rank: 5, ward: "Ward 09 - Metro Central", score: "69.5% Segregation", points: "6,410 Pts", badge: "Needs Outreach" }
    ],

    // Environmental Awareness Quiz
    quizQuestions: [
        {
            q: "Where should an oil-soaked, greasy cardboard pizza box be disposed of?",
            options: [
                "Blue Bin (Dry Recyclable) with clean printer paper",
                "Green Bin (Biodegradable / Composting)",
                "Flush down the kitchen drain with hot water",
                "Burn it openly on the street curb"
            ],
            correct: 1,
            explanation: "Food grease and oil cannot be separated from paper pulp during recycling, ruining entire batches! Greasy cardboard should be composted in green organic waste."
        },
        {
            q: "Why is dumping discarded lithium-ion batteries into ordinary household bins extremely dangerous?",
            options: [
                "Batteries are completely harmless and biodegrade naturally in 2 weeks",
                "They can catch fire under compaction pressure and leach toxic heavy metals (cadmium/lead) into groundwater",
                "They attract wild animals to dumpsters",
                "They cause foul sulfur smells like rotten eggs"
            ],
            correct: 1,
            explanation: "Lithium cells puncture easily inside garbage trucks, causing violent chemical fires. Toxic heavy metals also contaminate aquifers for decades."
        },
        {
            q: "What potent greenhouse gas is released when organic food waste rots in oxygen-starved, anaerobic open landfills?",
            options: [
                "Methane (CH₄) — over 25x more heat-trapping than CO₂",
                "Nitrous oxide (laughing gas)",
                "Pure medical-grade oxygen",
                "Helium gas"
            ],
            correct: 0,
            explanation: "Without oxygen, anaerobic bacteria generate methane (CH₄). Aerobic composting provides oxygen, eliminating methane production completely!"
        },
        {
            q: "What is the recommended ratio of 'Browns' (carbon dry leaves) to 'Greens' (nitrogen food scraps) for odorless composting?",
            options: [
                "100% Greens with zero dry matter",
                "2 parts Browns (Carbon) to 1 part Greens (Nitrogen)",
                "1 part Browns to 10 parts Greens",
                "Only pure plastic packaging"
            ],
            correct: 1,
            explanation: "The 2:1 carbon-to-nitrogen ratio gives aerobic microbes the ideal energy and moisture balance, resulting in sweet-smelling, rich organic humus."
        },
        {
            q: "How does IoT-based dynamic routing help municipal waste management compared to traditional fixed routes?",
            options: [
                "It makes trucks visit every empty bin twice a day",
                "It dispatches trucks strictly to bins reaching >80% capacity, cutting 30%+ in fuel and carbon emissions",
                "It eliminates the need for garbage trucks entirely",
                "It dumps trash into nearby rivers automatically"
            ],
            correct: 1,
            explanation: "Dynamic Vehicle Routing Problems (VRP) ensure trucks only travel where needed, eliminating unnecessary trips to empty bins and preventing roadside overflows!"
        }
    ],
    quizCurrentIndex: 0,
    quizScore: 0,
    quizAnswered: false
};

// ============================================================================
// 2. INITIALIZATION & EVENT LISTENERS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initDashboard();
    initAIScanner();
    initSmartBins();
    initGrievance();
    initComposting();
    initRewards();
    initQuiz();

    // Canvas map resize and initial draw
    window.addEventListener('resize', () => {
        drawRouteMap(false);
    });
});

// ============================================================================
// 3. NAVIGATION CONTROLLER
// ============================================================================

function initNavigation() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    document.getElementById('btn-quick-sync').addEventListener('click', () => {
        simulateNewEvent();
        showToast("System Synced", "IoT telemetry, bin depth sensors, and municipal metrics refreshed.", "⚡");
    });
}

function switchTab(tabId) {
    state.currentTab = tabId;

    // Update tab bar buttons
    document.querySelectorAll('.nav-tab').forEach(btn => {
        if (btn.getAttribute('data-tab') === tabId) {
            btn.classList.add('active-tab');
        } else {
            btn.classList.remove('active-tab');
        }
    });

    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        if (pane.id === `tab-${tabId}`) {
            pane.classList.remove('hidden');
        } else {
            pane.classList.add('hidden');
        }
    });

    // If switching to smart bins, redraw canvas
    if (tabId === 'smart-bins') {
        setTimeout(() => drawRouteMap(false), 50);
    }
}

// ============================================================================
// 4. TOAST NOTIFICATION SYSTEM
// ============================================================================

let toastTimer = null;
function showToast(title, description, icon = "🌱") {
    const toast = document.getElementById('toast');
    const toastTitle = document.getElementById('toast-title');
    const toastDesc = document.getElementById('toast-desc');
    const toastIcon = document.getElementById('toast-icon');

    if (!toast) return;

    toastTitle.textContent = title;
    toastDesc.textContent = description;
    toastIcon.textContent = icon;

    toast.classList.add('toast-visible');

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.classList.remove('toast-visible');
    }, 3800);
}

function addPoints(pts, reason) {
    state.userPoints += pts;
    document.getElementById('user-points-display').textContent = state.userPoints;
    showToast(`+${pts} EcoPoints Earned!`, reason, "🏆");
}

// ============================================================================
// 5. DASHBOARD CONTROLLER
// ============================================================================

function initDashboard() {
    renderAlertFeed();
}

function renderAlertFeed() {
    const container = document.getElementById('municipal-alert-list');
    if (!container) return;

    container.innerHTML = state.feedEvents.map(evt => `
        <div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-start space-x-2.5 text-xs text-slate-300">
            <span class="text-emerald-400 mt-0.5">●</span>
            <span class="leading-relaxed">${evt}</span>
        </div>
    `).join('');
}

function simulateNewEvent() {
    const randomBins = state.bins;
    const targetBin = randomBins[Math.floor(Math.random() * randomBins.length)];
    const fillIncrease = Math.floor(Math.random() * 12) + 6;
    targetBin.fill = Math.min(100, targetBin.fill + fillIncrease);

    const newAlert = `Smart Bin #${targetBin.id} (${targetBin.name}) recorded fill surge: ${targetBin.fill}% capacity.`;
    state.feedEvents.unshift(newAlert);
    if (state.feedEvents.length > 5) state.feedEvents.pop();

    renderAlertFeed();
    renderSmartBinTelemetry();
    drawRouteMap(false);
}

// ============================================================================
// 6. AI WASTE SCANNER CONTROLLER
// ============================================================================

function initAIScanner() {
    const presetContainer = document.getElementById('preset-item-container');
    const dropzone = document.getElementById('dropzone');
    const imageInput = document.getElementById('image-input');
    const claimBtn = document.getElementById('btn-claim-points');

    // Populate quick-select preset items
    if (presetContainer) {
        presetContainer.innerHTML = state.wasteCatalog.map((item, idx) => `
            <button onclick="classifyItem(${idx})" class="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-left transition flex items-center space-x-2 group">
                <span class="text-xl">${item.icon}</span>
                <span class="text-xs font-semibold text-slate-200 group-hover:text-emerald-400 line-clamp-1">${item.name}</span>
            </button>
        `).join('');
    }

    // File upload handler
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                // Select an item from catalog to simulate intelligent classification
                const sampleIdx = Math.floor(Math.random() * state.wasteCatalog.length);
                const reader = new FileReader();
                reader.onload = (event) => {
                    classifyWithCustomImage(event.target.result, state.wasteCatalog[sampleIdx]);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    if (claimBtn) {
        claimBtn.addEventListener('click', () => {
            if (!state.lastScannedItem) return;
            addPoints(15, `Properly categorized "${state.lastScannedItem.name}" into ${state.lastScannedItem.category} stream.`);
            claimBtn.disabled = true;
            claimBtn.classList.add('opacity-50', 'cursor-not-allowed');
            claimBtn.innerHTML = `✓ Disposed & Segregated`;
        });
    }

    // Default initial preview
    classifyItem(0);
}

function classifyItem(index) {
    const item = state.wasteCatalog[index];
    state.lastScannedItem = item;
    renderClassificationResult(item, null);
}

function classifyWithCustomImage(imageSrc, item) {
    state.lastScannedItem = item;
    renderClassificationResult(item, imageSrc);
}

function renderClassificationResult(item, imageSrc) {
    const nameEl = document.getElementById('scanner-item-name');
    const descEl = document.getElementById('scanner-item-desc');
    const iconEl = document.getElementById('scanner-preview-icon');
    const confidenceEl = document.getElementById('scanner-confidence');
    const binTitle = document.getElementById('scanner-bin-title');
    const binInstruction = document.getElementById('scanner-bin-instruction');
    const binIconBadge = document.getElementById('scanner-bin-icon-badge');
    const binCard = document.getElementById('scanner-bin-card');
    const claimBtn = document.getElementById('btn-claim-points');

    if (!nameEl) return;

    nameEl.textContent = item.name;
    descEl.textContent = item.impact;
    confidenceEl.textContent = `Confidence: ${item.confidence}`;
    binTitle.textContent = item.binName;
    binInstruction.textContent = item.instruction;

    if (imageSrc) {
        iconEl.innerHTML = `<img src="${imageSrc}" class="w-full h-full object-cover rounded-lg" alt="Waste Item">`;
    } else {
        iconEl.innerHTML = `<span class="text-5xl">${item.icon}</span>`;
    }

    // Bin Badge styling
    let badgeBg = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    let cardBorder = "border-emerald-500/40 bg-emerald-950/20";
    let badgeText = "🟢";

    if (item.category === "Recyclable") {
        badgeBg = "bg-blue-500/20 text-blue-400 border-blue-500/40";
        cardBorder = "border-blue-500/40 bg-blue-950/20";
        badgeText = "🔵";
    } else if (item.category === "Hazardous") {
        badgeBg = "bg-rose-500/20 text-rose-400 border-rose-500/40";
        cardBorder = "border-rose-500/40 bg-rose-950/20";
        badgeText = "🔴";
    }

    binIconBadge.className = `w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border ${badgeBg}`;
    binIconBadge.textContent = badgeText;
    binCard.className = `p-4 rounded-xl border transition-all duration-300 ${cardBorder}`;

    // Enable claim button
    if (claimBtn) {
        claimBtn.disabled = false;
        claimBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        claimBtn.className = "w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 cursor-pointer";
        claimBtn.innerHTML = `
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            <span>Segregate Correctly (+15 EcoPoints)</span>
        `;
    }
}

// ============================================================================
// 7. SMART BINS & FLEET ROUTING CONTROLLER
// ============================================================================

function initSmartBins() {
    renderSmartBinTelemetry();
    drawRouteMap(false);

    document.getElementById('btn-fill-sim').addEventListener('click', () => {
        simulateNewEvent();
        showToast("Telemetry Updated", "Ultrasonic sensors registered updated fill levels across city wards.", "📡");
    });

    document.getElementById('btn-optimize-route').addEventListener('click', () => {
        runRouteOptimization();
    });
}

function renderSmartBinTelemetry() {
    const container = document.getElementById('smart-bin-list');
    if (!container) return;

    container.innerHTML = state.bins.map(bin => {
        const isCritical = bin.fill >= 80;
        const colorClass = isCritical ? 'text-rose-400' : (bin.fill >= 60 ? 'text-amber-400' : 'text-emerald-400');
        const barBg = isCritical ? 'bg-rose-500' : (bin.fill >= 60 ? 'bg-amber-500' : 'bg-emerald-500');
        const glowClass = isCritical ? 'bin-critical-glow' : '';

        return `
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 ${glowClass} space-y-2">
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-white">#${bin.id} - ${bin.name}</span>
                    <span class="font-black ${colorClass}">${bin.fill}%</span>
                </div>
                <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div class="${barBg} h-full rounded-full transition-all duration-500" style="width: ${bin.fill}%"></div>
                </div>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                    <span>${bin.type}</span>
                    <span>Air Gas: <strong class="text-slate-300">${bin.gasPpm} ppm</strong></span>
                    <span>Bat: <strong class="text-emerald-400">${bin.battery}%</strong></span>
                </div>
            </div>
        `;
    }).join('');
}

let routeAnimationId = null;

function drawRouteMap(isOptimized = false, visitedNodes = []) {
    const canvas = document.getElementById('routeCanvas');
    if (!canvas) return;

    // Adjust canvas resolution for high DPI displays
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Scale factors from coordinate base (500x360)
    const scaleX = canvas.width / 500;
    const scaleY = canvas.height / 360;

    // 1. Draw Background Grid Lines
    ctx.strokeStyle = "rgba(51, 65, 85, 0.3)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // 2. Draw Fleet Route Path
    if (isOptimized && visitedNodes.length > 0) {
        ctx.strokeStyle = "#06b6d4";
        ctx.lineWidth = 3;
        ctx.setLineDash([6, 4]);

        ctx.beginPath();
        const startX = state.depot.x * scaleX;
        const startY = state.depot.y * scaleY;
        ctx.moveTo(startX, startY);

        visitedNodes.forEach(node => {
            ctx.lineTo(node.x * scaleX, node.y * scaleY);
        });
        ctx.lineTo(startX, startY);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    // 3. Draw Municipal Depot
    const depotX = state.depot.x * scaleX;
    const depotY = state.depot.y * scaleY;

    ctx.fillStyle = "#10b981";
    ctx.beginPath();
    ctx.arc(depotX, depotY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 11px sans-serif";
    ctx.fillText("Fleet Depot", depotX + 13, depotY + 4);

    // 4. Draw Smart Bins
    state.bins.forEach(bin => {
        const bx = bin.x * scaleX;
        const by = bin.y * scaleY;
        const isCritical = bin.fill >= 80;

        ctx.fillStyle = isCritical ? "#f43f5e" : (bin.fill >= 60 ? "#f59e0b" : "#64748b");
        ctx.beginPath();
        ctx.arc(bx, by, isCritical ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = isCritical ? "#fda4af" : "#cbd5e1";
        ctx.font = isCritical ? "bold 10px sans-serif" : "9px sans-serif";
        ctx.fillText(`#${bin.id} (${bin.fill}%)`, bx - 18, by - 10);
    });
}

function runRouteOptimization() {
    const statusEl = document.getElementById('route-algorithm-status');
    const optStat = document.getElementById('optimized-route-stat');
    const carbonStat = document.getElementById('carbon-saved-stat');

    if (statusEl) statusEl.textContent = "Calculating Dijkstra / TSP...";

    // Critical bins needing urgent collection
    const criticalBins = state.bins.filter(b => b.fill >= 75);

    setTimeout(() => {
        if (statusEl) statusEl.textContent = `Optimized: ${criticalBins.length} Stop Dynamic Loop`;
        if (optStat) optStat.textContent = `18.6 km • 57% Fuel (-43%)`;
        if (carbonStat) carbonStat.textContent = `14.2 kg CO₂e saved today`;

        drawRouteMap(true, criticalBins);
        showToast("Dynamic Route Dispatched", `Collection fleet dispatched to ${criticalBins.length} overflowing bins. Saving 13.8 km!`, "🚛");
    }, 400);
}

// ============================================================================
// 8. CITIZEN GRIEVANCE PORTAL CONTROLLER
// ============================================================================

function initGrievance() {
    renderGrievanceList();

    const form = document.getElementById('grievance-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const location = document.getElementById('complaint-location').value;
            const category = document.getElementById('complaint-category').value;
            const desc = document.getElementById('complaint-desc').value || "Illegal dumping causing nuisance and environmental hazard.";
            const severityRadio = document.querySelector('input[name="severity"]:checked');
            const severity = severityRadio ? severityRadio.value : "Medium";

            const newTicket = {
                id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
                location: location,
                category: category,
                severity: severity,
                desc: desc,
                time: "Just now",
                status: "Received",
                statusColor: "blue"
            };

            state.complaints.unshift(newTicket);
            renderGrievanceList();
            addPoints(25, `Citizen grievance filed for ${location}. Rapid squad notified!`);
            form.reset();
        });
    }
}

function autoDetectLocation() {
    const input = document.getElementById('complaint-location');
    if (input) {
        input.value = "GPS: 12.9716° N, 77.5946° E - Sector 5 North Canal";
        showToast("GPS Coordinate Locked", "High-accuracy geolocation tagged to complaint ticket.", "📍");
    }
}

function renderGrievanceList() {
    const container = document.getElementById('complaints-list');
    const badge = document.getElementById('total-reports-badge');

    if (badge) badge.textContent = `${state.complaints.length} Tickets`;
    if (!container) return;

    container.innerHTML = state.complaints.map((item, index) => {
        let statusBadge = "bg-blue-500/20 text-blue-400 border-blue-500/40";
        if (item.status === "Resolved") statusBadge = "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
        if (item.status === "Crew Dispatched") statusBadge = "bg-amber-500/20 text-amber-400 border-amber-500/40";

        let severityBadge = "text-slate-400";
        if (item.severity === "High") severityBadge = "text-rose-400 font-bold";

        return `
            <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2 hover:border-slate-700 transition">
                <div class="flex items-center justify-between text-xs">
                    <span class="font-bold text-white font-mono">${item.id}</span>
                    <div class="flex items-center space-x-2">
                        <span class="${severityBadge} text-[11px]">${item.severity} Priority</span>
                        <span class="px-2 py-0.5 rounded-md border text-[10px] font-semibold ${statusBadge}">${item.status}</span>
                    </div>
                </div>
                <p class="text-xs font-semibold text-slate-200">${item.location}</p>
                <p class="text-[11px] text-slate-400 line-clamp-2">${item.desc}</p>
                <div class="flex justify-between items-center text-[10px] pt-1 text-slate-500 border-t border-slate-900">
                    <span>${item.time}</span>
                    ${item.status !== 'Resolved' ? `
                        <button onclick="advanceTicketStatus(${index})" class="text-cyan-400 hover:text-cyan-300 font-semibold transition">
                            ⚡ Dispatch Clean Crew →
                        </button>
                    ` : `<span class="text-emerald-400 font-semibold">✓ Site Restored Clean</span>`}
                </div>
            </div>
        `;
    }).join('');
}

function advanceTicketStatus(index) {
    const item = state.complaints[index];
    if (item.status === "Received") {
        item.status = "Crew Dispatched";
        showToast("Crew Dispatched", `Sanitation truck en-route to ${item.location}.`, "🚚");
    } else if (item.status === "Crew Dispatched" || item.status === "Assigned") {
        item.status = "Resolved";
        addPoints(10, `Grievance ${item.id} successfully cleaned and certified!`);
    }
    renderGrievanceList();
}

// ============================================================================
// 9. COMPOSTING & CIRCULAR ECONOMY CONTROLLER
// ============================================================================

function initComposting() {
    const familySlider = document.getElementById('slider-family');
    const wasteSlider = document.getElementById('slider-waste');

    const updateCalc = () => {
        const family = parseInt(familySlider.value);
        const wastePerDay = parseFloat(wasteSlider.value);

        document.getElementById('compost-family-val').textContent = `${family} People`;
        document.getElementById('compost-waste-val').textContent = `${wastePerDay} kg/day`;

        // Monthly organic waste in kg
        const monthlyWaste = wastePerDay * 30;
        // Finished aerobic cured compost output (~30% mass conversion)
        const compostYield = (monthlyWaste * 0.30).toFixed(1);
        // Methane & CO2 GHG emissions prevented (~0.62 kg CO2e per kg diverted)
        const methaneSaved = (monthlyWaste * 0.62).toFixed(1);
        // Fertilizer cost offset ($1.50 per kg of organic compost)
        const dollarVal = (compostYield * 1.50).toFixed(2);

        document.getElementById('calc-compost-yield').textContent = `${compostYield} kg`;
        document.getElementById('calc-methane-saved').textContent = `${methaneSaved} kg CO₂e`;
        document.getElementById('calc-economic-val').textContent = `$${dollarVal} / mo`;
    };

    if (familySlider && wasteSlider) {
        familySlider.addEventListener('input', updateCalc);
        wasteSlider.addEventListener('input', updateCalc);
        updateCalc();
    }

    // Populate upcycling guides
    const guideContainer = document.getElementById('upcycling-cards-container');
    if (guideContainer) {
        guideContainer.innerHTML = state.upcyclingGuides.map(guide => `
            <div class="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 hover:border-slate-700 transition">
                <div class="flex items-center justify-between text-xs">
                    <h4 class="font-bold text-white">${guide.title}</h4>
                    <span class="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-blue-400 font-semibold">${guide.type}</span>
                </div>
                <p class="text-[11px] text-slate-300">${guide.steps}</p>
                <p class="text-[10px] text-emerald-400"><strong>Impact:</strong> ${guide.benefit}</p>
            </div>
        `).join('');
    }
}

// ============================================================================
// 10. REWARDS & COMMUNITY CONTROLLER
// ============================================================================

function initRewards() {
    renderRewardsStore();
    renderLeaderboard();
}

function renderRewardsStore() {
    const container = document.getElementById('rewards-store-list');
    if (!container) return;

    container.innerHTML = state.rewards.map(item => `
        <div class="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-3">
            <div>
                <div class="flex items-center space-x-2 text-2xl mb-1">${item.icon}</div>
                <h4 class="text-xs font-bold text-white">${item.name}</h4>
                <p class="text-[11px] text-slate-400 mt-1">${item.desc}</p>
            </div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-900">
                <span class="text-xs font-black text-amber-400">${item.cost} EcoPts</span>
                <button onclick="redeemReward('${item.id}', ${item.cost}, '${item.name}')" class="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition">
                    Redeem
                </button>
            </div>
        </div>
    `).join('');
}

function redeemReward(id, cost, name) {
    if (state.userPoints < cost) {
        showToast("Insufficient EcoPoints", `You need ${cost} points to redeem ${name}. Scan more waste or report open dumps to earn!`, "⚠️");
        return;
    }

    state.userPoints -= cost;
    document.getElementById('user-points-display').textContent = state.userPoints;
    showToast("Reward Voucher Issued", `Successfully claimed: ${name}. Digital voucher code sent to municipal ID.`, "🎉");
}

function renderLeaderboard() {
    const container = document.getElementById('ward-leaderboard-list');
    if (!container) return;

    container.innerHTML = state.leaderboard.map(item => `
        <div class="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
            <div class="flex items-center space-x-2.5">
                <span class="w-6 h-6 rounded-full bg-slate-800 font-bold flex items-center justify-center text-slate-300 text-[11px]">${item.rank}</span>
                <div>
                    <h4 class="font-bold text-white">${item.ward}</h4>
                    <span class="text-[10px] text-emerald-400 font-semibold">${item.score}</span>
                </div>
            </div>
            <div class="text-right">
                <span class="font-mono font-bold text-slate-200">${item.points}</span>
                <span class="text-[10px] text-slate-400 block">${item.badge}</span>
            </div>
        </div>
    `).join('');
}

// ============================================================================
// 11. INTERACTIVE QUIZ CONTROLLER
// ============================================================================

function initQuiz() {
    renderQuizQuestion();

    document.getElementById('btn-quiz-next').addEventListener('click', () => {
        if (!state.quizAnswered) return;

        state.quizCurrentIndex++;
        if (state.quizCurrentIndex >= state.quizQuestions.length) {
            renderQuizCompletion();
        } else {
            state.quizAnswered = false;
            renderQuizQuestion();
        }
    });

    document.getElementById('btn-quiz-restart').addEventListener('click', () => {
        state.quizCurrentIndex = 0;
        state.quizScore = 0;
        state.quizAnswered = false;
        renderQuizQuestion();
    });
}

function renderQuizQuestion() {
    const qData = state.quizQuestions[state.quizCurrentIndex];
    const titleEl = document.getElementById('quiz-question-title');
    const optionsContainer = document.getElementById('quiz-options-container');
    const progressEl = document.getElementById('quiz-progress-text');
    const scorePill = document.getElementById('quiz-score-pill');
    const explanationBox = document.getElementById('quiz-explanation-box');
    const nextBtn = document.getElementById('btn-quiz-next');

    if (!titleEl) return;

    titleEl.textContent = qData.q;
    progressEl.textContent = `Question ${state.quizCurrentIndex + 1} of ${state.quizQuestions.length}`;
    scorePill.textContent = `Score: ${state.quizScore} / ${state.quizQuestions.length}`;
    explanationBox.classList.add('hidden');
    nextBtn.disabled = true;

    optionsContainer.innerHTML = qData.options.map((opt, idx) => `
        <button onclick="handleQuizAnswer(${idx})" class="w-full text-left p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition flex items-center space-x-2.5 quiz-opt-btn" data-idx="${idx}">
            <span class="w-5 h-5 rounded-md bg-slate-700 flex items-center justify-center font-bold text-[11px]">${String.fromCharCode(65 + idx)}</span>
            <span>${opt}</span>
        </button>
    `).join('');
}

function handleQuizAnswer(selectedIndex) {
    if (state.quizAnswered) return;
    state.quizAnswered = true;

    const qData = state.quizQuestions[state.quizCurrentIndex];
    const isCorrect = selectedIndex === qData.correct;
    const explanationBox = document.getElementById('quiz-explanation-box');
    const nextBtn = document.getElementById('btn-quiz-next');

    if (isCorrect) {
        state.quizScore++;
        addPoints(10, "Correct answer on segregation quiz!");
    }

    // Highlight options
    document.querySelectorAll('.quiz-opt-btn').forEach((btn, idx) => {
        btn.disabled = true;
        if (idx === qData.correct) {
            btn.className = "w-full text-left p-3 rounded-xl bg-emerald-500/20 border border-emerald-500 text-xs text-emerald-300 font-semibold flex items-center space-x-2.5";
        } else if (idx === selectedIndex && !isCorrect) {
            btn.className = "w-full text-left p-3 rounded-xl bg-rose-500/20 border border-rose-500 text-xs text-rose-300 font-semibold flex items-center space-x-2.5";
        } else {
            btn.className = "w-full text-left p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-500 flex items-center space-x-2.5";
        }
    });

    // Explanation Box
    explanationBox.classList.remove('hidden');
    if (isCorrect) {
        explanationBox.className = "p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-xs space-y-1";
        explanationBox.innerHTML = `<strong>✓ Correct!</strong><p class="text-slate-300 mt-1">${qData.explanation}</p>`;
    } else {
        explanationBox.className = "p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 text-xs space-y-1";
        explanationBox.innerHTML = `<strong>✗ Incorrect.</strong><p class="text-slate-300 mt-1">${qData.explanation}</p>`;
    }

    nextBtn.disabled = false;
    document.getElementById('quiz-score-pill').textContent = `Score: ${state.quizScore} / ${state.quizQuestions.length}`;
}

function renderQuizCompletion() {
    const card = document.getElementById('quiz-card');
    if (!card) return;

    const percent = Math.round((state.quizScore / state.quizQuestions.length) * 100);

    card.innerHTML = `
        <div class="text-center py-8 space-y-4">
            <div class="text-6xl">🎓</div>
            <h3 class="text-2xl font-black text-white">Quiz Completed!</h3>
            <p class="text-sm text-slate-300">You scored <strong class="text-emerald-400">${state.quizScore} out of ${state.quizQuestions.length}</strong> (${percent}%)</p>
            <div class="p-4 rounded-xl bg-slate-800/80 border border-slate-700 max-w-md mx-auto text-xs text-slate-300 leading-relaxed">
                ${percent >= 80 ? "🌟 Master Environmental Champion! You possess deep knowledge of waste segregation and circular sustainability." : "🌱 Great effort! Revisit the AI Waste Scanner and Composting Hub to sharpen your zero-waste habits."}
            </div>
            <div class="pt-4">
                <button onclick="restartQuizFull()" class="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-purple-600/30">
                    Retake Quiz ↺
                </button>
            </div>
        </div>
    `;
}

function restartQuizFull() {
    state.quizCurrentIndex = 0;
    state.quizScore = 0;
    state.quizAnswered = false;
    location.reload();
}
