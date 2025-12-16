import mongoose, { Document, Schema } from 'mongoose';

export interface IActivity extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: 'walking' | 'running' | 'exercise' | 'other';
  steps: number;
  distance: number;
  duration: number;
  calories: number;
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

const activitySchema = new Schema<IActivity>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: ['walking', 'running', 'exercise', 'other'],
    required: true
  },
  steps: {
    type: Number,
    default: 0,
    min: 0
  },
  distance: {
    type: Number,
    default: 0,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  calories: {
    type: Number,
    default: 0,
    min: 0
  },
  location: {
    latitude: {
      type: Number
    },
    longitude: {
      type: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IActivity>('Activity', activitySchema);
