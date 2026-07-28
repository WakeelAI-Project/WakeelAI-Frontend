import React, { useState, useRef } from "react";
import { UploadCloud, File, X } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTranslation } from "react-i18next";
import { useLocale } from "../../hooks/use-locale";

export function FileUpload({
  label,
  onFileDrop,
  maxSizeMB = 10,
  acceptedTypes = "*",
  className,
}) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const { t } = useTranslation();
  const { isRtl } = useLocale();

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
      if (onFileDrop) onFileDrop(droppedFiles);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
      if (onFileDrop) onFileDrop(selectedFiles);
    }
  };

  const removeFile = (idx) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div
      className={cn(
        "w-full flex flex-col gap-3 select-none text-start",
        className,
      )}>
      {label && (
        <span className="text-sm font-medium text-(--text-primary)">
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
          "h-48 border-2 border-dashed rounded-md flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors bg-paper border-(--text-muted) dark:bg-(--bg-card) dark:border-(--bg-card-raised)",
          isDragActive &&
            "bg-(--accent-surface) border-(--accent-primary) dark:bg-(--accent-primary-active)/20",
        )}>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={acceptedTypes}
          onChange={handleInputChange}
        />
        <UploadCloud className="h-10 w-10 text-(--text-muted) mb-3 shrink-0" />
        <span className="text-sm font-semibold text-(--text-primary)">
          {t("documents.dragDrop")}
        </span>
        <span className="text-xs text-(--text-muted) mt-1.5">
          {t("documents.maxSize", { size: maxSizeMB })}
        </span>
      </div>

      {/* Uploaded Files list */}
      {files.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 border border-(--border-default) rounded-sm bg-(--bg-card-raised) dark:bg-(--bg-card-raised) dark:border-(--bg-card-raised) shrink-0">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <File className="h-4 w-4 text-(--accent-primary) shrink-0" />
                <span className="text-xs text-(--text-primary) truncate">
                  {file.name}
                </span>
                <span className="text-[10px] text-(--text-muted) shrink-0">
                  ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(idx);
                }}
                className="p-1 hover:bg-(--bg-page-alt) rounded-full text-(--text-muted) hover:text-(--text-primary) dark:hover:bg-(--bg-card-raised) cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
