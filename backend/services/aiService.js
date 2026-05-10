export const analyzeImageContent = async (imageUrl, title = "", description = "") => {
  console.log("Analyzing report content for civic relevance...");
  
  // Basic keyword-based filtering for the prototype
  const content = (title + " " + description).toLowerCase();
  const filterList = ['pizza', 'spam', 'test', 'fake', 'random', 'selfie', 'cat', 'dog'];
  const isInvalid = filterList.some(k => content.includes(k));

  if (isInvalid) {
    console.log("Validation failed: Non-civic content detected.");
    return {
      isValid: false,
      caption: "Blocked: Non-civic content detected."
    };
  }

  // Processing delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
      caption: "Civic Infrastructure Issue Detected",
      isValid: true
  };
};
