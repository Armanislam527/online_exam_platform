const mongoose = require('mongoose');

const coachingCenterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    description: String,
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String,
    },
    contact: {
        email: String,
        phone: String,
        website: String,
    },
    students: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        enrollmentDate: Date,
        status: {
            type: String,
            enum: ['active', 'inactive', 'suspended'],
            default: 'active',
        },
        paymentStatus: {
            type: String,
            enum: ['paid', 'pending', 'voucher'],
            default: 'pending',
        },
    }],
    courses: [{
        name: String,
        description: String,
        price: Number,
        duration: String,
    }],
    questionBank: [{
        category: String,
        subCategory: String,
        questions: [{
            text: String,
            options: [{
                text: String,
                isCorrect: Boolean,
            }],
            difficulty: String,
            marks: Number,
            description: String,
        }],
    }],
    notices: [{
        title: String,
        content: String,
        publishDate: Date,
        expiryDate: Date,
        targetAudience: [{
            type: String,
            enum: ['all', 'students', 'teachers', 'parents'],
        }],
    }],
    liveClasses: [{
        title: String,
        description: String,
        schedule: Date,
        duration: Number,
        instructor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        recording: {
            url: String,
            duration: Number,
            uploadDate: Date,
        },
    }],
    subscription: {
        plan: {
            type: String,
            enum: ['basic', 'premium', 'enterprise'],
            default: 'basic',
        },
        startDate: Date,
        endDate: Date,
        status: {
            type: String,
            enum: ['active', 'expired', 'cancelled'],
            default: 'active',
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const CoachingCenter = mongoose.model('CoachingCenter', coachingCenterSchema);

module.exports = CoachingCenter;
