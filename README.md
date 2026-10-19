# Shopify MCP Server

MCP Server for Shopify API, enabling interaction with store data through GraphQL API. This server provides tools for managing products, customers, orders, and more.

**📦 Package Name: `shopify-mcp`**  
**🚀 Command: `shopify-mcp` (NOT `shopify-mcp-server`)**

## Features

- **Product Management**: Search, retrieve, and update product information, including SEO-optimized content
- **Customer Management**: Load customer data and manage customer tags
- **Order Management**: Advanced order querying and filtering
- **Blog Management**: Create, retrieve, and update blogs with custom templates and comment policies
- **Article Management**: Create and manage blog articles with rich content, author information, and SEO metadata
- **Store Search**: Unified search across products, articles, blogs, and pages
- **GraphQL Integration**: Direct integration with Shopify's GraphQL Admin API
- **Comprehensive Error Handling**: Clear error messages for API and authentication issues
- **LLM-Optimized**: Designed for seamless use with AI language models

## Prerequisites

1. Node.js (version 16 or higher)
2. Shopify Custom App Access Token (see setup instructions below)

## Setup

### Shopify Access Token

To use this MCP server, you'll need to create a custom app in your Shopify store:

1. From your Shopify admin, go to **Settings** > **Apps and sales channels**
2. Click **Develop apps** (you may need to enable developer preview first)
3. Click **Create an app**
4. Set a name for your app (e.g., "Shopify MCP Server")
5. Click **Configure Admin API scopes**
6. Select the following scopes:
   - `read_products`, `write_products`
   - `read_customers`, `write_customers`
   - `read_orders`, `write_orders`
   - `read_content`, `write_content` (for blogs and articles)
7. Click **Save**
8. Click **Install app**
9. Click **Install** to give the app access to your store data
10. After installation, you'll see your **Admin API access token**
11. Copy this token - you'll need it for configuration

### Usage with Claude Desktop

Add this to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shopify": {
      "command": "npx",
      "args": [
        "shopify-mcp",
        "--accessToken",
        "<YOUR_ACCESS_TOKEN>",
        "--domain",
        "<YOUR_SHOP>.myshopify.com"
      ]
    }
  }
}
```

Locations for the Claude Desktop config file:

- MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%/Claude/claude_desktop_config.json`

### Alternative: Run Locally with Environment Variables

If you prefer to use environment variables instead of command-line arguments:

1. Create a `.env` file with your Shopify credentials:

   ```
   SHOPIFY_ACCESS_TOKEN=your_access_token
   MYSHOPIFY_DOMAIN=your-store.myshopify.com
   ```

2. Run the server with npx:
   ```
   npx shopify-mcp
   ```

### Direct Installation (Optional)

If you want to install the package globally:

```
npm install -g shopify-mcp
```

Then run it:

```
shopify-mcp --accessToken=<YOUR_ACCESS_TOKEN> --domain=<YOUR_SHOP>.myshopify.com
```

**⚠️ Important:** If you see errors about "SHOPIFY_ACCESS_TOKEN environment variable is required" when using command-line arguments, you might have a different package installed. Make sure you're using `shopify-mcp`, not `shopify-mcp-server`.

## Available Tools

### Product Management

