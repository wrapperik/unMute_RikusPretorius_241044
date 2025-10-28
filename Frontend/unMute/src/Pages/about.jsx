import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, BookOpen, Shield, Target, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  const values = [
    {
      icon: Heart,
      title: 'Empathy First',
      description: 'We believe in the power of understanding and compassion. Every story matters, and every voice deserves to be heard.'
    },
    {
      icon: Shield,
      title: 'Safe & Anonymous',
      description: 'Your privacy is our priority. Share your story anonymously in a judgment-free space designed for healing.'
    },
    {
      icon: Users,
      title: 'Community Support',
      description: 'Connect with others who understand. You\'re not alone in this journey — thousands of men are here with you.'
    },
    {
      icon: BookOpen,
      title: 'Guided Resources',
      description: 'Access curated mental health resources, professional guidance, and tools for personal growth and wellness.'
    }
  ];

  const stats = [
    { number: '10K+', label: 'Active Members' },
    { number: '50K+', label: 'Stories Shared' },
    { number: '24/7', label: 'Support Available' },
    { number: '100%', label: 'Judgment-Free' }
  ];

  return (
    <div className="min-h-screen w-full">
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 bg-black/5 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">About unMute</span>
            </motion.div> */}
            
            <h1 className="text-5xl md:text-7xl font-bold text-black mb-6">
              Breaking the silence<br />
              <span className="text-black/70">one story at a time</span>
            </h1>
            
            <p className="text-xl text-black/80 max-w-3xl mx-auto leading-relaxed">
              A digital space designed to support men's mental health by breaking the silence around emotional struggles.
            </p>
          </motion.div>

          {/* Mission Statement */}
          <motion.div
            className="bg-[#004643] text-white rounded-3xl p-12 md:p-16 mb-16"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="max-w-4xl mx-auto text-center">
              <Target className="w-12 h-12 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-lg md:text-xl leading-relaxed text-white/90">
                Unmute is committed to creating a safe and judgment-free platform where men can share their stories, 
                read about others' experiences, and connect through understanding and empathy. We encourage openness, 
                authenticity, and healing — reminding men that vulnerability is strength, and no one has to face their 
                battles alone.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-black mb-4">What We Stand For</h2>
            <p className="text-lg text-black/70">The core values that guide our community</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="bg-white border-2 border-black rounded-3xl p-8 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center mb-4">
                  <value.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-black mb-3">{value.title}</h3>
                <p className="text-black/70 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-black mb-6">Anonymous Discussion Boards</h2>
              <p className="text-lg text-black/70 leading-relaxed mb-6">
                Share your story without fear of judgment. Our anonymous discussion boards provide a safe space 
                where you can express your thoughts, struggles, and triumphs freely. Connect with others who 
                understand what you're going through.
              </p>
              <Link 
                to="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#004643] text-white rounded-full font-medium hover:bg-white hover:text-[#004643] border-2 border-[#004643] transition-all duration-300"
              >
                Explore Posts
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              className="bg-black/5 rounded-3xl h-80 flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Users className="w-32 h-32 text-black/20" />
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              className="bg-black/5 rounded-3xl h-80 flex items-center justify-center order-2 md:order-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <BookOpen className="w-32 h-32 text-black/20" />
            </motion.div>

            <motion.div
              className="order-1 md:order-2"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-black mb-6">Private Journaling</h2>
              <p className="text-lg text-black/70 leading-relaxed mb-6">
                Track your mental health journey with our private journaling feature. Reflect on your thoughts, 
                monitor your mood patterns, and watch your progress over time. Your journal is completely private 
                and belongs only to you.
              </p>
              <Link 
                to="/journal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-black hover:text-white border-2 border-black transition-all duration-300"
              >
                Start Journaling
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Our Impact</h2>
            <p className="text-lg text-white/70">Together, we're making a difference</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <p className="text-5xl font-bold mb-2">{stat.number}</p>
                <p className="text-white/70">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Ready to start your journey?
          </h2>
          <p className="text-xl text-black/70 mb-8">
            Join thousands of men who have found strength in vulnerability and support in community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/signup"
              className="px-8 py-4 bg-[#004643] text-white rounded-full font-medium hover:bg-white hover:text-[#004643] border-2 border-[#004643] transition-all duration-300"
            >
              Join unMute
            </Link>
            <Link
              to="/explore"
              className="px-8 py-4 bg-white text-black rounded-full font-medium hover:bg-black hover:text-white border-2 border-black transition-all duration-300"
            >
              Explore Community
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
