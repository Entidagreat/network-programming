import axios from 'axios';

const API_KEY = 'AIzaSyAAD1KKYkz-uurI44PPZ6ene0jMBELdH44'; // Replace with your actual API key

export const translateText = async (text, targetLanguage = 'en') => {
    const url = `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`;
    const response = await axios.post(url, {
        q: text,
        target: targetLanguage,
    });
    return response.data.data.translations[0].translatedText;
};