1. `get-products`
   - Get products or search by title with cursor-based navigation
   - Inputs:
     - `searchTitle` (optional string): Filter products by title
     - `limit` (optional number, default: 10): Maximum number of products to return
     - `after` (optional string): Cursor for pagination - get items after this cursor
     - `before` (optional string): Cursor for pagination - get items before this cursor
     - `reverse` (optional boolean, default: false): Reverse the order of the returned products
   - Returns:
     - Object containing:
       - `products`: Array of products, each containing:
         - `title`: Product title (SEO-optimized)
         - `description`: Plain text product description
         - `descriptionHtml`: HTML-formatted product description
         - Additional fields: id, handle, status, inventory, pricing, etc.
         - `cursor`: Cursor for pagination
       - `pageInfo`: Pagination information containing:
         - `hasNextPage`: Whether there are more items after the current page
         - `hasPreviousPage`: Whether there are more items before the current page
         - `startCursor`: Cursor for the first item in the current page
         - `endCursor`: Cursor for the last item in the current page

   #### 🌟 Navigation Examples:

   1. Basic Pagination:
   ```javascript
   // Get first page of products
   {
     "limit": 10
   }

   // Get next page using the endCursor from previous response
   {
     "limit": 10,
     "after": "endCursor_from_previous_response"
   }

   // Get previous page using the startCursor from current response
   {
     "limit": 10,
     "before": "startCursor_from_current_response"
   }
   ```

   2. Search with Pagination:
   ```javascript
   // Search products with pagination
   {
     "searchTitle": "t-shirt",
     "limit": 5,
     "after": "cursor_from_previous_response"
   }
   ```

   3. Reverse Order:
   ```javascript
   // Get products in reverse order
   {
     "limit": 10,
     "reverse": true
   }
   ```

   #### 💡 Pagination Tips:
   1. Store both `startCursor` and `endCursor` from each response
   2. Use `hasNextPage` and `hasPreviousPage` to show/hide navigation controls
   3. Keep the same `limit` value for consistent page sizes
   4. Use `reverse` when you need newest/oldest items first
   5. Combine with `searchTitle` for paginated search results

2. `get-product-by-id`
   - Get a specific product by ID with all its details
   - Inputs:
     - `productId` (string): The GID of the product to fetch (e.g., "gid://shopify/Product/1234567890")
   - Returns:
     - Single product object containing:
       - `title`: Product title (SEO-optimized)
       - `description`: Plain text product description
       - `descriptionHtml`: HTML-formatted product description
       - Additional fields: id, handle, status, inventory, pricing, variants, collections, etc.

3. `update-product`
   - Update any aspect of a product including basic details, SEO, and variants
   - Inputs:
     - `productId` (required string): The product's ID (e.g., "gid://shopify/Product/1234567890")
     - `title` (optional string): New product title
     - `descriptionHtml` (optional string): Product description in HTML format
     - `seo` (optional object): SEO settings
       - `title` (optional string): SEO-optimized title
       - `description` (optional string): Meta description for search engines
     - `status` (optional string): Product status - "ACTIVE", "ARCHIVED", or "DRAFT"
     - `vendor` (optional string): Product manufacturer or brand
     - `productType` (optional string): Category or type of product
     - `tags` (optional array of strings): Product tags for categorization
     - `variants` (optional array of objects): Product variants to update
       - `id` (string): Variant ID to update
       - `price` (optional string): New price
       - `compareAtPrice` (optional string): Original/compare-at price
       - `sku` (optional string): Stock Keeping Unit
       - `barcode` (optional string): Product barcode
       - `inventoryPolicy` (optional string): "DENY" or "CONTINUE" for out-of-stock behavior

   #### 🌟 Beginner's Guide to Updating Products

   1. Basic Product Update:
   ```javascript
   // Update product title and status
   {
     "productId": "gid://shopify/Product/1234567890",
     "title": "Awesome T-Shirt",
     "status": "ACTIVE"
   }
   ```

   2. Update SEO Information:
   ```javascript
   // Make your product more visible in search results
   {
     "productId": "gid://shopify/Product/1234567890",
     "seo": {
       "title": "Awesome T-Shirt | 100% Cotton | Available in 5 Colors",
       "description": "High-quality cotton t-shirt perfect for everyday wear. Available in multiple colors and sizes."
     }
   }
   ```

   3. Update Product Variants:
   ```javascript
   // Change prices and inventory settings
   {
     "productId": "gid://shopify/Product/1234567890",
     "variants": [
       {
         "id": "gid://shopify/ProductVariant/1234567",
         "price": "29.99",
         "compareAtPrice": "39.99",
         "inventoryPolicy": "DENY"
       }
     ]
   }
   ```

   4. Complete Product Update:
   ```javascript
   // Update multiple aspects at once
   {
     "productId": "gid://shopify/Product/1234567890",
     "title": "Premium Cotton T-Shirt",
     "vendor": "Fashion Basics",
     "productType": "Apparel",
     "tags": ["cotton", "t-shirt", "basics", "summer"],
     "seo": {
       "title": "Premium Cotton T-Shirt | Fashion Basics | Multiple Colors",
       "description": "Experience comfort with our premium cotton t-shirt. Perfect for any occasion."
     },
     "variants": [
       {
         "id": "gid://shopify/ProductVariant/1234567",
         "price": "29.99",
         "compareAtPrice": "39.99"
       }
     ]
   }
   ```

   #### 💡 Tips for New Users:
   1. **Start Small**: Begin with simple updates (like title or price) before trying complex changes
   2. **Test First**: Always test updates on a draft product before modifying live products
   3. **Check IDs**: Make sure you have the correct product and variant IDs
   4. **SEO Best Practices**:
      - Keep SEO titles under 60 characters
      - Write descriptive meta descriptions (150-160 characters)
      - Include relevant keywords naturally
   5. **Pricing Strategy**:
      - Use `compareAtPrice` to show savings
      - Keep prices consistent across variants unless size/material differs
   6. **Inventory Management**:
      - Use "DENY" for limited stock items
      - Use "CONTINUE" for made-to-order items

   #### ⚠️ Common Mistakes to Avoid:
   1. Forgetting to include the product ID
   2. Using wrong ID formats (always use the full GID format)
   3. Setting invalid prices (must be strings, not numbers)
   4. Mixing up variant IDs
   5. Using HTML in regular text fields

   #### 🔍 How to Find IDs:
   1. Product ID: Available in the product URL or using `get-products`
   2. Variant ID: Use `get-product-by-id` to see all variants
   3. Always use the full GID format: "gid://shopify/Product/1234567890"

