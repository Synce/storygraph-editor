# storygraph-editor
## Opis: 
Aplikacja webowa wspomagająca tworzenie i edycję misji, świata, produkcji opartych o system StoryGraph.
## Autorzy: 
 - Jakub Hotloś
 - Michał Dutka
## Wymagania:
Zainstalowane:
- postgresql
- node.js
- yarn
## Instalacja i uruchomienie:
1. Pobrać to repozytorium
2. Skopiować plik `.env.example`, zmienić nazwę na `.env`, w `DATABASE_URL` ustawić odpowiednie hasło (specjalnie napisane z dużej litery żeby było wiadomo gdzie zmienić) dla użytkownika postgres
3. `yarn install --frozen-lockfile`
4. `yarn db:push`
5. `yarn dev`
6. Wejść na `https:localhost:3000`
