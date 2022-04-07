import React, { FormEvent } from "react";

function Url({
  handleSubmit,
  urlIsValid,
  handleChangeUrl,
  checkUrl,
}: {
  handleSubmit: (e: FormEvent<HTMLFormElement>) => void;
  urlIsValid: boolean;
  handleChangeUrl: (url: string) => void;
  checkUrl: (url: string) => void;
}) {
  return (
    <div className="url">
      <h1 className="font-xl">Utför en granskning av din webbsida.</h1>
      <form
        onSubmit={(e) => handleSubmit(e)}
        className={`url__inputWrapper ${
          urlIsValid ? "" : "url__inputWrapper--error"
        }`}
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
    </div>
  );
}

export default Url;
