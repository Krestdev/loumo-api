import { PrismaClient, ProductVariant } from "../../generated/prisma";
import deleteImage from "../utils/deleteImage";

const prisma = new PrismaClient();

export class ProductVariantLogic {
  // Create a log and optionally connect to roles
  async createProduct(
    data: Omit<ProductVariant, "id"> & { productId?: number }
  ): Promise<ProductVariant> {
    const { productId, weight, price, status, imgUrl, ...productVariantData } =
      data;
    return prisma.productVariant.create({
      data: {
        ...productVariantData,
        imgUrl: `uploads/${imgUrl}`,
        weight: Number(weight),
        price: Number(price),
        status: Boolean(status),
        product: productId
          ? {
              connect: {
                id: Number(productId),
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
    return prisma.productVariant.findMany({
      include: {
        stock: true,
      },
    });
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
    const product = await prisma.productVariant.findUnique({
      where: { id: id },
    });

    if (!product) throw Error("Delete Product not found");

    if (product.imgUrl) deleteImage(product.imgUrl.split("/")[1]);

    return prisma.productVariant.delete({
      where: { id },
    });
  }
}