4. `update-product-image-alt-text`
   - Update the alt text for a specific product image
   - Inputs:
     - `productId` (string): The GID of the product to which the image belongs (e.g., "gid://shopify/Product/1234567890")
     - `imageId` (string): The GID of the product image/media to update (e.g., "gid://shopify/MediaImage/123")
     - `altText` (string | null): The new descriptive alt text for the image. Set to null to remove. Best practice is to keep it under 125 characters, max 512.
   - Returns:
     - Updated media object containing:
       - `id`: The media ID
       - `altText`: The updated alt text

### Collection Management

1. `get-collections`
   - Get collections or search by title
   - Inputs:
     - `searchTitle` (optional string): Filter collections by title
     - `limit` (optional number, default: 10): Maximum number of collections to return

### Blog Management

1. `get-blogs`
   - Get all blogs or search by title
   - Inputs:
     - `searchTitle` (optional string): Filter blogs by title
     - `limit` (optional number, default: 10): Maximum number of blogs to return
   - Returns:
     - Array of blogs containing:
       - `id`: Blog ID
       - `title`: Blog title
       - `handle`: URL-friendly handle
       - `templateSuffix`: Template suffix for custom themes
       - `commentPolicy`: Comment moderation policy
       - `createdAt`: Creation timestamp
       - `updatedAt`: Last update timestamp

2. `update-blog`
   - Update an existing blog's details
   - Inputs:
     - `blogId` (string, required): The GID of the blog to update (e.g., "gid://shopify/Blog/1234567890")
     - `title` (optional string): New blog title
     - `handle` (optional string): New URL-friendly handle
     - `templateSuffix` (optional string): New template suffix for custom themes
     - `commentPolicy` (optional string): New comment policy ("MODERATED" or "CLOSED")
   - Returns:
     - Updated blog object with the modified fields

