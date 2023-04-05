import { Crud } from "../Crud";

export class Forms extends Crud {
  static endpoint = 'Form';

  /*
   * No clue why Ontraport made the endpoint to
   * retrieve form HTML lowercase... Or maybe
   * I'm missing something?
   */
  getHtml(id) {
    return this.get(`${this.api.baseUrl}/form`, { id });
  }
}
