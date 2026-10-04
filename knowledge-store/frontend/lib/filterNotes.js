// Pulled out of Dashboard.jsx on purpose: a plain function with no Firestore
// or React dependency is trivial to unit test, whereas logic trapped inside
// a component forces you to render React and mock Firebase just to test an
// if-statement.
export function filterNotes(notes, { category = '', personName = '' } = {}) {
  const name = personName.trim().toLowerCase();

  return notes.filter((note) => {
    const matchesCategory = !category || note.category === category;
    const matchesName = !name || (note.uploaderUsername || '').toLowerCase().includes(name);
    return matchesCategory && matchesName;
  });
}
