/**
 * Initializes the cart functionality on page load.
 */
document.addEventListener('DOMContentLoaded', () => {
    setupOrderButton();
  });
  
  /**
   * Sets up the event listener for the order button.
   */
  function setupOrderButton() {
    const orderButton = document.querySelector('.cart-content__order-button');
    orderButton.addEventListener('click', handleOrderButtonClick);
  }
  
  /**
   * Handles the click event on the order button.
   * This should trigger the preparation of data for the backend and send it accordingly.
   */
  function handleOrderButtonClick() {
    // Collects the necessary data from the cart
    // For example, the dish name, quantity, total price, etc.
    const orderDetails = {
      businessName: document.querySelector('.cart-content__business-name').textContent,
      dishName: document.querySelector('.cart-content__description').textContent,
      totalPrice: document.querySelector('.cart-content__total-value').textContent,
      // Add any other relevant data you need to submit
    };
    
    // API endpoint to submit the order
    submitOrder(orderDetails);
  }
  
  /**
   * Submits the order details to the backend.
   * @param {Object} orderDetails - The details of the order to submit.
   */
  function submitOrder(orderDetails) {
    console.log('Order details to submit:', orderDetails);
  }
  