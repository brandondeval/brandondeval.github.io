module.exports = {
  siteMetadata: {
    title: `BrandonDeval.com`,
    author: {
      name: `Brandon Devaleriola`,
      summary: `who lives and works in Remote Land.`,
    },
    description: `A starter blog demonstrating what Gatsby can do.`,
    siteUrl: `https://brandondeval.com`,
    social: {
      linkedin: ``,
    },
  },
  plugins: [
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        path: `${__dirname}/content/blog`,
        name: `blog`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-prismjs`,
            options: {
              noInlineHighlight: true,
              languageExtensions: [
                // Load JSON before HTTP so Content-Type bodies use its grammar.
                { extend: `json`, definition: {} },
                {
                  extend: `http`,
                  insertBefore: {
                    "request-line": {
                      "query-request-line": {
                        pattern: /^QUERY\s(?:https?:\/\/|\/)\S*(?:\sHTTP\/[\d.]+)?$/m,
                        inside: {
                          method: {
                            pattern: /^QUERY\b/,
                            alias: [`keyword`],
                          },
                          "request-target": {
                            pattern: /^(\s)(?:https?:\/\/|\/)\S*/,
                            lookbehind: true,
                            alias: [`url`],
                          },
                          "http-version": {
                            pattern: /HTTP\/[\d.]+$/,
                            alias: [`property`],
                          },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-react-helmet`,
  ],
}
