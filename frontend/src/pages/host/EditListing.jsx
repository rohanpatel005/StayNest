import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingApi } from '../../api/listingApi';

const AMENITIES_LIST = [
  'WiFi', 'TV', 'Kitchen', 'Workspace', 'Air Conditioning',
  'Heating', 'Pool', 'Hot Tub', 'Gym', 'Free Parking',
  'Elevator', 'Washer', 'Dryer', 'Smoke Alarm', 'First Aid Kit'
];

const EditListing = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    propertyType: '',
    guests: 1,
    bedrooms: 0,
    beds: 1,
    bathrooms: 0,
    pricePerNight: 0,
    description: '',
    status: 'draft',
    amenities: [],
  });

  // Images state
  const [images, setImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // Availability state
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockStart, setNewBlockStart] = useState('');
  const [newBlockEnd, setNewBlockEnd] = useState('');

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      const res = await listingApi.getListing(listingId);
      if (res.success) {
        const data = res.data;
        setListing(data);
        setFormData({
          title: data.title,
          propertyType: data.propertyType,
          guests: data.capacity?.guests || 1,
          bedrooms: data.capacity?.bedrooms || 0,
          beds: data.capacity?.beds || 1,
          bathrooms: data.capacity?.bathrooms || 0,
          pricePerNight: data.pricing?.perNight || 0,
          description: data.description,
          status: data.status,
          amenities: data.amenities || [],
        });
        setImages(data.images || []);
        setBlockedDates(data.availability?.blockedDates || []);
      }
    } catch (error) {
      alert('Failed to load listing details.');
      navigate('/host');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => {
      if (prev.amenities.includes(amenity)) {
        return { ...prev, amenities: prev.amenities.filter(a => a !== amenity) };
      } else {
        return { ...prev, amenities: [...prev.amenities, amenity] };
      }
    });
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      setUploadingImages(true);
      const fd = new FormData();
      for (let i = 0; i < files.length; i++) {
        fd.append('images', files[i]);
      }
      
      const res = await listingApi.uploadImages(fd);
      if (res.success) {
        const newImages = [...images, ...res.images];
        setImages(newImages);
        // Save immediately to DB by patching listing
        await listingApi.updateListing(listingId, { images: newImages });
        alert('Images uploaded successfully');
      }
    } catch (err) {
      alert('Failed to upload images');
    } finally {
      setUploadingImages(false);
      e.target.value = null; // reset file input
    }
  };

  const removeImage = async (imageId) => {
    if (images.length <= 1) {
      return alert('You must have at least one image.');
    }
    if (!window.confirm('Are you sure you want to delete this image?')) return;
    
    try {
      const res = await listingApi.deleteListingImage(listingId, imageId);
      if (res.success) {
        setImages(res.images);
        alert('Image removed');
      }
    } catch (err) {
      alert('Failed to remove image');
    }
  };

  const handleBlockDates = async () => {
    if (!newBlockStart || !newBlockEnd) return alert('Please select start and end dates');
    if (new Date(newBlockStart) >= new Date(newBlockEnd)) return alert('End date must be after start date');
    
    try {
      const res = await listingApi.blockDates(listingId, { startDate: newBlockStart, endDate: newBlockEnd });
      if (res.success) {
        setBlockedDates(res.blockedDates);
        setNewBlockStart('');
        setNewBlockEnd('');
        alert('Dates blocked successfully');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to block dates');
    }
  };

  const handleUnblockDates = async (blockId) => {
    try {
      const res = await listingApi.unblockDates(listingId, blockId);
      if (res.success) {
        setBlockedDates(res.blockedDates);
        alert('Dates unblocked');
      }
    } catch (err) {
      alert('Failed to unblock dates');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (formData.pricePerNight <= 0) {
      return alert('Price must be greater than 0');
    }
    
    // Warn if setting to unavailable
    if (formData.status === 'unpublished' && listing.status === 'published') {
      if (!window.confirm("Making this listing unavailable will prevent new guests from booking it. Existing confirmed bookings will remain unchanged. Continue?")) {
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        title: formData.title,
        propertyType: formData.propertyType,
        description: formData.description,
        capacity: {
          ...listing.capacity,
          guests: parseInt(formData.guests),
          bedrooms: parseInt(formData.bedrooms),
          beds: parseInt(formData.beds),
          bathrooms: parseInt(formData.bathrooms),
        },
        pricing: {
          ...listing.pricing,
          perNight: parseInt(formData.pricePerNight),
        },
        amenities: formData.amenities,
        status: formData.status,
      };

      const res = await listingApi.updateListing(listingId, payload);
      if (res.success) {
        alert('Listing updated successfully.');
        navigate('/host');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update listing.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading listing details...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/host')}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 text-white bg-rose-600 rounded-lg hover:bg-rose-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <form className="space-y-12">
        {/* SECTION 1: Basic Information */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">1. Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                name="propertyType"
                value={formData.propertyType}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
              >
                <option value="Entire Place">Entire Place</option>
                <option value="Private Room">Private Room</option>
                <option value="Shared Room">Shared Room</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Guests</label>
              <input
                type="number"
                name="guests"
                min="1"
                value={formData.guests}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
              <input
                type="number"
                name="bedrooms"
                min="0"
                value={formData.bedrooms}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beds</label>
              <input
                type="number"
                name="beds"
                min="1"
                value={formData.beds}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
              <input
                type="number"
                name="bathrooms"
                min="0"
                value={formData.bathrooms}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
        </section>

        {/* SECTION 2: Pricing */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">2. Pricing</h2>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              Note: Changing the price will only affect new bookings. Existing confirmed bookings will retain their original price.
            </p>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-1">Price per night (₹)</label>
              <input
                type="number"
                name="pricePerNight"
                min="1"
                value={formData.pricePerNight}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
                required
              />
            </div>
          </div>
        </section>

        {/* SECTION 3: Description */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">3. Description</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Listing Description</label>
            <textarea
              name="description"
              rows="6"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
              required
            ></textarea>
          </div>
        </section>

        {/* SECTION 4: Photos */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">4. Photos</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img._id || img.publicId} className="relative group rounded-lg overflow-hidden border">
                <img src={img.url} alt="Listing" className="w-full h-32 object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(img._id)}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Image"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            ))}
            <div className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col justify-center items-center h-32 bg-gray-50 hover:bg-gray-100 relative cursor-pointer">
              {uploadingImages ? (
                <span className="text-gray-500">Uploading...</span>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  <span className="text-sm text-gray-500">Add Photos</span>
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  />
                </>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 5: Amenities */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">5. Amenities</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {AMENITIES_LIST.map(amenity => (
              <label key={amenity} className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={formData.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="w-4 h-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500"
                />
                <span className="text-gray-700">{amenity}</span>
              </label>
            ))}
          </div>
        </section>

        {/* SECTION 6: Availability */}
        <section className="space-y-6">
          <h2 className="text-2xl font-semibold border-b pb-2">6. Availability</h2>
          
          {/* Global Availability */}
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Global Availability</h3>
            <p className="text-sm text-gray-600 mb-4">
              Toggle whether your property is generally available for booking or temporarily hidden.
            </p>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
            >
              <option value="published">Available for booking</option>
              <option value="unpublished">Unavailable (Hidden)</option>
            </select>
          </div>

          {/* Date-Specific Blocking */}
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Block Specific Dates</h3>
            <p className="text-sm text-gray-600 mb-4">
              Prevent guests from booking your property on specific dates.
            </p>
            
            <div className="flex gap-4 items-end mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={newBlockStart}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setNewBlockStart(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={newBlockEnd}
                  min={newBlockStart || new Date().toISOString().split('T')[0]}
                  onChange={e => setNewBlockEnd(e.target.value)}
                  className="p-2 border rounded-lg focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
              <button
                type="button"
                onClick={handleBlockDates}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                Block Dates
              </button>
            </div>

            {/* List Blocked Dates */}
            {blockedDates.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Currently Blocked Dates</h4>
                <ul className="space-y-2">
                  {blockedDates.map(block => (
                    <li key={block._id} className="flex justify-between items-center p-3 bg-white border rounded-lg">
                      <span className="text-sm text-gray-800">
                        {new Date(block.startDate).toLocaleDateString()} to {new Date(block.endDate).toLocaleDateString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleUnblockDates(block._id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Unblock
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>

      </form>
    </div>
  );
};

export default EditListing;
