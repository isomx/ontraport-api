# Run Tests

```js
import { Test } from './Test';

Test.runTests({
    apiKey: "<apiKey>",
    appId: "<appId>",
    baseUrl: "https://api.ontraport.com/1",
    productName: "<test product name>",
    contactId: "<test contactId>",
    affiliateId: "<test affiliateId>",
    tagName: "<test tag name>"
}, {
    iterations: 5, // # of times to run each request
    concat: false, // or true
    runParallel: true // whether to run each series of requests in parallel
})
```

Outputs:
```bash
// Typically, it's around 400-500ms
avg response time: <time>ms

// Keys are the name of the Test fn (the request), 
// and the values are an Array containing the 
// response time for each iteration of that request.
Object.<string, Array.<number>>
```
