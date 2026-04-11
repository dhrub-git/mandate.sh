"use client";

export default function ChatLayout({
  left,
  right,
}: {
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-zinc-900 overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col w-3/5 h-full z-10 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-lg print:flex print:w-full print:border-none print:shadow-none print:h-auto print:overflow-visible print:bg-white">
        {left}
      </div>

      {/* RIGHT PANEL */}
      <div className="flex flex-col h-full w-full lg:w-2/5 print:hidden">
        {right}
      </div>
    </div>
  );
}