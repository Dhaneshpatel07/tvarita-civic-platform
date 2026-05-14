import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['Pothole', 'Streetlight', 'Water Leak', 'Waste Management', 'Open Manhole', 'Electric Hazard', 'Other'],
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: {
        type: String,
      },
    },
    imageUrl: {
      type: String,
    },
    aiCaption: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved'],
      default: 'Open',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexing for geospatial queries
issueSchema.index({ location: '2dsphere' });

const Issue = mongoose.model('Issue', issueSchema);
export default Issue;
