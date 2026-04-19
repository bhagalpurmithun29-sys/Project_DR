const mongoose = require('mongoose');
const dotenv = require('dotenv');
const MedicalResource = require('../models/MedicalResource');

dotenv.config({ path: './.env' });

const seedData = [
    // ─── DR STAGES ──────────────────────────────────────────────────────────
    {
        category: 'stage',
        title: 'Mild NPDR',
        stageLevel: 'STAGE 01',
        description: 'Presence of isolated microaneurysms; early-stage focal ballooning of retinal capillaries.',
        imageUrl: '/stage1.jpeg',
        order: 1,
        sections: [
            {
                title: 'Pathophysiology',
                points: [
                    'Localized saccular dilations of capillary walls',
                    'Usually 10–100 μm in diameter',
                    'Appear as small red dots on fundus',
                    'Located in the inner nuclear layer'
                ],
                sectionType: 'pathophysiology'
            }
        ],
        gallery: [
            { imageUrl: '/images/npdr1.jpeg', caption: 'Clinical Manifestation 1' },
            { imageUrl: '/images/npdr2.jpeg', caption: 'Clinical Manifestation 2' },
            { imageUrl: '/images/npdr3.jpeg', caption: 'Clinical Manifestation 3' }
        ]
    },
    {
        category: 'stage',
        title: 'Moderate NPDR',
        stageLevel: 'STAGE 02',
        description: 'Widespread vascular distortion and incipient leakage; compromised retinal perfusion identified.',
        imageUrl: '/stage2.jpeg',
        order: 2,
        gallery: [
            { imageUrl: '/images/mndpr1.jpeg' },
            { imageUrl: '/images/mndpr2.jpeg' },
            { imageUrl: '/images/mndpr3.jpeg' }
        ]
    },
    {
        category: 'stage',
        title: 'Severe NPDR',
        stageLevel: 'STAGE 03',
        description: 'Extensive capillary non-perfusion; significant increase in intraretinal microvascular abnormalities.',
        imageUrl: '/stage3.jpeg',
        order: 3
    },
    {
        category: 'stage',
        title: 'Proliferative DR',
        stageLevel: 'STAGE 04',
        description: 'Advanced neovascularization; fragile vessels prone to vitreous hemorrhage and tractional detachment.',
        imageUrl: '/stage4.jpeg',
        order: 4,
        highlight: true
    },

    // ─── EDUCATIONAL MODALS ────────────────────────────────────────────────
    {
        category: 'primer',
        title: 'Diagnostic Primer',
        description: 'Diabetic retinopathy manifests through microvascular deterioration in the retinal tissue.',
        order: 1,
        sections: [
            {
                title: 'Overview',
                content: 'Diabetic retinopathy is a microvascular complication of diabetes mellitus that affects the retina.',
                sectionType: 'info'
            }
        ],
        gallery: [
            { imageUrl: '/images/dpp1.jpeg', category: 'Retinal Imaging' },
            { imageUrl: '/images/dpp2.jpeg', category: 'Retinal Imaging' },
            { imageUrl: '/images/dpp3.jpeg', category: 'Retinal Imaging' },
            { imageUrl: '/images/dpp4.jpeg', category: 'Retinal Imaging' }
        ]
    },
    {
        category: 'protocol',
        title: 'Prevention Protocol',
        description: 'Optimal glycemic control and regular blood pressure monitoring are the cornerstones of preventing disease progression.',
        order: 2,
        gallery: [
            { imageUrl: '/images/ppp1.jpeg' },
            { imageUrl: '/images/ppp2.jpeg' },
            { imageUrl: '/images/ppp3.jpeg' },
            { imageUrl: '/images/ppp4.jpeg' },
            { imageUrl: '/images/ppp5.jpeg' },
            { imageUrl: '/images/ppp6.jpeg' }
        ]
    },
    {
        category: 'methodology',
        title: 'AI Methodology',
        description: 'RetinaAI leverages deep convolutional neural networks to identify subtle lesion patterns.',
        order: 3,
        metadata: {
            accuracy: '98.4%',
            version: '2.4.1'
        },
        gallery: [
            { imageUrl: '/images/aim1.jpeg' },
            { imageUrl: '/images/aim2.jpeg' },
            { imageUrl: '/images/aim3.jpeg' },
            { imageUrl: '/images/aim4.jpeg' },
            { imageUrl: '/images/aim5.jpeg' },
            { imageUrl: '/images/aim6.jpeg' },
            { imageUrl: '/images/aim7.jpeg' },
            { imageUrl: '/images/aim8.jpeg' }
        ]
    }
];

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        await MedicalResource.deleteMany({});
        console.log('Cleared existing medical resources.');

        await MedicalResource.insertMany(seedData);
        console.log('Successfully seeded medical resources!');

        process.exit();
    } catch (err) {
        console.error('Seeding error:', err);
        process.exit(1);
    }
};

seedDB();
