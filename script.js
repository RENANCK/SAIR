const MIN_FOCO_POMODORO = 8;
const MAX_FOCO_POMODORO = 35;
const MIN_DESCANSO_POMODORO_PADRAO = 4;
const MAX_DESCANSO_POMODORO_PADRAO = 25;

const telaModo = document.getElementById('telaModo');
const btnModoConvencional = document.getElementById('btnModoConvencional');
const btnModoPomodoro = document.getElementById('btnModoPomodoro');
const pomodoroPainel = document.getElementById('pomodoroPainel');
const descansoTempo = document.getElementById('descansoTempo');

let modoAtual = null;
let descansoFimEm = null;

const telaInicial = document.getElementById('telaInicial');
const painelPrincipal = document.getElementById('painelPrincipal');
const formConfig = document.getElementById('formConfig');

// Novos inputs de min/max
const tempoMinimoInput = document.getElementById('tempoMinimo');
const tempoMaximoInput = document.getElementById('tempoMaximo');
const erroConfig = document.getElementById('erroConfig');
const configResumo = document.getElementById('configResumo');

const tempoMinimoManualInput = document.getElementById('tempoMinimoManual');
const tempoMaximoManualInput = document.getElementById('tempoMaximoManual');
const ajusteDescansoPomodoro = document.getElementById('ajusteDescansoPomodoro');
const descansoMinimoManualInput = document.getElementById('descansoMinimoManual');
const descansoMaximoManualInput = document.getElementById('descansoMaximoManual');
const btnAplicarTempoManual = document.getElementById('btnAplicarTempoManual');
const erroTempoManual = document.getElementById('erroTempoManual');

const intervaloNovoInput = document.getElementById('intervaloNovo');
const btnAdicionarIntervalo = document.getElementById('btnAdicionarIntervalo');
const listaIntervalos = document.getElementById('listaIntervalos');
const erroIntervalos = document.getElementById('erroIntervalos');

const statusPrincipal = document.getElementById('statusPrincipal');
const subStatus = document.getElementById('subStatus');
const alertaDesafio = document.getElementById('alertaDesafio');

const btnAtivar = document.getElementById('btnAtivar');
const btnPararContinuar = document.getElementById('btnPararContinuar');
const btnDesativar = document.getElementById('btnDesativar');
const btnReconfigurar = document.getElementById('btnReconfigurar');

const alarme = document.getElementById('alarme');
alarme.loop = true;

let timerId = null;
let countdownId = null;
let ativo = false;
let emDesafio = false;
let tempoMinimoAtual = null;
let tempoMaximoAtual = null;
let descansoMinimoAtual = MIN_DESCANSO_POMODORO_PADRAO;
let descansoMaximoAtual = MAX_DESCANSO_POMODORO_PADRAO;
let proximoDesafioEm = null;
let emDescansoPomodoro = false;
let intervalosPersonalizados = [];

const CONTAGEM_FINAL_SEGUNDOS = 2 * 60;

function sortearDuracaoMs() {
  if (modoAtual === 'pomodoro') {
    const minutosFoco = Math.floor(Math.random() * (MAX_FOCO_POMODORO - MIN_FOCO_POMODORO + 1)) + MIN_FOCO_POMODORO;
    return minutosFoco * 60 * 1000;
  }

  if (intervalosPersonalizados.length > 0) {
    const indiceSorteado = Math.floor(Math.random() * intervalosPersonalizados.length);
    const minutosPersonalizados = intervalosPersonalizados[indiceSorteado];
    return minutosPersonalizados * 60 * 1000;
  }

  const minutos = Math.floor(Math.random() * (tempoMaximoAtual - tempoMinimoAtual + 1)) + tempoMinimoAtual;
  return minutos * 60 * 1000;
}

function normalizarValorMinutos(valor) {
  if (!Number.isFinite(valor)) return null;
  return Math.floor(valor);
}

function mostrarErroIntervalos(mensagem) {
  erroIntervalos.textContent = mensagem;
  erroIntervalos.classList.remove('hidden');
}

function limparErroIntervalos() {
  erroIntervalos.textContent = '';
  erroIntervalos.classList.add('hidden');
}

function mostrarErroTempoManual(mensagem) {
  erroTempoManual.textContent = mensagem;
  erroTempoManual.classList.remove('hidden');
}

function limparErroTempoManual() {
  erroTempoManual.textContent = '';
  erroTempoManual.classList.add('hidden');
}

function criarItemIntervalo(minutos) {
  const item = document.createElement('li');
  item.className = 'intervalo-item';

  const texto = document.createElement('span');
  texto.textContent = `${minutos} min`;

  const botaoRemover = document.createElement('button');
  botaoRemover.type = 'button';
  botaoRemover.className = 'btn intervalo-remover';
  botaoRemover.textContent = 'Remover';
  botaoRemover.addEventListener('click', () => {
    const indice = intervalosPersonalizados.indexOf(minutos);
    if (indice !== -1) {
      intervalosPersonalizados.splice(indice, 1);
    }
    atualizarListaIntervalos();
    atualizarResumoConfig();
  });

  item.append(texto, botaoRemover);
  return item;
}

function atualizarListaIntervalos() {
  listaIntervalos.innerHTML = '';
  if (intervalosPersonalizados.length === 0) {
    listaIntervalos.classList.add('hidden');
    return;
  }
  const fragmento = document.createDocumentFragment();
  intervalosPersonalizados.forEach((minutos) => {
    fragmento.appendChild(criarItemIntervalo(minutos));
  });
  listaIntervalos.appendChild(fragmento);
  listaIntervalos.classList.remove('hidden');
}

function atualizarResumoConfig() {
  if (!tempoMinimoAtual || !tempoMaximoAtual) return;

  if (intervalosPersonalizados.length > 0) {
    configResumo.textContent = `Faixa sorteio: ${tempoMinimoAtual} a ${tempoMaximoAtual} min (Intervalos extras: ${intervalosPersonalizados.join(', ')} min).`;
    return;
  }
  if (modoAtual === 'pomodoro') {
    configResumo.textContent = `Ciclos de foco aleatórios entre ${tempoMinimoAtual} e ${tempoMaximoAtual} minutos. Descanso entre ${descansoMinimoAtual} e ${descansoMaximoAtual} minutos.`;
    return;
  }

  configResumo.textContent = `Sorteando ciclos aleatórios entre ${tempoMinimoAtual} e ${tempoMaximoAtual} minutos.`;
}

function adicionarIntervalo() {
  const valor = Number(intervaloNovoInput.value);
  const valorNormalizado = normalizarValorMinutos(valor);

  if (valorNormalizado === null || valorNormalizado < 1) {
    mostrarErroIntervalos('Informe um intervalo válido maior que 0.');
    return;
  }
  if (intervalosPersonalizados.includes(valorNormalizado)) {
    mostrarErroIntervalos('Esse intervalo já foi adicionado.');
    return;
  }
  intervalosPersonalizados.push(valorNormalizado);
  intervalosPersonalizados.sort((a, b) => a - b);
  intervaloNovoInput.value = '';
  limparErroIntervalos();
  atualizarListaIntervalos();
  atualizarResumoConfig();
}

function limparTimer() {
  if (timerId !== null) {
    clearTimeout(timerId);
    timerId = null;
  }
}

function limparContagem() {
  if (countdownId !== null) {
    clearInterval(countdownId);
    countdownId = null;
  }
  proximoDesafioEm = null;
  descansoFimEm = null;
}

function formatarSegundosEmMinutos(segundosTotais) {
  const minutos = Math.floor(segundosTotais / 60).toString().padStart(2, '0');
  const segundos = Math.floor(segundosTotais % 60).toString().padStart(2, '0');
  return `${minutos}:${segundos}`;
}

function atualizarContagemRegressivaFinal() {
  if (!ativo || emDesafio || !proximoDesafioEm) return;

  const restanteMs = proximoDesafioEm - Date.now();
  const restanteSegundos = Math.ceil(restanteMs / 1000);

  if (restanteSegundos <= 0) {
    limparContagem();
    return;
  }

  if (modoAtual === 'pomodoro') atualizarCronometroDescanso();

  subStatus.textContent = 'Próximo estímulo: surpresa.';
}

function atualizarStatusPrincipal(texto, classe) {
  statusPrincipal.textContent = texto;
  statusPrincipal.classList.remove('status-off', 'status-on', 'status-challenge');
  statusPrincipal.classList.add(classe);
}

function atualizarEstadoBotoes() {
  btnAtivar.disabled = ativo;
  btnPararContinuar.disabled = !(ativo && emDesafio);
}

function sortearDescansoPomodoroMs() {
  const minutosDescanso = Math.floor(Math.random() * (descansoMaximoAtual - descansoMinimoAtual + 1)) + descansoMinimoAtual;
  return minutosDescanso * 60 * 1000;
}

function atualizarCronometroDescanso() {
  if (modoAtual !== 'pomodoro' || !descansoTempo) return;
  descansoTempo.textContent = 'Não visível';
}

function iniciarCicloOculto() {
  if (!ativo || emDesafio) return;

  limparTimer();
  limparContagem();

  if (modoAtual === 'pomodoro' && emDescansoPomodoro) {
    atualizarStatusPrincipal('Descanso', 'status-on');
    subStatus.textContent = 'Descanso em andamento (oculto).';
    alertaDesafio.classList.add('hidden');
    atualizarEstadoBotoes();

    const descansoMs = sortearDescansoPomodoroMs();
    descansoFimEm = Date.now() + descansoMs;
    proximoDesafioEm = descansoFimEm;
    atualizarCronometroDescanso();

    timerId = setTimeout(() => {
      emDescansoPomodoro = false;
      iniciarCicloOculto();
    }, descansoMs);

    atualizarContagemRegressivaFinal();
    countdownId = setInterval(atualizarContagemRegressivaFinal, 1000);
    return;
  }

  atualizarStatusPrincipal('Ativo', 'status-on');
  subStatus.textContent = 'Próximo estímulo: surpresa.';
  alertaDesafio.classList.add('hidden');
  atualizarEstadoBotoes();

  const duracaoMs = sortearDuracaoMs();
  proximoDesafioEm = Date.now() + duracaoMs;
  if (modoAtual === 'pomodoro') {
    descansoFimEm = null;
    atualizarCronometroDescanso();
  }

  timerId = setTimeout(dispararDesafio, duracaoMs);
  atualizarContagemRegressivaFinal();
  countdownId = setInterval(atualizarContagemRegressivaFinal, 1000);
}

async function dispararDesafio() {
  if (!ativo) return;

  emDesafio = true;
  limparContagem();
  atualizarStatusPrincipal('Desafio!', 'status-challenge');
  subStatus.textContent = 'Abra o outro app e faça o ciclo.';
  alertaDesafio.classList.remove('hidden');
  atualizarEstadoBotoes();

  try {
    alarme.currentTime = 0;
    await alarme.play();
  } catch (erro) {
    subStatus.textContent = 'Desafio! Não foi possível tocar o alarme automaticamente.';
    console.warn('Falha ao tocar alarme:', erro);
  }
}

function ativar() {
  if (!tempoMinimoAtual || !tempoMaximoAtual || ativo) return;
  ativo = true;
  emDesafio = false;
  emDescansoPomodoro = false;
  atualizarEstadoBotoes();
  iniciarCicloOculto();
}

function pararMusicaEContinuar() {
  if (!ativo || !emDesafio) return;
  alarme.pause();
  alarme.currentTime = 0;
  emDesafio = false;
  if (modoAtual === 'pomodoro') {
    emDescansoPomodoro = true;
  }
  iniciarCicloOculto();
}

function desativar() {
  ativo = false;
  emDesafio = false;
  emDescansoPomodoro = false;
  limparTimer();
  limparContagem();
  alarme.pause();
  alarme.currentTime = 0;
  atualizarStatusPrincipal('Desligado', 'status-off');
  subStatus.textContent = 'Cronômetro desligado.';
  alertaDesafio.classList.add('hidden');
  atualizarEstadoBotoes();
}

function voltarParaConfiguracao() {
  desativar();
  if (tempoMinimoAtual) tempoMinimoInput.value = tempoMinimoAtual;
  if (tempoMaximoAtual) tempoMaximoInput.value = tempoMaximoAtual;
  
  erroConfig.classList.add('hidden');
  limparErroIntervalos();
  painelPrincipal.classList.add('hidden');
  telaInicial.classList.add('hidden');
  telaModo.classList.remove('hidden');
}

function configurarTempos(evento) {
  evento.preventDefault();
  const minVal = Number(tempoMinimoInput.value);
  const maxVal = Number(tempoMaximoInput.value);

  if (!Number.isFinite(minVal) || !Number.isFinite(maxVal) || minVal < 1 || maxVal < minVal) {
    erroConfig.textContent = "Valores inválidos. O mínimo deve ser 1 ou maior, e não pode ultrapassar o máximo.";
    erroConfig.classList.remove('hidden');
    return;
  }

  tempoMinimoAtual = Math.floor(minVal);
  tempoMaximoAtual = Math.floor(maxVal);

  tempoMinimoManualInput.value = tempoMinimoAtual;
  tempoMaximoManualInput.value = tempoMaximoAtual;

  atualizarResumoConfig();
  erroConfig.classList.add('hidden');

  telaInicial.classList.add('hidden');
  painelPrincipal.classList.remove('hidden');

  desativar();
}

function aplicarTempoManual() {
  const minVal = Number(tempoMinimoManualInput.value);
  const maxVal = Number(tempoMaximoManualInput.value);

  if (!Number.isFinite(minVal) || !Number.isFinite(maxVal) || minVal < 1 || maxVal < minVal) {
    mostrarErroTempoManual("Valores inválidos. O mínimo deve ser menor ou igual ao máximo.");
    return;
  }

  tempoMinimoAtual = Math.floor(minVal);
  tempoMaximoAtual = Math.floor(maxVal);

  tempoMinimoInput.value = tempoMinimoAtual;
  tempoMaximoInput.value = tempoMaximoAtual;

  if (modoAtual === 'pomodoro') {
    const descansoMin = Number(descansoMinimoManualInput.value);
    const descansoMax = Number(descansoMaximoManualInput.value);

    if (!Number.isFinite(descansoMin) || !Number.isFinite(descansoMax) || descansoMin < 1 || descansoMax < descansoMin) {
      mostrarErroTempoManual('Descanso inválido. O mínimo deve ser menor ou igual ao máximo.');
      return;
    }

    descansoMinimoAtual = Math.floor(descansoMin);
    descansoMaximoAtual = Math.floor(descansoMax);
  }

  limparErroTempoManual();
  atualizarResumoConfig();

  if (ativo && !emDesafio) {
    iniciarCicloOculto();
  }
}

function abrirModoConvencional() {
  modoAtual = 'convencional';
  pomodoroPainel.classList.add('hidden');
  ajusteDescansoPomodoro.classList.add('hidden');
  telaModo.classList.add('hidden');
  telaInicial.classList.remove('hidden');
}

function abrirModoPomodoro() {
  modoAtual = 'pomodoro';
  telaModo.classList.add('hidden');
  telaInicial.classList.add('hidden');
  painelPrincipal.classList.remove('hidden');
  pomodoroPainel.classList.remove('hidden');
  ajusteDescansoPomodoro.classList.remove('hidden');
  
  // Define tempos de exibição para o pomodoro
  tempoMinimoAtual = MIN_FOCO_POMODORO;
  tempoMaximoAtual = MAX_FOCO_POMODORO;
  descansoMinimoAtual = MIN_DESCANSO_POMODORO_PADRAO;
  descansoMaximoAtual = MAX_DESCANSO_POMODORO_PADRAO;
  descansoMinimoManualInput.value = descansoMinimoAtual;
  descansoMaximoManualInput.value = descansoMaximoAtual;
  
  atualizarResumoConfig();
  desativar();
}

formConfig.addEventListener('submit', configurarTempos);
btnAdicionarIntervalo.addEventListener('click', adicionarIntervalo);
intervaloNovoInput.addEventListener('keydown', (evento) => {
  if (evento.key !== 'Enter') return;
  evento.preventDefault();
  adicionarIntervalo();
});
btnAtivar.addEventListener('click', ativar);
btnPararContinuar.addEventListener('click', pararMusicaEContinuar);
btnDesativar.addEventListener('click', desativar);
btnReconfigurar.addEventListener('click', voltarParaConfiguracao);
btnAplicarTempoManual.addEventListener('click', aplicarTempoManual);

[tempoMinimoManualInput, tempoMaximoManualInput].forEach(input => {
  input.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Enter') return;
    evento.preventDefault();
    aplicarTempoManual();
  });
});

btnModoConvencional.addEventListener('click', abrirModoConvencional);
btnModoPomodoro.addEventListener('click', abrirModoPomodoro);

atualizarEstadoBotoes();

window.addEventListener('beforeunload', () => {
  limparTimer();
  limparContagem();
  alarme.pause();
});
