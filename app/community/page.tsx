"use client";

import { motion } from "framer-motion";

export default function Community() {
  return (
    <main className="min-h-screen pt-[100px] sm:pt-[130px] md:pt-[160px] lg:pt-[180px] pb-20" style={{ backgroundColor: '#F2F2F2' }}>
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl font-bold mb-8 text-black">Community!</h1>
          <p className="text-lg text-black">Community page content coming soon...</p>
        </motion.div>
      </div>
    </main>
  );
}
