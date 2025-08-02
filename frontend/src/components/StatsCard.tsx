'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface StatsCardProps {
  icon: ReactNode;
  title: string;
  value: string;
  color: 'yellow' | 'blue' | 'green' | 'purple';
}

const colorClasses = {
  yellow: 'text-yellow-400 bg-yellow-400/10',
  blue: 'text-blue-400 bg-blue-400/10',
  green: 'text-green-400 bg-green-400/10',
  purple: 'text-purple-400 bg-purple-400/10',
};

export function StatsCard({ icon, title, value, color }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="bg-white/10 backdrop-blur-lg rounded-lg p-4 border border-white/20"
    >
      <div
        className={`w-12 h-12 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3 mx-auto`}
      >
        {icon}
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-white mb-1">{value}</div>
        <div className="text-sm text-gray-300">{title}</div>
      </div>
    </motion.div>
  );
}
