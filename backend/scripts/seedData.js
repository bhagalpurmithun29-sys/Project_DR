const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Patient = require('../models/Patient');
const Scan = require('../models/Scan');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data
        await User.deleteMany({ email: 'j.doe@example.com' });
        await Patient.deleteMany({ email: 'j.doe@example.com' });

        // Create a user for the patient
        const user = await User.create({
            name: 'John Doe',
            email: 'j.doe@example.com',
            password: 'password123', // This will be hashed by the model
            role: 'patient'
        });

        // Create patient profile
        const patient = await Patient.create({
            user: user._id,
            name: 'John Doe',
            age: 62,
            gender: 'Male',
            diabetesType: 'Type 2 Diabetes',
            hba1c: 7.8,
            lastExamDate: new Date('2023-10-24'),
            riskLevel: 'High',
            email: 'j.doe@example.com',
        });

        // Create some scans for the patient
        await Scan.create([
            {
                patient: patient._id,
                date: new Date('2023-10-24'),
                aiResult: 'Moderate NPDR',
                lesionCount: 18,
                technician: 'Mark Jenkins',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcLRgK6WvGLdVvPCzxkizys_gGQcgeuz0nappDRKs5ZgwqPl-9gLJWOM3WTMSJR-4baUOVv4zbdJnimRchr1v3AYc_HuwG8I8N_TMZeKeBhED-CgHERQ0iR7p65IIZyQGyfd7_0bkg17VEyAX0egaa8gxGZ5jSW6t0DbuYLQ_LQzMWJ87EclevYjsw2nQvQ4XTgHQTJYglQBNRsfsJsRFoZGrKtW4aIypQwHUvFUJNufuNiJwLG8yJxF1sPiipj3BYPYFTq5BOBZPY',
                status: 'Reviewed',
                eyeSide: 'OD',
                scanId: 'SCN-7721',
                insights: [
                    { type: 'high_risk', message: 'Microaneurysm count increased by 12% compared to the previous scan on Jul 12.' },
                    { type: 'info', message: 'No signs of Neovascularization or Vitreous Hemorrhage detected at this stage.' },
                    { type: 'action', message: 'Recommended follow-up: In 3 Months due to moderate progression risk.' }
                ],
                clinicalNotes: 'Patient reports consistent glycemic control but mentioned blurred vision in evening. Recommend OCT scan for macular edema screening.'
            },
            {
                patient: patient._id,
                date: new Date('2023-07-12'),
                aiResult: 'Mild NPDR',
                lesionCount: 12,
                technician: 'Sarah Connor',
                imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDcLRgK6WvGLdVvPCzxkizys_gGQcgeuz0nappDRKs5ZgwqPl-9gLJWOM3WTMSJR-4baUOVv4zbdJnimRchr1v3AYc_HuwG8I8N_TMZeKeBhED-CgHERQ0iR7p65IIZyQGyfd7_0bkg17VEyAX0egaa8gxGZ5jSW6t0DbuYLQ_LQzMWJ87EclevYjsw2nQvQ4XTgHQTJYglQBNRsfsJsRFoZGrKtW4aIypQwHUvFUJNufuNiJwLG8yJxF1sPiipj3BYPYFTq5BOBZPY',
                status: 'Reviewed',
                eyeSide: 'OS',
                scanId: 'SCN-6612'
            }
        ]);

        console.log('Data seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
