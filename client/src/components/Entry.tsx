import React, { useEffect, useState } from "react";
import { nanoid } from "nanoid";
import { Entry as EntryInterface } from "../../../server/src/interfaces";
import EntryError from "./EntryError";
import { ERROR_COLOR, WARNING_COLOR } from "../utils";

function Entry({ entry }: { entry: EntryInterface }) {
  const [isOpen, setIsOpen] = useState(false);

  const setColor = (entry: EntryInterface, color: string) => {
    return entry.approved ? color : ERROR_COLOR;
  };

  const separateElement = (string: string) => {
    // if (!string) return [{ html: "", type: "" }];
    const splitTagFromContent = string.split(/(<[^]+?>)/g);
    splitTagFromContent.pop(), splitTagFromContent.shift(); // remove start and end bcus they are empty

    const tagStart = splitTagFromContent[0];
    const tagContent = splitTagFromContent[1];
    const tagEnd = splitTagFromContent[2];

    let formatStartTagArray = [{ html: tagStart, type: "tag", uid: nanoid() }];

    try {
      let placesToInsertSpace: any[] = [];
      const REG = new RegExp(`(?<= )([^ ]*)(?==")|(?<==")(.*?)(?=")|(=?")`, "g");
      const startTagArray = tagStart.split(REG).filter((x) => x);
      formatStartTagArray = startTagArray.map((str, idx, self) => {
        if (idx === 0) return { html: str, type: "tag", uid: nanoid() };
        if (str === '"' || str === '="' || str === ">") return { html: str, type: "extra", uid: nanoid() };
        if (str === " ") return { html: str, type: "space", uid: nanoid() };
        if (self[idx - 1] === " ") return { html: str, type: "attribute", uid: nanoid() };
        if (idx === 1 && self[idx - 1].includes(" ")) {
          placesToInsertSpace.push(idx);
          return { html: str, type: "attribute", uid: nanoid() };
        }
        if (self[idx - 1] === '="') return { html: str, type: "value", uid: nanoid() };

        return { html: str, type: "", uid: nanoid() };
      });

      placesToInsertSpace.forEach((idx) =>
        (formatStartTagArray as any).splice(idx, 0, { html: " ", type: "space", uid: nanoid() })
      );
    } catch {}
    return [
      ...formatStartTagArray,
      { html: tagContent, type: "content", uid: nanoid() },
      { html: tagEnd, type: "tag", uid: nanoid() },
    ];
  };

  // const splitTag = (html: string) => {
  //   const regex = new RegExp(`(${current.toLowerCase()})`);
  //   const splitted = html.split(regex);

  //   return splitted;
  // };

  // const setTagStyle = (idx: number) => {
  //   const style: any = {};

  //   if (idx === 1) {
  //     style["color"] = isError ? ERROR_COLOR : "";
  //   }

  //   return style;
  // };

  return (
    <li key={nanoid()} className="entry">
      <div
        style={entry.approved ? { cursor: "default" } : {}}
        className="entryWrapper"
        onClick={() => setIsOpen((bool) => !bool)}
      >
        <div className="entry__icon">
          {entry.approved ? (
            <i className="fa-solid fa-check" style={{ color: "green" }}></i>
          ) : (
            <i className="fa-solid fa-triangle-exclamation" style={{ color: WARNING_COLOR }}></i>
          )}
        </div>

        <div className="entry__main">
          <span className="entry__text">{entry.text}</span>

          {/* <span className="entry__tag" style={{ color: setColor(entry, "") }}>
            {entry.tagEnd === '">' ? (
              <span className="tag-start-bg">
                {entry.tagStart.split("$")[0]}
                <span style={{ color: setColor(entry, "#d78c66") }}>{entry.tagStart.split("$")[1]}</span>
                {entry.tagStart.split("$")[2]}
              </span>
            ) : entry.tagStart ? (
              <span className="tag-start-bg">{entry.tagStart}</span>
            ) : null}

            <span className="entry__responsiveWrapper">
              <span
                className="entry__textResponsive tag-content-bg"
                style={entry.tagEnd === '">' ? { color: "#d78c66" } : { color: "white" }}
              >
                {entry.elementContent}
              </span>
            </span>

            {entry.tagStart ? <span className="tag-end-bg">{entry.tagEnd}</span> : null}
          </span> */}
          <span style={{ flexGrow: "1", display: "flex" }}>
            {entry.outerHTML ? (
              separateElement(entry.outerHTML).map(({ html, type, uid }, idx) => (
                <React.Fragment key={uid}>
                  {type === "tag" ? <div className={idx === 0 ? "tag-start-bg" : "tag-end-bg"}>{html}</div> : null}
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
                </React.Fragment>
              ))
            ) : (
              <div>{entry.fallbackHTML}</div>
            )}
          </span>
        </div>
        {!entry.approved ? (
          <div className="entry__chevron">
            <i className="fa-solid fa-chevron-down" style={isOpen ? { transform: "rotateX(180deg)" } : {}}></i>
          </div>
        ) : null}
      </div>
      {!entry.approved ? <EntryError error={entry.error} isOpen={isOpen} /> : null}
    </li>
  );
}

export default Entry;
