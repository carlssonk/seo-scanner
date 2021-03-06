import { useState, useRef, useEffect } from "react";
import { Entry as EntryInterface } from "../../server/src/interfaces";
import { nanoid } from "nanoid";
// import logo from './logo.svg'
import { formatTotalSize, ENDPOINT_URL, modalTextSEO, modalTextSCRIPT } from "./utils";
// import './App.css'
import Modal from "react-modal";

import { FormEvent } from "react";
import Url from "./components/Url";
import Entry from "./components/Entry";
import Requests from "./components/summary/Requests";

const KONTAKT_URL = "https://www.ngine.com/kontakta-oss";

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    maxWidth: "90%",
    minHeight: "300px",
    padding: "24px",
  },
  overlay: { zIndex: 1, backgroundColor: "rgb(0 0 0 / 40%)" },
};

Modal.setAppElement("#root");

function App() {
  const summaryRef = useRef<HTMLDivElement[]>([]);
  // const [count, setCount] = useState(0)
  const [url, setUrl] = useState("");
  const [urlIsValid, setUrlIsValid] = useState(true);
  const [flowState, setFlowState] = useState(0);
  const [score, setScore] = useState(0);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [modalText, setModalText] = useState("");

  // All data
  const [data, setData] = useState<any>(null);
  // Formatted data
  const [summary, setSummary] = useState<any[]>([]);
  // Formatted data
  const [details, setDetails]: any = useState(null);

  useEffect(() => {
    summaryRef.current = summaryRef.current.slice(0, summary.length);
  }, [summary]);

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
      const res = await fetch(`${ENDPOINT_URL()}?url=${finalUrl}`, {
        method: "GET",
        headers: {
          Accept: "application/javascript",
          "Content-Type": "application/javascript",
        },
      });

      if (res.status !== 200 && res.status !== 500) {
        setErrorText(`Hoppsan, n??got gick fel.`);
        return setFlowState(0);
      }

      const { data } = await res.json();

      if (data.error) {
        setErrorText(`Tyv??rr gick det inte att utf??ra en granskning p?? ${url}`);
        return setFlowState(0);
      }

      document.body.style.backgroundColor = "#f6f7f7";
      setFlowState(2);
      setData(data);

      // : [string: any[]]
      const reqDetailsArray: [string, any][] = Object.entries(data.requestDetails);
      const formattedRequests = reqDetailsArray.map(([key, val]) => {
        return [
          val,
          {
            type: key,
            totalSize: val.reduce((acc: any, cur: any) => acc + cur.transferSize, 0),
            showText: true,
            uid: nanoid(),
          },
        ];
      });

      const pageDetails = [
        { name: "SEO", data: data.seoDetails.sort((a: any, b: any) => a.approved - b.approved), uid: nanoid() },
        { name: "SCRIPT", data: data.scriptDetails.sort((a: any, b: any) => a.approved - b.approved), uid: nanoid() },
      ];

      setDetails(pageDetails);
      setSummary(formattedRequests);
      setScore(calculateScore(data));
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

  const calculateScore = (data: any) => {
    let score = 0;
    // Calculate score based on SEO
    const passed = data.seoDetails.filter((x: any) => x.approved).length;
    const total = data.seoDetails.length;

    score = (passed / total) * 100;

    // Add to score OR remove depending on the loadingtime
    const pageFullyLoadedS = data.pageFullyLoaded / 1000;
    let addRemoveScore = pageFullyLoadedS > 15 ? -(pageFullyLoadedS - 15) : 15 - pageFullyLoadedS;

    score = Math.round(score + addRemoveScore);

    score = Math.max(0, score);
    score = Math.min(100, score);

    return score;
  };

  function getScrollbarWidth() {
    return window.innerWidth - document.documentElement.clientWidth;
  }

  function openModal(name: string) {
    if (name === "SEO") {
      setModalText(modalTextSEO);
    }
    if (name === "SCRIPT") {
      setModalText(modalTextSCRIPT);
    }

    setModalIsOpen(true);

    document.documentElement.style.marginRight = `${getScrollbarWidth()}px`;
    document.documentElement.style.overflow = "hidden";
  }

  function closeModal() {
    setModalIsOpen(false);
    document.documentElement.style.marginRight = ``;
    document.documentElement.style.overflow = "";
  }

  return (
    <div className="audit">
      <div className="audit__wrapper">
        {flowState === 0 && (
          <Url
            handleSubmit={handleSubmit}
            urlIsValid={urlIsValid}
            handleChangeUrl={handleChangeUrl}
            checkUrl={checkUrl}
            errorText={errorText}
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
              <div>
                <h2>Var v??nlig v??nta</h2>
                <h3>Detta kan ta upp till flera minuter...</h3>
              </div>
            </div>
          </div>
        )}

        {flowState === 2 && (
          <div className="result">
            <div className="goBack" onClick={() => location.reload()}>
              <i className="fa-solid fa-arrow-left"></i>
              <span>G??r om testet</span>
            </div>
            <h2 className="primary-h2">Sammanfattning</h2>
            <div className="summary__grid">
              <div className="boxStyle">
                <ul className="summary__list">
                  <li className="summary__listItem">
                    <div className="category-score" data-js="category-score" data-name="seo">
                      <div className="circle">
                        <svg id="svg" width="70" height="70" version="1.1" xmlns="http://www.w3.org/2000/svg">
                          <circle
                            className="circle-stroke"
                            r="33.333"
                            cx="35"
                            cy="35"
                            fill="transparent"
                            strokeDasharray={209 + (score / 100) * 209}
                            strokeDashoffset="0"
                          ></circle>
                        </svg>
                        <b className="circle-value" data-js="category-value">
                          {score}
                        </b>
                      </div>
                      <b>SEO Betyg</b>
                    </div>
                  </li>
                  <li className="summary__listItem summary__listItem">
                    <div className="summary__listValue summary__listValue">
                      <div>
                        {score === 100
                          ? "Sidan ser prima ut! Men det finns garanterat mer optimeringsm??jligheter som vi kan identifiera. Kontakta oss s?? hj??lper vi dig att ta n??sta steg!"
                          : "Det finns optimeringsm??jligheter p?? sidan. Kontakta oss s?? hj??lper vi dig att ta n??sta steg!"}
                      </div>

                      <button
                        className="summary__button btn-primary"
                        onClick={() => (window.location.href = KONTAKT_URL)}
                      >
                        Kontakta oss
                      </button>
                    </div>
                  </li>
                </ul>
              </div>
              <div className="boxStyle">
                <ul className="summary__list">
                  <li className="summary__listItem">
                    <div className="summary__listKey">Skanning utf??rdes</div>
                    <div className="summary__listValue">{new Date().toLocaleString()}</div>
                  </li>
                  <li className="summary__listItem">
                    <div className="summary__listKey">URL</div>
                    <a href={url} target="_blank" className="summary__listValue">
                      {url}
                    </a>
                  </li>
                  <li className="summary__listItem">
                    <div className="summary__listKey">Laddningstid</div>
                    <div className="summary__listValue">{data && (data.pageFullyLoaded / 1000).toFixed(1)}s</div>
                  </li>
                  <li className="summary__listItem">
                    <div className="summary__listKey">Sidstorlek</div>
                    <div className="summary__listValue">{data && formatTotalSize(data.totalPageSize)}</div>
                  </li>
                  <li className="summary__listItem">
                    <div className="summary__listKey">Godk??nda Granskningar</div>
                    <div className="summary__listValue">
                      {data && data.seoDetails.filter((x: any) => x.approved).length} / {data && data.seoDetails.length}
                    </div>
                  </li>
                </ul>
              </div>
              <Requests data={data} summary={summary} setSummary={setSummary} />
            </div>
            <h2 className="primary-h2">Detaljer</h2>
            <ul style={{ width: "100%", paddingBottom: "32px" }}>
              {details &&
                details.map((category: any) => (
                  <li key={category.uid} className="boxStyle details__listItem">
                    <div className="details__nameWrapper">
                      <h3>{category.name}</h3>
                      <i onClick={() => openModal(category.name)} className="fa-solid fa-circle-info"></i>
                    </div>
                    <ul className="details__entryList">
                      {category.data &&
                        category.data.map((entry: EntryInterface) => <Entry key={entry.uid} entry={entry} />)}
                    </ul>
                  </li>
                ))}
            </ul>
            <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles} contentLabel="Example Modal">
              <button className="modal-xmark" onClick={closeModal}>
                <i className="fa-solid fa-xmark"></i>
              </button>
              <p className="primary-paragraph">{modalText}</p>
            </Modal>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
