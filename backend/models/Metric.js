import mongoose from 'mongoose';

const metricSchema = new mongoose.Schema({
  globalResolvedCount: { type: Number, default: 0 },
  historicUpvotes: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.models.Metric || mongoose.model('Metric', metricSchema);
