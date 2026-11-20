(function(){
  const prompts = window.PROMPTS || [];
  const catSelect = document.querySelector('#catSelect');
  const promptSelect = document.querySelector('#promptSelect');
  const promptHint = document.querySelector('#promptHint');
  const dynamicFields = document.querySelector('#dynamicFields');
  const extraConstraints = document.querySelector('#extraConstraints');
  const builtPrompt = document.querySelector('#builtPrompt');
  const modeButtons = document.querySelectorAll('.seg-btn');
  const activeModeNote = document.querySelector('#activeModeNote');
  const insertExample = document.querySelector('#insertExample');
  const clearFields = document.querySelector('#clearFields');
  const copyButton = document.querySelector('#copyBuiltPrompt');
  const randomButton = document.querySelector('#randomPick');
  const viewPromptPage = document.querySelector('#viewPromptPage');
  const toast = document.querySelector('#builderToast');

  let mode = 'beginner';
  let activeKey = prompts[0]?.key || null;
  let fieldValues = {};

  const categoryAliases = { career: 'work' };

  function normalizeCategory(value){
    return categoryAliases[value] || value;
  }

  function filterPrompts(){
    const selected = normalizeCategory(catSelect?.value || 'all');
    return prompts.filter(prompt => selected === 'all' || normalizeCategory(prompt.category) === selected);
  }

  function getPrompt(key){
    return prompts.find(prompt => prompt.key === key) || null;
  }

  // Extract unique [placeholder] tokens from template
  function extractPlaceholders(template){
    const matches = [...template.matchAll(/\[([^\]]+)\]/g)];
    const seen = new Set();
    const tokens = [];
    for (const m of matches) {
      const full = m[0];
      const inner = m[1].trim();
      // Ignore output placeholders like [owner TBD] or [date TBD]
      if (/TBD$/i.test(inner)) continue;
      if (!seen.has(full)) {
        seen.add(full);
        tokens.push({ token: full, label: inner });
      }
    }
    return tokens;
  }

  function formatLabel(raw){
    if (/^paste/i.test(raw)) return 'Your text / source material';
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }

  function renderDynamicInputs(){
    const prompt = getPrompt(activeKey);
    if(!prompt || !dynamicFields) return;
    const template = mode === 'power' ? prompt.power : prompt.beginner;
    const placeholders = extractPlaceholders(template);

    if(!placeholders.length){
      dynamicFields.innerHTML = `
        <div>
          <label class="form-label app-label" for="fallbackDetails">Your details</label>
          <textarea id="fallbackDetails" class="form-control app-textarea" placeholder="Paste your context, notes, or source text here">${fieldValues['__fallback'] || ''}</textarea>
        </div>
      `;
      const fb = document.querySelector('#fallbackDetails');
      fb?.addEventListener('input', () => {
        fieldValues['__fallback'] = fb.value;
        renderBuilt();
      });
      return;
    }

    dynamicFields.innerHTML = placeholders.map((p, idx) => {
      const isLong = /paste|notes|details|list|experience|posting|problem|situation|text/i.test(p.label) || placeholders.length === 1;
      const val = fieldValues[p.token] || '';
      const id = `dynField_${idx}`;
      if (isLong) {
        return `
          <div>
            <label class="form-label app-label" for="${id}">${formatLabel(p.label)}</label>
            <textarea id="${id}" data-token="${p.token}" class="form-control app-textarea" style="min-height:${placeholders.length > 1 ? '110px' : '170px'}" placeholder="Enter ${p.label}...">${val}</textarea>
          </div>
        `;
      }
      return `
        <div>
          <label class="form-label app-label" for="${id}">${formatLabel(p.label)}</label>
          <input id="${id}" data-token="${p.token}" type="text" class="form-control app-select" value="${val.replace(/"/g, '&quot;')}" placeholder="Enter ${p.label}...">
        </div>
      `;
    }).join('');

    dynamicFields.querySelectorAll('[data-token]').forEach(el => {
      el.addEventListener('input', () => {
        fieldValues[el.dataset.token] = el.value;
        renderBuilt();
      });
    });
  }

  function applyTemplate(template){
    let out = template;
    const placeholders = extractPlaceholders(template);
    if (!placeholders.length) {
      const val = (fieldValues['__fallback'] || '').trim();
      if (val) out += `

<input>
${val}
</input>`;
    } else {
      for (const p of placeholders) {
        const val = (fieldValues[p.token] || '').trim();
        if (val) {
          out = out.split(p.token).join(val);
        }
      }
    }
    const extra = (extraConstraints?.value || '').trim();
    if (extra) {
      out += `

Additional constraints: ${extra}`;
    }
    return out;
  }

  function showToast(){
    if(!toast) return;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 1200);
  }

  async function copyText(text){
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
  }

  function renderBuilt(){
    const prompt = getPrompt(activeKey);
    if(!prompt || !builtPrompt) return;
    const template = mode === 'power' ? prompt.power : prompt.beginner;
    builtPrompt.textContent = applyTemplate(template);
    if(promptHint) promptHint.textContent = prompt.description || '';
    if(activeModeNote) activeModeNote.textContent = mode === 'power' ? 'Power User format' : 'Beginner format';
    if(viewPromptPage && prompt.url) viewPromptPage.href = prompt.url;
  }

  function renderOptions(){
    const list = filterPrompts();
    if(!promptSelect) return;
    promptSelect.innerHTML = list.map(prompt => `<option value="${prompt.key}">${prompt.title}</option>`).join('');
    if(list.length){
      activeKey = list.some(prompt => prompt.key === activeKey) ? activeKey : list[0].key;
      promptSelect.value = activeKey;
      renderDynamicInputs();
      renderBuilt();
    } else {
      activeKey = null;
      builtPrompt.textContent = 'No prompts match this category.';
      if(promptHint) promptHint.textContent = '';
    }
  }

  modeButtons.forEach(button => {
    button.addEventListener('click', () => {
      modeButtons.forEach(btn => btn.classList.remove('is-active'));
      button.classList.add('is-active');
      mode = button.dataset.mode || 'beginner';
      renderDynamicInputs();
      renderBuilt();
    });
  });

  catSelect?.addEventListener('change', () => {
    fieldValues = {};
    renderOptions();
  });

  promptSelect?.addEventListener('change', () => {
    activeKey = promptSelect.value;
    fieldValues = {};
    renderDynamicInputs();
    renderBuilt();
  });

  extraConstraints?.addEventListener('input', renderBuilt);

  insertExample?.addEventListener('click', () => {
    const prompt = getPrompt(activeKey);
    if(!prompt) return;
    const template = mode === 'power' ? prompt.power : prompt.beginner;
    const placeholders = extractPlaceholders(template);
    const sampleText = (prompt.example_input || '').trim();
    if (placeholders.length === 1) {
      fieldValues[placeholders[0].token] = sampleText || 'Audience: team lead
Goal: concise status update with clear next steps
Notes: Phase 1 completed ahead of schedule; awaiting sign-off on Phase 2.';
    } else if (placeholders.length > 1) {
      placeholders.forEach((p, i) => {
        fieldValues[p.token] = i === 0 && sampleText ? sampleText : `Sample ${p.label}`;
      });
    } else {
      fieldValues['__fallback'] = sampleText || 'Sample context and details.';
    }
    renderDynamicInputs();
    renderBuilt();
  });

  clearFields?.addEventListener('click', () => {
    fieldValues = {};
    if(extraConstraints) extraConstraints.value = '';
    renderDynamicInputs();
    renderBuilt();
  });

  copyButton?.addEventListener('click', async () => {
    await copyText(builtPrompt.textContent);
    showToast();
  });

  randomButton?.addEventListener('click', () => {
    const list = filterPrompts();
    if(!list.length) return;
    const item = list[Math.floor(Math.random() * list.length)];
    activeKey = item.key;
    fieldValues = {};
    promptSelect.value = activeKey;
    renderDynamicInputs();
    renderBuilt();
  });

  const params = new URLSearchParams(window.location.search);
  const requestedCategory = normalizeCategory(params.get('cat') || '');
  const requestedPrompt = params.get('prompt');

  if(requestedCategory && catSelect){
    catSelect.value = requestedCategory;
  }

  renderOptions();

  if(requestedPrompt){
    const exists = prompts.find(prompt => prompt.key === requestedPrompt);
    if(exists && promptSelect){
      activeKey = requestedPrompt;
      promptSelect.value = requestedPrompt;
      renderDynamicInputs();
      renderBuilt();
    }
  }
})();
