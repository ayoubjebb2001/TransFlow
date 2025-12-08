const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 6 },
        role: { type: String, enum: ['admin', 'chauffeur'], default: 'chauffeur' }
    },
    { timestamps: true }
);

UserSchema.methods.toJSON = function toJSON() {
    const obj = this.toObject();
    delete obj.password;
    return obj;
};

module.exports = mongoose.model('User', UserSchema);
