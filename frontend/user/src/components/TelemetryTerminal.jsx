import { useState } from "react";
import {
  PhoneCall,
  Smartphone,
  UserPlus,
  Terminal,
  Cpu,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export const TelemetryTerminal = ({
  isDark,
  setIsDark,
  telemetry,
  toggleTelemetry,
  liveJSON,
}) => {
  const [showTable, setShowTable] = useState(true);
  const currentRiskScore = (telemetry?.activeCall ? 35 : 0) + (telemetry?.newDevice ? 25 : 0) + (telemetry?.firstTimePayee ? 20 : 0);
  const getRiskBadge = () => {
    if (currentRiskScore === 0) {
      return { text: "RISK SCORE: 0/100 • SAFE PASSING", cls: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };
    }
    if (currentRiskScore < 60) {
      return { text: `RISK SCORE: ${currentRiskScore}/100 • PAUSE REVIEW`, cls: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30" };
    }
    return { text: `RISK SCORE: ${currentRiskScore}/100 • CRITICAL BLOCKED`, cls: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 animate-pulse" };
  };
  const badge = getRiskBadge();

  return (
    <>
      {/* Custom Scrollbar Styles for the Terminal */}
      <style>{`
        .terminal-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .terminal-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db; /* gray-300 for light mode */
          border-radius: 10px;
        }
        .dark .terminal-scrollbar::-webkit-scrollbar-thumb {
          background-color: #374151; /* gray-700 for dark mode */
        }
        .terminal-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: var(--color-electric-lime, #beff50);
        }
        
        /* For Firefox */
        .terminal-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #d1d5db transparent;
        }
        .dark .terminal-scrollbar {
          scrollbar-color: #374151 transparent;
        }
      `}</style>

      {/* Added "terminal-scrollbar" class here */}
      <div className="terminal-scrollbar w-full h-full bg-slate-50 dark:bg-gray-900 border border-slate-200/60 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <Cpu className="w-8 h-8 text-(--color-electric-lime) dark:text-(--color-iris-gleam)" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-(--color-off-black-ink) dark:text-white tracking-tight">
                  On-Device Extraction
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${badge.cls}`}>
                  {badge.text}
                </span>
              </div>
              <p className="text-sm text-(--color-graphite) dark:text-gray-400 mt-0.5">
                Real-time local hardware and environmental state.
              </p>
            </div>
          </div>
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>

        {/* Presenter Overrides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
          {[
            { id: "activeCall", label: "Call Active", icon: PhoneCall },
            { id: "newDevice", label: "New Device", icon: Smartphone },
            { id: "firstTimePayee", label: "New Payee", icon: UserPlus },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => toggleTelemetry(item.id)}
              className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-center gap-2 text-sm font-bold ${
                telemetry[item.id]
                  ? "bg-(--color-electric-lime) dark:bg-(--color-iris-gleam) border-(--color-electric-lime) dark:border-(--color-iris-gleam) text-(--color-off-black-ink) dark:text-white"
                  : "bg-(--color-off-white-canvas) dark:bg-(--color-graphite-dark) border-(--color-ash) dark:border-(--color-steel) text-(--color-graphite) dark:text-(--color-ash-dark) hover:border-(--color-off-black-ink) dark:hover:border-gray-600"
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </div>
          ))}
        </div>

        {/* Syntax Highlighted JSON Terminal */}
        <div className="flex-1 bg-(--color-off-white-canvas) dark:bg-[#141414] rounded-xl border border-(--color-ash) dark:border-gray-800 overflow-hidden flex flex-col font-mono shadow-2xl transition-colors duration-300 min-h-0">
          <div className="bg-(--color-ash)/30 dark:bg-[#1a1a1a] px-4 py-3 border-b border-(--color-ash) dark:border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-(--color-graphite) dark:text-gray-400" />
              <span className="text-(--color-graphite) dark:text-gray-400 text-xs tracking-wider">
                feature_vector.json
              </span>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
          </div>

          {/* Added "terminal-scrollbar" class here too */}
          <div className="terminal-scrollbar p-4 lg:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
            {/* Content Area */}
            {showTable ? (
              <div className="overflow-x-auto terminal-scrollbar border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-left text-sm">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900">
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100" colSpan="2">Metadata</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 w-1/3">Timestamp</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">
                        {new Date(liveJSON.timestamp).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100" colSpan="2">Transaction Details</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Amount (INR)</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono">
                        ₹{liveJSON.transaction_features.amount_inr}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Payee ID</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{liveJSON.transaction_features.payee_id}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100" colSpan="2">Device Hardware</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Operating System</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{liveJSON.extracted_device_hardware.os}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Battery Status</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{liveJSON.extracted_device_hardware.battery}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Network</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{liveJSON.extracted_device_hardware.network}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Resolution</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300">{liveJSON.extracted_device_hardware.screenResolution}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                      <td className="px-4 py-3 font-semibold text-gray-900 dark:text-gray-100" colSpan="2">Situational Sensors</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Call State Active</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${liveJSON.situational_sensors.call_state_active ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800" : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"}`}>
                          {String(liveJSON.situational_sensors.call_state_active)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Device Match</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${liveJSON.situational_sensors.device_fingerprint_match ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"}`}>
                          {String(liveJSON.situational_sensors.device_fingerprint_match)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Payee in Contacts</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${liveJSON.situational_sensors.payee_in_contacts ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"}`}>
                          {String(liveJSON.situational_sensors.payee_in_contacts)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="terminal-scrollbar p-4 bg-gray-50 dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-x-auto text-sm leading-relaxed">
                <pre className="text-gray-900 dark:text-gray-300 font-mono">
                  <span className="text-slate-800 dark:text-[#847dff]">{"{"}</span>
                  <br />
                  {"  "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"timestamp"</span>:{" "}
                  <span className="text-emerald-800 dark:text-[#beff50]">"{liveJSON.timestamp}"</span>,
                  <br />
                  {"  "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"transaction_features"</span>: <span className="text-slate-800 dark:text-[#847dff]">{"{"}</span>
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"amount_inr"</span>:{" "}
                  <span className="text-fuchsia-800 dark:text-[#dd90d8]">{liveJSON.transaction_features.amount_inr}</span>,
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"payee_id"</span>:{" "}
                  <span className="text-emerald-800 dark:text-[#beff50]">"{liveJSON.transaction_features.payee_id}"</span>
                  <br />
                  {"  "}<span className="text-slate-800 dark:text-[#847dff]">{"}"}</span>,
                  <br />
                  {"  "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"extracted_device_hardware"</span>: <span className="text-slate-800 dark:text-[#847dff]">{"{"}</span>
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"os"</span>:{" "}
                  <span className="text-emerald-800 dark:text-[#beff50]">"{liveJSON.extracted_device_hardware.os}"</span>,
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"battery"</span>:{" "}
                  <span className="text-emerald-800 dark:text-[#beff50]">"{liveJSON.extracted_device_hardware.battery}"</span>,
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"network"</span>:{" "}
                  <span className="text-emerald-800 dark:text-[#beff50]">"{liveJSON.extracted_device_hardware.network}"</span>,
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"resolution"</span>:{" "}
                  <span className="text-emerald-800 dark:text-[#beff50]">"{liveJSON.extracted_device_hardware.screenResolution}"</span>
                  <br />
                  {"  "}<span className="text-slate-800 dark:text-[#847dff]">{"}"}</span>,
                  <br />
                  {"  "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"situational_sensors"</span>: <span className="text-slate-800 dark:text-[#847dff]">{"{"}</span>
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"call_state_active"</span>:{" "}
                  <span className={liveJSON.situational_sensors.call_state_active ? "text-red-700 font-semibold dark:text-[#ff4433]" : "text-fuchsia-800 dark:text-[#dd90d8]"}>
                    {String(liveJSON.situational_sensors.call_state_active)}
                  </span>,
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"device_match"</span>:{" "}
                  <span className={liveJSON.situational_sensors.device_fingerprint_match ? "text-fuchsia-800 dark:text-[#dd90d8]" : "text-red-700 font-semibold dark:text-[#ff4433]"}>
                    {String(liveJSON.situational_sensors.device_fingerprint_match)}
                  </span>,
                  <br />
                  {"    "}<span className="text-cyan-900 font-medium dark:text-[#00b3dd]">"payee_in_contacts"</span>:{" "}
                  <span className={liveJSON.situational_sensors.payee_in_contacts ? "text-fuchsia-800 dark:text-[#dd90d8]" : "text-red-700 font-semibold dark:text-[#ff4433]"}>
                    {String(liveJSON.situational_sensors.payee_in_contacts)}
                  </span>
                  <br />
                  {"  "}<span className="text-slate-800 dark:text-[#847dff]">{"}"}</span>
                  <br />
                  <span className="text-slate-800 dark:text-[#847dff]">{"}"}</span>
                </pre>
              </div>
            )}
          </div>

          {/* Toggle Button Moved to Bottom Fixed Footer */}
          <div className="px-4 lg:px-6 py-4 border-t border-(--color-ash) dark:border-gray-800 bg-(--color-off-white-canvas) dark:bg-[#1a1a1a] flex justify-end shrink-0">
            <button
              onClick={() => setShowTable(!showTable)}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 shadow-sm cursor-pointer"
            >
              {showTable ? "View as JSON" : "View as Table"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};