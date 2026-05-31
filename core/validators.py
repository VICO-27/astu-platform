"""
ASTU Platform — File Validation Utilities
Magic-byte validation + file type helpers (SRS §11).
Graceful degradation is used when python-magic/libmagic is unavailable.
"""

import logging
from rest_framework.exceptions import ValidationError

logger = logging.getLogger(__name__)

MAX_FILE_SIZE_MB = 50
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

ALLOWED_MIME_TYPES = {
    'application/pdf':                                                              'pdf',
    'application/vnd.ms-powerpoint':                                                 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation':   'pptx',
    'video/mp4':                                                                    'mp4',
    'text/plain':                                                                   'txt',
    'text/markdown':                                                                'markdown',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document':     'docx',
}

ALLOWED_EXTENSIONS = {
    'pdf': 'pdf',
    'ppt': 'ppt',
    'pptx': 'pptx',
    'mp4': 'mp4',
    'txt': 'txt',
    'md': 'markdown',
    'docx': 'docx',
}

try:
    import magic
    _MAGIC_AVAILABLE = True
except ImportError:
    _MAGIC_AVAILABLE = False
    logger.warning(
        "python-magic / libmagic not available. "
        "File validation will fall back to extension-only checking. "
        "Install libmagic1 and python-magic for full validation."
    )


def _detect_mime(file) -> str | None:
    if not _MAGIC_AVAILABLE:
        return None
    try:
        mime = magic.from_buffer(file.read(2048), mime=True)
        file.seek(0)
        return mime
    except Exception as exc:
        logger.warning("Magic MIME detection failed: %s", exc)
        file.seek(0)
        return None


def _extension_type(file) -> str | None:
    name = getattr(file, 'name', '')
    ext = name.rsplit('.', 1)[-1].lower() if '.' in name else ''
    return ALLOWED_EXTENSIONS.get(ext)


def validate_uploaded_file(file):
    """
    Validates:
      1. File size ≤ 50 MB.
      2. MIME type via python-magic (preferred).
         Falls back to extension-only checking if libmagic is unavailable.
    Returns the normalised file_type string on success.
    Raises ValidationError on failure.
    """
    if file.size > MAX_FILE_SIZE_BYTES:
        raise ValidationError(
            f"File too large. Maximum allowed size is {MAX_FILE_SIZE_MB} MB."
        )

    mime = _detect_mime(file)
    if mime is not None:
        if mime not in ALLOWED_MIME_TYPES:
            raise ValidationError(
                f"File type '{mime}' is not allowed. "
                "Accepted types: PDF, PPT/PPTX, MP4, Markdown, DOCX."
            )
        return ALLOWED_MIME_TYPES[mime]

    ext_type = _extension_type(file)
    if not ext_type:
        raise ValidationError(
            "Could not determine file type. "
            "Ensure the file has a valid extension: pdf, ppt, pptx, mp4, txt, md, docx."
        )

    logger.warning(
        "File '%s' validated by extension only because libmagic is unavailable.",
        getattr(file, 'name', 'unknown'),
    )
    return ext_type
