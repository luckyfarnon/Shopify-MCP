import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";
import { gid, safeHtml, tagList } from "../utils/sanitize.js";

const GetArticleByIdInputSchema = z.object({
  articleId: gid("Article").describe("The GID of the article to fetch (e.g., \"gid://shopify/Article/1234567890\")")
});

type GetArticleByIdInput = z.infer<typeof GetArticleByIdInputSchema>;

let shopifyClient: GraphQLClient;

const getArticleById = {
  name: "get-article-by-id",
  description: "Get a specific article by ID with all its details",
  schema: GetArticleByIdInputSchema,

  initialize(client: GraphQLClient) {
    shopifyClient = client;
  },

  async execute(input: GetArticleByIdInput) {
    try {
      const query = gql`
        query GetArticleById($id: ID!) {
          article(id: $id) {
            id
            title
            handle
            author {
              name
            }
            blog {
              id
              title
            }
            body
            publishedAt
            tags
          }
        }
      `;

      const data = await shopifyClient.request(query, { id: input.articleId }) as {
        article: {
          id: string;
          title: string;
          handle: string;
          author: {
            name: string;
          } | null;
          blog: {
            id: string;
            title: string;
          };
          body: string;
          publishedAt: string;
          tags: string[];
        };
      };

      return {
        article: data.article
      };
    } catch (error) {
      console.error("Error fetching article by ID:", error);
      throw new Error(
        `Failed to fetch article: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }
};

export { getArticleById }; 