import { Crud } from "../Crud";

export class Objects extends Crud {
  static endpoint = 'object';

  getObjectMeta() {
    throw new Error('There is no such thing as Object Meta for the Objects endpoint.');
  }

  getMeta(params) {
    return this.get(`${this.urlMany}/meta`, params);
  }

  getByTag(params) {
    return this.get(`${this.urlMany}/tag`, params);
  }

  addTag(body) {
    return this.put(`${this.urlMany}/tag`, body);
  }
}
