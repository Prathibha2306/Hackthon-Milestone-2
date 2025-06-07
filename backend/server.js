
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose'); // Import Mongoose
const app = express();
const PORT = process.env.PORT || 5000;

// --- MongoDB Connection ---
const MONGODB_URI = 'mongodb://localhost:27017/military_welfare_db'; // Your local MongoDB URI
// If using MongoDB Atlas, replace with your Atlas connection string:
// const MONGODB_URI = 'mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/military_welfare_db?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

app.use(cors());
app.use(express.json());

// =========================================================
// Mongoose Schemas and Models
// =========================================================

// User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['family', 'officer', 'admin'], default: 'family' },
    createdAt: { type: Date, default: Date.now }
});

// Pre-save hook to hash password before saving a new user
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) { // Only hash if password is new or modified
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', UserSchema);

// Scheme Schema
const SchemeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    eligibility: { type: String, required: true },
    category: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const Scheme = mongoose.model('Scheme', SchemeSchema);

// Application Schema
const ApplicationSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Store user's email or ID
    schemeId: { type: String, required: true },
    schemeName: { type: String, required: true },
    notes: { type: String },
    status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    appliedAt: { type: Date, default: Date.now }
});
const Application = mongoose.model('Application', ApplicationSchema);

// Emergency Contact Schema
const EmergencyContactSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    relationship: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
const EmergencyContact = mongoose.model('EmergencyContact', EmergencyContactSchema);

// Marketplace Listing Schema
const MarketplaceListingSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    type: { type: String, enum: ['book', 'equipment', 'housing'], required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    contactInfo: { type: String, required: true },
    postedAt: { type: Date, default: Date.now }
});
const MarketplaceListing = mongoose.model('MarketplaceListing', MarketplaceListingSchema);

// Grievance Schema
const GrievanceSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    subject: { type: String, required: true },
    details: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    status: { type: String, enum: ['Open', 'In Progress', 'Resolved', 'Rejected'], default: 'Open' },
    filedAt: { type: Date, default: Date.now },
    resolvedAt: { type: Date } // Date when grievance was resolved/rejected
});
const Grievance = mongoose.model('Grievance', GrievanceSchema);

// =========================================================
// Initial Data Population (Optional - for testing)
// This will add initial data ONLY if the collections are empty.
// =========================================================
async function populateInitialData() {
    try {
        const schemeCount = await Scheme.countDocuments();
        if (schemeCount === 0) {
            await Scheme.insertMany([
                { name: "Educational Grant", description: "Financial assistance for children's education.", eligibility: "All ranks, minimum 2 years service", category: "Education" },
                { name: "Medical Aid for Dependents", description: "Coverage for medical expenses of family members.", eligibility: "All ranks", category: "Health" },
                { name: "Housing Subsidy", description: "Support for home purchase or construction.", eligibility: "Officers and JCOs, minimum 10 years service", category: "Housing" },
                { name: "Directorate General Resettlement (DGR) Schemes", description: "Promotes resettlement opportunities for ex-servicemen through training and employment initiatives.", eligibility: "Ex-servicemen seeking employment or entrepreneurial opportunities.", category: "Resettlement" }
            ]);
            console.log('Initial schemes populated.');
        }

        const marketplaceCount = await MarketplaceListing.countDocuments();
        if (marketplaceCount === 0) {
            await MarketplaceListing.insertMany([
                { userId: 'admin@example.com', type: 'book', title: 'Old Engineering Textbooks', description: 'Collection of engineering textbooks. Good condition.', contactInfo: 'admin@example.com' },
                { userId: 'officer@example.com', type: 'housing', title: '2BHK Apartment for Rent', description: 'Spacious 2BHK apartment near cantonment area. Available from next month.', contactInfo: 'officer@example.com' }
            ]);
            console.log('Initial marketplace listings populated.');
        }

        const grievanceCount = await Grievance.countDocuments();
        if (grievanceCount === 0) {
            await Grievance.insertMany([
                { userId: 'family@example.com', subject: 'Delay in Pension Disbursement', details: 'My father\'s pension has been delayed for the last two months. Need urgent assistance.', priority: 'high', status: 'Open' },
                { userId: 'officer@example.com', subject: 'Issue with ECHS Card Renewal', details: 'Facing problems with ECHS card renewal online portal. It shows an error every time.', priority: 'medium', status: 'Open' }
            ]);
            console.log('Initial grievances populated.');
        }

        const userCount = await User.countDocuments();
        if (userCount === 0) {
            // Create dummy users with hashed passwords
            const adminPassword = await bcrypt.hash('password', 10);
            const officerPassword = await bcrypt.hash('password', 10);
            const familyPassword = await bcrypt.hash('password', 10);

            await User.insertMany([
                { email: 'admin@example.com', password: adminPassword, role: 'admin' },
                { email: 'officer@example.com', password: officerPassword, role: 'officer' },
                { email: 'family@example.com', password: familyPassword, role: 'family' }
            ]);
            console.log('Initial dummy users populated.');
        }

    } catch (error) {
        console.error('Error populating initial data:', error);
    }
}

