#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import dotenv from "dotenv";
import { GraphQLClient } from "graphql-request";
import minimist from "minimist";
import { z } from "zod";

// Import tools
import { getProductById } from "./tools/getProductById.js";
import { getProducts } from "./tools/getProducts.js";
import { updateProduct } from "./tools/updateProduct.js";
import { getCollections } from "./tools/getCollections.js";
import { updateCollection } from "./tools/updateCollection.js";
import { getPages } from "./tools/getPages.js";
import { updatePage } from "./tools/updatePage.js";
import { getBlogs } from "./tools/getBlogs.js";
import { updateBlog } from "./tools/updateBlog.js";
import { getArticles } from "./tools/getArticles.js";
import { updateArticle } from "./tools/updateArticle.js";
import { getBlogById } from "./tools/getBlogById.js";
import { getArticleById } from "./tools/getArticleById.js";
import { searchShopify } from "./tools/searchShopify.js";
import { createArticle } from "./tools/createArticle.js";
import { deleteProduct } from "./tools/deleteProduct.js";

// Parse command line arguments
const argv = minimist(process.argv.slice(2));

// Load environment variables from .env file (if it exists)
dotenv.config();

// Define environment variables - from command line or .env file
const SHOPIFY_ACCESS_TOKEN =
  argv.accessToken || process.env.SHOPIFY_ACCESS_TOKEN;
const MYSHOPIFY_DOMAIN = argv.domain || process.env.MYSHOPIFY_DOMAIN;

// Store in process.env for backwards compatibility
process.env.SHOPIFY_ACCESS_TOKEN = SHOPIFY_ACCESS_TOKEN;
process.env.MYSHOPIFY_DOMAIN = MYSHOPIFY_DOMAIN;

// Validate required environment variables
if (!SHOPIFY_ACCESS_TOKEN) {
  console.error("Error: SHOPIFY_ACCESS_TOKEN is required.");
  console.error("Please provide it via command line argument or .env file.");
  console.error("  Command line: --accessToken=your_token");
  process.exit(1);
}

if (!MYSHOPIFY_DOMAIN) {
  console.error("Error: MYSHOPIFY_DOMAIN is required.");
  console.error("Please provide it via command line argument or .env file.");
  console.error("  Command line: --domain=your-store.myshopify.com");
  process.exit(1);
}

// Create Shopify GraphQL client
const shopifyClient = new GraphQLClient(
  `https://${MYSHOPIFY_DOMAIN}/admin/api/2025-01/graphql.json`,
  {
    headers: {
      "X-Shopify-Access-Token": SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json"
    }
  }
);

// Initialize tools with GraphQL client
getProducts.initialize(shopifyClient);
getProductById.initialize(shopifyClient);
updateProduct.initialize(shopifyClient);
getCollections.initialize(shopifyClient);
updateCollection.initialize(shopifyClient);
getPages.initialize(shopifyClient);
updatePage.initialize(shopifyClient);
getBlogs.initialize(shopifyClient);
updateBlog.initialize(shopifyClient);
getArticles.initialize(shopifyClient);
updateArticle.initialize(shopifyClient);
getBlogById.initialize(shopifyClient);
getArticleById.initialize(shopifyClient);
searchShopify.initialize(shopifyClient);
createArticle.initialize(shopifyClient);
deleteProduct.initialize(shopifyClient);

// Set up MCP server
const server = new McpServer({
  name: "shopify",
  version: "1.0.0",
  description:
    "MCP Server for Shopify API, enabling interaction with store data through GraphQL API"
});

