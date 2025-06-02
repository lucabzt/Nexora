// frontend/magic_patterns/src/utils/toast.js
let toastContainer = null;

// Create toast container if it doesn't exist
const createToastContainer = () => {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
};

export const showToast = (message, type = 'info', duration = 4000) => {
  const container = createToastContainer();

  const toast = document.createElement('div');
  toast.className = `
    max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg p-4 
    transform transition-all duration-300 ease-in-out translate-x-full opacity-0
    ${type === 'success' ? 'border-l-4 border-l-green-500' : ''}
    ${type === 'error' ? 'border-l-4 border-l-red-500' : ''}
    ${type === 'warning' ? 'border-l-4 border-l-yellow-500' : ''}
    ${type === 'info' ? 'border-l-4 border-l-blue-500' : ''}
  `;

  const iconMap = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };

  const colorMap = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600'
  };

  toast.innerHTML = `
    <div class="flex items-start">
      <div class="flex-shrink-0">
        <span class="text-lg ${colorMap[type]}">${iconMap[type]}</span>
      </div>
      <div class="ml-3 flex-1">
        <p class="text-sm font-medium text-gray-900">${message}</p>
      </div>
      <div class="ml-4 flex-shrink-0">
        <button class="text-gray-400 hover:text-gray-600 focus:outline-none" onclick="this.closest('.transform').remove()">
          <span class="sr-only">Close</span>
          <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-x-full', 'opacity-0');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.add('translate-x-full', 'opacity-0');
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
};

// Toast Component for React
export const ToastContainer = () => {
  return null; // We use DOM manipulation for simplicity
};