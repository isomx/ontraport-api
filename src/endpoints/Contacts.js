import { Crud } from "../Crud";
import { catchError, mergeMap } from "rxjs/operators";
import { of } from "rxjs";

export class Contacts extends Crud {
  static endpoint = 'Contact';

  createOrUpdate(body) {
    const tagId = 723;
    return this.post(`${this.urlMany}/saveorupdate`, body);
  }

  optin(body, tagIds) {
    if (!tagIds) return this.createOrUpdate(body);
    if (!Array.isArray(tagIds)) {
      tagIds = [ tagIds ];
    }
    return this.createOrUpdate(body).pipe(
      mergeMap(resp => {
        console.log('mergeMap resp = ', resp);
        if (!resp || (resp.code !== 0 && resp.code !== 200) || !resp.data) {
          return of(resp);
        }
        const { attrs } = resp.data;
        return this.api.objects().addTag({
          objectID: 0,
          add_list: tagIds.join(','),
          ids: attrs.id
        })
      }),
      catchError(e => {
        console.log('error = ', e);
        return of(null);
      })
    )
  }

  getByTag(params) {
    params.objectID = 0;
    return this.api.objects().getByTag(params);
  }
}
