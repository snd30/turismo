
const CHAVE_DESTINOS = "rotamundo_destinos_v1";
const API_PAISES =
  "https://restcountries.com/v3.1/all?fields=name,capital,cca3,region,flags,population";

const IMAGEM_PADRAO =
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80";

const destinosExemplo = [
  {
    id: "exemplo-paris",
    nome: "Torre Eiffel",
    cidade: "Paris",
    pais: "França",
    categoria: "Cultura",
    descricao:
      "Um dos monumentos mais conhecidos do mundo, com uma vista incrível da cidade de Paris.",
    imagem:
      "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=900&q=80",
    origem: "exemplo"
  },
  {
    id: "exemplo-rio",
    nome: "Cristo Redentor",
    cidade: "Rio de Janeiro",
    pais: "Brasil",
    categoria: "Cultura",
    descricao:
      "Monumento famoso localizado no alto do Corcovado, com uma vista panorâmica do Rio de Janeiro.",
    imagem:
      "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=900&q=80",
    origem: "exemplo"
  },
  {
    id: "exemplo-machu",
    nome: "Machu Picchu",
    cidade: "Cusco",
    pais: "Peru",
    categoria: "Aventura",
    descricao:
      "Antiga cidade inca situada nas montanhas dos Andes, conhecida por sua história e paisagens.",
    imagem:
      "https://images.unsplash.com/photo-1526392060635-9d6019884377?auto=format&fit=crop&w=900&q=80",
    origem: "exemplo"
  },
  {
    id: "exemplo-maldivas",
    nome: "Ilhas Maldivas",
    cidade: "Malé",
    pais: "Maldivas",
    categoria: "Praia",
    descricao:
      "Destino conhecido pelas águas cristalinas, praias tropicais e ilhas paradisíacas.",
    imagem:
      "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=900&q=80",
    origem: "exemplo"
  },
  {
    id: "exemplo-alpes",
    nome: "Alpes Suíços",
    cidade: "Interlaken",
    pais: "Suíça",
    categoria: "Natureza",
    descricao:
      "Região de montanhas, lagos e trilhas, ideal para apreciar paisagens naturais.",
    imagem:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=900&q=80",
    origem: "exemplo"
  },
  {
    id: "exemplo-toquio",
    nome: "Tóquio",
    cidade: "Tóquio",
    pais: "Japão",
    categoria: "Cidade",
    descricao:
      "Uma metrópole que combina tecnologia, gastronomia, bairros modernos e tradições japonesas.",
    imagem:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=900&q=80",
    origem: "exemplo"
  }
];

let destinos = [];
let destinoSelecionado = null;
let carregamentoAPIConcluido = false;

const listaDestinos = document.getElementById("lista-destinos");
const statusAPI = document.getElementById("status-api");
const pesquisa = document.getElementById("pesquisa");
const filtroCategoria = document.getElementById("filtro-categoria");
const formulario = document.getElementById("form-destino");
const mensagemForm = document.getElementById("mensagem-form");

const modal = document.getElementById("modal-destino");
const modalImagem = document.getElementById("modal-imagem");
const modalTitulo = document.getElementById("modal-titulo");
const modalCategoria = document.getElementById("modal-categoria");
const modalLocal = document.getElementById("modal-local");
const modalDescricao = document.getElementById("modal-descricao");
const modalOrigem = document.getElementById("modal-origem");
const modalExcluir = document.getElementById("modal-excluir");

// Carrega os destinos cadastrados no navegador.
function carregarDestinosSalvos() {
  try {
    const dados = localStorage.getItem(CHAVE_DESTINOS);
    return dados ? JSON.parse(dados) : [];
  } catch (erro) {
    console.error("Erro ao ler os destinos salvos:", erro);
    return [];
  }
}

// Salva somente os destinos cadastrados pelo usuário.
function salvarDestinos() {
  try {
    localStorage.setItem(
      CHAVE_DESTINOS,
      JSON.stringify(
        destinos.filter((destino) => destino.origem === "local")
      )
    );
    return true;
  } catch (erro) {
    console.error("Erro ao salvar destinos:", erro);
    return false;
  }
}

