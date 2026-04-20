const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String },
    points: [{ type: String }],
    sectionType: {
        type: String,
        enum: ['info', 'warning', 'clinical', 'technical', 'pathophysiology', 'stages', 'diagnostics', 'management', 'architecture', 'metrics'],
        default: 'info'
    }
});

const galleryItemSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    caption: { type: String },
    category: { type: String } // e.g., "Retinal Imaging", "Clinical Gallery"
});

const medicalResourceSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['stage', 'primer', 'protocol', 'methodology'],
        index: true
    },
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String
    },
    description: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String // Main image for stages or header image
    },
    stageLevel: {
        type: String // e.g., "STAGE 01"
    },
    highlight: {
        type: Boolean,
        default: false
    },
    order: {
        type: Number,
        default: 0
    },
    sections: [sectionSchema],
    gallery: [galleryItemSchema],
    metadata: {
        accuracy: String,
        version: String,
        frequency: String,
        target: String
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('MedicalResource', medicalResourceSchema);
