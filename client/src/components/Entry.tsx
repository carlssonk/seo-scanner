import React, { useState } from "react";
import { nanoid } from "nanoid";
import { Entry as EntryInterface } from "../../../server/src/interfaces";
import EntryError from "./EntryError";
import { ERROR_COLOR, WARNING_COLOR } from "../utils";

function Entry({ entry }: { entry: EntryInterface }) {
  const [isOpen, setIsOpen] = useState(false);

  const setColor = (entry: EntryInterface, color: string) => {
    return entry.approved ? color : ERROR_COLOR;
  };

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

          <span className="entry__tag" style={{ color: setColor(entry, "") }}>
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
