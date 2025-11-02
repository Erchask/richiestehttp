const API_URL = "https://69073b46b1879c890ed92c89.mockapi.io/studenti";

const tableBody = document.querySelector("#student-list tbody");
const form = document.getElementById("student-form");

let editId = null; // id dello studente in modifica

// CARICA STUDENTI
async function loadStudents() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    tableBody.innerHTML = "";

    data.forEach(student => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${student.nome}</td>
        <td>${student.cognome}</td>
        <td>${student.voto}</td>
        <td>
          <button class="action-btn edit-btn" onclick="editStudent(${student.id}, '${student.nome}', '${student.cognome}', ${student.voto})">Modifica</button>
          <button class="action-btn delete-btn" onclick="deleteStudent(${student.id})">Elimina</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  } catch (error) {
    console.error("Errore nel caricamento studenti:", error);
  }
}

// AGGIUNGI O MODIFICA STUDENTE
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nome = document.getElementById("name").value.trim();
  const cognome = document.getElementById("surname").value.trim();
  const voto = Number(document.getElementById("grade").value);

  if (!nome || !cognome || Number.isNaN(voto)) {
    alert("Compila tutti i campi correttamente.");
    return;
  }

  if (editId) {
    // MODIFICA
    await fetch(`${API_URL}/${editId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cognome, voto })
    });
    editId = null;
  } else {
    // AGGIUNGI
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, cognome, voto })
    });
  }

  form.reset();
  loadStudents();
});

// FUNZIONE MODIFICA
function editStudent(id, nome, cognome, voto) {
  editId = id;
  document.getElementById("name").value = nome;
  document.getElementById("surname").value = cognome;
  document.getElementById("grade").value = voto;
}

// FUNZIONE ELIMINA
async function deleteStudent(id) {
  if (!confirm("Vuoi eliminare questo studente?")) return;

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadStudents();
  } catch (error) {
    console.error("Errore nell’eliminare studente:", error);
  }
}

// CARICA STUDENTI ALL’AVVIO
loadStudents();
