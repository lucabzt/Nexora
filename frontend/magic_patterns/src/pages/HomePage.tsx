import React from 'react';
import { Link } from 'react-router-dom';
import { BrainIcon, BarChartIcon, UserIcon, CheckIcon, StarIcon, ArrowRightIcon } from 'lucide-react';
import FeatureCard from '../components/FeatureCard';
const HomePage = () => {
  return <div className="w-full">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mb-16 grid items-center gap-8 md:grid-cols-2">
          <div>
            <h1 className="mb-4 text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-5xl">
              Personalized Learning with{' '}
              <span className="text-teal-500">AI-Powered Courses</span>
            </h1>
            <p className="mb-8 text-lg text-gray-600">
              Nexora is a next-generation AI learning assistant that creates
              personalized courses tailored to your learning style, goals, and
              schedule.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/create" className="rounded-md bg-teal-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-600">
                Get Started
              </Link>
              <button className="rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                Log In
              </button>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-2 shadow-md">
            <img src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" alt="Next-gen learning, powered by AI" className="h-auto w-full rounded-md" />
            <p className="mt-2 text-center text-sm text-gray-500">
              Next-gen learning, powered by AI
            </p>
          </div>
        </div>
        {/* How it works section */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            How Nexora Transforms Your Learning
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={BrainIcon} title="Personalized Curriculum" description="AI-generated content tailored specifically to your goals and learning style." />
            <FeatureCard icon={BarChartIcon} title="Progress Tracking" description="Monitor your learning journey with detailed progress analytics and insights." />
            <FeatureCard icon={UserIcon} title="Adaptive Learning" description="Content difficulty adjusts based on your performance and comprehension." />
            <FeatureCard icon={CheckIcon} title="Interactive Quizzes" description="Test your knowledge with smart quizzes that reinforce your understanding." />
          </div>
        </div>
        {/* Detailed How It Works */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Your Learning Journey with Nexora
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="relative flex flex-col items-center p-6 text-center">
              <div className="absolute -left-16 top-1/2 hidden h-0.5 w-32 bg-gray-200 md:block"></div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <span className="text-xl font-bold">1</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Input Your Goals</h3>
              <p className="text-sm text-gray-600">
                Share what you want to learn and upload any relevant materials
                or documents
              </p>
            </div>
            <div className="relative flex flex-col items-center p-6 text-center">
              <div className="absolute -left-16 top-1/2 hidden h-0.5 w-32 bg-gray-200 md:block"></div>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <span className="text-xl font-bold">2</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">AI Course Creation</h3>
              <p className="text-sm text-gray-600">
                Our AI analyzes your input and creates a personalized curriculum
              </p>
            </div>
            <div className="relative flex flex-col items-center p-6 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-teal-600">
                <span className="text-xl font-bold">3</span>
              </div>
              <h3 className="mb-2 text-lg font-semibold">Start Learning</h3>
              <p className="text-sm text-gray-600">
                Begin your journey with interactive lessons and AI assistance
              </p>
            </div>
          </div>
        </div>
        {/* Testimonials */}
        <div className="mb-16 rounded-xl bg-gradient-to-br from-teal-50 to-white p-8">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            What Our Learners Say
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 flex text-yellow-400">
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
              </div>
              <p className="mb-4 text-gray-600">
                "Nexora helped me master complex topics at my own pace. The AI
                assistance is incredibly helpful!"
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Sarah M.</p>
                  <p className="text-sm text-gray-500">Data Science Student</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 flex text-yellow-400">
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
              </div>
              <p className="mb-4 text-gray-600">
                "The personalized curriculum made learning efficient and
                enjoyable. Best learning platform I've used!"
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Michael R.</p>
                  <p className="text-sm text-gray-500">Software Engineer</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg bg-white p-6 shadow-sm">
              <div className="mb-2 flex text-yellow-400">
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
                <StarIcon className="h-5 w-5 fill-current" />
              </div>
              <p className="mb-4 text-gray-600">
                "The AI-powered quizzes and assessments helped me track my
                progress effectively."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">Emily L.</p>
                  <p className="text-sm text-gray-500">Medical Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* CTA Section */}
        <div className="rounded-lg bg-teal-50 p-8 text-center">
          <h2 className="mb-4 text-2xl font-bold text-gray-900">
            Ready to transform how you learn?
          </h2>
          <p className="mb-6 text-gray-600">
            Create your personalized learning journey in minutes.
          </p>
          <Link to="/create" className="inline-block rounded-md bg-teal-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-600">
            Get Started for Free
          </Link>
        </div>
      </div>
      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Product
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Company
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Support
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Privacy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                Connect
              </h3>
              <ul className="mt-4 space-y-4">
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="text-base text-gray-500 hover:text-gray-900">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-200 pt-8">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 Nexora. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>;
};
export default HomePage;