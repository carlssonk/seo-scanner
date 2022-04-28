import { nanoid } from "nanoid";
import React, { useRef, useState, useEffect, SetStateAction, Dispatch } from "react";

function SummaryEntry({
  display,
  i,
  category,
  totalSize,
  showText,
  requests,
  data,
  formatTotalSize,
  summary,
  setSummary,
}: {
  display: string;
  i: number;
  category: string;
  totalSize: number;
  showText: boolean;
  requests: any;
  data: any;
  formatTotalSize: (a: number) => string;
  summary: any[];
  setSummary: Dispatch<SetStateAction<any[]>>;
}) {
  const ref = useRef<any>(null);

  useEffect(() => {
    // if (ref.current.offsetWidth < 50) {
    const updatedSummary = [...summary];
    updatedSummary[i][1].showText = false;
    setSummary(updatedSummary);
    // }
  }, []);

  const categoryNameMap: any = {
    javascript: "JS",
    font: "Font",
    image: "IMG",
    css: "CSS",
    html: "HTML",
    video: "Video",
    other: "Other",
  };

  return (
    <div
      ref={ref}
      className={`summary__entry summary__entry--${category}`}
      style={
        data && display === "size"
          ? { width: `${(totalSize / data.totalPageSize) * 100}%` }
          : { width: `${(requests / data.totalPageRequests) * 100}%` }
      }
    >
      {ref.current && ref.current.offsetWidth > 50 ? (
        <>
          <div>{categoryNameMap[category]}</div>
          {display === "size" ? <div>{formatTotalSize(totalSize)}</div> : null}
          {display === "requests" ? <div>{requests}st</div> : null}
        </>
      ) : null}
    </div>
  );
}

export default SummaryEntry;
