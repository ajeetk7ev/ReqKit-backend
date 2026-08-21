import mongoose from 'mongoose';

const keyValuePairSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      trim: true,
      default: '',
    },
    value: {
      type: String,
      default: '',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
  },
  { _id: false }
);

const pathParamSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      trim: true,
      required: true,
    },
    value: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const requestSchema = new mongoose.Schema(
  {
    collectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Collection',
      required: [true, 'Collection ID is required'],
      index: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Request name is required'],
      trim: true,
      maxlength: [150, 'Request name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    method: {
      type: String,
      enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      default: 'GET',
      required: true,
    },
    url: {
      type: String,
      required: [true, 'Request URL is required'],
      trim: true,
    },
    headers: [keyValuePairSchema],
    queryParams: [keyValuePairSchema],
    pathParams: [pathParamSchema],
    auth: {
      type: {
        type: String,
        enum: ['none', 'bearer', 'basic', 'apikey', 'inherit'],
        default: 'inherit',
      },
      config: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    body: {
      type: {
        type: String,
        enum: ['none', 'json', 'form-data', 'x-www-form-urlencoded', 'raw'],
        default: 'none',
      },
      rawContent: {
        type: String,
        default: '',
      },
      formData: [keyValuePairSchema],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying requests inside collection/folder efficiently
requestSchema.index({ collectionId: 1, folderId: 1 });

const Request = mongoose.model('Request', requestSchema);

export default Request;
