const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const Scan = mongoose.connection.collection('scans');
    // Find the latest scan that was uploaded at 05:09:50
    const scan = await Scan.findOne({ _id: new mongoose.Types.ObjectId("69f14546bdf0e65e115c951f") });
    if (scan) {
        await Scan.updateOne({ _id: scan._id }, { $set: { eyeSide: 'OS' } });
        console.log("Updated scan 69f14546bdf0e65e115c951f to OS");
    }
    process.exit(0);
});
