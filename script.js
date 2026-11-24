function drawHairStrands(ctx, style, hairColor, stage) {
  const darkStrand = shadeHexColor(hairColor, -34);
  const lightStrand = shadeHexColor(hairColor, 28);

  ctx.save();
  ctx.lineJoin = "miter";
  ctx.lineCap = "round";

  if (stage === "bebe") {
    ctx.fillStyle = hairColor;
    ctx.strokeStyle = darkStrand;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(-10, -82);
    ctx.lineTo(-4, -104);
    ctx.lineTo(2, -85);
    ctx.lineTo(9, -102);
    ctx.lineTo(12, -82);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
    return;
  }

  // Coroa em ziguezague com pontas marcadas no topo
  const spikes = style === "buzz" ? 9 : 13;
  const startX = -62;
  const endX = 62;
  const stepX = (endX - startX) / spikes;
  const baseY = style === "buzz" ? -52 : -62;
  const tipHeight = style === "buzz" ? 14 : 26;

  ctx.fillStyle = hairColor;
  ctx.strokeStyle = darkStrand;
  ctx.lineWidth = 2.4;

  ctx.beginPath();
  ctx.moveTo(startX, -28);
  for (let i = 0; i < spikes; i++) {
    const x1 = startX + i * stepX;
    const xMid = x1 + stepX * 0.5;
    const x2 = x1 + stepX;
    const peakY = i % 2 === 0 ? baseY - tipHeight : baseY - tipHeight * 0.55;
    ctx.lineTo(x1, baseY);
    ctx.lineTo(xMid, peakY);
    ctx.lineTo(x2, baseY);
  }
  ctx.lineTo(endX, -28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Mechas frontais em ziguezague sobre a testa (estilo da referência)
  const fringeCount = style === "buzz" ? 5 : 9;
  const fringeStart = -48;
  const fringeWidth = 96 / fringeCount;

  ctx.strokeStyle = darkStrand;
  ctx.fillStyle = lightStrand;
  ctx.lineWidth = 2;

  for (let f = 0; f < fringeCount; f++) {
    const fx1 = fringeStart + f * fringeWidth;
    const fxMid = fx1 + fringeWidth * 0.5;
    const fx2 = fx1 + fringeWidth;
    const fyDown = style === "buzz" ? -44 : f % 2 === 0 ? -34 : -41;

    ctx.beginPath();
    ctx.moveTo(fx1, -56);
    ctx.lineTo(fxMid, fyDown);
    ctx.lineTo(fx2, -56);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Mechas laterais e comprimento conforme o estilo escolhido
  if (style === "long") {
    ctx.fillStyle = hairColor;
    ctx.strokeStyle = darkStrand;
    ctx.lineWidth = 2.4;

    ctx.beginPath();
    ctx.moveTo(-62, -48);
    ctx.lineTo(-68, 66);
    ctx.lineTo(-54, 52);
    ctx.lineTo(-46, 70);
    ctx.lineTo(-38, 44);
    ctx.lineTo(-36, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(62, -48);
    ctx.lineTo(68, 66);
    ctx.lineTo(54, 52);
    ctx.lineTo(46, 70);
    ctx.lineTo(38, 44);
    ctx.lineTo(36, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (style === "medium") {
    ctx.fillStyle = hairColor;
    ctx.strokeStyle = darkStrand;
    ctx.lineWidth = 2.2;

    ctx.beginPath();
    ctx.moveTo(-62, -48);
    ctx.lineTo(-65, 6);
    ctx.lineTo(-52, -4);
    ctx.lineTo(-44, 10);
    ctx.lineTo(-38, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(62, -48);
    ctx.lineTo(65, 6);
    ctx.lineTo(52, -4);
    ctx.lineTo(44, 10);
    ctx.lineTo(38, -35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (style === "ponytail") {
    ctx.fillStyle = hairColor;
    ctx.strokeStyle = darkStrand;
    ctx.lineWidth = 2.4;

    ctx.beginPath();
    ctx.moveTo(46, -64);
    ctx.lineTo(88, -68);
    ctx.lineTo(74, -50);
    ctx.lineTo(92, -40);
    ctx.lineTo(68, -34);
    ctx.lineTo(48, -42);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  ctx.restore();
}
