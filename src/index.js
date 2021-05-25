/*
  Using Cloudflare Workers to serve a custom XML sitemap.
*/

// Default event
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// Handling the request within the event
const handleRequest = async (request) => {
  // Save the request as a new Request
  request = new Request(request);

  // Save the requested URL as an object
  const url = new URL(request.url);

  // For the test example we set the host as 'example.com', so we can proxy example.com into the example.
  url.host = 'example.com';

  // If the pathname is /sitemap.xml, we need to do something
  if(url.pathname === '/sitemap.xml'){

    // Return the created XML sitemap
    return await createSitemap();
  }

  // Fetch the URL and return its contents
  return fetch(url);

}

// Create the XML sitemap by requesting the information, creating the XML document and responding with it.
const createSitemap = async () => {
  // Set the headers - which for an XML sitemap should be 'text/xml' and set the charset (UTF-8)
  const headers = {
    headers:{
      'content-type': 'text/xml; charset=utf-8'
    }
  };

  // Request the file contents from GitHub
  const response = await fetch('https://raw.githubusercontent.com/Kevin-Ellen/custom-xml-sitemap-cloudflare-worker-javascript/main/data/url-list.txt');

  // Read the contents and transform the promise to text().
  const file = await response.text();

  // Split the file into an array, based on a new line character (\n)
  const array = file.split('\n');

  // Start constructing the XML as a string; unfortunately we cannot use a more elegant solution without the use of additional libraries

  // Start with the XML declaration
  let xml = `<?xml version="1.0" encoding="utf-8"?>`;
  
  // Adding the overall node (urlset)
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

  // Loop through the array
  array.forEach(item => {
    // Add the opening URL node
    xml += `<url>`;
    // Add the opening loc node
    xml += `<loc>`;
    // Add the URL
    xml += item;
    // Add the closing loc node
    xml += `</loc>`;
    // Add the closing URL node
    xml += `</url>`;
  });

  // Adding the closing node
  xml += `</urlset>`;

  // Create the response with the body (XML) and headers
  return new Response(
    xml,
    headers
  );
}