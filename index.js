(async function () {

    const LOSER = new Audio('./assets/loser.mp3');
    const WRONG = new Audio('./assets/wrong.mp3');
    const CONGRATS = new Audio('./assets/congrats.mp3');
    const SUCCESS = new Audio('./assets/success.mp3');

    function memoCard([firstImage, lastImage]) {
        return `
        <figure class="figure">
            <img class="figure__img " src="${firstImage}">
            <img class="figure__img d-none" src="${lastImage}">
        </figure>`;
    }

    function addImages(images) {
        const container = document.querySelector('.container');
        container.insertAdjacentHTML("beforeend", memoCard(images));
    }


    let data;

    try {
        data = await fetch("https://anime-ws.herokuapp.com/api/v1/animes/query/by");
        data = await data.json();
        data = data.data.map(images => images.image);
        document.querySelector('.lds-dual-ring').remove();
    } catch (e) {
        console.error(e);
    }

    if (!data) {
        alert("no hemos podido cargar el juego");
        return;
    }

    const imageFront = './assets/1.jpeg';

    const images = data.slice(0, 9).concat(data.slice(0, 9));

    function randomImages(image, index) {
        const lastIndex = Math.round(Math.random() * (images.length - 1));

        const firstImage = image;
        const lastImage = images[lastIndex];

        images[lastIndex] = firstImage;
        images[index] = lastImage;
    }

    function loadImages() {
        images.forEach(randomImages);
        images.forEach((image) => {
            addImages([imageFront, image]);
        })
    }

    function compareImage(activeCards) {

        const INTERVAL_SCORE = 15;

        const [firstImage, lastImage] = [...activeCards]
            .map(activeCard => activeCard.children[1]);
        const score = document.querySelector('.header__span:last-child');
        const currentScore = Number(score.textContent);

        let pointToAdd = 0;

        let playerSawImage = false;

        if (firstImage.src === lastImage.src) {
            pointToAdd = currentScore + INTERVAL_SCORE;
            playerSawImage = true;
            SUCCESS.play();
        } else if (currentScore) {
            pointToAdd = currentScore - INTERVAL_SCORE;
            WRONG.play();
            if (pointToAdd < 0) pointToAdd = 0;
        } else {
            LOSER.play();
            alert('ha perdido :0');
            boot();
            return;
        }

        setTimeout(() => {
            if (playerSawImage) {
                activeCards.forEach(card => card.remove());
                if (!document.querySelectorAll('.figure').length) {
                    CONGRATS.play();
                    alert("Ha ganado uwu");
                    boot();
                }
            } else {
                activeCards.forEach(hiddenCard);
            }
        }, 800);

        score.textContent = pointToAdd;
    }

    function hiddenCard(card) {
        const [firstImage, lastImage] = card.children;
        card.classList.remove('active');
        firstImage.classList.remove('d-none');
        lastImage.classList.add('d-none');
    }

    function showCard() {

        const [firstImage, lastImage] = this.children;

        const activeCards = () => document.querySelectorAll('.active');
        const isCompareImages = () => activeCards().length === 2;

        if (lastImage.classList.contains('d-none') && !isCompareImages()) {

            this.classList.add('active');
            firstImage.classList.add('d-none');
            lastImage.classList.remove('d-none');

            if (isCompareImages()) {
                compareImage(activeCards());
            }
        }

    }

    function loadEvents() {
        document.querySelectorAll('.figure')
            .forEach(figure => {
                figure.onclick = showCard
            })
    }

    function clear() {
        const cards = document.querySelectorAll('.figure')
        if (cards.length)
            cards.forEach(figure => {
                figure.remove();
            })
    }

    function boot() {
        const score = document.querySelector('.header__span:last-child');
        score.textContent = 100;
        clear();
        loadImages();
        loadEvents();
    }

    boot();

})();