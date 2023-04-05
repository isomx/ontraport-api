import { concat, defer, forkJoin } from "rxjs";
import { last, map, mapTo } from "rxjs/operators";
import fetch from "cross-fetch";
import AbortController from "abort-controller";
import { performance } from 'perf_hooks';
import { Ontraport } from "./Ontraport";

global.fetch = fetch;
global.AbortController = AbortController;

const DEFAULT_PRODUCT_NAME = '<some product name>';
const DEFAULT_CONTACT_ID = '<some contact id>';
const DEFAULT_AFFILIATE_ID = '<some affiliate id>';
const DEFAULT_TAG_NAME = '<some tag name>';

export class Test {
  constructor(
    {
      apiKey,
      appId,
      baseUrl = 'https://api.ontraport.com/1',
      productName = DEFAULT_PRODUCT_NAME,
      contactId = DEFAULT_CONTACT_ID,
      affiliateId = DEFAULT_AFFILIATE_ID,
      tagName = DEFAULT_TAG_NAME,
    } = {}
  ) {
    this.api = new Ontraport({
      apiKey,
      appId,
      baseUrl
    });
    this.startTs = 0;
    this.reqCount = 0;
    this.totalMs = 0;
    /**
     * Number of times each request will occur
     * @type {number}
     */
    this.iterations = 1;
    /**
     * Whether to perform requests in series
     * (concat = true) or parallel (concat = false)
     * @type {boolean}
     */
    this.concat = true;
    /**
     * The name of a product to use in criteria
     * when a product name is needed.
     * @type {string}
     */
    this.productName = productName;
    /**
     * The ID of a contact to use in criteria
     * when a contact ID is needed.
     * @type {string}
     */
    this.contactId = contactId;
    /**
     * The ID of an affiliate to use in
     * criteria when an affiliate ID is needed.
     * @type {string}
     */
    this.affiliateId = affiliateId;

    /**
     * The name of a tag to use in criteria
     * when a tag name is needed.
     * @type {string}
     */
    this.tagName = tagName;
  }

  static runTests(
    connection,
    {
      iterations = 5,
      concat = false,
      runParallel = true
    } = {}
  ) {
    const test = new this(connection);
    test
      .setIterations(iterations)
      .setConcat(concat);
    return test.testAll(runParallel)
      .subscribe(resp => {
        console.log(`avg response time: ${test.avgRespTime}ms\n`);
        console.log(resp);
      });
  }

  /**
   * Set the number of times each request will occur.
   * @param {number} [num = 1] - The number of times
   * each API request will occur.
   * @returns {this}
   */
  setIterations(num) {
    this.iterations = num || 1;
    return this;
  }

  /**
   * Set the `concat` property.
   * @param {boolean} [bool = true] - Provide
   * `true` to perform request iterations in series,
   * `false` to perform request iterations in parallel.
   * @returns {this}
   */
  setConcat(bool) {
    this.concat = typeof bool === 'boolean'
      ? bool
      : true;
    return this;
  }

  setProductName(name) {
    this.productName = name || DEFAULT_PRODUCT_NAME;
    return this;
  }

  setAffiliateId(id) {
    this.affiliateId = id || DEFAULT_AFFILIATE_ID;
    return this;
  }

  setContactId(id) {
    this.contactId = id || DEFAULT_CONTACT_ID;
    return this;
  }

  setTagName(name) {
    this.tagName = name || DEFAULT_TAG_NAME;
    return this;
  }

  timerStart() {
    this.startTs = performance.now();
    return this;
  }

  timerEnd() {
    this.requestTime = performance.now() - this.startTs;
    this.reqCount++;
    this.totalMs += this.requestTime;
    return this;
  }

  execute(fn) {
    let { iterations } = this;
    const obs$ = [], times = [];
    const defer$ = () => {
      let startTs;
      return defer(() => {
        startTs = performance.now();
        return fn();
      }).pipe(
        map(resp => {
          const elapsed = performance.now() - startTs;
          this.reqCount++;
          this.totalMs += elapsed;
          times.push(elapsed);
          return resp;
        })
      )
    }
    while(iterations > 0) {
      obs$.push(defer$());
      iterations--;
    }
    if (this.concat) {
      return concat(...obs$).pipe(
        last(),
        mapTo(times)
      );
    } else {
      return forkJoin(obs$).pipe(
        mapTo(times)
      );
    }
  }