3. `get-blog-by-id`
   - Get a specific blog by ID with all its details
   - Inputs:
     - `blogId` (string, required): The GID of the blog to fetch
   - Returns:
     - Blog object containing:
       - `id`: Blog ID
       - `title`: Blog title
       - `handle`: URL-friendly handle
       - `templateSuffix`: Template suffix
       - `commentPolicy`: Comment policy
       - `articles`: Recent articles (first 5)

### Article Management

1. `get-articles`
   - Get articles from a specific blog
   - Inputs:
     - `blogId` (string, required): The GID of the blog to get articles from
     - `searchTitle` (optional string): Filter articles by title
     - `limit` (optional number, default: 10): Maximum number of articles to return
   - Returns:
     - Array of articles containing:
       - `id`: Article ID
       - `title`: Article title
       - `handle`: URL-friendly handle
       - `author`: Author information
       - `publishedAt`: Publication date
       - `tags`: Associated tags
       - `image`: Featured image (if any)

2. `create-article`
   - Create a new article in a specified blog
   - Inputs:
     - `blogId` (string, required): The GID of the blog to create the article in
     - `title` (string, required): The title of the article
     - `content` (string, required): The content of the article in HTML format
     - `author` (object, required):
       - `name` (string, required): The name of the article's author
     - `published` (optional boolean): Whether to publish immediately (default: false)
     - `tags` (optional array of strings): Tags to categorize the article
   - Returns:
     - Created article object containing:
       - `id`: Article ID
       - `title`: Article title
       - `handle`: URL-friendly handle (auto-generated from title)
       - `body`: Article content
       - `summary`: Article summary (if provided)
       - `author`: Author information
       - `tags`: Associated tags
       - `image`: Featured image details (if provided)
   - Example Usage:
     ```javascript
     // Create a published article with formatted content
     {
       "blogId": "gid://shopify/Blog/123456789",
       "title": "My New Article",
       "content": "<p>Article content with <strong>HTML formatting</strong>.</p>",
       "author": {
         "name": "John Doe"
       },
       "published": true,
       "tags": ["news", "updates"]
     }

     // Create a draft article with future publication
     {
       "blogId": "gid://shopify/Blog/123456789",
       "title": "Upcoming Article",
       "content": "<p>Draft content...</p>",
       "author": {
         "name": "Jane Smith"
       },
       "published": false,
       "tags": ["draft"]
     }
     ```

3. `update-article`
   - Update an existing article's details
   - Inputs:
     - `articleId` (string, required): The GID of the article to update
     - `title` (optional string): New article title
     - `body` (optional string): New article content
     - `summary` (optional string): New article summary
     - `tags` (optional array of strings): New article tags
     - `author` (optional object): Author information
       - `name` (string): Author's name
   - Returns:
     - Updated article object with the modified fields

4. `get-article-by-id`
   - Get a specific article by ID with all its details
   - Inputs:
     - `articleId` (string, required): The GID of the article to fetch
   - Returns:
     - Article object containing:
       - `id`: Article ID
       - `title`: Article title
       - `handle`: URL-friendly handle
       - `author`: Author information
       - `body`: Article content
       - `blog`: Parent blog information
       - `tags`: Associated tags

### Important Notes for Blog and Article Management

1. **Working with Blog Content**
   - Always use `get-blogs` first to obtain valid blog IDs
   - Use `get-blog-by-id` to fetch detailed information about a specific blog
   - When updating blogs, only include the fields you want to modify
   - The `commentPolicy` can only be set to "MODERATED" or "CLOSED"

2. **Working with Articles**
   - Articles must be associated with an existing blog
   - Use `get-articles` to list articles within a specific blog
   - When creating or updating articles, the `body` field supports HTML content
   - Author information should always include at least the name
   - Tags are case-sensitive and should be consistent across articles
   - Image URLs must be publicly accessible
   - Handle creation is optional - Shopify will generate one from the title if not provided

