import mongoose, { Document, Schema } from 'mongoose';

export interface ICombat extends Document {
  userId: mongoose.Types.ObjectId;
  enemyName: string;
  enemyLevel: number;
  enemyHealth: number;
  enemyMaxHealth: number;
  enemyAttack: number;
  enemyDefense: number;
  playerHealthAtStart: number;
  playerHealthCurrent: number;
  status: 'active' | 'victory' | 'defeat';
  experienceGained: number;
  turn: number;
  createdAt: Date;
  updatedAt: Date;
}

const combatSchema = new Schema<ICombat>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  enemyName: {
    type: String,
    required: true
  },
  enemyLevel: {
    type: Number,
    required: true,
    min: 1
  },
  enemyHealth: {
    type: Number,
    required: true
  },
  enemyMaxHealth: {
    type: Number,
    required: true
  },
  enemyAttack: {
    type: Number,
    required: true
  },
  enemyDefense: {
    type: Number,
    required: true
  },
  playerHealthAtStart: {
    type: Number,
    required: true
  },
  playerHealthCurrent: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'victory', 'defeat'],
    default: 'active'
  },
  experienceGained: {
    type: Number,
    default: 0
  },
  turn: {
    type: Number,
    default: 1
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

export default mongoose.model<ICombat>('Combat', combatSchema);