  getTagsByObjectTypeId(object_type_id = 0) {
    return this.execute(() => this.api
      .tags()
      .query()
      .where('object_type_id', object_type_id)
      .execute()
    );
  }

  getTagById(tagId = 2) {
    return this.execute(() => this.api
      .tags()
      .getOne(tagId)
    );
  }

  getOpenOrders() {
    return this.execute(() => this.api
      .openOrders()
      .query()
      .where('payment_remaining', '>', 0)
      .execute()
    )
  }

  getTransactionsByDate() {
    return this.execute(() => this.api
      .transactions()
      .query()
      .where('data', '>', Date.parse('01/01/2023') / 1000)
      .execute()
    );
  }

  getTransactionsByContact(contactId = this.contactId) {
    return this.execute(() => this.api
      .transactions()
      .query()
      .where('contact_id', contactId)
      .execute()
    )
  }

  getCommissionsByAffiliateId(affiliateId = this.affiliateId) {
    return this.execute(() => this.api
      .commissions()
      .query()
      .where('affiliate_id', affiliateId)
      .execute()
    )
  }

  getContactsWithTagName(tag_name = this.tagName) {
    return this.execute(() => this.api
      .contacts()
      .getByTag({ tag_name })
    )
  }

  getContactById(contactId = this.contactId) {
    return this.execute(() => this.api
      .contacts()
      .getOne(contactId)
    )
  }

  getContacts() {
    return this.execute(() => this.api
      .contacts()
      .query()
      .where('spent', '>', 0)
      .andWhere('lastname', 'Johnson')
      .orderBy('spent', 'desc')
      /*
       * select() can be called multiple times,
       * it will merge all field names into
       * a single Array.
       */
      .select('id')
      .select([ 'firstname', 'lastname', 'email' ])
      .execute()
    )
  }

  getOrdersByProductName(productName = this.productName) {
    return this.execute(() => this.api
      .orders()
      .query()
      .where('name', productName)
      .execute()
    );
  }

  /**
   * Example of opting in a contact
   * @param {string} contactData.firstname
   * @param {string} contactData.lastname
   * @param {string} contactData.email
   * @param {number} [contactData.bulk_mail = 1]
   * @param {Array.<number>} [tags]
   */
  optin(contactData, tags) {
    if (typeof contactData.bulk_mail === 'undefined') {
      contactData.bulk_mail = 1;
    }
    return defer(() => this.api.contacts()
      .optin(contactData, tags)
    );
  }

  testAll(parallel = false) {
    const obs$ = {
      getTagsByObjectTypeId: this.getTagsByObjectTypeId(),
      getTagById: this.getTagById(),
      getOpenOrders: this.getOpenOrders(),
      getTransactionsByDate: this.getTransactionsByDate(),
      getTransactionsByContact: this.getTransactionsByContact(),
      getContactById: this.getContactById(),
      getCommissionsByAffiliateId: this.getCommissionsByAffiliateId(),
      getContactsWithTagName: this.getContactsWithTagName(),
      getContacts: this.getContacts(),
      getOrdersByProductName: this.getOrdersByProductName()
    }
    if (parallel) return forkJoin(obs$);
    const array = [];
    const fn = (key, $) => $.pipe(
      map(time => {
        obs$[key] = time;
        return obs$;
      })
    )
    for(let key in obs$) {
      array.push(fn(key, obs$[key]));
    }
    return concat(...array).pipe(last());
  }

  resetTime() {
    this.reqCount = 0;
    this.totalMs = 0;
    return this;
  }

  reset() {
    return this
      .resetTime()
      .setConcat()
      .setIterations();
  }

  get avgRespTime() {
    return this.totalMs / this.reqCount;
  }

}
