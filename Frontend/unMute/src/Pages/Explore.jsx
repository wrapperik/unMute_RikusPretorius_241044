import React, { useState } from 'react';
import PageHeader from '../Components/pageHeader'

export default function Explore() {
  // Array of posts
  const posts = [
    { id: 1, title: 'Understanding Anxiety', topic: 'Anxiety', time: '2h', description: 'Learn about the causes and ways to manage anxiety.' },
    { id: 2, title: 'Coping with Depression', topic: 'Depression', time: '3h', description: 'Explore strategies to cope with depression effectively.' },
    { id: 3, title: 'The Science of Happiness', topic: 'Happiness', time: '1h', description: 'Discover the science behind happiness and how to achieve it.' },
    { id: 4, title: 'Managing Stress', topic: 'Stress', time: '4h', description: 'Tips and techniques to manage stress in daily life.' },
    { id: 5, title: 'Overcoming Anxiety', topic: 'Anxiety', time: '2h', description: 'Practical steps to overcome anxiety and regain control.' },
     { id: 6, title: 'The Science of Happiness', topic: 'Happiness', time: '1h', description: 'Discover the science behind happiness and how to achieve it.' },
    { id: 7, title: 'Managing Stress', topic: 'Stress', time: '4h', description: 'Tips and techniques to manage stress in daily life.' },
    { id: 8, title: 'Overcoming Anxiety', topic: 'Anxiety', time: '2h', description: 'Practical steps to overcome anxiety and regain control.' },
  ];

  // State for selected topic filter
  const [selectedTopic, setSelectedTopic] = useState('All');

  // Get unique topics and their post counts
  const topics = posts.reduce((acc, post) => {
    acc[post.topic] = (acc[post.topic] || 0) + 1;
    return acc;
  }, {});

  // Filter posts based on selected topic
  const filteredPosts = selectedTopic === 'All' ? posts : posts.filter(post => post.topic === selectedTopic);

  return (
    <>
    <PageHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 flex flex-col lg:flex-row gap-12">
        {/* Filtering System */}
        <aside className="text-black w-full lg:w-1/3 lg:sticky top-28 self-start" aria-label="Filter posts by topic">
          <h1 className="text-xl font-bold">Browse by Topic</h1>
          <div className="text-black flex mt-5">
            <ul className="space-y-4 w-full" role="list">
              <li>
                <div
                  role="button"
                  tabIndex={0}
                  aria-pressed={selectedTopic === 'All'}
                  onClick={() => setSelectedTopic('All')}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTopic('All')}
                  className="flex w-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md"
                >
                  <h2 className="flex-start">All</h2>
                  <h2 className="ml-auto bg-[#E2EEDA] px-3 py-0.5 rounded-full">{posts.length}</h2>
                </div>
              </li>
              {Object.entries(topics).map(([topic, count]) => (
                <li key={topic}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={selectedTopic === topic}
                    onClick={() => setSelectedTopic(topic)}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTopic(topic)}
                    className="flex w-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 rounded-md"
                  >
                    <h2 className="flex-start">{topic}</h2>
                    <h2 className="ml-auto bg-[#E2EEDA] px-3 py-0.5 rounded-full">{count}</h2>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Cards Section */}
        <section className="flex flex-col gap-8 w-full lg:w-2/3 " aria-live="polite" aria-label="Posts list">
          {filteredPosts.map(post => (
            <div key={post.id} className="card bg-white card-md rounded-3xl text-black shadow-sm m-2 h-auto transform transition duration-100 ease-out hover:scale-[1.03] hover:shadow-md cursor-pointer">
              <div className="card-body">
                <div className="flex">
                  <h2 className="card-title flex-start">{post.title}</h2>
                  <div className="flex-end ml-auto flex items-center gap-2">
                    <p>{post.time}</p>
                    <h4 className="card-title text-sm px-2 rounded-full bg-[#DED5E6]">{post.topic}</h4>
                  </div>
                </div>
                <div className="h-0.5 w-full rounded bg-black/10"></div>
                <p>{post.description}</p>
              </div>
            </div>
          ))}
        </section>
      </main>
    </>
  );
}