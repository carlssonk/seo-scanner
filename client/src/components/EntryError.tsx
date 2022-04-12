import React, { useState } from "react";
import { Error as ErrorInterface } from "../../../server/src/interfaces";
import { ERROR_COLOR } from "../utils";
import { nanoid } from "nanoid";

function EntryError({ error, isOpen }: { error: ErrorInterface; isOpen: boolean }) {
  const closedStyle = {
    overflow: "hidden",
    height: 0,
  };

  const replaceOuterTags = (string: string, newTag: string) => {
    // remove first 3 letters and last 5 letters
    // i.e. <h* and </h*>
    const stripped = string.slice(3).slice(0, -5);
    const tag = newTag.toLowerCase();
    return `<${tag}${stripped}</${tag}>`;
  };

  const seperateHTML = (string: string) => {
    const array = string.split(/(<[^]+?>)/g);
    array.pop(), array.shift(); // remove start and end bcus they are empty
    const tagStart = array[0],
      tagEnd = array[array.length - 1];
    array.pop(), array.shift(); // now remove tags
    const elementContent = array.join("");
    return [tagStart, elementContent, tagEnd];
  };

  return (
    <div className="entryError" style={!isOpen ? closedStyle : {}}>
      <div className="entryError__wrapper">
        {typeof error === "object" ? (
          <>
            <div>
              <b>{error.text}</b>
            </div>
            <div>{error.helpText}</div>
            <ul>
              {error.auditType === "ALT"
                ? error.elements.map(({ outerHTML, screenshot }) => (
                    <li key={nanoid()} className="altErrorEntry">
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
                  ))
                : null}
              {error.auditType === "HEADING"
                ? error.elements.map(({ previous, expected, current, outerHTML, screenshot }) => (
                    <li className="altErrorEntry">
                      {screenshot ? (
                        <div className="altErrorEntry__imageWrapper">
                          <img src={`data:image/png;base64, ${screenshot}`}></img>
                        </div>
                      ) : null}
                      <div className="mbottom-m">
                        Den föregående rubriknivån är {previous}, så nästa förväntade rubriknivå är {expected}
                      </div>
                      <b>Ändra på följande </b>
                      <div className="entry__tag">
                        <div style={{ color: ERROR_COLOR }} className="tag-start-bg">
                          {seperateHTML(outerHTML)[0]}
                        </div>
                        <div className="entry__responsiveWrapper">
                          <div style={{ color: "white" }} className="entry__textResponsive tag-content-bg">
                            {seperateHTML(outerHTML)[1]}
                          </div>
                        </div>
                        <div style={{ color: ERROR_COLOR }} className="tag-end-bg">
                          {seperateHTML(outerHTML)[2]}
                        </div>
                      </div>
                      <b> till </b>
                      <div className="entry__tag">
                        <div className="tag-start-bg">{seperateHTML(replaceOuterTags(outerHTML, expected))[0]}</div>
                        <div className="entry__responsiveWrapper">
                          <div style={{ color: "white" }} className="entry__textResponsive tag-content-bg">
                            {seperateHTML(outerHTML)[1]}
                          </div>
                        </div>
                        <div className="tag-end-bg">{seperateHTML(replaceOuterTags(outerHTML, expected))[2]}</div>
                      </div>
                    </li>
                  ))
                : null}
            </ul>
          </>
        ) : (
          <div>{error}</div>
        )}
      </div>
    </div>
  );
}

export default EntryError;
