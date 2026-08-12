const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema(
  {
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    propertyType: {
      type: String,
      enum: ['Entire Place', 'Private Room', 'Shared Room'],
      required: true,
    },
    location: {
      country: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      postalCode: { type: String, required: true },
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 },
    },
    capacity: {
      guests: { type: Number, required: true, min: 1 },
      bedrooms: { type: Number, required: true, min: 0 },
      beds: { type: Number, required: true, min: 1 },
      bathrooms: { type: Number, required: true, min: 0 },
    },
    amenities: [
      {
        type: String,
      },
    ],
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        isPrimary: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
      },
    ],
    pricing: {
      perNight: { type: Number, required: true },
      cleaningFee: { type: Number, default: 0 },
      serviceFee: { type: Number, default: 0 },
    },
    availability: {
      minNights: { type: Number, default: 1 },
      maxNights: { type: Number, default: 30 },
      availableFrom: { type: Date },
      availableUntil: { type: Date },
      blockedDates: [
        {
          startDate: { type: Date, required: true },
          endDate: { type: Date, required: true },
        }
      ],
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'unpublished'],
      default: 'draft',
    },
    checkInTime: {
      type: String,
      trim: true,
    },
    checkOutTime: {
      type: String,
      trim: true,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Listing', listingSchema);
