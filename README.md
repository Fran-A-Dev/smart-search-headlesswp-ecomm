# Smart Search E-commerce Boilerplate

A modern, headless e-commerce application built with Nuxt.js that features intelligent search capabilities powered by semantic AI and GraphQL integration with WordPress/WooCommerce.

## 🚀 Features

- **Smart Search**: Semantic AI-powered search with context understanding
- **Headless Architecture**: Decoupled frontend with WordPress/WooCommerce backend
- **Modern UI**: Clean, responsive design built with Tailwind CSS
- **Product Management**: Full product catalog with filtering and categorization
- **Performance Optimized**: Built with Nuxt.js for optimal performance and SEO
- **Component-Based**: Modular Vue.js components for easy maintenance

## 🛠️ Tech Stack

- **Frontend**: Nuxt.js 4.x, Vue.js 3.x
- **Styling**: Tailwind CSS
- **Backend**: WordPress with WooCommerce (headless)
- **Search**: Smart Search API with semantic capabilities
- **Data Layer**: GraphQL
- **Image Optimization**: Nuxt Image module

## 📦 Project Structure

```
smart-search-boilerplate/
├── components/
│   ├── icons/                 # SVG icon components
│   │   ├── ErrorIcon.vue
│   │   ├── LoadingSpinner.vue
│   │   └── NoResultsIcon.vue
│   ├── ActivityFilter.vue     # Activity-based filtering
│   ├── PriceFilter.vue        # Price range filtering
│   ├── ProductCard.vue        # Product display component
│   ├── ProductDetails.vue     # Detailed product view
│   ├── SearchBar.vue          # Main search interface
│   ├── SearchInput.vue        # Search input component
│   └── SearchResults.vue      # Search results display
├── composables/
│   ├── useSearchLogic.js      # Search logic composable
│   └── useSmartSearch.js      # Smart search API integration
├── layouts/
│   └── products.vue           # Product layout template
├── pages/
│   ├── index.vue              # Homepage with product catalog
│   └── [id].vue               # Dynamic product detail pages
├── assets/
│   └── main/
│       └── main.css           # Global styles
└── products-sample.csv        # Sample product data
```

## 🔧 Setup Instructions

### Prerequisites

- Node.js 18+
- npm, pnpm, yarn, or bun
- WordPress installation with WooCommerce
- Smart Search API access

### 1. Clone the Repository

```bash
git clone https://github.com/Fran-A-Dev/smart-search-headlesswp-ecomm.git
cd smart-search-boilerplate
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm
pnpm install

# Using yarn
yarn install

# Using bun
bun install
```

### 3. Environment Configuration

Create a `.env` file in the root directory and configure the following variables:

```env
# WordPress/WooCommerce GraphQL endpoint
NUXT_PUBLIC_WORDPRESS_URL=https://your-wordpress-site.com/graphql

# Smart Search API configuration
NUXT_PUBLIC_SMART_SEARCH_URL=https://your-smart-search-api.com/graphql
NUXT_PUBLIC_SMART_SEARCH_TOKEN=your-api-token
```

### 4. WordPress/WooCommerce Setup

Ensure your WordPress installation has:

- WooCommerce plugin installed and activated
- WPGraphQL plugin for GraphQL API access
- Products configured with proper categories and metadata

### 5. Sample Data (Optional)

The project includes `products-sample.csv` with sample product data that you can import into your WooCommerce store for testing purposes.

## 🚀 Development

Start the development server:

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev

# Using yarn
yarn dev

# Using bun
bun run dev
```

The application will be available at `http://localhost:3000`

## 🏗️ Build for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

## 📱 Key Components

### Search Components

- **SearchBar**: Main search interface with filters
- **SearchInput**: Text input with autocomplete
- **SearchResults**: Displays search results with loading states
- **ActivityFilter**: Filter products by activity type
- **PriceFilter**: Filter products by price range

### Product Components

- **ProductCard**: Individual product display card
- **ProductDetails**: Detailed product information view

### Icon Components

- **LoadingSpinner**: Animated loading indicator
- **NoResultsIcon**: Icon for empty search results
- **ErrorIcon**: Error state indicator

### Smart Search Features

The application includes advanced search capabilities:

- **Semantic Search**: AI-powered understanding of search intent
- **Context Awareness**: Searches consider product descriptions and metadata
- **Flexible Filtering**: Combine text search with category and price filters
- **Performance Optimized**: Efficient GraphQL queries with caching

## 🔍 Search Functionality

The smart search system supports:

1. **Text-based Search**: Natural language product searches
2. **Category Filtering**: Filter by product categories (climbing, running, coding)
3. **Price Range Filtering**: Set minimum and maximum price limits
4. **Semantic Understanding**: AI interprets search intent for better results
5. **Real-time Results**: Instant search results as you type

## 🎨 Styling

The project uses Tailwind CSS for styling with:

- Responsive design patterns
- Custom component styles
- Optimized for performance
- Consistent design system

## 📊 Performance Features

- **Image Optimization**: Automatic WebP conversion and lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **SEO Optimized**: Server-side rendering with meta tag management
- **Caching**: Intelligent caching strategies for API calls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation for common setup issues
- Ensure all environment variables are properly configured

## 🔗 Related Links

- [Nuxt.js Documentation](https://nuxt.com/docs)
- [WooCommerce REST API](https://woocommerce.github.io/woocommerce-rest-api-docs/)
- [WPGraphQL Documentation](https://www.wpgraphql.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
