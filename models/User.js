import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User ID is required'],
    trim: true,
    uppercase: true
  },
  email: { 
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
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
    validate: {
      validator: function (passwordValue) {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(passwordValue);
      },
        message: 
          'Password must consist of at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  },
  phoneNumber: {
    type: String,
    trim: true,
    validate: {
      validator: function(phoneValue) {
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
      validator: function(occupationValue) {
        if (!occupationValue) return true;
        return /^[A-Za-z\s'-]+$/.test(occupationValue);
      },
        message: 
          'Occupation can only contain letters'
    }
  }
});

// Hash password before saving user document
userSchema.pre("save", async function(next) {

  if (!this.isModified("password")) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 12);
    next();

  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('User', userSchema);
export default User;
