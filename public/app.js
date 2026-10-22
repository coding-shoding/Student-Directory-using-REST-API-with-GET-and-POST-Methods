const rows = document.getElementById('studentRows');
const count = document.getElementById('studentCount');
const getMessage = document.getElementById('getMessage');
const postMessage = document.getElementById('postMessage');
const form = document.getElementById('studentForm');
const submitBtn = document.getElementById('submitBtn');

function showMessage(element, type, message) {
  element.className = `notice ${type}`;
  element.textContent = message;
  element.hidden = false;
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}
async function loadStudents() {
  rows.innerHTML = '<tr><td colspan="4" class="empty">Loading student records…</td></tr>';
  getMessage.hidden = true;
  try {
    const response = await fetch('/api/students', { method: 'GET', headers: { Accept: 'application/json' } });
    const result = await response.json();
    if (response.status === 200 && result.success) {
      rows.innerHTML = result.data.length ? result.data.map(student => `
        <tr><td>#${student.id}</td><td><div class="student-name">${escapeHtml(student.name)}</div><div class="student-email">${escapeHtml(student.email)}</div></td>
        <td><span class="course-badge">${escapeHtml(student.course)}</span></td><td><span class="year-badge">${student.year}</span></td></tr>`).join('') : '<tr><td colspan="4" class="empty">No students registered yet.</td></tr>';
      count.textContent = `${result.count} student${result.count === 1 ? '' : 's'} found`;
    } else {
      rows.innerHTML = '<tr><td colspan="4" class="empty">Could not load records.</td></tr>';
      count.textContent = 'Request failed';
      showMessage(getMessage, 'error', `HTTP ${response.status}: ${result.message || 'Unable to retrieve students.'}`);
    }
  } catch (error) {
    rows.innerHTML = '<tr><td colspan="4" class="empty">API is unavailable.</td></tr>';
    count.textContent = 'Connection error';
    showMessage(getMessage, 'error', 'Network error: could not connect to the API. Check that the server is running.');
  }
}
document.getElementById('refreshBtn').addEventListener('click', loadStudents);
form.addEventListener('submit', async event => {
  event.preventDefault();
  postMessage.hidden = true;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Submitting…';
  const payload = {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    course: form.elements.course.value,
    year: Number(form.elements.year.value)
  };
  try {
    const response = await fetch('/api/students', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (response.status === 201 && result.success) {
      showMessage(postMessage, 'success', `HTTP 201 Created — ${result.message} Student ID: ${result.data.id}.`);
      form.reset();
      await loadStudents();
    } else {
      showMessage(postMessage, 'error', `HTTP ${response.status} — ${result.message || 'Registration failed.'}`);
    }
  } catch (error) {
    showMessage(postMessage, 'error', 'Network error: the registration request could not reach the API.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Register student <span>→</span>';
  }
});
loadStudents();
