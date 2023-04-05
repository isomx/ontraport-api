import { defer } from "rxjs";
import { map } from "rxjs/operators";
import { addPrevDataToResp, prepareUrl } from "./helpers";
import { mergeMapResp } from "./operators";
import { Query } from "./Query";

export class Crud {
  constructor(options) {
    this.appId = options.appId;
    this.apiKey = options.apiKey;
    this.baseUrl = options.baseUrl;
    let { headers } = options;
    if (!headers) {
      headers = {
        'Content-Type': 'application/json',
        'Api-Key': this.apiKey,
        'Api-Appid': this.appId
      };
    } else {
      if (!headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
      }
      if (!headers['Api-Key']) {
        headers['Api-Key'] = this.apiKey;
      }
      if (!headers['Api-Appid']) {
        headers['Api-Appid'] = this.appId;
      }
    }
    this.headers = headers;
    const { endpoint } = this.constructor;
    if (endpoint) {
      this.urlOne = `${this.baseUrl}/${endpoint}`;
      this.urlMany = `${this.baseUrl}/${endpoint}s`;
      this.api = options;
    }
  }

  getInfo(params) {
    return this.get(`${this.urlMany}/getInfo`, params);
  }

  getObjectMeta() {
    return this.get(`${this.urlMany}/meta`);
  }

  get(url, params) {
    return defer(() => fetch(prepareUrl(url, params), {
      method: 'GET',
      headers: this.headers,
      credentials: 'omit'
    })).pipe(mergeMapResp());
  }

  getOne(id) {
    return this.get(this.urlOne, { id });
  }

  getMany(params, _prevData) {
    if (!params) {
      params = {};
    } else if (params.query) {
      params.query.addToParams(params);
      delete params.query;
    }
    if (!params.range) params.range = 50;
    if (!params.start) params.start = 0;
    return this.get(this.urlMany, params).pipe(
      map(resp => {
        if (!resp || (resp.code !== 0 && resp.code !== 200)) {
          return resp;
        }
        const { data } = resp;
        if (!data || data.length < params.range) {
          resp.hasMore = false;
          addPrevDataToResp(resp, _prevData);
          return resp;
        }
        resp.hasMore = true;
        addPrevDataToResp(resp, _prevData);
        resp.getMore = (range) => {
          if (!range) range = params.range;
          const next = { ...params, range };
          next.start = params.start + params.range;
          return this.getMany(next, data);
        }
        return resp;
      })
    )
  }

  query() {
    return new Query(this);
  }

  post(urlOrBody, body) {
    let url;
    if (body) {
      url = urlOrBody || this.urlMany;
    } else {
      url = this.urlMany;
      body = urlOrBody;
    }
    return defer(() => fetch(url, {
      method: 'POST',
      cache: 'no-cache',
      headers: this.headers,
      credentials: 'omit',
      body: JSON.stringify(body)
    })).pipe(
      // map(resp => {
      //   console.log('raw resp = ', resp);
      //   return resp;
      // }),
      mergeMapResp()
    )
  }

  put(urlOrBody, body) {
    let url;
    if (body) {
      url = urlOrBody || this.urlMany;
    } else {
      url = this.urlMany;
      body = urlOrBody;
    }
    return defer(() => fetch(url, {
      method: 'PUT',
      cache: 'no-cache',
      headers: this.headers,
      credentials: 'omit',
      body: JSON.stringify(body)
    })).pipe(
      // map(resp => {
      //   console.log('raw resp = ', resp);
      //   return resp;
      // }),
      mergeMapResp()
    )
  }
}
