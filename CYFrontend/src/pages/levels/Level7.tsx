import React from 'react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { Gamepad2, Monitor } from 'lucide-react';
import { Link } from 'react-router-dom';

const Level7: React.FC = () => {
  return (
    <PageWrapper>
      <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-4xl overflow-hidden rounded-[2rem] border border-red-500/20 bg-black/90 shadow-[0_28px_120px_rgba(229,84,32,0.2)] backdrop-blur-xl"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative overflow-hidden bg-gradient-to-br from-[#120000] via-black to-[#3e0000] p-8 sm:p-10">
            <div className="absolute inset-x-[-120px] top-0 h-56 -translate-y-1/2 rounded-full bg-red-500/10 blur-3xl" />
            <div className="relative z-10 flex flex-col gap-8">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-sm font-medium text-red-200">
                    <Gamepad2 className="h-4 w-4 text-red-300" />
                    Level 7
                  </div>
                  <h1 className="mt-4 text-5xl font-black tracking-tight text-white">Red & Black Challenge</h1>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-gray-300">
                    Welcome to Level 7. This level uses a red and black theme to focus your attention and create a sharp, immersive challenge experience.
                  </p>
                </div>
                <Link
                  to="/linux"
                  className="inline-flex items-center gap-2 rounded-full bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-500"
                >
                  <Monitor className="h-4 w-4" />
                  Open Linux Terminal
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  <h2 className="text-lg font-semibold text-white">Mission Brief</h2>
                  <p className="mt-4 text-sm leading-7 text-gray-300">
                    Explore the Linux simulator and use its terminal to reveal hidden data. Every red detail is a clue—combine it with logic and system commands to complete the challenge.
                  </p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]">
                  <h2 className="text-lg font-semibold text-white">Quick Tips</h2>
                  <ul className="mt-4 space-y-3 text-sm text-gray-300">
                    <li>• Use `ls`, `cat`, `grep`, and `cd` in the Linux terminal.</li>
                    <li>• Inspect hidden files and system directories.</li>
                    <li>• Red UI accents highlight important sections.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 bg-black/95 p-8">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-3xl border border-red-500/20 bg-white/5 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-red-300">Challenge Status</h3>
                <p className="mt-4 text-sm text-gray-300">Your progress will be tracked here as you work through the challenge. Complete the task to unlock the next level.</p>
              </div>
              <div className="rounded-3xl border border-red-500/20 bg-white/5 p-6">
                <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-red-300">Available Tools</h3>
                <p className="mt-4 text-sm text-gray-300">Linux terminal, file explorer, browser, and system utilities are available inside the simulator.</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
};

export default Level7;
