import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, "Full name must be at least 2 characters"],
    validate: {
      validator: function (nameValue) {
        return /^[A-Za-z\s'-]+$/.test(nameValue);
      },
      message:
        'Full name can only contain letters, spaces, apostrophes, and hyphens',
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function (emailValue) {
        return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(emailValue);
      },
      message:
        'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
    minlength: [8, 'Password must be at least 8 characters'],
    maxlength: [64, "Password cannot exceed 64 characters"],
    validate: {
      validator: function (passwordValue) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])(?!.*\s).+$/.test(passwordValue);
      },
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and no spaces'
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function (phoneValue) {
        if (!phoneValue) return true;
        return /^(\+?\d{8,15})$/.test(phoneValue);
      },
      message:
        'Please enter a valid phone number'
    }
  },
  occupation: {
    type: String,
    trim: true,
    minlength: [2, "Occupation must be at least 2 characters"],
    maxlength: [50, "Occupation cannot exceed 50 characters"],
    validate: {
      validator: function (occupationValue) {
        if (!occupationValue) return true;
        return /^[A-Za-z\s'-]+$/.test(occupationValue);
      },
      message:
        'Occupation can only contain letters, spaces, apostrophes, and hyphens'
    }
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationTokenHash: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
  },
  emailVerifiedAt: {
    type: Date,
  },
  lastVerificationEmailSentAt: {
    type: Date,
  },
  privacyMode: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });


// Hash password before saving user document
userSchema.pre("save", async function () {

  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

const User = mongoose.model('User', userSchema);
export default User;
