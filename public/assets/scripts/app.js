// Id
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

let destinos = [];
let recomendados = [];
let indiceAtual = 0;

// (detalhes.html)
async function carregarDestino() {
    if (!id || isNaN(id) || id <= 0) {
        document.getElementById("detalhes").innerHTML = "<p>ID de destino inválido ou ausente.</p>";
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/destinos/${id}`);
        if (response.ok) {
            const destino = await response.json();

            document.getElementById("detalhes").innerHTML = `
                <img src="${destino.imagem}" alt="${destino.nome}">
                <h2>${destino.nome}</h2>
                <p>${destino.descricaoCompleta || destino.descricaoResumida || "Descrição não disponível."}</p>
                <div class="info-extra">
                    <p><strong>Localização:</strong> ${destino.localizacao}</p>
                    <p><strong>Tipo:</strong> ${destino.tipo}</p>
                    <p><strong>Avaliação Média:</strong> ${destino.avaliacaoMedia ?? "-"}</p>
                </div>
            `;

            const fotosContainer = document.getElementById("fotos-container");
            if (fotosContainer) {
                fotosContainer.innerHTML = "";

                if (destino.fotosAdicionais && destino.fotosAdicionais.length > 0) {
                    destino.fotosAdicionais.forEach(foto => {
                        const fotoElemento = document.createElement("div");
                        fotoElemento.className = "foto-destino";
                        fotoElemento.innerHTML = `<img src="${foto}" alt="Foto do ${destino.nome}">`;
                        fotosContainer.appendChild(fotoElemento);
                    });
                } else {
                    fotosContainer.innerHTML = "<p>Não há fotos adicionais disponíveis.</p>";
                }
            }
        } else {
            document.getElementById("detalhes").innerHTML = "<p>Destino não encontrado.</p>";
        }
    } catch (error) {
        document.getElementById("detalhes").innerHTML = "<p>Erro ao carregar os dados do destino.</p>";
        console.error("Erro ao carregar destino:", error);
    }
}

// Todos os destinos e recomendados (index.html)
const fetchDestinos = async () => {
    try {
        const response = await fetch('http://localhost:3000/destinos');
        destinos = await response.json();
        recomendados = destinos.filter(destino => destino.recomendado);

        renderizarCarrossel(indiceAtual);
        exibirTodosOsDestinos();
    } catch (error) {
        console.error("Erro ao buscar destinos:", error);
    }
}

// Todos os destinos (index.html)
function exibirTodosOsDestinos() {
    const containerTodos = document.getElementById("todos-container");
    if (!containerTodos) return;

    containerTodos.innerHTML = '';
    const favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    destinos.forEach(destino => {
        const card = document.createElement("div");
        card.className = "lugar";

        const favoritado = favoritos.includes(destino.id);
        const icone = favoritado ? "★" : "☆";

        card.innerHTML = `
            <div class="favorito-icon" data-id="${destino.id}" style="cursor:pointer; font-size: 1.5rem; text-align: right;">${icone}</div>
            <img src="${destino.imagem}" alt="${destino.nome}">
            <h3>${destino.nome}</h3>
            <p>${destino.descricaoResumida}</p>
            <a href="detalhes.html?id=${destino.id}">Saiba Mais</a>
        `;

        card.querySelector(".favorito-icon").addEventListener("click", (event) => {
            event.stopPropagation();
            toggleFavorito(destino.id, event.target);
        });

        containerTodos.appendChild(card);
    });
}

// Função para adicionar/remover favoritos
function toggleFavorito(id, elemento) {
    let favoritos = JSON.parse(localStorage.getItem("favoritos")) || [];

    if (favoritos.includes(id)) {
        favoritos = favoritos.filter(favId => favId !== id);
        elemento.textContent = "☆";
    } else {
        favoritos.push(id);
        elemento.textContent = "★";
    }

    localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

// Carrossel(index.html)
function renderizarCarrossel(indice) {
    const carrossel = document.getElementById("recomendados-carrossel");
    if (!carrossel) return;

    carrossel.innerHTML = "";

    if (recomendados.length > 0) {
        const destino = recomendados[indice];
        const card = document.createElement("div");
        card.classList.add("lugar-carrossel");
        card.innerHTML = `
            <img src="${destino.imagem}" alt="${destino.nome}">
            <h3>${destino.nome}</h3>
            <p>${destino.descricaoResumida}</p>
            <a href="detalhes.html?id=${destino.id}">Saiba mais</a>
        `;
        carrossel.appendChild(card);
    } else {
        carrossel.innerHTML = "<p>Não há destinos recomendados.</p>";
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("detalhes")) {
        carregarDestino();
    }

    if (document.getElementById("todos-container")) {
        fetchDestinos();
    }
});

// Botões do carrossel (index.html)
const btnAnterior = document.getElementById("btn-anterior");
const btnProximo = document.getElementById("btn-proximo");

if (btnAnterior) {
    btnAnterior.addEventListener("click", () => {
        if (recomendados.length > 0) {
            indiceAtual = (indiceAtual - 1 + recomendados.length) % recomendados.length;
            renderizarCarrossel(indiceAtual);
        }
    });
}

if (btnProximo) {
    btnProximo.addEventListener("click", () => {
        if (recomendados.length > 0) {
            indiceAtual = (indiceAtual + 1) % recomendados.length;
            renderizarCarrossel(indiceAtual);
        }
    });
}