// Call populateInitialData after MongoDB connection is established
mongoose.connection.on('connected', () => {
    populateInitialData();
});

// =========================================================
// AUTHENTICATION ROUTES
// =========================================================

// Registration Route
app.post('/api/register', async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const newUser = new User({ email, password, role }); // Mongoose will hash password via pre-save hook
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!', user: { id: newUser._id, email: newUser.email, role: newUser.role } });
    } catch (error) {
        if (error.code === 11000) { // Duplicate key error (email already exists)
            return res.status(409).json({ message: 'User with this email already exists.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }
        res.status(200).json({ message: 'Logged in successfully!', user: { id: user._id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

// =========================================================
// SCHEMES API ROUTES
// =========================================================

// Get all schemes
app.get('/api/schemes', async (req, res) => {
    try {
        const schemes = await Scheme.find({});
        res.json(schemes);
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ message: 'Server error fetching schemes.' });
    }
});

// Add a new scheme (Admin only)
app.post('/api/schemes', async (req, res) => {
    const { name, description, eligibility, category } = req.body;
    try {
        const newScheme = new Scheme({ name, description, eligibility, category });
        await newScheme.save();
        res.status(201).json({ message: 'Scheme added successfully', scheme: newScheme });
    } catch (error) {
        console.error('Error adding scheme:', error);
        res.status(500).json({ message: 'Server error adding scheme.' });
    }
});

// Delete a scheme (Admin only)
app.delete('/api/schemes/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Scheme.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Scheme deleted successfully' });
        } else {
            res.status(404).json({ message: 'Scheme not found' });
        }
    } catch (error) {
        console.error('Error deleting scheme:', error);
        res.status(500).json({ message: 'Server error deleting scheme.' });
    }
});

// =========================================================
// GRIEVANCES API ROUTES
// =========================================================

// Get all grievances (for Admin)
app.get('/api/grievances', async (req, res) => {
    try {
        const grievances = await Grievance.find({});
        res.json(grievances);
    } catch (error) {
        console.error('Error fetching grievances:', error);
        res.status(500).json({ message: 'Server error fetching grievances.' });
    }
});

// Update grievance status (Admin only)
app.patch('/api/grievances/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !['In Progress', 'Resolved', 'Rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided' });
    }

    try {
        const updateData = { status };
        if (status === 'Resolved' || status === 'Rejected') {
            updateData.resolvedAt = new Date();
        } else {
            updateData.$unset = { resolvedAt: 1 }; // Remove resolvedAt if status changes back
        }

        const updatedGrievance = await Grievance.findByIdAndUpdate(id, updateData, { new: true });
        if (updatedGrievance) {
            res.status(200).json({ message: 'Grievance status updated successfully', grievance: updatedGrievance });
        } else {
            res.status(404).json({ message: 'Grievance not found' });
        }
    } catch (error) {
        console.error('Error updating grievance status:', error);
        res.status(500).json({ message: 'Server error updating grievance status.' });
    }
});

// =========================================================
// MARKETPLACE API ROUTES
// =========================================================

