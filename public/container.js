if (document.getElementById('team-submit-button')) {
  document.getElementById("team-submit-button").onclick = () => {
    let teamName = document.getElementById('team-name-input').value;

    window.location.href = '/team-submit?teamName=' + teamName;
  };
}


if (document.getElementById('team-save')) {
  document.getElementById('team-save').onclick = () => {
    let teamName = document.getElementById('team-name-input').value;

    window.location.href = '/team-edit?teamName=' + teamName;
  };
}