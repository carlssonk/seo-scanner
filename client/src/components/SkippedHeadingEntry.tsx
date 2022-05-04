import { ERROR_COLOR, separateElement } from "../utils";

function SkippedHeadingEntry({
  outerHTML,
  isError,
  current,
}: {
  outerHTML: string;
  isError: boolean;
  current: string;
}) {
  const splitTag = (html: string) => {
    const regex = new RegExp(`(${current.toLowerCase()})`);
    const splitted = html.split(regex);
    return splitted;
  };

  const setTagStyle = (idx: number) => {
    const style: any = {};

    if (idx === 1) {
      style["color"] = isError ? ERROR_COLOR : "";
    }

    return style;
  };

  const setTagClass = (str: string) => {
    if (str === "<") return "tag-start-bg";
    if (str === ">") return "tag-end-bg";
    return "tag-content-bg";
  };

  return (
    <div className="entry__tag my-s">
      {separateElement(outerHTML).map(({ html, type }) => (
        <>
          {type === "tag"
            ? splitTag(html).map((x, idx, self) => (
                <div className={setTagClass(x)} style={setTagStyle(idx)}>
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
