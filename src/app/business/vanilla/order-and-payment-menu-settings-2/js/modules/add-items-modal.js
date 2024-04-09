export default function addItemsModal() {
    // Function to show the modal
    function showModal() {
        const modal = document.getElementById('add-item-modal');
        modal.style.display = 'block';
    }

    // Function to hide the modal
    function hideModal(event) {
        event.preventDefault();
        const modal = document.getElementById('add-item-modal');
        modal.style.display = 'none';
    }

    // Function to handle image file selection and display a preview
    function handleImageUpload(event) {
        const [file] = event.target.files;
        const previewContainer = document.getElementById('image-preview');
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Image preview">
                    <span class="image-preview__close">&times;</span>`; // Close icon added here

                document.querySelector('.image-preview__close').addEventListener('click', function() {
                    previewContainer.innerHTML = ''; // Clear the preview
                    document.getElementById('item-image-upload').value = ''; // Reset the file input
                });
            };
            reader.readAsDataURL(file);
        }
    }

    // Function to save items to localStorage
    function saveItems(items) {
        localStorage.setItem('items', JSON.stringify(items));
    }

    // Function to load items from localStorage and display them
    function loadItems() {
        const items = JSON.parse(localStorage.getItem('items')) || [];
        const itemsDisplayArea = document.getElementById('items-display-area');
        itemsDisplayArea.innerHTML = '';
        items.forEach((item, index) => {
            addItemToDisplayArea(item, index);
        });
        adjustFloatingButtonPosition();
    }

    // Function to delete an item
    function deleteItem(itemId) {
        const items = JSON.parse(localStorage.getItem('items')) || [];
        const updatedItems = items.filter(item => item.id !== itemId);
        localStorage.setItem('items', JSON.stringify(updatedItems));
        loadItems(); // Reload items to update the display
    }

    // Function to add an item to the display area
    function addItemToDisplayArea(item) {
        const itemsDisplayArea = document.getElementById('items-display-area');
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        itemElement.setAttribute('data-id', item.id);
        itemElement.innerHTML = `
            <img src="${item.imagePreview}" alt="${item.itemName}" style="width: 60px; height: auto;">
            <div class="item-text">
                <h3>${item.itemName}</h3>
                <p>${item.itemDescription}</p>
                <button class="delete-item-btn" data-id="${item.id}">Delete</button>
            </div>
        `;
        itemsDisplayArea.appendChild(itemElement);

        // Attach event listener to the delete button
        itemElement.querySelector('.delete-item-btn').addEventListener('click', function() {
            deleteItem(item.id);
        });
    }

    // Function to adjust the floating button's position based on the items display area's height
    function adjustFloatingButtonPosition() {
        const floatingButton = document.querySelector('.menu-setting__floating-button');
        const itemsDisplayArea = document.getElementById('items-display-area');
        const displayAreaBottom = itemsDisplayArea.getBoundingClientRect().bottom;
        const viewportHeight = window.innerHeight;
        let newBottomPosition = viewportHeight - displayAreaBottom + -700; // Add a 20px offset from the bottom of the items display area

        floatingButton.style.bottom = `${newBottomPosition}px`;
    }

    document.addEventListener('DOMContentLoaded', () => {
        const form = document.getElementById('add-item-form');
        loadItems();

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const itemName = document.getElementById('item-name').value;
            const itemPrice = document.getElementById('item-price').value;
            const itemDescription = document.getElementById('description').value;
            const imagePreview = document.querySelector('#image-preview img') ? document.querySelector('#image-preview img').src : '';
            const id = Date.now(); // Generate a unique ID for each item

            const newItem = { id, itemName, itemPrice, itemDescription, imagePreview };
            addItemToDisplayArea(newItem);

            const items = JSON.parse(localStorage.getItem('items')) || [];
            items.push(newItem);
            saveItems(items);

            form.reset();
            document.getElementById('image-preview').innerHTML = '';
            document.getElementById('add-item-modal').style.display = 'none';

            adjustFloatingButtonPosition();
        });

        document.querySelector('.menu-setting__floating-button').addEventListener('click', showModal);
        document.querySelector('.modal__close-button').addEventListener('click', hideModal);
        document.getElementById('item-image-upload').addEventListener('change', handleImageUpload);
    });
}
