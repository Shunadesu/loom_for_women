import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      default: '',
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    // Passport fields
    avatar: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    },
    location: {
      type: String,
      default: '',
      trim: true,
      maxlength: 100,
    },
    zaloVerified: {
      type: Boolean,
      default: false,
    },
    passportSerial: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    badges: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Auto-generate passport serial on first save
userSchema.pre('save', function (next) {
  if (!this.passportSerial) {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    this.passportSerial = `LP-${randomNum}`;
  }
  next();
});

userSchema.methods.toSafeJSON = function () {
  return {
    _id: this._id,
    phone: this.phone,
    name: this.name,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    avatar: this.avatar,
    location: this.location,
    zaloVerified: this.zaloVerified,
    passportSerial: this.passportSerial,
    badges: this.badges,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export default mongoose.model('User', userSchema);