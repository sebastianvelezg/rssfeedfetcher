// src/app/settings/page.js
import Link from "next/link";
import SettingsForm from "@/components/settingsForm";
import TimerSettings from "@/components/timerSettings";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#171717] to-[#1a1a1a]">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Settings className="w-8 h-8 text-[#DA0037]" />
            <h1 className="text-3xl font-bold text-[#EDEDED]">Settings</h1>
          </div>
          <Link
            href="/"
            className="bg-[#DA0037] hover:bg-[#b8002f] text-[#EDEDED] font-bold py-2.5 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 focus:ring-2 focus:ring-[#DA0037] focus:ring-opacity-50 shadow-lg"
          >
            Back to Home
          </Link>
        </div>

        <div className="grid gap-6">
          {/* RSS Feed Management Section */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-xl">
            <SettingsForm />
          </div>

          {/* Timer Settings Section */}
          <div className="bg-[#2a2a2a] rounded-xl p-6 shadow-xl">
            <TimerSettings />
          </div>
        </div>
      </div>
    </div>
  );
}
