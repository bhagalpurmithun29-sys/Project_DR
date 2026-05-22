const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Scan = require('./models/Scan');
const Patient = require('./models/Patient');
const User = require('./models/User');

const debug = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const patients = await Patient.find({});
        console.log('Total Patients:', patients.length);
        patients.forEach(p => console.log(`Patient: ID=${p._id}, Name=${p.name}, PatientId=${p.patientId}`));

        const scans = await Scan.find({}).populate('patient').populate('diagnosisCenter').populate('referredDoctor');
        console.log('Total Scans:', scans.length);
        scans.forEach((s, idx) => {
            console.log(`Scan #${idx + 1}:`);
            console.log(`  _id: ${s._id}`);
            console.log(`  scanId: ${s.scanId}`);
            console.log(`  patientName: ${s.patient ? s.patient.name : 'null'} (ID: ${s.patient ? s.patient._id : 'null'}, PatientID: ${s.patient ? s.patient.patientId : 'null'})`);
            console.log(`  eyeSide: ${s.eyeSide}`);
            console.log(`  isBilateral: ${s.isBilateral}`);
            console.log(`  status: ${s.status}`);
            console.log(`  technician: ${s.technician}`);
            console.log(`  diagnosisCenter: ${s.diagnosisCenter ? s.diagnosisCenter.name : 'null'}`);
            console.log(`  referredDoctor: ${s.referredDoctor ? s.referredDoctor.name : 'null'}`);
            console.log(`  createdAt: ${s.createdAt}`);
            console.log('----------------------------------------------------');
        });

        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

debug();
