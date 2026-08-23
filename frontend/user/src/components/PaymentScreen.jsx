import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ShieldCheck, ScanLine } from "lucide-react";

import { TelemetryTerminal } from "./TelemetryTerminal"; 

export const PaymentScreen = ({
  onTriggerIntervention,
  onPaymentSuccess,
  isDark,
  setIsDark,
}) => {
  const [amount, setAmount] = useState(25000);
  const [upiId, setUpiId] = useState("ramesh@upi");
  const [isExtracting, setIsExtracting] = useState(false);

  // Real Device Data State
  const [realDeviceData, setRealDeviceData] = useState({
    os: "Detecting...",
    browser: "Detecting...",
    battery: "Detecting...",
    network: "Detecting...",
    screenResolution: "Detecting...",
    language: "Detecting...",
    timezone: "Detecting...",
  });

  // Synthetic Coercion Toggles (Things we can't extract from a browser easily)
  const [telemetry, setTelemetry] = useState({
    activeCall: false,
    newDevice: false,
    firstTimePayee: false,
  });

  // handling number in pay time
  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setAmount(0);
    } else {
      const numericValue = Number(rawValue);
      setAmount(Math.min(numericValue, 100000));
    }
  };

  // 1. ACTUAL LOCAL FEATURE EXTRACTION LOGIC
  useEffect(() => {
    const extractDeviceData = async () => {
      // OS Detection
      const ua = navigator.userAgent;
      let os = "Unknown OS";
      if (ua.includes("Win")) os = "Windows";
      if (ua.includes("Mac")) os = "MacOS";
      if (ua.includes("Linux")) os = "Linux";
      if (ua.includes("Android")) os = "Android";
      if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

      // Battery Extraction
      let batteryLevel = "Unsupported";
      if ("getBattery" in navigator) {
        try {
          const battery = await navigator.getBattery();
          batteryLevel = `${Math.round(battery.level * 100)}% ${battery.charging ? "(Charging)" : ""}`;
        } catch (e) {
          batteryLevel = "Access Denied";
          console.log(e.message);
        }
      }

      // Network Extraction
      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
      const networkType = connection
        ? `${connection.effectiveType.toUpperCase()} (${connection.downlink}Mbps)`
        : "Unknown";

      setRealDeviceData({
        os,
        browser: navigator.vendor || "Unknown",
        battery: batteryLevel,
        network: networkType,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        language: navigator.language,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    };

    extractDeviceData();
  }, []);

  const toggleTelemetry = (key) => {
    setTelemetry((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePayment = (e) => {
    e?.preventDefault();
    setIsExtracting(true);

    setTimeout(() => {
      setIsExtracting(false);
      const activeRiskCount = Object.values(telemetry).filter(Boolean).length;

      if (activeRiskCount >= 2) {
        if (onTriggerIntervention) {
          onTriggerIntervention({ amount, upiId, telemetry });
        }
      } else {
        if (onPaymentSuccess) {
          onPaymentSuccess({ amount, upiId });
        }
      }
    }, 1500); 
  };

  const liveJSON = {
    timestamp: new Date().toISOString(),
    transaction_features: {
      amount_inr: Number(amount) || 0,
      payee_id: upiId || "null",
    },
    extracted_device_hardware: realDeviceData,
    situational_sensors: {
      call_state_active: telemetry.activeCall,
      device_fingerprint_match: !telemetry.newDevice,
      payee_in_contacts: !telemetry.firstTimePayee,
    },
  };

  return (
    <div className="min-h-screen lg:h-screen overflow-x-hidden lg:overflow-hidden bg-(--color-pure-white) dark:bg-(--color-abyss) flex flex-col lg:flex-row font-sans transition-colors duration-300">
      
      {/* LEFT COLUMN: The Banking App / Phone Simulator */}
      <div className="w-full lg:w-1/2 min-h-screen lg:min-h-0 lg:h-full lg:overflow-y-auto flex items-center justify-center p-4 py-12 lg:p-12 relative bg-(--color-off-white-canvas) dark:bg-(--color-obsidian) transition-colors duration-300">
        
        {/* Neon Accent Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-100 h-100 bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) rounded-full blur-[150px] opacity-20 pointer-events-none transition-colors duration-300" />

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative w-full max-w-100 min-h-[700px] bg-(--color-pure-white) dark:bg-(--color-graphite-dark) rounded-4xl border border-(--color-ash) dark:border-(--color-steel) shadow-2xl overflow-hidden flex flex-col transition-colors duration-300"
        >
          {/* Scanning Overlay */}
          <AnimatePresence>
            {isExtracting && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-(--color-pure-white)/95 dark:bg-(--color-abyss)/90 backdrop-blur-sm flex flex-col items-center justify-center text-(--color-off-black-ink) dark:text-(--color-iris-gleam)"
              >
                <motion.div
                  animate={{ y: [-20, 20, -20] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                >
                  <ScanLine className="w-16 h-16 mb-4 opacity-80" />
                </motion.div>
                <p className="font-mono text-sm tracking-widest font-bold">
                  EXTRACTING LOCAL FEATURES
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* App Header */}
          <div className="p-6 bg-(--color-off-white-canvas) dark:bg-[#111111] border-b border-(--color-ash) dark:border-(--color-steel) flex items-center justify-between transition-colors duration-300">
            <div className="flex items-center space-x-3">
              <ArrowLeft className="w-5 h-5 text-(--color-off-black-ink) dark:text-(--color-cloud)" />
              <h1 className="text-xl font-bold tracking-tight text-(--color-off-black-ink) dark:text-white">
                Send Money
              </h1>
            </div>
            <ShieldCheck className="w-6 h-6 text-(--color-electric-lime) dark:text-(--color-iris-gleam)" />
          </div>

          {/* App Body */}
          <div className="flex-1 p-8 flex flex-col justify-center">
            <form onSubmit={handlePayment} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-xs font-bold text-(--color-graphite) dark:text-(--color-ash-dark) uppercase tracking-wider">
                  Payee UPI ID
                </label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full py-4 px-4 rounded-xl border border-(--color-ash) dark:border-(--color-steel) text-lg font-semibold text-(--color-off-black-ink) dark:text-white bg-(--color-off-white-canvas) dark:bg-(--color-abyss) focus:outline-none focus:border-(--color-electric-lime) dark:focus:border-(--color-iris-gleam) transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-(--color-graphite) dark:text-(--color-ash-dark) uppercase tracking-wider text-center">
                  Amount
                </label>
                <div className="flex items-center justify-center py-6">
                  <span className="text-4xl font-extrabold text-(--color-off-black-ink) dark:text-white mr-2">
                    ₹
                  </span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={amount === "" || amount === 0 ? "" : Number(amount).toLocaleString("en-IN")}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-48 text-5xl font-extrabold text-(--color-off-black-ink) dark:text-white bg-transparent focus:outline-none text-left"
                  />
                </div>
                <p className="text-center text-xs text-(--color-graphite) dark:text-(--color-ash-dark)">
                  Maximum amount: ₹1,00,000 (1 Lakh)
                </p>
              </div>

              <motion.button
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="w-full py-4 rounded-full bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) text-(--color-off-black-ink) dark:text-white font-bold text-lg shadow-[0_0_20px_rgba(190,255,80,0.3)] dark:shadow-[0_0_20px_rgba(132,125,255,0.3)] flex items-center justify-center space-x-2 transition-all hover:shadow-[0_0_30px_rgba(190,255,80,0.5)] dark:hover:shadow-[0_0_30px_rgba(132,125,255,0.5)] cursor-pointer"
              >
                <span>Pay Securely</span>
                <Send className="w-5 h-5" />
              </motion.button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Real-Time Feature Terminal */}
      <TelemetryTerminal
        isDark={isDark}
        setIsDark={setIsDark}
        telemetry={telemetry}
        toggleTelemetry={toggleTelemetry}
        liveJSON={liveJSON}
      />
    </div>
  );
};

export default PaymentScreen;