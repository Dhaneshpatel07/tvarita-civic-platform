import Issue from '../models/Issue.js';
import Metric from '../models/Metric.js';
import { cloudinary } from '../config/cloudinary.js';
import { getDistanceInMeters, calculatePriority } from '../utils/mathUtils.js';
import { analyzeImageContent } from '../services/aiService.js';
import { sendPushNotification } from '../services/notificationService.js';

// @desc    Create a new issue
export const createIssue = async (req, res) => {
  try {
    const { title, description, category, longitude, latitude, address, forceSubmit, imageBase64 } = req.body;
    
    let imageUrl = null;
    if (imageBase64) {
        console.log("Processing base64 image upload...");
        
        // Ensure proper data URI prefix
        let base64Data = imageBase64;
        if (!imageBase64.startsWith('data:')) {
            base64Data = `data:image/jpeg;base64,${imageBase64}`;
        }
        
        const uploadRes = await cloudinary.uploader.upload(base64Data, {
           folder: 'civic_issues',
           resource_type: 'image'
        });
        imageUrl = uploadRes.secure_url;
    }

    const lat = parseFloat(latitude) || 0;
    const lon = parseFloat(longitude) || 0;

    // 20-Meter Geospatial Duplicate Check
    const isForced = forceSubmit === true || forceSubmit === 'true';
    if (!isForced && lat !== 0 && lon !== 0) {
      console.log("🌍 Checking for duplicates within 20m...");
      const duplicate = await Issue.findOne({
        status: { $in: ['Open', 'In Progress'] },
        location: {
           $near: {
             $geometry: { type: 'Point', coordinates: [lon, lat] },
             $maxDistance: 50 
           }
        }
      });

      if (duplicate) {
        console.log("⚠️ Duplicate found:", duplicate._id);
        return res.status(409).json({ 
          message: `A similar issue ('${duplicate.title}') was already reported very close to this location.`,
          duplicateId: duplicate._id
        });
      }
    }

    // AI Spam Defense
    let aiCaption = null;
    if (imageUrl) {
        try {
            const aiResult = await analyzeImageContent(imageUrl, title, description);
            if (aiResult && aiResult.isValid === false) {
                return res.status(400).json({ 
                    message: `🤖 AI Blocked: Visual analysis securely flagged this content as non-civic. Detected: "${aiResult.caption || 'Unsuitable content'}"` 
                });
            }
            aiCaption = aiResult?.caption || "Civic context verified";
        } catch (aiError) {
            console.warn("🛡️ AI Safe-Bailout Activated:", aiError.message);
            aiCaption = "Verification bypassed for service resilience";
        }
    }

    const issue = new Issue({
      title,
      description,
      category: category || 'Other',
      priority: calculatePriority(category || 'Other', 0),
      location: {
        type: 'Point',
        coordinates: [lon, lat],
        address,
      },
      imageUrl,
      aiCaption: aiCaption,
      citizen: req.user?._id, 
    });

    if (!issue.citizen) {
        throw new Error("Citizen identity could not be verified from request context.");
    }

    const createdIssue = await issue.save();
    res.status(201).json(createdIssue);
  } catch (error) {
    console.error("❌ Issue Creation Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user's issues
export const getMyIssues = async (req, res) => {
  try {
    const issues = await Issue.find({ citizen: req.user._id }).sort({ createdAt: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues within a physical radius
export const getNearbyIssues = async (req, res) => {
  try {
    const { lat, lng, radius } = req.query;
    if (!lat || !lng) return res.status(400).json({ message: 'GPS coordinates required.' });

    const maxDistance = parseInt(radius) || 5000; // 5km default
    
    const issues = await Issue.find({
      location: {
         $near: {
           $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
           $maxDistance: maxDistance
         }
      }
    }).populate('citizen', 'name email').sort({ createdAt: -1 });

    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unprotected gamified statistical aggregation
export const getPublicMetrics = async (req, res) => {
  try {
    const activeIssues = await Issue.countDocuments();
    const potholeCount = await Issue.countDocuments({ category: 'Pothole' });
    
    let stats = await Metric.findOne({});
    if (!stats) stats = { globalResolvedCount: 0, historicUpvotes: 0 };

    const resolvedIssues = stats.globalResolvedCount;
    const totalIssues = activeIssues + resolvedIssues;
    
    const allIssues = await Issue.find({}, 'upvotes');
    let totalCommunityUpvotes = stats.historicUpvotes;
    allIssues.forEach(issue => totalCommunityUpvotes += (issue.upvotes ? issue.upvotes.length : 0));

    res.json({
      total: totalIssues,
      resolved: resolvedIssues,
      potholes: potholeCount,
      communityEngagement: totalCommunityUpvotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all issues
export const getAllIssues = async (req, res) => {
  try {
    const issues = await Issue.find({}).sort({ createdAt: -1 }).populate('citizen', 'name email');
    res.json(issues);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update issue status (Admin only)
export const updateIssueStatus = async (req, res) => {
  try {
    const { status, priority } = req.body;
    const issue = await Issue.findById(req.params.id).populate('citizen');

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    if (status === 'Resolved') {
      // 1. Terminate the Cloudinary asset
      if (issue.imageUrl) {
        try {
           const parts = issue.imageUrl.split('/');
           const filename = parts[parts.length - 1];
           const rawId = filename.split('.')[0];
           const publicId = `civic_issues/${rawId}`;
           await cloudinary.uploader.destroy(publicId);
           console.log(`☁️ Cloudinary Asset Purged: ${publicId}`);
        } catch(e) { 
           console.error("Cloudinary purge fail:", e); 
        }
      }

      // 2. Fire Push Notification
      if (issue.citizen?.pushToken) {
         await sendPushNotification(
             issue.citizen.pushToken, 
             'Tvarita Notice 🚨', 
             `Your civic report "${issue.title}" has been completely resolved and scrubbed!`, 
             { id: issue._id, status: 'Resolved' }
         );
      }

      // 3. Persist Historical Accumulation Score
      await Metric.findOneAndUpdate(
          {}, 
          { 
            $inc: { 
              globalResolvedCount: 1, 
              historicUpvotes: issue.upvotes ? issue.upvotes.length : 0 
            } 
          }, 
          { upsert: true, new: true }
      );

      // 4. Atomically purge from MongoDB
      await Issue.findByIdAndDelete(issue._id);
      console.log(`🗑️ Database Document Purged: ${issue._id}`);

      const ghostIssue = issue.toObject();
      ghostIssue.status = 'Resolved';
      return res.json(ghostIssue);
    }

    // Execution flows here if status is ANYTHING ELSE (e.g. 'In Progress', 'Open')
    if (status) issue.status = status;
    if (priority) issue.priority = priority;
    const updatedIssue = await issue.save();

    // Trigger Push Notification
    if (updatedIssue.citizen?.pushToken) {
        await sendPushNotification(
            updatedIssue.citizen.pushToken, 
            'Tvarita Notice 🚨', 
            `Your civic report "${updatedIssue.title}" status is now: ${status}!`, 
            { id: updatedIssue._id, status: status }
        );
    }

    res.json(updatedIssue);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upvote an issue physically
export const upvoteIssue = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
       return res.status(400).json({ message: 'Live GPS coordinates are required to physically verify upvotes.'});
    }

    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    const issueLon = issue.location.coordinates[0];
    const issueLat = issue.location.coordinates[1];

    const distance = getDistanceInMeters(latitude, longitude, issueLat, issueLon);

    if (distance > 100) {
      return res.status(403).json({ 
         message: `Verification Zone Failed! You are ${Math.round(distance)} meters away. GPS verification requires being within 100m for this demo.` 
      });
    }

    if (issue.upvotes.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already upvoted' });
    }

    issue.upvotes.push(req.user._id);
    
    // Auto-Priority Recalculation Engine
    issue.priority = calculatePriority(issue.category, issue.upvotes.length);
    const savedIssue = await issue.save();
    
    res.json({ 
       message: 'Issue physically upvoted successfully', 
       upvotesCount: savedIssue.upvotes.length,
       autoPriority: savedIssue.priority
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
