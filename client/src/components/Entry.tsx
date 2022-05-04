import React, { useState } from "react";
import { nanoid } from "nanoid";
import { Entry as EntryInterface } from "../../../server/src/interfaces";
import EntryError from "./EntryError";
import { separateElement, WARNING_COLOR } from "../utils";

function Entry({ entry }: { entry: EntryInterface }) {
  const [isOpen, setIsOpen] = useState(false);

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
