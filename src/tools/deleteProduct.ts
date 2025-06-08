import { z } from "zod";
import { GraphQLClient, gql } from "graphql-request";

// Schema definition for the tool
export const schema = z.object({
  productId: z.string(),
});

// GraphQL mutation for deleting a product
const DELETE_PRODUCT_MUTATION = gql`
  mutation ProductDelete($id: ID!) {
    productDelete(id: $id) {
      deletedProductId
    }
  }
`;

// Tool implementation
export const deleteProduct = {
  schema,
  initialize: (client: GraphQLClient) => {
    deleteProduct.client = client;
  },
  client: null as GraphQLClient | null,
  execute: async (args: z.infer<typeof schema>) => {
    if (!deleteProduct.client) {
      throw new Error("GraphQL client not initialized");
    }

    const { productId } = args;

    const response = await deleteProduct.client.request(
      DELETE_PRODUCT_MUTATION,
      { id: productId }
    );

    return response;
  }
};

export default deleteProduct;
