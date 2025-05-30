// frontend/magic_patterns/src/pages/CourseCreationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileTextIcon, ImageIcon, ArrowRightIcon, XIcon, UploadIcon } from 'lucide-react';
import { filesAPI, coursesAPI } from '../services/api';
import { showToast } from '../utils/toast';

const CourseCreationPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    query: '',
    time_hours: 2,
    document_ids: [],
    picture_ids: []
  });
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleFileUpload = async (files, type) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedFiles = [];

    try {
      for (const file of files) {
        let response;
        if (type === 'document') {
          response = await filesAPI.uploadDocument(file);
        } else {
          response = await filesAPI.uploadImage(file);
        }
        uploadedFiles.push({
          id: response.data.id,
          filename: response.data.filename,
          file: file
        });
      }

      if (type === 'document') {
        setUploadedDocuments(prev => [...prev, ...uploadedFiles]);
        setFormData(prev => ({
          ...prev,
          document_ids: [...prev.document_ids, ...uploadedFiles.map(f => f.id)]
        }));
      } else {
        setUploadedImages(prev => [...prev, ...uploadedFiles]);
        setFormData(prev => ({
          ...prev,
          picture_ids: [...prev.picture_ids, ...uploadedFiles.map(f => f.id)]
        }));
      }

      showToast(`${uploadedFiles.length} ${type}(s) uploaded successfully`, 'success');
    } catch (error) {
      showToast(`Failed to upload ${type}s`, 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeUploadedFile = (id, type) => {
    if (type === 'document') {
      setUploadedDocuments(prev => prev.filter(doc => doc.id !== id));
      setFormData(prev => ({
        ...prev,
        document_ids: prev.document_ids.filter(docId => docId !== id)
      }));
    } else {
      setUploadedImages(prev => prev.filter(img => img.id !== id));
      setFormData(prev => ({
        ...prev,
        picture_ids: prev.picture_ids.filter(imgId => imgId !== id)
      }));
    }
  };

  const handleCreateCourse = async () => {
    if (!formData.query.trim()) {
      showToast('Please describe what you want to learn', 'error');
      return;
    }

    setCreating(true);
    try {
      const response = await coursesAPI.createCourse(formData);

      if (!response.ok) {
        throw new Error('Failed to create course');
      }

      // Handle streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let courseId = null;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          try {
            const data = JSON.parse(line);

            if (data.type === 'course_info') {
              courseId = data.data.course_id;
              showToast('Course created! Redirecting...', 'success');
              // Navigate to course page immediately
              navigate(`/course/${courseId}`, {
                state: { streaming: true, initialData: data.data }
              });
              return; // Exit the function as we're navigating
            } else if (data.type === 'error') {
              throw new Error(data.data.message);
            }
          } catch (parseError) {
            console.error('Error parsing streaming data:', parseError);
          }
        }
      }
    } catch (error) {
      showToast(error.message || 'Failed to create course', 'error');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
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

      <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
        {/* Main Form */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What would you like to learn?
            </label>
            <textarea
              value={formData.query}
              onChange={(e) => setFormData({ ...formData, query: e.target.value })}
              className="min-h-[200px] w-full rounded-lg border border-gray-200 bg-gray-50 p-4 text-gray-700 placeholder-gray-500 focus:border-teal-500 focus:outline-none"
              placeholder="Describe what you want to learn... (e.g., 'I want to learn Python programming from basics to advanced' or 'Help me study quantum physics for my exam')"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Study Time (hours)
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={formData.time_hours}
              onChange={(e) => setFormData({ ...formData, time_hours: parseInt(e.target.value) || 2 })}
              className="w-32 rounded-lg border border-gray-200 px-3 py-2 focus:border-teal-500 focus:outline-none"
            />
            <p className="mt-1 text-sm text-gray-500">
              How many hours do you want to dedicate to this course?
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleCreateCourse}
              disabled={creating || !formData.query.trim()}
              className="flex items-center rounded-md bg-teal-500 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {creating ? 'Creating Your Course...' : 'Create My Course'}
              {!creating && <ArrowRightIcon className="ml-2 h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* File Upload Section */}
        <div className="space-y-4">
          {/* Document Upload */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6">
            <FileTextIcon className="mx-auto mb-4 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-900 text-center">
              Upload Documents
            </p>
            <p className="text-xs text-gray-500 text-center mb-4">
              PDF, DOC, TXT, JSON, CSV files
            </p>
            <label className="flex cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-teal-600 shadow-sm ring-1 ring-inset ring-teal-500 hover:bg-teal-50">
              <input
                type="file"
                className="sr-only"
                multiple
                accept=".pdf,.doc,.docx,.txt,.json,.csv"
                onChange={(e) => handleFileUpload(Array.from(e.target.files), 'document')}
                disabled={uploading}
              />
              <UploadIcon className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Choose Files'}
            </label>

            {/* Uploaded Documents */}
            {uploadedDocuments.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedDocuments.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700 truncate">{doc.filename}</span>
                    <button
                      onClick={() => removeUploadedFile(doc.id, 'document')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-white p-6">
            <ImageIcon className="mx-auto mb-4 h-8 w-8 text-gray-400" />
            <p className="mb-2 text-sm font-medium text-gray-900 text-center">
              Upload Images
            </p>
            <p className="text-xs text-gray-500 text-center mb-4">
              PNG, JPG, JPEG, GIF, WebP files
            </p>
            <label className="flex cursor-pointer items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-medium text-teal-600 shadow-sm ring-1 ring-inset ring-teal-500 hover:bg-teal-50">
              <input
                type="file"
                className="sr-only"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(Array.from(e.target.files), 'image')}
                disabled={uploading}
              />
              <UploadIcon className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Choose Images'}
            </label>

            {/* Uploaded Images */}
            {uploadedImages.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadedImages.map((img) => (
                  <div key={img.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm text-gray-700 truncate">{img.filename}</span>
                    <button
                      onClick={() => removeUploadedFile(img.id, 'image')}
                      className="text-red-500 hover:text-red-700"
                    >
                      <XIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-gray-500">
        Our AI analyzes your input and materials to create a personalized
        learning experience with interactive content and quizzes.
      </p>
    </div>
  );
};

export default CourseCreationPage;