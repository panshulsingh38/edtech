export function calculatePredictedScore(
  totalQuestions: number,
  correctAnswers: number,
  averageConfidence: number // 0.0 to 1.0
) {
  if (totalQuestions === 0) return { min: 0, max: 0, percentile: 0 };

  const rawAccuracy = correctAnswers / totalQuestions;
  
  // Weight accuracy with confidence (penalize if they are guessing)
  const confidenceWeight = 0.7 + (averageConfidence * 0.3); // 0.7 to 1.0
  const adjustedAccuracy = rawAccuracy * confidenceWeight;

  // Assuming a 1600 scale (like SAT) for demonstration
  const baseScore = 400;
  const maxScore = 1600;
  
  const predictedRaw = baseScore + (adjustedAccuracy * (maxScore - baseScore));
  
  // Add some variance based on total questions (less questions = higher variance)
  const variance = Math.max(20, 100 - totalQuestions * 2);
  
  return {
    min: Math.max(baseScore, Math.round((predictedRaw - variance) / 10) * 10),
    max: Math.min(maxScore, Math.round((predictedRaw + variance) / 10) * 10),
    percentile: Math.round(adjustedAccuracy * 99)
  };
}
