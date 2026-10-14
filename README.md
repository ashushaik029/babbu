# EcoClean: Smart Waste Management & Pollution Control System

An interactive cyber-physical and community-driven solution addressing **urban waste generation, improper disposal, lack of segregation, and environmental pollution**.

---

## 🎯 Alignment with Problem Statement & Objectives

| Objective | Built-in System Feature | Expected Impact |
| :--- | :--- | :--- |
| **1. Reduce environmental pollution** | **Geo-Tagged Grievance & Rapid Squad Portal:** Real-time logging of roadside dumping, drain blockages, and open air burning with auto-dispatch. | **65% reduction** in unattended waste piles; eliminates canal clogging and open air PM2.5/PM10 toxic smoke. |
| **2. 3-Stream Source Segregation** | **AI Waste Scanner & Guide:** Edge computer vision classifier for 🟢 Biodegradable, 🔵 Recyclable, and 🔴 Hazardous items with actionable disposal instructions. | Reaches **80%+ source segregation rate**, preventing plastic and toxic chemical contamination. |
| **3. Improve Collection & Recycling** | **IoT Smart Bins & Dynamic Fleet Route Optimizer:** Ultrasonic fill sensors + gas detectors trigger dynamic collection routes only when bins reach >80% capacity. | **30%+ reduction** in municipal fleet fuel burn, vehicle wear, and traffic congestion. |
| **4. Increase Public Awareness** | **Gamified EcoPoints & Segregation Quiz:** Interactive learning quiz, citizen reward redemption store (bus passes, compost bags), and ward leaderboards. | **3x increase** in civic compliance and neighborhood pride. |
| **5. Encourage Reuse & Composting** | **Home Composting Calculator & Upcycling Hub:** Real-time compost yield formulas, GHG savings metrics, and DIY zero-waste repurposing guides. | **50% diversion** of organic wet waste from municipal landfills into bio-fertilizers. |

---

## 🚀 How to Run the Application

This is a **zero-dependency, standalone modern web application**. No installation, node, or python backend is required.

1. Locate `index.html` in the project folder:
   ```
   c:\Users\Habeeba\Desktop\habeeba\index.html
   ```
2. Double-click `index.html` or open it with any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Brave, Safari).
3. Explore the live modules:
   - 📊 **Executive Dashboard:** Live census of daily waste streams and municipal action feed.
   - 🔍 **AI Waste Scanner:** Upload images or test sample waste items to see real-time classification and earn EcoPoints.
   - 📡 **Smart Bins & Fleet Routing:** Click **"Simulate Inflow"** to watch IoT depth gauges update, then click **"Optimize Collection Route"** to run the Dijkstra/TSP dynamic route solver on the city grid map!
   - 📢 **Report Dumping:** File a geo-tagged incident report with simulated GPS and dispatch sanitation squads.
   - 🌿 **Compost & Circular Economy:** Use the interactive slider calculator to estimate compost output and greenhouse gas reduction.
   - 🏆 **Rewards & Community:** Spend earned EcoPoints on municipal rewards and view neighborhood rankings.
   - ❓ **Awareness Quiz:** Challenge yourself with 5 practical segregation questions with immediate feedback.

---

## 📁 Project Structure

```
├── index.html               # Main application interface and responsive layout
├── styles.css               # Styling, animations, critical pulse indicators
├── app.js                   # Application state, IoT telemetry simulation, TSP routing, quiz logic
├── PROJECT_DOCUMENTATION.md # Comprehensive system blueprint, hardware specs, and KPIs
└── README.md                # Quickstart and objective alignment guide
```

---

## 🛠️ Hardware & Technical Architecture

- **Microcontroller:** ESP32 / Arduino MKR WAN 1310 (Low-power deep sleep mode)
- **Depth / Level Sensing:** Waterproof JSN-SR04T Ultrasonic Sensor
- **Odor & Air Quality:** MQ-135 Hazardous Gas Sensor (Ammonia, Benzene, Smoke)
- **Connectivity:** LoRaWAN (868/915 MHz) or NB-IoT for city-wide long-range low-power telemetry
- **Power:** 5W Solar Photovoltaic panel with 18650 Li-ion battery & TP4056 charge controller
- **Routing Engine:** Dynamic Vehicle Routing Problem (VRP) based on threshold fill telemetry
