
// --- KONFIGURACJA API ---
const API_KEY = 'TWÓJ_KLUCZ_API_Z_TMDB'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

// --- ELEMENTY INTERFEJSU (DOM) ---
const genreSelect = document.getElementById('genreSelect');
const randomizeBtn = document.getElementById('randomizeBtn');
const loader = document.getElementById('loader');
const movieResult = document.getElementById('movieResult');

const moviePoster = document.getElementById('moviePoster');
const movieTitle = document.getElementById('movieTitle');
const movieRating = document.getElementById('movieRating');
const movieDescription = document.getElementById('movieDescription');

// --- 1. POBIERANIE GATUNKÓW Z API ---
// Uruchamia się natychmiast po załadowaniu strony
async function fetchGenres() {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=pl-PL`);
        const data = await response.json();
        populateGenreDropdown(data.genres);
    } catch (error) {
        console.error("Błąd pobierania gatunków:", error);
    }
}

// --- 2. WYPEŁNIANIE LISTY ROZWIJANEJ ---
function populateGenreDropdown(genres) {
    // Czyścimy listę i wstawiamy opcję domyślną
    genreSelect.innerHTML = '<option value="">Wybierz gatunek...</option>';
    
    // Przechodzimy przez każdy gatunek z bazy i dodajemy go do HTML
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id; // ID gatunku w TMDB (np. 28 dla Akcji)
        option.textContent = genre.name;
        genreSelect.appendChild(option);
    });
}

// --- 3. GŁÓWNY ALGORYTM LOSUJĄCY ---
async function getRandomMovie() {
    const genreId = genreSelect.value;
    
    // Walidacja: upewniamy się, że użytkownik coś wybrał
    if (!genreId) {
        alert("Najpierw wybierz gatunek filmu!");
        return;
    }

    // Pokazujemy loader (napis "Losowanie...") i ukrywamy starą kartę filmu
    loader.classList.remove('hidden');
    movieResult.classList.add('hidden');

    try {
        // Aby wyniki były zróżnicowane, losujemy jedną z pierwszych 50 stron bazy dla danego gatunku
        const randomPage = Math.floor(Math.random() * 50) + 1; 
        
        // Pytamy TMDB o filmy z wybranego gatunku i z wylosowanej strony
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=pl-PL&page=${randomPage}`);
        const data = await response.json();

        // Jeśli z jakiegoś powodu API zwróci pustą stronę (rzadka sytuacja)
        if (data.results.length === 0) {
            alert("Brak filmów na tej stronie bazy. Spróbuj jeszcze raz.");
            loader.classList.add('hidden');
            return;
        }

        // Losujemy jeden konkretny film z tablicy zwróconej przez API (standardowo 20 filmów na stronę)
        const randomIndex = Math.floor(Math.random() * data.results.length);
        const selectedMovie = data.results[randomIndex];

        // Przekazujemy wylosowany film do funkcji wyświetlającej
        displayMovie(selectedMovie);
    } catch (error) {
        console.error("Błąd podczas szukania filmu:", error);
        loader.classList.add('hidden');
        alert("Wystąpił błąd sieci. Spróbuj ponownie.");
    }
}

// --- 4. WYŚWIETLANIE WYNIKÓW W HTML ---
function displayMovie(movie) {
    // Wstrzykujemy teksty
    movieTitle.textContent = movie.title;
    movieRating.textContent = movie.vote_average.toFixed(1); // Zaokrąglamy ocenę do 1 miejsca po przecinku
    
    // Zdarza się, że mało popularne filmy nie mają opisu w j. polskim
    movieDescription.textContent = movie.overview || "Brak polskiego opisu dla tego filmu w bazie TMDB.";
    
    // Wstrzykujemy plakat lub obrazek zastępczy, jeśli go brakuje
    if (movie.poster_path) {
        moviePoster.src = `${IMG_URL}${movie.poster_path}`;
    } else {
        moviePoster.src = 'https://via.placeholder.com/300x450?text=Brak+plakatu';
    }

    // Ukrywamy loader i pokazujemy gotową kartę z filmem
    loader.classList.add('hidden');
    movieResult.classList.remove('hidden');
}

// --- INICJALIZACJA ZDARZEŃ ---
// Nasłuchujemy kliknięcia w przycisk
randomizeBtn.addEventListener('click', getRandomMovie);

// Wywołujemy pobranie gatunków natychmiast przy wejściu na stronę
fetchGenres();
