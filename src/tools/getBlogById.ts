import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";
import { gid, safeHtml, tagList } from "../utils/sanitize.js";

const GetBlogByIdInputSchema = z.object({
  blogId: gid("Blog").describe("The GID of the blog to fetch (e.g., \"gid://shopify/Blog/1234567890\")")
});

type GetBlogByIdInput = z.infer<typeof GetBlogByIdInputSchema>;

let shopifyClient: GraphQLClient;

const getBlogById = {
  name: "get-blog-by-id",
  description: "Get a specific blog by ID with all its details",
  schema: GetBlogByIdInputSchema,

  initialize(client: GraphQLClient) {
    shopifyClient = client;
  },

  async execute(input: GetBlogByIdInput) {
    try {
      const query = gql`
        query GetBlogById($id: ID!) {
          blog(id: $id) {
            id
            title
            handle
            templateSuffix
            commentPolicy
            createdAt
            updatedAt
            articles(first: 5) {
              nodes {
                id
                title
                handle
                publishedAt
                author {
                  name
                }
                tags
              }
            }
          }
        }
      `;

      const data = await shopifyClient.request(query, { id: input.blogId }) as {
        blog: {
          id: string;
          title: string;
          handle: string;
          templateSuffix: string | null;
          commentPolicy: string;
          createdAt: string;
          updatedAt: string;
          articles: {
            nodes: Array<{
              id: string;
              title: string;
              handle: string;
              publishedAt: string;
              author: {
                name: string;
              } | null;
              tags: string[];
            }>;
          };
        };
      };

      return {
        blog: data.blog
      };
    } catch (error) {
      console.error("Error fetching blog by ID:", error);
      throw new Error(
        `Failed to fetch blog: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
};

export { getBlogById }; 