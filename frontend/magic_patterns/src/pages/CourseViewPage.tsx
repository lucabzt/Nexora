import React from 'react';
import CourseOutline from '../components/CourseOutline';
import CourseChat from '../components/CourseChat';
const CourseContent = () => {
  return <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-2xl font-bold text-gray-900">
        Introduction to Set Theory
      </h2>
      <div className="prose max-w-none">
        <p className="mb-4 text-gray-600">
          Set theory is the foundation of mathematics. In this lesson, we'll
          explore the basic concepts and definitions that form the building
          blocks of set theory.
        </p>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Key Concepts
        </h3>
        <ul className="mb-6 list-disc space-y-2 pl-5 text-gray-600">
          <li>Definition of a set</li>
          <li>Set notation and representations</li>
          <li>Set operations (union, intersection, difference)</li>
          <li>Subset relationships</li>
        </ul>
        <div className="mb-6 rounded-lg bg-gray-50 p-4">
          <h4 className="mb-2 font-semibold text-gray-900">Example</h4>
          <p className="text-gray-600">
            Let A = {'{1, 2, 3}'} and B = {'{2, 3, 4}'}
            <br />
            Then:
            <br />A ∪ B = {'{1, 2, 3, 4}'} (union)
            <br />A ∩ B = {'{2, 3}'} (intersection)
          </p>
        </div>
        <h3 className="mb-2 text-xl font-semibold text-gray-900">
          Practice Problems
        </h3>
        <div className="space-y-4">
          <div className="rounded-lg border border-gray-200 p-4">
            <p className="mb-2 font-medium text-gray-900">Question 1:</p>
            <p className="text-gray-600">
              If A = {'{1, 2, 3, 4}'} and B = {'{3, 4, 5, 6}'}, find A ∩ B.
            </p>
          </div>
        </div>
      </div>
    </div>;
};
const CourseViewPage = () => {
  return <div className="mx-auto h-[calc(100vh-64px)] max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Your Personalized Learning Path
        </h1>
        <p className="text-gray-600">
          AI-generated course based on your inputs and learning goals
        </p>
      </div>
      <div className="grid h-[calc(100%-100px)] gap-6 lg:grid-cols-[250px,1fr,350px]">
        <CourseOutline />
        <CourseContent />
        <CourseChat />
      </div>
    </div>;
};
export default CourseViewPage;