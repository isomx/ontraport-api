import { Crud } from "./Crud";
import {
  Commissions,
  Contacts,
  Coupons,
  Forms,
  Objects,
  OpenOrders,
  Orders,
  PartnerProducts,
  PartnerPrograms,
  PartnerPromotionalItems,
  Partners,
  Products,
  ProductSalesLogs,
  Purchases,
  Roles,
  Tags,
  Transactions,
  Users
} from './endpoints';

export class Ontraport extends Crud {

  _getEndpoint(Class) {
    const key = `_${Class.endpoint}`;
    if (!this[key]) {
      this[key] = new Class(this);
    }
    return this[key];
  }

  commissions() {
    return this._getEndpoint(Commissions);
  }

  contacts() {
    return this._getEndpoint(Contacts);
  }

  coupons() {
    return this._getEndpoint(Coupons);
  }

  forms() {
    return this._getEndpoint(Forms);
  }

  objects() {
    return this._getEndpoint(Objects);
  }

  orders() {
    return this._getEndpoint(Orders);
  }

  openOrders() {
    return this._getEndpoint(OpenOrders);
  }

  partners() {
    return this._getEndpoint(Partners);
  }

  partnerProducts() {
    return this._getEndpoint(PartnerProducts);
  }

  partnerPrograms() {
    return this._getEndpoint(PartnerPrograms);
  }

  partnerPromotionalItems() {
    return this._getEndpoint(PartnerPromotionalItems);
  }

  products() {
    return this._getEndpoint(Products);
  }

  productSalesLogs() {
    return this._getEndpoint(ProductSalesLogs);
  }

  purchases() {
    return this._getEndpoint(Purchases);
  }

  roles() {
    return this._getEndpoint(Roles);
  }

  tags() {
    return this._getEndpoint(Tags);
  }

  transactions() {
    return this._getEndpoint(Transactions);
  }

  users() {
    return this._getEndpoint(Users);
  }
}
