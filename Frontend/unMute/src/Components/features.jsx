import React from 'react'
import { motion } from 'framer-motion'

export default function Features() {
  const features = [
    { title: 'Anonymous discussion boards.', description: 'Description', image: '/star1.png' },
    { title: 'Mental health journaling and mood tracking.', description: 'Description', image: '/star2.png' },
    { title: 'Curated emotional wellness resources.', description: 'Description', image: '/star3.png' },
     { title: 'Creating a supportive community.', description: 'Description', image: '/star4.png' },
  ]

  return (
    <>
    {/* // <div>
    //   <h1 className="text-black mt-10 font-medium text-3xl text-center">What we offer</h1>
    //   </div> */}
    <div className="w-full mb-10 flex justify-center items-center flex-row flex-wrap gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className="card min-h-40 w-96 border-2 border-[#004643] card-xl rounded-3xl shadow-sm cursor-pointer transform transition duration-100 ease-out hover:scale-[1.03] hover:shadow-md hover:bg-[#004643] group relative overflow-hidden"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: index * 0.15, type: 'spring' }}
        >
          <div className="card-body text-[#004643] group-hover:text-white">
            <h2 className="card-title text-2xl">{feature.title}</h2>
          </div>
          <figure className="absolute bottom-2 right-2 pointer-events-none">
            <img
              src={feature.image}
              alt={feature.title}
              className=" group-hover:block h-15 w-15 object-contain transition-all duration-300 group-hover:invert group-hover:animate-[spin_5s_linear_infinite] group-hover:[animation-direction:reverse]"
            />
          </figure>
        </motion.div>
      ))}
    </div></>
  )
}