// Get all marketplace listings (for Admin or general view)
app.get('/api/marketplace', async (req, res) => {
    try {
        const listings = await MarketplaceListing.find({});
        res.json(listings);
    } catch (error) {
        console.error('Error fetching marketplace listings:', error);
        res.status(500).json({ message: 'Server error fetching marketplace listings.' });
    }
});

// Delete a marketplace listing (Admin only - acts as "sold out" or removal)
app.delete('/api/marketplace/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await MarketplaceListing.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Marketplace listing deleted successfully' });
        } else {
            res.status(404).json({ message: 'Marketplace listing not found' });
        }
    } catch (error) {
        console.error('Error deleting marketplace listing:', error);
        res.status(500).json({ message: 'Server error deleting marketplace listing.' });
    }
});

// =========================================================
// GENERAL ROUTES (for other frontend sections)
// =========================================================

// Get applications (can be filtered by userId in a real app)
app.get('/api/applications', async (req, res) => {
    try {
        // For simplicity, fetching all. In a real app, you'd add query params for userId.
        const applications = await Application.find({});
        res.json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ message: 'Server error fetching applications.' });
    }
});

// Add new application
app.post('/api/applications', async (req, res) => {
    const { userId, schemeId, schemeName, notes } = req.body;
    try {
        const newApplication = new Application({ userId, schemeId, schemeName, notes });
        await newApplication.save();
        res.status(201).json({ message: 'Application submitted successfully', application: newApplication });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(500).json({ message: 'Server error submitting application.' });
    }
});

// Get emergency contacts for a specific user
app.get('/api/users/:userId/emergency-contacts', async (req, res) => {
    const { userId } = req.params;
    try {
        const userContacts = await EmergencyContact.find({ userId });
        res.json(userContacts);
    } catch (error) {
        console.error('Error fetching emergency contacts:', error);
        res.status(500).json({ message: 'Server error fetching emergency contacts.' });
    }
});

// Add emergency contact
app.post('/api/emergency-contacts', async (req, res) => {
    const { userId, name, phone, relationship } = req.body;
    try {
        const newContact = new EmergencyContact({ userId, name, phone, relationship });
        await newContact.save();
        res.status(201).json({ message: 'Contact added successfully', contact: newContact });
    } catch (error) {
        console.error('Error adding contact:', error);
        res.status(500).json({ message: 'Server error adding contact.' });
    }
});

// Update emergency contact
app.patch('/api/emergency-contacts/:id', async (req, res) => {
    const { id } = req.params;
    const { name, phone, relationship } = req.body;
    try {
        const updatedContact = await EmergencyContact.findByIdAndUpdate(id, { name, phone, relationship }, { new: true });
        if (updatedContact) {
            res.status(200).json({ message: 'Contact updated successfully', contact: updatedContact });
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error updating contact:', error);
        res.status(500).json({ message: 'Server error updating contact.' });
    }
});

// Delete emergency contact
app.delete('/api/emergency-contacts/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await EmergencyContact.findByIdAndDelete(id);
        if (result) {
            res.status(200).json({ message: 'Contact deleted successfully' });
        } else {
            res.status(404).json({ message: 'Contact not found' });
        }
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ message: 'Server error deleting contact.' });
    }
});

// A simple root endpoint for testing if the server is running
app.get('/', (req, res) => {
    res.send('Military Welfare Backend API is running!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend server listening on port ${PORT}`);
    console.log(`Access at http://localhost:${PORT}`);
    console.log(`--- API Endpoints ---`);
    console.log(`  Auth: POST /api/register, POST /api/login`);
    console.log(`  Schemes: GET /api/schemes, POST /api/schemes, DELETE /api/schemes/:id`);
    console.log(`  Grievances: GET /api/grievances, POST /api/grievances, PATCH /api/grievances/:id/status`);
    console.log(`  Marketplace: GET /api/marketplace, POST /api/marketplace, DELETE /api/marketplace/:id, PATCH /api/marketplace/:id`);
    console.log(`  Applications: GET /api/applications, POST /api/applications`);
    console.log(`  Emergency Contacts: GET /api/users/:userId/emergency-contacts, POST /api/emergency-contacts, PATCH /api/emergency-contacts/:id, DELETE /api/emergency-contacts/:id`);
});