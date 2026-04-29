const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Scan = mongoose.connection.models.Scan || require('./models/Scan');
    const scans = await Scan.find({}).populate('patient').sort('-createdAt').limit(2).lean();
    console.log(JSON.stringify(scans, null, 2));
    process.exit(0);
});
