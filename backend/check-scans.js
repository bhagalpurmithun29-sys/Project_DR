const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Scan = mongoose.connection.collection('scans');
    const scans = await Scan.find({}).sort({createdAt: -1}).limit(5).toArray();
    console.log("Recent scans:");
    for (const s of scans) {
        console.log(`- ID: ${s._id}, eyeSide: ${s.eyeSide}, Patient: ${s.patient}, Date: ${s.date}`);
    }
    process.exit(0);
});
