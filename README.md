# Headless WordPress E-commerce Boilerplate

A simple headless e-commerce application built with Nuxt.js and WordPress/WooCommerce. This boilerplate provides a basic product catalog with a main index page and individual product detail pages.

## 🏗️ What This Boilerplate Includes

This is a minimal headless WordPress e-commerce site featuring:

- **Product Index Page**: Main page displaying all products in a grid layout
- **Product Detail Pages**: Individual pages for each product with detailed information
- **WordPress/WooCommerce Backend**: Headless CMS with GraphQL API integration
- **Responsive Design**: Mobile-friendly layout built with Tailwind CSS
- **Modern Frontend**: Built with Nuxt.js and Vue.js

## 🛠️ Tech Stack

- **Frontend**: Nuxt.js 4.x, Vue.js 3.x
- **Styling**: Tailwind CSS
- **Backend**: WordPress with WooCommerce (headless)
- **Data Layer**: GraphQL via WPGraphQL
- **Image Optimization**: Nuxt Image module

## 🚀 Setup

### Prerequisites

- Node.js 18+
- WordPress installation with WooCommerce
- WPGraphQL plugin installed

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Fran-A-Dev/smart-search-headlesswp-ecomm.git
cd smart-search-boilerplate
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```env
NUXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com/graphql
NUXT_PUBLIC_SMART_SEARCH_URL=https://your-smart-search-api.com/graphql
NUXT_PUBLIC_SMART_SEARCH_TOKEN=your-api-token
```

4. Start development server:

```bash
npm run dev
```

## 📄 Pages

### Index Page (`pages/index.vue`)

- Displays all products in a responsive grid
- Shows loading states and error handling
- Fetches products from WordPress via GraphQL
- Uses the `products` layout

### Product Detail Page (`pages/[id].vue`)

- Dynamic routing for individual products
- Displays detailed product information
- Handles product not found scenarios

## 🧩 Key Components

### Product Components

- **ProductCard**: Displays product summary in grid layout
- **ProductDetails**: Shows detailed product information

## 📊 Sample Data

The `products-sample.csv` file contains sample products across three categories:

- Climbing gear (harnesses, shoes, protection)
- Running equipment (shoes, apparel, watches)
- Coding accessories (keyboards, laptops, books)

## 🔧 Configuration

The boilerplate is configured in `nuxt.config.ts` with:

- Tailwind CSS integration
- Image optimization settings
- Runtime configuration for API endpoints
- SEO meta tags and head management

This boilerplate serves as a starting point for building more advanced headless e-commerce applications with additional features like search, filtering, and enhanced user interactions.
