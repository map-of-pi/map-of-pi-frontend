export default function () {
	// Fetch and display the business name and dish details
	document.addEventListener('DOMContentLoaded', () => {
		fetchOrderCompletionDetails();

	// Set up event listeners for navigation buttons
	const backButton = document.querySelector('.order-complete__header-back-button');
	backButton.addEventListener('click', navigateBack);

	const backToStoreButton = document.querySelector('.order-complete__back-to-store-button');
	backToStoreButton.addEventListener('click', navigateToStore);
	});

	function fetchOrderCompletionDetails() {
		// Fetch teh details from the backend
		// Update the business name and dish img src attribute
		const businessNameElement = document.querySelector('.order-complete__business-name');
		const dishImageElement = document.querySelector('order-complete__dish-image');
	}

		function navigateBack() {
			// handle the back navigation
			window.history.back();
		}

		function navigateToStore() {
			// Handle the navigation to the store
			window.location.href = '/store';
		}
}