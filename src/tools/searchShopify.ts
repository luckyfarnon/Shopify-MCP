import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";
import { escapeSearchTerm } from "../utils/sanitize.js";

const SearchShopifyInputSchema = z.object({
  query: z.string().min(1).max(200).describe("The search query to find content across the store"),
  types: z.array(z.enum(["ARTICLE", "BLOG", "PAGE", "PRODUCT"])).optional().describe("Types of resources to search for. If not specified, searches all types."),
  first: z.number().min(1).max(50).optional().default(10).describe("Number of results to return (max 50)")
});

type SearchShopifyInput = z.infer<typeof SearchShopifyInputSchema>;

interface SearchNode {
  id: string;
  title: string;
  handle: string;
  summary?: string | null;
  bodySummary?: string | null;
  description?: string | null;
  blog?: {
    title: string;
  };
}

interface SearchResponse {
  [key: string]: {
    nodes: SearchNode[];
  };
}

let shopifyClient: GraphQLClient;

const searchShopify = {
  name: "search-shopify",
  description: "Search across all content types in the Shopify store (products, articles, blogs, pages)",
  schema: SearchShopifyInputSchema,

  initialize(client: GraphQLClient) {
    shopifyClient = client;
  },

  async execute(input: SearchShopifyInput) {
    try {
      // We'll query each type separately since Shopify doesn't have a unified search endpoint
      const queries = {
        ARTICLE: gql`
          query SearchArticles($query: String!, $first: Int!) {
            articles(first: $first, query: $query) {
              nodes {
                id
                title
                handle
                summary
                blog {
                  title
                }
              }
            }
          }
        `,
        BLOG: gql`
          query SearchBlogs($query: String!, $first: Int!) {
            blogs(first: $first, query: $query) {
              nodes {
                id
                title
                handle
              }
            }
          }
        `,
        PAGE: gql`
          query SearchPages($query: String!, $first: Int!) {
            pages(first: $first, query: $query) {
              nodes {
                id
                title
                handle
                bodySummary
              }
            }
          }
        `,
        PRODUCT: gql`
          query SearchProducts($query: String!, $first: Int!) {
            products(first: $first, query: $query) {
              nodes {
                id
                title
                handle
                description
              }
            }
          }
        `
      };

      const types = input.types || ["ARTICLE", "BLOG", "PAGE", "PRODUCT"];
      const results: Record<string, any> = {};

      // Execute queries for each requested type
      await Promise.all(
        types.map(async (type) => {
          try {
            const data = await shopifyClient.request(queries[type], {
              query: escapeSearchTerm(input.query),
              first: input.first
            }) as SearchResponse;
            
            const key = type.toLowerCase() + "s";
            results[type.toLowerCase()] = data[key].nodes.map((node: SearchNode) => ({
              id: node.id,
              title: node.title,
              handle: node.handle,
              summary: node.summary || node.bodySummary || node.description || null,
              ...(node.blog ? { blogTitle: node.blog.title } : {})
            }));
          } catch (error) {
            console.error(`Error searching ${type}:`, error);
            results[type.toLowerCase()] = [];
          }
        })
      );

      return {
        results
      };
    } catch (error) {
      console.error("Error searching Shopify:", error);
      throw new Error(
        `Failed to search Shopify: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
};

export { searchShopify }; 