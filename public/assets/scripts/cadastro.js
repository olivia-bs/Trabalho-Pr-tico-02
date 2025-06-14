const form = document.getElementById('form-cadastro');
const tabela = document.getElementById('tabela-destinos');

// JSON
const API_URL = 'http://localhost:3000/destinos';

// Carrega e exibe destinos na tabela
async function listarDestinos() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar destinos');
        const destinos = await response.json();

        // Atualiza a tabela
        tabela.innerHTML = `
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Localização</th>
                    <th>Tipo</th>
                    <th>Avaliação</th>
                    <th>Recomendado</th>
                    <th>Imagem</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${destinos.map(destino => `
                    <tr>
                        <td>${destino.nome}</td>
                        <td>${destino.localizacao}</td>
                        <td>${destino.tipo}</td>
                        <td>${destino.avaliacaoMedia ?? '-'}</td>
                        <td>${destino.recomendado ? 'Sim' : 'Não'}</td>
                        <td>
                            <img src="${destino.imagem}" alt="${destino.nome}" class="img-tabela">
                        </td>
                        <td>
                            <button class="btn-apagar" data-id="${destino.id}">Apagar</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        `;

        // Adiciona eventos aos botões de apagar
        document.querySelectorAll('.btn-apagar').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.dataset.id;
                if (confirm('Deseja realmente apagar este destino?')) {
                    await apagarDestino(id);
                    listarDestinos();
                }
            });
        });
    } catch (error) {
        console.error(error);
        tabela.innerHTML = '<tr><td colspan="7">Erro ao carregar destinos.</td></tr>';
    }
}

// Adiciona novo destino
async function adicionarDestino(destino) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify(destino)
        });
        
        if (!response.ok) throw new Error('Erro ao adicionar destino');
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('Falha ao adicionar destino.');
        throw error;
    }
}

// Remove destino
async function apagarDestino(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, { 
            method: 'DELETE' 
        });
        if (!response.ok) throw new Error('Erro ao apagar destino');
    } catch (error) {
        console.error(error);
        alert('Falha ao apagar destino.');
        throw error;
    }
}

// Evento de submit do formulário
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Processa as fotos adicionais (transforma string em array)
    const fotosAdicionais = form.fotosAdicionais.value
        .split(',')
        .map(url => url.trim())
        .filter(url => url !== '' && url.startsWith('http'));

    const novoDestino = {
        nome: form.nome.value.trim(),
        descricaoResumida: form.descricaoResumida.value.trim(),
        descricao: form.descricao.value.trim(),
        imagem: form.imagem.value.trim(),
        fotosAdicionais: fotosAdicionais,
        localizacao: form.localizacao.value.trim(),
        tipo: form.tipo.value.trim(),
        avaliacaoMedia: parseFloat(form.avaliacaoMedia.value),
        recomendado: form.recomendado.value === 'true'
    };

    // Validação dos campos obrigatórios
    if (!novoDestino.nome || 
        !novoDestino.descricaoResumida || 
        !novoDestino.descricao ||
        !novoDestino.imagem || 
        !novoDestino.localizacao || 
        !novoDestino.tipo || 
        isNaN(novoDestino.avaliacaoMedia) ||
        novoDestino.avaliacaoMedia < 0 || 
        novoDestino.avaliacaoMedia > 10) {
        alert('Preencha todos os campos obrigatórios corretamente!\nA avaliação deve ser entre 0 e 10.');
        return;
    }

    try {
        await adicionarDestino(novoDestino);
        form.reset();
        listarDestinos();
        alert('Destino cadastrado com sucesso!');
    } catch (error) {
        alert('Erro ao cadastrar destino. Por favor, tente novamente.');
    }
});

// Inicializa a tabela quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    listarDestinos();
});