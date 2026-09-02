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

  // Fetch current user details
  const loadProfile = async () => {
    try {
      const res = await auth.me();
      if (res && res.data) {
        setUserProfile(res.data);
      }
    } catch (err) {
      console.warn("Could not fetch active profile:", err);
      if (err.status === 401 || err.status === 403) {
        clearSession();
        if (onLogout) onLogout();
      } else {
        const session = getSession();
        if (session.name) {
          setUserProfile({ 
            full_name: session.name, 
            upi_id: `${session.name.toLowerCase().replace(/\s+/g, '')}@upi`, 
            balance: 50000.0 
          });
        }
      }
    }
  };

  useEffect(() => {
    loadProfile();
    const handleUpdate = () => loadProfile();
    window.addEventListener('rakshapay_balance_update', handleUpdate);
    return () => window.removeEventListener('rakshapay_balance_update', handleUpdate);
  }, []);

  const handleChange = (e) => {
    const rawValue = e.target.value.replace(/\D/g, "");
    if (rawValue === "") {
      setAmount(0);
    } else {
      const numericValue = Number(rawValue);
      if (numericValue > 100000) {
        toast.error("Maximum UPI transfer limit is ₹1,00,000 per transaction");
        setAmount(100000);
      } else {
        setAmount(numericValue);
      }
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

      if (res.data.status === "paused" || res.data.status === "blocked") {
        if (onTriggerIntervention) {
          onTriggerIntervention({
            txnId: res.data.id || res.data.transaction_id,
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
        await loadProfile();
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
      device_match: telemetry.newDevice,
      payee_in_contacts: !telemetry.firstTimePayee,
    }
  };

  return (
    <div className="min-h-screen w-full bg-(--color-pure-white) dark:bg-(--color-obsidian) p-4 md:p-8 flex flex-col justify-between transition-colors duration-300">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between border-b border-gray-200/80 dark:border-gray-800 pb-5 mb-8 backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) flex items-center justify-center font-black text-black text-lg shadow-[0_0_20px_rgba(190,255,80,0.3)]">
            {userProfile?.full_name ? userProfile.full_name.charAt(0) : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-extrabold text-base text-gray-900 dark:text-white">
                {userProfile?.full_name || "RakshaPay User"}
              </h2>
              <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                ● Shield Active
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
              {userProfile?.upi_id || "user@upi"} • <span className="text-gray-900 dark:text-white font-extrabold">₹{userProfile?.balance != null ? Number(userProfile.balance).toLocaleString() : "0"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              clearSession();
              if (onLogout) onLogout();
            }}
            className="flex items-center gap-1.5 text-xs font-extrabold px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all shadow-sm cursor-pointer"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto w-full items-start relative z-10">
        {/* Left: Payment Form Card */}
        <div className="glass-panel dark:bg-gray-900/80 rounded-3xl p-6 sm:p-8 border border-gray-200 dark:border-gray-800 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-extrabold uppercase tracking-widest text-lime-700 dark:text-lime-400 bg-lime-500/10 dark:bg-lime-400/10 px-3.5 py-1.5 rounded-full border border-lime-500/20">
              UPI Safe Pay
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <ShieldCheck className="w-4 h-4 fill-current" />
              <span>Coercion Protected</span>
            </div>
          </div>

          <form onSubmit={handlePayment} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Payee Name
              </label>
              <input
                type="text"
                value={payeeName}
                onChange={(e) => setPayeeName(e.target.value)}
                placeholder="Payee Name"
                className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Recipient UPI ID
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="example@upi"
                className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5">
                Amount (INR)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-black text-2xl text-gray-400">₹</span>
                <input
                  type="text"
                  value={amount}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl pl-9 pr-4 py-3.5 text-3xl font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-lime-400/40 focus:border-lime-400 transition-all tracking-tight"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isExtracting}
              className="w-full bg-(--color-electric-lime) hover:bg-lime-400 text-black font-black text-base py-4 rounded-xl hover:shadow-[0_0_25px_rgba(190,255,80,0.4)] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer disabled:opacity-50 mt-2"
            >
              {isExtracting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Evaluating Signals...
                </span>
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