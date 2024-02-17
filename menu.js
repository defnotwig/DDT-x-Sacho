document.addEventListener('DOMContentLoaded', () => {
    let listProductHTML = document.querySelector('.listProduct');
    let listCartHTML = document.querySelector('.listCart');
    let iconCart = document.querySelector('.icon-cart');
    let iconCartSpan = document.querySelector('.icon-cart span');
    let body = document.querySelector('body');
    let closeCart = document.querySelector('.close');
    let checkOutButton = document.querySelector('.checkOut');
    let products = [];
    let cart = [];
    

    

    iconCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    });

    closeCart.addEventListener('click', () => {
        body.classList.toggle('showCart');
    });

    const addDataToHTML = () => {
        listProductHTML.innerHTML = ''; // Clear the list before adding items
        if(products.length > 0) {
            products.forEach(product => {
                let newProduct = document.createElement('div');
                newProduct.dataset.id = product.id;
                newProduct.classList.add('item');
                newProduct.innerHTML = 
                `<img src="${product.image}" alt="">
                <h2>${product.name}</h2>
                <div class="price">₱${product.price}</div>
                <button class="addCart">Add To Cart</button>`;
                listProductHTML.appendChild(newProduct);
            });
        }
    };

    listProductHTML.addEventListener('click', (event) => {
        let positionClick = event.target;
        if(positionClick.classList.contains('addCart')){
            let id_product = positionClick.parentElement.dataset.id;
            addToCart(id_product);
        }
    });

    const addToCart = (product_id) => {
        let positionThisProductInCart = cart.findIndex((value) => value.product_id == product_id);
        if(cart.length <= 0 || positionThisProductInCart < 0){
            cart.push({
                product_id: product_id,
                quantity: 1
            });
        }else{
            cart[positionThisProductInCart].quantity += 1;
        }
        addCartToHTML();
        addCartToMemory();
    };

    const addCartToMemory = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const addCartToHTML = () => {
        listCartHTML.innerHTML = ''; // Clear the list before adding items
        let totalQuantity = 0;
        if(cart.length > 0){
            cart.forEach(item => {
                totalQuantity += item.quantity;
                let newItem = document.createElement('div');
                newItem.classList.add('item');
                newItem.dataset.id = item.product_id;

                let positionProduct = products.findIndex((value) => value.id == item.product_id);
                let info = products[positionProduct];
                newItem.innerHTML = `
                <div class="image">
                    <img src="${info.image}" alt="">
                </div>
                <div class="name">${info.name}</div>
                <div class="totalPrice">₱${(info.price * item.quantity).toFixed(2)}</div>
                <div class="quantity">
                    <span class="minus">-</span>
                    <span>${item.quantity}</span>
                    <span class="plus">+</span>
                </div>`;
                listCartHTML.appendChild(newItem);
            });
        }
        iconCartSpan.innerText = totalQuantity;
    };

    listCartHTML.addEventListener('click', (event) => {
        let positionClick = event.target;
        if(positionClick.classList.contains('minus') || positionClick.classList.contains('plus')){
            let product_id = positionClick.parentElement.parentElement.dataset.id;
            let type = positionClick.classList.contains('plus') ? 'plus' : 'minus';
            changeQuantityCart(product_id, type);
        }
    });

    const changeQuantityCart = (product_id, type) => {
        let positionItemInCart = cart.findIndex((value) => value.product_id == product_id);
        if(positionItemInCart >= 0){
            if(type === 'plus'){
                cart[positionItemInCart].quantity += 1;
            } else {
                cart[positionItemInCart].quantity -= 1;
                if(cart[positionItemInCart].quantity < 1){
                    cart.splice(positionItemInCart, 1); // Remove item if quantity less than 1
                }
            }
        }
        addCartToHTML();
        addCartToMemory();
    };

    const handleCheckOut = () => {
        if (cart.length === 0) {
            showAlert("Your cart is empty. Please add items before creating an order.");
            return;
        }

        updateOrderSummary(); // Update the order summary details
        orderSummaryModal.style.display = "block"; // Show the modal
    };

    checkOutButton.addEventListener('click', handleCheckOut);

    const initApp = () => {
        fetch('products.json')
        .then(response => response.json())
        .then(data => {
            products = data;
            addDataToHTML();

            if(localStorage.getItem('cart')){
                cart = JSON.parse(localStorage.getItem('cart'));
                addCartToHTML();
            }
        });
    };

    // Popup and Order Summary Implementation

    // Reference to the modal and its elements
    const orderSummaryModal = document.getElementById('orderSummaryModal');
    const closeBtn = document.querySelector('.close-button');
    const payButton = document.getElementById('payButton');
    const orderDetails = document.getElementById('orderDetails');
    const totalAmountSpan = document.getElementById('totalAmount');
    const deliveryFeeSpan = document.getElementById('deliveryFee');

    // Function to calculate delivery fee (example function, you can customize it)
    function calculateDeliveryFee() {
        return 50; // Flat delivery fee, you can implement your own logic
    }

    // Function to update order summary and total amount
    function updateOrderSummary() {
        let totalAmount = 0;
        let orderSummaryHTML = '';
        cart.forEach(item => {
            const product = products.find(product => product.id == item.product_id);
            if (product) {
                const itemTotal = product.price * item.quantity;
                totalAmount += itemTotal;
                orderSummaryHTML += `<p>${product.name} x ${item.quantity}: ₱${itemTotal.toFixed(2)}</p>`;
            }
        });

        const deliveryFee = calculateDeliveryFee();
        totalAmount += deliveryFee;

        orderDetails.innerHTML = orderSummaryHTML;
        deliveryFeeSpan.innerText = `₱${deliveryFee.toFixed(2)}`;
        totalAmountSpan.innerText = `₱${totalAmount.toFixed(2)}`;
    }

    // Function to display the alert message
    function showAlert(message) {
        const alertContainer = document.createElement('div');
        alertContainer.classList.add('alert-container');
        alertContainer.innerHTML = `<p>${message}</p>`;
        document.body.appendChild(alertContainer);

        // Remove the alert message after 3 seconds (adjust as needed)
        setTimeout(() => {
            alertContainer.remove();
        }, 3000);
    }

    // When the user clicks on <span> (x), close the modal
    closeBtn.onclick = function() {
        orderSummaryModal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
        if (event.target == orderSummaryModal) {
            orderSummaryModal.style.display = "none";
        }
    }

    // Handling the pay button click
    payButton.addEventListener('click', () => {
        if (cart.length === 0) {
            showAlert("Your cart is empty. Please add items before completing your order.");
            return;
        }

        // Additional logic for processing payment and completing the order goes here
        customAlert("Thank you for your order!");
    
        // Here, you should also handle the order processing logic

        // Reset cart and update HTML and local storage
        cart = [];
        addCartToHTML();
        addCartToMemory();

        orderSummaryModal.style.display = "none";
    });

    initApp();
});

