'use client';

import { motion } from 'framer-motion';
import { Clock, Ticket, Users, Trophy, Zap } from 'lucide-react';
import { Lottery } from '../../../shared/types';

interface LotteryCardProps {
  lottery: Lottery;
  onBuyTicket: () => void;
}

export function LotteryCard({ lottery, onBuyTicket }: LotteryCardProps) {
  const timeRemaining = new Date(lottery.endTime).getTime() - Date.now();
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

  const progress = (lottery.ticketsSold / lottery.maxTickets) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-4xl mx-auto"
    >
      <div className="bg-gradient-to-br from-gray-900 to-black border border-gray-700 rounded-3xl p-8 md:p-12 relative overflow-hidden group hover:border-yellow-400/50 transition-all duration-500">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, #fbbf24 0%, transparent 50%), 
                             radial-gradient(circle at 80% 20%, #fbbf24 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full px-4 py-2 mb-4">
              <Zap className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm font-semibold">ROUND #{lottery.round}</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-2">SORTEO ACTIVO</h3>
            <p className="text-gray-400">Participa ahora y gana el premio acumulado</p>
          </div>

          {/* Prize Pool */}
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30 rounded-2xl p-6 mb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className="text-gray-300 text-lg">Premio Total</span>
              </div>
              <div className="text-4xl md:text-5xl font-black text-yellow-400">
                ${lottery.totalPool.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center group-hover:border-gray-600 transition-colors">
              <Ticket className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{lottery.ticketsSold}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Vendidos</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center group-hover:border-gray-600 transition-colors">
              <Users className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">{lottery.maxTickets}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Máximo</div>
            </div>
            <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center group-hover:border-gray-600 transition-colors">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-white">
                {days}d {hours}h
              </div>
              <div className="text-xs text-gray-400 uppercase tracking-wider">Restante</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm">Progreso de tickets</span>
              <span className="text-yellow-400 text-sm font-semibold">{progress.toFixed(1)}%</span>
            </div>
            <div className="bg-gray-800 rounded-full h-3 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1.5, ease: 'easeOut' }}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </motion.div>
            </div>
          </div>

          {/* Countdown */}
          <div className="bg-black/30 border border-gray-700 rounded-2xl p-6 mb-8">
            <div className="text-center">
              <div className="text-gray-300 text-sm mb-3 uppercase tracking-wider">
                Tiempo restante
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-2xl md:text-3xl font-black text-yellow-400">{days}</div>
                  <div className="text-xs text-gray-400 uppercase">Días</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-yellow-400">{hours}</div>
                  <div className="text-xs text-gray-400 uppercase">Horas</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-black text-yellow-400">{minutes}</div>
                  <div className="text-xs text-gray-400 uppercase">Min</div>
                </div>
              </div>
            </div>
          </div>

          {/* Buy Button */}
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(251, 191, 36, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={onBuyTicket}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-xl py-6 rounded-2xl shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center space-x-3">
              <Ticket className="w-6 h-6" />
              <span>COMPRAR TICKET - $1 USD</span>
              <Zap className="w-6 h-6" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
