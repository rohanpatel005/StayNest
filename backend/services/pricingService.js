exports.calculateBookingPrice = (listing, checkIn, checkOut, guests) => {
  if (!listing || !checkIn || !checkOut || !guests) {
    throw new Error('Missing required parameters for price calculation');
  }

  if (guests > listing.capacity.guests) {
    throw new Error('Guest count exceeds listing capacity');
  }

  const start = new Date(checkIn);
  const end = new Date(checkOut);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error('Invalid dates provided');
  }
  
  if (start >= end) {
    throw new Error('Check-out must be after check-in');
  }

  const timeDiff = end.getTime() - start.getTime();
  const nights = Math.ceil(timeDiff / (1000 * 3600 * 24));
  
  if (nights < listing.availability.minNights) {
    throw new Error(`Minimum ${listing.availability.minNights} nights required`);
  }
  if (nights > listing.availability.maxNights) {
    throw new Error(`Maximum ${listing.availability.maxNights} nights allowed`);
  }

  const nightlyTotal = listing.pricing.perNight * nights;
  const cleaningFee = listing.pricing.cleaningFee || 0;
  const serviceFee = listing.pricing.serviceFee || 0;
  
  // Potential future discount logic (e.g., weekly discount)
  let discount = 0;
  if (nights >= 7 && listing.pricing.weeklyDiscount) {
    discount = nightlyTotal * (listing.pricing.weeklyDiscount / 100);
  }

  const total = nightlyTotal + cleaningFee + serviceFee - discount;

  return {
    nights,
    nightlyTotal,
    cleaningFee,
    serviceFee,
    discount,
    total
  };
};
