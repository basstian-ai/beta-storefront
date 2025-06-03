# BFF (Backend-for-Frontend) Mock Services

This directory contains mock backend-for-frontend (BFF) functions. These functions are designed to simulate fetching data from a real backend, using `dummyjson.com` as the data source.

## Services

The following files provide functions to fetch different types of data:

- **`products.js`**: Contains the `getProducts` function, which fetches product data from `https://dummyjson.com/products`.
- **`users.js`**: Contains the `getUsers` function, which fetches user data from `https://dummyjson.com/users`.
- **`orders.js`**: Contains the `getOrders` function, which fetches order data from `https://dummyjson.com/carts` (using carts as a proxy for orders).
- **`cms-content.js`**: Contains the `getCMSContent` function, which fetches CMS content from `https://dummyjson.com/posts` (using posts as a proxy for generic CMS content).

These mock services can be used for development and testing purposes when a live backend is not available or necessary. Each function uses the `fetch` API to retrieve data and returns a Promise that resolves with the JSON response. Error handling is included to catch network or HTTP errors.
