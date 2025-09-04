import { Category, PrismaClient, Product } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

export class CategoryLogic {
  // Create a category and optionally connect to products
  async createCategory(
    data: Omit<Category, "id"> & {
      productIds?: number[];
      childrenIds?: number[];
    }
  ): Promise<Category> {
    const {
      productIds,
      childrenIds,
      status,
      display,
      parentId,
      imgUrl,
      ...categoryData
    } = data;
    return prisma.category.create({
      data: {
        ...categoryData,
        parent: parentId
          ? {
              connect: { id: Number(parentId) },
            }
          : {},

        slug: slugify(data.name.toLocaleLowerCase()),
        status:
          typeof status == "boolean"
            ? status
            : (status as unknown as string).includes("true")
              ? true
              : false,
        imgUrl: `uploads/${imgUrl}`,
        display:
          typeof display == "boolean"
            ? display
            : display !== undefined &&
                (display as unknown as string).includes("true")
              ? true
              : false,
        products: productIds
          ? {
              connect: productIds.map((productId) => ({ id: productId })),
            }
          : undefined,
        children: childrenIds
          ? {
              connect: childrenIds.map((childrenId) => ({ id: childrenId })),
            }
          : undefined,
      },
      include: {
        children: true,
      },
    });
  }

  // Get a category by id, including its products
  async getCategoryById(
    id: number
  ): Promise<(Category & { products: Product[] }) | null> {
    return prisma.category.findUnique({
      where: { id },
      include: { products: true, children: true },
    });
  }

  // Get all categorys, including their products
  async getAllCategorys(): Promise<(Category & { products: Product[] })[]> {
    return prisma.category.findMany({
      include: {
        products: {
          include: {
            variants: {
              include: {
                stock: {
                  include: {
                    shop: {
                      include: {
                        address: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        children: true,
      },
    });
  }

  // Update a category and optionally update its products
  async updateCategory(
    id: number,
    data: Partial<Omit<Category, "id">> & { productIds?: number[] }
  ): Promise<(Category & { products: Product[] }) | null> {
    const { productIds, status, parentId, display, ...categoryData } = data;
    if (categoryData.imgUrl) {
      categoryData.imgUrl = categoryData.imgUrl.includes("uploads")
        ? categoryData.imgUrl
        : `uploads/${categoryData.imgUrl}`;
    }
    console.log(categoryData.imgUrl);
    return prisma.category.update({
      where: { id },
      data: {
        ...categoryData,
        parent:
          parentId !== null
            ? {
                connect: { id: parentId },
              }
            : {},
        slug: data.slug ?? slugify(data.name!.toLocaleLowerCase()),
        status: (status as unknown as string).includes("true") ? true : false,
        display: (display as unknown as string).includes("true") ? true : false,
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
