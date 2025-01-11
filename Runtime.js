/* 
############################################################################################
####		Created & Developed by João Gabriel Corrêa da Silva (All Rights Reserved)				####
####	    https://www.linkedin.com/in/jo%C3%A3o-gabriel-corr%C3%AAa-da-silva/	          ####
############################################################################################
*/

(function(){
  const data = new FakeData(1000, ((x, i)=>{
    /*
    Custo (milhões): O valor estimado do investimento.
    Tempo (meses): Tempo de execução do projeto.
    Risco (%): Probabilidade de não atingir os objetivos esperados.
    ROI (%): Retorno sobre o investimento esperado.
    Impacto Estratégico (1-5): Relevância estratégica do projeto (1 = Baixa, 5 = Alta).
    Complexidade (1-5): Nível de complexidade do projeto (1 = Baixa, 5 = Alta).
    Classificação: Alvo, indicando se o projeto é Viável (1) ou Não Viável (0).
    Categoria do Projeto: Tipo de projeto (Ex.: Infraestrutura, Tecnologia, Marketing).
    Região: Local onde o projeto será implementado (Ex.: Norte, Sul, Centro-Oeste).
    Status Inicial: Situação do projeto no início ("Planejado", "Em Progresso", "Atrasado").
    Capital Alocado (%): Percentual do orçamento total alocado ao projeto.
    Equipe Envolvida (nº): Número de pessoas diretamente envolvidas no projeto.
    */
    const categoriasProjeto = ["Tecnologia", "Infraestrutura", "Marketing", "Processamento", "Logística"];
    const regioes = ["Norte", "Sul", "Centro-Oeste", "Sudeste", "Nordeste"];
    const status = ["Planejado", "Em Progresso", "Atrasado"];

    const getRandomInt = (min, max) => Commom.random(min, max, true);
    const getRandomFloat = (min, max) => Commom.random(min, max, false);

    
    const custoMilhoes = Number(parseFloat(getRandomFloat(1, 15)).toFixed(2)); // Custo entre 1M e 15M
    const tempoMeses = getRandomInt(3, 36); // Tempo entre 3 e 36 meses
    const riscoPercentual = getRandomInt(5, 50); // Risco entre 5% e 50%
    const roiPercentual = getRandomInt(5, 30); // ROI entre 5% e 30%
    const impactoEstrategico = getRandomInt(1, 5); // Impacto entre 1 e 5
    const complexidade = getRandomInt(1, 5); // Complexidade entre 1 e 5
    const categoriaProjeto = categoriasProjeto[getRandomInt(0, categoriasProjeto.length - 1)];
    const regiao = regioes[getRandomInt(0, regioes.length - 1)];
    const statusInicial = status[getRandomInt(0, status.length - 1)];
    const capitalAlocadoPercentual = getRandomInt(5, 30); // Capital entre 5% e 30%
    const equipeEnvolvida = getRandomInt(5, 60); // Equipe entre 5 e 60 pessoas

    const projeto = `${categoriaProjeto} ${regiao} ${new Array(getRandomInt(3,6)).fill("").map(x=>String.fromCharCode(getRandomInt(65, 65+26))).join("")}`;
    const classificacao = (riscoPercentual <= 20 && roiPercentual >= 15 && impactoEstrategico >= 3 ? "Viável" : "Não Viável");

    return [
      projeto,
      custoMilhoes,
      tempoMeses,
      riscoPercentual,
      roiPercentual,
      impactoEstrategico,
      complexidade,
      categoriaProjeto,
      regiao,
      statusInicial,
      capitalAlocadoPercentual,
      equipeEnvolvida,
      classificacao
    ]
  })).header([
    "Projeto",
    "Custo (M)",
    "Tempo (meses)",
    "Risco (%)",
    "ROI (%)",
    "Impacto Estratégico",
    "Complexidade",
    "Categoria",
    "Região",
    "Status",
    "Capital Alocado (%)",
    "Equipe Envolvida",
    "Classificação"
  ])
  .generate()
  .vectorColumns([
    "Classificação"
  ])
  .dynamicColumns([
    "Categoria",
    "Região",
    "Status"
  ]);

  // console.log(data);

  data.toHTML('table', true, (row, col, header, value)=>{
    const colors = ["#cc3300", "#ff9966", "#ffcc00", "#99cc33", "#339900"];
    switch (header) {
      case "Risco (%)":
      case "ROI (%)":
      case "Capital Alocado (%)":
        return `<td>${value}%</td>`;
      break;
      case "Impacto Estratégico":
        return `<td><div class="progress"><div class='bar' style="background-color: ${colors[ value-1 ]}; width: ${value/5*100}%"></div><div style="color: ${colors[ value-1 ]};" class='value auto'>${value}/5</div></div></td>`;
      break;
      case "Complexidade":
        const colors1 = colors.reverse();
        return `<td><div class="progress"><div class='bar' style="background-color: ${colors1[ value-1 ]}; width: ${value/5*100}%"></div><div style="color: ${colors1[ value-1 ]};" class='value auto'>${value}/5</div></div></td>`;
      break;
      case "Equipe Envolvida":
        return `<td>${value} 👥</td>`;
      break;
      case "Classificação":
          return `<td>${value==="Viável"? "✅" : "🟥"} ${value}</td>`;
      break;
      default:
        return `<td>${value}</td>`;
      break;
    }
  });

  // data.cutRandom(50);

  // Exemplo de classificação binária
  const featuresBinary = data.select([
    "Projeto",
    "Categoria",
    "Região",
    "Status",
    "Classificação",
    "Classificação:Vector"
  ], true);

  const labelsBinary = data.select([ "Classificação:Vector" ]).map(x=>x[0]);

  const treeBinary = new DecisionTree();
  treeBinary.train(featuresBinary, labelsBinary, 3);

  // console.log(featuresBinary, labelsBinary, treeBinary);

  const renderer = new DecisionTreeRenderer(treeBinary.tree, data.columns([
    "Projeto",
    "Categoria",
    "Região",
    "Status",
    "Classificação",
    "Classificação:Vector"
  ], true), data.select([  "Classificação", "Classificação:Vector" ]).reduce((acc, v)=>({...acc, [v[1]]: v[0]}), {}), {node: "#eee", labels: [ "#99bccd", "#e8f6a5"]} );
  renderer.render("tree-container");

})()