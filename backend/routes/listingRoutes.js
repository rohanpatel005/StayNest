const express = require('express');
const router = express.Router();
const { 
  getListings, 
  getListing, 
  createListing, 
  updateListing, 
  deleteListing,
  updateListingStatus,
  uploadImages,
  searchListings,
  getPublicListing,
  deleteListingImage,
  blockDates,
  unblockDates
} = require('../controllers/listingController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Guest & Public Routes (No auth required)
router.get('/search', searchListings);
router.get('/public/:id', getPublicListing);

router.use(protect);

// Host Only Routes
router.use(authorizeRoles('host'));

router.post('/upload-images', upload.array('images', 15), uploadImages);

router.route('/')
  .get(getListings)
  .post(createListing);

router.route('/:id')
  .get(getListing)
  .put(updateListing)
  .delete(deleteListing);

router.patch('/:id/status', updateListingStatus);
router.delete('/:id/images/:imageId', deleteListingImage);
router.post('/:id/block-dates', blockDates);
router.delete('/:id/block-dates/:blockId', unblockDates);

module.exports = router;
