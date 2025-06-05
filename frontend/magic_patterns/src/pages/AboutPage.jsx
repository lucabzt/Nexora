// frontend/magic_patterns/src/pages/AboutPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ArrowLeftIcon, BrainIcon, UserIcon, HeartIcon, RocketIcon, TargetIcon, GlobeIcon } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="w-full">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <BookOpenIcon className="mr-2 h-8 w-8 text-teal-500" />
              <span className="text-xl font-bold text-gray-800">Nexora</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900">
              <ArrowLeftIcon className="mr-1 h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Nexora</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're revolutionizing education through the power of artificial intelligence, 
            making personalized learning accessible to everyone, everywhere.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-lg text-gray-600 mb-6">
                At Nexora, we believe that learning should be as unique as every individual. 
                Our mission is to democratize education by providing AI-powered, personalized 
                learning experiences that adapt to each learner's pace, style, and goals.
              </p>
              <p className="text-lg text-gray-600">
                We're breaking down barriers to quality education and making it possible 
                for anyone to master new skills, pursue their passions, and achieve their dreams.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gradient-to-br from-teal-50 to-blue-50 p-8">
              <BrainIcon className="h-16 w-16 text-teal-500 mx-auto mb-4" />
              <p className="text-center text-gray-700 font-medium">
                "Education is the most powerful weapon which you can use to change the world."
              </p>
              <p className="text-center text-gray-500 text-sm mt-2">- Nelson Mandela</p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Core Values</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <UserIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personalization</h3>
              <p className="text-gray-600">
                Every learner is unique. We create tailored experiences that match 
                individual learning styles, goals, and preferences.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <HeartIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accessibility</h3>
              <p className="text-gray-600">
                Quality education should be available to everyone. We're committed 
                to making learning accessible regardless of background or location.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <RocketIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Innovation</h3>
              <p className="text-gray-600">
                We continuously push the boundaries of what's possible in education 
                through cutting-edge AI and technology.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <TargetIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Results-Driven</h3>
              <p className="text-gray-600">
                We focus on measurable learning outcomes and real-world skill 
                development that makes a difference in our learners' lives.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <GlobeIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Global Impact</h3>
              <p className="text-gray-600">
                We're building a worldwide community of learners, breaking down 
                geographical barriers to knowledge sharing.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <BrainIcon className="h-12 w-12 text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Continuous Learning</h3>
              <p className="text-gray-600">
                We believe in lifelong learning and adapt our platform to support 
                learners throughout their entire educational journey.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              Nexora was born from a simple observation: traditional education systems 
              weren't keeping up with the pace of change in our world. Learners were 
              struggling with one-size-fits-all approaches that didn't account for their 
              individual needs, learning styles, or career aspirations.
            </p>
            <p className="mb-4">
              Our founders, passionate educators and technologists, saw an opportunity 
              to leverage artificial intelligence to create something better. They 
              envisioned a platform that could understand each learner as an individual 
              and adapt content, pacing, and teaching methods accordingly.
            </p>
            <p className="mb-4">
              After years of research and development, collaborating with leading 
              educational institutions and AI researchers, Nexora emerged as a 
              revolutionary platform that transforms how people learn and grow.
            </p>
            <p>
              Today, we're proud to serve learners worldwide, helping them unlock 
              their potential and achieve their goals through personalized, AI-powered 
              education that evolves with them every step of the way.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Leadership Team</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-teal-400 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">MM</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Max Mustermann</h3>
              <p className="text-teal-600 font-medium mb-2">CEO & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                Former education technology leader with 15+ years experience in 
                building scalable learning platforms.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">AS</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Anna Schmidt</h3>
              <p className="text-teal-600 font-medium mb-2">CTO & Co-Founder</p>
              <p className="text-gray-600 text-sm">
                AI research scientist and machine learning expert with a passion 
                for applying cutting-edge technology to education.
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">DJ</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Dr. John Johnson</h3>
              <p className="text-teal-600 font-medium mb-2">Chief Learning Officer</p>
              <p className="text-gray-600 text-sm">
                Educational psychologist and curriculum design expert focused on 
                creating effective learning experiences.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-lg shadow-lg p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
          <p className="text-xl mb-6 opacity-90">
            Join thousands of learners who are already experiencing the future of education.
          </p>
          <Link 
            to="/login" 
            className="inline-block bg-white text-teal-600 px-8 py-3 rounded-md font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Your Journey Today
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
