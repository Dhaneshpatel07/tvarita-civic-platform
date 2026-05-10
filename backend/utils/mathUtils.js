// Haversine distance formula util (Calculates physical meters between two GPS coordinates)
export const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth radius in meters
  const rad = (deg) => deg * (Math.PI / 180);
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Algorithmic Priority Scoring System
export const calculatePriority = (category, upvotesCount) => {
  const categoryWeights = {
    'Waste Management': 30, // Health/Bio-hazard
    'Water Leak': 40,       // Infrastructure loss
    'Pothole': 20,          // General infrastructure
    'Streetlight': 15,      // Community safety
    'Other': 10
  };
  const baseScore = categoryWeights[category] || 10;
  // Deep-impact crowd surge calculation (+15 points physically verified)
  const totalScore = baseScore + (upvotesCount * 15);

  if (totalScore >= 80) return 'Critical';
  if (totalScore >= 50) return 'High';
  if (totalScore >= 30) return 'Medium';
  return 'Low';
};
