import type { GraphQLClient } from "graphql-request";
import { gql } from "graphql-request";
import { z } from "zod";

// Input schema for getArticles
const GetArticlesInputSchema = z.object({
  blogId: z.string().min(1).describe("The GID of the blog to get articles from (e.g., \"gid://shopify/Blog/1234567890\")"),
  searchTitle: z.string().optional().describe("Optional search term to filter articles by title"),
  limit: z.number().int().min(1).max(250).default(10).describe("Maximum number of articles to return (default: 10)")
});

type GetArticlesInput = z.infer<typeof GetArticlesInputSchema>;

// Will be initialized in index.ts
let shopifyClient: GraphQLClient;

/**
 * Tool for fetching blog articles with their details
 * @returns {Object} List of articles with their details
 */
const getArticles = {
  name: "get-articles",
  description: "Get all articles from a blog or search by title",
  schema: GetArticlesInputSchema,

  initialize(client: GraphQLClient) {
    shopifyClient = client;
  },

  execute: async (input: GetArticlesInput) => {
    try {
      const { blogId, searchTitle, limit } = input;

      const query = gql`
        query GetArticles($blogId: ID!, $first: Int!) {
          blog(id: $blogId) {
            id
            title
            articles(first: $first) {
              edges {
                node {
                  id
                  title
                  handle
                  author {
                    name
                  }
                  publishedAt
                  tags
                  image {
                    id
                    url
                    altText
                  }
                  comments(first: 0) {
                    pageInfo {
                      hasNextPage
                      hasPreviousPage
                    }
                  }
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
        }
      `;

      const variables = {
        blogId,
        first: limit
      };

      const data = await shopifyClient.request(query, variables) as {
        blog: {
          id: string;
          title: string;
          articles: {
            edges: Array<{
              node: {
                id: string;
                title: string;
                handle: string;
                author: {
                  name: string;
                } | null;
                publishedAt: string;
                tags: string[];
                image: {
                  id: string;
                  url: string;
                  altText: string | null;
                } | null;
                comments: {
                  pageInfo: {
                    hasNextPage: boolean;
                    hasPreviousPage: boolean;
                  };
                };
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
      };

      return { 
        blogId: data.blog.id,
        blogTitle: data.blog.title,
        articles: data.blog.articles.edges.map(edge => ({
          id: edge.node.id,
          title: edge.node.title,
          handle: edge.node.handle,
          author: edge.node.author,
          publishedAt: edge.node.publishedAt,
          tags: edge.node.tags,
          image: edge.node.image,
          hasComments: edge.node.comments.pageInfo.hasNextPage || edge.node.comments.pageInfo.hasPreviousPage
        })),
        pageInfo: data.blog.articles.pageInfo
      };
    } catch (error) {
      console.error("Error fetching articles:", error);
      throw new Error(
        `Failed to fetch articles: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
};

export { getArticles }; 