import { stringifySearch } from "@isomorix/url-parse";

/**
 * Helper method for adding search params to a URL
 * for GET requests.
 * @param {string} url - The url without search parameters.
 * @param {Object} [search] - An Object containing key:value
 * pairs representing the search parameters to add
 * to `url`. These will be stringified using the
 * [@isomx/url-parse package]{@link module:url-parse}.
 *
 * If not provided, or not an Object, the `url`
 * will be returned unchanged.
 * @returns {string}
 * The URL with any `search` params encoded into it.
 */
export const prepareUrl = (url, search) => {
  if (!search) return url;
  const s = {};
  let v;
  for(let key in search) {
    if (!(v = search[key]) || typeof v !== 'object') {
      s[key] = v;
    } else if (key === 'listFields') {
      s[key] = v.join(',');
    } else if (key === 'query') {
      v.addToParams(s);
    } else {
      s[key] = JSON.stringify(v);
    }
  }
  return `${url}?${stringifySearch(s)}`;
}
