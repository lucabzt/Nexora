import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon, ImageIcon, HardDriveIcon, ArrowRightIcon, TrashIcon, PlusIcon } from 'lucide-react';
const CourseCreationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create');
  const [inputValue, setInputValue] = useState('');
  const handleCreateCourse = () => {
    navigate('/course');
  };
  const mockCourses = [{
    id: 1,
    title: 'Applied Econometrics: A Practical Approach',
    description: 'This course provides a practical introduction to applied econometrics...',
    progress: 100,
    status: 'Finished'
  }, {
    id: 2,
    title: 'Machine Learning Fundamentals',
    description: 'An introduction to core machine learning concepts...',
    progress: 60,
    status: 'In Progress'
  }];
  return <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Navigation Tabs */}
      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button onClick={() => setActiveTab('dashboard')} className={`${activeTab === 'dashboard' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}>
            Dashboard
          </button>
          <button onClick={() => setActiveTab('create')} className={`${activeTab === 'create' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'} whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium`}>
            Create Course
          </button>
        </nav>
      </div>
      {activeTab === 'dashboard' ? <div>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              My Learning Dashboard
            </h1>
            <button onClick={() => setActiveTab('create')} className="flex items-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600">
              <PlusIcon className="mr-2 h-4 w-4" />
              Create New Course
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {mockCourses.map(course => <div key={course.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {course.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {course.description}
                    </p>
                  </div>
                  <button className="text-gray-400 hover:text-gray-500">
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium text-gray-900">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-teal-500" style={{
                width: `${course.progress}%`
              }}></div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${course.status === 'Finished' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {course.status}
                  </span>
                  <button onClick={() => navigate('/course')} className="text-sm font-medium text-teal-600 hover:text-teal-500">
                    Continue Learning
                  </button>
                </div>
              </div>)}
          </div>
        </div> : <div>
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl">
              Learn Anything,{' '}
              <span className="text-teal-500">Personalized for You</span>
            </h1>
            <p className="text-lg text-gray-600">
              Tell us what you want to learn, upload your materials, and our AI
              will create a custom learning path tailored just for you.
            </p>
          </div>
          <div className="mb-8 grid gap-8 md:grid-cols-[2fr,1fr]">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <textarea value={inputValue} onChange={e => setInputValue(e.target.value)} className="mb-6 min-h-[200px] w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700 placeholder-gray-500 focus:border-teal-500 focus:outline-none" placeholder="What do you want to learn today? (e.g., 'I want to learn Python' or 'Help me study for my Algorithms class')" />
              <div className="flex justify-end">
                <button onClick={handleCreateCourse} className="flex items-center rounded-md bg-teal-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-600">
                  Create My Course
                  <ArrowRightIcon className="ml-2 h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center">
                <FileTextIcon className="mx-auto mb-4 h-8 w-8 text-gray-400" />
                <p className="mb-2 text-sm font-medium text-gray-900">
                  Upload Documents
                </p>
                <p className="text-xs text-gray-500">PDF, DOC, TXT files</p>
                <label className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-teal-600 shadow-sm ring-1 ring-inset ring-teal-500 hover:bg-teal-50">
                  <input type="file" className="sr-only" />
                  Choose Files
                </label>
              </div>
              <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6 text-center">
                <ImageIcon className="mx-auto mb-4 h-8 w-8 text-gray-400" />
                <p className="mb-2 text-sm font-medium text-gray-900">
                  Upload Images
                </p>
                <p className="text-xs text-gray-500">PNG, JPG, JPEG files</p>
                <label className="mt-4 inline-flex cursor-pointer items-center rounded-md bg-white px-4 py-2 text-sm font-medium text-teal-600 shadow-sm ring-1 ring-inset ring-teal-500 hover:bg-teal-50">
                  <input type="file" className="sr-only" accept="image/*" />
                  Choose Images
                </label>
              </div>
              <button className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white p-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                <HardDriveIcon className="mr-2 h-4 w-4" />
                Connect Drive
              </button>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500">
            Our AI analyzes your input and materials to create a personalized
            learning experience
          </p>
        </div>}
    </div>;
};
export default CourseCreationPage;