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
import { LotteryCard } from '@/components/LotteryCard';
import { BuyTicketModal } from '@/components/BuyTicketModal';

export default function HomePage() {
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
              <a href="#home" className="text-gray-300 hover:text-yellow-400 transition-colors">Inicio</a>
              <a href="#lottery" className="text-gray-300 hover:text-yellow-400 transition-colors">Sorteo</a>
              <a href="#how-it-works" className="text-gray-300 hover:text-yellow-400 transition-colors">Cómo Funciona</a>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyTicket}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-yellow-400/25 transition-all"
              >
                Comprar Ticket
              </motion.button>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-black/95 backdrop-blur-xl border-t border-yellow-400/20"
          >
            <div className="px-4 py-4 space-y-4">
              <a href="#home" className="block text-gray-300 hover:text-yellow-400 transition-colors">Inicio</a>
              <a href="#lottery" className="block text-gray-300 hover:text-yellow-400 transition-colors">Sorteo</a>
              <a href="#how-it-works" className="block text-gray-300 hover:text-yellow-400 transition-colors">Cómo Funciona</a>
              <button
                onClick={handleBuyTicket}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-bold py-3 rounded-full"
              >
                Comprar Ticket
              </button>
            </div>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 via-transparent to-yellow-400/5"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 bg-yellow-400/10 border border-yellow-400/30 rounded-full px-6 py-3 mb-8"
            >
              <Shield className="w-5 h-5 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">100% Transparente en Blockchain</span>
            </motion.div>

            {/* Main Title */}
            <h1 className="text-6xl md:text-8xl font-black mb-6">
              <span className="text-white">Crypto</span>
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">Lotto</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              La primera lotería completamente descentralizada. 
              <span className="text-yellow-400 font-semibold"> Compra, juega y gana</span> con 
              total transparencia en cada sorteo.
            </p>

            {/* Hero Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all group"
              >
                <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1">${lottery.totalPool.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Premio Actual</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all group"
              >
                <Ticket className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1">{lottery.ticketsSold}</div>
                <div className="text-sm text-gray-400">Tickets Vendidos</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all group"
              >
                <Users className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1">{lotteryStats.activeUsers}</div>
                <div className="text-sm text-gray-400">Jugadores Activos</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 hover:border-yellow-400/30 transition-all group"
              >
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-black text-white mb-1">{days}d {hours}h</div>
                <div className="text-sm text-gray-400">Tiempo Restante</div>
              </motion.div>
            </div>

            {/* CTA Buttons */}
                        {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBuyTicket}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-xl px-12 py-4 rounded-full shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300 relative overflow-hidden group"
              >
                <span className="relative z-10 flex items-center space-x-3">
                  <Zap className="w-6 h-6" />
                  <span>Comprar Ticket - $1</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="border-2 border-yellow-400/30 text-yellow-400 font-bold text-xl px-12 py-4 rounded-full hover:bg-yellow-400/10 transition-all duration-300"
              >
                Ver Cómo Funciona
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-yellow-400/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-yellow-400 rounded-full mt-2 animate-bounce"></div>
          </div>
        </motion.div>
      </section>

      {/* Current Lottery Section */}
      <section id="lottery" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/5 to-transparent"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Sorteo <span className="text-yellow-400">Activo</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Únete al sorteo actual y ten la oportunidad de ganar el premio acumulado
            </p>
          </motion.div>
          
          <LotteryCard 
            lottery={lottery}
            onBuyTicket={handleBuyTicket}
          />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-transparent to-yellow-400/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              ¿Por qué <span className="text-yellow-400">CryptoLotto</span>?
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="w-12 h-12" />,
                title: "100% Transparente",
                description: "Todos los sorteos son verificables en blockchain. Sin trucos, sin manipulación."
              },
              {
                icon: <Zap className="w-12 h-12" />,
                title: "Pagos Instantáneos",
                description: "Gana y recibe tu premio automáticamente. Sin esperas, sin complicaciones."
              },
              {
                icon: <TrendingUp className="w-12 h-12" />,
                title: "Mejores Probabilidades",
                description: "Menos participantes, mejores oportunidades de ganar grandes premios."
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:border-yellow-400/30 transition-all group"
              >
                <div className="text-yellow-400 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              ¿Cómo <span className="text-yellow-400">Funciona</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Participar es súper fácil. Solo 4 pasos para ganar grandes premios.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: <Users className="w-8 h-8" />,
                title: "Conecta tu Cuenta",
                description: "Login con Google o crea una cuenta en segundos"
              },
              {
                step: "2",
                icon: <CreditCard className="w-8 h-8" />,
                title: "Compra tu Ticket",
                description: "Paga $1 USD con tarjeta o cripto de forma instantánea"
              },
              {
                step: "3",
                icon: <Clock className="w-8 h-8" />,
                title: "Espera el Sorteo",
                description: "Cada domingo se realiza el sorteo automático"
              },
              {
                step: "4",
                icon: <Wallet className="w-8 h-8" />,
                title: "Recibe tu Premio",
                description: "Si ganas, recibes el pago automáticamente"
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
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-black font-black text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                    {item.step}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-yellow-400 mb-4 flex justify-center group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
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
              ¿Listo para <span className="text-yellow-400">Ganar</span>?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Únete a miles de jugadores que ya están ganando con CryptoLotto
            </p>
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(251, 191, 36, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBuyTicket}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-black text-2xl px-16 py-6 rounded-full shadow-2xl hover:shadow-yellow-400/25 transition-all duration-300"
            >
              Comprar Mi Primer Ticket
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-yellow-400/20 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black text-white">CryptoLotto</span>
            </div>
            <div className="text-gray-400 text-center md:text-right">
              <p>© 2024 CryptoLotto. Todos los derechos reservados.</p>
              <p className="text-sm mt-1">Juega responsablemente. Solo para mayores de 18 años.</p>
            </div>
          </div>
        </div>
      </footer>

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