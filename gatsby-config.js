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
    `gatsby-transformer-remark`,
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    `gatsby-plugin-react-helmet`,
  ],
}