// Navegação SPA.
function mostrarTela(nomeTela) {
  document.querySelectorAll(".tela").forEach((tela) => {
    tela.classList.toggle("ativa", tela.id === nomeTela);
  });

  document.querySelectorAll(".link-menu").forEach((botao) => {
    botao.classList.toggle("ativo", botao.dataset.tela === nomeTela);
  });

  fecharModal();
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (nomeTela === "listagem") {
    renderizarDestinos();
  }
}

document.querySelectorAll("[data-tela]").forEach((elemento) => {
  elemento.addEventListener("click", (evento) => {
    evento.preventDefault();
    mostrarTela(elemento.dataset.tela);
  });
});

// Busca os países na API. Se falhar, usa os exemplos.
async function carregarPaises() {
  statusAPI.textContent = "Carregando destinos...";

  try {
    const resposta = await fetch(API_PAISES);

    if (!resposta.ok) {
      throw new Error("A API respondeu com erro: " + resposta.status);
    }

    const paises = await resposta.json();

    if (!Array.isArray(paises) || paises.length === 0) {
      throw new Error("A API não retornou países.");
    }

    const destinosAPI = paises
      .filter((pais) => pais.name?.common)
      .map((pais) => {
        const capital = Array.isArray(pais.capital)
          ? pais.capital[0]
          : "";

        return {
          id: "pais-" + (pais.cca3 || pais.name.common),
          nome: pais.name.common,
          cidade: capital || "Capital não informada",
          pais: pais.name.common,
          categoria: "Cultura",
          descricao:
            "Conheça " +
            pais.name.common +
            ", explore sua cultura e descubra os lugares que esse país oferece aos visitantes.",
          imagem: pais.flags?.png || IMAGEM_PADRAO,
          origem: "api"
        };
      });

    const salvos = carregarDestinosSalvos();

    destinos = [
      ...salvos,
      ...destinosExemplo,
      ...destinosAPI
    ];

    statusAPI.textContent =
      "Países carregados com sucesso. Você também pode explorar os destinos de exemplo e seus próprios cadastros.";
  } catch (erro) {
    console.error("Não foi possível carregar os países:", erro);

    const salvos = carregarDestinosSalvos();

    destinos = [...salvos, ...destinosExemplo];

    statusAPI.textContent =
      "Não foi possível conectar à API. Estamos exibindo destinos de exemplo e seus cadastros salvos.";
  } finally {
    carregamentoAPIConcluido = true;
    renderizarDestinos();
  }
}

// Cria os cards dos destinos.
function renderizarDestinos() {
  if (!listaDestinos) return;

  const termo = pesquisa.value.trim().toLocaleLowerCase("pt-BR");
  const categoria = filtroCategoria.value;

  const filtrados = destinos.filter((destino) => {
    const texto = [
      destino.nome,
      destino.cidade,
      destino.pais,
      destino.descricao
    ]
      .join(" ")
      .toLocaleLowerCase("pt-BR");

    const correspondePesquisa = texto.includes(termo);
    const correspondeCategoria =
      categoria === "" || destino.categoria === categoria;

    return correspondePesquisa && correspondeCategoria;
  });

  listaDestinos.replaceChildren();

  if (!filtrados.length) {
    const mensagem = document.createElement("div");
    mensagem.className = "sem-resultados";
    mensagem.textContent =
      "Nenhum destino encontrado. Tente mudar a pesquisa ou a categoria.";
    listaDestinos.appendChild(mensagem);
    return;
  }

  filtrados.forEach((destino) => {
    const card = document.createElement("article");
    card.className = "destino-card";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Ver detalhes de " + destino.nome);

    const imagem = document.createElement("img");
    imagem.src = destino.imagem || IMAGEM_PADRAO;
    imagem.alt = destino.nome;
    imagem.loading = "lazy";
    imagem.onerror = () => {
      imagem.onerror = null;
      imagem.src = IMAGEM_PADRAO;
    };

    const info = document.createElement("div");
    info.className = "destino-info";

    const categoriaEl = document.createElement("span");
    categoriaEl.className = "categoria";
    categoriaEl.textContent = destino.categoria;

    const titulo = document.createElement("h3");
    titulo.textContent = destino.nome;

    const local = document.createElement("p");
    local.textContent = "📍 " + destino.cidade + ", " + destino.pais;

    const detalhes = document.createElement("span");
    detalhes.className = "ver-detalhes";
    detalhes.textContent = "Ver detalhes →";

    info.append(categoriaEl, titulo, local, detalhes);
    card.append(imagem, info);

    card.addEventListener("click", () => abrirModal(destino.id));

    card.addEventListener("keydown", (evento) => {
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        abrirModal(destino.id);
      }
    });

    listaDestinos.appendChild(card);
  });
}

