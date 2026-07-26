import React, { useState, useRef } from "react"
import { UploadCloud, File, X, Sparkles } from "lucide-react"
import { Progress } from "../ui/progress"
import { cn } from "../../lib/utils"

export function FileUpload({
  label,
  onFileDrop,
  maxSizeMB = 10,
  acceptedTypes = "*",
  isRtl = true,
  className
}) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [files, setFiles] = useState([])
  const fileInputRef = useRef(null)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files)
      setFiles((prev) => [...prev, ...droppedFiles])
      if (onFileDrop) onFileDrop(droppedFiles)
    }
  }

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files)
      setFiles((prev) => [...prev, ...selectedFiles])
      if (onFileDrop) onFileDrop(selectedFiles)
    }
  }

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className={cn("w-full flex flex-col gap-3 select-none text-start", className)}>
      {label && (
        <span className="text-sm font-medium text-[var(--text-primary)]">
          {label}
        </span>
      )}

      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "h-48 border-2 border-dashed rounded-[var(--radius-md)] flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors bg-[var(--stone-0)] border-[var(--stone-300)] dark:bg-[var(--stone-900)] dark:border-[var(--stone-800)]",
          isDragActive && "bg-[var(--ochre-50)] border-[var(--ochre-500)] dark:bg-[var(--ochre-900)/20]"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={acceptedTypes}
          onChange={handleInputChange}
        />
        <UploadCloud className="h-10 w-10 text-[var(--stone-400)] mb-3 shrink-0" />
        <span className="text-sm font-semibold text-[var(--text-primary)]">
          {isRtl ? "اسحب الملفات وأفلتها هنا أو اضغط للاختيار" : "Drag and drop files here or click to browse"}
        </span>
        <span className="text-xs text-[var(--stone-500)] mt-1.5">
          {isRtl ? `حجم الملف الأقصى: ${maxSizeMB} ميجابايت` : `Maximum file size: ${maxSizeMB} MB`}
        </span>
      </div>

      {/* Uploaded Files list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 border border-[var(--border-default)] rounded-[var(--radius-sm)] bg-[var(--stone-50)] dark:bg-[var(--stone-850)] dark:border-[var(--stone-800)] shrink-0"
            >
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <File className="h-4 w-4 text-[var(--ochre-600)] shrink-0" />
                <span className="text-xs text-[var(--text-primary)] truncate">
                  {file.name}
                </span>
                <span className="text-[10px] text-[var(--stone-500)] shrink-0">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeFile(idx)
                }}
                className="p-1 hover:bg-[var(--stone-100)] rounded-full text-[var(--stone-500)] hover:text-[var(--text-primary)] dark:hover:bg-[var(--stone-800)] cursor-pointer"
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
