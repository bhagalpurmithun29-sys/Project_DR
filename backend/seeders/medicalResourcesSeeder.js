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
        imageUrl: '/images/stage2.jpeg',
        order: 2,
        sections: [
            {
                title: 'Key Pathological Changes',
                points: [
                    'Increased Microaneurysms & Hemorrhages',
                    'Diffuse Widespread Vascular Damage',
                    'Worsening Blood-Retinal Barrier Leakage',
                    'Capillary Non-Perfusion (Localized Ischemia)',
                    'Venous Abnormalities (Early Hypoxia Signs)'
                ],
                sectionType: 'pathophysiology'
            },
            {
                title: 'Clinical Significance',
                points: [
                    'Indicates active disease progression',
                    'Critical risk of Diabetic Macular Edema (DME)',
                    'Progression to Severe NPDR',
                    'Transition to Proliferative DR (PDR)'
                ],
                sectionType: 'warning'
            },
            {
                title: 'Management & Strategy',
                points: [
                    'Aggressive Glycemic Control (HbA1c < 7%)',
                    'Blood Pressure Regulation',
                    'Lipid Management',
                    'Monitoring Protocol: Every 6–12 Months'
                ],
                sectionType: 'management'
            }
        ],
        gallery: [
            { imageUrl: '/images/mndpr1.jpeg', caption: 'Vascular Distortion Pattern' },
            { imageUrl: '/images/mndpr2.jpeg', caption: 'Capillary Leakage Zone' },
            { imageUrl: '/images/mndpr3.jpeg', caption: 'Diffuse Hemorrhages' },
            { imageUrl: '/images/mndpr4.jpeg', caption: 'Perfusion Deficits' },
            { imageUrl: '/images/mndpr5.jpeg', caption: 'Clinical Overview' }
        ]
    },
    {
        category: 'stage',
        title: 'Severe NPDR',
        stageLevel: 'STAGE 03',
        description: 'Extensive capillary non-perfusion; significant increase in intraretinal microvascular abnormalities and venous beading.',
        imageUrl: '/images/snpdr1.jpeg',
        order: 3,
        sections: [
            {
                title: 'Pathophysiology',
                points: [
                    'More than 20 intraretinal hemorrhages in all 4 quadrants',
                    'Venous beading present in 2 or more quadrants',
                    'Intraretinal microvascular abnormalities (IRMA) in 1+ quadrant',
                    'Significant retinal ischemia and capillary dropout'
                ],
                sectionType: 'pathophysiology'
            },
            {
                title: 'Clinical Warning Signs',
                points: [
                    '4-2-1 Rule: hallmark diagnostic criterion for Severe NPDR',
                    'Cotton wool spots indicating nerve fiber layer infarcts',
                    'Risk of progression to PDR within 1 year is ~50%',
                    'Immediate referral to a retinal specialist is recommended'
                ],
                sectionType: 'warning'
            },
            {
                title: 'Management',
                points: [
                    'Strict glycemic and blood pressure control',
                    'Anti-VEGF injections if macular edema is present',
                    'Panretinal photocoagulation (PRP) may be considered',
                    'Close monitoring every 3–4 months'
                ],
                sectionType: 'management'
            }
        ],
        gallery: [
            { imageUrl: '/images/snpdr1.jpeg', caption: 'Severe NPDR — Fundus View 1' },
            { imageUrl: '/images/sndpr2.jpeg', caption: 'Severe NPDR — Venous Beading' },
            { imageUrl: '/images/sndpr3.jpeg', caption: 'Severe NPDR — IRMA Pattern' },
            { imageUrl: '/images/sndpr4.jpeg', caption: 'Severe NPDR — Hemorrhage Quadrants' },
            { imageUrl: '/images/sndpr5.jpeg', caption: 'Severe NPDR — Capillary Dropout' },
            { imageUrl: '/images/sndpr6.jpeg', caption: 'Severe NPDR — Clinical Overview' }
        ]
    },
    {
        category: 'stage',
        title: 'Proliferative DR',
        stageLevel: 'STAGE 04',
        description: 'Advanced neovascularization with fragile new vessels prone to vitreous hemorrhage and tractional retinal detachment.',
        imageUrl: '/images/pdr1.jpeg',
        order: 4,
        highlight: true,
        sections: [
            {
                title: 'Pathophysiology',
                points: [
                    'Neovascularization of the disc (NVD) or elsewhere (NVE)',
                    'New vessels grow along posterior vitreous face',
                    'Fibrovascular proliferation causes tractional forces',
                    'VEGF overexpression drives uncontrolled angiogenesis'
                ],
                sectionType: 'pathophysiology'
            },
            {
                title: 'Critical Complications',
                points: [
                    'Vitreous hemorrhage: sudden painless visual loss',
                    'Tractional retinal detachment (TRD)',
                    'Neovascular glaucoma: elevated IOP from anterior chamber vessels',
                    'Rubeosis iridis: neovascularization of the iris'
                ],
                sectionType: 'warning'
            },
            {
                title: 'Treatment Options',
                points: [
                    'Panretinal photocoagulation (PRP): gold standard for PDR',
                    'Anti-VEGF therapy (ranibizumab, bevacizumab, aflibercept)',
                    'Pars plana vitrectomy for non-clearing vitreous hemorrhage',
                    'Surgical repair for tractional retinal detachment'
                ],
                sectionType: 'management'
            },
            {
                title: 'Prognosis',
                points: [
                    'Without treatment, 50% risk of severe vision loss in 2 years',
                    'Early laser treatment reduces severe vision loss risk by 50%',
                    'Anti-VEGF improves visual acuity in DME-associated cases',
                    'Regular follow-up every 1–3 months is essential'
                ],
                sectionType: 'clinical'
            }
        ],
        gallery: [
            { imageUrl: '/images/pdr1.jpeg', caption: 'Proliferative DR — NVD Pattern' },
            { imageUrl: '/images/pdr2.jpeg', caption: 'Proliferative DR — NVE Growth' },
            { imageUrl: '/images/pdr3.jpeg', caption: 'Proliferative DR — Vitreous Hemorrhage' },
            { imageUrl: '/images/pdr4.jpeg', caption: 'Proliferative DR — Fibrovascular Proliferation' },
            { imageUrl: '/images/pdr5.jpeg', caption: 'Proliferative DR — Tractional Features' },
            { imageUrl: '/images/pdr6.jpeg', caption: 'Proliferative DR — Advanced Stage' }
        ],
        metadata: {
            frequency: 'Immediate referral',
            target: 'Retinal Specialist / Vitreoretinal Surgeon'
        }
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
