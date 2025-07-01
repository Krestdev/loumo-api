import { PrismaClient, Product } from "../../generated/prisma";
import slugify from "slugify";

const prisma = new PrismaClient();

export class ProductLogic {
  // Create a log and optionally connect to roles
  async createProduct(
    data: Omit<Product, "id" | "createdAt"> & { categoryId?: number }
  ): Promise<Product> {
    const { categoryId, ...productData } = data;
    const slug = slugify(data.name, { lower: true });
    return prisma.product.create({
      data: {
        ...productData,
        slug,
        createdAt: new Date(),
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
      include: {
        variants: {
          include: {
            stock: true,
          },
        },
      },
    });
  }

  // Get a product by slug, including its roles
  async getProductBySlug(slug: string): Promise<Product | null> {
    return prisma.product.findFirst({
      where: {
        slug,
      },
      include: {
        variants: {
          include: {
            stock: true,
          },
        },
      },
    });
  }

  // Get all products, including their roles
  async getAllProducts(): Promise<Product[]> {
    return prisma.product.findMany({
      include: {
        variants: {
          include: {
            stock: true,
          },
        },
        category: true,
      },
    });
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

  // Update Bulk product and optionally update its roles
  async updateBulkProduct(
    data: Partial<Product>[],
    categoryId?: number,
    status?: boolean
  ): Promise<number> {
    const ids = data.map((x) => x.id!);
    return prisma.product
      .updateMany({
        where: {
          id: {
            in: ids,
          },
        },
        data: {
          categoryId: categoryId,
          status: status,
        },
      })
      .then((res) => res.count);
  }

  // Delete a product (removes from join table as well)
  async deleteProduct(id: number): Promise<Product | null> {
    return prisma.product.delete({
      where: { id },
    });
  }

  // Delete a product (removes from join table as well)
  async deleteBulkProduct(ids: number[]): Promise<number> {
    return prisma.product
      .deleteMany({
        where: {
          id: {
            in: ids,
          },
        },
      })
      .then((res) => res.count);
  }
}
