export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-6 py-10 text-white">
      <div className="w-full max-w-xl rounded-[32px] border border-red-950/40 bg-[#121214]/80 p-10 shadow-[0_30px_80px_rgba(239,68,68,0.1)] backdrop-blur-xl">
        <div className="flex items-center justify-center mb-8">
          <div className="relative flex h-24 w-24 items-center justify-center">
            {/* Outer ring */}
            <div className="absolute inset-0 rounded-full border border-red-500/10" />
            {/* Spinning loader */}
            <div className="absolute inset-4 rounded-full border-4 border-red-600 border-t-transparent animate-spin" />
            {/* Inner glow */}
            <div className="absolute inset-8 rounded-full bg-red-500/5" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-red-500">Cyber Mind</p>
          <h1 className="mt-4 text-3xl font-semibold text-zinc-100 sm:text-4xl">Loading your secure experience</h1>
          <p className="mt-4 text-sm leading-7 text-zinc-400 sm:text-base">
            Preparing challenge environments, fetching puzzles, and booting the AI defender. Hang tight — the mission will be ready soon.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {/* Progress bar container */}
          <div className="rounded-2xl bg-black/40 border border-zinc-800/50 p-4">
            <div className="h-2 overflow-hidden rounded-full bg-zinc-900">
              {/* Progress bar gradient */}
              <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-red-700 via-red-500 to-rose-600 animate-pulse" />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-zinc-500">
              <span>Initializing modules</span>
              <span className="text-red-400 font-mono font-medium">69%</span>
            </div>
          </div>

          {/* Grid items */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-4 text-center">
              <p className="text-sm font-medium text-zinc-200">Secure engine</p>
              <p className="mt-2 text-xs text-zinc-500">Configuring defense</p>
            </div>
            <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-4 text-center">
              <p className="text-sm font-medium text-zinc-200">Challenge data</p>
              <p className="mt-2 text-xs text-zinc-500">Loading assets</p>
            </div>
            <div className="rounded-3xl border border-zinc-800/60 bg-zinc-900/30 px-4 py-4 text-center">
              <p className="text-sm font-medium text-zinc-200">AI review</p>
              <p className="mt-2 text-xs text-zinc-500">Starting analysis</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}