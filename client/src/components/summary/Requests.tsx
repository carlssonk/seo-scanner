import React from "react";
import SummaryEntry from "../SummaryEntry";
import { formatTotalSize } from "../../utils";

function Requests({ data, summary, setSummary }: { data: any; summary: any; setSummary: any }) {
  return (
    <div className="boxStyle">
      <div>
        <h3>Total Nedladdningsstorlek - {data && formatTotalSize(data.totalPageSize)}</h3>
        <div className="summary">
          {summary &&
            summary
              .sort((a: any, b: any) => b[1].totalSize - a[1].totalSize)
              .map(([req, info]: [a: any[], b: { type: string; totalSize: number; showText: boolean }], i: number) => (
                <SummaryEntry
                  display="size"
                  i={i}
                  category={info.type}
                  totalSize={info.totalSize}
                  showText={info.showText}
                  requests={req.length}
                  data={data}
                  formatTotalSize={formatTotalSize}
                  summary={summary}
                  setSummary={setSummary}
                />
              ))}
        </div>
      </div>
      <div>
        <h3>Total Sidoförfrågningar - {data && data.totalPageRequests}st</h3>
        <div className="summary">
          {summary &&
            summary
              .sort((a: any, b: any) => b[0].length - a[0].length)
              .map(([req, info]: [a: any[], b: { type: string; totalSize: number; showText: boolean }], i: number) => (
                <SummaryEntry
                  display="requests"
                  i={i}
                  category={info.type}
                  totalSize={info.totalSize}
                  showText={info.showText}
                  requests={req.length}
                  data={data}
                  formatTotalSize={formatTotalSize}
                  summary={summary}
                  setSummary={setSummary}
                />
              ))}
        </div>
      </div>
      <ul className="summary__typeList">
        <li>
          <div className="summary__bullet summary__entry--html"></div>
          <div>HTML</div>
        </li>
        <li>
          <div className="summary__bullet summary__entry--css"></div>
          <div>CSS</div>
        </li>
        <li>
          <div className="summary__bullet summary__entry--javascript"></div>
          <div>JavaScript</div>
        </li>
        <li>
          <div className="summary__bullet summary__entry--font"></div>
          <div>Font</div>
        </li>
        <li>
          <div className="summary__bullet summary__entry--image"></div>
          <div>Image</div>
        </li>
        <li>
          <div className="summary__bullet summary__entry--video"></div>
          <div>Video</div>
        </li>
        <li>
          <div className="summary__bullet summary__entry--other"></div>
          <div>Other</div>
        </li>
      </ul>
    </div>
  );
}

export default Requests;