// Get a reference to the home button
const homeButton = document.getElementById('homeButton');

// Add an event listener to handle the click event on the home button
homeButton.addEventListener('click', () => {
    // Navigate to the home.html page
    window.location.href = 'index.html';
});


function customAlert(message) {
    const alertContainer = document.createElement('div');
    alertContainer.classList.add('custom-alert-container');
    alertContainer.innerHTML = `<p>${message}</p>`;
    document.body.appendChild(alertContainer);

    // Remove the alert message after 3 seconds (adjust as needed)
    setTimeout(() => {
        alertContainer.remove();
    }, 3000);
}
 // Reference to the payment method select element
 const paymentMethodSelect = document.getElementById('paymentMethod');
 // Reference to the additional input fields
 const gcashInput = document.getElementById('gcashInput');
 const creditCardInput = document.getElementById('creditCardInput');

 // Event listener for the payment method select element
 paymentMethodSelect.addEventListener('change', () => {
     const selectedMethod = paymentMethodSelect.value;

     // Hide all additional input fields by default
     gcashInput.style.display = 'none';
     creditCardInput.style.display = 'none';

     // Show additional input fields based on the selected payment method
     if (selectedMethod === 'gcash') {
         gcashInput.style.display = 'block';
     } else if (selectedMethod === 'credit_card') {
         creditCardInput.style.display = 'block';
     }
 });

 