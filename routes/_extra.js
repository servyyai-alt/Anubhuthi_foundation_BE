const express = require('express');
const mediaRouter = express.Router();
const analyticsRouter = express.Router();
const multer = require('multer');
const { Media, Donation, Contact, Volunteer, Program, Event } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadImageBuffer } = require('../utils/cloudinary');
const { upload: localUpload, getFileUrl } = require('../utils/fileUpload');

const OFFICE_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype?.startsWith('image/')
      || file.mimetype?.startsWith('video/')
      || file.mimetype?.startsWith('audio/')
      || OFFICE_MIME_TYPES.has(file.mimetype)
    ) {
      return cb(null, true);
    }

    return cb(new Error('Only image, video, audio, PDF, DOC, or DOCX files are allowed.'));
  }
});

function getFileExtension(value = '') {
  const clean = String(value).split('?')[0].split('#')[0];
  const match = clean.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : '';
}

function getYouTubeThumbnail(url = '') {
  const value = String(url);
  const match = value.match(/(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([\w-]{6,})/i);
  return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : '';
}

function buildCloudinaryPreview(url = '', transforms = '') {
  if (!url.includes('/upload/')) return '';

  const [base, query = ''] = url.split('?');
  const transformed = base.replace('/upload/', `/upload/${transforms}/`);
  return query ? `${transformed}?${query}` : transformed;
}

function getDocumentMetadata(item) {
  const fileUrl = item.url || '';
  const fileName = item.fileName || decodeURIComponent(fileUrl.split('/').pop()?.split('?')[0] || '') || item.title;
  const extension = getFileExtension(item.fileName || fileUrl || item.mimeType);
  const mimeType = item.mimeType || '';
  const isPdf = extension === 'pdf' || mimeType === 'application/pdf';
  const isWord = ['doc', 'docx'].includes(extension)
    || mimeType === 'application/msword'
    || mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

  return { fileName, extension, mimeType, isPdf, isWord };
}

function derivePreview(item) {
  const gallery = Array.isArray(item.gallery) ? item.gallery.filter(Boolean) : [];
  const description = item.excerpt || item.description || '';
  const base = {
    cardPreviewUrl: '',
    cardPreviewKind: item.type,
    cardPlaceholder: item.type,
    cardBadge: '',
    excerpt: description.length > 180 ? `${description.slice(0, 177)}...` : description,
    duration: item.duration || '',
    galleryCount: gallery.length,
    fileExtension: '',
    fileName: item.fileName || '',
    mimeType: item.mimeType || ''
  };

  if (item.type === 'video') {
    return {
      ...base,
      cardPreviewKind: 'image',
      cardPreviewUrl: item.previewImage || item.thumbnail || getYouTubeThumbnail(item.url) || buildCloudinaryPreview(item.url, 'so_0,f_jpg,q_auto,w_960,c_fill'),
      cardBadge: 'Watch'
    };
  }

  if (item.type === 'podcast') {
    return {
      ...base,
      cardPreviewKind: item.previewImage || item.thumbnail || gallery[0] ? 'image' : 'podcast',
      cardPreviewUrl: item.previewImage || item.thumbnail || gallery[0] || '',
      cardBadge: item.duration ? `${item.duration}` : 'Audio'
    };
  }

  if (item.type === 'article') {
    return {
      ...base,
      cardPreviewKind: item.previewImage || item.thumbnail || gallery[0] ? 'image' : 'article',
      cardPreviewUrl: item.previewImage || item.thumbnail || gallery[0] || '',
      cardBadge: item.category || 'Article'
    };
  }

  if (item.type === 'gallery') {
    return {
      ...base,
      cardPreviewKind: gallery[0] || item.thumbnail ? 'image' : 'gallery',
      cardPreviewUrl: gallery[0] || item.thumbnail || '',
      cardBadge: `${gallery.length || 0} Image${gallery.length === 1 ? '' : 's'}`
    };
  }

  if (item.type === 'document') {
    const documentMeta = getDocumentMetadata(item);
    return {
      ...base,
      cardPreviewKind: documentMeta.isPdf ? 'pdf' : 'document',
      cardPreviewUrl: item.previewImage
        || item.thumbnail
        || (documentMeta.isPdf ? buildCloudinaryPreview(item.url, 'pg_1,f_jpg,q_auto,w_960,c_fill') : ''),
      cardBadge: documentMeta.extension ? documentMeta.extension.toUpperCase() : 'Document',
      fileExtension: documentMeta.extension,
      fileName: documentMeta.fileName,
      mimeType: documentMeta.mimeType
    };
  }

  return base;
}

function serializeMediaItem(doc) {
  const item = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  return {
    ...item,
    ...derivePreview(item)
  };
}

// Media routes
mediaRouter.get('/', async (req, res) => {
  try {
    const { type, featured, limit } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;
    if (featured) query.isFeatured = true;
    const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 0, 0), 50);
    const mediaQuery = Media.find(query).sort({ isFeatured: -1, publishDate: -1 });
    if (parsedLimit) mediaQuery.limit(parsedLimit);

    const media = await mediaQuery;
    res.json({ success: true, data: media.map(serializeMediaItem) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.get('/admin/all', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.find().sort({ isFeatured: -1, publishDate: -1, createdAt: -1 });
    res.json({ success: true, data: media.map(serializeMediaItem), total: media.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.post('/upload-image', protect, adminOnly, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a file to upload.' });
    }

    const result = await uploadImageBuffer(req.file.buffer, req.file.originalname, req.file.mimetype);
    return res.status(201).json({ success: true, data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.post('/upload-images', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'Please select at least one image to upload.' });
    }

    const uploads = await Promise.all(
      req.files.map((file) => uploadImageBuffer(file.buffer, file.originalname, file.mimetype))
    );

    return res.status(201).json({ success: true, data: uploads });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.post('/upload-document', protect, adminOnly, localUpload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please select a document file to upload.' });
    }

    const fileUrl = getFileUrl(req, req.file.filename);
    
    return res.status(201).json({ 
      success: true, 
      data: { 
        url: fileUrl, 
        fileName: req.file.originalname,
        mimeType: req.file.mimetype 
      } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.post('/', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.create(req.body);
    res.status(201).json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, data: media });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

mediaRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Media.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Analytics routes
analyticsRouter.get('/overview', protect, adminOnly, async (req, res) => {
  try {
    const [programs, events, donations, contacts, volunteers] = await Promise.all([
      Program.countDocuments({ isActive: true }),
      Event.countDocuments({ isActive: true }),
      Donation.find({ status: 'completed' }),
      Contact.countDocuments(),
      Volunteer.countDocuments()
    ]);
    const totalDonations = donations.reduce((sum, d) => sum + d.amount, 0);
    const donationsByPurpose = donations.reduce((acc, d) => {
      acc[d.purpose] = (acc[d.purpose] || 0) + d.amount;
      return acc;
    }, {});
    
    // Monthly donations (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyDonations = await Donation.aggregate([
      { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { month: { $month: '$createdAt' }, year: { $year: '$createdAt' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        programs, events, contacts, volunteers,
        totalDonations,
        donationCount: donations.length,
        donationsByPurpose,
        monthlyDonations
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { mediaRouter, analyticsRouter };
