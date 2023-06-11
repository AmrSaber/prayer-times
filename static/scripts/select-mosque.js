const mosquesList = document.getElementById("mosques");

fetchMosques().then(mosques => {
  mosquesList.innerHTML = "";

  mosques.forEach(m => {
    const item = document.createElement('li');
    item.innerHTML = m.name;
    item.dataset.id = m.guidId;
    item.onclick = onMosqueItemClicked;

    mosquesList.appendChild(item);
  });
});

function onMosqueItemClicked(element) {
  const mosque = {
    id: element.target.dataset.id,
    name: element.target.innerHTML,
  };

  localStorage.setItem("mosque", JSON.stringify(mosque));
  window.location.replace("/");
}