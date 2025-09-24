'use client'

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Camera } from 'lucide-react'
import Image from 'next/image'

interface PhotoUploadProps {
  onPhotosSelected: (files: File[]) => void
  maxFiles?: number
}

export default function PhotoUpload({ onPhotosSelected, maxFiles = 5 }: PhotoUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = [...files, ...acceptedFiles].slice(0, maxFiles)
    setFiles(newFiles)

    // Create previews
    const newPreviews = newFiles.map(file => URL.createObjectURL(file))
    setPreviews(newPreviews)

    onPhotosSelected(newFiles)
  }, [files, maxFiles, onPhotosSelected])

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index)
    const newPreviews = previews.filter((_, i) => i !== index)

    // Clean up old preview URL
    URL.revokeObjectURL(previews[index])

    setFiles(newFiles)
    setPreviews(newPreviews)
    onPhotosSelected(newFiles)
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: maxFiles - files.length,
    disabled: files.length >= maxFiles
  })

  // Check if mobile device
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  return (
    <div className="space-y-4">
      {files.length < maxFiles && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all
            ${isDragActive ? 'border-green-500 bg-green-50 scale-[0.98]' : 'border-gray-300 hover:border-gray-400'}
            ${files.length >= maxFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />

          {isMobile ? (
            <>
              <Camera className="mx-auto h-12 w-12 text-gray-400 mb-3" />
              <p className="text-base font-medium">Tap to Take or Select Photos</p>
              <p className="text-sm text-gray-500 mt-1">
                Up to {maxFiles - files.length} photo{maxFiles - files.length !== 1 ? 's' : ''}
              </p>
            </>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-lg">Drop the photos here...</p>
              ) : (
                <>
                  <p className="text-lg font-medium">Drag & drop photos here</p>
                  <p className="text-sm text-gray-500 mt-2">or click to select files</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {maxFiles - files.length} photo{maxFiles - files.length !== 1 ? 's' : ''} remaining
                  </p>
                </>
              )}
            </>
          )}
        </div>
      )}

      {previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  width={200}
                  height={200}
                  className="object-cover w-full h-full"
                />
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
                aria-label="Remove photo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}