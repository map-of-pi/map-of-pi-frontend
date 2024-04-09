export default function () {
    
    /**
     * Initializes event listeners once the DOM is fully loaded.
     */
    document.addEventListener('DOMContentLoaded', () => {
        initializeEventListeners();
        populateBusinessTypes();
    });

    /**
     * Sets up event listeners for the form.
     */
    function initializeEventListeners() {
        setupBackButton();
        setupFormSubmission();
        setupNavigationLinks();
        setupConfirmButton();
    }

    /**
   * Attaches an event listener to the back button.
   */
    function setupBackButton() {
        const backButton = document.querySelector('.business-registration-header__back-button')
        if (backButton) {
         backButton.addEventListener('click', () => {
            // Check if history.back is available, otherwise provide alternative navigation
            if (window.history.length > 1) {
                history.back();
            } else {
            // Redirect to a default location if history is not available
            window.location.href = '/defaultlocation';  

            }
            console.log('Back button clicked');
         });
        } else {
            console.log('Back button not found');
        }
    }

    /**
     * Attaches an event listener to the form submission button.
     */
    function setupFormSubmission() {
        const form = document.querySelector('.business-registration');
        form.addEventListener('submit', handleFormSubmit);
    }

    /**
     * Handles the form submission event.
     */
    function handleFormSubmit(event) {
        event.preventDefault(); // Prevent the default form submission
        const businessName = document.querySelector('#business-name').value;
        const businessType = document.querySelector('#business-type').value;
        const location = document.querySelector('#location').value;
        
        // Prepare the data to be sent to the backend
        const registrationData = {
            businessName,
            businessType,
            location
        };
        
        console.log('Registration data:', registrationData);
        // The submission logic to the backend will go here
    }

    /**
     * Fetches and populates business types in the dropdown.
     */
    function populateBusinessTypes() {
        const businessTypeDropdown = document.querySelector('#business-type');
        // Fetch the business types from the backend
        // For demonstration, using a static list
        const businessTypes = ['Restaurant', 'Retail', 'Service'];
        
        businessTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type;
            option.textContent = type;
            businessTypeDropdown.appendChild(option);
        });
    }

    /**
     * Sets up event listeners for the navigation links.
     */
    function setupNavigationLinks() {
        const navItems = document.querySelectorAll('.business-registration__item');
        navItems.forEach(item => {
            const link = item.querySelector('.business-registration__link');
            link.addEventListener('click', (event) => {
                // Here you can add logic before redirecting, or override the default behavior
                console.log(`Navigating to ${link.getAttribute
    ('href')}`);
    // Potentially prevent the default link behavior and fetch data via API instead
    // event.preventDefault();
            });
        });
    }
    
    /**
     Attaches an event listener to the confirm button.
     */
    function setupConfirmButton() {
        const confirmButton = document.querySelector('.business-registration__button');
        confirmButton.addEventListener('click', handleConfirmClick);
    }
    
    /**
     Handles the click event on the confirm button.
     */
    function handleConfirmClick() {
        console.log('Submit business registration details');
    }
}