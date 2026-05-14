import axios from 'axios';

export const analyzeImageContent = async (imageUrl, title = "", description = "") => {
  console.log("🛡️ AI Sentinel: Performing Deep Visual Analysis...");
  
  const HF_API_KEY = process.env.HF_API_KEY;
  const MODEL_URL = "https://api-inference.huggingface.co/models/Salesforce/blip-image-captioning-large";

  try {
    // Prep
    let payload;
    if (imageUrl.startsWith('http')) {
        const imageRes = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        payload = Buffer.from(imageRes.data);
    } else if (imageUrl.startsWith('data:')) {
        payload = Buffer.from(imageUrl.split(',')[1], 'base64');
    } else {
        payload = Buffer.from(imageUrl, 'base64');
    }

    // AI Call
    const response = await axios.post(MODEL_URL, 
      payload, 
      { 
        headers: { Authorization: `Bearer ${HF_API_KEY}` },
        timeout: 15000 
      }
    );

    const caption = response.data[0]?.generated_text || "";
    console.log(`🤖 AI Vision Result: "${caption}"`);

    // 2. Semantic Cross-Verification Logic
    const content = (title + " " + description + " " + caption).toLowerCase();
    
    // Restricted categories that indicate non-civic content
    const bannedTags = ['pizza', 'food', 'cat', 'dog', 'selfie', 'person', 'meme', 'interior'];
    const civicKeywords = ['road', 'street', 'water', 'garbage', 'pothole', 'light', 'wire', 'manhole', 'broken', 'trash', 'leak'];

    const hasBannedContent = bannedTags.some(tag => caption.toLowerCase().includes(tag));
    const isCivicRelated = civicKeywords.some(key => content.includes(key));

    if (hasBannedContent && !isCivicRelated) {
        return {
            isValid: false,
            caption: `Blocked: Detected "${caption}". Content appears to be non-civic/spam.`
        };
    }

    return {
        isValid: true,
        caption: caption || "Visual context verified"
    };

  } catch (error) {
    console.warn("⚠️ AI Inference Bypass (Resilience Mode):", error.message);
    
    // Fallback to basic keyword defense if AI service is down or rate-limited
    const content = (title + " " + description).toLowerCase();
    const filterList = ['pizza', 'spam', 'fake', 'random', 'selfie', 'cat', 'dog'];
    const isInvalid = filterList.some(k => content.includes(k));

    if (isInvalid) {
      return { isValid: false, caption: "Blocked: Keyword filter flagged non-civic content." };
    }

    return { isValid: true, caption: "Verified via heuristic fallback" };
  }
};
