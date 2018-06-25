

if (document.getElementById('team-submit-button')) {
  document.getElementById('team-submit-button').onclick = () => {
    let teamName = document.getElementById('team-name-input').value.trim();

    window.location.href = '/teamSubmit?teamName=' + teamName;
  };
}

if (document.getElementById('room-save')) {
  document.getElementById('room-save').onclick = () => {
    let name = document.getElementById('edit-room-name').value.trim();
    let time = document.getElementById('edit-room-time').value.trim();
    let teamName = document.getElementById('edit-room-team').value.trim();
    let id = document.getElementById('room-id').innerHTML.trim();

    window.location.href = '/roomEditAction?id=' + id + '&name=' + name + '&time=' + time + '&teamName=' + teamName;
  };
}


if (document.getElementById('login-button')) {
  document.getElementById('login-button').onclick = () => {
    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;

    window.location.href = `/verify?username=${username}&password=${password}`;
  };
}


