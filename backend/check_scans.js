const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const ScanSchema = new mongoose.Schema({}, { strict: false });
const Scan = mongoose.model('Scan', ScanSchema, 'scans');

async function checkScans() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');
        
        const scan = await Scan.findOne({ imageUrl: { $regex: 'retina-1776434171556' } });
        if (scan) {
            console.log('Found scan with missing image:', scan);
        } else {
            console.log('No scan found with that image name in DB');
        }
        
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkScans();
