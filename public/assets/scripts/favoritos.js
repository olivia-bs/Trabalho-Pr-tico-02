let destinos = [];

async function carregarDestinos() {
    try {
        const response = await fetch('http://localhost:3000/destinos');
        destinos = await response.json();
        exibirFavoritos();
    } catch (error) {
        console.error("Erro ao carregar destinos:", error);
    }
}

function exibirFavoritos() {
    const favoritosLista = document.getElementById("favoritos-lista");
    const mensagemVazia = document.getElementById("mensagem-vazia");
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    favoritosLista.innerHTML = "";

    if (favoritos.length === 0) {
        mensagemVazia.style.display = "block";
        return;
    } else {
        mensagemVazia.style.display = "none";
    }

    const destinosFavoritos = destinos.filter(destino => favoritos.includes(destino.id));

    if (destinosFavoritos.length === 0) {
        mensagemVazia.style.display = "block";
        return;
    }

    destinosFavoritos.forEach(destino => {
        const card = document.createElement("div");
        card.className = "lugar";

        card.innerHTML = `
            <img src="${destino.imagem}" alt="${destino.nome}">
            <h3>${destino.nome}</h3>
            <p>${destino.descricaoResumida}</p>
            <a href="detalhes.html?id=${destino.id}">Saiba Mais</a>
        `;

        favoritosLista.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    carregarDestinos();
});
