import { titleQuery } from "../utils/sanitize.js";
import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getCollections
const GetCollectionsInputSchema = z.object({
  searchTitle: z.string().optional().describe("Optional search term to filter collections by title"),
  limit: z.number().int().min(1).max(250).default(10).describe("Maximum number of collections to return (default: 10)")
});

type GetCollectionsInput = z.infer<typeof GetCollectionsInputSchema>;

// Will be initialized in index.ts
let shopifyClient: GraphQLClient;

const GET_COLLECTIONS_QUERY = `
  query GetCollections($first: Int!, $query: String) {
    collections(first: $first, query: $query) {
      nodes {
        id
        handle
        title
        updatedAt
        descriptionHtml
        sortOrder
        templateSuffix
      }
    }
  }
`;

/**
 * Tool for fetching collections with their details
 * @returns {Object} List of collections with their details
 */
const getCollections = {
  name: "get-collections",
  description: "Get all collections or search by title",
  schema: GetCollectionsInputSchema,

  initialize(client: GraphQLClient) {
    shopifyClient = client;
  },

  execute: async (input: GetCollectionsInput) => {
    try {
      const { searchTitle, limit } = input;

      const query = gql`${GET_COLLECTIONS_QUERY}`;

      const variables = {
        first: limit,
        query: titleQuery(searchTitle)
      };

      const data = await shopifyClient.request(query, variables) as {
        collections: {
          nodes: Array<{
            id: string;
            handle: string;
            title: string;
            updatedAt: string;
            descriptionHtml: string;
            sortOrder: string;
            templateSuffix: string;
          }>;
        };
      };

      const collections = data.collections.nodes.map(node => ({
        id: node.id,
        title: node.title,
        handle: node.handle,
        description: node.descriptionHtml,
        descriptionHtml: node.descriptionHtml,
        updatedAt: node.updatedAt,
        productsCount: 0, // Assuming productsCount is not available in the new query
        seo: {
          title: node.title,
          description: node.descriptionHtml
        },
        image: null, // Assuming image is not available in the new query
        products: []
      }));

      return { collections };
    } catch (error) {
      console.error("Error fetching collections:", error);
      throw new Error(
        `Failed to fetch collections: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getCollections }; 