// Add tools individually, using their schemas directly
server.tool(
  "get-products",
  {
    searchTitle: z.string().optional(),
    limit: z.number().default(10)
  },
  async (args) => {
    const result = await getProducts.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

server.tool(
  "delete-product",
  deleteProduct.schema.shape,
  async (args: z.infer<typeof deleteProduct.schema>) => {
    const result = await deleteProduct.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

server.tool(
  "get-product-by-id",
  {
    productId: z.string().min(1)
  },
  async (args) => {
    const result = await getProductById.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

server.tool(
  "get-collections",
  {
    searchTitle: z.string().optional(),
    limit: z.number().default(10)
  },
  async (args) => {
    const result = await getCollections.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the updateCollection tool
server.tool(
  "update-collection",
  {
    collectionId: z.string().min(1).describe("The GID of the collection to update (e.g., \"gid://shopify/Collection/1234567890\")"),
    title: z.string().optional(),
    description: z.string().optional(),
    descriptionHtml: z.string().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional()
    }).optional()
  },
  async (args) => {
    const result = await updateCollection.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the getPages tool
server.tool(
  "get-pages",
  {
    searchTitle: z.string().optional(),
    limit: z.number().default(10)
  },
  async (args) => {
    const result = await getPages.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the updatePage tool
server.tool(
  "update-page",
  {
    pageId: z.string().min(1).describe("The GID of the page to update (e.g., \"gid://shopify/Page/1234567890\")"),
    title: z.string().optional(),
    body: z.string().optional(),
    bodyHtml: z.string().optional(),
    seo: z.object({
      title: z.string().optional(),
      description: z.string().optional()
    }).optional(),
    published: z.boolean().optional()
  },
  async (args) => {
    const result = await updatePage.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the getBlogs tool
server.tool(
  "get-blogs",
  {
    searchTitle: z.string().optional(),
    limit: z.number().default(10)
  },
  async (args) => {
    const result = await getBlogs.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the updateBlog tool
server.tool(
  "update-blog",
  {
    blogId: z.string().min(1).describe("The GID of the blog to update (e.g., \"gid://shopify/Blog/1234567890\")"),
    title: z.string().optional(),
    handle: z.string().optional(),
    templateSuffix: z.string().optional(),
    commentPolicy: z.enum(["MODERATED", "CLOSED"]).optional()
  },
  async (args) => {
    const result = await updateBlog.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the getArticles tool
server.tool(
  "get-articles",
  {
    blogId: z.string().min(1).describe("The GID of the blog to get articles from (e.g., \"gid://shopify/Blog/1234567890\")"),
    searchTitle: z.string().optional(),
    limit: z.number().default(10)
  },
  async (args) => {
    const result = await getArticles.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the updateArticle tool
server.tool(
  "update-article",
  {
    articleId: z.string().min(1).describe("The GID of the article to update (e.g., \"gid://shopify/Article/1234567890\")"),
    title: z.string().optional(),
    body: z.string().optional(),
    summary: z.string().optional(),
    tags: z.array(z.string()).optional(),
    author: z.object({
      name: z.string()
    }).optional()
  },
  async (args) => {
    const result = await updateArticle.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Register new tools
server.tool(
  "get-blog-by-id",
  getBlogById.schema.shape,
  async (args: z.infer<typeof getBlogById.schema>) => {
    const result = await getBlogById.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

server.tool(
  "get-article-by-id",
  getArticleById.schema.shape,
  async (args: z.infer<typeof getArticleById.schema>) => {
    const result = await getArticleById.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

server.tool(
  "search-shopify",
  searchShopify.schema.shape,
  async (args: z.infer<typeof searchShopify.schema>) => {
    const result = await searchShopify.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

server.tool(
  "create-article",
  createArticle.schema.shape,
  async (args: z.infer<typeof createArticle.schema>) => {
    const result = await createArticle.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Add the updateProduct tool
server.tool(
  "update-product",
  {
    productId: z.string().min(1).describe("The GID of the product to update (e.g., \"gid://shopify/Product/1234567890\")"),
    title: z.string().optional().describe("The new title for the product"),
    descriptionHtml: z.string().optional().describe("The new HTML description for the product"),
    seo: z.object({
      title: z.string().optional().describe("SEO-optimized title for the product"),
      description: z.string().optional().describe("SEO meta description for the product")
    }).optional().describe("SEO information for the product"),
    status: z.enum(["ACTIVE", "ARCHIVED", "DRAFT"]).optional().describe("Product status (ACTIVE, ARCHIVED, or DRAFT)"),
    vendor: z.string().optional().describe("The vendor or manufacturer of the product"),
    productType: z.string().optional().describe("The type or category of the product"),
    tags: z.array(z.string()).optional().describe("Array of tags to categorize the product"),
    variants: z.array(z.object({
      id: z.string().optional().describe("The GID of the variant to update"),
      price: z.string().optional().describe("The price of the variant"),
      compareAtPrice: z.string().optional().describe("Compare at price for showing a markdown"),
      sku: z.string().optional().describe("Stock keeping unit (SKU)"),
      barcode: z.string().optional().describe("Barcode (ISBN, UPC, GTIN, etc.)"),
      inventoryQuantity: z.number().optional().describe("Available inventory quantity"),
      inventoryPolicy: z.enum(["DENY", "CONTINUE"]).optional().describe("What happens when a variant is out of stock"),
      fulfillmentService: z.string().optional().describe("Service responsible for fulfilling the variant"),
      weight: z.number().optional().describe("Weight of the variant"),
      weightUnit: z.enum(["KILOGRAMS", "GRAMS", "POUNDS", "OUNCES"]).optional().describe("Unit of weight measurement")
    })).optional().describe("Product variants to update")
  },
  async (args) => {
    const result = await updateProduct.execute(args);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }]
    };
  }
);

// Start the server
const transport = new StdioServerTransport();
server
  .connect(transport)
  .then(() => {})
  .catch((error: unknown) => {
    console.error("Failed to start Shopify MCP Server:", error);
  });
