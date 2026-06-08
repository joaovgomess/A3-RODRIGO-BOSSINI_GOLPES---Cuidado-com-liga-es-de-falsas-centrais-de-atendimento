
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('form-verificacao');
    const inputTelefone = document.getElementById('telefone');
    const divResultado = document.getElementById('resultado');

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Evita o recarregamento da página

        const telefoneDigitado = inputTelefone.value.trim();
        
        // Limpa resultados anteriores
        divResultado.classList.remove('oficial', 'fraude', 'oculto');
        divResultado.textContent = "Verificando...";
        divResultado.style.display = "block";

        try {
            const resposta = await fetch('http://localhost:3000/api/verificar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ telefone: telefoneDigitado })
            });

            if (!resposta.ok) {
                throw new Error("Erro na comunicação com o servidor.");
            }

            const dados = await resposta.json();

            if (dados.oficial) {
                divResultado.classList.add('oficial');
                divResultado.textContent = `✅ Número Oficial: Este telefone pertence ao banco ${dados.banco}.`;
            } else {
                divResultado.classList.add('fraude');
                divResultado.textContent = `⚠️ Possível Fraude: Este número não consta na base de telefones oficiais.`;
            }

        } catch (erro) {
            console.error(erro);
            divResultado.classList.add('fraude');
            divResultado.textContent = "Erro ao verificar o número. Verifique se o servidor Node.js está rodando.";
        }
    });
});