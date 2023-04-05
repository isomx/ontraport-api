export class Query {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.condition = [];
    this.range = undefined;
    this.sort = undefined;
    this.sortDir = undefined;
    this.start = undefined;
    this.listFields = undefined;
  }

  _addArg(key, op, value, join) {
    const obj = {
      field: { field: key }
    }
    switch(op) {
      case 'in':
      case 'IN':
        const formatted = [];
        for(let val of value) {
          formatted.push({ value: val });
        }
        op = 'IN';
        obj.value = { list: formatted };
        break;
      case 'is':
      case 'IS':
      case 'isNull':
        op = 'IS';
        obj.value = 'NULL';
        break;
      default:
        if (typeof value === 'undefined') {
          // Shift args left 1
          // example: where('fieldName', 'someValue')
          value = op;
          op = '=';
        }
        obj.value = { value };
    }
    obj.op = op;
    if (this.condition.length) {
      this.condition.push(
        join === 'or' || join === 'OR'
          ? 'OR'
          : 'AND'
      );
    }
    this.condition.push(obj);
    return this;
  }

  /**
   * Specify the fields to include in the returned result(s).
   * @param {string|Array.<string>} fieldOrFields - The
   * field names or an Array containing field names.
   * @returns {this}
   */
  select(fieldOrFields) {
    if (!this.listFields) {
      this.listFields = typeof fieldOrFields === 'string'
        ? [ fieldOrFields ]
        : [ ...fieldOrFields ];
    } else if (typeof fieldOrFields === 'string') {
      this.listFields.push(fieldOrFields);
    } else {
      this.listFields.push(...fieldOrFields);
    }
    return this;
  }

  /**
   *
   * @param {string} key - The name of a field
   * to query
   * @param {string|*} op - Either a valid
   * operator (>, <, >=, <=, etc.), or the
   * value to associate with the `key` and
   * `=` will be the presumed operator.
   * @param {*} [value] - If providing an
   * operator for the `op` param, provide
   * the value to associate with the `key`.
   * @returns {this}
   */
  where(key, op, value) {
    return this._addArg(key, op, value);
  }

  orWhere(key, op, value) {
    return this._addArg(key, op, value, 'or');
  }

  andWhere(key, op, value) {
    return this._addArg(key, op, value);
  }

  whereIn(key, value) {
    return this._addArg(key, 'IN', value);
  }

  orWhereIn(key, value) {
    return this._addArg(key, 'IN', value, 'or');
  }

  andWhereIn(key, value) {
    return this._addArg(key, 'IN', value);
  }

  whereNull(key) {
    return this._addArg(key, 'IS');
  }

  orWhereNull(key) {
    return this._addArg(key, 'IS', undefined, 'or');
  }

  andWhereNull(key) {
    return this._addArg(key, 'IS');
  }

  /**
   *
   * @param {number} value - The limit, max is 50
   * @returns {this}
   */
  limit(value) {
    this.range = value;
    return this;
  }

  /**
   *
   * @param {string} field - The name of the field
   * to order the results by.
   * @param {string} [type = 'asc'] - The direction
   * for the orderBy clause, either `asc` or `desc`.
   * @returns {this}
   */
  orderBy(field, type) {
    this.sort = field;
    this.sortDir = type || 'asc';
    return this;
  }

  /**
   *
   * @param {number} value - The number of records
   * to "skip" before considering a record eligible to
   * be returned from the query.
   * @returns {this}
   */
  offset(value) {
    this.start = value;
    return this;
  }

  /**
   * Handles creating or populating an Object containing the
   * request params (GET) or body (all other operations)
   * based on properties associated with this Query Builder.
   * @param {Object} [params = {}] - Optionally provide
   * an Object, and it will be populated with the
   * params from the query builder. Otherwise, a
   * new Object will be created.
   * @returns {Object}
   */
  addToParams(params) {
    if (!params) params = {};
    if (this.condition.length) {
      params.condition = this.condition;
    }
    if (this.range) {
      params.range = this.range;
    }
    if (this.sort) {
      params.sort = this.sort;
      params.sortDir = this.sortDir;
    }
    if (this.start) {
      params.start = this.start;
    }
    if (this.listFields) {
      params.listFields = this.listFields.join(',');
    }
    return params;
  }

  /**
   * Retrieves collection information, rather than
   * records. This is useful when retrieving things
   * like a count of records that satisfy the
   * criteria, or even sums depending on the
   * endpoint being queried.
   * @param {Object} [params = {}] - An optional
   * Object containing additional request parameters.
   * If provided, it will be updated to include
   * the parameters associated with this Query Builder.
   * @returns {import("rxjs").Observable.<Object>}
   */
  getInfo(params) {
    return this.endpoint.getInfo(this.addToParams(params));
  }

  /**
   * Executes the query.
   * @param {Object} [params = {}] - An optional
   * Object containing additional request parameters.
   * If provided, it will be updated to include
   * the parameters associated with this Query Builder.
   * @returns {import("rxjs").Observable.<Object>}
   */
  execute(params) {
    return this.endpoint.getMany(this.addToParams(params));
  }

}
