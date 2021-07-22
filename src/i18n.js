import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import translationEN from './langs/en.json'
import translationFR from './langs/fr.json'

let defaultLanguage = navigator.language || navigator.userLanguage
defaultLanguage = defaultLanguage.split("-")[0]
const resources = {
    en: {
        translation: translationEN
    },
    fr: {
        translation: translationFR
    }
}

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: defaultLanguage,

        keySeparator: ".",

        interpolation: {
            escapeValue: false
        }
    })

export default i18n
