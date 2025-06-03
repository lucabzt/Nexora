// frontend/magic_patterns/src/pages/ImpressumPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ArrowLeftIcon } from 'lucide-react';

const ImpressumPage = () => {
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

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="mb-8 text-3xl font-bold text-gray-900">Impressum</h1>
          
          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Information according to § 5 TMG</h2>
              <div className="text-gray-600 space-y-2">
                <p><strong>Company:</strong> Nexora GmbH</p>
                <p><strong>Address:</strong> Musterstraße 123<br />12345 Berlin<br />Germany</p>
                <p><strong>Phone:</strong> +49 (0) 30 12345678</p>
                <p><strong>Email:</strong> info@nexora.com</p>
                <p><strong>Website:</strong> www.nexora.com</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Legal Representative</h2>
              <div className="text-gray-600">
                <p><strong>Managing Director:</strong> Max Mustermann</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Commercial Register</h2>
              <div className="text-gray-600 space-y-2">
                <p><strong>Registration Court:</strong> Amtsgericht Berlin-Charlottenburg</p>
                <p><strong>Registration Number:</strong> HRB 123456 B</p>
                <p><strong>VAT ID:</strong> DE123456789</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Responsible for Content</h2>
              <div className="text-gray-600">
                <p>Max Mustermann<br />
                Musterstraße 123<br />
                12345 Berlin<br />
                Germany</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Disclaimer</h2>
              <div className="text-gray-600 space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Liability for Content</h3>
                  <p>As service providers, we are liable for own contents of these websites according to Sec. 7, Para. 1 German Telemedia Act (TMG). However, according to Sec. 8 to 10 German Telemedia Act (TMG), service providers are not under obligation to permanently monitor submitted or stored information or to search for evidences that indicate illegal activities.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Liability for Links</h3>
                  <p>Our offer includes links to external third party websites. We have no influence on the contents of those websites, therefore we cannot guarantee for those contents. Providers or administrators of linked websites are always responsible for their own contents.</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Copyright</h3>
                  <p>Contents and compilations published on these websites by the providers are subject to German copyright laws. Reproduction, editing, distribution as well as the use of any kind outside the scope of the copyright law require a written permission of the author or originator.</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Data Protection</h2>
              <div className="text-gray-600">
                <p>A visit to our website can result in the storage on our server of information about the access (date, time, page accessed). This does not represent any analysis of personal data (e.g., name, address or e-mail address). If personal data are collected, this only occurs – to the extent possible – with the prior consent of the user of the website.</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpressumPage;
