import React from 'react'
import { motion } from 'framer-motion'

export default function Features() {
  const features = [
    { title: 'Anonymous discussion boards.', description: 'Description', image: '/cat-1.png' },
    { title: 'Mental health journaling and mood tracking.', description: 'Description', image: '/2.svg' },
    { title: 'Curated emotional wellness resources.', description: 'Description', image: '/3.svg' },
     { title: 'Creating a supportive community.', description: 'Description', image: '/4.svg' },
  ]

  return (
    <><div>
      <h1 className="text-black mt-10 font-medium text-3xl text-center">What we offer</h1>
      </div>
    <div className="p-6 mb-10 flex justify-center items-center flex-row flex-wrap gap-6">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          className="card w-96 border-2 border-black  card-xl rounded-3xl shadow-sm cursor-pointer transform transition duration-100 ease-out hover:scale-[1.03] hover:shadow-md hover:bg-black  group"
          initial={{ opacity: 0, x: 80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, delay: index * 0.15, type: 'spring' }}
        >
          {/* <figure className="px-6 pt-6 text-white">
            <img
              src={feature.image}
              alt={feature.title}
              className="rounded-xl h-32 object-cover w-full transition-transform duration-300 group-hover:scale-110"
            />
          </figure> */}
          <div className="card-body text-black hover:text-white">
            <h2 className="card-title text-2xl">{feature.title}</h2>
          </div>
        </motion.div>
      ))}
    </div></>
  )
}