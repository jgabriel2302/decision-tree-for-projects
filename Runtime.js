/* 
############################################################################################
####		Created & Developed by João Gabriel Corrêa da Silva (All Rights Reserved)				####
####	    https://www.linkedin.com/in/jo%C3%A3o-gabriel-corr%C3%AAa-da-silva/	          ####
############################################################################################
*/

function StrategicProjectExemple(){
  const data = new Database().generate(500, ((x, i)=>{
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

    
    const tempoMeses = getRandomInt(3, 36); // Tempo entre 3 e 36 meses
    const equipeEnvolvida = getRandomInt(5, 50); // Equipe entre 5 e 60 pessoas
    const custoMilhoes =  Number((1 + equipeEnvolvida * 0.001 + tempoMeses * 0.4).toFixed(2))  //Number(parseFloat(getRandomFloat(1, 15)).toFixed(2)); // Custo entre 1M e 15M
    const riscoPercentual = getRandomInt(5, 50); // Risco entre 5% e 50%
    const roiPercentual = getRandomInt(5, 30); // ROI entre 5% e 30%
    const impactoEstrategico = getRandomInt(1, 5); // Impacto entre 1 e 5
    const complexidade = getRandomInt(1, 5); // Complexidade entre 1 e 5
    const categoriaProjeto = categoriasProjeto[getRandomInt(0, categoriasProjeto.length - 1)];
    const regiao = regioes[getRandomInt(0, regioes.length - 1)];
    const statusInicial = status[getRandomInt(0, status.length - 1)];
    const capitalAlocadoPercentual = getRandomInt(5, 30); // Capital entre 5% e 30%

    const projeto = `${categoriaProjeto} ${regiao} ${new Array(getRandomInt(3,6)).fill("").map(x=>String.fromCharCode(getRandomInt(65, 65+26))).join("")}`;
    const classificacao = (riscoPercentual <= 20 && roiPercentual >= 15 && impactoEstrategico >= 3 ? "Viável" : "Não Viável");
    // const classificacao =  ["Viável", "Parcial", "Não Viável", "Viável", "Parcial", "Não Viável" ][getRandomInt(0, 5)];

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
  .normalizeColumns([
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
          return `<td>${value==="Parcial"? "⬜" : value==="Viável"? "✅" : "🟥"} ${value}</td>`;
      break;
      case "Custo (M)":
        return `<td>${value.toFixed(2)}</td>`;
      break;
      default:
        return `<td>${value}</td>`;
      break;
    }
  });

  // Exemplo de classificação binária
  const featuresBinary = data.select([
    "Projeto",
    "Categoria",
    "Região",
    "Status",
    "Classificação",
    "Classificação:Norm"
  ], true);

  const labelsBinary = data.select([ "Classificação:Norm" ]).map(x=>x[0]);

  const treeBinary = new DecisionTree();
  treeBinary.train(featuresBinary, labelsBinary, 3);

  const renderer = new DecisionTreeRenderer(treeBinary.tree, 
    data.columns([
      "Projeto",
      "Categoria",
      "Região",
      "Status",
      "Classificação",
      "Classificação:Norm"
    ], true), data.select([  "Classificação", "Classificação:Norm" ]).reduce((acc, v)=>({...acc, [v[1]]: v[0]}), {}), {node: "#eee", labels: [ "#99bccd", "#e8f6a5"]} );
  renderer.render("tree-container");
}

async function IndustrialLaborAccidentExemple(){
  const data = await (new Database()).fetch("./IHMStefanini_industrial_safety_and_health_database_with_accidents_description.csv", true)
  
  data.headers[0] = "#";

  data.where((row)=>{
    return row["#"] !== "" &&
     row["Countries"] !== "" && 
    row["Countries"] !== "" &&
    row["Industry Sector"] !== "" &&
    row["Accident Level"] !== ""&& 
    row["Potential Accident Level"] !== "" &&
    row["Employee or Third Party"] !== "" &&
    row["Genre"] !== ""
  })

  const colors = ["#cc3300", "#ff9966", "#ffcc00", "#99cc33", "#339900"].reverse();
  const levels = ["I", "II", "III", "IV", "V"];

  // data.addColumn('Accident', (row, index)=>{
  //   let probability = 0;
  //   if( ["Pressed", "Cut", "Liquid Metal"].includes(row["Critical Risk"]) ) probability += 0.3;
  //   if(row["Industry Sector"] === "Mining") probability += 0.3;
  //   if(row["Industry Sector"] === "Metal") probability += 0.2;
  //   if(row["Countries"] === "Country_02") probability += 0.1;
  //   if(row["Countries"] === "Country_01") probability += 0.2;
  //   if(row["Local"] === "Local_01") probability += 0.2;
  //   if(row["Local"] === "Local_04") probability -= 0.3;
  //   if(row["Genre"] === "Male") probability += 0.1;
  //   if(row["Employee or Third Party"] === "Third Party") probability += 0.1;
  //   probability += levels.indexOf(row["Potential Accident Level"]) / (levels.length - 1) * 0.25;
  //   probability += levels.indexOf(row["Accident Level"]) / (levels.length - 1) * 0.25;
  //   const result = probability > 0.5? "Yes": "No";
  //   return result
  //   // return levels.indexOf(row["Potential Accident Level"]) > 2 ? "Yes" : "No";
  // });

  data.replaceColumn("Countries", (value, row, index)=>{
    return ["Country_01", "Country_02", "Country_03"][Commom.random(0, 2, true)];
  })

  data.replaceColumn("Genre", (value, row, index)=>{
    return ["Male", "Female"][Commom.random(0, 2, true)];
  })

  data.replaceColumn("Potential Accident Level", (value, row, index)=>{
    return levels.indexOf(value) === -1? 1: levels.indexOf(value) + 1
  })

  data.replaceColumn("Accident Level", (value, row, index)=>{
    return Commom.random(1, 5, true)
  })

  data
  .normalizeColumns([
    "Accident Level",
    "Industry Sector",
    "Countries",
    "Local",
    "Genre"
  ])
  .dynamicColumns([
    "Employee or Third Party"
  ])
  .vectorColumns([
  ]);

  data.toHTML('table', true, (row, col, header, value)=>{
    switch (header) {
      case "Data":
        return `<td>${new Date(value).toLocaleDateString()}</td>`;
      break;
      case "Accident Level":
      case "Potential Accident Level":
        const levelIndex = value
        return `<td><div class="progress"><div class='bar' style="background-color: ${colors[ levelIndex ]}; width: ${levelIndex/5*100}%"></div><div style="color: ${colors[ levelIndex ]};" class='value auto'>${value}</div></div></td>`;
      break;
      case "Genre":
        return `<td>${value === "Male"? "👨🏽‍🔧": "👩🏽‍🔧"} ${value}</td>`;
      break;
      case "Description":
        return `<td style="max-width:200px;white-space:wrap;overflow:auto;">${value}</td>`;
      break;
      default:
        return `<td style="max-width:200px">${value}</td>`;
      break;
    }
  });

  // data.cutRandom(Math.floor(data.size * 0.1));

  // Exemplo de classificação binária
  const featuresBinary = data.select([
    "#",
    "Data",
    "Countries",
    "Local",
    "Industry Sector",
    "Accident Level",
    "Genre",
    "Critical Risk",
    "Employee or Third Party",
    "Description"
  ], true);

  const labelsBinary = data.select([ "Accident Level:Norm" ]).map(x=>x[0]);

  const treeBinary = new DecisionTree();
  treeBinary.train(featuresBinary, labelsBinary, 10);

  console.log(data.table(), featuresBinary, labelsBinary, treeBinary);

  const renderer = new DecisionTreeRenderer(treeBinary.tree, 
    data.columns([
      "#",
      "Data",
      "Countries",
      "Local",
      "Industry Sector",
      "Genre",
      "Critical Risk",
      "Employee or Third Party",
      "Description",
      "Accident Level",
      "Accident Level:Norm" 
    ], true), 
    data.select([  "Accident Level", "Accident Level:Norm" ]).reduce((acc, v)=>({...acc, [v[1]]: v[0]}), {}), {node: "#eee", labels: [ "#99bccd", "#e8f6a5"]},
  800,
  1000 );
  renderer.render("tree-container");
}

(function(){
  StrategicProjectExemple();
  // IndustrialLaborAccidentExemple();

  const exempleSelector = document.querySelector('#exempleSelector');

  exempleSelector.addEventListener('change', (e)=>{
    if(exempleSelector.value === "0") StrategicProjectExemple();
    else IndustrialLaborAccidentExemple();
  });  
})()