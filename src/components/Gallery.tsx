// src/components/Gallery.tsx
'use client'; // This component now needs client-side interaction

import { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface GalleryProps {
  images?: string[];
  title: string;
}

export default function Gallery({ images, title }: GalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-[4/3] bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg shadow">
        No Image Available
      </div>
    );
  }

  const activeImage = images[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const openModal = (index: number) => {
    setCurrentIndex(index); // Set current image for modal view
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Main Image Display with Navigation */}
      <div className="relative w-full max-w-2xl mb-4">
        <div
          className="aspect-[4/3] overflow-hidden rounded-lg shadow-lg cursor-pointer group bg-gray-100"
          onClick={() => openModal(currentIndex)}
        >
          <img
            src={activeImage}
            alt={`${title} - Image ${currentIndex + 1}`}
            className="w-full h-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
          />
           <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
            <p className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-lg">View Larger</p>
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 focus:outline-none transition-colors"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50 focus:outline-none transition-colors"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-6 w-6" />
            </button>
          </>
        )}
         <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto py-2 w-full justify-center max-w-2xl">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2
                          ${index === currentIndex ? 'border-blue-500 ring-2 ring-blue-500' : 'border-transparent hover:border-gray-400'}
                          focus:outline-none focus:ring-2 focus:ring-blue-400`}
            >
              <img
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Full-screen Modal Dialog for Zoomed Image */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="relative w-full max-w-3xl max-h-[80vh] transform overflow-hidden rounded-2xl bg-white p-2 text-left align-middle shadow-xl transition-all">
                  <img
                    src={activeImage} // Show current selected image in modal
                    alt={`${title} - Image ${currentIndex + 1} (Full screen)`}
                    className="w-full h-full object-contain"
                  />
                  <button
                    onClick={closeModal}
                    className="absolute top-2 right-2 bg-white bg-opacity-70 text-gray-700 p-1.5 rounded-full hover:bg-opacity-100 focus:outline-none"
                    aria-label="Close image viewer"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  {/* Modal Navigation - Optional, could add if complex */}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
