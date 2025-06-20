import { PrismaClient, Product } from "../../generated/prisma";

const prisma = new PrismaClient();

export class ProductLogic {
  // Create a log and optionally connect to roles
  async createProduct(
    data: Omit<Product, "id"> & { categoryId?: number }
  ): Promise<Product> {
    const { categoryId, ...productData } = data;
    return prisma.product.create({
      data: {
        ...productData,
        category: categoryId
          ? {
              connect: {
                id: categoryId,
              },
            }
          : {},
      },
    });
  }

  // Get a product by id, including its roles
  async getProductById(id: number): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
    });
  }

  // Get all products, including their roles
  async getAllProducts(): Promise<Product[]> {
    return prisma.product.findMany({ include: { variants: true } });
  }

  // Update a product and optionally update its roles
  async updateProduct(
    id: number,
    data: Partial<Omit<Product, "id">> & { categoryId?: number }
  ): Promise<Product | null> {
    const { categoryId, ...productData } = data;
    return prisma.product.update({
      where: { id },
      data: {
        ...productData,
        category: categoryId
          ? {
              connect: {
                id: categoryId,
              },
            }
          : {},
      },
    });
  }

  // Delete a product (removes from join table as well)
  async deleteProduct(id: number): Promise<Product | null> {
    return prisma.product.delete({
      where: { id },
    });
  }
}
