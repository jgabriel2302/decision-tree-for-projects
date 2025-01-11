/* 
############################################################################################
####		Created & Developed by João Gabriel Corrêa da Silva (All Rights Reserved)				####
####	    https://www.linkedin.com/in/jo%C3%A3o-gabriel-corr%C3%AAa-da-silva/	          ####
############################################################################################
*/

class Commom {
  static euclideanDistance(point1, point2) {
    return Math.sqrt(
      point1.reduce(
        (sum, value, index) => sum + Math.pow(value - point2[index], 2),
        0
      )
    );
  }
  static random(min, max, isInt = false) {
    const value = Math.random() * (max - min) + min;
    return isInt ? Math.floor(value) : value;
  }

  static randomWithK(probabilities = [0, 100], deviation = 0.1) {
    return (
      probabilities[this.random(0, probabilities.length - 1, true)] *
      (1 + this.random(-deviation, deviation))
    );
  }

  static removeDuplicates(array = []) {
    return array.filter((x, i) => array.indexOf(x) === i);
  }
}

class FakeData {
  static generate(size = 1, eachFunction = (x) => x){
    return new FakeData(size, eachFunction).generate().data;
  }

  constructor(size = 1, eachFunction = (x) => x) {
    this.size = size;
    this.eachFunction = eachFunction;
    this.headers = [];
    this.types = [];
    this.data = [];
    this.filter = [];
  }

  header(headers = []){
    this.headers = headers;
    this.types = new Array(headers.length).fill(0);
    return this;
  }

  generate(){
    this.data = new Array(this.size).fill([]).map((x, i) => this.eachFunction(x, i));
    this.filter = new Array(this.size).fill(1);
    return this;
  }

  dynamicColumns(columns = []){
    for (let index = 0; index < columns.length; index++) {
      let columnIndex = typeof columns[index] === "number"? columns[index]: this.headers.indexOf(columns[index]);
      if (columnIndex === -1) columnIndex = this.headers.indexOf(`column${index}`);
      if (columnIndex === -1) throw new Error(`Coluna '${columnName}' não encontrada nos cabeçalhos.`);

      const uniqueValues = [...new Set(this.data.map(row => row[columnIndex]))];

      this.headers = [...this.headers, ...uniqueValues.map(x=>`${this.headers[columnIndex] ?? `column${columnIndex}` ?? columnIndex}:${x}`)];
      this.types = [...this.types, ...(new Array(uniqueValues.length).fill(1))];

      this.data = this.data.map((row)=>{
        return [...row, ...uniqueValues.map(x=>row[columnIndex] === x? 1: 0)];
      });
    }
    return this;
  }

  vectorColumns(columns = []){
    for (let index = 0; index < columns.length; index++) {
      let columnIndex = typeof columns[index] === "number"? columns[index]: this.headers.indexOf(columns[index]);
      if (columnIndex === -1) columnIndex = this.headers.indexOf(`column${index}`);
      if (columnIndex === -1) throw new Error(`Coluna '${columnName}' não encontrada nos cabeçalhos.`);

      const uniqueValues = [...new Set(this.data.map(row => row[columnIndex]))];

      const valueMap = uniqueValues.reduce((acc, value, index) => {
        acc[value] = index;
        return acc;
      }, {});

      this.headers = [...this.headers, `${this.headers[columnIndex] ?? `column${columnIndex}` ?? columnIndex}:Vector`];
      this.types = [...this.types, 1];

      this.data = this.data.map((row)=>{
        return [...row, valueMap[row[columnIndex]]];
      });
    }
    return this;
  }

  table(){
    return [this.headers, ...this.data];
  }

  json(){
    return this.data.map((row, rowIndex)=>{
      return row.reduce((acc, col, colIndex) => {
        return {...acc, [this.headers[colIndex] ?? `column${colIndex}`]: col };
      }, {});
    })
  }

