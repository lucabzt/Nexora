// frontend/magic_patterns/src/components/CourseOutline.jsx
import React from 'react';
import { BookOpenIcon, CheckCircleIcon, CircleIcon, ClockIcon, PlayIcon } from 'lucide-react';

const CourseOutline = ({
  course,
  selectedChapter,
  onChapterSelect,
  onChapterComplete,
  onChapterIncomplete,
  streamingComplete
}) => {
  const totalChapters = course.chapters.length;
  const completedChapters = course.chapters.filter(ch => ch.is_completed).length;
  const totalQuestions = course.chapters.reduce((sum, ch) => sum + (ch.mc_questions?.length || 0), 0);

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-xl font-semibold text-gray-800">Course Outline</h2>
        <div className="mt-2 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>{completedChapters}/{totalChapters} chapters completed</span>
            {course.total_time_hours && (
              <div className="flex items-center">
                <ClockIcon className="mr-1 h-4 w-4" />
                {course.total_time_hours}h
              </div>
            )}
          </div>
          {totalQuestions > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              {totalQuestions} practice questions
            </div>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-300"
              style={{ width: `${totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-3">
          <h3 className="flex items-center text-sm font-medium uppercase text-gray-500">
            <BookOpenIcon className="mr-2 h-4 w-4" />
            Chapters
          </h3>

          {course.chapters.length === 0 && !streamingComplete && (
            <div className="text-center py-8">
              <div className="animate-spin mx-auto h-8 w-8 border-2 border-teal-500 border-t-transparent rounded-full mb-3"></div>
              <p className="text-sm text-gray-500">Generating your first chapter...</p>
            </div>
          )}

          {course.chapters.map((chapter, index) => (
            <div
              key={chapter.id}
              className={`rounded-md border p-3 cursor-pointer transition-all ${
                selectedChapter?.id === chapter.id
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => onChapterSelect(chapter)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  <div className="mr-2 mt-1">
                    {chapter.is_completed ? (
                      <CheckCircleIcon className="h-4 w-4 text-teal-500" />
                    ) : (
                      <CircleIcon className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{chapter.caption}</h4>
                    <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
                      <span>{chapter.time_minutes} minutes</span>
                      {chapter.mc_questions && (
                        <span>{chapter.mc_questions.length} questions</span>
                      )}
                    </div>
                  </div>
                </div>
                {selectedChapter?.id === chapter.id && (
                  <PlayIcon className="h-4 w-4 text-teal-500 ml-2" />
                )}
              </div>

              {/* Chapter completion toggle */}
              {selectedChapter?.id === chapter.id && (
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (chapter.is_completed) {
                        onChapterIncomplete(chapter.id);
                      } else {
                        onChapterComplete(chapter.id);
                      }
                    }}
                    className={`text-xs px-2 py-1 rounded ${
                      chapter.is_completed
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                    }`}
                  >
                    {chapter.is_completed ? 'Mark Incomplete' : 'Mark Complete'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator for additional chapters */}
          {!streamingComplete && course.chapters.length > 0 && (
            <div className="rounded-md border border-dashed border-gray-300 p-3 text-center">
              <div className="flex items-center justify-center text-sm text-gray-500">
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full"></div>
                Creating next chapter...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseOutline;