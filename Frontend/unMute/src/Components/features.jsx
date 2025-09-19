import React from 'react'

export default function Features() {
  const features = [
    { title: 'Anonymous discussion boards.', description: 'Description', image: '/discussion.png' },
    { title: 'Mental health journaling and mood tracking.', description: 'Description', image: '/journal.png' },
    { title: 'Curated emotional wellness resources.', description: 'Description', image: '/resources.png' },
     { title: 'Creating a supportive community.', description: 'Description', image: '/community.png' },
  ]

  return (
    <><div>
      <h1 className="text-black mt-10 font-medium text-3xl text-center">What we offer</h1>
      </div>
    <div className="p-6 mb-10 flex justify-center items-center flex-row flex-wrap gap-6">
      {features.map((feature, index) => (
  <div className="card w-96 bg-white/80 card-xl h-80 rounded-2xl shadow-sm cursor-pointer transform transition duration-100 ease-out hover:scale-[1.03] hover:shadow-md" key={index}>
          <figure className="px-6 pt-6 text-black">
            <img src={feature.image} alt={feature.title} className="rounded-xl h-32 object-cover w-full bg-red-200" />
          </figure>
          <div className="card-body text-black">
            <h2 className="card-title">{feature.title}</h2>
          </div>
        </div>
      ))}
    </div></>
  )
}