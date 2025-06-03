# Shopify MCP Server

(please leave a star if you like!)

MCP Server for Shopify API, enabling interaction with store data through GraphQL API. This server provides tools for managing products, customers, orders, and more.

**📦 Package Name: `shopify-mcp`**  
**🚀 Command: `shopify-mcp` (NOT `shopify-mcp-server`)**

<a href="https://glama.ai/mcp/servers/@GeLi2001/shopify-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@GeLi2001/shopify-mcp/badge" alt="Shopify MCP server" />
</a>

## Features

- **Product Management**: Search and retrieve product information
- **Customer Management**: Load customer data and manage customer tags
- **Order Management**: Advanced order querying and filtering
- **Blog Management**: Create and manage blog content and settings
- **Article Management**: Author and update blog articles with rich content
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

   - Get all products or search by title, including SEO-relevant fields
   - Inputs:
     - `searchTitle` (optional string): Filter products by title
     - `limit` (number, default: 10): Maximum number of products to return
   - Returns:
     - Array of products, each containing:
       - `title`: Product title (SEO-optimized)
       - `description`: Plain text product description
       - `descriptionHtml`: HTML-formatted product description
       - Additional fields: id, handle, status, inventory, pricing, etc.

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
   - Update a product's details including SEO-relevant fields
   - Inputs:
     - `productId` (string): The GID of the product to update (e.g., "gid://shopify/Product/1234567890")
     - `title` (optional string): The new title for the product
     - `descriptionHtml` (optional string): The new HTML description for the product
   - Returns:
     - Updated product object containing:
       - `title`: Updated product title
       - `descriptionHtml`: Updated HTML description
       - Additional fields: id, handle, status, updatedAt

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

### Customer Management

1. `get-customers`

   - Get customers or search by name/email
   - Inputs:
     - `searchQuery` (optional string): Filter customers by name or email
     - `limit` (optional number, default: 10): Maximum number of customers to return

2. `update-customer`

   - Update a customer's information
   - Inputs:
     - `id` (string, required): Shopify customer ID (numeric ID only, like "6276879810626")
     - `firstName` (string, optional): Customer's first name
     - `lastName` (string, optional): Customer's last name
     - `email` (string, optional): Customer's email address
     - `phone` (string, optional): Customer's phone number
     - `tags` (array of strings, optional): Tags to apply to the customer
     - `note` (string, optional): Note about the customer
     - `taxExempt` (boolean, optional): Whether the customer is exempt from taxes
     - `metafields` (array of objects, optional): Customer metafields for storing additional data

3. `get-customer-orders`
   - Get orders for a specific customer
   - Inputs:
     - `customerId` (string, required): Shopify customer ID (numeric ID only, like "6276879810626")
     - `limit` (optional number, default: 10): Maximum number of orders to return

### Order Management

1. `get-orders`

   - Get orders with optional filtering
   - Inputs:
     - `status` (optional string): Filter by order status
     - `limit` (optional number, default: 10): Maximum number of orders to return

2. `get-order-by-id`

   - Get a specific order by ID
   - Inputs:
     - `orderId` (string, required): Full Shopify order ID (e.g., "gid://shopify/Order/6090960994370")

3. `update-order`

   - Update an existing order with new information
   - Inputs:
     - `id` (string, required): Shopify order ID
     - `tags` (array of strings, optional): New tags for the order
     - `email` (string, optional): Update customer email
     - `note` (string, optional): Order notes
     - `customAttributes` (array of objects, optional): Custom attributes for the order
     - `metafields` (array of objects, optional): Order metafields
     - `shippingAddress` (object, optional): Shipping address information

### Blog Management

1. `get-blogs`

   - Get all blogs or search by title
   - Inputs:
     - `searchTitle` (optional string): Filter blogs by title
     - `limit` (optional number, default: 10): Maximum number of blogs to return
   - Returns:
     - Array of blogs, each containing:
       - `id`: Blog ID
       - `title`: Blog title
       - `handle`: URL-friendly handle
       - `templateSuffix`: Template suffix for custom themes
       - `commentPolicy`: Comment moderation policy

2. `update-blog`

   - Update a blog's details
   - Inputs:
     - `blogId` (string, required): The GID of the blog to update (e.g., "gid://shopify/Blog/1234567890")
     - `title` (string, optional): The new title for the blog
     - `handle` (string, optional): The URL-friendly handle for the blog
     - `templateSuffix` (string, optional): The template suffix for the blog
     - `commentPolicy` (string, optional): The comment policy ("MODERATED" or "CLOSED")
   - Returns:
     - Updated blog object containing all modified fields

### Article Management

1. `get-articles`

   - Get articles from a specific blog
   - Inputs:
     - `blogId` (string, required): The GID of the blog to get articles from (e.g., "gid://shopify/Blog/1234567890")
     - `searchTitle` (optional string): Filter articles by title
     - `limit` (optional number, default: 10): Maximum number of articles to return
   - Returns:
     - Array of articles, each containing:
       - `id`: Article ID
       - `title`: Article title
       - `handle`: URL-friendly handle
       - `body`: Article content
       - `summary`: Article summary
       - `tags`: Array of tags
       - `author`: Author information
       - `image`: Featured image details

2. `update-article`

   - Update an article's content and metadata
   - Inputs:
     - `articleId` (string, required): The GID of the article to update (e.g., "gid://shopify/Article/1234567890")
     - `title` (string, optional): The new title for the article
     - `body` (string, optional): The new content for the article
     - `summary` (string, optional): A short summary of the article
     - `tags` (array of strings, optional): Tags for the article
     - `author` (object, optional): Author information with `name` field
   - Returns:
     - Updated article object containing:
       - All modified fields
       - Additional metadata like handle, image, and timestamps

### Using MCP Tools with LLMs (AI Usage Guide)

The Shopify MCP tools are designed to work seamlessly with Large Language Models (LLMs) like Claude. Here are some best practices for LLMs using these tools:

1. **Content Management Flow**
   - Use `get-blogs` to list available blogs
   - Use `get-articles` to fetch articles from a specific blog
   - Use `update-blog` and `update-article` for content modifications
   - Always preserve existing metadata when updating content

2. **SEO Optimization**
   - When updating titles and descriptions, maintain keyword relevance
   - Use `summary` field in articles for meta descriptions
   - Keep article tags consistent and relevant
   - Ensure author information is properly maintained

3. **Error Handling**
   - Check for `userErrors` in update responses
   - Validate GIDs before using them in updates
   - Maintain existing fields when only updating specific attributes

4. **Content Structure**
   - Use HTML formatting in article bodies when needed
   - Keep summaries concise (recommended: 150-160 characters)
   - Use consistent tag structures across articles
   - Follow blog's existing content patterns

5. **Best Practices**
   - Always fetch existing content before updates
   - Preserve important metadata during updates
   - Use appropriate comment policies for blogs
   - Maintain consistent author attribution

## Debugging

If you encounter issues, check Claude Desktop's MCP logs:

```
tail -n 20 -f ~/Library/Logs/Claude/mcp*.log
```

## License

MIT
