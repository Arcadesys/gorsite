# Bulk Artwork Upload Feature

## Overview

The modernized gallery upload system now supports bulk uploading of multiple artworks with an intuitive drag-and-drop interface and inline metadata editing.

## Features

### Dual Upload Modes

1. **Single Upload Mode**
   - Traditional one-by-one upload process
   - Detailed form for comprehensive metadata entry
   - Artist attribution tools
   - Perfect for individual pieces requiring detailed descriptions

2. **Bulk Upload Mode** ⭐ *New*
   - Multiple file drag-and-drop support
   - Queue-based upload management
   - Table-style inline metadata editing
   - Batch processing with progress tracking
   - Perfect for uploading collections or multiple pieces at once

### Bulk Upload Capabilities

#### File Handling
- **Multi-file selection**: Choose multiple files at once via file picker
- **Drag & drop**: Drop multiple image files directly onto the upload zone
- **File validation**: Automatic validation for file type and size (max 20MB per file)
- **Preview generation**: Instant thumbnails for all queued files

#### Queue Management
- **Upload queue**: Visual table showing all files waiting to be processed
- **Status tracking**: Real-time status for each item (pending, uploading, success, error)
- **Progress indicators**: Individual progress bars during upload
- **Batch operations**: Clear completed uploads or errors in bulk

#### Inline Metadata Editing
- **Table-based editing**: Edit metadata for multiple artworks side-by-side
- **Key fields available**:
  - Title (auto-filled from filename)
  - Description
  - Tags (comma-separated)
  - Artist attribution (inherited from user portfolio by default)
- **Bulk defaults**: Common metadata is pre-filled based on user profile
- **Editable during queue**: Modify metadata while other items are uploading

#### Upload Processing
- **Sequential uploads**: Items are uploaded one at a time to avoid server overload
- **Error handling**: Failed uploads are clearly marked with error messages
- **Partial success**: Successfully uploaded items are preserved even if others fail
- **Auto-redirect**: Automatic navigation to gallery after successful bulk upload

## How to Access

### From Gallery Dashboard
1. Navigate to **Dashboard > Galleries**
2. Click **"Bulk Upload"** button (purple button in header)
3. Select target gallery and start uploading

### From Individual Gallery
1. Open any gallery from **Dashboard > Galleries**
2. Click **"Bulk Upload"** button
3. Gallery is pre-selected for convenience

### From Upload Page
1. Navigate to **Dashboard > Upload**
2. Choose **"Bulk Upload"** from the mode selection screen
3. Or add `?mode=bulk` to URL for direct access

## Workflow

### Typical Bulk Upload Process

1. **Select Mode**: Choose "Bulk Upload" from upload options
2. **Choose Gallery**: Select target gallery (or create new one)
3. **Add Files**: 
   - Drag multiple images onto the drop zone, OR
   - Click "Select Files" and choose multiple files
4. **Edit Metadata**: Use the table to quickly edit titles, descriptions, and tags
5. **Review Queue**: Check the upload queue for any missing required information
6. **Upload All**: Click "Upload All" to process the entire queue
7. **Monitor Progress**: Watch real-time progress for each item
8. **Clean Up**: Clear completed items or retry failed uploads
9. **Navigate**: Auto-redirect to gallery or manually navigate

### Best Practices

#### File Preparation
- Name files descriptively (titles are auto-generated from filenames)
- Organize files by theme or series for easier metadata entry
- Ensure files meet size requirements (under 20MB each)

#### Metadata Entry
- Fill in titles first (most important field)
- Use consistent tagging schemes for better organization
- Add descriptions for context and SEO
- Verify artist attribution for commissioned work

#### Queue Management
- Upload in smaller batches (10-20 files) for better performance
- Clear successful uploads periodically to reduce visual clutter
- Review and retry failed uploads before navigating away

## Technical Details

### File Validation
- **Supported formats**: PNG, JPG, JPEG, GIF, WebP
- **Maximum size**: 20MB per file
- **Client-side validation**: Immediate feedback on invalid files
- **Server-side validation**: Additional validation during upload

### Performance Optimizations
- **Sequential processing**: Prevents server overload
- **Progress tracking**: Real-time feedback on upload status
- **Memory management**: Automatic cleanup of preview URLs
- **Chunked processing**: Efficient handling of large queues

### Error Handling
- **Graceful degradation**: Partial failures don't affect successful uploads
- **Detailed error messages**: Specific feedback for debugging
- **Retry capability**: Failed uploads can be retried without re-selecting files
- **Cleanup options**: Easy removal of failed uploads from queue

## Browser Compatibility

The bulk upload feature uses modern web APIs and is supported in:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

### Required APIs
- File API for drag-and-drop
- FormData for file uploads
- Fetch API for HTTP requests
- URL.createObjectURL for preview generation

## Future Enhancements

### Planned Features
- **Folder upload**: Upload entire folders while preserving structure
- **Batch tagging**: Apply tags to multiple items simultaneously
- **Template metadata**: Save metadata templates for quick application
- **Background uploads**: Continue uploads while navigating the site
- **Import from URLs**: Bulk import from external image URLs
- **CSV metadata import**: Import metadata from spreadsheet files

### Performance Improvements
- **Parallel uploads**: Configurable concurrent upload streams
- **Resume capability**: Resume interrupted uploads
- **Compression options**: Client-side image optimization
- **Chunked uploads**: Support for very large files

## Troubleshooting

### Common Issues

#### Files Not Appearing in Queue
- **Check file types**: Only image files are supported
- **Verify file size**: Files over 20MB are rejected
- **Browser compatibility**: Ensure drag-and-drop is supported

#### Upload Failures
- **Network issues**: Check internet connection
- **Server limits**: Contact admin if consistently failing
- **File corruption**: Re-select problematic files

#### Performance Issues
- **Large queues**: Upload in smaller batches
- **Memory usage**: Clear completed uploads regularly
- **Browser resources**: Close unnecessary tabs/applications

### Getting Help

If you encounter issues with the bulk upload feature:
1. Check the browser console for error messages
2. Verify file formats and sizes
3. Try uploading a smaller batch
4. Contact support with specific error messages

---

*This feature significantly improves the workflow for artists uploading multiple pieces, making it faster and more efficient to build gallery collections.*