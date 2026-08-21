import mongoose from 'mongoose';

const responseExampleSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Request',
      required: [true, 'Request ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Response example title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    type: {
      type: String,
      enum: ['success', 'error'],
      required: [true, 'Response type (success or error) is required'],
      index: true,
    },
    statusCode: {
      type: Number,
      required: [true, 'HTTP status code is required'],
    },
    statusText: {
      type: String,
      default: '',
    },
    headers: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    body: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    sizeBytes: {
      type: Number,
      default: 0,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficiently listing examples for a request by type
responseExampleSchema.index({ requestId: 1, type: 1 });

const ResponseExample = mongoose.model('ResponseExample', responseExampleSchema);

export default ResponseExample;
