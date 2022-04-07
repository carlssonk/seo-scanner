import React, { useState } from "react";
import { nanoid } from "nanoid";
import { Entry as EntryInterface } from "../../../server/src/interfaces";
import EntryError from "./EntryError";

const ERROR_COLOR = "rgb(255, 100, 100)";
const WARNING_COLOR = "orange";

function Entry({ entry }: { entry: EntryInterface }) {
  const [isOpen, setIsOpen] = useState(false);

  const setColor = (entry: EntryInterface, color: string) => {
    return entry.approved ? color : ERROR_COLOR;
  };

  return (
    <li key={nanoid()} className="entry">
      <div className="entryWrapper" onClick={() => setIsOpen((bool) => !bool)}>
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
            ) : (
              <span className="tag-start-bg">{entry.tagStart}</span>
            )}

            <span className="entry__responsiveWrapper">
              <span
                className="entry__textResponsive tag-content-bg"
                style={entry.tagEnd === '">' ? { color: "#d78c66" } : { color: "white" }}
              >
                {entry.elementContent}
              </span>
            </span>

            <span className="tag-end-bg">{entry.tagEnd}</span>
          </span>
        </div>
      </div>
      {true ? <EntryError entry={entry} isOpen={isOpen} /> : null}
    </li>
  );
}

export default Entry;
