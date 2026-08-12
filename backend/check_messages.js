require('dotenv').config();
const mongoose = require('mongoose');
const Message = require('./models/Message');

const checkMessages = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/staynest');
    const messages = await Message.find().sort({ createdAt: -1 }).limit(10);
    console.log("Latest Messages:");
    messages.forEach(m => {
      console.log(`From: ${m.sender}, To: ${m.receiver}, Text: ${m.text}`);
    });
    process.exit(0);
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
}
checkMessages();
