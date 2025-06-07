# BFF (Backend for Frontend) Mock Services

This directory contains mock backend-for-frontend functions for fetching data from `dummyjson.com`. These services are intended for development and testing purposes, simulating interactions with a real backend.

## Directory Structure

- **/bff**
  - **/cms-content**
    - `index.js`: Fetches CMS content (simulated using dummyjson.com/posts).
  - **/orders**
    - `index.js`: Fetches order data (simulated using dummyjson.com/carts).
  - **/products**
    - `index.js`: Fetches product data (simulated using dummyjson.com/products).
    - `search.js`: Searches for products by keyword using dummyjson.com.
  - **/users**
    - `index.js`: Fetches user data (simulated using dummyjson.com/users).
  - **/utils**
    - `fetchData.js`: A shared utility function for making fetch requests and handling basic response/error checking.
  - `README.md`: This file.

## Services

Each service in its respective subdirectory (e.g., `products`, `users`) exports functions to fetch data. For example, `bff/products/index.js` exports a `getProducts` function.

## Utility Functions

- `bff/utils/fetchData.js`: This utility centralizes the logic for making `fetch` requests to `dummyjson.com`. It handles the basic fetch operation, checks for network errors (`response.ok`), and parses the JSON response. Services use this utility to reduce code duplication.

## Usage

These services can be imported into your Next.js API routes or other server-side modules. For an example, see `pages/api/bff-test.js`.

## Product Search Endpoint

The BFF defines a **mock** endpoint to search for products by keyword.

```
GET /products/search?q=keyword
```

**Query Parameters**

- `q` (string, required) – the search term.

**Response**

Returns a JSON array of `Product` objects. Each object matches the structure returned from `https://dummyjson.com/products/search`.

This contract allows the frontend to call `/products/search` and receive an array of products that match the given keyword.
