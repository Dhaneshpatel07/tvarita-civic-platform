import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: { type: String, enum: ['citizen', 'admin'], default: 'citizen' },
    pushToken: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function (next) {
  // 🛡️ Admin Immutability Logic: Prevent modification of core Master Admin account data
  // But allow pushToken updates for notifications to work.
  const coreFields = ['name', 'email', 'password', 'role'];
  const isCoreModified = coreFields.some(field => this.isModified(field));

  if (!this.isNew && this.email === 'admin@tvarita.com' && isCoreModified) {
      const error = new Error('The Master Administrator account core data is immutable and cannot be modified.');
      return next(error);
  }

  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
