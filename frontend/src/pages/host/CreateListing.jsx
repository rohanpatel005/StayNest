import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, House, MapPin, Users, Wifi, Image as ImageIcon, IndianRupee, Calendar, Trash2 } from 'lucide-react';
import { listingApi } from '../../api/listingApi';
import LocationPicker from '../../components/map/LocationPicker';

const CreateListing = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  
  const [localFiles, setLocalFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    propertyType: 'Entire Place',
    location: { country: '', state: '', city: '', address: '', postalCode: '', latitude: null, longitude: null },
    capacity: { guests: 1, bedrooms: 0, beds: 1, bathrooms: 0 },
    amenities: [],
    images: [{ url: '', isPrimary: true }],
    pricing: { perNight: 1000, cleaningFee: 0, serviceFee: 0 },
    availability: { minNights: 1, maxNights: 30 },
    checkInTime: '',
    checkOutTime: ''
  });

  const steps = [
    { id: 'basics', title: 'Basics', icon: House },
    { id: 'location', title: 'Location', icon: MapPin },
    { id: 'rooms', title: 'Rooms', icon: Users },
    { id: 'amenities', title: 'Amenities', icon: Wifi },
    { id: 'photos', title: 'Photos', icon: ImageIcon },
    { id: 'pricing', title: 'Pricing', icon: IndianRupee },
    { id: 'availability', title: 'Availability', icon: Calendar },
    { id: 'preview', title: 'Preview', icon: CheckCircle2 }
  ];

  const amenityOptions = ['Wi-Fi', 'Kitchen', 'Pool', 'Parking', 'Air Conditioning', 'TV', 'Workspace', 'Washer', 'Gym', 'Beach Access', 'Pet Friendly'];

  const handleChange = (e, section = null) => {
    if (section) {
      setFormData({
        ...formData,
        [section]: { ...formData[section], [e.target.name]: e.target.value }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleNumberChange = (section, field, increment) => {
    setFormData(prev => {
      const current = prev[section][field];
      const next = current + increment;
      if (next < 0) return prev;
      if (field === 'guests' || field === 'beds' || field === 'minNights') {
        if (next < 1) return prev;
      }
      return { ...prev, [section]: { ...prev[section], [field]: next } };
    });
  };

  const toggleAmenity = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    const validFiles = [];
    let err = '';
    
    files.forEach(file => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        err = 'Unsupported image format. Please upload JPG, PNG, or WEBP.';
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        err = 'This image is too large. Maximum size is 10MB.';
        return;
      }
      validFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
        isPrimary: localFiles.length === 0 && validFiles.length === 0,
      });
    });

    if (err) alert(err);

    if (localFiles.length + validFiles.length > 15) {
      alert('Maximum 15 images allowed per property.');
      return;
    }

    setLocalFiles(prev => [...prev, ...validFiles]);
  };

  const removeLocalFile = (index) => {
    const newFiles = [...localFiles];
    URL.revokeObjectURL(newFiles[index].previewUrl);
    newFiles.splice(index, 1);
    if (newFiles.length > 0 && !newFiles.some(f => f.isPrimary)) {
      newFiles[0].isPrimary = true;
    }
    setLocalFiles(newFiles);
  };

  const setPrimaryLocalFile = (index) => {
    setLocalFiles(prev => prev.map((f, i) => ({ ...f, isPrimary: i === index })));
  };

  const handleNext = () => {
    setValidationErrors({});
    
    if (currentStep === 0) {
      const errors = {};
      if (!formData.title.trim()) errors.title = 'Please enter a property title.';
      if (!formData.description.trim()) errors.description = 'Please enter a description.';
      if (Object.keys(errors).length > 0) return setValidationErrors(errors);
    }
    if (currentStep === 1) {
      const { country, state, city, address, latitude, longitude } = formData.location;
      if (!address || !latitude || !longitude) {
        return setValidationErrors({ location: 'Please select a valid location on the map.' });
      }
    }
    if (currentStep === 3) {
      if (formData.amenities.length === 0) {
        return setValidationErrors({ amenities: 'Please select at least one amenity.' });
      }
    }
    if (currentStep === 4) {
      if (localFiles.length === 0) {
        return setValidationErrors({ photos: 'Please upload at least one photo.' });
      }
    }
    if (currentStep === 5) {
      if (formData.pricing.perNight <= 0) return setValidationErrors({ pricing: 'Price per night must be greater than 0.' });
    }
    if (currentStep === 6) {
      if (formData.availability.maxNights < formData.availability.minNights) {
        return setValidationErrors({ availability: 'Maximum nights cannot be less than minimum nights.' });
      }
      if (!formData.checkInTime || !formData.checkOutTime) {
        return setValidationErrors({ time: 'Please select both check-in and check-out times.' });
      }
    }

    if (currentStep < steps.length - 1) setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    if (localFiles.length === 0) {
      setError('Please upload at least one photo.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Upload images
      const uploadData = new FormData();
      localFiles.forEach(f => uploadData.append('images', f.file));
      
      const uploadRes = await listingApi.uploadImages(uploadData);
      
      // 2. Map Cloudinary references back to local file primary status/order
      const uploadedImages = uploadRes.images.map((img, index) => ({
        url: img.url,
        publicId: img.publicId,
        isPrimary: localFiles[index].isPrimary,
        order: index
      }));

      // 3. Create listing
      const finalData = {
        ...formData,
        images: uploadedImages,
        status: 'published'
      };
      
      await listingApi.createListing(finalData);
      navigate('/host/listings');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create listing');
      setIsLoading(false);
    }
  };

  // Step Renderers
  const renderStep = () => {
    switch (currentStep) {
      case 0: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Let's start with the basics</h2>
          <div>
            <label className="block text-sm font-bold mb-2">Property Title</label>
            {validationErrors.title && <p className="text-red-500 text-sm mb-2">{validationErrors.title}</p>}
            <input type="text" name="title" value={formData.title} onChange={handleChange} className={`w-full p-4 border rounded-xl ${validationErrors.title ? 'border-red-500 bg-red-50' : ''}`} placeholder="e.g. Sunny Beachfront Villa" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Description</label>
            {validationErrors.description && <p className="text-red-500 text-sm mb-2">{validationErrors.description}</p>}
            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" className={`w-full p-4 border rounded-xl ${validationErrors.description ? 'border-red-500 bg-red-50' : ''}`} placeholder="Describe your place..." />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Property Type</label>
            <select name="propertyType" value={formData.propertyType} onChange={handleChange} className="w-full p-4 border rounded-xl bg-white">
              <option value="Entire Place">Entire Place</option>
              <option value="Private Room">Private Room</option>
              <option value="Shared Room">Shared Room</option>
            </select>
          </div>
        </div>
      );
      case 1: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Where is your place located?</h2>
          <p className="text-gray-500 text-sm mb-4">Your location helps guests discover your property.</p>
          {validationErrors.location && <p className="text-red-500 text-sm mb-2">{validationErrors.location}</p>}
          <LocationPicker 
            initialLocation={formData.location.latitude ? formData.location : null}
            onLocationSelect={(locationObj) => {
              setFormData({ ...formData, location: locationObj });
              setValidationErrors({});
            }}
          />
        </div>
      );
      case 2: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Share some basics about your place</h2>
          {['guests', 'bedrooms', 'beds', 'bathrooms'].map(field => (
            <div key={field} className="flex justify-between items-center py-4 border-b">
              <span className="text-lg capitalize">{field}</span>
              <div className="flex items-center gap-4">
                <button onClick={() => handleNumberChange('capacity', field, -1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-gray-900">-</button>
                <span className="w-6 text-center">{formData.capacity[field]}</span>
                <button onClick={() => handleNumberChange('capacity', field, 1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-gray-900">+</button>
              </div>
            </div>
          ))}
        </div>
      );
      case 3: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Tell guests what your place has to offer</h2>
          {validationErrors.amenities && <p className="text-red-500 text-sm mb-2">{validationErrors.amenities}</p>}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {amenityOptions.map(amenity => (
              <button
                key={amenity}
                onClick={() => toggleAmenity(amenity)}
                className={`p-4 border rounded-xl text-left transition-all ${formData.amenities.includes(amenity) ? 'border-brand-500 bg-brand-50 shadow-[0_0_0_1px_#FF385C]' : 'hover:border-gray-900'}`}
              >
                <span className="font-medium">{amenity}</span>
              </button>
            ))}
          </div>
        </div>
      );
      case 4: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Add some photos of your place</h2>
          {validationErrors.photos && <p className="text-red-500 text-sm mb-2">{validationErrors.photos}</p>}
          <p className="text-gray-500 text-sm mb-4">Upload high-quality photos to help guests discover your property.</p>
          
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-12 text-center transition-all ${
              isDragging ? 'border-brand-500 bg-brand-50' : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex flex-col items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-lg font-bold text-gray-900 mb-2">Drag & drop photos here</p>
              <p className="text-gray-500 mb-6">or</p>
              <label className="cursor-pointer bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-colors">
                Upload Photos
                <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileInput} />
              </label>
              <p className="text-gray-400 text-sm mt-4">JPG, PNG, WEBP • Max 10MB each</p>
            </div>
          </div>

          {localFiles.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              <AnimatePresence>
                {localFiles.map((file, idx) => (
                  <motion.div key={file.previewUrl} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="relative group aspect-[4/3] rounded-xl overflow-hidden border">
                    <img src={file.previewUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                      <div className="flex justify-between items-start">
                        <button type="button" onClick={() => setPrimaryLocalFile(idx)} className={`px-3 py-1 rounded-lg text-xs font-bold ${file.isPrimary ? 'bg-brand-500 text-white' : 'bg-white text-gray-900'}`}>
                          {file.isPrimary ? '✓ Cover' : 'Make Cover'}
                        </button>
                        <button type="button" onClick={() => removeLocalFile(idx)} className="w-8 h-8 bg-white/90 text-red-500 rounded-full flex items-center justify-center hover:bg-white hover:text-red-600 shadow-sm transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    {file.isPrimary && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-brand-500 text-white rounded-lg text-xs font-bold">
                        ✓ Cover
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      );
      case 5: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Now, set your price</h2>
          {validationErrors.pricing && <p className="text-red-500 text-sm mb-2">{validationErrors.pricing}</p>}
          <div className="space-y-4">
            <div><label className="block text-sm font-bold mb-2">Price per Night (₹)</label><input type="number" name="perNight" value={formData.pricing.perNight} onChange={e => handleChange(e, 'pricing')} className="w-full p-4 border rounded-xl text-xl" /></div>
            <div><label className="block text-sm font-bold mb-2">Cleaning Fee (₹)</label><input type="number" name="cleaningFee" value={formData.pricing.cleaningFee} onChange={e => handleChange(e, 'pricing')} className="w-full p-4 border rounded-xl" /></div>
            <div><label className="block text-sm font-bold mb-2">Service Fee (₹)</label><input type="number" name="serviceFee" value={formData.pricing.serviceFee} onChange={e => handleChange(e, 'pricing')} className="w-full p-4 border rounded-xl" /></div>
          </div>
        </div>
      );
      case 6: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Set your availability</h2>
          {validationErrors.availability && <p className="text-red-500 text-sm mb-2">{validationErrors.availability}</p>}
          <div className="space-y-4">
            <div className="flex justify-between items-center py-4 border-b">
              <span className="text-lg">Minimum nights</span>
              <div className="flex items-center gap-4">
                <button onClick={() => handleNumberChange('availability', 'minNights', -1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-gray-900">-</button>
                <span className="w-6 text-center">{formData.availability.minNights}</span>
                <button onClick={() => handleNumberChange('availability', 'minNights', 1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-gray-900">+</button>
              </div>
            </div>
            <div className="flex justify-between items-center py-4 border-b">
              <span className="text-lg">Maximum nights</span>
              <div className="flex items-center gap-4">
                <button onClick={() => handleNumberChange('availability', 'maxNights', -1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-gray-900">-</button>
                <span className="w-6 text-center">{formData.availability.maxNights}</span>
                <button onClick={() => handleNumberChange('availability', 'maxNights', 1)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:border-gray-900">+</button>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold mt-8 mb-4">Check-in / Check-out Times</h3>
          {validationErrors.time && <p className="text-red-500 text-sm mb-2">{validationErrors.time}</p>}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold mb-2">Check-in Time</label>
              <input 
                type="time" 
                name="checkInTime" 
                value={formData.checkInTime} 
                onChange={handleChange} 
                className="w-full p-4 border rounded-xl" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-2">Check-out Time</label>
              <input 
                type="time" 
                name="checkOutTime" 
                value={formData.checkOutTime} 
                onChange={handleChange} 
                className="w-full p-4 border rounded-xl" 
              />
            </div>
          </div>
        </div>
      );
      case 7: return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold mb-6">Review your listing</h2>
          <div className="bg-white border rounded-2xl p-6 shadow-sm">
            <div className="aspect-[16/9] bg-gray-100 rounded-xl mb-6 overflow-hidden">
              {localFiles.length > 0 ? (
                <img src={localFiles.find(f => f.isPrimary)?.previewUrl || localFiles[0].previewUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Provided</div>
              )}
            </div>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-2xl font-bold">{formData.title || 'Untitled Property'}</h3>
              <div className="text-right">
                <div className="text-xl font-bold">₹{formData.pricing.perNight}</div>
                <div className="text-sm text-gray-500">night</div>
              </div>
            </div>
            <p className="text-gray-500 mb-4">{formData.location.city}, {formData.location.country}</p>
            <div className="flex gap-2 text-sm text-gray-500 mb-6">
              <span>{formData.capacity.guests} guests</span> · <span>{formData.capacity.bedrooms} bedrooms</span> · <span>{formData.capacity.beds} beds</span> · <span>{formData.capacity.bathrooms} baths</span>
            </div>
            <div className="h-px bg-gray-200 mb-6"></div>
            <p className="text-gray-700">{formData.description}</p>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative">
      {/* Header */}
      <div className="px-8 py-6 border-b flex justify-between items-center bg-white z-10 shrink-0">
        <button onClick={() => navigate('/host/listings')} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Exit
        </button>
        <span className="font-bold text-gray-900">{steps[currentStep].title}</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-gray-100 w-full shrink-0">
        <motion.div 
          className="h-full bg-brand-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="max-w-xl mx-auto py-8"
          >
            {renderStep()}
            {error && currentStep === 7 && <p className="text-red-500 mt-4 text-center font-bold">{error}</p>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="px-8 py-4 border-t flex justify-between items-center bg-white z-10 shrink-0">
        <button 
          onClick={handleBack}
          disabled={currentStep === 0 || isLoading}
          className={`font-bold underline py-2 ${currentStep === 0 ? 'text-gray-300 pointer-events-none' : 'text-gray-900'}`}
        >
          Back
        </button>
        
        {currentStep < steps.length - 1 ? (
          <button 
            onClick={handleNext}
            className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-colors"
          >
            Next
          </button>
        ) : (
          <button 
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-brand-500 text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-600 transition-colors flex items-center gap-2"
          >
            {isLoading ? 'Publishing...' : 'Publish Listing'}
            {!isLoading && <Check className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
};

export default CreateListing;
