// frontend/magic_patterns/src/pages/DashboardPage.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, TrashIcon, BookOpenIcon, ClockIcon } from 'lucide-react';
import { coursesAPI } from '../services/api';
import { showToast } from '../utils/toast';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getCourses();
      setCourses(response.data);
    } catch (error) {
      showToast('Failed to fetch courses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseName) => {
    if (window.confirm(`Are you sure you want to delete "${courseName}"?`)) {
      try {
        await coursesAPI.deleteCourse(courseId);
        setCourses(courses.filter(course => course.course_id !== courseId));
        showToast('Course deleted successfully', 'success');
      } catch (error) {
        showToast('Failed to delete course', 'error');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'finished':
        return 'bg-green-100 text-green-800';
      case 'creating':
        return 'bg-yellow-100 text-yellow-800';
      case 'updating':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'finished':
        return 'Completed';
      case 'creating':
        return 'Creating';
      case 'updating':
        return 'Updating';
      default:
        return status;
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600">Manage and continue your personalized learning journeys</p>
        </div>
        <Link
          to="/create"
          className="flex items-center rounded-md bg-teal-500 px-4 py-2 text-sm font-medium text-white hover:bg-teal-600"
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Create New Course
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No courses yet</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first personalized course.
          </p>
          <div className="mt-6">
            <Link
              to="/create"
              className="inline-flex items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500"
            >
              <PlusIcon className="mr-1 h-4 w-4" />
              Create Course
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.course_id}
              className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteCourse(course.course_id, course.title)}
                  className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                  title="Delete course"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(course.status)}`}>
                  {getStatusText(course.status)}
                </span>
                {course.total_time_hours && (
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="mr-1 h-4 w-4" />
                    {course.total_time_hours}h
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate(`/course/${course.course_id}`)}
                  className="text-sm font-medium text-teal-600 hover:text-teal-500"
                  disabled={course.status === 'creating'}
                >
                  {course.status === 'creating' ? 'Creating...' : 'Continue Learning'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;