3. **Best Practices for Article Creation**
   - Use semantic HTML for article content (e.g., `<p>`, `<h2>`, `<ul>`, etc.)
   - Keep article summaries concise (recommended: 150-160 characters)
   - Use consistent tag naming conventions
   - Always verify blog IDs before creating articles
   - Consider SEO implications when writing titles and content
   - Test HTML formatting in a staging environment first
   - For drafts, set `published: false` to save without publishing
   - When using tags, maintain a consistent taxonomy
   - Provide descriptive alt text for any images
   - Schedule articles strategically using publishDate
   - Keep HTML content clean and well-structured
   - Use meaningful handles for better SEO
   - Consider mobile readability when formatting content

4. **Article Creation Tips**
   - **HTML Content**: The content field accepts HTML markup for rich formatting:
     ```html
     <p>First paragraph with <strong>bold text</strong>.</p>
     <h2>Section Heading</h2>
     <ul>
       <li>List item one</li>
       <li>List item two</li>
     </ul>
     ```
   - **Tags**: Use descriptive, consistent tags for better organization:
     ```javascript
     "tags": ["product-updates", "how-to", "tips"]
     ```
   - **Draft Mode**: Create unpublished drafts by setting published to false:
     ```javascript
     {
       "published": false,
       // other fields...
     }
     ```
   - **Author Information**: Always provide complete author details:
     ```javascript
     "author": {
       "name": "Full Author Name"
     }
     ```

### Store Search

1. `search-shopify`
   - Perform a unified search across products, articles, blogs, and pages
   - Inputs:
     - `query` (string, required): The search query to find content across the store
     - `types` (optional array of strings): Types of resources to search for. Available types:
       - "ARTICLE"
       - "BLOG"
       - "PAGE"
       - "PRODUCT"
     - `first` (optional number, default: 10, max: 50): Number of results to return
   - Returns:
     - Array of search results, each containing:
       - `id`: Resource ID
       - `title`: Resource title
       - `type`: Resource type
       - `url`: Resource URL
       - Additional fields based on resource type
   - Example Usage:
     ```javascript
     // Search for articles and blogs about "kawaii"
     {
       "query": "kawaii",
       "types": ["ARTICLE", "BLOG"],
       "first": 5
     }

     // Search across all content types
     {
       "query": "new collection",
       "first": 10
     }
     ```

### Page Management

1. `get-pages`
   - Get all pages or search by title
   - Inputs:
     - `searchTitle` (optional string): Filter pages by title
     - `limit` (optional number, default: 10): Maximum number of pages to return
   - Returns:
     - Array of pages containing:
       - `id`: Page ID
       - `title`: Page title
       - `handle`: URL-friendly handle
       - `body`: Page content
       - `bodySummary`: Content summary
       - `createdAt`: Creation timestamp
       - `updatedAt`: Last update timestamp

2. `update-page`
   - Update an existing page's details
   - Inputs:
     - `pageId` (string, required): The GID of the page to update (e.g., "gid://shopify/Page/1234567890")
     - `title` (optional string): New page title
     - `body` (optional string): New page content
     - `bodyHtml` (optional string): New HTML content
     - `seo` (optional object): SEO settings
       - `title` (optional string): SEO title
       - `description` (optional string): SEO description
     - `published` (optional boolean): Whether the page is published
   - Returns:
     - Updated page object with modified fields
   - Example Usage:
     ```javascript
     // Update page content and SEO
     {
       "pageId": "gid://shopify/Page/123456789",
       "title": "About Our Store",
       "bodyHtml": "<h1>Welcome!</h1><p>Learn about our story...</p>",
       "seo": {
         "title": "About Us - Kawaii Store",
         "description": "Discover our journey in bringing kawaii culture to you"
       }
     }
     ```

### Collection Management

1. `get-collections`
   - Get all collections or search by title
   - Inputs:
     - `searchTitle` (optional string): Filter collections by title
     - `limit` (optional number, default: 10): Maximum number of collections to return
   - Returns:
     - Array of collections containing:
       - `id`: Collection ID
       - `title`: Collection title
       - `handle`: URL-friendly handle
       - `description`: Collection description
       - `descriptionHtml`: HTML-formatted description
       - `updatedAt`: Last update timestamp
       - `productsCount`: Number of products in collection

