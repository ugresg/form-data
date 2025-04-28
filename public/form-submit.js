document.getElementById('dataForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const res = await fetch('/submit', {
      method: 'POST',
      body: formData
    });

    const text = await res.text();
    alert(text);
    form.reset();
  } catch (err) {
    console.error(err);
    alert('Error submitting form!');
  }
});

function validateSize(input) {
  if (input.files[0].size > 500 * 1024) {
    alert('फोटो का साइज 500KB से कम होना चाहिए!');
    input.value = '';
  }
}