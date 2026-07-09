// --- KONFIGURACJA API ---
const API_KEY = 'dfabfdbe5245e5430c9827b146e7d49d'; 
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
    genreSelect.innerHTML = '<option value="">Wybierz gatunek...</option>';
    
    genres.forEach(genre => {
        const option = document.createElement('option');
        option.value = genre.id; 
        option.textContent = genre.name;
        genreSelect.appendChild(option);
    });
}

// --- 3. GŁÓWNY ALGORYTM LOSUJĄCY ---
async function getRandomMovie() {
    const genreId = genreSelect.value;
    
    if (!genreId) {
        alert("Najpierw wybierz gatunek filmu!");
        return;
    }

    loader.classList.remove('hidden');
    movieResult.classList.add('hidden');

    try {
        const randomPage = Math.floor(Math.random() * 50) + 1; 
        
        const response = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=${genreId}&language=pl-PL&page=${randomPage}`);
        const data = await response.json();

        if (data.results.length === 0) {
            alert("Brak filmów na tej stronie bazy. Spróbuj jeszcze raz.");
            loader.classList.add('hidden');
            return;
        }

        const randomIndex = Math.floor(Math.random() * data.results.length);
        const selectedMovie = data.results[randomIndex];

        displayMovie(selectedMovie);
    } catch (error) {
        console.error("Błąd podczas szukania filmu:", error);
        loader.classList.add('hidden');
        alert("Wystąpił błąd sieci. Spróbuj ponownie.");
    }
}

// --- 4. WYŚWIETLANIE WYNIKÓW W HTML ---
function displayMovie(movie) {
    movieTitle.textContent = movie.title;
    movieRating.textContent = movie.vote_average.toFixed(1); 
    
    movieDescription.textContent = movie.overview || "Brak polskiego opisu dla tego filmu w bazie TMDB.";
    
    if (movie.poster_path) {
        moviePoster.src = `${IMG_URL}${movie.poster_path}`;
    } else {
        // Zaktualizowany link do obrazka, gdy film nie ma plakatu
        moviePoster.src = 'https://placehold.co/300x450/444444/ffffff?text=Brak+plakatu';
    }

    loader.classList.add('hidden');
    movieResult.classList.remove('hidden');
}

// --- INICJALIZACJA ZDARZEŃ ---
randomizeBtn.addEventListener('click', getRandomMovie);
fetchGenres();
