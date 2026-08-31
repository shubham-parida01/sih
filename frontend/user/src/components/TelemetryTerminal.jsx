import { useState } from "react";
import {
  PhoneCall,
  Smartphone,
  UserPlus,
  Terminal,
  Cpu,
  Code,
  Table as TableIcon
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

  return (
    <>
      <div className="terminal-scrollbar w-full h-full glass-panel dark:bg-gray-900/80 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 flex flex-col transition-colors duration-300 shadow-2xl relative overflow-hidden">
        {/* Glow Lighting Orb */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400/10 dark:bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-lime-500/10 dark:bg-lime-400/10 border border-lime-500/20 text-lime-700 dark:text-lime-400 shadow-sm">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
                On-Device Extraction
              </h2>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
                Real-time local hardware and environmental telemetry signals.
              </p>
            </div>
          </div>
          <ThemeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>

        {/* Presenter Overrides */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-6 shrink-0 relative z-10">
          {[
            { id: "activeCall", label: "Call Active", icon: PhoneCall },
            { id: "newDevice", label: "New Device", icon: Smartphone },
            { id: "firstTimePayee", label: "New Payee", icon: UserPlus },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => toggleTelemetry(item.id)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-center gap-2.5 text-xs font-extrabold select-none shadow-sm ${
                telemetry[item.id]
                  ? "bg-(--color-electric-lime) border-lime-400 text-black shadow-[0_0_20px_rgba(190,255,80,0.4)] scale-[1.02]"
                  : "bg-white/60 dark:bg-gray-950/60 border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-white dark:hover:bg-gray-900"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Syntax Highlighted JSON Terminal */}
        <div className="flex-1 bg-white/90 dark:bg-[#121316] rounded-2xl border border-gray-200/80 dark:border-gray-800/80 overflow-hidden flex flex-col font-mono shadow-xl transition-colors duration-300 min-h-0 relative z-10">
          <div className="bg-gray-100/80 dark:bg-[#181a1f] px-5 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400 text-xs font-bold tracking-wider">
                feature_vector.json
              </span>
            </div>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-green-500/80"></span>
            </div>
          </div>

          <div className="terminal-scrollbar p-4 lg:p-6 overflow-y-auto flex-1 flex flex-col gap-4">
            {/* Content Area */}
            {showTable ? (
              <div className="overflow-x-auto terminal-scrollbar border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-left text-xs">
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#121316]">
                    <tr className="bg-gray-50 dark:bg-gray-900/60">
                      <td className="px-4 py-3 font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100" colSpan="2">Metadata</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400 w-1/3">Timestamp</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-semibold">
                        {new Date(liveJSON.timestamp).toLocaleString()}
                      </td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900/60">
                      <td className="px-4 py-3 font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100" colSpan="2">Transaction Details</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Amount (INR)</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono font-bold">
                        ₹{liveJSON.transaction_features.amount_inr}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Payee ID</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-mono font-semibold">{liveJSON.transaction_features.payee_id}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900/60">
                      <td className="px-4 py-3 font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100" colSpan="2">Device Hardware</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Operating System</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-semibold">{liveJSON.extracted_device_hardware.os}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Battery Status</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-semibold">{liveJSON.extracted_device_hardware.battery}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Network</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-semibold">{liveJSON.extracted_device_hardware.network}</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Resolution</td>
                      <td className="px-4 py-3 text-gray-900 dark:text-gray-300 font-semibold">{liveJSON.extracted_device_hardware.screenResolution}</td>
                    </tr>
                    <tr className="bg-gray-50 dark:bg-gray-900/60">
                      <td className="px-4 py-3 font-extrabold uppercase tracking-wider text-gray-900 dark:text-gray-100" colSpan="2">Situational Sensors</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Call State Active</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${liveJSON.situational_sensors.call_state_active ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"}`}>
                          {String(liveJSON.situational_sensors.call_state_active)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Device Match</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${(liveJSON.situational_sensors.device_match ?? liveJSON.situational_sensors.device_fingerprint_match) ? "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30" : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30"}`}>
                          {String(liveJSON.situational_sensors.device_match ?? liveJSON.situational_sensors.device_fingerprint_match)}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-gray-500 dark:text-gray-400">Payee in Contacts</td>
                      <td className="px-4 py-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${liveJSON.situational_sensors.payee_in_contacts ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30" : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"}`}>
                          {String(liveJSON.situational_sensors.payee_in_contacts)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="terminal-scrollbar p-5 bg-gray-900 text-gray-200 border border-gray-800 rounded-xl shadow-inner overflow-x-auto text-xs leading-relaxed">
                <pre className="font-mono">
                  <span className="text-purple-400">{"{"}</span>
                  <br />
                  {"  "}<span className="text-cyan-400">"timestamp"</span>:{" "}
                  <span className="text-lime-400">"{liveJSON.timestamp}"</span>,
                  <br />
                  {"  "}<span className="text-cyan-400">"transaction_features"</span>: <span className="text-purple-400">{"{"}</span>
                  <br />
                  {"    "}<span className="text-cyan-400">"amount_inr"</span>:{" "}
                  <span className="text-amber-300 font-bold">{liveJSON.transaction_features.amount_inr}</span>,
                  <br />
                  {"    "}<span className="text-cyan-400">"payee_id"</span>:{" "}
                  <span className="text-lime-400">"{liveJSON.transaction_features.payee_id}"</span>
                  <br />
                  {"  "}<span className="text-purple-400">{"}"}</span>,
                  <br />
                  {"  "}<span className="text-cyan-400">"extracted_device_hardware"</span>: <span className="text-purple-400">{"{"}</span>
                  <br />
                  {"    "}<span className="text-cyan-400">"os"</span>:{" "}
                  <span className="text-lime-400">"{liveJSON.extracted_device_hardware.os}"</span>,
                  <br />
                  {"    "}<span className="text-cyan-400">"battery"</span>:{" "}
                  <span className="text-lime-400">"{liveJSON.extracted_device_hardware.battery}"</span>,
                  <br />
                  {"    "}<span className="text-cyan-400">"network"</span>:{" "}
                  <span className="text-lime-400">"{liveJSON.extracted_device_hardware.network}"</span>,
                  <br />
                  {"    "}<span className="text-cyan-400">"resolution"</span>:{" "}
                  <span className="text-lime-400">"{liveJSON.extracted_device_hardware.screenResolution}"</span>
                  <br />
                  {"  "}<span className="text-purple-400">{"}"}</span>,
                  <br />
                  {"  "}<span className="text-cyan-400">"situational_sensors"</span>: <span className="text-purple-400">{"{"}</span>
                  <br />
                  {"    "}<span className="text-cyan-400">"call_state_active"</span>:{" "}
                  <span className={liveJSON.situational_sensors.call_state_active ? "text-red-400 font-extrabold" : "text-emerald-400 font-bold"}>
                    {String(liveJSON.situational_sensors.call_state_active)}
                  </span>,
                  <br />
                  {"    "}<span className="text-cyan-400">"device_match"</span>:{" "}
                  <span className={(liveJSON.situational_sensors.device_match ?? liveJSON.situational_sensors.device_fingerprint_match) ? "text-red-400 font-extrabold" : "text-emerald-400 font-bold"}>
                    {String(liveJSON.situational_sensors.device_match ?? liveJSON.situational_sensors.device_fingerprint_match)}
                  </span>,
                  <br />
                  {"    "}<span className="text-cyan-400">"payee_in_contacts"</span>:{" "}
                  <span className={liveJSON.situational_sensors.payee_in_contacts ? "text-emerald-400 font-bold" : "text-amber-400 font-extrabold"}>
                    {String(liveJSON.situational_sensors.payee_in_contacts)}
                  </span>
                  <br />
                  {"  "}<span className="text-purple-400">{"}"}</span>
                  <br />
                  <span className="text-purple-400">{"}"}</span>
                </pre>
              </div>
            )}
          </div>

          {/* Toggle Button Footer */}
          <div className="px-5 py-3.5 border-t border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-[#181a1f] flex justify-end shrink-0">
            <button
              onClick={() => setShowTable(!showTable)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-300 dark:border-gray-700 shadow-sm cursor-pointer"
            >
              {showTable ? (
                <>
                  <Code size={14} /> View as JSON
                </>
              ) : (
                <>
                  <TableIcon size={14} /> View as Table
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};