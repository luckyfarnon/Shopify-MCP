import { titleQuery } from "../utils/sanitize.js";
import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getBlogs
const GetBlogsInputSchema = z.object({
  searchTitle: z.string().optional().describe("Optional search term to filter blogs by title"),
  limit: z.number().int().min(1).max(250).default(10).describe("Maximum number of blogs to return (default: 10)")
});

type GetBlogsInput = z.infer<typeof GetBlogsInputSchema>;

// Will be initialized in index.ts
let shopifyClient: GraphQLClient;

/**
 * Tool for fetching blogs with their details
 * @returns {Object} List of blogs with their details
 */
const getBlogs = {
  name: "get-blogs",
  description: "Get all blogs or search by title",
  schema: GetBlogsInputSchema,

  initialize(client: GraphQLClient) {
    shopifyClient = client;
  },

  execute: async (input: GetBlogsInput) => {
    try {
      const { searchTitle, limit } = input;

      const query = gql`
        query GetBlogs($first: Int!, $query: String) {
          blogs(first: $first, query: $query) {
            nodes {
              id
              handle
              title
              updatedAt
              commentPolicy
              feed {
                path
                location
              }
              createdAt
              templateSuffix
              tags
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
          }
        }
      `;

      const variables = {
        first: limit,
        query: titleQuery(searchTitle)
      };

      const data = await shopifyClient.request(query, variables) as {
        blogs: {
          nodes: Array<{
            id: string;
            handle: string;
            title: string;
            updatedAt: string;
            commentPolicy: string;
            feed: {
              path: string;
              location: string;
            } | null;
            createdAt: string;
            templateSuffix: string | null;
            tags: string[];
          }>;
          pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string;
            endCursor: string;
          };
        };
      };

      return { 
        blogs: data.blogs.nodes,
        pageInfo: data.blogs.pageInfo
      };
    } catch (error) {
      console.error("Error fetching blogs:", error);
      throw new Error(
        `Failed to fetch blogs: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getBlogs }; 