// Abre os detalhes de um destino.
function abrirModal(id) {
  const destino = destinos.find((item) => item.id === id);

  if (!destino) return;

  destinoSelecionado = destino.id;

  modalImagem.src = destino.imagem || IMAGEM_PADRAO;
  modalImagem.alt = destino.nome;
  modalImagem.onerror = () => {
    modalImagem.onerror = null;
    modalImagem.src = IMAGEM_PADRAO;
  };

  modalTitulo.textContent = destino.nome;
  modalCategoria.textContent = destino.categoria;
  modalLocal.textContent = "📍 " + destino.cidade + ", " + destino.pais;
  modalDescricao.textContent = destino.descricao;

  modalOrigem.textContent =
    destino.origem === "local"
      ? "Destino cadastrado por você."
      : destino.origem === "api"
        ? "Informações de país carregadas da API."
        : "Destino de exemplo do RotaMundo.";

  // Somente destinos cadastrados pelo usuário podem ser excluídos.
  modalExcluir.hidden = destino.origem !== "local";

  modal.classList.add("aberto");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  document.getElementById("fechar-modal").focus();
}

function fecharModal() {
  modal.classList.remove("aberto");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  destinoSelecionado = null;
}

document.getElementById("fechar-modal").addEventListener("click", fecharModal);

modal.addEventListener("click", (evento) => {
  if (evento.target === modal) {
    fecharModal();
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.key === "Escape" && modal.classList.contains("aberto")) {
    fecharModal();
  }
});

// Cadastro de destinos.
formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nome = document.getElementById("nome").value.trim();
  const cidade = document.getElementById("cidade").value.trim();
  const pais = document.getElementById("pais").value.trim();
  const categoria = document.getElementById("categoria").value;
  const descricao = document.getElementById("descricao").value.trim();
  const imagem = document.getElementById("imagem").value.trim();

  mensagemForm.textContent = "";
  mensagemForm.className = "";

  if (!nome || !cidade || !pais || !categoria || !descricao) {
    mensagemForm.textContent = "Preencha todos os campos obrigatórios.";
    mensagemForm.className = "mensagem-erro";
    return;
  }

  if (imagem) {
    try {
      const url = new URL(imagem);

      if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error("URL inválida");
      }
    } catch {
      mensagemForm.textContent =
        "Informe uma URL de imagem válida começando com http:// ou https://.";
      mensagemForm.className = "mensagem-erro";
      return;
    }
  }

  const novoDestino = {
    id: "local-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
    nome,
    cidade,
    pais,
    categoria,
    descricao,
    imagem: imagem || IMAGEM_PADRAO,
    origem: "local"
  };

  destinos.unshift(novoDestino);

  if (!salvarDestinos()) {
    destinos = destinos.filter((destino) => destino.id !== novoDestino.id);

    mensagemForm.textContent =
      "Não foi possível salvar no navegador. Verifique o armazenamento disponível.";
    mensagemForm.className = "mensagem-erro";
    return;
  }

  formulario.reset();

  mensagemForm.textContent = "Destino cadastrado com sucesso!";
  mensagemForm.className = "mensagem-sucesso";

  renderizarDestinos();
});

// Exclusão de destinos cadastrados pelo usuário.
modalExcluir.addEventListener("click", () => {
  if (!destinoSelecionado) return;

  const destino = destinos.find((item) => item.id === destinoSelecionado);

  if (!destino || destino.origem !== "local") return;

  const confirmar = window.confirm(
    'Deseja realmente excluir o destino "' + destino.nome + '"?'
  );

  if (!confirmar) return;

  const destinosAnteriores = destinos;
  destinos = destinos.filter((item) => item.id !== destinoSelecionado);

  if (!salvarDestinos()) {
    destinos = destinosAnteriores;
    alert("Não foi possível excluir o destino. Tente novamente.");
    return;
  }

  fecharModal();
  renderizarDestinos();
});

pesquisa.addEventListener("input", renderizarDestinos);
filtroCategoria.addEventListener("change", renderizarDestinos);

// Inicia a aplicação.
destinos = [...carregarDestinosSalvos(), ...destinosExemplo];
renderizarDestinos();
carregarPaises();
