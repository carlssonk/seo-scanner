import React, { useEffect } from "react";
import { ERROR_COLOR, SUCCESS_COLOR } from "../utils";

function SkippedHeadingEntry({
  outerHTML,
  isError,
  current,
}: {
  outerHTML: string;
  isError: boolean;
  current: string;
}) {
  const seperateHeading = (string: string) => {
    const array = string.split(/(<[^]+?[1-6]|>)/g);
    array.pop(), array.shift(), array.splice(-2); // remove start and end bcus they are empty

    console.log(array);
    const res = [
      { html: array[0], type: "tag", className: "tag-start-bg" },
      { html: array[1], type: "attribute", className: "tag-content-bg" },
      { html: array[2], type: "tag", className: "tag-content-bg" },
      { html: array[3], type: "content", className: "tag-content-bg" },
      { html: `${array[4]}>`, type: "tag", className: "tag-end-bg" },
    ].filter((x) => x.html);
    return res;
  };

  const separateElement = (string: string) => {
    const splitTagFromContent = string.split(/(<[^]+?>)/g);
    splitTagFromContent.pop(), splitTagFromContent.shift(); // remove start and end bcus they are empty

    const tagStart = splitTagFromContent[0];
    const tagContent = splitTagFromContent[1];
    const tagEnd = splitTagFromContent[2];

    let startTagArray = tagStart.split(/(?<= )([^ ]*)(?==")|(?<==")(.*?)(?=")|(\s)|(=?")/g).filter((x) => x);

    const formatStartTagArray = startTagArray.map((str, idx, self) => {
      if (idx === 0) return { html: str, type: "tag" };
      if (str === '"' || str === '="' || str === ">") return { html: str, type: "extra" };
      if (str === " ") return { html: str, type: "space" };
      if (self[idx - 1] === " ") return { html: str, type: "attribute" };
      if (self[idx - 1] === '="') return { html: str, type: "value" };
      return { html: str, type: "" };
    });

    return [...formatStartTagArray, { html: tagContent, type: "content" }, { html: tagEnd, type: "tag" }];
  };

  useEffect(() => {
    console.log(current);
  }, []);

  const splitTag = (html: string) => {
    // console.log(html);
    const regex = new RegExp(`(${current.toLowerCase()})`);
    const splitted = html.split(regex);
    // console.log(splitted);
    // .map((x, idx, self) => <div className={idx === 0 ? "tag-start-bg" : "tag-end-bg"}>{x}</div>);
    // console.log(html);
    return splitted;
  };

  const setTagStyle = (idx: number) => {
    const style: any = {};

    if (idx === 1) {
      style["color"] = isError ? ERROR_COLOR : "";
    }

    return style;
  };

  const setTagClass = (str, idx) => {
    if (str === "<") return "tag-start-bg";
    if (str === ">") return "tag-end-bg";
    return "tag-content-bg";
  };

  return (
    <div className="entry__tag my-s">
      {separateElement(outerHTML).map(({ html, type }, idx) => (
        <>
          {type === "tag"
            ? splitTag(html).map((x, idx, self) => (
                <div className={setTagClass(x, idx)} style={setTagStyle(idx)}>
                  {x}
                </div>
              ))
            : null}
          {type === "extra" ? <div className="tag-content-bg">{html}</div> : null}
          {type === "space" ? <div className="tag-content-bg" style={{ padding: "0 2px" }}></div> : null}
          {type === "attribute" ? (
            <div className="tag-content-bg" style={{ color: "#9bbbdc" }}>
              {html}
            </div>
          ) : null}

          {type === "value" || type === "content" ? (
            <div className="entry__responsiveWrapper" style={type === "content" ? { flexGrow: "100" } : {}}>
              <div
                style={type === "value" ? { color: "#f29766" } : { color: "white" }}
                className="entry__textResponsive tag-content-bg"
              >
                {type === "value" ? <span>{html}</span> : html}
              </div>
            </div>
          ) : null}
        </>
      ))}
    </div>
  );
}

export default SkippedHeadingEntry;
