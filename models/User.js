import mongoose from "mongoose";

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
    }
});

const User = mongoose.model('User', userSchema);
export default User;
