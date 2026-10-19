import { z } from "zod";
import { gid, safeHtml, tagList } from "../utils/sanitize.js";
import { GraphQLClient, gql } from "graphql-request";

// Schema definition for the tool
export const schema = z.object({
  blogId: gid("Blog").describe("The GID of the blog to create the article in (e.g., \"gid://shopify/Blog/1234567890\")"),
  title: z.string().min(1).describe("The title of the article"),
  content: safeHtml.pipe(z.string().min(1)).describe("The content of the article in HTML format"),
  author: z.object({
    name: z.string().min(1).describe("The name of the article's author")
  }),
  published: z.boolean().optional().describe("Whether to publish the article immediately"),
  tags: tagList.optional().describe("Tags to categorize the article")
});

// Define response types
interface ArticleResponse {
  articleCreate: {
    article: {
      id: string;
      title: string;
      handle: string;
      body: string;
      summary: string | null;
      tags: string[];
      author: {
        name: string;
      };
    };
    userErrors: Array<{
      field: string;
      message: string;
    }>;
  };
}

// GraphQL mutation for creating an article
const CREATE_ARTICLE_MUTATION = gql`
  mutation CreateArticle($article: ArticleCreateInput!) {
    articleCreate(article: $article) {
      article {
        id
        title
        handle
        body
        summary
        tags
        author {
          name
        }
        image {
          altText
          originalSrc
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`;

// Tool implementation
export const createArticle = {
  schema,
  initialize: (client: GraphQLClient) => {
    createArticle.client = client;
  },
  client: null as GraphQLClient | null,
  execute: async (args: z.infer<typeof schema>) => {
    if (!createArticle.client) {
      throw new Error("GraphQL client not initialized");
    }

    const variables = {
      article: {
        blogId: args.blogId,
        title: args.title,
        body: args.content,
        author: args.author,
        isPublished: args.published,
        tags: args.tags
      }
    };

    try {
      const response = await createArticle.client.request<{
        articleCreate: {
          article: {
            id: string;
            title: string;
            handle: string;
            body: string;
            summary: string | null;
            tags: string[];
            author: {
              name: string;
            };
            image: {
              altText: string | null;
              originalSrc: string;
            } | null;
          };
          userErrors: Array<{
            field: string;
            message: string;
          }>;
        };
      }>(CREATE_ARTICLE_MUTATION, variables);

      if (response.articleCreate.userErrors.length > 0) {
        throw new Error(
          `Failed to create article: ${response.articleCreate.userErrors
            .map((error) => `${error.field}: ${error.message}`)
            .join(", ")}`
        );
      }

      return response.articleCreate.article;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to create article: ${error.message}`);
      }
      throw error;
    }
  }
};

export default createArticle; 