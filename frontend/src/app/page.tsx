'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, 
  Shield, 
  Trophy, 
  Ticket, 
  Users, 
  Clock, 
  TrendingUp, 
  CreditCard, 
  Wallet,
  Menu,
  X
} from 'lucide-react';
import { useLottery } from '@/hooks/useLottery';
import { useLanguage } from '@/hooks/useLanguage';
import { LotteryCard } from '@/components/LotteryCard';
import { BuyTicketModal } from '@/components/BuyTicketModal';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';

export default function HomePage() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  
  const { lottery, lotteryStats } = useLottery();

  const handleBuyTicket = () => {
    // Check if user is authenticated
    const token = localStorage.getItem('auth_token');
    if (!token) {
      // Redirect to login or show login modal
      console.log('User needs to login first');
      // For now, we'll just show the modal anyway for demo purposes
    }
    setShowBuyModal(true);
  };

  // Removed the loading condition that was blocking the UI
  // The page will now render immediately with mock data

  const timeRemaining = new Date(lottery.endTime).getTime() - Date.now();
  const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black text-white">CryptoLotto</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
                {t('navigation.home')}
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
                {t('navigation.lottery')}
              </a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors font-medium">
                {t('navigation.history')}
              </a>
              <LanguageSwitcher />
              <button
                onClick={handleBuyTicket}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-6 py-2 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all"
              >
                {t('navigation.buyTicket')}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-4">
              <LanguageSwitcher />
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-yellow-400/20"
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors font-medium">
                {t('navigation.home')}
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors font-medium">
                {t('navigation.lottery')}
              </a>
              <a href="#" className="block text-gray-300 hover:text-yellow-400 transition-colors font-medium">
                {t('navigation.history')}
              </a>
              <button
                onClick={handleBuyTicket}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3 rounded-full"
              >
                {t('navigation.buyTicket')}
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
          <div className="text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-yellow-400/10 border border-yellow-400/20 mb-8">
                <Shield className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-yellow-400">100% {t('features.transparency.title')}</span>
              </div>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
            >
              {t('hero.title')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-500">
                {t('hero.titleHighlight')}
              </span>{' '}
              {t('hero.titleEnd')}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all group"
              >
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1">${lottery.totalPool.toLocaleString()}</div>
                <div className="text-sm text-gray-400">{t('hero.currentPrize')}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all group"
              >
                <Users className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1">{lotteryStats.activeUsers}</div>
                <div className="text-sm text-gray-400">{t('hero.activePlayers')}</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all group"
              >
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1">{days}{t('hero.days')} {hours}h</div>
                <div className="text-sm text-gray-400">{t('hero.timeRemaining')}</div>
              </motion.div>
            </div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 }}
              onClick={handleBuyTicket}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-lg px-12 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-2xl"
            >
              {t('hero.cta')}
            </motion.button>
          </div>
        </div>
      </section>

      {/* Current Lottery Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-gray-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t('lottery.currentLottery')}
            </h2>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <LotteryCard lottery={lottery} onBuyTicket={handleBuyTicket} />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t('features.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: t('features.transparency.title'),
                description: t('features.transparency.description')
              },
              {
                icon: Zap,
                title: t('features.instant.title'),
                description: t('features.instant.description')
              },
              {
                icon: TrendingUp,
                title: t('features.secure.title'),
                description: t('features.secure.description')
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 hover:border-yellow-400/30 transition-all group"
              >
                <feature.icon className="w-12 h-12 text-yellow-400 mx-auto mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-bold text-white mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-300 text-center leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-gradient-to-b from-gray-900/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t('howItWorks.title')}
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: t('howItWorks.step1.title'),
                description: t('howItWorks.step1.description'),
                icon: CreditCard
              },
              {
                step: "02",
                title: t('howItWorks.step2.title'),
                description: t('howItWorks.step2.description'),
                icon: Clock
              },
              {
                step: "03",
                title: t('howItWorks.step3.title'),
                description: t('howItWorks.step3.description'),
                icon: Wallet
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="relative mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <item.icon className="w-10 h-10 text-black" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-sm font-black">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-yellow-400/10 via-yellow-400/5 to-yellow-400/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              {t('cta.title')} <span className="text-yellow-400">{t('cta.titleHighlight')}</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t('cta.subtitle')}
            </p>
            <motion.button
              onClick={handleBuyTicket}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-lg px-12 py-4 rounded-full hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-2xl"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t('cta.button')}
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Buy Ticket Modal */}
      {showBuyModal && (
        <BuyTicketModal
          lottery={lottery}
          onClose={() => setShowBuyModal(false)}
        />
      )}
    </div>
  );
}