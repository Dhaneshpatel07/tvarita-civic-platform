// Haversine distance formula util (Calculates physical meters between two GPS coordinates)
export const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return Infinity; // Safety: Missing GPS shouldn't crash the server
  const R = 6371e3; 
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Algorithmic Priority Scoring System (Heavily weighted towards Human Life Risk)
export const calculatePriority = (category, upvotesCount = 0, title = "", description = "") => {
  const categoryWeights = {
    'Hazardous Waste': 85,
    'Electric Hazard': 95,
    'Open Manhole': 90,
    'Water Leak': 45,
    'Pothole': 35,
    'Streetlight': 25,
    'Waste Management': 20,
    'Other': 15
  };

  let baseScore = categoryWeights[category] || 15;

  // 🛡️ High-Risk Keyword Interception (Bypasses category if specific danger is detected)
  const dangerKeywords = ['electric', 'wire', 'manhole', 'dead', 'fire', 'danger', 'hospital', 'child', 'broken', 'collapsed'];
  const content = (title + " " + description).toLowerCase();
  
  if (dangerKeywords.some(k => content.includes(k))) {
      console.log("🚨 Life-Risk Keyword Detected. Escalating base score.");
      baseScore = Math.max(baseScore, 80); 
  }

  const totalScore = baseScore + (upvotesCount * 12);

  if (totalScore >= 90) return 'Critical';
  if (totalScore >= 70) return 'High';
  if (totalScore >= 40) return 'Medium';
  return 'Low';
};
