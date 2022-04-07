import request_client from "request-promise-native";
import { gzipSizeSync } from "gzip-size";

const hasExtension = (string, extension) => {
  const stringArray = string.split("/");
  if (stringArray.length > 0) {
    return stringArray[stringArray.length - 1].includes(extension);
  }
};

export const requestHandler = () => {
  let requestDetails = {
    html: [],
    javascript: [],
    css: [],
    image: [],
    video: [],
    font: [],
    other: [],
  };

  return {
    details() {
      return requestDetails;
    },

    onRequest(request) {
      request_client({
        uri: request.url(),
        resolveWithFullResponse: true,
      })
        .then((response) => {
          const request_url = request.url();
          const request_headers = request.headers();
          const request_post_data = request.postData();
          const response_headers = response.headers;
          const response_size = response_headers["content-length"];
          const response_type = response_headers["content-type"];
          const response_body = response.body;

          // SET totalPageRequests

          // HTML

          if (response_type.includes("text/html")) {
            return addDetail("html");
          }

          // JS
          // console.log(response_type);
          if (
            response_type.includes("javascript") ||
            hasExtension(request_url, ".js")
          ) {
            return addDetail("javascript");
          }

          // CSS
          if (response_type.includes("text/css")) {
            return addDetail("css");
          }

          // IMG
          if (response_type.includes("image")) {
            return addDetail("image");
          }

          // Video
          if (response_type.includes("video")) {
            return addDetail("video");
          }

          // Font
          if (response_type.includes("font")) {
            return addDetail("font");
          }

          // Other
          return addDetail("other");

          function addDetail(field) {
            requestDetails[field].push({
              url: request_url,
              resourceSize: parseInt(response_size) || 0,
              transferSize: gzipSizeSync(response_body),
            });
            request.continue();
          }
        })
        .catch((error) => {
          // console.error(error);
          request.abort();
        });
    },
  };
};
