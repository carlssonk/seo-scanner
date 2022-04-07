import { useState, useRef, createRef, useEffect } from "react";
import { nanoid } from "nanoid";
// import logo from './logo.svg'
// import './App.css'

import { FormEvent } from "react";
import Url from "./components/Url";

function App() {
  // const [count, setCount] = useState(0)
  const [url, setUrl] = useState("");
  const [urlIsValid, setUrlIsValid] = useState(true);
  const [flowState, setFlowState] = useState(0);

  // All data
  const [data, setData] = useState(null);
  // Formatted data
  const [summary, setSummary] = useState(null);
  // Formatted data
  const [details, setDetails]: any = useState(null);
  const entryRefs = useRef([
    { name: "SEO", data: [createRef(), createRef(), createRef(), createRef(), createRef()] },
    { name: "SCRIPT", data: [createRef(), createRef(), createRef()] },
  ]);
  // entryRefs.current = details.map((_: any, i: number) => entryRefs.current[i] ?? createRef());
  // console.log(entryRefs);
  // useEffect(() => {
  // entryRefs
  // console.log(details);
  // }, [details]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (validURL(url)) {
      let finalUrl: string = url;
      // Appends http:// if not present
      if (url.slice(0, 5) !== "http:" && url.slice(0, 6) !== "https:") {
        finalUrl = `http://${url}`;
        setUrl(finalUrl);
      }

      setFlowState(1);
      const res = await fetch(`/api/audit?url=${finalUrl}`, {
        method: "GET",
        headers: {
          Accept: "application/javascript",
          "Content-Type": "application/javascript",
        },
      });
      setFlowState(2);
      const { data } = await res.json();
      setData(data);
      const pageDetails = [
        { name: "SEO", data: data.seoDetails },
        { name: "SCRIPT", data: data.scriptDetails },
      ];
      setDetails(pageDetails);
      console.log(data);
    }
  };

  const handleChangeUrl = (string: string): void => {
    if (!urlIsValid) checkUrl(string);
    setUrl(string);
  };

  const checkUrl = (url: string): void => {
    if (url.length === 0) return setUrlIsValid(true);
    setUrlIsValid(validURL(url));
  };

  const validURL = (str: string): boolean => {
    const pattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
        "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    ); // fragment locator
    return !!pattern.test(str);
  };

  return (
    <div className="audit">
      <div className="audit__wrapper">
        {flowState === 0 && (
          <Url
            handleSubmit={handleSubmit}
            urlIsValid={urlIsValid}
            handleChangeUrl={handleChangeUrl}
            checkUrl={checkUrl}
          />
        )}

        {flowState === 1 && (
          <div className="loading">
            <div>
              <h1>Analyserar din URL...</h1>
              <a href={url} target="_blank" className="loading__urlAnchor">
                <h2 className="loading__urlText">{url}</h2>
              </a>
            </div>

            <div className="loaderContainer">
              <div className="loader"></div>
            </div>
          </div>
        )}

        {flowState === 2 && (
          <div className="result">
            <div>
              <h1>Ngine Score: 100 / 100</h1>
            </div>
            <div>
              <h1>Sammanfatting</h1>
              {/* <div></div> */}
            </div>
            <div>
              <h1>Detaljer</h1>
              <ul>
                {details &&
                  details.map((category: any) => (
                    <li key={nanoid()}>
                      <h2>{category.name}</h2>
                      <ul>
                        {category.data &&
                          category.data.map((entry: any) => (
                            <li key={nanoid()} className="entry">
                              <div className="entry__icon">
                                {entry.approved ? (
                                  <i className="fa-solid fa-check" style={{ color: "green" }}></i>
                                ) : (
                                  <i className="fa-solid fa-xmark" style={{ color: "red" }}></i>
                                )}
                              </div>

                              <div className="entry__main">
                                <span className="entry__text">{`${entry.text.split("$")[0]}`}</span>

                                <span className="entry__tag" style={entry.approved ? {} : { color: "red" }}>
                                  {entry.tagEnd === '">' ? (
                                    <span className="tag-start-bg">
                                      {entry.tagStart.split("$")[0]}
                                      <span style={{ color: "#d78c66" }}>{entry.tagStart.split("$")[1]}</span>
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
                                <span className="entry__text">{`${entry.text.split("$")[1]} `}</span>
                              </div>
                            </li>
                          ))}
                      </ul>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