  toHTML(targetId, onlyOriginals = false, rowRender = (row, col, header, value)=>`${value}`){
    const target = document.getElementById(targetId);
    if(target == null) return this;
    const html = `
    <table>
      <thead>
        <tr>${this.headers.filter((h, i)=>!onlyOriginals || this.types[i] === 0 ? true: false ).map(h=>`<th>${h}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${
          this.data.map((row, ri)=>`<tr>
            ${row.filter((h, i)=>!onlyOriginals || this.types[i] === 0 ? true: false ).map((col, ci)=>rowRender(ri, ci, `${this.headers[ci] ?? `column${ci}` ?? ci}`, col)).join('')}
            </tr>`).join('')
        }
      </tbody>
    </table>
    `;
     target.innerHTML = html;
     return this;
  }

  select(columns = [], except = false){
    return this.data.map((x)=>{
      return x.filter((y, i)=>{
        const result = columns.includes(this.headers[i] ?? `column${i}` ?? i);
        return except? !result : result;
      })
    }).filter((x, i)=>{      
      if(this.filter[i] === 0) return false;
      return true;
    });
  }

  columns(columns = [], except = false){
    return this.headers.filter(h=>{
      const result = columns.includes(h);
      return except? !result : result;
    })
  }

  cutRandom(size = 1){
    let count = 0;
    this.filter = this.filter.map(x=>{
      if(Commom.random(0, 1, true) === 1 && count < size){
        count++;
        return true;
      }
      return false;
    })
    return this;
  }

  cut(start = 0, end = 0){
    this.filter = this.filter.map((x, i)=>{
      if(i >= start && i <= end) return true;
      return false;
    })
    return this;
  }

  uncut(){
    this.cut(0, this.filter.length);
    return this;
  }
}

class DecisionTree {
  constructor() {
    this.tree = null;
  }

  train(features, labels, maxDepth = 10) {
    this.tree = this.buildTree(features, labels, 0, maxDepth);
  }

  predict(feature) {
    return this.classify(feature, this.tree);
  }

  buildTree(features, labels, depth = 0, maxDepth = 10) {
    // Verifica se os rótulos são puros ou se atingiu a profundidade máxima
    if (this.isPure(labels)) {
      return labels[0];
    }

    if (depth >= maxDepth) {
      return this.mostCommonLabel(labels);
    }

    const { featureIndex, threshold } = this.bestSplit(features, labels);
    if (featureIndex === null) {
      return this.mostCommonLabel(labels);
    }

    const { left, right } = this.splitData(features, labels, featureIndex, threshold);

    return {
      featureIndex,
      threshold,
      left: this.buildTree(left.features, left.labels, depth + 1, maxDepth),
      right: this.buildTree(right.features, right.labels, depth + 1, maxDepth),
    };
  }

  classify(feature, node) {
    if (typeof node === "number") return node;

    if (feature[node.featureIndex] <= node.threshold) {
      return this.classify(feature, node.left);
    } else {
      return this.classify(feature, node.right);
    }
  }

  isPure(labels) {
    return new Set(labels).size === 1;
  }

  mostCommonLabel(labels) {
    const counts = labels.reduce((acc, label) => {
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});
    return Object.keys(counts).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
  }

  bestSplit(features, labels) {
    let bestGini = 1;
    let bestSplit = { featureIndex: null, threshold: null };

    for (let i = 0; i < features[0].length; i++) {
      const thresholds = [...new Set(features.map((row) => row[i]))];

      for (const threshold of thresholds) {
        const { leftLabels, rightLabels } = this.splitLabels(features, labels, i, threshold);
        const gini = this.calculateGini(leftLabels, rightLabels);

        if (gini < bestGini) {
          bestGini = gini;
          bestSplit = { featureIndex: i, threshold };
        }
      }
    }

    return bestSplit;
  }

  splitData(features, labels, featureIndex, threshold) {
    const left = { features: [], labels: [] };
    const right = { features: [], labels: [] };

    for (let i = 0; i < features.length; i++) {
      if (features[i][featureIndex] <= threshold) {
        left.features.push(features[i]);
        left.labels.push(labels[i]);
      } else {
        right.features.push(features[i]);
        right.labels.push(labels[i]);
      }
    }

    return { left, right };
  }

  splitLabels(features, labels, featureIndex, threshold) {
    const leftLabels = [];
    const rightLabels = [];

    for (let i = 0; i < features.length; i++) {
      if (features[i][featureIndex] <= threshold) {
        leftLabels.push(labels[i]);
      } else {
        rightLabels.push(labels[i]);
      }
    }

    return { leftLabels, rightLabels };
  }

  calculateGini(leftLabels, rightLabels) {
    const labels = [...leftLabels, ...rightLabels];
    const impurity = (group) => {
      const counts = group.reduce((acc, label) => {
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {});
      return (
        1 - Object.values(counts).reduce(
          (acc, count) => acc + (count / group.length) ** 2,
          0
        )
      );
    };

    return (
      (leftLabels.length / labels.length) * impurity(leftLabels) +
      (rightLabels.length / labels.length) * impurity(rightLabels)
    );
  }
}

class DecisionTreeRenderer {
  constructor(tree, features, labels, colors = {node: 'black', labels: ['red']}) {
    this.tree = tree; // A árvore gerada pela classe DecisionTree
    this.features = features;
    this.labels = labels;
    this.colors = {node: 'black', labels: ['red'], ...colors};
    this.svgNamespace = "http://www.w3.org/2000/svg";
    console.log(this);
  }

  // Renderiza a árvore em um container HTML
  render(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container com ID '${containerId}' não encontrado.`);
    }

    // Limpa o conteúdo anterior
    container.innerHTML = "<h3 align='center'>Árvore de Decisão</h3>";

    // Define dimensões do SVG
    const width = Math.max(300, window.innerWidth / 3.2);
    const height = width;
    
    container.style.width = `${width}px`;
    container.style.height = `${height}px`;

    // Cria o elemento SVG
    const svg = document.createElementNS(this.svgNamespace, "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.style.background = "#fff";
    svg.style.borderRadius = "5px";
    svg.style.border = "1px solid #ccc";
    svg.style.fontFamily = "'Gilroy', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
    svg.style.fontSize = "9px";

    // Renderiza a árvore recursivamente
    this.renderNode(this.tree, svg, width / 2, 30, 100, 0);

    container.appendChild(svg);
  }

  // Renderiza um nó da árvore recursivamente
  renderNode(node, svg, x, y, xOffset, depth) {
    if(!isNaN(Number(node)) && isFinite(Number(node))) {
      // Nó folha (classificação)
      this.drawNode(svg, x, y, 15, this.colors.labels[node]?? `#FFD700`, this.labels[node] ?? node);
      return;
    }

    if(node == null || node == undefined) return;
    console.log(node);
    if(node.featureIndex == null || node.featureIndex == undefined) return;
    if(node.threshold == null || node.threshold == undefined) return;

    // Nó intermediário (divisão)
    this.drawNode(svg, x, y, 15, this.colors.node ?? `#87CEEB`, `${this.features[node.featureIndex] ?? node.featureIndex} ≤ ${node.threshold}?`);

    // Calcula posições para os filhos
    const childY = y + 80;

    // Renderiza o filho esquerdo
    if (typeof node.left !== "undefined") {
      const childX = x - xOffset;
      this.drawLine(svg, x, y, childX, childY, "Sim", "#673ab7");
      this.renderNode(node.left, svg, childX, childY, xOffset / 2, depth + 1);
    }

    // Renderiza o filho direito
    if (node.right !== "undefined"  ) {
      const childX = x + xOffset;
      this.drawLine(svg, x, y, childX, childY, "Não", "#e91e63");
      this.renderNode(node.right, svg, childX, childY, xOffset / 2, depth + 1);
    }
  }

  getTextWidth(text, font) {
    // re-use canvas object for better performance
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;
    const metrics = context.measureText(text);
    return { width: metrics.width * 1.3, height: metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent };
  }

  // Desenha um círculo representando um nó
  drawNode(svg, x, y, radius, color, text) {
    if (typeof text !== "undefined") {
      const circle = document.createElementNS(this.svgNamespace, "rect");
      const textRect = this.getTextWidth(text, "8px")
      const w = Math.max(radius * 3,  textRect.width);
      const h = radius;
      circle.setAttribute("width", w);
      circle.setAttribute("height", h);
      circle.setAttribute("x", x - w / 2);
      circle.setAttribute("y", y - h / 2);
      circle.setAttribute("rx", h / 2);
      circle.setAttribute("ry", h / 2);
      circle.setAttribute("fill", color);
      circle.setAttribute("stroke", "#000");
      svg.appendChild(circle);
    
      const textElement = document.createElementNS(this.svgNamespace, "text");
      textElement.setAttribute("x", x);
      textElement.setAttribute("y", y + textRect.height / 2);
      textElement.setAttribute("font-size", "10px");
      textElement.setAttribute("fill", "#000");
      textElement.setAttribute("text-anchor", "middle");
      textElement.textContent = text;
      svg.appendChild(textElement);
      return {
        width: w,
        height: h,
        x,
        y
      }
    }
    return {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    }
  }

  svgQuadraticCurvePath(points) {
    let path = 'M' + points[0][0] + ',' + points[0][1];
  
    for (let i = 0; i < points.length - 1; i++) {
      const xMid = (points[i][0] + points[i + 1][0]) / 2;
      const yMid = (points[i][1] + points[i + 1][1]) / 2;
      const cpX1 = (xMid + points[i][0]) / 2;
      const cpX2 = (xMid + points[i + 1][0]) / 2;
      path +=
        'Q ' +
        cpX1 +
        ', ' +
        points[i][1] +
        ', ' +
        xMid +
        ', ' +
        yMid +
        (' Q ' +
          cpX2 +
          ', ' +
          points[i + 1][1] +
          ', ' +
          points[i + 1][0] +
          ', ' +
          points[i + 1][1]);
    }
  
    return path;
  }

  // Desenha uma linha entre nós
  drawLine(svg, x1, y1, x2, y2, icon = "✅", color = "#000") {
    const line = document.createElementNS(this.svgNamespace, "path");
    line.setAttribute("d", this.svgQuadraticCurvePath([  [x2, y2 - 10], [x1, y1 + 10] ]));
    // line.setAttribute("x1", x1);
    // line.setAttribute("y1", y1 + 20); // Ajusta para o raio do círculo
    // line.setAttribute("x2", x2);
    // line.setAttribute("y2", y2 - 20); // Ajusta para o raio do círculo
    line.setAttribute("fill", "#0000");
    line.setAttribute("stroke", color);
    svg.appendChild(line);

    const textElement = document.createElementNS(this.svgNamespace, "text");
    const offset = ( x2 - x1 ) < 0? -10: 10;
      textElement.setAttribute("x", x2 - ( x2 - x1 ) / 2 + offset );
      textElement.setAttribute("y", y2 - ( y2 - y1 ) / 2 );
      textElement.setAttribute("font-size", "7px");
      textElement.setAttribute("fill", color);
      textElement.setAttribute("text-anchor", "middle");
      textElement.textContent = icon;
      svg.appendChild(textElement);
  }
}