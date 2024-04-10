/**
 * Initializes the main content functionality including quantity adjustments,
 * adding items to cart, and handling add/delete button toggling.
 */
export default function mainContent() {
    document.addEventListener('DOMContentLoaded', function() {
        /**
         * Updates the shopping cart count.
         * @param {number} amount - The amount to adjust the cart count by.
         */
        const updateCartCount = (amount) => {
            const cartCountSpan = document.querySelector('.order-menu__header__cart-count');
            let currentCartCount = parseInt(cartCountSpan.textContent);
            currentCartCount += amount;
            cartCountSpan.textContent = Math.max(currentCartCount, 0); // Ensure count does not go below 0
        };
    
        /**
         * Sets up event listeners for quantity adjustment buttons.
         */
        const quantityContainers = document.querySelectorAll('.order-menu__product-quantity');
        quantityContainers.forEach(container => {
            const decreaseButton = container.querySelector('.order-menu__quantity-button--decrease');
            const increaseButton = container.querySelector('.order-menu__quantity-button--increase');
            const quantityInput = container.querySelector('.order-menu__quantity-input');
    
            decreaseButton.addEventListener('click', () => {
                let quantity = parseInt(quantityInput.value);
                quantity = Math.max(0, quantity - 1); // Ensure quantity does not go below 1
                quantityInput.value = quantity;
            });
    
            increaseButton.addEventListener('click', () => {
                let quantity = parseInt(quantityInput.value);
                quantity += 1;
                quantityInput.value = quantity;
            });
        });
    
        /**
         * Handles adding products to the cart and toggling visibility of add/delete buttons.
         */
        const addButtons = document.querySelectorAll('.order-menu__add-button');
        addButtons.forEach(button => {
            button.addEventListener('click', function() {
                const quantityInput = button.closest('.order-menu__product-quantity').querySelector('.order-menu__quantity-input');
                const productQuantity = parseInt(quantityInput.value);
                updateCartCount(productQuantity);
    
                // Toggle buttons to show delete button and hide add button
                button.classList.add('hidden');
                const deleteButton = button.nextElementSibling;
                deleteButton.classList.remove('hidden');
            });
        });
    
        /**
         * Handles removing products from the cart and toggling visibility of add/delete buttons.
         */
        const deleteButtons = document.querySelectorAll('.order-menu__delete-button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const quantityInput = button.closest('.order-menu__product-quantity').querySelector('.order-menu__quantity-input');
                const productQuantity = -parseInt(quantityInput.value); // Negative to subtract from cart
                updateCartCount(productQuantity);
    
                // Reset quantity to 1
                quantityInput.value = 1;
                button.classList.add('hidden');
                const addButton = button.previousElementSibling;
                addButton.classList.remove('hidden');
            });
        });
    });
}
