import React, { useState } from "react";
import { Entry as EntryInterface } from "../../../server/src/interfaces";

function EntryError({ entry, isOpen }: { entry: EntryInterface; isOpen: boolean }) {
  const closedStyle = {
    overflow: "hidden",
    height: 0,
  };

  return (
    <div className="entryError" style={!isOpen ? closedStyle : {}}>
      <div className="entryError__wrapper">
        {typeof entry.error === "object" ? (
          <>
            <div>{entry.error.text}</div>
            <ul>
              {entry.error.elements.map(({ outerHTML, screenshot }) => (
                <li className="altErrorEntry">
                  {screenshot ? (
                    <div className="altErrorEntry__imageWrapper">
                      <img src={`data:image/png;base64, ${screenshot}`}></img>
                    </div>
                  ) : null}
                  <div style={{ display: "flex" }}>
                    <div className="element-style entry__textResponsive">
                      {`${outerHTML.split(/ (.*)/s)[0]} `}
                      <span className="altErrorEntry__alt">alt="..."</span>
                      {` ${outerHTML.split(/ (.*)/s)[1]}`}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div>{entry.error}</div>
        )}
      </div>
    </div>
  );
}

export default EntryError;
