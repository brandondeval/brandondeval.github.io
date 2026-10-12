---
title: NEW HTTP METHOD!
date: "2026-10-12"
description: "The first new HTTP method in 16 years!"
---

This June we got something awesome, HTTP **`QUERY`** . I'm late to the party. It's not Graphql Query, its new a HTTP method. It's pretty interesting, and might be an alternative allowing you to throw Graphql in the garbage. So, let's get into it.

HTTP **`QUERY`**  lets you send a structured query in a request body while declaring that the operation is safe and idempotent. It was standardized in RFC 10008 in June 2026.
https://www.rfc-editor.org/rfc/rfc10008.html

It's the mix of a **`GET`** and a **`POST`** where they intersect.

## What **`QUERY`** does - and what it doesn't

**`QUERY`**  is an HTTP method for safe, idempotent requests that need a request body. The method does not define a universal query language or JSON format. The API still decides what the body means, which fields clients can request, and what response it returns.

GraphQL and **`QUERY`**  are different things: GraphQL is a query language and API model, while **`QUERY`** is an HTTP method. An API could carry a GraphQL document in a **`QUERY`** body, but adopting **`QUERY`** does not replace GraphQL's schema, execution model, or tooling.

## Request Method Characteristics

Requests can have characterstics
- [Safe](https://developer.mozilla.org/en-US/docs/Glossary/Safe/)
- [Idempotent](https://developer.mozilla.org/en-US/docs/Glossary/Idempotent)
- [Cacheable](https://developer.mozilla.org/en-US/docs/Glossary/Cacheable)

| Method  | Safe   | Idempotent | Cacheable | Request Body | Response Body |   
| :----:  | :----: | :----:     | :----:    |    :----:    |     :----:    |
| GET     | 🟢 Yes | 🟢 Yes      | 🟢 Yes    | 🔴 NO        | 🟢 Yes         |
| POST    | 🔴 NO  | 🟠 Maybe    | 🟠 Maybe  | 🟢 Yes       | 🟢 Yes         |
| Query   | 🟢 Yes | 🟢 Yes      | 🟢 Yes    | 🟢 Yes       | 🟢 Yes         |


**`POST`** can be made to be idempotent [based upon the implementation](https://youtu.be/R7s2FVN4c9Q?si=1xhgWH4EZQWEETrn&t=395), and there is a proposed requested header [Idempotency-Key](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Idempotency-Key) for a safe retrying of operations for event-based operations. **`POST`** can be cacheable if using the Cache-Control header. The intention of **`POST`** is the opposite of safe, it's a push mechanism. Pushing data into a datasink with the intentional goal of altering the state of the "server".

**`GET`** is a pull operation, you can give a **`GET`** request a body, but it should result in an error from the server. 

**`QUERY`**  is the middle ground, it explicitly gives the body a purpose. It lets you send a structured query in a request body.

When implemented, **`QUERY`** can generate a representation based on the request body. The server may also return `Content-Location` or `Location` headers to identify a URI associated with the result or query. This behavior depends on the server and API design; it is not automatic for every **`QUERY`** request.

`Content-Location`: Identifies a resource holding the result of the query just performed. A **`GET`** to that URI retrieves the same results again.

`Location`: Identifies the equivalent resource, which re-runs the same query. A **`GET`** to that URI repeats the operation against current data without resending the query content; therefore, the result may differ from the original response.

## Deployment, caching, and privacy notes

Clients and every intermediary on the request path need to handle **`QUERY`** correctly. Before using it in production, check support in your HTTP client, server framework, reverse proxy, API gateway, and monitoring tools. An unsupported or blocked method may be rejected before it reaches the application.

Although **`QUERY`** is cacheable, caches need a way to distinguish requests with different bodies. Support and cache-key behavior vary by cache implementation, so verify how your CDN or proxy handles **`QUERY`** before relying on shared caching.

A request body keeps criteria out of the URL, but it does not make them secret. HTTPS protects the request in transit, while servers, proxies, and observability tools may still record request bodies. Avoid placing credentials or secrets in query criteria, and configure logging and retention deliberately.

The examples below show possible API designs. Features such as a particular JSON filter syntax, snapshot pagination, saved-result URLs, and execution budgets are choices made by an API; the **`QUERY`** method itself does not provide them.

Here is a small illustrative exchange. The response format and status code are determined by the API:

```http
QUERY /orders/search HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json

{"status":"paid","limit":2}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"items":[{"id":"ord_100"},{"id":"ord_101"}]}
```

## What are the domain agnostic use cases?

### HTTP `QUERY` Method Use Cases and Examples

This document outlines the 12 primary and complex use cases for the **`QUERY`** HTTP method along with standard request examples for each.

---

#### 1. Large or Unlimited Search Payloads
Executing search queries with extensive criteria, nested conditions, or long text strings that exceed browser and proxy URL length limits.

```http
QUERY /documents/search HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "query_text": "enterprise cloud migration strategies and architecture frameworks",
  "page": 1,
  "limit": 20
}
```

---

#### 2. Bulk Data and Identifier Retrieval
Fetching large batches of records at once by sending hundreds or thousands of unique resource IDs, UUIDs, or keys in a single request without using `POST`.

```http
QUERY /records/batch HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "ids": [
    "uuid-101",
    "uuid-202",
    "uuid-303"
  ]
}
```

---

#### 3. Privacy-Sensitive Parameter Lookups
Searching records using private criteria - such as personally identifiable information, security tokens, or account credentials - safely hidden in an encrypted request body rather than exposed in web server access logs or browser history URLs.

```http
QUERY /accounts/lookup HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "auth_token": "secret_bearer_token_xyz987",
  "security_question_id": 4
}
```

---

#### 4. Structured Query Languages over HTTP
Directly passing complex query languages and syntax structures - including GraphQL, SQL, JSONPath, SPARQL, or custom ASTs - to read-only API endpoints.

```http
QUERY /graphql HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "query": "{ user(id: 42) { name email profile { bio } } }"
}
```

---

#### 5. High-Dimensional Vector and AI/ML Search
Querying vector databases or search engines by sending large arrays of numerical embeddings to find semantically similar items or documents.

```http
QUERY /ai/vector-search HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "embedding": [
    0.12,
    -0.45,
    0.89,
    0.03
  ],
  "top_k": 5
}
```

---

#### 6. Geospatial and Polygon Intersection Queries
Passing rich spatial boundary datasets, such as multi-point GeoJSON polygons or coordinate bounding boxes, to find items located within a specific geographic area.

```http
QUERY /spatial/intersect HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "polygon": [
    [37.7749, -122.4194],
    [37.8044, -122.2712],
    [37.7749, -122.4194]
  ]
}
```

---

#### 7. Complex Multi-Attribute Filtering
Filtering datasets across dozens or hundreds of concurrent metadata dimensions, parameters, or range limits simultaneously.

```http
QUERY /devices/filter HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "status": "active",
  "metrics": {
    "cpu_usage_gt": 80,
    "memory_usage_lt": 40
  },
  "regions": [
    "us-east-1",
    "eu-west-1"
  ]
}
```

---

#### 8. Automated and Resilient Network Retries
Enabling API gateways, mesh proxies, and client applications to automatically retry failed network requests safely, knowing the query is idempotent and will not alter server state.

```http
QUERY /telemetry/stream HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "sensor_group": "alpha",
  "time_window": "last_10_minutes"
}
```

---

#### 9. Body-Aware Response Caching
Allowing Content Delivery Networks (CDNs) and intermediate proxies to cache read responses based on a combination of the request URI and the JSON request payload.

```http
QUERY /analytics/summary HTTP/1.1
Host: api.example.com
Content-Type: application/json
Cache-Control: max-age=3600

{
  "metric": "active_users",
  "granularity": "daily"
}
```

---

#### 10. Indirect Query Execution and Saved Search Links
Submitting a complex query payload that computes a result on the server and returns a canonical URL pointer where those specific cached results can be referenced again later via standard `GET` requests.

```http
QUERY /reports/generate HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "parameters": {
    "region": "APAC",
    "quarter": "Q3"
  }
}
```

---

#### 11. Multi-Criteria Comparison Operations
Requesting side-by-side analytical comparisons between multiple large data objects or configurations without creating temporary comparison entities on the server.

```http
QUERY /configurations/compare HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "config_id_a": "cfg-alpha",
  "config_id_b": "cfg-beta",
  "diff_only": true
}
```

---

#### 12. Hierarchical and Graph Dependency Fetches
Requesting deeply nested, tree-structured resource dependencies and relationships in a single payload rather than making multiple sequential requests.

```http
QUERY /dependencies/graph HTTP/1.1
Host: api.example.com
Content-Type: application/json

{
  "root_node": "service-auth",
  "max_depth": 3
}
```

## Interesting domain specific examples (ecommerce)

**`QUERY`** can fit to do more complex operations operations such as:
- “Search the orders collection using this criteria.”
- "aggregation instead of retrieving rows - serve reports"
- "Paginate against a consistent snapshot - prevent pagination drift"
- "fetch multiple resources in a single request(solves over and underfetching)"
- "Make expensive reads explicitly budgeted"

“Search the orders collection using this criteria.”
```JSON
QUERY /orders
Content-Type: application/json

{
  "filter": {
    "status": "paid",
    "total": { "gte": 10000 }
  }
}
```

"Search orders with nested filters"
```JSON
QUERY /v1/retailers/ret_42/orders HTTP/1.1
Host: api.example.com
Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json

{
  "filter": {
    "and": [
      { "status": { "eq": "paid" } },
      { "storeCountry": { "in": ["CA", "GB"] } },
      {
        "createdAt": {
          "gte": "2026-09-01T00:00:00Z",
          "lt": "2026-10-01T00:00:00Z"
        }
      },
      {
        "or": [
          {
            "and": [
              { "currency": { "eq": "CAD" } },
              { "totalMinor": { "gte": 10000 } }
            ]
          },
          { "customerTier": { "eq": "VIP" } }
        ]
      }
    ]
  },
  "select": ["id", "createdAt", "currency", "totalMinor"],
  "sort": [
    { "field": "createdAt", "direction": "desc" },
    { "field": "id", "direction": "desc" }
  ],
  "page": { "limit": 2 }
}
```

"aggregation instead of retrieving rows - serve reports"
```JSON
QUERY /v1/retailers/ret_42/sales HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json

{
  "filter": {
    "soldAt": {
      "gte": "2026-09-01T00:00:00Z",
      "lt": "2026-10-01T00:00:00Z"
    }
  },
  "groupBy": ["storeId", "currency"],
  "metrics": [
    { "name": "saleCount", "operation": "count" },
    {
      "name": "revenueMinor",
      "operation": "sum",
      "field": "totalMinor"
    }
  ]
}
```

"Paginate against a consistent snapshot - prevent pagination drift"
```JSON
QUERY /v1/retailers/ret_42/orders
Content-Type: application/json

{
  "filter": {
    "status": { "eq": "paid" }
  },
  "consistency": {
    "mode": "snapshot"
  },
  "sort": [
    { "field": "createdAt", "direction": "asc" },
    { "field": "id", "direction": "asc" }
  ],
  "page": {
    "limit": 500
  }
}

Response

{
  "snapshot": {
    "id": "snap_804",
    "expiresAt": "2026-10-12T02:00:00Z"
  },
  "items": [
    { "id": "ord_100", "totalMinor": 12500 }
  ],
  "nextCursor": "opaque-signed-cursor"
}

Response with Snapshot

{
  "filter": {
    "status": { "eq": "paid" }
  },
  "consistency": {
    "mode": "snapshot",
    "snapshotId": "snap_804"
  },
  "sort": [
    { "field": "createdAt", "direction": "asc" },
    { "field": "id", "direction": "asc" }
  ],
  "page": {
    "limit": 500,
    "after": "opaque-signed-cursor"
  }
}
```



"Fetch several dashboard datasets in one read - fetch multiple resources in a single request(solves over and underfetching)"
```JSON
QUERY /v1/retailers/ret_42/dashboard
Content-Type: application/json

{
  "consistency": { "mode": "snapshot" },
  "queries": {
    "salesToday": {
      "dataset": "sales",
      "filter": { "businessDate": "2026-10-11" },
      "groupBy": ["currency"],
      "metrics": ["saleCount", "revenueMinor"]
    },
    "topProducts": {
      "dataset": "saleItems",
      "groupBy": ["productId"],
      "metrics": ["quantitySold"],
      "sort": ["-quantitySold"],
      "limit": 10
    },
    "lowStock": {
      "dataset": "inventory",
      "filter": { "availableQuantity": { "lt": 5 } },
      "limit": 50
    }
  }
}
```

Use the same query for JSON and CSV
```JSON
QUERY /v1/retailers/ret_42/orders
Content-Type: application/json
Accept: text/csv

{
  "filter": {
    "status": { "eq": "paid" }
  },
  "select": ["id", "currency", "totalMinor"],
  "page": { "limit": 10000 }
}
```


"Make expensive reads explicitly budgeted"
```JSON
QUERY /v1/retailers/ret_42/analytics
Content-Type: application/json

{
  "query": {
    "dataset": "sales",
    "groupBy": ["productId", "storeId", "currency"],
    "metrics": ["revenueMinor"]
  },
  "execution": {
    "maxDurationMs": 1500,
    "maxRows": 10000,
    "allowPartial": false
  }
}
```


## Summary
Obiviously, all of the examples are based upon the implementation on the server. What this does is open the door for creative problem solving to previous issues / problems with the limitations of **`GET`**, **`POST`**, **`PUT`**, **`DELETE`**, and **`PATCH`**. It means rethinking of using specific technologies as middleware or proxies.

For example:
- solving "Overfetching", a **`QUERY`**-based API would need: select, sparse fields, projections
- solving "Underfetching", a **`QUERY`**-based API would need: Nested selections or include
- solving "Batching multiple endpoints / round trips", a **`QUERY`**-based API would need: A composite resource or batch query format
- solving "Backend N+1", a **`QUERY`**-based API would need: Joins, batching, caching, query planning

OpenAPI v3.2.1 includes **`QUERY`**, and Swagger supports v3.2.1
