import { Router } from "express";
import AddressController from "../controllers/address";

export default class AddressRouter {
  routes: Router = Router();
  private addressController = new AddressController();

  constructor() {
    this.registerRoutes();
  }

  registerRoutes() {
    //read address
    this.routes.get("/", this.addressController.getAddresss);
    //create address
    this.routes.post("/", this.addressController.createAddress);
    //update address
    this.routes.put("/:id", this.addressController.updateAddress);
    //delete address
    this.routes.delete("/:id", this.addressController.deleteAddress);
  }
}
