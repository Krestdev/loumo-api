import { PrismaClient, ProductVariant } from "../../generated/prisma";

const prisma = new PrismaClient();

export class ProductVariantLogic {
  // Create a log and optionally connect to roles
  async createProduct(
    data: Omit<ProductVariant, "id"> & { productId?: number }
  ): Promise<ProductVariant> {
    const { productId, ...productVariantData } = data;
    return prisma.productVariant.create({
      data: {
        ...productVariantData,
        product: productId
          ? {
              connect: {
                id: productId,
              },
            }
          : {},
      },
    });
  }

  // Get a product by id, including its roles
  async getProductById(id: number): Promise<ProductVariant | null> {
    return prisma.productVariant.findUnique({
      where: { id },
    });
  }

  // Get all products, including their roles
  async getAllProducts(): Promise<ProductVariant[]> {
    return prisma.productVariant.findMany();
  }

  // Update a product and optionally update its roles
  async updateProduct(
    id: number,
    data: Partial<Omit<ProductVariant, "id">> & { productId?: number }
  ): Promise<ProductVariant | null> {
    const { productId, ...productVariantData } = data;
    return prisma.productVariant.update({
      where: { id },
      data: {
        ...productVariantData,
        product: productId
          ? {
              connect: {
                id: productId,
              },
            }
          : {},
      },
    });
  }

  // Delete a product (removes from join table as well)
  async deleteProduct(id: number): Promise<ProductVariant | null> {
    return prisma.productVariant.delete({
      where: { id },
    });
  }
}
