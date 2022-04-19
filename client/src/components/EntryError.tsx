import React, { useState, useEffect } from "react";
import { Error as ErrorInterface } from "../../../server/src/interfaces";
import { ERROR_COLOR, formatTotalSize } from "../utils";
import { nanoid } from "nanoid";
import SkippedHeadingEntry from "./SkippedHeadingEntry";

function EntryError({ error, isOpen }: { error: ErrorInterface; isOpen: boolean }) {
  const [outerHTMLS, setOuterHTMLS] = useState<any[]>([]);

  useEffect(() => {
    if (typeof error === "object") {
      setOuterHTMLS(error.elements.map((x) => x.outerHTML));
    }
  }, []);

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
              {error.auditType === "SIZE"
                ? error.elements.map(({ url, transferSize }) => (
                    <li key={nanoid()} className="networkErrorEntry">
                      <div className="networkErrorEntry__imageWrapper">
                        <img src={url} alt="" />
                      </div>
                      <a className="networkErrorEntry__url" href="url">
                        {url}
                      </a>
                      <div className="networkErrorEntry__size">{formatTotalSize(transferSize)}</div>
                    </li>
                  ))
                : null}
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
                ? error.elements.map(({ previous, expected, current, outerHTML, screenshot }, index) => (
                    <li className="altErrorEntry">
                      {/* {screenshot ? (
                        <div className="altErrorEntry__imageWrapper">
                          <img src={`data:image/png;base64, ${screenshot}`}></img>
                        </div>
                      ) : null} */}
                      <div className="mbottom-m">
                        Den föregående rubriknivån är {previous}, så nästa förväntade rubriknivå är {expected}
                      </div>
                      <b>Ändra på följande </b>
                      <SkippedHeadingEntry outerHTML={outerHTML} isError={true} current={current} />
                      <b> till </b>
                      <SkippedHeadingEntry
                        outerHTML={replaceOuterTags(outerHTML, expected)}
                        isError={false}
                        current={expected}
                      />
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
