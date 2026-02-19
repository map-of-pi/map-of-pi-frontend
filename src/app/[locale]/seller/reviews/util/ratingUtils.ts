/**
 * resolveRating Utility
 * Maps numerical rating values to human-readable reactions and unicode emojis.
 * Designed to provide fallback values to ensure UI stability across review components.
 * * @param rating - The numerical score (0-5) received from the backend.
 * @returns An object containing the reaction label and its corresponding emoji, or a default set if null/unmatched.
 */
export const resolveRating = (rating: number | null) => {
  switch (rating) {
    case 0:
      return {
        reaction: 'Despair',
        unicode: '😠'       
      };        
    case 2:
      return {
        reaction: 'Sad',
        unicode: '🙁'          
      };
    case 3:
      return {
        reaction: 'Okay',
        unicode: '🙂'
      };
    case 4:
      return {
        reaction: 'Happy',
        unicode: '😃'
      };
    case 5:
      return {
        reaction: 'Delight',
        unicode: '😍'
      };
    
    // Default case handles null, undefined, or unexpected numerical values (e.g., 1)
    // to prevent front-end rendering errors.
    default:
      return {
        reaction: 'Neutral',
        unicode: '😐'
      };
  }
};
