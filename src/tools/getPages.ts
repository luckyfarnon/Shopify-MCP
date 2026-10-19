import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getPages
const GetPagesInputSchema = z.object({
  searchTitle: z.string().optional().describe("Optional search term to filter pages by title"),
  limit: z.number().int().min(1).max(250).default(10).describe("Maximum number of pages to return (default: 10)")
});

type GetPagesInput = z.infer<typeof GetPagesInputSchema>;

// Will be initialized in index.ts
let shopifyClient: GraphQLClient;

const GET_PAGES_QUERY = `
  query PageList($first: Int!) {
    pages(first: $first) {
      edges {
        node {
          id
          title
          handle
          bodySummary
          body
          createdAt
          updatedAt
          publishedAt
        }
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

/**
 * Tool for fetching pages with their details
 * @returns {Object} List of pages with their details
 */
const getPages = {
  name: "get-pages",
  description: "Get all pages or search by title",
  schema: GetPagesInputSchema,

  initialize(client: GraphQLClient) {
    shopifyClient = client;
  },

  execute: async (input: GetPagesInput) => {
    try {
      const { searchTitle, limit } = input;

      const query = gql`${GET_PAGES_QUERY}`;

      const variables = {
        first: limit
      };

      const data = await shopifyClient.request(query, variables) as {
        pages: {
          edges: Array<{
            node: {
              id: string;
              title: string;
              handle: string;
              bodySummary: string;
              body: string;
              createdAt: string;
              updatedAt: string;
              publishedAt: string;
            };
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
        pages: data.pages.edges.map(edge => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          bodySummary: edge.node.bodySummary,
          body: edge.node.body,
          createdAt: edge.node.createdAt,
          updatedAt: edge.node.updatedAt,
          publishedAt: edge.node.publishedAt
        }))
      };
    } catch (error) {
      console.error("Error fetching pages:", error);
      throw new Error(
        `Failed to fetch pages: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getPages }; 
