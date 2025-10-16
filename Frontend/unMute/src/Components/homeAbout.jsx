import React from 'react';
import { motion } from 'framer-motion';
import {
  Compass,
  ArrowRight
} from "lucide-react";

export default function HomeAbout() {
  return (
    <div className="py-20 px-6">

      {/* Main Content */}
  <div className="flex flex-col-reverse md:flex-row-reverse justify-center items-center max-w-7xl mx-auto gap-12 md:gap-20">
        {/* Text Section */}
        <motion.div 
          className="flex-1 text-center md:text-left space-y-6"
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-4xl md:text-5xl font-medium text-black leading-tight">
            Breaking the silence,<br />
            one story at a time
          </h2>
          
          <p className="text-lg text-black leading-relaxed max-w-xl">
            We're building a safe space where men can openly share, connect, and heal. 
            No judgment. No pressure. Just real conversations and genuine support.
          </p>

          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 pt-4">
            <motion.button 
              className="group px-8 py-4 bg-[#004643] text-white rounded-3xl font-medium flex items-center justify-center gap-2 border-2 border-black hover:bg-white hover:text-[#004643] transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              Start Your Journey
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            
            <motion.button 
              className="group px-8 py-4 bg-white border-2 border-[#004643] text-[#004643] rounded-3xl font-medium flex items-center justify-center gap-2  hover:text-[#004643] transition-all duration-300"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
            >
              <Compass className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Explore Community
            </motion.button>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-8 pt-8">
            <div className="text-center md:text-left">
              <p className="text-3xl font-medium text-black">10K+</p>
              <p className="text-sm text-black">Active Members</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-medium text-black">50K+</p>
              <p className="text-sm text-black">Stories Shared</p>
            </div>
            <div className="text-center md:text-left">
              <p className="text-3xl font-medium text-black">24/7</p>
              <p className="text-sm text-black">Support</p>
            </div>
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div 
          className="flex-1 relative"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <img
            src="/man-face.png"
            alt="Community illustration"
            className="w-full max-w-lg mx-auto h-auto rounded-3xl hover:scale-[1.03] transition-transform duration-300" 
          />
        </motion.div>
      </div>
    </div>
  );
}