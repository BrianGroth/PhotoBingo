document.addEventListener('DOMContentLoaded', () => {
  const subtitleInput = document.getElementById('subtitle-input');
  const wordsTextarea = document.getElementById('words-textarea');
  const saveButton = document.getElementById('save-button');

  // First, try loading existing data from localStorage
  let data = JSON.parse(localStorage.getItem('wordsData'));

  if (!data) {
    // If no data in localStorage, load from words.json
    fetch('words.json')
      .then(res => res.json())
      .then(jsonData => {
        data = jsonData;
        populateFields(data);
      })
      .catch(err => {
        console.error('Error loading words.json:', err);
        alert('Could not load words.json');
      });
  } else {
    populateFields(data);
  }

  function populateFields(data) {
    subtitleInput.value = data.subtitle || '';
    wordsTextarea.value = (data.words || []).join('\n');
  }

  saveButton.addEventListener('click', () => {
    const subtitle = subtitleInput.value.trim();
    const words = wordsTextarea.value.split('\n').map(w => w.trim()).filter(w => w.length > 0);

    if (words.length < 16) {
      alert('You must provide at least 16 words.');
      return;
    }

    const newData = {
      subtitle: subtitle,
      words: words
    };

    localStorage.setItem('wordsData', JSON.stringify(newData));
    alert('Subtitle and words saved to localStorage! Players will see these changes if they load from this same domain. For universal changes, update words.json in the repository.');
  });
});