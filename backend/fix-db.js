const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load env
dotenv.config();

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_dr';

mongoose.connect(uri).then(async () => {
    console.log("Connected to DB");
    const db = mongoose.connection.db;
    
    const collections = await db.collections();
    for (const collection of collections) {
        // Find documents that have a 'photo' field or 'imageUrl' that contains 'user-1776616626533-888227168.jpg'
        const docs = await collection.find({
            $or: [
                { photo: { $regex: 'user-1776616626533-888227168.jpg' } },
                { imageUrl: { $regex: 'user-1776616626533-888227168.jpg' } }
            ]
        }).toArray();
        
        if (docs.length > 0) {
            console.log(`Found ${docs.length} in collection ${collection.collectionName}`);
            
            await collection.updateMany(
                { photo: { $regex: 'user-1776616626533-888227168.jpg' } },
                { $set: { photo: '' } }
            );
            console.log(`Updated photo in ${collection.collectionName}`);
        }
    }
    console.log("Done");
    process.exit(0);
}).catch(console.error);