2. `update-collection`
   - Update an existing collection's details
   - Inputs:
     - `collectionId` (string, required): The GID of the collection to update
     - `title` (optional string): New collection title
     - `description` (optional string): New collection description
     - `descriptionHtml` (optional string): New HTML description
     - `seo` (optional object): SEO settings
       - `title` (optional string): SEO title
       - `description` (optional string): SEO description
   - Returns:
     - Updated collection object with modified fields
   - Example Usage:
     ```javascript
     // Update collection with SEO optimization
     {
       "collectionId": "gid://shopify/Collection/123456789",
       "title": "Summer Kawaii Collection",
       "descriptionHtml": "<p>Discover our cutest summer items!</p>",
       "seo": {
         "title": "Summer Kawaii Collection 2025",
         "description": "Explore our adorable summer collection featuring..."
       }
     }
     ```

### Product Management

1. `get-products`
   - Get all products or search by title
   - Inputs:
     - `searchTitle` (optional string): Filter products by title
     - `limit` (optional number, default: 10): Maximum number of products to return
   - Returns:
     - Array of products containing:
       - `id`: Product ID
       - `title`: Product title
       - `handle`: URL-friendly handle
       - `description`: Product description
       - `descriptionHtml`: HTML-formatted description
       - `status`: Product status
       - `totalInventory`: Total inventory count
       - `priceRange`: Product price range
       - `images`: Product images

2. `get-product-by-id`
   - Get detailed information about a specific product
   - Inputs:
     - `productId` (string, required): The GID of the product to fetch
   - Returns:
     - Product object containing:
       - `id`: Product ID
       - `title`: Product title
       - `handle`: URL-friendly handle
       - `description`: Product description
       - `descriptionHtml`: HTML-formatted description
       - `status`: Product status
       - `totalInventory`: Total inventory count
       - `variants`: Product variants
       - `images`: Product images
       - `collections`: Associated collections

3. `update-product`
   - Update a product's details
   - Inputs:
     - `productId` (string, required): The GID of the product to update
     - `title` (optional string): New product title
     - `descriptionHtml` (optional string): New HTML description
   - Returns:
     - Updated product object containing:
       - `id`: Product ID
       - `title`: Updated title
       - `descriptionHtml`: Updated description
       - `updatedAt`: Update timestamp

### Best Practices for Content Management

1. **SEO Optimization**
   - Use descriptive titles and handles
   - Provide meta descriptions for all content
   - Include relevant keywords naturally
   - Keep URLs clean and meaningful
   - Use proper heading hierarchy in HTML content

2. **Content Organization**
   - Group related products in collections
   - Use consistent naming conventions
   - Maintain a clear content hierarchy
   - Keep product descriptions detailed and accurate
   - Use high-quality images with descriptive alt text

3. **Performance Considerations**
   - Optimize image sizes
   - Use appropriate query limits
   - Cache frequently accessed content
   - Batch updates when possible
   - Monitor API usage

4. **Content Management Tips**
   - Regular content audits
   - Consistent branding across all content
   - Mobile-friendly formatting
   - Regular backups of important content
   - Version control for major changes

### Error Handling

All tools include comprehensive error handling:
- Invalid ID errors
- Permission errors
- Rate limiting errors
- Validation errors
- Network errors

Error responses include:
- Error code
- Field causing the error
- Detailed error message
- Suggestions for resolution

### API Limitations

1. **Rate Limits**
   - Respect Shopify's API rate limits
   - Use appropriate query limits
   - Implement retry logic for failed requests
   - Monitor API usage

2. **Content Restrictions**
   - Maximum content lengths
   - Supported HTML tags
   - Image size limits
   - API version compatibility

3. **Authentication**
   - Required access scopes
   - Token expiration
   - IP restrictions
   - App permissions