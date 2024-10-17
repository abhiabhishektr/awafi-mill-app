import { ProductCreationDTO, ProductDTO } from "../../domain/dtos/ProductDTO";
import IProductInteractor from "../../interface/productInterface/IproductInteractor";
import Product  from "../../domain/entities/productSchema";
import { error } from "console";
import {resposeHandler} from '../../types/commonTypes'
import { ICloudinaryService } from "../../interface/serviceInterface/IcloudinaryInterface";
import { IproductRepo } from "../../interface/productInterface/IproductRepo";




export class ProductInteractor implements IProductInteractor {
  private productRepo: IproductRepo;
  private cloudinaryService: ICloudinaryService;


  constructor(productRepo: IproductRepo,cloudinaryService:ICloudinaryService) {
    this.productRepo = productRepo;
    this.cloudinaryService=cloudinaryService

  
  }

  // Adding a new product
  async addProduct(productData: ProductCreationDTO): Promise<ProductDTO |resposeHandler> {

    const uploadedImages = await Promise.all(
    productData.images.map(async (path) => {
      const uploadResult = await this.cloudinaryService.uploadProductImage(path);
      return uploadResult.secure_url; // Return the Cloudinary URL
    })
  );

  productData.images = uploadedImages;
   
      // console.log('interactor',productData)
    const{name}=productData
    const isAvailable=await this.productRepo.findByName(name)
    if(isAvailable)
    {
      return { message: "Product is always in your bucket", status: 409 };

    }
 
    const createdProduct = await this.productRepo.addProduct(productData);
    return this.mapEntityToDto(createdProduct);
  }

  async updateImage(id: string, index: number, path: string): Promise<boolean | string> {

      const uploadResult = await this.cloudinaryService.uploadProductImage(path);
      const updatedProduct = await this.productRepo.updateImage(
        id,
        index,
        uploadResult.secure_url
      );
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
  // filter by category-----
  async fetchByCategory(mainCategoryId: string, subCategoryId: string): Promise<ProductDTO[] |null> {
    return await this.productRepo.fetchByCategory(mainCategoryId, subCategoryId);
  }

  // Retrieve a product by ID
  async getProductById(id: string): Promise<ProductDTO | null> {
//@ts-ignore
    const product = await this.productRepo.productFindById(id);
    return product ? this.mapEntityToDto(product) : null;
  }

  // Update a product by ID
  async updateProduct(id: string, data: Partial<ProductCreationDTO>): Promise<ProductDTO | null |resposeHandler> {
    if(data?.name)
    {
      const isAvailable=await this.productRepo.findByNameAndNotCurrentId(id,data.name)
      if(isAvailable)
      {
        return { message: "Product name is always in your bucket", status: 409 };
  
      }

    }
    const updatedProduct = await this.productRepo.update(id, data);
    return updatedProduct ? this.mapEntityToDto(updatedProduct) : null;
  }
  // list and unlist product-------------------

  async listById(id: string): Promise<resposeHandler | null> {
     const isListed=await this.productRepo.isListedProduct(id)
     if(isListed)
     {
       throw error("product is already listed")
     }
    const listProduct = await this.productRepo.updateListing(id,{isListed:true});
    return listProduct.modifiedCount > 0 ? { message:"product listed" } : null;
  }
  async unListById(id: string): Promise<resposeHandler | null> {
    const isListed=await this.productRepo.isListedProduct(id)
    if(!isListed)
    {
      throw error("product is already unlisted",)
    }
    const unlistProduct = await this.productRepo.updateListing(id, {isListed:false});
    return unlistProduct.modifiedCount >0  ? {message:"product is unlisted"}:null;
  }

  // Delete a product by ID
  async deleteProduct(id: string): Promise<boolean> {
    const deletedProduct = await this.productRepo.deleteProduct(id);
    return !!deletedProduct;
  }

  // private mapDtoToEntity(productData: ProductDTO): Product {
  //   if (!productData.name || !productData.description || !productData.price) {
  //     throw error('Required fields are missing in ProductDTO');
  //   }
  
   
  
  //   return {
  //     name: productData.name,
  //     description: productData.description,
  //     price: productData.price,
  //     originalPrice: productData.originalPrice,
  //     weight: productData.weight,
  //     category: productData.category,
  //     images: productData.images,
  //     variants: productData.variants,
  //     createdAt: new Date(),
  //     updatedAt: new Date(),
  //   } as Product;
  // }
  

  // Mapping Product entity to DTO
  private mapEntityToDto(product: Product): ProductDTO {
  
    return {
      _id: product._id, // Use the hashed ID here
      name: product.name,
      descriptions:product.descriptions,
      category: product.category,
      subCategory: product.subCategory,
      images: product.images,
      variants: product.variants,
      isListed:product.isListed
    };
  }
  
}
