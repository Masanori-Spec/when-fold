(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const translations = {
    ja: {
      skip:'ワークスペースへ', local:'端末内で完結', eyebrow:'KEYBINDINGS, UNTANGLED.', hero:'そのキーの優先順位を、\n意図どおりに。', intro:'重なる条件を見つけ、勝つルールを選び、変更を確かめる。VS Code のキーバインドを、有限のコンテキストモデルで整理します。', method:'読み込む。優先する。\n振る舞いまで、持ち出す。', methodFoot:'JSON IN · REVIEW · ZIP OUT', workspace:'ルールのワークスペース', notAnalyzed:'未解析', ready:'解析済み', stale:'再解析が必要', error:'入力エラー', project:'プロジェクト', inputHelp:'複数ソースのルールと、確認する値の範囲をひとつの JSON に。', loadFile:'JSON を開く', example:'サンプルに戻す', projectJSON:'プロジェクト JSON', projectHelp:'後方のルールが初期状態では優先されます。モデル内の null は未定義を表します。編集すると以前の結果は無効になります。', addSnippet:'別のルールを追加', sourceName:'ソース名', snippetLabel:'ルール配列（JSONC 可）', append:'ソースとして追加', analyze:'モデルを解析', initialStatus:'サンプルを用意しました。解析して、重なりを確認しましょう。', rules:'ルール', contexts:'モデルの文脈', overlaps:'重なるペア', changes:'変わる結果', priority:'勝つルールを、上へ。', highestFirst:'上ほど優先', emptyTitle:'条件の重なりを、見える形に。', emptyCopy:'プロジェクトを解析すると、キーごとの優先順位、ルールの出所、変更される結果がここに表示されます。', keyGroup:'キーを選択', priorityHelp:'↑ ↓ で優先順位を変更。結果は即座に再計算されます。ルール名を選ぶと詳細を確認できます。', compilerNote:'下位ルールから上位ルールの条件を除外し、モデル内で同時に勝たないルールに変換します。', inspector:'ルールの出所と条件', witnessTitle:'重なりの証拠', witnessHelp:'同時に成立する条件の例です。実際のエディタで到達できる状態とは限りません。', deltaTitle:'変更のプレビュー', deltaHelp:'読み込み順での結果と、選んだ優先順位での結果を比較します。選択したモデル内だけの比較です。', exportTitle:'判断の根拠ごと、書き出す。', exportCopy:'変換後 / 元のキーバインド · ソースマップ · シナリオ · 変更 CSV · HTML レポート', previewReport:'レポートを見る', download:'ZIP をダウンロード', downloadFile:'ファイルを保存', exportFormat:'書き出し形式', zipOption:'ZIP · 全 6 ファイル', scopeHeading:'このワークベンチが保証する範囲', scopeOne:'最大 100 ルール、4,096 個の型付き有限コンテキスト。入力は 1 MiB、シナリオ出力は 16 MiB まで。単一ストロークのキーと対応する条件式のみを解析します。', scopeTwo:'未知の組み込み・拡張機能のルール、実際のキーボード配列、エディタの到達可能状態は対象外です。コメントや元の整形は保存されません。', scopeThree:'コマンドの実行、VS Code の設定変更、外部送信は行いません。出力を確認し、バックアップを取ってから手動で導入してください。', footer:'優先順位を、明示する。', footerLocal:'依存なし。送信なし。オフライン対応。', reportTitle:'解析レポート', close:'閉じる', edited:'入力が変わりました。古い結果と出力を消去しました。もう一度解析してください。', loading:'プロジェクトファイルを読み込んでいます…', loaded:'ファイルを読み込みました。モデルを解析してください。', appended:'ソースを追加しました。モデルを解析してください。', analyzed:'解析しました。優先順位を変更して、結果の差分を確認できます。', reordered:'優先順位を更新し、結果を再計算しました。', failed:'解析できませんでした：', fileTooLarge:'ファイルが大きすぎます（上限 1 MB）。', missingName:'ソース名を入力してください。', source:'ソース', position:'ソース内の位置', condition:'入力条件（when）', command:'コマンド', arguments:'引数（args）', originalRank:'読み込み時の位置', always:'常に成立（when なし）', noArgs:'引数なし', inspect:'ルールを確認', moveUp:'優先順位を上げる', moveDown:'優先順位を下げる', groupCount:'ルール / キー', noWitness:'このキーに、モデル内で重なるルールはありません。', noChanges:'変更はありません。今の優先順位は、読み込み順での結果を保っています。', noGroups:'このプロジェクトにキーのグループがありません。', before:'変更前', after:'変更後', context:'コンテキスト / キー', noCommand:'該当なし', absent:'未定義', overlapContexts:'コンテキストで重複', fullExport:'表示を省略しています。全件は ZIP 内のファイルで確認できます。', exported:'ダウンロードを開始しました。導入前に内容とモデルの範囲を確認してください。', sourceRule:'ルール', compiledCondition:'変換後の条件', allContexts:'空のコンテキスト', downloadError:'書き出しに失敗しました：', snippetDraft:'追加用の下書きが変わりました。「ソースとして追加」で取り込むか、現在のプロジェクトだけを再解析してください。', summary:'解析の要約'
    },
    en: {
      skip:'Skip to workspace', local:'LOCAL-ONLY', eyebrow:'KEYBINDINGS, UNTANGLED.', hero:'Make every shortcut\nplay by your rules.', intro:'Find overlapping conditions, choose which rule wins, and inspect what changes. A finite-model workbench for your VS Code keybindings.', method:'Bring your rules.\nLeave with clarity.', methodFoot:'JSON IN · REVIEW · ZIP OUT', workspace:'Your rules, in focus', notAnalyzed:'NOT ANALYZED', ready:'ANALYZED', stale:'NEEDS ANALYSIS', error:'INPUT ERROR', project:'The project', inputHelp:'Bring rules from several sources and the context values you want to check, in one JSON project.', loadFile:'Open JSON', example:'Reset example', projectJSON:'Project JSON', projectHelp:'Later imported rules win by default. In model values, null means absent. Editing immediately clears previous results.', addSnippet:'Add another source', sourceName:'Source name', snippetLabel:'Rule array (JSONC supported)', append:'Append source', analyze:'Analyze model', initialStatus:'An example is ready. Analyze it to find where conditions overlap.', rules:'Rules', contexts:'Model contexts', overlaps:'Overlapping pairs', changes:'Changed outcomes', priority:'Put the winner on top.', highestFirst:'HIGHEST FIRST', emptyTitle:'See where your conditions cross.', emptyCopy:'Analyze your project to review priorities by key, inspect where each rule came from, and see the outcomes that change.', keyGroup:'Choose key', priorityHelp:'Use ↑ ↓ to change priority. Results recompile immediately. Select a rule name to inspect its provenance and condition.', compilerNote:'Lower-priority rules exclude higher-priority conditions, producing rules that do not win together within your model.', inspector:'Provenance & conditions', witnessTitle:'Where rules overlap', witnessHelp:'These are logical witness contexts. They are not evidence that the state is reachable in a running editor.', deltaTitle:'The behavior delta', deltaHelp:'Compare imported-order behavior with your chosen priorities, within the declared model only.', exportTitle:'Take the reasoning with you.', exportCopy:'Compiled & original keybindings · source map · scenarios · delta CSV · HTML report', previewReport:'Preview report', download:'Download ZIP', downloadFile:'Save file', exportFormat:'Export format', zipOption:'ZIP · all six files', scopeHeading:'A precise boundary, not a blanket guarantee', scopeOne:'Up to 100 rules and 4,096 finite, typed contexts. Input is capped at 1 MiB; scenario output at 16 MiB. Single-stroke keys and supported condition expressions only.', scopeTwo:'Unknown built-in or extension rules, real keyboard layouts, and reachable editor states are outside scope. Original formatting and comments are not preserved.', scopeThree:'No commands are executed, no VS Code settings are changed, and nothing is uploaded. Review the output and make a backup before installing it manually.', footer:'Make priority explicit.', footerLocal:'No dependencies. No uploads. Works offline.', reportTitle:'Analysis report', close:'Close', edited:'Input changed. Previous results and exports were cleared. Analyze again to continue.', loading:'Reading the project file…', loaded:'Project loaded. Analyze the model to continue.', appended:'Source appended. Analyze the model to continue.', analyzed:'Analysis complete. Adjust priorities to review which outcomes change.', reordered:'Priority updated. Results have been recompiled.', failed:'Could not analyze: ', fileTooLarge:'File is too large (1 MB maximum).', missingName:'Enter a source name.', source:'Source', position:'Position in source', condition:'Input condition (when)', command:'Command', arguments:'Arguments (args)', originalRank:'Imported position', always:'Always (no when condition)', noArgs:'No arguments', inspect:'Inspect rule', moveUp:'Move up', moveDown:'Move down', groupCount:'rules / key', noWitness:'No rules overlap for this key within the model.', noChanges:'No changed outcomes. Your current priorities preserve the imported-order behavior.', noGroups:'This project has no key groups.', before:'Before', after:'After', context:'Context / key', noCommand:'No match', absent:'absent', overlapContexts:'overlapping contexts', fullExport:'More rows are available in the exported ZIP files.', exported:'Download started. Review the contents and model boundary before installing.', sourceRule:'Rule', compiledCondition:'Compiled condition', allContexts:'Empty context', downloadError:'Could not export: ', snippetDraft:'The snippet draft changed. Append it to include it, or reanalyze only the current project.', summary:'Analysis summary'
    }
  };
  let initialLanguage = 'ja';
  try { if (localStorage.getItem('whenfold-language') === 'en') initialLanguage = 'en'; } catch (_) { /* Local storage is optional. */ }
  const state = { language:initialLanguage, result:null, project:null, priority:{}, selectedKey:null, selectedRule:null, revision:0, statusKey:'initialStatus', statusExtra:'', error:false, artifacts:null, reportURL:null };
  const t = (key) => translations[state.language][key] || key;
  const node = (tag, className, value) => { const el = document.createElement(tag); if (className) el.className = className; if (value !== undefined) el.textContent = String(value); return el; };
  function setStatus(key, extra = '', error = false) { state.statusKey = key; state.statusExtra = extra; state.error = error; $('status').textContent = t(key) + extra; $('status').classList.toggle('error', error); }
  function closeReport() { if ($('report-dialog').open) $('report-dialog').close(); $('report-frame').removeAttribute('src'); if (state.reportURL) { URL.revokeObjectURL(state.reportURL); state.reportURL = null; } }
  function invalidate(key = 'edited') {
    state.revision += 1; state.result = null; state.project = null; state.artifacts = null; state.priority = {}; state.selectedKey = null; state.selectedRule = null;
    closeReport(); setStatus(key); renderResults(); return state.revision;
  }
  function updateLanguage() {
    document.documentElement.lang = state.language;
    document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $('language').textContent = state.language === 'ja' ? 'EN ↗' : '日本語 ↗';
    $('language').setAttribute('aria-label', state.language === 'ja' ? 'Switch language to English' : '表示言語を日本語に変更');
    document.querySelector('.stats-grid').setAttribute('aria-label', t('summary'));
    $('status').textContent = t(state.statusKey) + state.statusExtra;
    $('status').classList.toggle('error', state.error);
    renderResults();
  }
  function setPill(key, className = '') { $('state-pill').textContent = t(key); $('state-pill').className = 'state-pill ' + className; }
  function renderResults() {
    const r = state.result;
    $('download').disabled = !r; $('report').disabled = !r; $('export-format').disabled = !r;
    $('empty-state').hidden = !!r; $('priority-content').hidden = !r; $('inspection-panel').hidden = !r; $('review-section').hidden = !r;
    const downloadLabel = $('download').querySelector('[data-i18n]');
    downloadLabel.dataset.i18n = $('export-format').value === 'zip' ? 'download' : 'downloadFile'; downloadLabel.textContent = t(downloadLabel.dataset.i18n);
    if (!r) {
      ['rules','contexts','overlaps','changes'].forEach((k) => { $('stat-' + k).textContent = '—'; });
      $('priority-list').replaceChildren(); $('rule-detail').replaceChildren(); $('witness-list').replaceChildren(); $('delta-list').replaceChildren(); $('group-select').replaceChildren();
      setPill(state.error ? 'error' : (state.statusKey !== 'initialStatus' ? 'stale' : 'notAnalyzed'), state.error ? 'error' : ''); return;
    }
    setPill('ready','ready');
    $('stat-rules').textContent = r.stats.ruleCount; $('stat-contexts').textContent = r.stats.contextCount; $('stat-overlaps').textContent = r.stats.overlapCount; $('stat-changes').textContent = r.stats.changedCount;
    if (!r.groups.some((group) => group.key === state.selectedKey)) state.selectedKey = r.groups[0]?.key || null;
    $('group-select').replaceChildren(...r.groups.map((group) => { const option = node('option','',group.key); option.value = group.key; return option; }));
    if (state.selectedKey !== null) $('group-select').value = state.selectedKey;
    renderPriority(); renderWitnesses(); renderDelta();
  }
  function currentGroup() { return state.result?.groups.find((group) => group.key === state.selectedKey); }
  function chosenIds(group) { return state.priority[group.key] || group.priority || [...group.ruleIds].reverse(); }
  function findRule(id) { return state.result?.rules.find((rule) => rule.id === id); }
  function renderPriority() {
    const group = currentGroup();
    if (!group) { $('priority-list').replaceChildren(node('p','blank-message',t('noGroups'))); $('inspection-panel').hidden = true; return; }
    const ids = chosenIds(group);
    if (!ids.includes(state.selectedRule)) state.selectedRule = ids[0];
    $('group-count').textContent = ids.length + ' ' + t('groupCount');
    $('priority-list').replaceChildren(...ids.map((id,index) => {
      const rule = findRule(id); const li = node('li','rule-card' + (id === state.selectedRule ? ' selected' : '')); li.dataset.ruleId = id;
      li.append(node('span','rule-rank',String(index + 1).padStart(2,'0')));
      const select = node('button','rule-select'); select.type = 'button'; select.setAttribute('aria-label',t('inspect') + ' ' + rule.command + ' (' + rule.id + ')'); select.setAttribute('aria-pressed',String(id === state.selectedRule));
      select.append(node('span','rule-command',rule.command)); const meta = node('span','rule-meta'); meta.append(node('span','source-tag',rule.source),node('span','rule-when',rule.when || t('always'))); select.append(meta);
      select.addEventListener('click',() => { state.selectedRule = id; renderPriority(); $('priority-list').querySelector(`[data-rule-id="${id}"] .rule-select`)?.focus({preventScroll:true}); }); li.append(select);
      const controls = node('span','move-controls');
      [['up',-1,'↑'],['down',1,'↓']].forEach(([direction,delta,label]) => { const button = node('button','move-button',label); button.type = 'button'; button.dataset.direction = direction; button.setAttribute('aria-label',t(direction === 'up' ? 'moveUp' : 'moveDown') + ' ' + rule.command + ' (' + id + ')'); button.title = t(direction === 'up' ? 'moveUp' : 'moveDown'); button.disabled = index + delta < 0 || index + delta >= ids.length; button.addEventListener('click',() => moveRule(id,delta,direction)); controls.append(button); });
      li.append(controls); return li;
    }));
    renderInspector();
  }
  function addField(list,label,value,wide=false,condition=false) { const field = node('div','detail-field' + (wide?' wide':'')); field.append(node('dt','',t(label)),node('dd',condition?'condition':'',value)); list.append(field); }
  function renderInspector() {
    const rule = findRule(state.selectedRule); if (!rule) return;
    $('selected-id').textContent = rule.id; const list = node('dl','detail-grid');
    addField(list,'source',rule.source); addField(list,'position',String(rule.index + 1)); addField(list,'command',rule.command,true); addField(list,'condition',rule.when || t('always'),true,true);
    if (Object.prototype.hasOwnProperty.call(rule,'args')) addField(list,'arguments',JSON.stringify(rule.args,null,2),true,true);
    const mapped = state.result.sourceMap?.entries?.find((entry) => entry.id === rule.id); if (mapped) addField(list,'compiledCondition',mapped.guard,true,true);
    $('rule-detail').replaceChildren(list);
  }
  function contextText(context) { const keys = Object.keys(state.result?.model || context || {}).sort(); return keys.length ? keys.map((key) => key + ' = ' + (Object.prototype.hasOwnProperty.call(context || {},key) ? JSON.stringify(context[key]) : t('absent'))).join('\n') : t('allContexts'); }
  function winnerText(value) { if (!value) return t('noCommand'); if (typeof value === 'string') return findRule(value)?.command || value; return value.command || findRule(value.id)?.command || value.id || t('noCommand'); }
  function renderWitnesses() {
    const matches = state.result.overlaps.filter((overlap) => overlap.key === state.selectedKey); $('witness-count').textContent = matches.length;
    if (!matches.length) { $('witness-list').replaceChildren(node('p','blank-message',t('noWitness'))); return; }
    const elements = matches.slice(0,12).map((overlap) => { const box = node('article','witness'); const top = node('div','witness-top'); top.append(node('strong','',overlap.ruleIds.join(' ∩ ')),node('span','',overlap.count + ' ' + t('overlapContexts'))); box.append(top,node('pre','witness-code',contextText(overlap.witness)),node('p','witness-winners',t('before') + ': ' + winnerText(overlap.originalWinner) + ' → ' + t('after') + ': ' + winnerText(overlap.chosenWinner))); return box; });
    if (matches.length > 12) elements.push(node('p','list-limit',t('fullExport'))); $('witness-list').replaceChildren(...elements);
  }
  function outcomeText(value) { return winnerText(value) + (value ? '\n' + (Object.prototype.hasOwnProperty.call(value,'args') ? 'args: ' + JSON.stringify(value.args) : t('noArgs')) : ''); }
  function renderDelta() {
    const rows = state.result.delta;
    if (!rows.length) { $('delta-list').replaceChildren(node('p','blank-message',t('noChanges'))); return; }
    const wrapper = node('div','delta-table-wrap'); const table = node('table','delta-table'); const head = node('thead'); const headings = node('tr'); ['context','before','after'].forEach((key) => { const th = node('th','',t(key)); th.scope='col'; headings.append(th); }); head.append(headings); table.append(head); const body = node('tbody');
    rows.slice(0,14).forEach((row) => { const tr = node('tr'); const first = node('td'); first.append(node('span','delta-key',row.key),node('span','delta-context',contextText(row.context))); const before = node('td','delta-command',outcomeText(row.before)); const after = node('td','delta-command delta-after',outcomeText(row.after)); tr.append(first,before,after); body.append(tr); });
    table.append(body); wrapper.append(table); $('delta-list').replaceChildren(wrapper); if (rows.length > 14) $('delta-list').append(node('p','list-limit',t('fullExport')));
  }
  function analyze() {
    const input = $('project-input').value; invalidate();
    try { const project = parseProject(input); const result = analyzeProject(project); state.project = project; state.result = result; state.priority = result.priority || {}; state.artifacts = makeArtifacts(result); state.error = false; renderResults(); setStatus('analyzed'); }
    catch (error) { setStatus('failed',String(error.message || error),true); renderResults(); }
  }
  function moveRule(id,delta,direction) {
    if (!state.result || !state.project) return;
    const group = currentGroup(); const ids = [...chosenIds(group)]; const index = ids.indexOf(id); const next = index + delta; if (index < 0 || next < 0 || next >= ids.length) return;
    [ids[index],ids[next]] = [ids[next],ids[index]];
    try { const priority = {...state.priority,[group.key]:ids}; const result = analyzeProject(state.project,priority); const artifacts = makeArtifacts(result); closeReport(); state.priority = result.priority || priority; state.result = result; state.artifacts = artifacts; state.selectedRule = id; state.error = false; renderResults(); setStatus('reordered');
      const card = $('priority-list').querySelector(`[data-rule-id="${id}"]`); const requested = card?.querySelector(`[data-direction="${direction}"]`); (requested && !requested.disabled ? requested : card?.querySelector('.move-button:not(:disabled)') || card?.querySelector('.rule-select'))?.focus({preventScroll:true});
    } catch (error) { invalidate(); setStatus('failed',String(error.message || error),true); renderResults(); }
  }
  function resetExample() { invalidate('initialStatus'); $('project-input').value = JSON.stringify(SAMPLE_PROJECT,null,2); $('snippet-input').value = ''; $('source-name').value = 'my-keybindings.json'; $('project-file').value = ''; setPill('notAnalyzed'); }
  $('project-input').addEventListener('input',() => invalidate());
  ['snippet-input','source-name'].forEach((id) => $(id).addEventListener('input',() => invalidate('snippetDraft')));
  $('example').addEventListener('click',resetExample); $('analyze').addEventListener('click',analyze);
  $('group-select').addEventListener('change',() => { state.selectedKey = $('group-select').value; state.selectedRule = null; renderPriority(); renderWitnesses(); });
  $('append').addEventListener('click',() => { invalidate(); try { const project = parseProject($('project-input').value); const source = $('source-name').value.trim(); if (!source) throw new Error(t('missingName')); const rules = parseSnippet($('snippet-input').value); const updated = {...project,sources:[...project.sources,{name:source,rules}]}; parseProject(JSON.stringify(updated)); $('project-input').value = JSON.stringify(updated,null,2); $('snippet-input').value = ''; setStatus('appended'); } catch (error) { setStatus('failed',String(error.message || error),true); renderResults(); } });
  $('project-file').addEventListener('change',async () => { const file = $('project-file').files[0]; $('project-file').value = ''; if (!file) return; const revision = invalidate('loading'); try { if (file.size > 1024 * 1024) throw new Error(t('fileTooLarge')); const content = await file.text(); if (revision !== state.revision) return; parseProject(content); $('project-input').value = content; setStatus('loaded'); } catch (error) { if (revision !== state.revision) return; setStatus('failed',String(error.message || error),true); renderResults(); } });
  $('language').addEventListener('click',() => { state.language = state.language === 'ja' ? 'en' : 'ja'; try { localStorage.setItem('whenfold-language',state.language); } catch (_) { /* Optional persistence. */ } updateLanguage(); });
  $('export-format').addEventListener('change',() => renderResults());
  $('download').addEventListener('click',() => { if (!state.result || !state.artifacts) return; try { const format = $('export-format').value; const isZip = format === 'zip'; const payload = isZip ? createZip(state.artifacts) : state.artifacts[format]; if (payload === undefined) throw new Error('Unknown export format'); const filename = isZip ? 'whenfold-review.zip' : format; const mime = isZip ? 'application/zip' : format.endsWith('.json') ? 'application/json;charset=utf-8' : format.endsWith('.csv') ? 'text/csv;charset=utf-8' : 'text/html;charset=utf-8'; const url = URL.createObjectURL(new Blob([payload],{type:mime})); const link = node('a'); link.href = url; link.download = filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url),30000); setStatus('exported'); } catch (error) { setStatus('downloadError',String(error.message || error),true); } });
  $('report').addEventListener('click',() => { if (!state.result || !state.artifacts) return; closeReport(); state.reportURL = URL.createObjectURL(new Blob([state.artifacts['report.html']],{type:'text/html;charset=utf-8'})); $('report-frame').src = state.reportURL; $('report-dialog').showModal(); $('close-report').focus(); });
  $('close-report').addEventListener('click',closeReport); $('report-dialog').addEventListener('cancel',closeReport); $('report-dialog').addEventListener('close',() => { if (state.reportURL) { URL.revokeObjectURL(state.reportURL); state.reportURL = null; $('report-frame').removeAttribute('src'); } });
  $('project-input').value = JSON.stringify(SAMPLE_PROJECT,null,2); updateLanguage();
})();
