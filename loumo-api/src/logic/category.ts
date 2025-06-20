import { PrismaClient, Category, Product } from "../../generated/prisma";

const prisma = new PrismaClient();

export class CategoryLogic {
  // Create a category and optionally connect to products
  async createCategory(
    data: Omit<Category, "id"> & { productIds?: number[] }
  ): Promise<Category> {
    const { productIds, ...categoryData } = data;
    return prisma.category.create({
      data: {
        ...categoryData,
        products: productIds
          ? {
              connect: productIds.map((productId) => ({ id: productId })),
            }
          : undefined,
      },
    });
  }

  // Get a category by id, including its products
  async getCategoryById(
    id: number
  ): Promise<(Category & { products: Product[] }) | null> {
    return prisma.category.findUnique({
      where: { id },
      include: { products: true },
    });
  }

  // Get all categorys, including their products
  async getAllCategorys(): Promise<(Category & { products: Product[] })[]> {
    return prisma.category.findMany({
      include: {
        products: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  // Update a category and optionally update its products
  async updateCategory(
    id: number,
    data: Partial<Omit<Category, "id">> & { productIds?: number[] }
  ): Promise<(Category & { products: Product[] }) | null> {
    const { productIds, ...categoryData } = data;
    return prisma.category.update({
      where: { id },
      data: {
        ...categoryData,
        products: productIds
          ? {
              connect: productIds.map((roleId) => ({ id: roleId })),
            }
          : {},
      },
      include: {
        products: {
          include: {
            variants: true,
          },
        },
      },
    });
  }

  // Delete a category (removes from join table as well)
  async deleteCategory(
    id: number
  ): Promise<(Category & { products: Product[] }) | null> {
    return prisma.category.delete({
      where: { id },
      include: { products: true },
    });
  }
}
