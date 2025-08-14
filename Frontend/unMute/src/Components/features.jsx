import React from 'react'

export default function Features() {
  const features = [
    { title: 'Anonymous discussion boards.', description: 'Description', image: '/path-to-your-image.svg' },
    { title: 'Mental health journaling and mood tracking.', description: 'Description', image: '/path-to-your-image.svg' },
    { title: 'Curated emotional wellness resources.', description: 'Description', image: '/path-to-your-image.svg' },
     { title: 'Creating a community where vulnerability is normalised.', description: 'Description', image: '/path-to-your-image.svg' },
  ]

  return (
    <div className="p-6 mb-20 flex justify-center items-center flex-row flex-wrap gap-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className="relative rounded-3xl max-w-xs p-6 text-white text-left 
                     bg-desert-clay bg-no-repeat bg-center bg-contain h-70 mt-20"
          style={{ backgroundImage: `url(${feature.image})` }}
        >
          <h2 className="text-2xl font-bold">{feature.title}</h2>
          <p className="text-md">{feature.description}</p>
        </div>
      ))}
    </div>
  )
}