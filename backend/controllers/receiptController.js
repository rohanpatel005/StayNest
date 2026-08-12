const Booking = require('../models/Booking');
const PDFDocument = require('pdfkit');

exports.downloadReceipt = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;

    // 1. Find Booking
    const booking = await Booking.findById(bookingId)
      .populate('guest', 'firstName lastName email')
      .populate('host', 'firstName lastName email')
      .populate('listing', 'title propertyType location checkInTime checkOutTime')
      .populate('paymentReference');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // 2. Authorize User (Must be the guest or host)
    if (
      booking.guest._id.toString() !== req.user._id.toString() &&
      booking.host._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to download this receipt' });
    }

    // 3. Verify Payment Status
    if (booking.status !== 'CONFIRMED' && booking.status !== 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Receipt is only available for confirmed bookings' });
    }
    if (booking.paymentStatus !== 'PAID') {
      return res.status(400).json({ success: false, message: 'Payment is not completed for this booking' });
    }

    // 4. Ensure receipt number exists (fallback for legacy bookings)
    let isUpdated = false;
    if (!booking.receiptNumber) {
      booking.receiptNumber = `RCPT-${Date.now()}-${booking._id.toString().substring(0, 6).toUpperCase()}`;
      booking.receiptStatus = 'PENDING';
      isUpdated = true;
    }
    if (booking.receiptStatus === 'PENDING') {
      booking.receiptStatus = 'GENERATED';
      booking.receiptGeneratedAt = new Date();
      isUpdated = true;
    }
    
    if (isUpdated) {
      await booking.save();
    }

    // 5. Generate PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers for download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Receipt-${booking.receiptNumber}.pdf`);

    // Pipe the PDF directly to the response
    doc.pipe(res);

    // --- PDF Formatting ---
    // Header
    doc
      .fontSize(24)
      .font('Helvetica-Bold')
      .text('STAYNEST', { align: 'center' })
      .moveDown(0.2)
      .fontSize(10)
      .font('Helvetica')
      .fillColor('gray')
      .text('Your trusted home booking platform', { align: 'center' })
      .moveDown(2);

    doc
      .fillColor('black')
      .fontSize(18)
      .font('Helvetica-Bold')
      .text('PAYMENT RECEIPT', { align: 'center' })
      .moveDown(2);

    // Receipt details
    doc.fontSize(10).font('Helvetica-Bold').text('Receipt Number: ', { continued: true }).font('Helvetica').text(booking.receiptNumber);
    doc.font('Helvetica-Bold').text('Date Generated: ', { continued: true }).font('Helvetica').text(new Date().toLocaleDateString());
    doc.font('Helvetica-Bold').text('Transaction ID: ', { continued: true }).font('Helvetica').text(booking.paymentReference?.razorpayPaymentId || 'N/A');
    doc.font('Helvetica-Bold').text('Booking ID: ', { continued: true }).font('Helvetica').text(booking._id.toString());
    doc.moveDown(1.5);

    // Guest & Host info
    const guestName = `${booking.guest.firstName} ${booking.guest.lastName}`;
    const hostName = `${booking.host.firstName} ${booking.host.lastName}`;
    
    doc.font('Helvetica-Bold').text('Billed To (Guest):');
    doc.font('Helvetica').text(guestName);
    doc.text(booking.guest.email);
    doc.moveDown();

    doc.font('Helvetica-Bold').text('Host:');
    doc.font('Helvetica').text(hostName);
    doc.text(booking.host.email);
    doc.moveDown(1.5);

    // Property & Stay Info
    doc.fontSize(14).font('Helvetica-Bold').text('Stay Details').moveDown(0.5);
    doc.fontSize(10).font('Helvetica-Bold').text('Property: ', { continued: true }).font('Helvetica').text(`${booking.listing.title} (${booking.listing.propertyType})`);
    
    let locationStr = '';
    if (booking.listing.location) {
        locationStr = booking.listing.location.address || `${booking.listing.location.city}, ${booking.listing.location.country}`;
    }
    doc.font('Helvetica-Bold').text('Location: ', { continued: true }).font('Helvetica').text(locationStr);
    
    // Helper to format time (e.g. 14:00 -> 2:00 PM)
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      const [hours, minutes] = timeStr.split(':');
      let h = parseInt(hours, 10);
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12 || 12;
      return `, ${h}:${minutes} ${ampm}`;
    };

    const formattedCheckIn = new Date(booking.checkIn).toLocaleDateString() + formatTime(booking.listing.checkInTime);
    const formattedCheckOut = new Date(booking.checkOut).toLocaleDateString() + formatTime(booking.listing.checkOutTime);

    doc.font('Helvetica-Bold').text('Check-in: ', { continued: true }).font('Helvetica').text(formattedCheckIn);
    doc.font('Helvetica-Bold').text('Check-out: ', { continued: true }).font('Helvetica').text(formattedCheckOut);
    doc.font('Helvetica-Bold').text('Guests: ', { continued: true }).font('Helvetica').text(booking.guests.toString());
    doc.font('Helvetica-Bold').text('Nights: ', { continued: true }).font('Helvetica').text(booking.pricing.nights.toString());
    doc.moveDown(1.5);

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Pricing Breakdown
    doc.fontSize(14).font('Helvetica-Bold').text('Pricing Breakdown').moveDown(0.5);
    doc.fontSize(10);
    
    const basePrice = booking.pricing.perNight * booking.pricing.nights;
    
    doc.text('Base Price:', 50, doc.y, { continued: true }).text(`Rs. ${basePrice.toFixed(2)}`, { align: 'right' });
    doc.text('Cleaning Fee:', 50, doc.y, { continued: true }).text(`Rs. ${booking.pricing.cleaningFee.toFixed(2)}`, { align: 'right' });
    doc.text('Service Fee:', 50, doc.y, { continued: true }).text(`Rs. ${booking.pricing.serviceFee.toFixed(2)}`, { align: 'right' });
    
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12).text('Total Amount Paid:', 50, doc.y, { continued: true }).text(`Rs. ${booking.pricing.totalAmount.toFixed(2)}`, { align: 'right' });
    doc.moveDown(2);

    // Footer
    doc.fontSize(10).font('Helvetica').fillColor('gray').text('Thank you for booking with StayNest!', { align: 'center' });
    doc.text('This is a computer generated receipt and does not require a physical signature.', { align: 'center' });

    // Finalize the PDF
    doc.end();

  } catch (error) {
    console.error('Receipt generation error:', error);
    // Note: If headers are already sent, we cannot send a JSON response. 
    // We assume error happens before streaming starts.
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: 'Server Error during receipt generation' });
    }
  }
};
