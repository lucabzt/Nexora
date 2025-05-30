import React from 'react';
import { BookOpenIcon, CheckCircleIcon, CircleIcon, FileTextIcon } from 'lucide-react';
const chapters = [{
  id: 1,
  title: 'Introduction to the Subject',
  completed: true,
  lessons: [{
    id: 1,
    title: 'Overview and Basics',
    completed: true
  }, {
    id: 2,
    title: 'Key Concepts',
    completed: true
  }, {
    id: 3,
    title: 'Historical Context',
    completed: false
  }]
}, {
  id: 2,
  title: 'Core Principles',
  completed: false,
  lessons: [{
    id: 4,
    title: 'Fundamental Theories',
    completed: false
  }, {
    id: 5,
    title: 'Practical Applications',
    completed: false
  }, {
    id: 6,
    title: 'Case Studies',
    completed: false
  }]
}, {
  id: 3,
  title: 'Advanced Topics',
  completed: false,
  lessons: [{
    id: 7,
    title: 'Cutting-edge Research',
    completed: false
  }, {
    id: 8,
    title: 'Future Developments',
    completed: false
  }]
}];
const quizzes = [{
  id: 1,
  title: 'Chapter 1 Quiz',
  completed: false
}, {
  id: 2,
  title: 'Midterm Assessment',
  completed: false
}, {
  id: 3,
  title: 'Final Examination',
  completed: false
}];
const CourseOutline = () => {
  return <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">Course Outline</h2>
      </div>
      <div className="p-4">
        <div className="mb-6">
          <h3 className="mb-3 flex items-center text-sm font-medium uppercase text-gray-500">
            <BookOpenIcon className="mr-2 h-4 w-4" />
            Chapters
          </h3>
          <div className="space-y-4">
            {chapters.map(chapter => <div key={chapter.id} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">
                    {chapter.completed ? <CheckCircleIcon className="mr-2 h-4 w-4 text-teal-500" /> : <CircleIcon className="mr-2 h-4 w-4 text-gray-400" />}
                    <span className="font-medium">{chapter.title}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {chapter.lessons.filter(l => l.completed).length}/
                    {chapter.lessons.length}
                  </span>
                </div>
                <div className="ml-6 space-y-1">
                  {chapter.lessons.map(lesson => <div key={lesson.id} className="flex items-center text-sm">
                      {lesson.completed ? <CheckCircleIcon className="mr-2 h-3 w-3 text-teal-500" /> : <CircleIcon className="mr-2 h-3 w-3 text-gray-400" />}
                      <span className={lesson.completed ? 'text-gray-500' : 'text-gray-700'}>
                        {lesson.title}
                      </span>
                    </div>)}
                </div>
              </div>)}
          </div>
        </div>
        <div>
          <h3 className="mb-3 flex items-center text-sm font-medium uppercase text-gray-500">
            <FileTextIcon className="mr-2 h-4 w-4" />
            Quizzes & Assessments
          </h3>
          <div className="space-y-2">
            {quizzes.map(quiz => <div key={quiz.id} className="flex items-center rounded-md border border-gray-200 bg-gray-50 p-2">
                {quiz.completed ? <CheckCircleIcon className="mr-2 h-4 w-4 text-teal-500" /> : <CircleIcon className="mr-2 h-4 w-4 text-gray-400" />}
                <span className="text-sm">{quiz.title}</span>
              </div>)}
          </div>
        </div>
      </div>
    </div>;
};
export default CourseOutline;