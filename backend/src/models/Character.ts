import mongoose, { Document, Schema } from 'mongoose';

export interface ICharacter extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  level: number;
  experience: number;
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  stamina: number;
  maxStamina: number;
  physicalCondition: {
    activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
    lastUpdated: Date;
  };
  position: {
    x: number;
    y: number;
  };
  totalSteps: number;
  totalDistance: number;
  victories: number;
  defeats: number;
  createdAt: Date;
  updatedAt: Date;
}

const characterSchema = new Schema<ICharacter>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 2,
    maxlength: 30
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  health: {
    type: Number,
    default: 100
  },
  maxHealth: {
    type: Number,
    default: 100
  },
  attack: {
    type: Number,
    default: 10
  },
  defense: {
    type: Number,
    default: 5
  },
  stamina: {
    type: Number,
    default: 100
  },
  maxStamina: {
    type: Number,
    default: 100
  },
  physicalCondition: {
    activityLevel: {
      type: String,
      enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
      default: 'moderate'
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  position: {
    x: {
      type: Number,
      default: 0
    },
    y: {
      type: Number,
      default: 0
    }
  },
  totalSteps: {
    type: Number,
    default: 0,
    min: 0
  },
  totalDistance: {
    type: Number,
    default: 0,
    min: 0
  },
  victories: {
    type: Number,
    default: 0,
    min: 0
  },
  defeats: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
characterSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICharacter>('Character', characterSchema);
