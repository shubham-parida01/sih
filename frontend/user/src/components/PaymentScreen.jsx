import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, ShieldCheck, ScanLine, LogOut } from "lucide-react";
import toast from "react-hot-toast";
import { TelemetryTerminal } from "./TelemetryTerminal"; 
import { auth, transaction, clearSession, getSession } from "../services/api";

export const PaymentScreen = ({
  onTriggerIntervention,
  onPaymentSuccess,
  isDark,
  setIsDark,
  onLogout
}) => {
  const [amount, setAmount] = useState(25000);
  const [upiId, setUpiId] = useState("retailer@upi");
  const [payeeName, setPayeeName] = useState("Grocery Mart");
  const [isExtracting, setIsExtracting] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

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

  // Synthetic Coercion Toggles
  const [telemetry, setTelemetry] = useState({
    activeCall: false,
    newDevice: false,
    firstTimePayee: false,
  });

  // Fetch current user details on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await auth.me();
        setUserProfile(res.data);
      } catch (err) {
        console.warn("Could not fetch active profile:", err);
        const session = getSession();
        if (session.name) {
          setUserProfile({ full_name: session.name, upi_id: "user@upi", balance: 50000.0 });
        }
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setAmount(0);
    } else {
      const numericValue = Number(rawValue);
      setAmount(Math.min(numericValue, 1000000));
    }
  };

  useEffect(() => {
    const extractDeviceData = async () => {
      const ua = navigator.userAgent;
      let os = "Unknown OS";
      if (ua.includes("Win")) os = "Windows";
      if (ua.includes("Mac")) os = "MacOS";
      if (ua.includes("Linux")) os = "Linux";
      if (ua.includes("Android")) os = "Android";
      if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";

      let batteryLevel = "Unsupported";
      if ("getBattery" in navigator) {
        try {
          const battery = await navigator.getBattery();
          batteryLevel = `${Math.round(battery.level * 100)}% ${battery.charging ? "(Charging)" : ""}`;
        } catch (e) {
          batteryLevel = "Access Denied";
        }
      }

      const connection =
        navigator.connection ||
        navigator.mozConnection ||
        navigator.webkitConnection;
      const networkType = connection
        ? `${connection.effectiveType.toUpperCase()} (${connection.downlink}Mbps)`
        : "Unknown";

      setRealDeviceData({
        os,
        browser: navigator.vendor || "Browser Client",
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

  const handlePayment = async (e) => {
    e?.preventDefault();
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsExtracting(true);

    try {
      // Direct call to FastAPI backend transaction initiate endpoint
      const res = await transaction.initiate({
        payee_name: payeeName || "Recipient",
        payee_upi: upiId,
        amount: Number(amount),
        telemetry: {
          ...telemetry,
          ...realDeviceData
        }
      });

      setIsExtracting(false);

      if (res.data.status === "paused") {
        if (onTriggerIntervention) {
          onTriggerIntervention({
            txnId: res.data.transaction_id,
            riskScore: res.data.risk_score,
            explanation: res.data.risk_explanation,
            recommendation: res.data.recommendation,
            factors: res.data.factors || [],
            amount,
            upiId,
            payeeName
          });
        }
      } else {
        if (onPaymentSuccess) {
          onPaymentSuccess({ amount, upiId });
        }
        // Refresh profile to show updated balance
        const updated = await auth.me();
        setUserProfile(updated.data);
      }
    } catch (err) {
      setIsExtracting(false);
      toast.error(err.detail || err.message || "Transaction processing failed");
    }
  };

  // Structured correctly as expected by TelemetryTerminal component
  const liveJSON = {
    timestamp: new Date().toISOString(),
    transaction_features: {
      amount_inr: Number(amount) || 0,
      payee_id: upiId,
    },
    extracted_device_hardware: {
      os: realDeviceData.os,
      battery: realDeviceData.battery,
      network: realDeviceData.network,
      screenResolution: realDeviceData.screenResolution,
    },
    situational_sensors: {
      call_state_active: telemetry.activeCall,
      device_fingerprint_match: !telemetry.newDevice,
      payee_in_contacts: !telemetry.firstTimePayee,
    }
  };

  return (
    <div className="min-h-screen w-full bg-(--color-pure-white) dark:bg-(--color-obsidian) p-4 md:p-8 flex flex-col justify-between transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-(--color-ash)/40 dark:border-(--color-steel) pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) flex items-center justify-center font-bold text-(--color-off-black-ink) dark:text-white">
            {userProfile?.full_name ? userProfile.full_name.charAt(0) : "U"}
          </div>
          <div>
            <h2 className="font-bold text-sm text-(--color-off-black-ink) dark:text-white">
              {userProfile?.full_name || "RakshaPay User"}
            </h2>
            <p className="text-xs text-(--color-graphite) dark:text-(--color-ash-dark)">
              {userProfile?.upi_id || "user@upi"} • ₹{userProfile?.balance ? userProfile.balance.toLocaleString() : "50,000"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              clearSession();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-full border border-(--color-ash) dark:border-(--color-steel) hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full items-start">
        {/* Left: Payment Form Card */}
        <div className="bg-(--color-off-white-canvas) dark:bg-(--color-graphite-dark) rounded-3xl p-6 sm:p-8 border border-(--color-ash)/40 dark:border-(--color-steel) shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold uppercase tracking-widest text-(--color-electric-lime) dark:text-(--color-iris-gleam) bg-black/10 dark:bg-white/10 px-3 py-1 rounded-full">
              UPI Safe Pay
            </span>
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
          </div>

          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-(--color-graphite) dark:text-(--color-ash-dark) mb-1">
                Payee Name
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Payee Name"
                className="w-full bg-(--color-pure-white) dark:bg-(--color-abyss) border border-(--color-ash) dark:border-(--color-steel) rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-graphite) dark:text-(--color-ash-dark) mb-1">
                Recipient UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                className="w-full bg-(--color-pure-white) dark:bg-(--color-abyss) border border-(--color-ash) dark:border-(--color-steel) rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-(--color-graphite) dark:text-(--color-ash-dark) mb-1">
                Amount (INR)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-bold text-lg text-(--color-graphite)">₹</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleChange}
                  className="w-full bg-(--color-pure-white) dark:bg-(--color-abyss) border border-(--color-ash) dark:border-(--color-steel) rounded-xl pl-8 pr-4 py-3 text-2xl font-bold focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isExtracting}
              className="w-full bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) text-(--color-off-black-ink) dark:text-white font-bold py-3.5 rounded-full hover:opacity-90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
            >
              {isExtracting ? (
                <span>Evaluating Signals...</span>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send ₹{Number(amount).toLocaleString()}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right: Real-time Telemetry Feed Terminal */}
        <div className="w-full">
          <TelemetryTerminal 
            isDark={isDark} 
            setIsDark={setIsDark} 
            telemetry={telemetry} 
            toggleTelemetry={toggleTelemetry} 
            liveJSON={liveJSON} 
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentScreen;