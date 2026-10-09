(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const key = 'alem-do-real-grupo-3-v2';
  const checks = [
    ['Quem publicou?', 'Identifiquei o autor ou responsável pela publicação.'],
    ['De onde veio?', 'Busquei a versão original e a origem do arquivo.'],
    ['Em qual contexto?', 'Verifiquei a data, a localização e a intenção da publicação.'],
    ['O que outras fontes dizem?', 'Comparei as alegações com fontes confiáveis e independentes.'],
    ['É pista ou comprovação?', 'Separei impressões e sinais visuais de evidências verificáveis.'],
    ['O que ainda é incerto?', 'Registrei o que foi confirmado e as dúvidas que permaneceram.']
  ];

  let saved = {};
  let storageWorks = true;
  try { saved = JSON.parse(localStorage.getItem(key) || '{}') || {}; }
  catch { saved = {}; storageWorks = false; }
  if (typeof saved !== 'object' || Array.isArray(saved)) saved = {};
  const state = {
    checks: checks.map((_, index) => saved.checks?.[index] === true),
    project: Object.fromEntries(['members', 'tool', 'review', 'responsibilities', 'sources'].map((field) => [field, typeof saved.project?.[field] === 'string' ? saved.project[field].slice(0, 4000) : '']))
  };
  let toastTimeout;
  const toast = (message) => {
    $('toast').textContent = message;
    $('toast').hidden = false;
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { $('toast').hidden = true; }, 4000);
  };
  const persist = () => {
    try {
      localStorage.setItem(key, JSON.stringify({ ...saved, checks: state.checks, project: state.project }));
      storageWorks = true;
      return true;
    } catch {
      storageWorks = false;
      return false;
    }
  };
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false;
  const video = $('video');
  video.addEventListener('error', () => { $('video-error').hidden = false; });
  video.addEventListener('canplay', () => { $('video-error').hidden = true; });


  function updateChecks() {
    const count = state.checks.filter(Boolean).length;
    const number = $('check-number');
    number.replaceChildren(document.createTextNode(String(count).padStart(2, '0')));
    const total = document.createElement('span'); total.textContent = '/06'; number.append(total);
    $('check-progress').style.width = `${count / checks.length * 100}%`;
    $('check-summary').textContent = count === 0 ? 'Sua investigação ainda não começou.' : count === 6 ? 'Etapas registradas. Revise as evidências antes de concluir.' : `${count} de 6 etapas registradas. Continue verificando.`;
  }
  checks.forEach(([title, description], index) => {
    const label = document.createElement('label'); label.className = 'check-item';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = state.checks[index]; input.id = `check-${index}`;
    const text = document.createElement('span');
    const strong = document.createElement('strong'); strong.textContent = title;
    const small = document.createElement('small'); small.textContent = description;
    text.append(strong, small);
    const number = document.createElement('span'); number.textContent = String(index + 1).padStart(2, '0'); number.setAttribute('aria-hidden', 'true');
    label.append(input, text, number);
    input.addEventListener('change', () => { state.checks[index] = input.checked; persist(); updateChecks(); });
    $('checklist').append(label);
  });
  $('clear-checks').addEventListener('click', () => {
    state.checks.fill(false);
    $('checklist').querySelectorAll('input').forEach((input) => { input.checked = false; });
    persist(); updateChecks();
  });
  updateChecks();

  function downloadText(name, text) {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + text], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const recordText = () => {
    const project = state.project;
    return ['ALÉM DO REAL — GRUPO 3', 'Inteligência com Consciência: o humano no centro da era digital', 'SENAI-SP — Atividade 3: Vídeo gerado por IA', '',
      'OBJETIVO', 'Reconhecer sinais de geração ou manipulação em vídeos, desenvolver pensamento crítico e verificar contexto e fontes.', '',
      'PÚBLICO', 'Alunos dos cursos regulares do SENAI Gaspar Ricardo Júnior.', '',
      'INTEGRANTES', project.members || 'Não preenchido.', '',
      'FERRAMENTA E PROCESSO DO VÍDEO', project.tool || 'Não confirmado pelo grupo. O arquivo foi fornecido como exemplo gerado por IA.', '',
      'REVISÃO HUMANA REALIZADA', project.review || 'Não registrada.', '',
      'DIVISÃO DE RESPONSABILIDADES', project.responsibilities || 'Não registrada.', '',
      'RECURSOS', 'Site, vídeo fornecido, computador ou celular; projetor e som para exibição coletiva.', '',
      'REFERÊNCIAS', 'SENAI-SP. Inteligência com Consciência: o humano no centro da era digital. Prof. Esp. Leandro Gaudio Rosa, 2026, p. 3 e 6–7.', project.sources || 'Outras fontes não registradas.', '',
      'USO DE IA', 'Vídeo fornecido como exemplo de conteúdo gerado por IA; site desenvolvido com auxílio de IA. Os registros acima devem refletir a supervisão humana realmente realizada.'].join('\n');
  };

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else { dialog.setAttribute('open', ''); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); }
  }
  function closeDialog(dialog) {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  document.querySelectorAll('[data-close]').forEach((button) => button.addEventListener('click', () => closeDialog($(button.dataset.close))));
  $('project-dialog').addEventListener('click', (event) => {
    if (event.target !== $('project-dialog')) return;
    const box = $('project-dialog').getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) closeDialog($('project-dialog'));
  });
  const projectFields = ['members', 'tool', 'review', 'responsibilities', 'sources'];
  $('open-project').addEventListener('click', () => {
    projectFields.forEach((field) => { $(field).value = state.project[field]; });
    $('project-status').textContent = storageWorks ? 'Os dados ficam neste navegador.' : 'Armazenamento indisponível. Baixe a ficha para guardar.';
    openDialog($('project-dialog'));
  });
  const readProjectForm = () => { projectFields.forEach((field) => { state.project[field] = $(field).value.trim(); }); };
  $('project-form').addEventListener('submit', (event) => {
    event.preventDefault(); readProjectForm();
    if (persist()) { closeDialog($('project-dialog')); toast('Ficha salva neste navegador.'); }
    else $('project-status').textContent = 'Não foi possível salvar neste navegador. Use “Baixar ficha” para guardar os dados.';
  });
  $('download-project').addEventListener('click', () => {
    readProjectForm(); persist(); downloadText('Ficha_Projeto_Grupo_3.txt', recordText()); toast('Ficha preparada para download.');
  });

  if ('IntersectionObserver' in window) {
    if (!reducedMotion) {
      const reveals = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.remove('waiting'); reveals.unobserve(entry.target); }
      }), { threshold: 0.06 });
      document.querySelectorAll('.reveal').forEach((element) => { element.classList.add('waiting'); reveals.observe(element); });
    }
    const sectionObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      $('main-nav').querySelectorAll('a').forEach((link) => link.classList.toggle('current', link.hash === `#${entry.target.id}`));
    }), { rootMargin: '-20% 0px -60% 0px' });
    ['dinamica', 'laboratorio', 'evidencias', 'metodo', 'fontes', 'projeto'].forEach((id) => sectionObserver.observe($(id)));
  }

  // Expose only the verification steps still present on the page.
  if (document.modelContext?.registerTool) {
    const lifecycle = new AbortController();
    const tool = {
      name: 'read_video_investigation', title: 'Ler etapas de verificação',
      description: 'Read the verification checklist visible on this page and the declared origin of the video. Does not classify or authenticate the video.',
      inputSchema: { type: 'object', properties: {}, additionalProperties: false },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute(input) {
        if (!input || typeof input !== 'object' || Array.isArray(input) || Object.keys(input).length) throw new Error('Nenhum parâmetro é aceito.');
        return { checks: checks.map((item, index) => ({ step: item[0], completed: state.checks[index] })), origin: 'Provided as an AI-generated example; no automatic authentication performed.' };
      }
    };
    try { Promise.resolve(document.modelContext.registerTool(tool, { signal: lifecycle.signal })).catch(() => {}); }
    catch { /* The page remains usable without this experimental API. */ }
    window.addEventListener('pagehide', () => lifecycle.abort(), { once: true });
  }
})();
