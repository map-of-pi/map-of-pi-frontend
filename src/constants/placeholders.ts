/**
 * Default prompts and placeholders for review-related forms.
 * Used to guide the user when providing feedback for a transaction.
 */
export const reviewPrompt = {
    comment: 'Type in your review comments',
    image: '/android-chrome-192x192.png',  // TODO: Change to official Map of Pi logo image
};

/**
 * Default initialization values for the Seller Registration flow.
 * Ensures form stability by providing fallback UI strings.
 */
export const sellerPrompt = {
    name: 'Type in your seller name',
    type: 'Pioneer',
    sale_items: 'Description of seller & items for sale with pi price, etc.',
    address: 'Help your Buyers find you by describing your address or whereabouts',
    description: 'I sell items via Pay with Pi.',
    image: '/android-chrome-192x192.png'  // TODO: Change to official Map of Pi logo image
};

// ========================
// PAGINATION & LOADING UI
// ========================

/**
 * Standardized placeholders for infinite scrolling and paginated lists.
 * Provides consistent UI feedback across Orders, Sale Items, and Reviews.
 */
export const paginationPlaceholders = {
    loading: 'Loading more items...',
    noMoreData: 'You have reached the end of the list.',
    noDataFound: 'No items available at the moment.',
    errorFetching: 'Failed to load data. Please try again.'
};
