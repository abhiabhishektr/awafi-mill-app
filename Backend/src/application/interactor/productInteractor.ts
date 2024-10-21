import { ProductCreationDTO, ProductDTO } from "../../domain/dtos/ProductDTO";
import IProductInteractor from "../../interface/productInterface/IproductInteractor";
import Product from "../../domain/entities/productSchema";
import { responseHandler } from '../../types/commonTypes'; // Corrected spelling
import { ICloudinaryService } from "../../interface/serviceInterface/IcloudinaryInterface";
import { IproductRepo } from "../../interface/productInterface/IproductRepo";
import mongoose from "mongoose";

export class ProductInteractor implements IProductInteractor {
  private productRepo: IproductRepo;
  private cloudinaryService: ICloudinaryService;

  constructor(productRepo: IproductRepo, cloudinaryService: ICloudinaryService) {
    this.productRepo = productRepo;
    this.cloudinaryService = cloudinaryService;
  }

  // Adding a new product
  async addProduct(productData: ProductCreationDTO): Promise<ProductDTO | responseHandler> {
    const uploadedImages = await Promise.all(
      productData.images.map(async (path) => {
        const uploadResult = await this.cloudinaryService.uploadProductImage(path);
        return uploadResult.secure_url; // Return the Cloudinary URL
      })
    );

    productData.images = uploadedImages;

    const { name } = productData;
    const isAvailable = await this.productRepo.findByName(name);
    if (isAvailable) {
      return { message: "Product is already in your bucket", status: 409 };
    }

    const createdProduct = await this.productRepo.addProduct(productData);
    return this.mapEntityToDto(createdProduct);
  }

  async updateImage(id: mongoose.Types.ObjectId, index: number, path: string): Promise<boolean | string> {
    const uploadResult = await this.cloudinaryService.uploadProductImage(path);
    const updatedProduct = await this.productRepo.updateImage(id, index, uploadResult.secure_url);
    return updatedProduct.modifiedCount > 0 ? uploadResult.secure_url : false;
  }

  // Retrieve all products
  async getAllProducts(): Promise<ProductDTO[]> {
    const products = await this.productRepo.findAllProducts();
        return products.map((p) => this.mapEntityToDto(p));
  }

  // Retrieve all listed products
  async getAllListedProducts(): Promise<ProductDTO[]> {
    const products = await this.productRepo.findListedAllProducts();
    return products.map((p) => this.mapEntityToDto(p));
  }

  // Filter by category
  async fetchByCategory(mainCategoryId: mongoose.Types.ObjectId | null, subCategoryId: mongoose.Types.ObjectId | null): Promise<ProductDTO[] | null> {
    const products = await this.productRepo.fetchByCategory(mainCategoryId, subCategoryId);
    return products ? products.map((p) => this.mapEntityToDto(p as any)) : null;
  }

  // Retrieve a product by ID
  async getProductById(id: mongoose.Types.ObjectId): Promise<ProductDTO | null> {
    const product = await this.productRepo.productFindById(id);
    return product ? this.mapEntityToDto(product) : null;
  }

  // Update a product by ID
  async updateProduct(id: mongoose.Types.ObjectId, data: Partial<ProductCreationDTO>): Promise<ProductDTO | null | responseHandler> {
    if (data?.name) {
      const isAvailable = await this.productRepo.findByNameAndNotCurrentId(id, data.name);
      if (isAvailable) {
        return { message: "Product name is already in your bucket", status: 409 };
      }
    }
 

    const updatedProduct = await this.productRepo.updateProduct(id, data);
    return updatedProduct ? this.mapEntityToDto(updatedProduct) : null;
  }

  // List and unlist product
  async listById(id: mongoose.Types.ObjectId): Promise<responseHandler | null> {
    const isListed = await this.productRepo.isListedProduct(id);
    if (isListed) {
      throw new Error("Product is already listed");
    }
    const listProduct = await this.productRepo.updateListing(id, { isListed: true });
    return listProduct.modifiedCount > 0 ? { message: "Product listed" } : null;
  }

  async unListById(id: mongoose.Types.ObjectId): Promise<responseHandler | null> {
    const isListed = await this.productRepo.isListedProduct(id);
    if (!isListed) {
      throw new Error("Product is already unlisted");
    }
    const unlistProduct = await this.productRepo.updateListing(id, { isListed: false });
    return unlistProduct.modifiedCount > 0 ? { message: "Product is unlisted" } : null;
  }

  // Delete a product by ID
  async deleteProduct(id: mongoose.Types.ObjectId): Promise<boolean> {
    const deletedProduct = await this.productRepo.deleteProduct(id);
    return !!deletedProduct;
  }

  // Mapping Product entity to DTO
  private mapEntityToDto(product: Product): ProductDTO {
    return {
      _id: product._id, // Use the hashed ID here
      name: product.name,
      descriptions: product.descriptions,
      category: product.category,
      subCategory: product.subCategory,
      images: product.images,
      variants: product.variants,
      isListed: product.isListed,
    };
  }
}
