const API_URL = "https://69073b46b1879c890ed92c89.mockapi.io/studenti";
const tableBody = document.querySelector("#student-list");
const form = document.getElementById("student-form");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-edit");
let editId = null;

// Carica gli studenti
async function loadStudents() {
  try {
    tableBody.innerHTML = "<tr><td colspan='4'>Caricamento...</td></tr>";
    const res = await fetch(API_URL);
    const data = await res.json();
    tableBody.innerHTML = "";

    data.forEach(student => {
      const tr = document.createElement("tr");
      tr.dataset.id = student.id;
      tr.innerHTML = `
        <td data-label="Nome">${escapeHtml(student.nome)}</td>
        <td data-label="Cognome">${escapeHtml(student.cognome)}</td>
        <td data-label="Voto">${escapeHtml(String(student.voto))}</td>
        <td data-label="Azioni" class="actions">
          <button class="btn edit" data-id="${student.id}">Modifica</button>
          <button class="btn delete" data-id="${student.id}">Elimina</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    // Aggiungi listener ai pulsanti
    document.querySelectorAll('.btn.edit').forEach(b => b.addEventListener('click', () => {
      const id = b.dataset.id;
      const row = document.querySelector(`#student-list tr[data-id="${id}"]`);
      const nome = row.children[0].textContent;
      const cognome = row.children[1].textContent;
      const voto = row.children[2].textContent;
      editStudent(id, nome, cognome, Number(voto));
    }));

    document.querySelectorAll('.btn.delete').forEach(b => b.addEventListener('click', () => {
      deleteStudent(b.dataset.id);
    }));
  } catch (err) {
    console.error("Errore nel caricamento studenti:", err);
    tableBody.innerHTML = "<tr><td colspan='4'>Errore nel caricamento.</td></tr>";
  }
}

// Gestione del form
form.addEventListener("submit", async e => {
  e.preventDefault();

  const nome = document.getElementById("name").value.trim();
  const cognome = document.getElementById("surname").value.trim();
  const voto = Number(document.getElementById("grade").value);

  const studentData = { nome, cognome, voto };

  if (!nome || !cognome || Number.isNaN(voto) || voto < 0 || voto > 10) {
    alert("Compila tutti i campi correttamente (voto 0–10).");
    return;
  }

  const method = editId ? "PUT" : "POST";
  const url = editId ? `${API_URL}/${editId}` : API_URL;

  try {
    submitBtn.disabled = true;
    submitBtn.textContent = editId ? "Salvo modifiche..." : "Aggiungo...";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(studentData)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Errore server: ${res.status} — ${errText}`);
    }

    editId = null;
    form.reset();
    cancelBtn.style.display = "none";
    submitBtn.textContent = "Aggiungi Studente";
    await loadStudents();
  } catch (err) {
    console.error("Errore nel salvataggio:", err);
    alert("Impossibile salvare lo studente. Controlla la connessione o riprova.");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Aggiungi Studente";
  }
});

function editStudent(id, nome, cognome, voto) {
  editId = id;
  document.getElementById("name").value = nome;
  document.getElementById("surname").value = cognome;
  document.getElementById("grade").value = voto;
  submitBtn.textContent = "Salva Modifiche";
  cancelBtn.style.display = "inline-block";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

cancelBtn.addEventListener("click", () => {
  editId = null;
  form.reset();
  submitBtn.textContent = "Aggiungi Studente";
  cancelBtn.style.display = "none";
});

async function deleteStudent(id) {
  if (!confirm("Vuoi eliminare questo studente?")) return;
  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    await loadStudents();
  } catch (err) {
    console.error("Errore nell'eliminare studente:", err);
    alert("Errore durante l'eliminazione.");
  }
}

// Protezione da HTML injection
function escapeHtml(unsafe) {
  if (!unsafe) return "";
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

loadStudents();
