import {
  AlertCircle,
  ArrowLeft,
  Camera,
  FileImage,
  ScanSearch,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card, { CardBody } from '../components/ui/Card';
import { ROUTES } from '../constants/routes';
import { cn } from '../utils/cn';

const ALLOWED_TYPES = ['image/jpeg', 'image/png'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getExtension(fileName) {
  const index = fileName.lastIndexOf('.');
  return index === -1 ? '' : fileName.slice(index).toLowerCase();
}

function validateImageFile(file) {
  const extension = getExtension(file.name);
  const hasAllowedType = ALLOWED_TYPES.includes(file.type);
  const hasAllowedExtension = ALLOWED_EXTENSIONS.includes(extension);

  if (!hasAllowedType && !hasAllowedExtension) {
    return 'This file type is not supported. Please upload a JPG, JPEG, or PNG image.';
  }

  if (file.size > MAX_FILE_BYTES) {
    return 'This image is too large. Please choose a file under 10 MB.';
  }

  return null;
}

export default function ScanProduct() {
  const navigate = useNavigate();
  const uploadInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function applyFile(nextFile) {
    const validationError = validateImageFile(nextFile);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setFile(nextFile);
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return URL.createObjectURL(nextFile);
    });
  }

  function handleInputChange(event) {
    const nextFile = event.target.files?.[0];
    event.target.value = '';
    if (nextFile) applyFile(nextFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    const nextFile = event.dataTransfer.files?.[0];
    if (nextFile) applyFile(nextFile);
  }

  function removeImage() {
    setFile(null);
    setError('');
    setPreviewUrl((currentUrl) => {
      if (currentUrl) URL.revokeObjectURL(currentUrl);
      return '';
    });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.18em] text-saffron uppercase">
            Label capture
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-navy">
            Scan a Packaged Product
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-navy/70 sm:text-base">
            Upload or capture a clear photo of the product label. LEGABLE will
            use this image to check mandatory declarations. OCR is not connected
            yet — this step only collects the label image.
          </p>
        </div>
        <Button as={Link} to={ROUTES.DASHBOARD} variant="outline" className="shrink-0">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Dashboard
        </Button>
      </div>

      {error ? (
        <div
          className="flex items-start gap-3 rounded-lg border border-noncompliant/30 bg-noncompliant/10 px-4 py-3 text-sm text-noncompliant"
          role="alert"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </div>
      ) : null}

      <Card>
        <CardBody className="p-4 sm:p-6">
          {!file ? (
            <div
              className={cn(
                'flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-10 text-center transition-colors sm:min-h-[340px]',
                isDragging
                  ? 'border-saffron bg-saffron/10'
                  : 'border-navy/20 bg-surface hover:border-navy/40',
              )}
              onClick={() => uploadInputRef.current?.click()}
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  uploadInputRef.current?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label="Upload a product label image"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/10 text-navy">
                <Upload className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-4 font-display text-xl font-semibold text-navy">
                Drag and drop a label image
              </p>
              <p className="mt-2 max-w-md text-sm text-navy/65">
                Drop a photo here, or use the buttons below to upload from your
                device or open the camera.
              </p>
              <p className="mt-4 text-xs font-medium tracking-wide text-navy/50 uppercase">
                Supported formats: JPG, JPEG, PNG · Max 10 MB
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    uploadInputRef.current?.click();
                  }}
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload Image
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={(event) => {
                    event.stopPropagation();
                    cameraInputRef.current?.click();
                  }}
                >
                  <Camera className="h-4 w-4" aria-hidden="true" />
                  Use Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
              <div className="overflow-hidden rounded-lg border border-navy/10 bg-surface">
                <img
                  src={previewUrl}
                  alt="Selected product label preview"
                  className="mx-auto max-h-[420px] w-full object-contain"
                />
              </div>

              <div className="space-y-4">
                <div className="rounded-md bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-navy/10 text-navy">
                      <FileImage className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-navy">{file.name}</p>
                      <p className="mt-1 text-sm text-navy/60">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full"
                  onClick={() => navigate(ROUTES.PROCESSING)}
                >
                  <ScanSearch className="h-4 w-4" aria-hidden="true" />
                  Analyze Product
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                  Remove Image
                </Button>
                <p className="text-xs leading-relaxed text-navy/55">
                  Analyze Product will open the processing screen. No OCR or
                  backend call is made in this version.
                </p>
              </div>
            </div>
          )}

          <input
            ref={uploadInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            className="sr-only"
            onChange={handleInputChange}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/jpeg,image/png,.jpg,.jpeg,.png"
            capture="environment"
            className="sr-only"
            onChange={handleInputChange}
          />
        </CardBody>
      </Card>
    </div>
  );
}
