import React, { FormEvent } from "react";
import { ERROR_COLOR } from "../utils";

function Url({
  handleSubmit,
  urlIsValid,
  handleChangeUrl,
  checkUrl,
  errorText,
}: {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  urlIsValid: boolean;
  handleChangeUrl: (url: string) => void;
  checkUrl: (url: string) => void;
  errorText: string;
}) {
  return (
    <div className="url">
      <h1 className="font-xl">Utför en granskning av din webbsida.</h1>
      <p className="primary-paragraph margin-0-auto font-m">
        Se hur din webbplats presterar, ta reda på varför den är långsam och upptäck optimeringsmöjligheter.
      </p>
      <form
        onSubmit={(e) => handleSubmit(e)}
        className={`url__inputWrapper ${urlIsValid ? "" : "url__inputWrapper--error"}`}
      >
        <input
          className="url__input"
          type="text"
          placeholder="Ange URL för att analysera..."
          required
          onChange={(e) => handleChangeUrl(e.target.value)}
          onBlur={(e) => checkUrl(e.target.value)}
        />
        <button className="url__button btn-primary">Testa sidan</button>
      </form>
      <b style={{ color: ERROR_COLOR }}>{errorText}</b>
    </div>
  );
}

export default Url;
