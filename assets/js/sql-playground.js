/**
 * Interactive In-Browser SQL Database Engine
 * Executes SQL queries on in-memory relational tables and renders styled results
 */

(function () {
  'use strict';

  // In-Memory Relational Database
  const Database = {
    developer_profile: [
      {
        id: 1,
        name: 'Khushi',
        role: 'Full Stack Developer & Software Engineer',
        location: 'India',
        primary_database: 'MySQL 8.4 & PostgreSQL',
        availability: 'Open to Opportunities',
        core_focus: 'Web Platforms & Distributed Systems'
      }
    ],

    technical_skills: [
      { id: 1, skill_name: 'SQL (MySQL / Postgres)', category: 'Databases', proficiency: '92%', level: 'Advanced' },
      { id: 2, skill_name: 'Python', category: 'Languages', proficiency: '90%', level: 'Advanced' },
      { id: 3, skill_name: 'JavaScript / ES6+', category: 'Languages', proficiency: '88%', level: 'Advanced' },
      { id: 4, skill_name: 'React.js', category: 'Frontend', proficiency: '85%', level: 'Intermediate+' },
      { id: 5, skill_name: 'Node.js & Express', category: 'Backend', proficiency: '84%', level: 'Intermediate+' },
      { id: 6, skill_name: 'Three.js & WebGL', category: '3D Graphics', proficiency: '80%', level: 'Intermediate' },
      { id: 7, skill_name: 'Git & GitHub Workflow', category: 'DevOps', proficiency: '89%', level: 'Advanced' },
      { id: 8, skill_name: 'Vercel Deployment', category: 'Cloud', proficiency: '88%', level: 'Advanced' }
    ],

    portfolio_projects: [
      {
        id: 101,
        title: 'CloudSphere SQL Analytics',
        category: 'Database & Analytics',
        tech_stack: 'MySQL, Node.js, Express, Chart.js',
        status: 'COMPLETED',
        impact: 'Real-time telemetry and query profiling'
      },
      {
        id: 102,
        title: 'DevConnect Collaboration Hub',
        category: 'Full Stack Platform',
        tech_stack: 'Python, FastAPI, PostgreSQL, WebSockets',
        status: 'COMPLETED',
        impact: 'Instant multi-user code synchronization'
      },
      {
        id: 103,
        title: 'PulseAI Workflow Engine',
        category: 'AI & Data Science',
        tech_stack: 'Next.js, Python, SQLite, OpenAI API',
        status: 'COMPLETED',
        impact: 'Automated data inference pipelines'
      }
    ],

    hire_khushi: [
      {
        role: 'Full Stack Engineer',
        candidate_name: 'Khushi',
        github: 'khushi2008hc-lab',
        vercel: 'khushi',
        contact_email: 'khushi2008.hc@gmail.com',
        offer_status: 'AVAILABLE_IMMEDIATELY',
        recommendation: 'STRONG_HIRE 🚀'
      }
    ]
  };

  const sqlInput = document.getElementById('sql-input');
  const runBtn = document.getElementById('run-sql-btn');
  const resultsContainer = document.getElementById('sql-results-container');
  const statusText = document.getElementById('query-status-text');
  const execTimeText = document.getElementById('query-exec-time');

  if (!sqlInput || !runBtn || !resultsContainer) return;

  // Run initial query on page load
  executeSQL(sqlInput.value);

  // Run button click
  runBtn.addEventListener('click', () => {
    executeSQL(sqlInput.value);
    if (window.playUiSound) window.playUiSound('success');
  });

  // Shortcut: Ctrl+Enter / Cmd+Enter
  sqlInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeSQL(sqlInput.value);
      if (window.playUiSound) window.playUiSound('success');
    }
  });

  // Sample Query Buttons
  document.querySelectorAll('.sample-query-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const query = btn.getAttribute('data-query');
      sqlInput.value = query;
      executeSQL(query);
      if (window.playUiSound) window.playUiSound('click');
    });
  });

  // Table items click in sidebar
  document.querySelectorAll('.table-item').forEach((item) => {
    item.addEventListener('click', () => {
      const tableName = item.getAttribute('data-table');
      const query = `SELECT * FROM ${tableName};`;
      sqlInput.value = query;
      executeSQL(query);
      if (window.playUiSound) window.playUiSound('click');
    });
  });

  /**
   * Lightweight SQL Parser & Query Evaluator
   */
  function executeSQL(rawQuery) {
    const startTime = performance.now();
    const query = (rawQuery || '').trim().replace(/;+$/, '');

    try {
      const match = query.match(/^SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i);

      if (!match) {
        throw new Error("Syntax Error: Supported format: SELECT [cols|*] FROM [table] [WHERE condition] [ORDER BY col [ASC|DESC]] [LIMIT n];");
      }

      const [, rawCols, tableName, rawWhere, rawOrder, rawLimit] = match;
      const targetTable = Database[tableName.toLowerCase()];

      if (!targetTable) {
        throw new Error(`Table '${tableName}' does not exist in khushi_db. Available tables: ${Object.keys(Database).join(', ')}`);
      }

      let data = JSON.parse(JSON.stringify(targetTable));

      // Filter WHERE
      if (rawWhere) {
        const whereCondition = rawWhere.trim();
        const eqMatch = whereCondition.match(/^([a-zA-Z0-9_]+)\s*=\s*['"]?([^'"]+)['"]?$/i);
        if (eqMatch) {
          const [, key, val] = eqMatch;
          data = data.filter(row => String(row[key]).toLowerCase() === val.toLowerCase());
        }
      }

      // ORDER BY
      if (rawOrder) {
        const [orderCol, direction] = rawOrder.trim().split(/\s+/);
        const isDesc = direction && direction.toUpperCase() === 'DESC';
        data.sort((a, b) => {
          let valA = a[orderCol];
          let valB = b[orderCol];

          // Parse percentages or numbers
          if (typeof valA === 'string' && valA.endsWith('%')) {
            valA = parseFloat(valA);
            valB = parseFloat(valB);
          }

          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
          return 0;
        });
      }

      // LIMIT
      if (rawLimit) {
        const limit = parseInt(rawLimit, 10);
        data = data.slice(0, limit);
      }

      // Column projection
      const isSelectAll = rawCols.trim() === '*';
      let projected = data;

      if (!isSelectAll) {
        const requestedCols = rawCols.split(',').map(c => c.trim());
        projected = data.map(row => {
          const projectedRow = {};
          requestedCols.forEach(col => {
            if (row[col] !== undefined) {
              projectedRow[col] = row[col];
            } else {
              projectedRow[col] = 'NULL';
            }
          });
          return projectedRow;
        });
      }

      const duration = (performance.now() - startTime).toFixed(2);
      renderTableResults(projected, duration);

    } catch (err) {
      renderError(err.message);
    }
  }

  function renderTableResults(rows, duration) {
    if (!rows || rows.length === 0) {
      resultsContainer.innerHTML = '<div style="padding: 1.5rem; color: #94a3b8; font-family: var(--font-mono); text-align: center;">Empty set (0 rows returned)</div>';
      statusText.innerHTML = '<i class="fa-solid fa-check text-accent"></i> Query completed: 0 rows';
      execTimeText.textContent = `Execution Time: ${duration} ms`;
      return;
    }

    const columns = Object.keys(rows[0]);
    let tableHtml = '<table class="sql-table"><thead><tr>';
    columns.forEach(col => {
      tableHtml += `<th>${col}</th>`;
    });
    tableHtml += '</tr></thead><tbody>';

    rows.forEach(row => {
      tableHtml += '<tr>';
      columns.forEach(col => {
        tableHtml += `<td>${escapeHtml(String(row[col]))}</td>`;
      });
      tableHtml += '</tr>';
    });

    tableHtml += '</tbody></table>';

    resultsContainer.innerHTML = tableHtml;
    statusText.innerHTML = `<i class="fa-solid fa-check-double text-accent"></i> Query OK: ${rows.length} row(s) returned`;
    execTimeText.textContent = `Execution Time: ${duration} ms`;
  }

  function renderError(message) {
    resultsContainer.innerHTML = `<div style="padding: 1.5rem; color: #ef4444; font-family: var(--font-mono);"><i class="fa-solid fa-triangle-exclamation"></i> <strong>MySQL Error:</strong> ${escapeHtml(message)}</div>`;
    statusText.innerHTML = '<i class="fa-solid fa-xmark text-pink"></i> Query Error';
    execTimeText.textContent = 'Execution Time: --';
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
})();
