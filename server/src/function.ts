import { init } from "./utils/init.js";
import { isDevelopment } from "./utils/utils.js";

export const handler = async (event) => {
  const httpHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
  };

  const response = {
    statusCode: 200,
    headers: httpHeaders,
    body: null,
  };

  let url = "";

  if (event.queryStringParameters && event.queryStringParameters.url) {
    url = event.queryStringParameters.url;
  }

  let data: any;
  try {
    data = await init(url);
  } catch (error) {
    response.statusCode = 500;
    response.body = JSON.stringify({ data: { error: "ERROR", log: error, extra: isDevelopment } });
    return response;
  }

  response.body = JSON.stringify({ data });

  return response;
};
