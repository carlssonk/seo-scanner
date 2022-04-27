export const ERROR_COLOR = "rgb(255, 100, 100)";
export const SUCCESS_COLOR = "#6ce88f";
export const WARNING_COLOR = "orange";

export const formatTotalSize = (number: number) => {
  const kb = number / 1000;
  const mb = kb / 1000;

  return kb < 1000 ? `${Math.round(kb)}KB` : `${mb.toFixed(2)}MB`;
};

export const ENDPOINT_URL = () => {
  return window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === ""
    ? "/api/audit"
    : "https://rpu4fu7cwxddtwd2y63vcxumrm0rbwcn.lambda-url.eu-north-1.on.aws";
};
