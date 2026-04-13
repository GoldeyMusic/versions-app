import { createContext, useContext } from "react";
import STRINGS from "../constants/strings";

const LangContext = createContext({ lang: "fr", s: STRINGS.fr, setLang: () => {} });

const useLang = () => useContext(LangContext);

export { LangContext };
export default useLang;
