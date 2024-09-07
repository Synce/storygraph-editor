import {DOMParser} from '@xmldom/xmldom';
import atob from 'atob';
import pako from 'pako';
import {xml2json} from 'xml-js';

const parseXml = (xml: string): Document => {
  const parser = new DOMParser();
  return parser.parseFromString(xml, 'text/xml');
};

const mx2xml = (data: string): string | null => {
  let textContent = '';

  try {
    // Parsuje dane XML na strukturę DOM
    const node = parseXml(data).documentElement;

    // Sprawdza, czy główny węzeł to 'mxfile'
    if (node != null && node.nodeName === 'mxfile') {
      // Pobiera wszystkie węzły 'diagram' z XML
      const diagrams = node.getElementsByTagName('diagram');

      // Sprawdza, czy istnieje co najmniej jeden węzeł 'diagram' i wyodrębnia jego zawartość tekstową
      if (diagrams.length > 0 && diagrams[0] !== undefined) {
        textContent = diagrams[0].textContent ?? '';
      }
    }
  } catch (e) {
    // Rejestruje błąd, jeśli parsowanie XML się nie powiedzie i zwraca null
    console.error('Błąd podczas parsowania XML: ', e);
    return null;
  }

  try {
    // Dekoduje zawartość diagramu zakodowaną w base64
    textContent = atob(textContent);
  } catch (e) {
    // Rejestruje błąd, jeśli dekodowanie base64 się nie powiedzie i zwraca null
    console.error('Błąd podczas dekodowania base64: ', e);
    return null;
  }

  try {
    // Dekompresuje surowe dane przy użyciu pako i konwertuje je na ciąg znaków
    textContent = pako.inflateRaw(
      Uint8Array.from(textContent, c => c.charCodeAt(0)),
      {to: 'string'},
    );
  } catch (e) {
    // Rejestruje błąd, jeśli dekompresja się nie powiedzie i zwraca null
    console.error('Błąd podczas dekompresji: ', e);
    return null;
  }

  try {
    // Dekoduje zawartość zakodowaną w URI na jej oryginalną formę
    textContent = decodeURIComponent(textContent);
  } catch (e) {
    // Rejestruje błąd, jeśli dekodowanie URI się nie powiedzie i zwraca null
    console.error('Błąd podczas dekodowania URI: ', e);
    return null;
  }

  // Zwraca ostatecznie przetworzoną zawartość
  return textContent;
};

export function mx2json(data: string): string | null {
  const xmlData = mx2xml(data);
  if (!xmlData) return null;

  try {
    return xml2json(xmlData, {compact: true, spaces: 2});
  } catch (e) {
    console.error('Error converting XML to JSON: ', e);
    return null;
  }
}
